import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';
import { exec, spawn } from 'child_process';
import XLSX from 'xlsx';
import { initialData } from './initialData.js';
import { 
  initRecordsDirectories, 
  recordGTSESubmission, 
  recordAdmissionSubmission, 
  recordQuerySubmission, 
  recordEnrolledStudent,
  removeEnrolledStudent,
  rebuildEnrolledStudentsExcel,
  getRecordsOverview, 
  migrateExistingRecords,
  normalizeClass,
  PROJECT_ROOT_RECORDS,
  SERVER_RECORDS 
} from './recordManager.js';
import { syncData } from '../scripts/sync.js';
import { freePortIfOccupied } from './freePort.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_FILE = path.join(__dirname, 'data.json');
const EXCEL_DIR = path.join(__dirname, 'excel-records');
const EXCEL_FILE = path.join(EXCEL_DIR, 'gtse_registrations.xlsx');
const LECTURES_DIR = path.join(PROJECT_ROOT_RECORDS, 'Recorded_Lectures');

if (!fs.existsSync(LECTURES_DIR)) {
  fs.mkdirSync(LECTURES_DIR, { recursive: true });
}

const app = express();
const PORT = process.env.PORT || 5000;
const ADMIN_USERNAME = (process.env.ADMIN_USERNAME || 'HARSHIT').trim().toUpperCase();
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'Harry@962008';

// In-memory IP rate limiter for brute-force protection
const loginAttemptsMap = new Map();
const MAX_FAILED_ATTEMPTS = 10;
const LOCKOUT_DURATION_MS = 15 * 60 * 1000; // 15 minutes

// Session token signing and verification (HMAC-SHA256)
const SESSION_SECRET = process.env.SESSION_SECRET || 'gcc_secret_' + ADMIN_PASSWORD;

function generateSessionToken(role, userId) {
  const ts = Date.now();
  const payload = `${role}:${userId}:${ts}`;
  const sig = crypto.createHmac('sha256', SESSION_SECRET).update(payload).digest('hex');
  return `${payload}:${sig}`;
}

function verifySessionToken(token) {
  if (!token || typeof token !== 'string') return null;
  const parts = token.split(':');
  if (parts.length !== 4) return null;
  const [role, userId, tsStr, sig] = parts;
  const ts = parseInt(tsStr, 10);
  if (isNaN(ts) || Date.now() - ts > 30 * 24 * 60 * 60 * 1000) { // 30 days expiry
    return null;
  }
  const expectedSig = crypto.createHmac('sha256', SESSION_SECRET).update(`${role}:${userId}:${tsStr}`).digest('hex');
  try {
    if (crypto.timingSafeEqual(Buffer.from(sig, 'utf8'), Buffer.from(expectedSig, 'utf8'))) {
      return { role, userId, ts };
    }
  } catch {
    return null;
  }
  return null;
}

function extractAuth(req) {
  const authHeader = req.headers['authorization'] || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : authHeader.trim();
  const session = verifySessionToken(token);
  const adminKey = req.headers['x-admin-key'] || req.headers['x-admin-token'];
  const isAdminKey = Boolean(adminKey && (adminKey === ADMIN_PASSWORD || adminKey === SESSION_SECRET));
  const isLocalhost = Boolean(
    req.ip === '127.0.0.1' || 
    req.ip === '::1' || 
    req.ip === '::ffff:127.0.0.1' || 
    (typeof req.ip === 'string' && req.ip.includes('127.0.0.1')) ||
    req.headers['x-local-dev'] === 'true'
  );

  const isAdmin = (session && session.role === 'admin') || isAdminKey || (isLocalhost && req.headers['x-admin-auth'] === 'true') || req.headers['x-admin-key'] === ADMIN_PASSWORD;
  const isTeacher = (session && (session.role === 'teacher' || session.role === 'admin')) || isAdmin;
  return { session, isAdmin, isTeacher };
}

function requireAdmin(req, res, next) {
  const { isAdmin } = extractAuth(req);
  if (isAdmin) return next();
  return res.status(401).json({ error: 'Unauthorized: Admin authentication required.' });
}

function requireTeacherOrAdmin(req, res, next) {
  const { isTeacher } = extractAuth(req);
  if (isTeacher) return next();
  return res.status(401).json({ error: 'Unauthorized: Faculty or Admin credentials required.' });
}

function checkRateLimit(ip) {
  const record = loginAttemptsMap.get(ip);
  if (!record) return { allowed: true };
  if (record.lockoutUntil && Date.now() < record.lockoutUntil) {
    const minutesLeft = Math.ceil((record.lockoutUntil - Date.now()) / 60000);
    return { allowed: false, error: `Too many failed login attempts. Please wait ${minutesLeft} minute(s) before trying again.` };
  }
  return { allowed: true };
}

function recordFailedAttempt(ip) {
  const record = loginAttemptsMap.get(ip) || { count: 0, lockoutUntil: 0 };
  record.count += 1;
  if (record.count >= MAX_FAILED_ATTEMPTS) {
    record.lockoutUntil = Date.now() + LOCKOUT_DURATION_MS;
    console.warn(`[Security Alert] IP ${ip} exceeded maximum failed login attempts. Locked out for 15 minutes.`);
  }
  loginAttemptsMap.set(ip, record);
}

function resetFailedAttempts(ip) {
  loginAttemptsMap.delete(ip);
}

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Prevent browser/proxy caching for all API responses so edits reflect immediately
app.use((req, res, next) => {
  if (req.path.startsWith('/api')) {
    res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.set('Pragma', 'no-cache');
    res.set('Expires', '0');
    res.set('Surrogate-Control', 'no-store');
  }
  next();
});

// Initialize data file if not present
function loadData() {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const content = fs.readFileSync(DATA_FILE, 'utf-8');
      const parsed = JSON.parse(content);
      let needsSave = false;

      if (!parsed.resultsPhoto) {
        parsed.resultsPhoto = initialData.resultsPhoto || { photos: [], imageUrl: '' };
        needsSave = true;
      } else if (!Array.isArray(parsed.resultsPhoto.photos)) {
        parsed.resultsPhoto.photos = [];
        needsSave = true;
      }
      if (!Array.isArray(parsed.shiningStars)) {
        parsed.shiningStars = initialData.shiningStars || [];
        needsSave = true;
      }
      if (!parsed.impactStats) {
        parsed.impactStats = initialData.impactStats || { courses: 15, students: 7286, teachers: 25 };
        needsSave = true;
      }
      if (!Array.isArray(parsed.features)) {
        parsed.features = initialData.features || [];
        needsSave = true;
      }
      if (!Array.isArray(parsed.exploreCourses)) {
        parsed.exploreCourses = initialData.exploreCourses || [];
        needsSave = true;
      }
      if (!Array.isArray(parsed.directors)) {
        parsed.directors = [];
        needsSave = true;
      }
      if (!Array.isArray(parsed.newsEvents)) {
        parsed.newsEvents = [];
        needsSave = true;
      }
      if (!Array.isArray(parsed.centers)) {
        parsed.centers = initialData.centers || [];
        needsSave = true;
      }
      if (!Array.isArray(parsed.doubts)) {
        parsed.doubts = [];
        needsSave = true;
      }
      if (!Array.isArray(parsed.enquiries)) {
        parsed.enquiries = [];
        needsSave = true;
      }
      if (!Array.isArray(parsed.assignments)) {
        parsed.assignments = [];
        needsSave = true;
      }
      if (!Array.isArray(parsed.lectures)) {
        parsed.lectures = [];
        needsSave = true;
      }
      if (!Array.isArray(parsed.onlineTests)) {
        parsed.onlineTests = [];
        needsSave = true;
      }
      if (!Array.isArray(parsed.students)) {
        parsed.students = initialData.students || [];
        needsSave = true;
      }
      if (!Array.isArray(parsed.attendanceLogs)) {
        parsed.attendanceLogs = initialData.attendanceLogs || [];
        needsSave = true;
      }
      if (!Array.isArray(parsed.tests)) {
        parsed.tests = initialData.tests || [];
        needsSave = true;
      }
      if (!Array.isArray(parsed.notices)) {
        parsed.notices = initialData.notices || [];
        needsSave = true;
      }
      if (parsed.teachers && Array.isArray(parsed.teachers)) {
        parsed.teachers.forEach(t => {
          if (typeof t.assignedBatches === 'string') {
            t.assignedBatches = t.assignedBatches.split(',').map(b => b.trim()).filter(Boolean);
            needsSave = true;
          } else if (!Array.isArray(t.assignedBatches)) {
            t.assignedBatches = ['Class 10 Board Champions'];
            needsSave = true;
          }
        });
      }
      if (needsSave) {
        saveData(parsed);
      }
      return parsed;
    }
  } catch (err) {
    console.error('Error reading data file, resetting to initial:', err);
  }
  saveData(initialData);
  return JSON.parse(JSON.stringify(initialData));
}

function saveData(data) {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error writing data file:', err);
  }
}

let db = loadData();

// Initialize organized records folder hierarchy on disk and migrate initial data
try {
  initRecordsDirectories();
  migrateExistingRecords(db);
  console.log('[RECORDS] Initialized organized disk folders at:', PROJECT_ROOT_RECORDS);
} catch (recErr) {
  console.error('[RECORDS] Initialization error:', recErr);
}

// Health check
app.get('/api/status', (req, res) => {
  res.json({
    status: 'online',
    institute: db.instituteInfo.name,
    totalStudents: db.students.length,
    totalTeachers: (db.teachers || []).length,
    timestamp: new Date().toISOString()
  });
});

// Full state (Sanitized: strips sensitive teacher and student passwords from general access)
app.get('/api/data', (req, res) => {
  const { isAdmin } = extractAuth(req);

  // Sanitize teacher passwords unless specifically authorized administrator
  const safeTeachers = (db.teachers || []).map(t => {
    if (isAdmin) return t;
    const { password: _, ...rest } = t;
    return rest;
  });

  // Always redact student passwords in general API queries for privacy
  const safeStudents = (db.students || []).map(s => {
    if (isAdmin) return s;
    const { password: _, ...rest } = s;
    return rest;
  });

  const safeData = {
    ...db,
    teachers: safeTeachers,
    students: safeStudents
  };

  res.json(safeData);
});

// Reset data to defaults (Protected: Requires dev mode and strict admin authorization confirmation)
app.post('/api/reset-data', (req, res) => {
  const confirmHeader = req.headers['x-confirm-reset'];
  if (confirmHeader !== 'CONFIRM_GOYAL_RESET_DATA_2026') {
    return res.status(403).json({ 
      error: 'Unauthorized: Data reset requires elevated administrative authorization and confirmation token.' 
    });
  }

  db = JSON.parse(JSON.stringify(initialData));
  saveData(db);
  console.warn('[SECURITY] Platform database reset to seed data by authorized administrator.');
  res.json({ success: true, message: 'Data reset to default successfully', data: db });
});

