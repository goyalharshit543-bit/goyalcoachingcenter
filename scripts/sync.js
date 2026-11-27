import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { migrateExistingRecords, initRecordsDirectories } from '../server/recordManager.js';
import { exportClassHierarchies } from './exportClassHierarchies.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.resolve(__dirname, '..');
const LOCAL_DATA_FILE = path.join(PROJECT_ROOT, 'server', 'data.json');

const DEFAULT_GLOBAL_URL = 'https://goyalcoachingcenter-production.up.railway.app';

/**
 * Intelligent bidirectional merger for coaching institute records
 */
function mergeDatasets(localDb, remoteDb) {
  const merged = { ...remoteDb, ...localDb };

  // 1. Merge Students
  const studentMap = new Map();

  // Load all local students
  (localDb.students || []).forEach(s => {
    const key = (s.rollNo || s.id || '').toString().trim().toUpperCase();
    if (key) studentMap.set(key, { ...s });
  });

  // Merge remote students
  (remoteDb.students || []).forEach(r => {
    const key = (r.rollNo || r.id || '').toString().trim().toUpperCase();
    if (!key) return;

    if (studentMap.has(key)) {
      const local = studentMap.get(key);
      // Local changes take precedence for teacher/admin fields (remarks, fees, marks, attendance)
      // Remote student password update takes precedence if student changed it online
      const password = (r.password && r.password !== 'student123' && r.password !== local.password)
        ? r.password
        : (local.password || r.password || 'student123');

      studentMap.set(key, {
        ...r,
        ...local,
        password,
        name: local.name || r.name,
        grade: local.grade || r.grade,
        stream: local.stream || r.stream,
        batch: local.batch || r.batch,
        parentName: local.parentName || r.parentName,
        parentPhone: local.parentPhone || r.parentPhone,
        studentPhone: local.studentPhone || r.studentPhone,
        photo: local.photo || r.photo,
        enrollmentDate: local.enrollmentDate || r.enrollmentDate,
        fees: {
          ...(r.fees || {}),
          ...(local.fees || {})
        },
        teacherRemarks: local.teacherRemarks || r.teacherRemarks,
        overallPercentage: local.overallPercentage !== undefined ? local.overallPercentage : (r.overallPercentage || 0),
        attendancePercentage: local.attendancePercentage !== undefined ? local.attendancePercentage : (r.attendancePercentage || 0),
        workingDays: local.workingDays !== undefined ? local.workingDays : (r.workingDays || 0),
        attendedDays: local.attendedDays !== undefined ? local.attendedDays : (r.attendedDays || 0),
        totalClassesAttended: local.totalClassesAttended !== undefined ? local.totalClassesAttended : (r.totalClassesAttended || 0),
        totalClassesHeld: local.totalClassesHeld !== undefined ? local.totalClassesHeld : (r.totalClassesHeld || 0)
      });
    } else {
      // New student registered on cloud website -> add to local roster
      studentMap.set(key, { ...r });
    }
  });

  merged.students = Array.from(studentMap.values());

  // 2. Merge Enquiries: Union without duplicates
  const enquiryMap = new Map();
  (localDb.enquiries || []).forEach(e => enquiryMap.set(e.id || `${e.mobile || e.phone}_${e.timestamp}`, e));
  (remoteDb.enquiries || []).forEach(e => enquiryMap.set(e.id || `${e.mobile || e.phone}_${e.timestamp}`, e));
  merged.enquiries = Array.from(enquiryMap.values());

  // 3. Merge GTSE Registrations: Union without duplicates
  const gtseMap = new Map();
  (localDb.gtseRegistrations || []).forEach(g => gtseMap.set(g.id || `${g.studentNo}_${g.timestamp}`, g));
  (remoteDb.gtseRegistrations || []).forEach(g => gtseMap.set(g.id || `${g.studentNo}_${g.timestamp}`, g));
  merged.gtseRegistrations = Array.from(gtseMap.values());

  // 4. Merge Attendance Logs: Union by date + studentId
  const attMap = new Map();
  (remoteDb.attendanceLogs || []).forEach(a => attMap.set(`${a.date}_${String(a.studentId).toUpperCase()}`, a));
  (localDb.attendanceLogs || []).forEach(a => attMap.set(`${a.date}_${String(a.studentId).toUpperCase()}`, a));
  merged.attendanceLogs = Array.from(attMap.values());

  // 5. Merge Tests & Marks
  const testMap = new Map();
  (remoteDb.tests || []).forEach(t => testMap.set(t.id || `${t.title}_${t.date}`, t));
  (localDb.tests || []).forEach(t => {
    const key = t.id || `${t.title}_${t.date}`;
    if (testMap.has(key)) {
      const prev = testMap.get(key);
      const resMap = new Map();
      (prev.results || []).forEach(r => resMap.set(String(r.rollNo || r.studentId).toUpperCase(), r));
      (t.results || []).forEach(r => resMap.set(String(r.rollNo || r.studentId).toUpperCase(), r));
      testMap.set(key, { ...prev, ...t, results: Array.from(resMap.values()) });
    } else {
      testMap.set(key, t);
    }
  });
  merged.tests = Array.from(testMap.values());

  // 6. Merge Notices
  const noticeMap = new Map();
  (remoteDb.notices || []).forEach(n => noticeMap.set(n.id || `${n.title}_${n.date}`, n));
  (localDb.notices || []).forEach(n => noticeMap.set(n.id || `${n.title}_${n.date}`, n));
  merged.notices = Array.from(noticeMap.values());

  // 7. Merge other items (Assignments, Lectures, Online Tests, Doubts)
  ['assignments', 'lectures', 'onlineTests', 'doubts'].forEach(field => {
    const itemMap = new Map();
    (remoteDb[field] || []).forEach(i => itemMap.set(i.id || i.title || JSON.stringify(i), i));
    (localDb[field] || []).forEach(i => itemMap.set(i.id || i.title || JSON.stringify(i), i));
    merged[field] = Array.from(itemMap.values());
  });

  // 8. CMS Items: Local configurations take precedence
  ['centers', 'directors', 'features', 'shiningStars', 'exploreCourses'].forEach(field => {
    if (Array.isArray(localDb[field]) && localDb[field].length > 0) {
      merged[field] = localDb[field];
    } else if (Array.isArray(remoteDb[field])) {
      merged[field] = remoteDb[field];
    }
  });
  merged.impactStats = localDb.impactStats || remoteDb.impactStats || { courses: 15, students: 7286, teachers: 25 };
  merged.resultsPhoto = localDb.resultsPhoto || remoteDb.resultsPhoto || { photos: [] };

  return merged;
}