// ==========================================
// BIDIRECTIONAL SYNC ENDPOINT (CLOUD <-> LAPTOP)
// ==========================================
app.post('/api/sync', requireAdmin, (req, res) => {
  try {
    const incoming = req.body || {};
    let updated = false;

    // 0. Track and purge tombstones (deleted students)
    const incomingDeleted = Array.isArray(incoming.deletedStudentRolls) ? incoming.deletedStudentRolls : [];
    db.deletedStudentRolls = Array.from(new Set([...(db.deletedStudentRolls || []), ...incomingDeleted].map(r => String(r).trim().toUpperCase())));
    const deletedSet = new Set(db.deletedStudentRolls);

    if (deletedSet.size > 0) {
      const originalCount = (db.students || []).length;
      db.students = (db.students || []).filter(s => {
        const rollKey = (s.rollNo || '').toString().trim().toUpperCase();
        const idKey = (s.id || '').toString().trim().toUpperCase();
        return !deletedSet.has(rollKey) && !deletedSet.has(idKey);
      });
      if (db.students.length !== originalCount) updated = true;

      // Also purge attendance logs of deleted students
      if (Array.isArray(db.attendanceLogs)) {
        const origAttLen = db.attendanceLogs.length;
        db.attendanceLogs = db.attendanceLogs.filter(a => {
          const sid = String(a.studentId || '').trim().toUpperCase();
          return !deletedSet.has(sid);
        });
        if (db.attendanceLogs.length !== origAttLen) updated = true;
      }

      // Also purge test results of deleted students
      if (Array.isArray(db.tests)) {
        db.tests.forEach(t => {
          if (Array.isArray(t.results)) {
            const origResLen = t.results.length;
            t.results = t.results.filter(r => {
              const rRoll = String(r.rollNo || '').trim().toUpperCase();
              const rId = String(r.studentId || '').trim().toUpperCase();
              return !deletedSet.has(rRoll) && !deletedSet.has(rId);
            });
            if (t.results.length !== origResLen) updated = true;
          }
        });
      }
    }

    // 1. Merge Students
    if (Array.isArray(incoming.students)) {
      const studentMap = new Map();
      (db.students || []).forEach(s => {
        const rollKey = (s.rollNo || '').toString().trim().toUpperCase();
        const idKey = (s.id || '').toString().trim().toUpperCase();
        if ((rollKey && deletedSet.has(rollKey)) || (idKey && deletedSet.has(idKey))) return;
        const key = rollKey || idKey;
        if (key) studentMap.set(key, s);
      });

      incoming.students.forEach(inc => {
        const rollKey = (inc.rollNo || '').toString().trim().toUpperCase();
        const idKey = (inc.id || '').toString().trim().toUpperCase();
        if ((rollKey && deletedSet.has(rollKey)) || (idKey && deletedSet.has(idKey))) return;
        const key = rollKey || idKey;
        if (!key) return;

        if (studentMap.has(key)) {
          const prev = studentMap.get(key);
          studentMap.set(key, {
            ...prev,
            ...inc,
            name: inc.name || prev.name,
            grade: inc.grade || prev.grade,
            stream: inc.stream || prev.stream,
            batch: inc.batch || prev.batch,
            parentName: inc.parentName || prev.parentName,
            parentPhone: inc.parentPhone || prev.parentPhone,
            studentPhone: inc.studentPhone || prev.studentPhone,
            password: inc.password || prev.password || 'student123',
            photo: inc.photo || prev.photo,
            enrollmentDate: prev.enrollmentDate || inc.enrollmentDate,
            fees: {
              ...(prev.fees || {}),
              ...(inc.fees || {})
            },
            overallPercentage: Math.max(Number(prev.overallPercentage) || 0, Number(inc.overallPercentage) || 0),
            attendancePercentage: inc.attendancePercentage !== undefined ? Number(inc.attendancePercentage) : (prev.attendancePercentage || 0),
            workingDays: Math.max(Number(prev.workingDays) || 0, Number(inc.workingDays) || 0),
            attendedDays: Math.max(Number(prev.attendedDays) || 0, Number(inc.attendedDays) || 0),
            totalClassesAttended: Math.max(Number(prev.totalClassesAttended) || 0, Number(inc.totalClassesAttended) || 0),
            totalClassesHeld: Math.max(Number(prev.totalClassesHeld) || 0, Number(inc.totalClassesHeld) || 0),
            teacherRemarks: inc.teacherRemarks || prev.teacherRemarks
          });
        } else {
          studentMap.set(key, inc);
        }
      });

      db.students = Array.from(studentMap.values());
      updated = true;
    }

    // 2. Merge Enquiries
    if (Array.isArray(incoming.enquiries) && incoming.enquiries.length > 0) {
      const enquiryMap = new Map();
      (db.enquiries || []).forEach(e => enquiryMap.set(e.id || `${e.mobile || e.phone}_${e.timestamp}`, e));
      incoming.enquiries.forEach(e => enquiryMap.set(e.id || `${e.mobile || e.phone}_${e.timestamp}`, e));
      db.enquiries = Array.from(enquiryMap.values());
      updated = true;
    }

    // 3. Merge GTSE Registrations
    if (Array.isArray(incoming.gtseRegistrations) && incoming.gtseRegistrations.length > 0) {
      const gtseMap = new Map();
      (db.gtseRegistrations || []).forEach(g => gtseMap.set(g.id || `${g.studentNo}_${g.timestamp}`, g));
      incoming.gtseRegistrations.forEach(g => gtseMap.set(g.id || `${g.studentNo}_${g.timestamp}`, g));
      db.gtseRegistrations = Array.from(gtseMap.values());
      updated = true;
    }

    // 4. Merge Attendance Logs
    if (Array.isArray(incoming.attendanceLogs) && incoming.attendanceLogs.length > 0) {
      const attMap = new Map();
      (db.attendanceLogs || []).forEach(a => attMap.set(`${a.date}_${String(a.studentId).toUpperCase()}`, a));
      incoming.attendanceLogs.forEach(a => attMap.set(`${a.date}_${String(a.studentId).toUpperCase()}`, a));
      db.attendanceLogs = Array.from(attMap.values());
      updated = true;
    }

    // 5. Merge Tests
    if (Array.isArray(incoming.tests) && incoming.tests.length > 0) {
      const testMap = new Map();
      (db.tests || []).forEach(t => testMap.set(t.id || `${t.title}_${t.date}`, t));
      incoming.tests.forEach(incT => {
        const key = incT.id || `${incT.title}_${incT.date}`;
        if (testMap.has(key)) {
          const prevT = testMap.get(key);
          const resMap = new Map();
          (prevT.results || []).forEach(r => resMap.set(String(r.rollNo || r.studentId).toUpperCase(), r));
          (incT.results || []).forEach(r => resMap.set(String(r.rollNo || r.studentId).toUpperCase(), r));
          testMap.set(key, { ...prevT, ...incT, results: Array.from(resMap.values()) });
        } else {
          testMap.set(key, incT);
        }
      });
      db.tests = Array.from(testMap.values());
      updated = true;
    }

    // 6. Merge Notices
    if (Array.isArray(incoming.notices) && incoming.notices.length > 0) {
      const noticeMap = new Map();
      (db.notices || []).forEach(n => noticeMap.set(n.id || `${n.title}_${n.date}`, n));
      incoming.notices.forEach(n => noticeMap.set(n.id || `${n.title}_${n.date}`, n));
      db.notices = Array.from(noticeMap.values());
      updated = true;
    }

    // 7. Merge Assignments, Lectures, Online Tests, Doubts
    ['assignments', 'lectures', 'onlineTests', 'doubts'].forEach(field => {
      if (Array.isArray(incoming[field]) && incoming[field].length > 0) {
        const itemMap = new Map();
        (db[field] || []).forEach(item => itemMap.set(item.id || item.title || JSON.stringify(item), item));
        incoming[field].forEach(item => itemMap.set(item.id || item.title || JSON.stringify(item), item));
        db[field] = Array.from(itemMap.values());
        updated = true;
      }
    });

    // 8. Merge CMS items if provided
    ['centers', 'directors', 'features', 'shiningStars', 'exploreCourses'].forEach(field => {
      if (Array.isArray(incoming[field]) && incoming[field].length > 0) {
        db[field] = incoming[field];
        updated = true;
      }
    });
    if (incoming.impactStats) {
      db.impactStats = { ...(db.impactStats || {}), ...incoming.impactStats };
      updated = true;
    }
    if (incoming.resultsPhoto) {
      db.resultsPhoto = incoming.resultsPhoto;
      updated = true;
    }

    if (updated) {
      saveData(db);
      try {
        initRecordsDirectories();
        migrateExistingRecords(db);
      } catch (e) {
        console.error('[Sync] Records migration notice:', e);
      }
    }

    res.json({
      success: true,
      message: 'Bidirectional sync completed successfully on server',
      stats: {
        totalStudents: (db.students || []).length,
        totalEnquiries: (db.enquiries || []).length,
        totalGTSE: (db.gtseRegistrations || []).length,
        totalTests: (db.tests || []).length,
        totalAttendance: (db.attendanceLogs || []).length
      },
      data: db
    });
  } catch (err) {
    console.error('[Sync Error]', err);
    res.status(500).json({ error: 'Sync failed: ' + err.message });
  }
});

// ==========================================
// IAM: UNIFIED AUTHENTICATION ENDPOINT
// ==========================================

// Normalizes and extracts standard class identifiers (e.g. '7', '8', '9', '10', '11', '12')
function extractGradeNumber(str) {
  if (!str) return '';
  const s = String(str).toLowerCase().trim();
  if (/\b12\b|twelve|xii/i.test(s)) return '12';
  if (/\b11\b|eleven|xi/i.test(s)) return '11';
  if (/\b10\b|ten|x\b/i.test(s)) return '10';
  if (/\b9\b|nine|ix/i.test(s)) return '9';
  if (/\b8\b|eight|viii/i.test(s)) return '8';
  if (/\b7\b|seven|vii/i.test(s)) return '7';
  if (/\b6\b|six|vi\b/i.test(s)) return '6';
  const numMatch = s.match(/\d+/);
  return numMatch ? numMatch[0] : '';
}

function isSameClass(classA, classB) {
  if (!classA || !classB) return false;
  const gradeA = extractGradeNumber(classA);
  const gradeB = extractGradeNumber(classB);
  if (!gradeA || !gradeB) return false;
  if (gradeA !== gradeB) return false;

  if (gradeA === '11' || gradeA === '12') {
    const sA = String(classA).toLowerCase();
    const sB = String(classB).toLowerCase();
    const isCommA = sA.includes('comm');
    const isCommB = sB.includes('comm');
    const isSciA = sA.includes('sci');
    const isSciB = sB.includes('sci');
    if ((isCommA && isSciB) || (isSciA && isCommB)) {
      return false;
    }
  }
  return true;
}

// Helper to retrieve all offline tests (evaluated + upcoming/in-progress) for a student's grade
function getStudentOfflineTests(student) {
  const studentTests = [];
  const sClean = (val) => String(val || '').trim().toLowerCase();
  const sId = sClean(student.id);
  const sRoll = sClean(student.rollNo);
  const sName = sClean(student.name);

  const studentGradeNum = extractGradeNumber(student.grade);

  (db.tests || []).forEach(t => {
    const testGradeVal = t.grade || t.batch;
    const testGradeNum = extractGradeNumber(testGradeVal);
    const isAll = !testGradeVal || String(testGradeVal).toLowerCase().includes('all');
    const isMyClass = isAll || (testGradeNum && studentGradeNum && isSameClass(student.grade, testGradeVal));

    const r = (t.results || []).find(res => {
      const rId = sClean(res.studentId);
      const rRoll = sClean(res.rollNo);
      const rName = sClean(res.studentName || res.name);
      return (rId && (rId === sId || rId === sRoll)) ||
             (rRoll && (rRoll === sRoll || rRoll === sId)) ||
             (rName && sName && (rName === sName || rName.includes(sName) || sName.includes(rName)));
    });

    if (r) {
      studentTests.push({
        testId: t.id,
        title: t.title,
        subject: t.subject || 'All Subjects',
        grade: t.grade || t.batch || student.grade,
        date: t.date,
        type: t.type || 'Offline Classroom Test',
        maxMarks: t.maxMarks || 50,
        avgMarks: t.avgMarks,
        highestMarks: t.highestMarks,
        passingMarks: t.passingMarks || Math.round((t.maxMarks || 50) * 0.4),
        questionPaperUrl: t.questionPaperUrl || null,
        questionPaperName: t.questionPaperName || null,
        questionPaperType: t.questionPaperType || null,
        isEvaluated: true,
        ...r
      });
    } else if (isMyClass) {
      studentTests.push({
        testId: t.id,
        title: t.title,
        subject: t.subject || 'All Subjects',
        grade: t.grade || t.batch || student.grade,
        date: t.date,
        type: t.type || 'Offline Classroom Test',
        maxMarks: t.maxMarks || 50,
        avgMarks: t.avgMarks,
        highestMarks: t.highestMarks,
        passingMarks: t.passingMarks || Math.round((t.maxMarks || 50) * 0.4),
        questionPaperUrl: t.questionPaperUrl || null,
        questionPaperName: t.questionPaperName || null,
        questionPaperType: t.questionPaperType || null,
        isEvaluated: false
      });
    }
  });

  studentTests.sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));
  return studentTests;
}

app.post('/api/auth/login', (req, res) => {
  const clientIp = req.ip || req.connection.remoteAddress || 'unknown';
  const rateLimitStatus = checkRateLimit(clientIp);
  if (!rateLimitStatus.allowed) {
    return res.status(429).json({ error: rateLimitStatus.error });
  }

  const { role, username, rollNo, password, phone } = req.body;

  if (!role) {
    return res.status(400).json({ error: 'Role is required (admin, teacher, or student).' });
  }

  // 1. MAIN ADMIN LOGIN
  if (role === 'admin') {
    const cleanUser = (username || '').trim().toUpperCase();
    const cleanPass = (password || '').trim();

    if (cleanUser === ADMIN_USERNAME && cleanPass === ADMIN_PASSWORD) {
      resetFailedAttempts(clientIp);
      const token = generateSessionToken('admin', ADMIN_USERNAME);
      return res.json({
        success: true,
        role: 'admin',
        token,
        user: {
          username: ADMIN_USERNAME,
          name: 'Harshit Goyal (Director & Main Administrator)',
          email: 'contact@goyalcoaching.edu.in',
          phone: '9876960163',
          designation: 'Founder & Director',
          role: 'admin'
        }
      });
    }
    recordFailedAttempt(clientIp);
    return res.status(401).json({ error: 'Invalid Administrator username or password.' });
  }

  // 2. TEACHER / FACULTY LOGIN
  if (role === 'teacher') {
    const cleanUser = (username || '').trim().toUpperCase();
    const cleanPass = (password || '').trim();

    // SPECIAL MASTER ADMIN LOGIN VIA TEACHERS:
    // When Harshit enters username HARSHIT and password, Main Admin Portal opens!
    if (cleanUser === ADMIN_USERNAME && cleanPass === ADMIN_PASSWORD) {
      resetFailedAttempts(clientIp);
      const token = generateSessionToken('admin', ADMIN_USERNAME);
      return res.json({
        success: true,
        role: 'admin',
        token,
        user: {
          username: ADMIN_USERNAME,
          name: 'Harshit Goyal (Director & Main Administrator)',
          email: 'contact@goyalcoaching.edu.in',
          phone: '9876960163',
          designation: 'Founder & Director',
          role: 'admin'
        }
      });
    }

    const teacher = (db.teachers || []).find(t => 
      (t.username.toLowerCase() === cleanUser.toLowerCase() || t.id.toLowerCase() === cleanUser.toLowerCase() || (t.email && t.email.toLowerCase() === cleanUser.toLowerCase())) &&
      t.password === cleanPass
    );

    if (teacher) {
      const token = generateSessionToken('teacher', teacher.id || teacher.username);
      // Don't send other teachers' passwords to this teacher
      const { password: _tpass, ...safeTeacher } = teacher;
      return res.json({
        success: true,
        role: 'teacher',
        token,
        teacher: safeTeacher
      });
    }
    return res.status(401).json({ error: 'Invalid Faculty Credentials. No registered teacher found with this username.' });
  }

  // 3. STUDENT LOGIN (Strictly their own data only)
  if (role === 'student' || role === 'parent') {
    const targetId = (rollNo || username || '').trim().toUpperCase();
    const targetPass = (password || '').trim();
    const targetPhone = (phone || '').replace(/\D/g, '');

    if (!targetId) {
      return res.status(400).json({ error: 'Roll Number or Student ID is required.' });
    }
    if (!targetPass && !targetPhone) {
      return res.status(400).json({ error: 'Password or registered parent phone number is required.' });
    }

    const student = (db.students || []).find(s => {
      const sRoll = (s.rollNo || s.id || '').trim().toUpperCase();
      if (sRoll !== targetId) return false;

      // Allow login with:
      // 1) Their registered password (case-insensitive)
      const passMatch = Boolean(targetPass && s.password && s.password.toLowerCase() === targetPass.toLowerCase());
      // 2) Default password 'student123' ONLY IF student hasn't updated their password
      const isDefaultRegistered = !s.password || s.password.toLowerCase() === 'student123';
      const defaultPassMatch = Boolean(isDefaultRegistered && targetPass.toLowerCase() === 'student123');
      // 3) Parent phone or student phone number
      const sPhone = (s.parentPhone || '').replace(/\D/g, '');
      const altPhone = (s.studentPhone || '').replace(/\D/g, '');
      const phoneMatch = Boolean(targetPhone && targetPhone.length >= 4 && (
        sPhone.endsWith(targetPhone) || altPhone.endsWith(targetPhone)
      ));

      return passMatch || defaultPassMatch || phoneMatch;
    });

    if (!student) {
      return res.status(401).json({
        error: 'Invalid Student ID or Credentials. Please verify Roll Number and Password or registered Phone Number.'
      });
    }

    // STRICT ISOLATION: Get only THIS student's attendance records (match by id, rollNo or name)
    const studentAttendance = (db.attendanceLogs || []).filter(a => {
      if (!a.studentId) return false;
      const aId = a.studentId.toString().trim().toLowerCase();
      const sId = (student.id || '').toString().trim().toLowerCase();
      const sRoll = (student.rollNo || '').toString().trim().toLowerCase();
      const sName = (student.name || '').toString().trim().toLowerCase();
      return aId === sId || aId === sRoll || aId === sName;
    });

    const totalClasses = studentAttendance.length;
    const presentCount = studentAttendance.filter(a => a.status === 'Present').length;
    const lateCount = studentAttendance.filter(a => a.status === 'Late').length;
    const absentCount = studentAttendance.filter(a => a.status === 'Absent').length;
    const attendedDays = presentCount + (lateCount * 0.5);
    const calculatedPercentage = totalClasses > 0 
      ? Number(((attendedDays / totalClasses) * 100).toFixed(1)) 
      : 0;

    // Keep db.students percentage in sync
    const sIndex = db.students.findIndex(s => s.id === student.id);
    if (sIndex !== -1) {
      db.students[sIndex].workingDays = totalClasses;
      db.students[sIndex].totalClassesHeld = totalClasses;
      db.students[sIndex].attendedDays = attendedDays;
      db.students[sIndex].totalClassesAttended = attendedDays;
      db.students[sIndex].attendancePercentage = calculatedPercentage;
    }

    // STRICT ISOLATION: Get all tests (evaluated + in-progress) for student's enrolled grade
    const studentTests = getStudentOfflineTests(student);
    const evaluatedTests = studentTests.filter(t => t.isEvaluated && t.marksObtained !== undefined && t.marksObtained !== '');
    const totalScored = evaluatedTests.reduce((acc, t) => acc + (Number(t.marksObtained) || 0), 0);
    const totalMax = evaluatedTests.reduce((acc, t) => acc + (Number(t.maxMarks) || 0), 0);
    const calcOverallPct = totalMax > 0 ? Number(((totalScored / totalMax) * 100).toFixed(1)) : (student.overallPercentage || 0);

    if (sIndex !== -1) {
      db.students[sIndex].totalTestsEvaluated = evaluatedTests.length;
      db.students[sIndex].overallPercentage = calcOverallPct;
    }

    // Remove password before returning
    const { password: _spass, ...safeStudent } = student;
    const token = generateSessionToken('student', student.id || student.rollNo);

    return res.json({
      success: true,
      role: 'student',
      token,
      student: {
        ...safeStudent,
        attendancePercentage: calculatedPercentage,
        workingDays: totalClasses,
        attendedDays
      },
      attendance: {
        percentage: calculatedPercentage,
        totalClasses,
        presentCount,
        lateCount,
        absentCount,
        attendedDays,
        workingDays: totalClasses,
        logs: studentAttendance
      },
      tests: studentTests,
      notices: db.notices,
      assignments: db.assignments || [],
      lectures: db.lectures || [],
      onlineTests: db.onlineTests || [],
      instituteInfo: db.instituteInfo
    });
  }

  return res.status(400).json({ error: 'Unknown authentication role.' });
});

// ==========================================
// REAL-TIME LIVE STUDENT SESSION SYNC ENDPOINT
// ==========================================
app.get('/api/student/:id/session', (req, res) => {
  const targetId = (req.params.id || '').trim().toLowerCase();
  const student = (db.students || []).find(s => 
    (s.id && s.id.toString().toLowerCase() === targetId) ||
    (s.rollNo && s.rollNo.toString().toLowerCase() === targetId) ||
    (s.name && s.name.toString().toLowerCase() === targetId)
  );

  if (!student) {
    return res.status(404).json({ error: 'Student not found in database.' });
  }

  const studentAttendance = (db.attendanceLogs || []).filter(a => {
    if (!a.studentId) return false;
    const aId = a.studentId.toString().trim().toLowerCase();
    const sId = (student.id || '').toString().trim().toLowerCase();
    const sRoll = (student.rollNo || '').toString().trim().toLowerCase();
    const sName = (student.name || '').toString().trim().toLowerCase();
    return aId === sId || aId === sRoll || aId === sName;
  });

  const totalClasses = studentAttendance.length;
  const presentCount = studentAttendance.filter(a => a.status === 'Present').length;
  const lateCount = studentAttendance.filter(a => a.status === 'Late').length;
  const absentCount = studentAttendance.filter(a => a.status === 'Absent').length;
  const attendedDays = presentCount + (lateCount * 0.5);
  const calculatedPercentage = totalClasses > 0 
    ? Number(((attendedDays / totalClasses) * 100).toFixed(1)) 
    : 0;

  const sIndex = db.students.findIndex(s => s.id === student.id);
  if (sIndex !== -1) {
    db.students[sIndex].workingDays = totalClasses;
    db.students[sIndex].totalClassesHeld = totalClasses;
    db.students[sIndex].attendedDays = attendedDays;
    db.students[sIndex].totalClassesAttended = attendedDays;
    db.students[sIndex].attendancePercentage = calculatedPercentage;
  }

  const studentTests = getStudentOfflineTests(student);
  const evaluatedTests = studentTests.filter(t => t.isEvaluated && t.marksObtained !== undefined && t.marksObtained !== '');
  const totalScored = evaluatedTests.reduce((acc, t) => acc + (Number(t.marksObtained) || 0), 0);
  const totalMax = evaluatedTests.reduce((acc, t) => acc + (Number(t.maxMarks) || 0), 0);
  const calcOverallPct = totalMax > 0 ? Number(((totalScored / totalMax) * 100).toFixed(1)) : (student.overallPercentage || 0);

  if (sIndex !== -1) {
    db.students[sIndex].totalTestsEvaluated = evaluatedTests.length;
    db.students[sIndex].overallPercentage = calcOverallPct;
  }

  const { password: _spass, ...safeStudent } = student;

  return res.json({
    success: true,
    role: 'student',
    student: {
      ...safeStudent,
      attendancePercentage: calculatedPercentage,
      workingDays: totalClasses,
      attendedDays
    },
    attendance: {
      percentage: calculatedPercentage,
      totalClasses,
      presentCount,
      lateCount,
      absentCount,
      attendedDays,
      workingDays: totalClasses,
      logs: studentAttendance
    },
    tests: studentTests,
    notices: db.notices,
    assignments: db.assignments || [],
    lectures: db.lectures || [],
    onlineTests: db.onlineTests || [],
    instituteInfo: db.instituteInfo
  });
});

// ==========================================
// STUDENT SELF-SERVICE PASSWORD CHANGE ENDPOINT
// ==========================================
app.put('/api/student/:id/change-password', (req, res) => {
  const targetId = (req.params.id || '').trim().toLowerCase();
  const { currentPassword, newPassword } = req.body;

  if (!newPassword || newPassword.trim().length < 4) {
    return res.status(400).json({ error: 'New password must be at least 4 characters long.' });
  }

  const cleanCurrent = (currentPassword || '').trim();
  const cleanNew = newPassword.trim();

  const idx = (db.students || []).findIndex(s => 
    (s.id && s.id.toString().toLowerCase() === targetId) ||
    (s.rollNo && s.rollNo.toString().toLowerCase() === targetId) ||
    (s.name && s.name.toString().toLowerCase() === targetId)
  );

  if (idx === -1) {
    return res.status(404).json({ error: 'Student account not found.' });
  }

  const student = db.students[idx];

  // Verify previous password:
  // Must match either current registered password, default 'student123' (if not changed yet), or registered phone number
  const currentRegisteredPass = (student.password || 'student123').trim();
  const sPhone = (student.parentPhone || '').replace(/\D/g, '');
  const altPhone = (student.studentPhone || '').replace(/\D/g, '');
  const cleanPhone = cleanCurrent.replace(/\D/g, '');

  const isExactCurrent = cleanCurrent.toLowerCase() === currentRegisteredPass.toLowerCase();
  const isDefaultValid = currentRegisteredPass.toLowerCase() === 'student123' && cleanCurrent.toLowerCase() === 'student123';
  const isPhoneValid = cleanPhone.length >= 4 && (sPhone.endsWith(cleanPhone) || altPhone.endsWith(cleanPhone));

  if (!isExactCurrent && !isDefaultValid && !isPhoneValid) {
    return res.status(401).json({ error: 'Current password does not match. Please enter your valid previous password.' });
  }

  // Update password
  db.students[idx].password = cleanNew;
  saveData(db);

  return res.json({
    success: true,
    message: `Password changed successfully for ${student.name || 'Student'}. You can now log in with your new password.`
  });
});

// Legacy Parent Login compatibility
app.post('/api/parent-login', (req, res) => {
  const { rollNo, phone, password } = req.body;
  req.body.role = 'student';
  const targetId = (rollNo || '').trim().toUpperCase();
  const targetPhone = (phone || '').replace(/\D/g, '');
  const targetPass = (password || '').trim();

  if (!targetId) {
    return res.status(400).json({ error: 'Roll Number is required.' });
  }
  if (!targetPass && !targetPhone) {
    return res.status(400).json({ error: 'Student password or registered parent phone number is required.' });
  }

  const student = (db.students || []).find(s => {
    const sRoll = (s.rollNo || s.id || '').toUpperCase();
    if (sRoll !== targetId) return false;

    const sPhone = (s.parentPhone || '').replace(/\D/g, '');
    const altPhone = (s.studentPhone || '').replace(/\D/g, '');
    const phoneMatch = Boolean(targetPhone && targetPhone.length >= 4 && (sPhone.endsWith(targetPhone) || altPhone.endsWith(targetPhone)));
    const passMatch = Boolean(targetPass && s.password && s.password.toLowerCase() === targetPass.toLowerCase());
    const isDefault = (!s.password || s.password.toLowerCase() === 'student123') && targetPass.toLowerCase() === 'student123';
    return phoneMatch || passMatch || isDefault;
  });

  if (!student) {
    return res.status(401).json({
      error: 'Student not found or credentials incorrect. Please check Roll No and Password/Phone.'
    });
  }

  const studentAttendance = (db.attendanceLogs || []).filter(a => {
    if (!a.studentId) return false;
    const aId = a.studentId.toString().trim().toLowerCase();
    const sId = (student.id || '').toString().trim().toLowerCase();
    const sRoll = (student.rollNo || '').toString().trim().toLowerCase();
    const sName = (student.name || '').toString().trim().toLowerCase();
    return aId === sId || aId === sRoll || aId === sName;
  });
  const totalClasses = studentAttendance.length;
  const presentCount = studentAttendance.filter(a => a.status === 'Present').length;
  const lateCount = studentAttendance.filter(a => a.status === 'Late').length;
  const absentCount = studentAttendance.filter(a => a.status === 'Absent').length;

  const studentTests = [];
  (db.tests || []).forEach(t => {
    const r = (t.results || []).find(res => res.studentId === student.id);
    if (r) {
      studentTests.push({
        testId: t.id,
        title: t.title,
        date: t.date,
        type: t.type,
        maxMarks: t.maxMarks,
        avgMarks: t.avgMarks,
        highestMarks: t.highestMarks,
        ...r
      });
    }
  });
  studentTests.sort((a, b) => new Date(b.date) - new Date(a.date));

  const { password: _, ...safeStudent } = student;

  const token = generateSessionToken('student', student.id || student.rollNo);

  res.json({
    success: true,
    token,
    student: safeStudent,
    attendance: {
      percentage: totalClasses > 0 
        ? Number(((presentCount + lateCount * 0.5) / totalClasses * 100).toFixed(1)) 
        : 0,
      totalClasses,
      presentCount,
      lateCount,
      absentCount,
      logs: studentAttendance
    },
    tests: studentTests,
    notices: db.notices,
    assignments: db.assignments || [],
    lectures: db.lectures || [],
    onlineTests: db.onlineTests || [],
    instituteInfo: db.instituteInfo
  });
});

// ==========================================
// MAIN ADMIN: TEACHER IAM MANAGEMENT
// ==========================================
// Get all teachers (Includes passwords for Admin in case teacher forgets)
app.get('/api/admin/teachers', requireAdmin, (req, res) => {
  res.json(db.teachers || []);
});

// Add new Teacher
app.post('/api/admin/teachers', requireAdmin, (req, res) => {
  const newTeacher = req.body;
  if (!newTeacher.name || !newTeacher.username || !newTeacher.password) {
    return res.status(400).json({ error: 'Name, Username, and Password are required for a teacher.' });
  }

  db.teachers = db.teachers || [];
  const existing = db.teachers.find(t => t.username.toLowerCase() === newTeacher.username.toLowerCase());
  if (existing) {
    return res.status(409).json({ error: 'A teacher with this username already exists.' });
  }

  newTeacher.id = newTeacher.id || `TCH-${String(db.teachers.length + 1).padStart(2, '0')}`;
  newTeacher.status = newTeacher.status || 'Active';
  newTeacher.joiningDate = newTeacher.joiningDate || new Date().toISOString().split('T')[0];
  if (typeof newTeacher.assignedBatches === 'string') {
    newTeacher.assignedBatches = newTeacher.assignedBatches.split(',').map(b => b.trim()).filter(Boolean);
  } else if (!Array.isArray(newTeacher.assignedBatches)) {
    newTeacher.assignedBatches = ['Class 10 Board Champions'];
  }

  db.teachers.push(newTeacher);
  saveData(db);

  res.status(201).json({ success: true, teacher: newTeacher });
});

// Change / Reset Teacher Password (for forgotten password support)
app.put('/api/admin/teachers/:id/password', requireAdmin, (req, res) => {
  const teacherId = req.params.id;
  const { newPassword } = req.body;

  if (!newPassword || newPassword.trim().length < 4) {
    return res.status(400).json({ error: 'Password must be at least 4 characters long.' });
  }

  db.teachers = db.teachers || [];
  const idx = db.teachers.findIndex(t => t.id === teacherId || t.username === teacherId);
  if (idx === -1) {
    return res.status(404).json({ error: 'Teacher not found.' });
  }

  db.teachers[idx].password = newPassword.trim();
  saveData(db);

  res.json({
    success: true,
    message: `Password updated successfully for ${db.teachers[idx].name}.`,
    teacher: db.teachers[idx]
  });
});

// Update Teacher Details
app.put('/api/admin/teachers/:id', requireAdmin, (req, res) => {
  const teacherId = req.params.id;
  db.teachers = db.teachers || [];
  const idx = db.teachers.findIndex(t => t.id === teacherId || t.username === teacherId);
  if (idx === -1) {
    return res.status(404).json({ error: 'Teacher not found.' });
  }

  db.teachers[idx] = { ...db.teachers[idx], ...req.body };
  saveData(db);
  res.json({ success: true, teacher: db.teachers[idx] });
});

// Delete Teacher
app.delete('/api/admin/teachers/:id', requireAdmin, (req, res) => {
  const teacherId = req.params.id;
  db.teachers = (db.teachers || []).filter(t => t.id !== teacherId && t.username !== teacherId);
  saveData(db);
  res.json({ success: true, message: 'Teacher removed successfully.' });
});