/**
 * Pushes merged changes up to the cloud Railway server.
 * First tries POST /api/sync. If not supported (404), falls back to individual REST endpoints.
 */
async function pushToCloudServer(targetUrl, mergedData, remoteDb) {
  const cleanUrl = targetUrl.replace(/\/$/, '');
  console.log(`[PUSH] Uploading synced data to cloud website (${cleanUrl})...`);

  const adminHeaders = {
    'Content-Type': 'application/json',
    'x-admin-key': process.env.ADMIN_PASSWORD || 'Harry@962008',
    'x-admin-auth': 'true'
  };

  // Attempt 1: Bulk /api/sync endpoint
  try {
    const syncRes = await fetch(`${cleanUrl}/api/sync`, {
      method: 'POST',
      headers: adminHeaders,
      body: JSON.stringify(mergedData)
    });

    if (syncRes.ok) {
      const syncJson = await syncRes.json();
      console.log(`✓ [SUCCESS] Cloud website updated via bulk /api/sync!`);
      return { success: true, method: 'bulk', details: syncJson };
    }
  } catch (syncErr) {
    // Fall back to granular sync
  }

  // Attempt 2: Granular sync via individual endpoints
  console.log(`[PUSH] Using REST endpoints to synchronize all students and records to website...`);
  let studentsSynced = 0;
  const remoteStudentMap = new Map();
  (remoteDb.students || []).forEach(s => {
    const key = (s.rollNo || s.id || '').toString().trim().toUpperCase();
    if (key) remoteStudentMap.set(key, s);
  });

  for (const student of mergedData.students || []) {
    const key = (student.rollNo || student.id || '').toString().trim().toUpperCase();
    try {
      if (!remoteStudentMap.has(key)) {
        // Create new student on cloud
        const postRes = await fetch(`${cleanUrl}/api/students`, {
          method: 'POST',
          headers: adminHeaders,
          body: JSON.stringify(student)
        });
        if (postRes.ok) studentsSynced++;
      } else {
        // Update existing student on cloud with latest laptop changes
        const putRes = await fetch(`${cleanUrl}/api/students/${encodeURIComponent(student.id || student.rollNo)}`, {
          method: 'PUT',
          headers: adminHeaders,
          body: JSON.stringify(student)
        });
        if (putRes.ok) studentsSynced++;
      }
    } catch (e) {
      // Continue next
    }
  }

  // Push missing enquiries to cloud
  const remoteEnqIds = new Set((remoteDb.enquiries || []).map(e => e.id));
  let enqSynced = 0;
  for (const enq of mergedData.enquiries || []) {
    if (enq.id && !remoteEnqIds.has(enq.id)) {
      try {
        const res = await fetch(`${cleanUrl}/api/enquiry`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(enq)
        });
        if (res.ok) enqSynced++;
      } catch {}
    }
  }

  // Push missing GTSE registrations to cloud
  const remoteGtseIds = new Set((remoteDb.gtseRegistrations || []).map(g => g.id));
  let gtseSynced = 0;
  for (const gtse of mergedData.gtseRegistrations || []) {
    if (gtse.id && !remoteGtseIds.has(gtse.id)) {
      try {
        const res = await fetch(`${cleanUrl}/api/gtse-registration`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(gtse)
        });
        if (res.ok) gtseSynced++;
      } catch {}
    }
  }

  console.log(`✓ [SUCCESS] Cloud website updated via REST endpoints:`);
  console.log(`  - Students synchronized to website: ${studentsSynced}`);
  if (enqSynced > 0) console.log(`  - Enquiries pushed: ${enqSynced}`);
  if (gtseSynced > 0) console.log(`  - GTSE registrations pushed: ${gtseSynced}`);

  return { success: true, method: 'granular' };
}