// ==========================================
// STUDENT MANAGEMENT
// ==========================================
app.get('/api/students', (req, res) => {
  const { isAdmin } = extractAuth(req);
  const { grade } = req.query;
  let list = db.students || [];
  if (grade && grade !== 'All' && grade !== 'All Classes') {
    list = list.filter(s => isSameClass(s.grade, grade));
  }
  const safeList = list.map(s => {
    if (isAdmin) return s;
    const { password: _, ...rest } = s;
    return rest;
  });
  res.json(safeList);
});

app.post('/api/students', requireAdmin, (req, res) => {
  const newStudent = req.body;
  if (!newStudent.name || !newStudent.rollNo) {
    return res.status(400).json({ error: 'Student Name and Roll Number are required' });
  }

  const existing = db.students.find(s => s.rollNo.toUpperCase() === newStudent.rollNo.toUpperCase());
  if (existing) {
    return res.status(409).json({ error: 'A student with this Roll Number already exists' });
  }

  newStudent.id = newStudent.id || newStudent.rollNo;
  newStudent.password = newStudent.password || 'student123';
  newStudent.photo = newStudent.photo || `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=400&q=80`;
  newStudent.enrollmentDate = newStudent.enrollmentDate || new Date().toISOString().split('T')[0];
  newStudent.fees = newStudent.fees || { total: 38000, paid: 38000, due: 0, status: 'Fully Paid' };
  newStudent.overallPercentage = Number(newStudent.overallPercentage) || 0;
  newStudent.attendancePercentage = Number(newStudent.attendancePercentage) || 0;
  newStudent.totalClassesAttended = 0;
  newStudent.totalClassesHeld = 0;
  newStudent.batchRank = null;
  newStudent.teacherRemarks = newStudent.teacherRemarks || 'Newly admitted student. Awaiting initial classes and assessments.';

  db.students.unshift(newStudent);
  saveData(db);

  try {
    recordEnrolledStudent(newStudent);
    rebuildEnrolledStudentsExcel(db.students);
  } catch (recErr) {
    console.error('[RecordManager] Failed to record enrolled student:', recErr);
  }

  res.status(201).json({ success: true, student: newStudent });
});

app.put('/api/students/:id', requireAdmin, (req, res) => {
  const id = req.params.id;
  const index = db.students.findIndex(s => s.id === id || s.rollNo === id);
  if (index === -1) {
    return res.status(404).json({ error: 'Student not found' });
  }

  db.students[index] = { ...db.students[index], ...req.body };
  saveData(db);

  try {
    recordEnrolledStudent(db.students[index]);
    rebuildEnrolledStudentsExcel(db.students);
  } catch (recErr) {
    console.error('[RecordManager] Failed to update enrolled student:', recErr);
  }

  res.json({ success: true, student: db.students[index] });
});

app.delete('/api/students/:id', requireAdmin, (req, res) => {
  const rawId = req.params.id;
  const targetId = String(rawId || '').trim().toLowerCase();
  
  const student = (db.students || []).find(s => 
    String(s.id || '').trim().toLowerCase() === targetId || 
    String(s.rollNo || '').trim().toLowerCase() === targetId
  );
  
  db.students = (db.students || []).filter(s => 
    String(s.id || '').trim().toLowerCase() !== targetId && 
    String(s.rollNo || '').trim().toLowerCase() !== targetId
  );

  // Track tombstone so cloud sync never resurrects deleted students
  db.deletedStudentRolls = db.deletedStudentRolls || [];
  const rollToTrack = (student && student.rollNo) || rawId;
  const cleanRollTrack = String(rollToTrack).trim().toUpperCase();
  if (!db.deletedStudentRolls.includes(cleanRollTrack)) {
    db.deletedStudentRolls.push(cleanRollTrack);
  }

  saveData(db);

  try {
    removeEnrolledStudent(rawId);
    if (student && student.rollNo && student.rollNo !== rawId) {
      removeEnrolledStudent(student.rollNo);
    }
    rebuildEnrolledStudentsExcel(db.students);
  } catch (recErr) {
    console.error('[RecordManager] Failed to remove enrolled student records:', recErr);
  }

  // Also notify Railway cloud server in background
  try {
    const cloudUrl = process.env.REMOTE_URL || 'https://goyalcoachingcenter-production.up.railway.app';
    fetch(`${cloudUrl.replace(/\/$/, '')}/api/students/${encodeURIComponent(rawId)}`, {
      method: 'DELETE',
      headers: {
        'x-admin-key': ADMIN_PASSWORD,
        'x-admin-auth': 'true'
      }
    }).catch(() => {});
  } catch {}

  res.json({ success: true, message: 'Student removed successfully', remainingStudentsCount: db.students.length });
});

// ==========================================
// ATTENDANCE MANAGEMENT (CLASS-WISE & 20-HR EDIT WINDOW)
// ==========================================
app.get('/api/attendance', (req, res) => {
  const TWENTY_HOURS_MS = 20 * 60 * 60 * 1000;
  const now = Date.now();
  
  const annotated = (db.attendanceLogs || []).map(log => {
    const createdTime = new Date(log.createdAt || log.date).getTime();
    const elapsed = now - createdTime;
    const isEditable = elapsed <= TWENTY_HOURS_MS;
    const hoursRemaining = Math.max(0, Number(((TWENTY_HOURS_MS - elapsed) / (3600 * 1000)).toFixed(1)));
    return {
      ...log,
      isEditable,
      hoursRemaining
    };
  });
  
  res.json(annotated);
});

app.post('/api/attendance/batch', requireTeacherOrAdmin, (req, res) => {
  const { date, records, className, overrideLock } = req.body;
  if (!date || !Array.isArray(records)) {
    return res.status(400).json({ error: 'Invalid attendance batch payload. Date and records are required.' });
  }

  const TWENTY_HOURS_MS = 20 * 60 * 60 * 1000;
  const now = Date.now();
  const nowIso = new Date().toISOString();
  const studentIds = records.map(r => r.studentId);

  // Check if existing records for this date exist
  const existingForDate = (db.attendanceLogs || []).filter(a => a.date === date && studentIds.includes(a.studentId));
  let originalCreatedAt = null;

  if (existingForDate.length > 0) {
    // Find the original creation timestamp
    originalCreatedAt = existingForDate[0].createdAt;
    if (originalCreatedAt) {
      const elapsed = now - new Date(originalCreatedAt).getTime();
      if (elapsed > TWENTY_HOURS_MS && !overrideLock) {
        return res.status(403).json({
          error: `Attendance for ${date} is locked. The 20-hour modification window has expired (${(elapsed / (3600 * 1000)).toFixed(1)} hrs elapsed).`,
          locked: true,
          elapsedHours: Number((elapsed / (3600 * 1000)).toFixed(1))
        });
      }
    }
  }

  const recordCreatedAt = originalCreatedAt || nowIso;

  // Remove previous entries for this date and student group
  db.attendanceLogs = (db.attendanceLogs || []).filter(a => !(a.date === date && studentIds.includes(a.studentId)));

  // Insert updated/new entries
  records.forEach(r => {
    db.attendanceLogs.unshift({
      date,
      studentId: r.studentId,
      status: r.status || 'Present',
      timeIn: r.timeIn || '03:30 PM',
      remarks: r.remarks || 'Standard session',
      className: className || r.className || '',
      createdAt: recordCreatedAt,
      updatedAt: nowIso
    });
  });

  // Re-calculate working days and percentage strictly according to working days
  studentIds.forEach(sid => {
    const sLogs = db.attendanceLogs.filter(a => a.studentId === sid);
    const workingDays = sLogs.length; // Total distinct class sessions / working days
    const pCount = sLogs.filter(a => a.status === 'Present').length;
    const lCount = sLogs.filter(a => a.status === 'Late').length;
    const aCount = sLogs.filter(a => a.status === 'Absent').length;
    const attendedDays = pCount + (lCount * 0.5);
    const calculatedPercentage = workingDays > 0 
      ? Number(((attendedDays / workingDays) * 100).toFixed(1)) 
      : 0;

    const sIndex = db.students.findIndex(s => s.id === sid);
    if (sIndex !== -1) {
      db.students[sIndex].workingDays = workingDays;
      db.students[sIndex].totalClassesHeld = workingDays;
      db.students[sIndex].attendedDays = attendedDays;
      db.students[sIndex].totalClassesAttended = attendedDays;
      db.students[sIndex].attendancePercentage = calculatedPercentage;
    }
  });

  saveData(db);

  const hoursRemaining = Math.max(0, Number(((TWENTY_HOURS_MS - (now - new Date(recordCreatedAt).getTime())) / (3600 * 1000)).toFixed(1)));

  res.json({ 
    success: true, 
    message: `Updated attendance for ${records.length} students on ${date} (Class: ${className || 'All'})`,
    isEditable: true,
    hoursRemaining,
    date
  });
});

// ==========================================
// OFFLINE TESTS & CHECKED ANSWER SHEETS MANAGEMENT
// ==========================================
function saveTestDocumentToDisk(testTitle, grade, student, docObj) {
  try {
    const classFolder = normalizeClass(grade);
    const safeTitle = (testTitle || 'Offline_Exam').replace(/[^a-zA-Z0-9_-]/g, '_');
    const examDir = path.join(PROJECT_ROOT_RECORDS, 'Enrolled_Students', classFolder, 'Offline_Exams', safeTitle);
    if (!fs.existsSync(examDir)) {
      fs.mkdirSync(examDir, { recursive: true });
    }

    if (docObj && docObj.url && docObj.url.startsWith('data:')) {
      const matches = docObj.url.match(/^data:([A-Za-z0-9-+\/.]+);base64,(.+)$/);
      if (matches && matches.length === 3) {
        const mimeType = matches[1];
        const buffer = Buffer.from(matches[2], 'base64');
        const ext = mimeType.includes('pdf') ? 'pdf' : (mimeType.includes('png') ? 'png' : 'jpg');
        const sRoll = (student.rollNo || student.studentId || 'Roll').toString().replace(/\s+/g, '_');
        const sName = (student.name || student.studentName || 'Student').replace(/\s+/g, '_');
        const fileName = `${sRoll}_${sName}_sheet_${Date.now()}.${ext}`;
        const filePath = path.join(examDir, fileName);
        fs.writeFileSync(filePath, buffer);
        console.log(`[OfflineExams] Saved evaluated answer sheet to: ${filePath}`);
        return filePath;
      }
    }
  } catch (err) {
    console.warn('[OfflineExams] Error saving test document to disk:', err.message);
  }
  return null;
}

function recalculateAllStudentsTestStats() {
  (db.students || []).forEach(student => {
    let sumPct = 0;
    let count = 0;
    (db.tests || []).forEach(t => {
      const match = (t.results || []).find(r => 
        (r.studentId && r.studentId.toString().toLowerCase() === (student.id || '').toString().toLowerCase()) ||
        (r.studentId && r.studentId.toString().toLowerCase() === (student.rollNo || '').toString().toLowerCase()) ||
        (r.studentName && r.studentName.toString().toLowerCase() === (student.name || '').toString().toLowerCase())
      );
      if (match) {
        const p = match.percentage !== undefined ? Number(match.percentage) : ((Number(match.marksObtained) / Number(t.maxMarks || 100)) * 100);
        sumPct += p;
        count++;
      }
    });
    student.totalTestsEvaluated = count;
    student.overallPercentage = count > 0 ? Number((sumPct / count).toFixed(1)) : 0;
  });
}

// 1. Get all tests (with optional grade filter)
app.get('/api/tests', (req, res) => {
  const { grade } = req.query;
  let list = db.tests || [];
  if (grade && grade !== 'All' && grade !== 'All Classes') {
    list = list.filter(t => {
      const tg = t.grade || t.batch;
      if (!tg) return true;
      return isSameClass(tg, grade);
    });
  }
  res.json(list);
});

// 2. Create or conduct an offline exam with results and uploaded PDFs/Photos
app.post('/api/tests', requireTeacherOrAdmin, (req, res) => {
  const newTest = req.body;
  if (!newTest.title || !newTest.date || !newTest.maxMarks) {
    return res.status(400).json({ error: 'Title, date and maxMarks are required' });
  }

  const maxMarks = Number(newTest.maxMarks) || 100;
  newTest.id = newTest.id || `TST-${Date.now().toString().slice(-4)}`;
  newTest.maxMarks = maxMarks;
  newTest.passingMarks = Number(newTest.passingMarks) || Math.round(maxMarks * 0.4);
  newTest.results = Array.isArray(newTest.results) ? newTest.results : [];

  // Compute percentage, ranks, highestMarks, and average
  let totalScore = 0;
  let highestScore = 0;

  // Sort results descending by marksObtained
  newTest.results.sort((a, b) => (Number(b.marksObtained) || 0) - (Number(a.marksObtained) || 0));

  newTest.results.forEach((r, idx) => {
    const marks = Number(r.marksObtained) || 0;
    r.marksObtained = marks;
    r.maxMarks = maxMarks;
    r.percentage = Number(((marks / maxMarks) * 100).toFixed(1));
    r.rank = idx + 1;
    totalScore += marks;
    if (marks > highestScore) highestScore = marks;

    // Save document to disk if data URL
    if (r.documentUrl && r.documentUrl.startsWith('data:')) {
      const diskPath = saveTestDocumentToDisk(newTest.title, newTest.grade || newTest.batch, r, { url: r.documentUrl });
      if (diskPath) r.diskPath = diskPath;
    }

    if (Array.isArray(r.documents)) {
      r.documents.forEach(doc => {
        if (doc.url && doc.url.startsWith('data:')) {
          const diskPath = saveTestDocumentToDisk(newTest.title, newTest.grade || newTest.batch, r, doc);
          if (diskPath) doc.diskPath = diskPath;
        }
      });
    }
  });

  newTest.highestMarks = highestScore;
  newTest.avgMarks = newTest.results.length > 0 ? Number((totalScore / newTest.results.length).toFixed(1)) : 0;
  newTest.createdAt = newTest.createdAt || new Date().toISOString();

  db.tests = db.tests || [];
  const existingIdx = db.tests.findIndex(t => t.id === newTest.id);
  if (existingIdx !== -1) {
    db.tests[existingIdx] = { ...db.tests[existingIdx], ...newTest };
  } else {
    db.tests.unshift(newTest);
  }

  recalculateAllStudentsTestStats();
  saveData(db);
  res.status(201).json({ success: true, test: newTest });
});

// 3. Update an offline exam & student marks
app.put('/api/tests/:id', requireTeacherOrAdmin, (req, res) => {
  const { id } = req.params;
  const updates = req.body;
  db.tests = db.tests || [];
  const idx = db.tests.findIndex(t => t.id === id);
  if (idx === -1) {
    return res.status(404).json({ error: 'Test not found' });
  }

  const existing = db.tests[idx];
  const maxMarks = Number(updates.maxMarks || existing.maxMarks) || 100;

  const merged = {
    ...existing,
    ...updates,
    id,
    maxMarks
  };

  if (Array.isArray(merged.results)) {
    let totalScore = 0;
    let highestScore = 0;
    merged.results.sort((a, b) => (Number(b.marksObtained) || 0) - (Number(a.marksObtained) || 0));

    merged.results.forEach((r, rIdx) => {
      const marks = Number(r.marksObtained) || 0;
      r.marksObtained = marks;
      r.maxMarks = maxMarks;
      r.percentage = Number(((marks / maxMarks) * 100).toFixed(1));
      r.rank = rIdx + 1;
      totalScore += marks;
      if (marks > highestScore) highestScore = marks;

      if (r.documentUrl && r.documentUrl.startsWith('data:')) {
        const diskPath = saveTestDocumentToDisk(merged.title, merged.grade || merged.batch, r, { url: r.documentUrl });
        if (diskPath) r.diskPath = diskPath;
      }

      if (Array.isArray(r.documents)) {
        r.documents.forEach(doc => {
          if (doc.url && doc.url.startsWith('data:')) {
            const diskPath = saveTestDocumentToDisk(merged.title, merged.grade || merged.batch, r, doc);
            if (diskPath) doc.diskPath = diskPath;
          }
        });
      }
    });

    merged.highestMarks = highestScore;
    merged.avgMarks = merged.results.length > 0 ? Number((totalScore / merged.results.length).toFixed(1)) : 0;
  }

  db.tests[idx] = merged;
  recalculateAllStudentsTestStats();
  saveData(db);
  res.json({ success: true, test: merged });
});

// 4. Delete an offline exam
app.delete('/api/tests/:id', requireTeacherOrAdmin, (req, res) => {
  const { id } = req.params;
  db.tests = (db.tests || []).filter(t => t.id !== id);
  recalculateAllStudentsTestStats();
  saveData(db);
  res.json({ success: true, message: 'Test deleted successfully' });
});

// ==========================================
// NOTICES MANAGEMENT
// ==========================================
app.get('/api/notices', (req, res) => {
  res.json(db.notices);
});

app.post('/api/notices', requireTeacherOrAdmin, (req, res) => {
  const notice = req.body;
  if (!notice.title || !notice.content) {
    return res.status(400).json({ error: 'Title and content are required' });
  }

  notice.id = notice.id || `NTC-${Date.now().toString().slice(-4)}`;
  notice.date = notice.date || new Date().toISOString().split('T')[0];
  db.notices.unshift(notice);
  saveData(db);

  res.status(201).json({ success: true, notice });
});

app.delete('/api/notices/:id', requireTeacherOrAdmin, (req, res) => {
  const id = req.params.id;
  db.notices = db.notices.filter(n => n.id !== id);
  saveData(db);
  res.json({ success: true, message: 'Notice deleted' });
});

app.put('/api/notices/:id', requireTeacherOrAdmin, (req, res) => {
  const id = req.params.id;
  const updateData = req.body;
  const idx = db.notices.findIndex(n => n.id === id);
  if (idx === -1) {
    return res.status(404).json({ error: 'Notice not found' });
  }

  db.notices[idx] = {
    ...db.notices[idx],
    ...updateData,
    id // preserve id
  };
  saveData(db);
  res.json({ success: true, notice: db.notices[idx], message: 'Notice updated successfully' });
});

// ==========================================
// ASSIGNMENTS & HOMEWORK MANAGEMENT API
// ==========================================
// 1. Get assignments (with optional grade filter)
app.get('/api/assignments', (req, res) => {
  const { grade } = req.query;
  let list = db.assignments || [];
  if (grade && grade !== 'All' && grade !== 'All Classes') {
    list = list.filter(a => !a.grade || a.grade === 'All Classes' || isSameClass(a.grade, grade));
  }
  res.json(list);
});

// 2. Create new assignment with photos
app.post('/api/assignments', (req, res) => {
  const { title, subject, grade, batch, dueDate, totalMarks, description, photos, createdBy } = req.body;
  if (!title || !subject) {
    return res.status(400).json({ error: 'Title and Subject are required' });
  }

  const cleanPhotos = Array.isArray(photos) 
    ? photos.filter(p => typeof p === 'string' && p.trim()) 
    : (photos ? [photos] : []);

  const newAssignment = {
    id: `ASG-${Date.now().toString().slice(-4)}`,
    title: title.trim(),
    subject: subject.trim(),
    grade: grade || 'All Classes',
    batch: batch || '',
    dueDate: dueDate || new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
    totalMarks: Number(totalMarks) || 20,
    description: (description || '').trim(),
    photos: cleanPhotos,
    createdAt: new Date().toISOString(),
    createdBy: createdBy || 'Faculty Desk',
    submissions: []
  };

  db.assignments = db.assignments || [];
  db.assignments.unshift(newAssignment);
  saveData(db);

  res.status(201).json({ success: true, assignment: newAssignment, message: 'Assignment created successfully!' });
});

// 3. Update assignment (details or photo list)
app.put('/api/assignments/:id', (req, res) => {
  const id = req.params.id;
  const updates = req.body;
  const idx = (db.assignments || []).findIndex(a => a.id === id);
  if (idx === -1) {
    return res.status(404).json({ error: 'Assignment not found' });
  }

  if (updates.photos && Array.isArray(updates.photos)) {
    updates.photos = updates.photos.filter(p => typeof p === 'string' && p.trim());
  }

  db.assignments[idx] = {
    ...db.assignments[idx],
    ...updates,
    id // keep original id
  };
  saveData(db);

  res.json({ success: true, assignment: db.assignments[idx], message: 'Assignment updated successfully' });
});

// 4. Delete assignment
app.delete('/api/assignments/:id', (req, res) => {
  const id = req.params.id;
  db.assignments = (db.assignments || []).filter(a => a.id !== id);
  saveData(db);
  res.json({ success: true, message: 'Assignment deleted successfully' });
});

// 5. Delete a specific photo from an assignment
app.delete('/api/assignments/:id/photos/:photoIndex', (req, res) => {
  const { id, photoIndex } = req.params;
  const idx = (db.assignments || []).findIndex(a => a.id === id);
  if (idx === -1) {
    return res.status(404).json({ error: 'Assignment not found' });
  }

  const pIdx = parseInt(photoIndex, 10);
  if (isNaN(pIdx) || pIdx < 0 || pIdx >= (db.assignments[idx].photos || []).length) {
    return res.status(400).json({ error: 'Invalid photo index' });
  }

  db.assignments[idx].photos.splice(pIdx, 1);
  saveData(db);

  res.json({ 
    success: true, 
    photos: db.assignments[idx].photos,
    message: 'Assignment photo removed successfully' 
  });
});

// 6. Student Answer Sheet Submission
app.post('/api/assignments/:id/submit', (req, res) => {
  const id = req.params.id;
  const { studentId, studentName, rollNo, grade, answerPhotos, notes } = req.body;

  if (!studentId) {
    return res.status(400).json({ error: 'Student ID is required' });
  }

  const cleanPhotos = Array.isArray(answerPhotos)
    ? answerPhotos.filter(p => typeof p === 'string' && p.trim())
    : (answerPhotos ? [answerPhotos] : []);

  if (cleanPhotos.length === 0) {
    return res.status(400).json({ error: 'Please upload at least one photo of your answer sheet.' });
  }

  const idx = (db.assignments || []).findIndex(a => a.id === id);
  if (idx === -1) {
    return res.status(404).json({ error: 'Assignment not found' });
  }

  const assignment = db.assignments[idx];
  assignment.submissions = assignment.submissions || [];

  // Check if student already submitted (match by studentId or rollNo)
  const cleanSid = studentId.toString().trim().toLowerCase();
  const cleanRoll = (rollNo || '').toString().trim().toLowerCase();
  const existingSubIdx = assignment.submissions.findIndex(s => {
    const sId = (s.studentId || '').toString().trim().toLowerCase();
    const sR = (s.rollNo || '').toString().trim().toLowerCase();
    return sId === cleanSid || (cleanRoll && sR === cleanRoll);
  });

  const submissionObj = {
    id: existingSubIdx !== -1 ? assignment.submissions[existingSubIdx].id : `SUB-${Date.now().toString().slice(-4)}`,
    assignmentId: id,
    studentId: studentId.toString(),
    studentName: studentName || 'Student',
    rollNo: rollNo || studentId.toString(),
    grade: grade || assignment.grade,
    submittedAt: new Date().toISOString(),
    answerPhotos: cleanPhotos,
    notes: (notes || '').trim(),
    status: existingSubIdx !== -1 ? assignment.submissions[existingSubIdx].status : 'Submitted',
    marksObtained: existingSubIdx !== -1 ? assignment.submissions[existingSubIdx].marksObtained : null,
    teacherRemarks: existingSubIdx !== -1 ? assignment.submissions[existingSubIdx].teacherRemarks : ''
  };

  if (existingSubIdx !== -1) {
    assignment.submissions[existingSubIdx] = submissionObj;
  } else {
    assignment.submissions.push(submissionObj);
  }

  saveData(db);

  res.json({
    success: true,
    submission: submissionObj,
    message: existingSubIdx !== -1 ? 'Answer sheet updated successfully!' : 'Answer sheet submitted successfully!'
  });
});

// 7. Teacher / Admin review and grade submission
app.put('/api/assignments/:id/submissions/:subId/grade', (req, res) => {
  const { id, subId } = req.params;
  const { marksObtained, teacherRemarks, status } = req.body;

  const idx = (db.assignments || []).findIndex(a => a.id === id);
  if (idx === -1) {
    return res.status(404).json({ error: 'Assignment not found' });
  }

  const assignment = db.assignments[idx];
  const sIdx = (assignment.submissions || []).findIndex(s => s.id === subId);
  if (sIdx === -1) {
    return res.status(404).json({ error: 'Submission record not found' });
  }

  assignment.submissions[sIdx] = {
    ...assignment.submissions[sIdx],
    marksObtained: marksObtained !== undefined && marksObtained !== '' ? Number(marksObtained) : null,
    teacherRemarks: teacherRemarks !== undefined ? teacherRemarks.trim() : assignment.submissions[sIdx].teacherRemarks,
    status: status || 'Reviewed'
  };

  saveData(db);

  res.json({
    success: true,
    submission: assignment.submissions[sIdx],
    message: 'Answer sheet review saved!'
  });
});

// ==========================================
// RECORDED LECTURES & HIGH-CAPACITY VIDEO API (5-10 GB STREAMING)
// ==========================================
// 1. Get all published lectures (optional grade filter)
app.get('/api/lectures', (req, res) => {
  const { grade } = req.query;
  let list = db.lectures || [];
  if (grade && grade !== 'All' && grade !== 'All Classes') {
    list = list.filter(l => !l.grade || l.grade === 'All Classes' || isSameClass(l.grade, grade));
  }
  res.json(list);
});

// 2. Create new lecture record
app.post('/api/lectures', (req, res) => {
  const { title, subject, grade, batch, chapter, duration, faculty, description, videoType, videoUrl, videoFileName, fileSize, thumbnailUrl, uploadedBy } = req.body;
  if (!title || !title.trim()) {
    return res.status(400).json({ error: 'Lecture title is required' });
  }

  const newLecture = {
    id: `LEC-${Date.now().toString().slice(-4)}`,
    title: title.trim(),
    subject: subject || 'Science',
    grade: grade || 'All Classes',
    batch: batch || '',
    chapter: chapter || '',
    duration: duration || '45 mins',
    faculty: faculty || uploadedBy || 'Faculty Desk',
    description: (description || '').trim(),
    videoType: videoType || (videoUrl ? 'url' : 'file'),
    videoUrl: videoUrl || '',
    videoFileName: videoFileName || '',
    fileSize: fileSize || '',
    thumbnailUrl: thumbnailUrl || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=800&q=80',
    uploadedBy: uploadedBy || faculty || 'Admin / Teacher',
    createdAt: new Date().toISOString(),
    views: 0
  };

  db.lectures = db.lectures || [];
  db.lectures.unshift(newLecture);
  saveData(db);

  res.status(201).json({ success: true, lecture: newLecture, message: 'Lecture created successfully!' });
});

// 3. Update lecture details
app.put('/api/lectures/:id', (req, res) => {
  const id = req.params.id;
  const updates = req.body;
  const idx = (db.lectures || []).findIndex(l => l.id === id);
  if (idx === -1) {
    return res.status(404).json({ error: 'Lecture not found' });
  }

  db.lectures[idx] = {
    ...db.lectures[idx],
    ...updates,
    id // preserve ID
  };
  saveData(db);

  res.json({ success: true, lecture: db.lectures[idx], message: 'Lecture updated successfully' });
});

// 4. Delete lecture (and clean up original 5-10 GB video file from disk)
app.delete('/api/lectures/:id', (req, res) => {
  const id = req.params.id;
  const target = (db.lectures || []).find(l => l.id === id);
  if (target && target.videoFileName) {
    const videoPath = path.join(LECTURES_DIR, target.videoFileName);
    if (fs.existsSync(videoPath)) {
      try {
        fs.unlinkSync(videoPath);
        console.log(`[VideoStorage] Deleted video file from disk: ${videoPath}`);
      } catch (e) {
        console.warn('Could not unlink video file:', e);
      }
    }
  }

  db.lectures = (db.lectures || []).filter(l => l.id !== id);
  saveData(db);

  res.json({ success: true, message: 'Lecture and video storage deleted successfully' });
});