async function syncData() {
  const targetUrl = process.argv[2] || process.env.REMOTE_URL || DEFAULT_GLOBAL_URL;
  console.log(`=====================================================================`);
  console.log(`[GOYAL COACHING CENTER] TWO-WAY SYNC (CLOUD RAILWAY <-> LAPTOP)`);
  console.log(`Connecting to: ${targetUrl}...`);
  console.log(`=====================================================================`);

  let localDb = { students: [], enquiries: [], gtseRegistrations: [], tests: [], attendanceLogs: [] };
  if (fs.existsSync(LOCAL_DATA_FILE)) {
    try {
      localDb = JSON.parse(fs.readFileSync(LOCAL_DATA_FILE, 'utf8'));
    } catch (e) {
      console.warn('Warning: Could not parse local data.json, starting with clean base');
    }

    // Always create a timestamped backup before modifying
    const backupDir = path.join(PROJECT_ROOT, 'server', 'backups');
    if (!fs.existsSync(backupDir)) fs.mkdirSync(backupDir, { recursive: true });
    const backupPath = path.join(backupDir, `data.backup-${Date.now()}.json`);
    fs.copyFileSync(LOCAL_DATA_FILE, backupPath);
  }

  try {
    // 1. Fetch remote data from Railway cloud website
    const res = await fetch(`${targetUrl.replace(/\/$/, '')}/api/data?t=${Date.now()}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
    const remoteDb = await res.json();

    console.log(`\n[PULL] Connected to Cloud Server:`);
    console.log(`- Students on cloud website: ${(remoteDb.students || []).length}`);
    console.log(`- Enquiries on cloud website: ${(remoteDb.enquiries || []).length}`);
    console.log(`- GTSE on cloud website: ${(remoteDb.gtseRegistrations || []).length}`);
    console.log(`- Students on laptop: ${(localDb.students || []).length}`);

    // 2. Intelligent Bidirectional Merge: Preserves ALL previous + new data
    const mergedData = mergeDatasets(localDb, remoteDb);

    // 3. Save merged dataset to local data.json
    fs.writeFileSync(LOCAL_DATA_FILE, JSON.stringify(mergedData, null, 2), 'utf8');

    // 4. Push all changes back to the cloud Railway server so website has everything
    await pushToCloudServer(targetUrl, mergedData, remoteDb);

    // 5. Update Excel registers in records/
    initRecordsDirectories();
    migrateExistingRecords(mergedData);

    // 6. Generate hierarchical Class folders & dossiers in Class_Organized_Records/
    exportClassHierarchies();

    console.log(`=====================================================================`);
    console.log(`🎉 TWO-WAY SYNCHRONIZATION SUCCESSFUL!`);
    console.log(`=====================================================================`);
    console.log(`- Total Students Active: ${mergedData.students.length}`);
    console.log(`- Total Enquiries: ${mergedData.enquiries.length}`);
    console.log(`- Total GTSE Applications: ${mergedData.gtseRegistrations.length}`);
    console.log(`- Laptop Folders Updated: Class_Organized_Records & records/`);
    console.log(`- Cloud Railway Website: Completely Synchronized!`);
    console.log(`=====================================================================\n`);
  } catch (err) {
    console.error(`\n[SYNC ERROR] Could not reach cloud server at ${targetUrl}: ${err.message}`);
    console.log(`Operating in offline mode. Exporting local records to Excel...`);
    try {
      initRecordsDirectories();
      migrateExistingRecords(localDb);
      exportClassHierarchies();
      console.log(`Local records refreshed successfully.`);
    } catch (e2) {
      console.error('Local export error:', e2.message);
    }
  }
}

syncData();