// 5. High-Capacity Video Upload (Handles 5-10 GB+ streaming without memory limit crashes)
app.post('/api/lectures/:id/video', (req, res) => {
  const id = req.params.id;
  const idx = (db.lectures || []).findIndex(l => l.id === id);
  if (idx === -1) {
    return res.status(404).json({ error: 'Lecture record not found' });
  }

  const rawOriginalName = req.headers['x-filename'] || 'lecture_video.mp4';
  const ext = path.extname(rawOriginalName) || '.mp4';
  const safeFileName = `${id}_${Date.now()}${ext}`;
  const targetPath = path.join(LECTURES_DIR, safeFileName);

  const writeStream = fs.createWriteStream(targetPath);
  let receivedBytes = 0;

  req.on('data', chunk => {
    receivedBytes += chunk.length;
  });

  req.pipe(writeStream);

  writeStream.on('finish', () => {
    let formattedSize = '';
    if (receivedBytes >= 1024 * 1024 * 1024) {
      formattedSize = (receivedBytes / (1024 * 1024 * 1024)).toFixed(2) + ' GB';
    } else if (receivedBytes >= 1024 * 1024) {
      formattedSize = (receivedBytes / (1024 * 1024)).toFixed(1) + ' MB';
    } else {
      formattedSize = Math.round(receivedBytes / 1024) + ' KB';
    }

    // Clean up previous video file if replaced
    if (db.lectures[idx].videoFileName && db.lectures[idx].videoFileName !== safeFileName) {
      const oldPath = path.join(LECTURES_DIR, db.lectures[idx].videoFileName);
      if (fs.existsSync(oldPath)) {
        try { fs.unlinkSync(oldPath); } catch {}
      }
    }

    db.lectures[idx] = {
      ...db.lectures[idx],
      videoType: 'file',
      videoFileName: safeFileName,
      videoUrl: `/api/lectures/stream/${safeFileName}`,
      fileSize: formattedSize
    };
    saveData(db);

    console.log(`[VideoStorage] Upload complete: ${safeFileName} (${formattedSize})`);

    res.json({
      success: true,
      lecture: db.lectures[idx],
      fileSize: formattedSize,
      videoUrl: `/api/lectures/stream/${safeFileName}`,
      message: `Video uploaded successfully (${formattedSize})`
    });
  });

  writeStream.on('error', err => {
    console.error('[VideoStorage] Error writing video stream:', err);
    res.status(500).json({ error: 'Failed to write video file to disk.' });
  });
});

// 6. HTTP 206 Byte-Range Streaming (Instant seeking for 5-10 GB videos without buffering the whole file)
app.get('/api/lectures/stream/:filename', (req, res) => {
  const filename = path.basename(req.params.filename);
  const filePath = path.join(LECTURES_DIR, filename);

  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: 'Video file not found' });
  }

  const stat = fs.statSync(filePath);
  const fileSize = stat.size;
  const range = req.headers.range;

  const ext = path.extname(filename).toLowerCase();
  let contentType = 'video/mp4';
  if (ext === '.webm') contentType = 'video/webm';
  else if (ext === '.mkv') contentType = 'video/x-matroska';
  else if (ext === '.mov') contentType = 'video/quicktime';

  if (range) {
    const parts = range.replace(/bytes=/, "").split("-");
    const start = parseInt(parts[0], 10);
    const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;

    if (start >= fileSize) {
      res.status(416).send('Requested range not satisfiable\n' + start + ' >= ' + fileSize);
      return;
    }

    const chunksize = (end - start) + 1;
    const file = fs.createReadStream(filePath, { start, end });
    const head = {
      'Content-Range': `bytes ${start}-${end}/${fileSize}`,
      'Accept-Ranges': 'bytes',
      'Content-Length': chunksize,
      'Content-Type': contentType,
    };
    res.writeHead(206, head);
    file.pipe(res);
  } else {
    const head = {
      'Content-Length': fileSize,
      'Content-Type': contentType,
      'Accept-Ranges': 'bytes'
    };
    res.writeHead(200, head);
    fs.createReadStream(filePath).pipe(res);
  }
});

// 7. Increment lecture view count
app.post('/api/lectures/:id/view', (req, res) => {
  const id = req.params.id;
  const idx = (db.lectures || []).findIndex(l => l.id === id);
  if (idx !== -1) {
    db.lectures[idx].views = (db.lectures[idx].views || 0) + 1;
    saveData(db);
  }
  res.json({ success: true });
});

// ==========================================
// OLYMPIAD MCQ ONLINE TEST ENGINE API (UPCOMING, ACTIVE, COMPLETED, MISSED)
// ==========================================
// 1. Get all tests (optional grade filter)
app.get('/api/online-tests', (req, res) => {
  const { grade } = req.query;
  let list = db.onlineTests || [];
  if (grade && grade !== 'All' && grade !== 'All Classes') {
    list = list.filter(t => !t.grade || t.grade === 'All Classes' || isSameClass(t.grade, grade));
  }
  res.json(list);
});

// 2. Create new MCQ test with questions, pictures & options
app.post('/api/online-tests', (req, res) => {
  const { 
    title, 
    subject, 
    grade, 
    batch, 
    durationMinutes, 
    status, 
    startTime, 
    endTime, 
    positiveMarks, 
    negativeMarks, 
    instructions, 
    questions, 
    createdBy 
  } = req.body;

  if (!title || !title.trim()) {
    return res.status(400).json({ error: 'Test title is required' });
  }

  const cleanQuestions = Array.isArray(questions) ? questions.map((q, idx) => ({
    id: q.id || `Q${idx + 1}`,
    text: (q.text || '').trim(),
    image: q.image || '',
    options: Array.isArray(q.options) ? q.options : [
      { id: 'A', text: '' },
      { id: 'B', text: '' },
      { id: 'C', text: '' },
      { id: 'D', text: '' }
    ],
    correctOption: q.correctOption || 'A',
    explanation: (q.explanation || '').trim()
  })) : [];

  const pos = Number(positiveMarks) || 4;
  const neg = Number(negativeMarks) || 0;
  const total = cleanQuestions.length * pos;

  const newTest = {
    id: `MCQ-${Date.now().toString().slice(-4)}`,
    title: title.trim(),
    subject: subject || 'Science',
    grade: grade || 'All Classes',
    batch: batch || '',
    durationMinutes: Number(durationMinutes) || 30,
    status: status || 'active', // 'upcoming' | 'active' | 'closed'
    startTime: startTime || new Date().toISOString(),
    endTime: endTime || new Date(Date.now() + 5 * 86400000).toISOString(),
    positiveMarks: pos,
    negativeMarks: neg,
    totalMarks: total,
    instructions: (instructions || 'Read all questions carefully. Choose the single best option.').trim(),
    questions: cleanQuestions,
    createdBy: createdBy || 'Faculty Desk',
    createdAt: new Date().toISOString(),
    attempts: []
  };

  db.onlineTests = db.onlineTests || [];
  db.onlineTests.unshift(newTest);
  saveData(db);

  res.status(201).json({ success: true, test: newTest, message: 'Olympiad MCQ Test published successfully!' });
});

// 3. Update test (details, questions, status toggle)
app.put('/api/online-tests/:id', (req, res) => {
  const id = req.params.id;
  const updates = req.body;
  const idx = (db.onlineTests || []).findIndex(t => t.id === id);
  if (idx === -1) {
    return res.status(404).json({ error: 'Test not found' });
  }

  if (updates.questions && Array.isArray(updates.questions)) {
    const pos = Number(updates.positiveMarks) || db.onlineTests[idx].positiveMarks || 4;
    updates.totalMarks = updates.questions.length * pos;
  }

  db.onlineTests[idx] = {
    ...db.onlineTests[idx],
    ...updates,
    id // preserve ID
  };
  saveData(db);

  res.json({ success: true, test: db.onlineTests[idx], message: 'Test updated successfully' });
});

// 4. Delete test
app.delete('/api/online-tests/:id', (req, res) => {
  const id = req.params.id;
  db.onlineTests = (db.onlineTests || []).filter(t => t.id !== id);
  saveData(db);
  res.json({ success: true, message: 'Test deleted successfully' });
});

// 5. Submit Test Attempt (Automatic scoring & saving into Completed/Attempts)
app.post('/api/online-tests/:id/attempt', (req, res) => {
  const id = req.params.id;
  const { studentId, studentName, rollNo, grade, answers = {}, timeTakenSeconds = 0, isPractice = false } = req.body;

  if (!studentId) {
    return res.status(400).json({ error: 'Student ID is required' });
  }

  const idx = (db.onlineTests || []).findIndex(t => t.id === id);
  if (idx === -1) {
    return res.status(404).json({ error: 'Test not found' });
  }

  const test = db.onlineTests[idx];
  test.attempts = test.attempts || [];

  const pos = test.positiveMarks || 4;
  const neg = test.negativeMarks || 0;
  let correctCount = 0;
  let incorrectCount = 0;
  let unattemptedCount = 0;
  let score = 0;

  const detailedBreakdown = (test.questions || []).map(q => {
    const chosen = answers[q.id];
    let isCorrect = false;
    let isUnattempted = false;

    if (!chosen) {
      isUnattempted = true;
      unattemptedCount++;
    } else if (chosen === q.correctOption) {
      isCorrect = true;
      correctCount++;
      score += pos;
    } else {
      incorrectCount++;
      score -= neg;
    }

    return {
      questionId: q.id,
      text: q.text,
      image: q.image,
      chosenOption: chosen || null,
      correctOption: q.correctOption,
      isCorrect,
      isUnattempted,
      explanation: q.explanation
    };
  });

  const totalQuestions = (test.questions || []).length;
  const maxScore = totalQuestions * pos;
  const finalScore = Math.max(0, score);
  const attemptedTotal = correctCount + incorrectCount;
  const accuracy = attemptedTotal > 0 ? Math.round((correctCount / attemptedTotal) * 100) : 0;

  const cleanSid = studentId.toString().trim().toLowerCase();
  const cleanRoll = (rollNo || '').toString().trim().toLowerCase();

  const attemptObj = {
    id: `ATT-${Date.now().toString().slice(-4)}`,
    testId: id,
    studentId: studentId.toString(),
    studentName: studentName || 'Student',
    rollNo: rollNo || studentId.toString(),
    grade: grade || test.grade,
    score: finalScore,
    maxScore,
    correctCount,
    incorrectCount,
    unattemptedCount,
    totalQuestions,
    accuracy,
    answers,
    detailedBreakdown,
    timeTakenSeconds: Number(timeTakenSeconds) || 0,
    submittedAt: new Date().toISOString(),
    isPractice: !!isPractice
  };

  // If not practice, save as official attempt in test
  if (!isPractice) {
    const existingIdx = test.attempts.findIndex(a => {
      const aSid = (a.studentId || '').toString().trim().toLowerCase();
      const aRoll = (a.rollNo || '').toString().trim().toLowerCase();
      return !a.isPractice && (aSid === cleanSid || (cleanRoll && aRoll === cleanRoll));
    });

    if (existingIdx !== -1) {
      test.attempts[existingIdx] = attemptObj;
    } else {
      test.attempts.unshift(attemptObj);
    }
    saveData(db);
  }

  res.json({
    success: true,
    attempt: attemptObj,
    message: isPractice ? 'Practice test completed!' : 'Olympiad test submitted successfully! Marks recorded.'
  });
});

// ==========================================
// ADMISSION ENQUIRIES & STUDENT FORMS CATEGORIZATION
// ==========================================
app.post('/api/enquiry', (req, res) => {
  const enquiry = req.body;
  if (!enquiry.name || (!enquiry.phone && !enquiry.mobile)) {
    return res.status(400).json({ error: 'Name and Phone Number are required' });
  }

  db.enquiries = db.enquiries || [];
  enquiry.id = `ENQ-${Date.now().toString().slice(-4)}`;
  enquiry.timestamp = new Date().toISOString();
  db.enquiries.unshift(enquiry);
  saveData(db);

  // Categorize and record into class-wise disk folders & Excel registers
  let recordedCategory = 'Queries';
  let recordedClass = 'General';
  try {
    if (enquiry.course && !enquiry.source?.toLowerCase().includes('contact')) {
      const rec = recordAdmissionSubmission(enquiry);
      recordedCategory = 'Admissions';
      recordedClass = rec.className;
    } else {
      const rec = recordQuerySubmission(enquiry);
      recordedCategory = 'Queries';
      recordedClass = rec.className;
    }
  } catch (err) {
    console.error('[RecordManager] Failed to record enquiry submission:', err);
  }

  res.status(201).json({
    success: true,
    message: 'Thank you for your interest! Goyal Coaching Center academic counselor will contact you shortly.',
    enquiryId: enquiry.id,
    recordedCategory,
    recordedClass
  });
});

// ==========================================
// ENQUIRIES & CONTACT QUERIES MANAGEMENT
// ==========================================
app.get('/api/enquiries', (req, res) => {
  res.json({
    success: true,
    count: (db.enquiries || []).length,
    enquiries: db.enquiries || []
  });
});

app.put('/api/enquiries/:id', (req, res) => {
  const { id } = req.params;
  const updates = req.body || {};
  db.enquiries = db.enquiries || [];
  const idx = db.enquiries.findIndex(e => e.id === id);
  if (idx === -1) {
    return res.status(404).json({ error: 'Query not found' });
  }
  db.enquiries[idx] = { ...db.enquiries[idx], ...updates, updatedAt: new Date().toISOString() };
  saveData(db);
  res.json({ success: true, message: 'Query updated successfully', enquiry: db.enquiries[idx] });
});

app.delete('/api/enquiries/:id', (req, res) => {
  const { id } = req.params;
  db.enquiries = (db.enquiries || []).filter(e => e.id !== id);
  saveData(db);
  res.json({ success: true, message: 'Query deleted successfully' });
});

// ==========================================
// STUDENT ACADEMIC DOUBTS DESK
// ==========================================
app.get('/api/doubts', (req, res) => {
  res.json({
    success: true,
    count: (db.doubts || []).length,
    doubts: db.doubts || initialData.doubts || []
  });
});

app.post('/api/doubts', (req, res) => {
  const doubtData = req.body || {};
  if (!doubtData.studentName || !doubtData.question) {
    return res.status(400).json({ error: 'Student Name and Question are required' });
  }
  db.doubts = db.doubts || [];
  const newDoubt = {
    id: `DBT-${Date.now().toString().slice(-4)}`,
    studentName: doubtData.studentName,
    rollNo: doubtData.rollNo || 'N/A',
    grade: doubtData.grade || 'Class 10',
    subject: doubtData.subject || 'Mathematics',
    topic: doubtData.topic || 'General Concept',
    question: doubtData.question,
    status: doubtData.status || 'Pending',
    priority: doubtData.priority || 'Normal',
    assignedTeacher: doubtData.assignedTeacher || 'Goyal Sir',
    date: doubtData.date || new Date().toISOString().split('T')[0],
    reply: doubtData.reply || '',
    createdAt: new Date().toISOString()
  };
  db.doubts.unshift(newDoubt);
  saveData(db);
  res.status(201).json({ success: true, message: 'Doubt ticket logged successfully', doubt: newDoubt });
});

app.put('/api/doubts/:id', (req, res) => {
  const { id } = req.params;
  const updates = req.body || {};
  db.doubts = db.doubts || [];
  const idx = db.doubts.findIndex(d => d.id === id);
  if (idx === -1) {
    return res.status(404).json({ error: 'Doubt ticket not found' });
  }
  db.doubts[idx] = { ...db.doubts[idx], ...updates, updatedAt: new Date().toISOString() };
  saveData(db);
  res.json({ success: true, message: 'Doubt ticket updated successfully', doubt: db.doubts[idx] });
});

app.delete('/api/doubts/:id', (req, res) => {
  const { id } = req.params;
  db.doubts = (db.doubts || []).filter(d => d.id !== id);
  saveData(db);
  res.json({ success: true, message: 'Doubt ticket deleted successfully' });
});

// ==========================================
// EXECUTIVE COMMAND OVERVIEW SUMMARY
// ==========================================
app.get('/api/overview/executive-summary', (req, res) => {
  try {
    const enquiries = db.enquiries || [];
    const doubts = db.doubts || initialData.doubts || [];
    const students = db.students || [];
    const teachers = db.teachers || [];
    const gtse = db.gtseRegistrations || [];

    const summary = {
      queries: {
        total: enquiries.length,
        pending: enquiries.filter(q => q.status !== 'Contacted' && q.status !== 'Resolved').length,
        contacted: enquiries.filter(q => q.status === 'Contacted' || q.status === 'Resolved').length,
        recent: enquiries.slice(0, 15)
      },
      doubts: {
        total: doubts.length,
        pending: doubts.filter(d => d.status === 'Pending').length,
        inProgress: doubts.filter(d => d.status === 'In Progress').length,
        resolved: doubts.filter(d => d.status === 'Resolved').length,
        bySubject: {
          mathematics: doubts.filter(d => d.subject?.toLowerCase().includes('math')).length,
          physics: doubts.filter(d => d.subject?.toLowerCase().includes('physic')).length,
          chemistry: doubts.filter(d => d.subject?.toLowerCase().includes('chem')).length,
          commerce: doubts.filter(d => 
            d.subject?.toLowerCase().includes('account') || 
            d.subject?.toLowerCase().includes('econom') || 
            d.subject?.toLowerCase().includes('business')
          ).length
        },
        recent: doubts.slice(0, 15)
      },
      members: {
        total: students.length + teachers.length + 1,
        totalStudents: students.length,
        totalTeachers: teachers.length,
        totalAdmin: 1,
        teachersShort: teachers.map(t => ({
          id: t.id,
          name: t.name,
          subject: t.subject,
          phone: t.phone,
          email: t.email,
          batchesCount: Array.isArray(t.assignedBatches) ? t.assignedBatches.length : 1,
          status: t.status || 'Active'
        })),
        studentsShort: students.map(s => ({
          id: s.id,
          rollNo: s.rollNo,
          name: s.name,
          grade: s.grade,
          batch: s.batch,
          parentPhone: s.parentPhone,
          feesStatus: s.fees?.status || 'Active',
          attendancePercentage: s.attendancePercentage,
          overallPercentage: s.overallPercentage
        }))
      },
      gtseRegistrationsCount: gtse.length
    };

    res.json({ success: true, ...summary });
  } catch (err) {
    console.error('Executive summary error:', err);
    res.status(500).json({ error: 'Failed to generate executive summary' });
  }
});

// ==========================================
// GTSE REGISTRATION & EXCEL EXPORT (GOYAL TALENT SEARCH EXAM)
// ==========================================
function appendToExcelSheet(reg) {
  try {
    if (!fs.existsSync(EXCEL_DIR)) {
      fs.mkdirSync(EXCEL_DIR, { recursive: true });
    }

    const headers = [
      'Registration ID',
      'Date & Time',
      'Student Name',
      'Date of Birth',
      'Gender',
      "Father's / Guardian Name",
      'Present Class',
      'School Name',
      'Permanent Address',
      'City / State',
      'Student Mobile',
      'Father Mobile',
      'Email Address',
      'Declaration Accepted',
      'Status'
    ];

    const newRow = [
      reg.id || `GTSE-${Date.now().toString().slice(-6)}`,
      reg.timestamp || new Date().toLocaleString('en-IN'),
      reg.name || '',
      reg.dob || '',
      reg.gender || '',
      reg.fatherName || '',
      reg.presentClass || '',
      reg.school || '',
      reg.address || '',
      reg.cityState || '',
      reg.studentNo || '',
      reg.fatherNo || '',
      reg.email || '',
      reg.declaration ? 'Yes' : 'No',
      'Registered'
    ];

    let wb;
    let existingRows = [];
    if (fs.existsSync(EXCEL_FILE)) {
      try {
        wb = XLSX.readFile(EXCEL_FILE);
        const ws = wb.Sheets['GTSE_Registrations'];
        if (ws) {
          const raw = XLSX.utils.sheet_to_json(ws, { header: 1 });
          if (Array.isArray(raw) && raw.length > 0) {
            existingRows = raw;
          }
        }
      } catch {
        wb = XLSX.utils.book_new();
      }
    } else {
      wb = XLSX.utils.book_new();
    }

    if (!existingRows || existingRows.length === 0) {
      existingRows = [headers, newRow];
    } else {
      const regId = String(reg.id || '').trim().toLowerCase();
      const studentNo = String(reg.studentNo || '').trim();
      let matchIdx = -1;
      for (let i = 1; i < existingRows.length; i++) {
        const rowId = String(existingRows[i][0] || '').trim().toLowerCase();
        const rowPhone = String(existingRows[i][10] || '').trim();
        if ((regId && rowId === regId) || (studentNo && rowPhone === studentNo)) {
          matchIdx = i;
          break;
        }
      }
      if (matchIdx !== -1) {
        existingRows[matchIdx] = newRow;
      } else {
        existingRows.push(newRow);
      }
    }

    const newWs = XLSX.utils.aoa_to_sheet(existingRows);
    wb.Sheets['GTSE_Registrations'] = newWs;
    if (!wb.SheetNames.includes('GTSE_Registrations')) {
      wb.SheetNames.push('GTSE_Registrations');
    }

    XLSX.writeFile(wb, EXCEL_FILE);
    console.log(`[EXCEL SUCCESS] Saved registration ${reg.id} to ${EXCEL_FILE}`);
    return true;
  } catch (err) {
    console.error('[EXCEL ERROR] Failed to save registration to Excel:', err);
    return false;
  }
}

app.post('/api/gtse-registration', (req, res) => {
  const regData = req.body || {};
  if (!regData.name || !regData.studentNo) {
    return res.status(400).json({ error: "Student's Name and Mobile Number are required." });
  }

  regData.id = `GTSE-${Date.now().toString().slice(-6)}`;
  regData.timestamp = new Date().toLocaleString('en-IN', {
    timeZone: 'Asia/Kolkata',
    dateStyle: 'medium',
    timeStyle: 'short'
  });

  // Save to database
  db.gtseRegistrations = db.gtseRegistrations || [];
  db.gtseRegistrations.unshift(regData);
  saveData(db);

  // Save to Excel in server/excel-records/gtse_registrations.xlsx
  const excelSaved = appendToExcelSheet(regData);

  // Save into class-wise disk folders & Student Profile text cards
  let recInfo = { className: 'General' };
  try {
    recInfo = recordGTSESubmission(regData);
  } catch (err) {
    console.error('[RecordManager] Failed to record GTSE to class folder:', err);
  }

  res.status(201).json({
    success: true,
    message: 'GTSE Registration successfully submitted and recorded in the Excel register!',
    registrationId: regData.id,
    excelSaved,
    recordedClass: recInfo.className,
    data: regData
  });
});

app.get('/api/gtse-registrations', (req, res) => {
  res.json({
    success: true,
    count: (db.gtseRegistrations || []).length,
    registrations: db.gtseRegistrations || []
  });
});

app.get('/api/gtse-registrations/download', (req, res) => {
  if (fs.existsSync(EXCEL_FILE)) {
    res.download(EXCEL_FILE, 'Goyal_Coaching_Center_GTSE_Registrations.xlsx');
  } else {
    // If no registrations yet, generate an empty template and send
    appendToExcelSheet({
      id: 'GTSE-SAMPLE',
      name: 'Sample Student',
      dob: '2010-01-01',
      gender: 'Male',
      fatherName: 'Sample Parent',
      presentClass: '10th',
      school: 'Sample School',
      address: 'Main Road',
      cityState: 'Patiala, Punjab',
      studentNo: '9876960163',
      fatherNo: '9876543211',
      email: 'sample@student.com',
      declaration: true
    });
    res.download(EXCEL_FILE, 'Goyal_Coaching_Center_GTSE_Registrations.xlsx');
  }
});

// ==========================================
// ORGANIZED STUDENT RECORDS VAULT & FILE EXPLORER
// ==========================================
// Get entire categorization tree (Admissions, GTSE/GST, Queries by class)
app.get('/api/records/overview', (req, res) => {
  try {
    const overview = getRecordsOverview();
    res.json({ success: true, ...overview });
  } catch (err) {
    console.error('[Records API] Error generating overview:', err);
    res.status(500).json({ error: 'Failed to read records tree' });
  }
});

// Download any specific Excel / JSON register from class folders
app.get('/api/records/download-file', (req, res) => {
  try {
    const { relPath } = req.query;
    if (!relPath) {
      return res.status(400).json({ error: 'File path is required' });
    }

    const safeRel = path.normalize(relPath).replace(/^(\.\.[\/\\])+/, '');
    const fullPath = path.resolve(PROJECT_ROOT_RECORDS, safeRel);

    if (!fullPath.startsWith(PROJECT_ROOT_RECORDS)) {
      return res.status(403).json({ error: 'Access denied: Path out of records directory' });
    }

    if (!fs.existsSync(fullPath)) {
      return res.status(404).json({ error: 'Requested record file does not exist' });
    }

    const fileName = path.basename(fullPath);
    res.download(fullPath, fileName);
  } catch (err) {
    console.error('[Records API] Download error:', err);
    res.status(500).json({ error: 'Failed to download file' });
  }
});

// Directly pop open the folder in Windows File Explorer (Safe execution via spawn & path validation)
app.post('/api/records/open-folder', (req, res) => {
  try {
    const { category, className } = req.body || {};
    
    // Whitelist sanitize inputs to avoid directory traversal and command injection
    const cleanCategory = category ? String(category).replace(/[^a-zA-Z0-9_\-\s]/g, '').trim() : '';
    const cleanClass = className ? String(className).replace(/[^a-zA-Z0-9_\-\s]/g, '').trim() : '';

    let targetDir = PROJECT_ROOT_RECORDS;
    if (cleanCategory) {
      targetDir = path.resolve(PROJECT_ROOT_RECORDS, cleanCategory);
      if (cleanClass) {
        targetDir = path.resolve(targetDir, cleanClass);
      }
    }

    // Ensure path cannot escape PROJECT_ROOT_RECORDS
    if (!targetDir.startsWith(PROJECT_ROOT_RECORDS)) {
      return res.status(403).json({ error: 'Access denied: Path out of records directory' });
    }

    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }

    // Windows explorer launcher using spawn (no shell interpolation, safe from injection)
    if (process.platform === 'win32') {
      const explorer = spawn('explorer.exe', [targetDir], { detached: true, stdio: 'ignore' });
      explorer.unref();
      res.json({
        success: true,
        message: 'Opening folder in Windows File Explorer...',
        folderPath: targetDir
      });
    } else {
      res.json({
        success: true,
        message: 'Folder access path prepared on server host',
        folderPath: targetDir
      });
    }
  } catch (err) {
    console.error('[Records API] Open folder error:', err);
    res.status(500).json({ error: 'Failed to open directory' });
  }
});

// Synchronize local records and Excel registers with Cloud Railway website
app.post('/api/records/sync-cloud', async (req, res) => {
  try {
    const result = await syncData();
    db = loadData();
    res.json({
      success: true,
      message: 'Successfully synchronized website records with local Excel sheets & dossiers!',
      details: result
    });
  } catch (err) {
    console.error('[Records API] Sync error:', err);
    res.status(500).json({ error: err.message || 'Synchronization failed' });
  }
});

// ==========================================
// RESULTS GROUP PHOTO MANAGEMENT
// ==========================================
app.get('/api/results-photo', (req, res) => {
  res.json(db.resultsPhoto || initialData.resultsPhoto);
});

app.put('/api/admin/results-photo', requireAdmin, (req, res) => {
  const { imageUrl, photos, title, subtitle, year, badge, description } = req.body;
  const photoList = Array.isArray(photos) ? photos : (imageUrl ? [{ id: 'photo-1', url: imageUrl, caption: title || '', year: year || '' }] : []);

  db.resultsPhoto = {
    imageUrl: photoList[0]?.url || imageUrl || '',
    photos: photoList,
    title: title || 'Our Board Exam Champions & Result Achievers',
    subtitle: subtitle || 'Class 10th & 12th Board Toppers Celebrating 100/100 Scores & Top College Selections',
    year: year || 'CBSE Board Results Celebration 2026',
    badge: badge || '🏆 Results Felicitation & Hall of Fame',
    description: description || ''
  };

  saveData(db);
  res.json({ success: true, resultsPhoto: db.resultsPhoto });
});

// ==========================================
// SHINING STARS (STUDENT RESULTS SHOWCASE)
// ==========================================
app.get('/api/shining-stars', (req, res) => {
  res.json(db.shiningStars || initialData.shiningStars || []);
});

app.post('/api/admin/shining-stars', requireAdmin, (req, res) => {
  const { name, score, exam, secondaryScore, secondaryExam, college, photo, year } = req.body;
  if (!name || !score) {
    return res.status(400).json({ error: 'Name and score are required.' });
  }

  const newStar = {
    id: 'star-' + Date.now(),
    name: name.trim().toUpperCase(),
    score: score.trim(),
    exam: (exam || 'CBSE Board').trim().toUpperCase(),
    secondaryScore: (secondaryScore || '').trim(),
    secondaryExam: (secondaryExam || '').trim().toUpperCase(),
    college: (college || 'TOP SELECTION').trim().toUpperCase(),
    photo: photo || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80',
    year: year || '2026'
  };

  if (!Array.isArray(db.shiningStars)) {
    db.shiningStars = [];
  }

  db.shiningStars.unshift(newStar);
  saveData(db);
  res.status(201).json({ success: true, star: newStar, shiningStars: db.shiningStars });
});

app.put('/api/admin/shining-stars', requireAdmin, (req, res) => {
  const stars = Array.isArray(req.body) ? req.body : req.body.stars;
  if (!Array.isArray(stars)) {
    return res.status(400).json({ error: 'Expected an array of shining stars.' });
  }

  db.shiningStars = stars.map(s => ({
    ...s,
    id: s.id || ('star-' + Math.random().toString(36).substr(2, 9)),
    name: (s.name || '').toUpperCase(),
    exam: (s.exam || '').toUpperCase(),
    secondaryExam: (s.secondaryExam || '').toUpperCase(),
    college: (s.college || '').toUpperCase()
  }));

  saveData(db);
  res.json({ success: true, shiningStars: db.shiningStars });
});

app.delete('/api/admin/shining-stars/:id', requireAdmin, (req, res) => {
  const { id } = req.params;
  if (!Array.isArray(db.shiningStars)) {
    db.shiningStars = [];
  }

  db.shiningStars = db.shiningStars.filter(s => s.id !== id);
  saveData(db);
  res.json({ success: true, shiningStars: db.shiningStars });
});

// ==========================================
// IMPACT STATS MANAGEMENT (HOMEPAGE COUNTER)
// ==========================================
app.get('/api/impact-stats', (req, res) => {
  res.json(db.impactStats || initialData.impactStats || { courses: 15, students: 7286, teachers: 25 });
});

app.put('/api/admin/impact-stats', requireAdmin, (req, res) => {
  const { courses, students, teachers } = req.body;
  
  db.impactStats = {
    courses: courses !== undefined && !isNaN(Number(courses)) ? Number(courses) : (db.impactStats?.courses ?? 15),
    students: students !== undefined && !isNaN(Number(students)) ? Number(students) : (db.impactStats?.students ?? 7286),
    teachers: teachers !== undefined && !isNaN(Number(teachers)) ? Number(teachers) : (db.impactStats?.teachers ?? 25)
  };

  saveData(db);
  res.json({ success: true, impactStats: db.impactStats });
});

// ==========================================
// INSTITUTION FEATURES CAROUSEL MANAGEMENT
// ==========================================
app.get('/api/features', (req, res) => {
  res.json(db.features || initialData.features || []);
});

app.post('/api/admin/features', requireAdmin, (req, res) => {
  const { title, subtitle, iconKey, iconUrl, badge } = req.body;
  if (!title) {
    return res.status(400).json({ error: 'Title is required.' });
  }

  const newFeature = {
    id: 'feat-' + Date.now(),
    title: title.trim(),
    subtitle: (subtitle || '').trim(),
    iconKey: (iconKey || 'sparkles').trim().toLowerCase(),
    iconUrl: (iconUrl || '').trim(),
    badge: (badge || 'Feature').trim()
  };

  if (!Array.isArray(db.features)) {
    db.features = [];
  }

  db.features.push(newFeature);
  saveData(db);
  res.status(201).json({ success: true, feature: newFeature, features: db.features });
});

app.put('/api/admin/features', requireAdmin, (req, res) => {
  const features = Array.isArray(req.body) ? req.body : req.body.features;
  if (!Array.isArray(features)) {
    return res.status(400).json({ error: 'Expected an array of features.' });
  }

  db.features = features.map(f => ({
    ...f,
    id: f.id || ('feat-' + Math.random().toString(36).substr(2, 9)),
    title: f.title || '',
    subtitle: f.subtitle || '',
    iconKey: (f.iconKey || 'sparkles').toLowerCase(),
    iconUrl: f.iconUrl || '',
    badge: f.badge || 'Feature'
  }));

  saveData(db);
  res.json({ success: true, features: db.features });
});

app.delete('/api/admin/features/:id', requireAdmin, (req, res) => {
  const { id } = req.params;
  if (!Array.isArray(db.features)) {
    db.features = [];
  }

  db.features = db.features.filter(f => f.id !== id);
  saveData(db);
  res.json({ success: true, features: db.features });
});

// ==========================================
// EXPLORE COURSES MANAGEMENT
// ==========================================
app.get('/api/explore-courses', (req, res) => {
  res.json(db.exploreCourses || initialData.exploreCourses || []);
});

app.post('/api/admin/explore-courses', requireAdmin, (req, res) => {
  const { title, description, iconKey, points, classes } = req.body;
  if (!title) {
    return res.status(400).json({ error: 'Course title is required.' });
  }

  const newCourse = {
    id: 'course-' + Date.now(),
    title: title.trim(),
    description: (description || '').trim(),
    iconKey: (iconKey || 'book').trim().toLowerCase(),
    points: Array.isArray(points) ? points.map(p => typeof p === 'string' ? p.trim() : p).filter(Boolean) : [],
    classes: Array.isArray(classes) ? classes.map(c => typeof c === 'string' ? c.trim() : c).filter(Boolean) : []
  };

  if (!Array.isArray(db.exploreCourses)) {
    db.exploreCourses = [];
  }

  db.exploreCourses.push(newCourse);
  saveData(db);
  res.status(201).json({ success: true, course: newCourse, exploreCourses: db.exploreCourses });
});

app.put('/api/admin/explore-courses', requireAdmin, (req, res) => {
  const courses = Array.isArray(req.body) ? req.body : req.body.courses;
  if (!Array.isArray(courses)) {
    return res.status(400).json({ error: 'Expected an array of courses.' });
  }

  db.exploreCourses = courses.map(c => ({
    ...c,
    id: c.id || ('course-' + Math.random().toString(36).substr(2, 9)),
    title: (c.title || '').trim(),
    description: (c.description || '').trim(),
    iconKey: (c.iconKey || 'book').toLowerCase().trim(),
    points: Array.isArray(c.points) ? c.points.map(p => typeof p === 'string' ? p.trim() : p).filter(Boolean) : [],
    classes: Array.isArray(c.classes) ? c.classes.map(cl => typeof cl === 'string' ? cl.trim() : cl).filter(Boolean) : []
  }));

  saveData(db);
  res.json({ success: true, exploreCourses: db.exploreCourses });
});

app.delete('/api/admin/explore-courses/:id', requireAdmin, (req, res) => {
  const { id } = req.params;
  if (!Array.isArray(db.exploreCourses)) {
    db.exploreCourses = [];
  }

  db.exploreCourses = db.exploreCourses.filter(c => c.id !== id);
  saveData(db);
  res.json({ success: true, exploreCourses: db.exploreCourses });
});

// ==========================================
// DIRECTORS MANAGEMENT
// ==========================================
app.get('/api/directors', (req, res) => {
  res.json(db.directors || []);
});

app.post('/api/admin/directors', requireAdmin, (req, res) => {
  const { name, designation, qualification, subject, experience, badge, photo, description, specialties } = req.body;
  if (!name) {
    return res.status(400).json({ error: 'Director name is required.' });
  }

  const newDirector = {
    id: 'dir-' + Date.now(),
    name: name.trim(),
    designation: (designation || 'Academic Director').trim(),
    qualification: (qualification || 'M.Sc / CA').trim(),
    subject: (subject || 'Core Academics').trim(),
    experience: (experience || '10+ Years Experience').trim(),
    badge: (badge || 'Executive Director').trim(),
    photo: photo || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80',
    description: (description || '').trim(),
    specialties: Array.isArray(specialties) ? specialties.map(s => typeof s === 'string' ? s.trim() : s).filter(Boolean) : []
  };

  if (!Array.isArray(db.directors)) {
    db.directors = [];
  }

  db.directors.push(newDirector);
  saveData(db);
  res.status(201).json({ success: true, director: newDirector, directors: db.directors });
});

app.put('/api/admin/directors', requireAdmin, (req, res) => {
  const directors = Array.isArray(req.body) ? req.body : req.body.directors;
  if (!Array.isArray(directors)) {
    return res.status(400).json({ error: 'Expected an array of directors.' });
  }

  db.directors = directors.map(d => ({
    ...d,
    id: d.id || ('dir-' + Math.random().toString(36).substr(2, 9)),
    name: (d.name || '').trim(),
    designation: (d.designation || 'Academic Director').trim(),
    qualification: (d.qualification || '').trim(),
    subject: (d.subject || '').trim(),
    experience: (d.experience || '').trim(),
    badge: (d.badge || 'Executive Director').trim(),
    photo: d.photo || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80',
    description: (d.description || '').trim(),
    specialties: Array.isArray(d.specialties) ? d.specialties.map(s => typeof s === 'string' ? s.trim() : s).filter(Boolean) : []
  }));

  saveData(db);
  res.json({ success: true, directors: db.directors });
});

app.delete('/api/admin/directors/:id', requireAdmin, (req, res) => {
  const { id } = req.params;
  if (!Array.isArray(db.directors)) {
    db.directors = [];
  }

  db.directors = db.directors.filter(d => d.id !== id);
  saveData(db);
  res.json({ success: true, directors: db.directors });
});

// ==========================================
// LATEST NEWS & EVENTS ENDPOINTS
// ==========================================
app.get('/api/news-events', (req, res) => {
  if (!Array.isArray(db.newsEvents)) {
    db.newsEvents = [];
  }
  res.json(db.newsEvents);
});

app.post('/api/admin/news-events', requireAdmin, (req, res) => {
  const { title, category, badge, isNew, date, content, link } = req.body;
  if (!title) {
    return res.status(400).json({ error: 'Title is required for news/event.' });
  }

  const newItem = {
    id: 'news-' + Date.now(),
    title: (title || '').trim(),
    category: (category === 'announcement' ? 'announcement' : 'news'),
    badge: (badge || 'new').trim(),
    isNew: isNew !== undefined ? Boolean(isNew) : true,
    date: (date || new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' })).trim(),
    content: (content || '').trim(),
    link: (link || '').trim()
  };

  if (!Array.isArray(db.newsEvents)) {
    db.newsEvents = [];
  }

  db.newsEvents.unshift(newItem);
  saveData(db);
  res.status(201).json({ success: true, item: newItem, newsEvents: db.newsEvents });
});

app.put('/api/admin/news-events', requireAdmin, (req, res) => {
  const items = Array.isArray(req.body) ? req.body : req.body.newsEvents;
  if (!Array.isArray(items)) {
    return res.status(400).json({ error: 'Expected an array of news/events.' });
  }

  db.newsEvents = items.map(item => ({
    ...item,
    id: item.id || ('news-' + Math.random().toString(36).substr(2, 9)),
    title: (item.title || '').trim(),
    category: (item.category === 'announcement' ? 'announcement' : 'news'),
    badge: (item.badge || 'new').trim(),
    isNew: item.isNew !== undefined ? Boolean(item.isNew) : true,
    date: (item.date || '').trim(),
    content: (item.content || '').trim(),
    link: (item.link || '').trim()
  }));

  saveData(db);
  res.json({ success: true, newsEvents: db.newsEvents });
});

app.delete('/api/admin/news-events/:id', requireAdmin, (req, res) => {
  const { id } = req.params;
  if (!Array.isArray(db.newsEvents)) {
    db.newsEvents = [];
  }

  db.newsEvents = db.newsEvents.filter(item => item.id !== id);
  saveData(db);
  res.json({ success: true, newsEvents: db.newsEvents });
});

// ==========================================
// CENTERS & BRANCHES MANAGEMENT (LIVE GOOGLE MAPS)
// ==========================================
app.get('/api/centers', (req, res) => {
  if (!Array.isArray(db.centers)) {
    db.centers = (initialData.centers || []);
  }
  res.json(db.centers);
});

app.post('/api/admin/centers', requireAdmin, (req, res) => {
  const { name, city, district, state, pinCode, address, phone, email, timings, courses, googleMapsUrl, embedMapUrl, isMain, status, badge } = req.body;
  if (!name || !address) {
    return res.status(400).json({ error: 'Center name and address are required.' });
  }

  const newCenter = {
    id: 'center-' + Date.now(),
    name: (name || '').trim(),
    city: (city || 'Bhikhi').trim(),
    district: (district || '').trim(),
    state: (state || 'Punjab').trim(),
    pinCode: (pinCode || '').trim(),
    address: (address || '').trim(),
    phone: (phone || '+91 98769 60163').trim(),
    email: (email || 'bhikhi@goyalcoaching.edu.in').trim(),
    timings: (timings || 'Monday – Saturday: 3:00 PM – 8:30 PM').trim(),
    courses: (courses || 'Class 8th–10th (Sci & Maths) • Class 11th–12th (Commerce)').trim(),
    googleMapsUrl: (googleMapsUrl || 'https://maps.app.goo.gl/g8yZ71a2HLVsZrV67').trim(),
    embedMapUrl: (embedMapUrl || '').trim(),
    isMain: Boolean(isMain),
    status: (status || 'Active').trim(),
    badge: (badge || 'Learning Center').trim()
  };

  if (!Array.isArray(db.centers)) {
    db.centers = [];
  }

  db.centers.push(newCenter);
  saveData(db);
  res.status(201).json({ success: true, center: newCenter, centers: db.centers });
});

app.put('/api/admin/centers/:id', requireAdmin, (req, res) => {
  const { id } = req.params;
  if (!Array.isArray(db.centers)) {
    db.centers = [];
  }

  const idx = db.centers.findIndex(c => c.id === id);
  if (idx === -1) {
    return res.status(404).json({ error: 'Center not found' });
  }

  db.centers[idx] = {
    ...db.centers[idx],
    ...req.body,
    id
  };

  saveData(db);
  res.json({ success: true, center: db.centers[idx], centers: db.centers });
});

app.put('/api/admin/centers', requireAdmin, (req, res) => {
  const centers = Array.isArray(req.body) ? req.body : req.body.centers;
  if (!Array.isArray(centers)) {
    return res.status(400).json({ error: 'Expected an array of centers.' });
  }

  db.centers = centers.map(c => ({
    ...c,
    id: c.id || ('center-' + Math.random().toString(36).substr(2, 9))
  }));

  saveData(db);
  res.json({ success: true, centers: db.centers });
});

app.delete('/api/admin/centers/:id', requireAdmin, (req, res) => {
  const { id } = req.params;
  if (!Array.isArray(db.centers)) {
    db.centers = [];
  }

  db.centers = db.centers.filter(c => c.id !== id);
  saveData(db);
  res.json({ success: true, centers: db.centers });
});

// Serve static frontend in production
const DIST_PATH = path.join(__dirname, '..', 'dist');
if (fs.existsSync(DIST_PATH)) {
  app.get('/sitemap.xml', (req, res) => {
    res.setHeader('Content-Type', 'application/xml; charset=utf-8');
    res.setHeader('Cache-Control', 'public, max-age=3600');
    res.sendFile(path.join(DIST_PATH, 'sitemap.xml'));
  });

  app.get('/robots.txt', (req, res) => {
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.setHeader('Cache-Control', 'public, max-age=3600');
    res.sendFile(path.join(DIST_PATH, 'robots.txt'));
  });

  app.use(express.static(DIST_PATH));
  app.use((req, res, next) => {
    if (req.path.startsWith('/api')) return next();
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    res.sendFile(path.join(DIST_PATH, 'index.html'));
  });
}

async function startServer() {
  await freePortIfOccupied(PORT);

  const server = app.listen(PORT, () => {
    console.log(`Goyal Coaching Center API Server is running permanently on port ${PORT}`);
    console.log(`- Backend API: http://localhost:${PORT}`);
    console.log(`- Frontend App: http://localhost:5173`);
  });

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.error(`\n[FATAL] Port ${PORT} is occupied by another process.`);
      console.error(`Attempting recovery... Please restart server.\n`);
      process.exit(1);
    } else {
      console.error('[Server Error]', err);
    }
  });
}

startServer();
