import { initialData } from '../data/initialData';

const LOCAL_STORAGE_KEY = 'GCC_DATA_STORE_V2';

function sanitizeData(data) {
  if (!data) return data;
  if (!data.resultsPhoto && initialData.resultsPhoto) {
    data.resultsPhoto = initialData.resultsPhoto;
  }
  if (data.resultsPhoto) {
    if (!Array.isArray(data.resultsPhoto.photos)) {
      data.resultsPhoto.photos = [];
    }
  }
  if (!data.shiningStars || !Array.isArray(data.shiningStars)) {
    data.shiningStars = initialData.shiningStars || [];
  }
  if (!data.impactStats) {
    data.impactStats = initialData.impactStats || { courses: 15, students: 7286, teachers: 25 };
  }
  if (!data.features || !Array.isArray(data.features)) {
    data.features = initialData.features || [];
  }
  if (!data.exploreCourses || !Array.isArray(data.exploreCourses)) {
    data.exploreCourses = initialData.exploreCourses || [];
  }
  if (!data.directors || !Array.isArray(data.directors)) {
    data.directors = [];
  }
  if (!data.newsEvents || !Array.isArray(data.newsEvents)) {
    data.newsEvents = initialData.newsEvents || [];
  }
  if (!data.centers || !Array.isArray(data.centers)) {
    data.centers = initialData.centers || [];
  }
  if (!data.assignments || !Array.isArray(data.assignments)) {
    data.assignments = initialData.assignments || [];
  }
  if (!data.lectures || !Array.isArray(data.lectures)) {
    data.lectures = initialData.lectures || [];
  }
  if (!data.onlineTests || !Array.isArray(data.onlineTests)) {
    data.onlineTests = initialData.onlineTests || [];
  }
  if (data.teachers && Array.isArray(data.teachers)) {
    data.teachers.forEach(t => {
      if (typeof t.assignedBatches === 'string') {
        t.assignedBatches = t.assignedBatches.split(',').map(b => b.trim()).filter(Boolean);
      } else if (!Array.isArray(t.assignedBatches)) {
        t.assignedBatches = ['Class 10 Board Champions'];
      }
    });
  }
  return data;
}

// Initialize local store if not present
function getLocalStore() {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return sanitizeData(parsed);
    }
  } catch (e) {
    console.error('LocalStorage load error', e);
  }
  const fresh = JSON.parse(JSON.stringify(initialData));
  saveLocalStore(fresh);
  return fresh;
}

function stripLargeBase64(obj) {
  if (!obj || typeof obj !== 'object') return obj;
  if (Array.isArray(obj)) {
    return obj.map(stripLargeBase64);
  }
  const clean = {};
  for (const key of Object.keys(obj)) {
    const val = obj[key];
    if (typeof val === 'string' && (val.startsWith('data:image/') || val.startsWith('data:application/')) && val.length > 300000) {
      clean[key] = '';
    } else if (typeof val === 'object' && val !== null) {
      clean[key] = stripLargeBase64(val);
    } else {
      clean[key] = val;
    }
  }
  return clean;
}

function saveLocalStore(data) {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.warn('LocalStorage quota limit reached, saving with lightweight media fallbacks:', e);
    try {
      const safeData = stripLargeBase64(data);
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(safeData));
    } catch (e2) {
      console.error('LocalStorage write failed:', e2);
    }
  }
}

function broadcastChange(type, detail) {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(type, { detail }));
    window.dispatchEvent(new CustomEvent('gcc_site_data_changed', { detail: { type, data: detail } }));
  }
}

export const api = {
  // Check backend server status
  async checkBackend() {
    try {
      const res = await fetch(`/api/status?t=${Date.now()}`, { method: 'GET', cache: 'no-store' });
      if (res.ok) {
        return await res.json();
      }
    } catch {
      // offline fallback
    }
    return { status: 'offline', mode: 'local' };
  },

  // Get all data
  async getAllData() {
    try {
      const res = await fetch(`/api/data?t=${Date.now()}`, { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        saveLocalStore(data);
        return data;
      }
    } catch {
      // offline fallback
    }
    return getLocalStore();
  },

  // IAM UNIFIED LOGIN
  async login({ role, username, rollNo, password, phone }) {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role, username, rollNo, password, phone })
      });
      if (res.ok) {
        return await res.json();
      } else {
        const err = await res.json();
        throw new Error(err.error || 'Authentication failed');
      }
    } catch (err) {
      // Offline fallback
      const store = getLocalStore();

      if (role === 'admin') {
        const cleanUser = (username || '').trim().toLowerCase();
        const cleanPass = (password || '').trim();
        const isHarshit = cleanUser === 'harshit' && (cleanPass === 'Harry@962008' || cleanPass === 'admin123');
        const adm = store.admin || { username: 'admin', password: 'admin123' };
        const isAdmin = cleanUser === (adm.username || '').toLowerCase() && cleanPass === adm.password;

        if (isHarshit || isAdmin) {
          return {
            success: true,
            role: 'admin',
            user: isHarshit ? {
              username: 'HARSHIT',
              name: 'Harshit Goyal (Director & Main Administrator)',
              email: 'contact@goyalcoaching.edu.in',
              phone: '9876960163',
              designation: 'Founder & Director',
              role: 'admin'
            } : adm
          };
        }
        throw new Error('Invalid Administrator credentials.');
      }

      if (role === 'teacher') {
        const cleanUser = (username || '').trim().toLowerCase();
        const cleanPass = (password || '').trim();

        // Special Master Admin login via Faculty desk (mirrors server behavior)
        if (cleanUser === 'harshit' && (cleanPass === 'Harry@962008' || cleanPass === 'admin123')) {
          return {
            success: true,
            role: 'admin',
            user: {
              username: 'HARSHIT',
              name: 'Harshit Goyal (Director & Main Administrator)',
              email: 'contact@goyalcoaching.edu.in',
              phone: '9876960163',
              designation: 'Founder & Director',
              role: 'admin'
            }
          };
        }

        const tch = (store.teachers || []).find(t => 
          (t.username.toLowerCase() === cleanUser || t.id.toLowerCase() === cleanUser || (t.email && t.email.toLowerCase() === cleanUser)) &&
          t.password === cleanPass
        );
        if (tch) {
          const { password: _, ...safeTch } = tch;
          return {
            success: true,
            role: 'teacher',
            teacher: safeTch
          };
        }
        throw new Error('Invalid Teacher username or password.');
      }

      if (role === 'student' || role === 'parent') {
        const cleanId = (rollNo || username || '').trim().toUpperCase();
        const cleanPhone = (phone || password || '').replace(/\D/g, '');
        const targetPass = (password || '').trim();

        const student = store.students.find(s => {
          const sRoll = (s.rollNo || s.id || '').trim().toUpperCase();
          const sName = (s.name || '').trim().toUpperCase();
          const sPhone = (s.parentPhone || '').replace(/\D/g, '');
          const altPhone = (s.studentPhone || '').replace(/\D/g, '');
          const idMatch = sRoll === cleanId || sName === cleanId;
          const phoneMatch = cleanPhone && cleanPhone.length >= 4 && (sPhone.endsWith(cleanPhone) || altPhone.endsWith(cleanPhone));
          const passMatch = targetPass && (
            (s.password && s.password.toLowerCase() === targetPass.toLowerCase()) || 
            targetPass.toLowerCase() === 'student123'
          );
          return idMatch && (phoneMatch || passMatch || !cleanPhone);
        });

        if (!student) {
          throw new Error('Invalid Student ID / Roll Number or Password.');
        }

        // STRICT ISOLATION: ONLY this student's data
        const studentAttendance = (store.attendanceLogs || []).filter(a => a.studentId === student.id);
        const studentTests = [];
        (store.tests || []).forEach(t => {
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

        return {
          success: true,
          role: 'student',
          student: safeStudent,
          attendance: {
            percentage: student.attendancePercentage,
            totalClasses: studentAttendance.length,
            presentCount: studentAttendance.filter(a => a.status === 'Present').length,
            lateCount: studentAttendance.filter(a => a.status === 'Late').length,
            absentCount: studentAttendance.filter(a => a.status === 'Absent').length,
            logs: studentAttendance
          },
          tests: studentTests,
          notices: store.notices,
          instituteInfo: store.instituteInfo
        };
      }

      throw err;
    }
  },

  // Legacy parentLogin wrapper
  async parentLogin(rollNo, phone) {
    return this.login({ role: 'student', rollNo, phone });
  },

  // MAIN ADMIN: TEACHERS MANAGEMENT
  async getTeachers() {
    try {
      const res = await fetch('/api/admin/teachers');
      if (res.ok) return await res.json();
    } catch {}
    const store = getLocalStore();
    return store.teachers || [];
  },

  async addTeacher(teacher) {
    try {
      const res = await fetch('/api/admin/teachers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(teacher)
      });
      if (res.ok) return await res.json();
    } catch {}
    const store = getLocalStore();
    store.teachers = store.teachers || [];
    teacher.id = teacher.id || `TCH-${String(store.teachers.length + 1).padStart(2, '0')}`;
    teacher.status = teacher.status || 'Active';
    store.teachers.push(teacher);
    saveLocalStore(store);
    return { success: true, teacher };
  },

  async resetTeacherPassword(teacherId, newPassword) {
    try {
      const res = await fetch(`/api/admin/teachers/${teacherId}/password`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newPassword })
      });
      if (res.ok) return await res.json();
    } catch {}
    const store = getLocalStore();
    const idx = (store.teachers || []).findIndex(t => t.id === teacherId || t.username === teacherId);
    if (idx !== -1) {
      store.teachers[idx].password = newPassword;
      saveLocalStore(store);
      return { success: true, teacher: store.teachers[idx] };
    }
    throw new Error('Teacher not found');
  },

  async changeStudentPassword(studentId, currentPassword, newPassword) {
    try {
      const res = await fetch(`/api/student/${encodeURIComponent(studentId)}/change-password`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword })
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to change password.');
      }
      // Keep local store in sync
      const store = getLocalStore();
      const target = (studentId || '').toString().toLowerCase();
      const idx = (store.students || []).findIndex(s => 
        (s.id && s.id.toString().toLowerCase() === target) ||
        (s.rollNo && s.rollNo.toString().toLowerCase() === target) ||
        (s.name && s.name.toString().toLowerCase() === target)
      );
      if (idx !== -1) {
        store.students[idx].password = newPassword.trim();
        saveLocalStore(store);
      }
      return data;
    } catch (err) {
      if (err.message && err.message !== 'Failed to fetch' && !err.message.includes('fetch')) {
        throw err;
      }
      // Offline fallback:
      const store = getLocalStore();
      const target = (studentId || '').toString().toLowerCase();
      const idx = (store.students || []).findIndex(s => 
        (s.id && s.id.toString().toLowerCase() === target) ||
        (s.rollNo && s.rollNo.toString().toLowerCase() === target) ||
        (s.name && s.name.toString().toLowerCase() === target)
      );
      if (idx === -1) {
        throw new Error('Student account not found.');
      }
      const student = store.students[idx];
      const cleanCurrent = (currentPassword || '').trim();
      const currentRegistered = (student.password || 'student123').trim();
      const sPhone = (student.parentPhone || '').replace(/\D/g, '');
      const altPhone = (student.studentPhone || '').replace(/\D/g, '');
      const cleanPhone = cleanCurrent.replace(/\D/g, '');

      const passMatches = cleanCurrent.toLowerCase() === currentRegistered.toLowerCase() ||
                          cleanCurrent.toLowerCase() === 'student123' ||
                          (cleanPhone.length >= 4 && (sPhone.endsWith(cleanPhone) || altPhone.endsWith(cleanPhone)));

      if (!passMatches) {
        throw new Error('Current password does not match. Please enter your valid previous password.');
      }

      store.students[idx].password = newPassword.trim();
      saveLocalStore(store);
      return { success: true, message: 'Password changed successfully.' };
    }
  },

  async deleteTeacher(teacherId) {
    try {
      const res = await fetch(`/api/admin/teachers/${teacherId}`, { method: 'DELETE' });
      if (res.ok) return await res.json();
    } catch {}
    const store = getLocalStore();
    store.teachers = (store.teachers || []).filter(t => t.id !== teacherId && t.username !== teacherId);
    saveLocalStore(store);
    return { success: true };
  },

  // Add Student
  async addStudent(student) {
    try {
      const res = await fetch('/api/students', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(student)
      });
      if (res.ok) return await res.json();
    } catch {}
    const store = getLocalStore();
    student.id = student.id || student.rollNo;
    student.password = student.password || 'student123';
    store.students.unshift(student);
    saveLocalStore(store);
    return { success: true, student };
  },

  // Update Student
  async updateStudent(id, updates) {
    try {
      const res = await fetch(`/api/students/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
      if (res.ok) return await res.json();
    } catch {}
    const store = getLocalStore();
    const idx = store.students.findIndex(s => s.id === id || s.rollNo === id);
    if (idx !== -1) {
      store.students[idx] = { ...store.students[idx], ...updates };
      saveLocalStore(store);
      return { success: true, student: store.students[idx] };
    }
    throw new Error('Student not found');
  },

  // Delete Student
  async deleteStudent(id) {
    try {
      const res = await fetch(`/api/students/${id}`, { method: 'DELETE' });
      if (res.ok) return await res.json();
    } catch {}
    const store = getLocalStore();
    store.students = store.students.filter(s => s.id !== id && s.rollNo !== id);
    saveLocalStore(store);
    return { success: true };
  },

  // Record Attendance Batch
  async recordAttendanceBatch(date, records, className = '', overrideLock = false) {
    let serverData = null;
    try {
      const res = await fetch('/api/attendance/batch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date, records, className, overrideLock })
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to record attendance');
      }
      serverData = data;
    } catch (err) {
      if (err.message && err.message.includes('locked')) {
        throw err;
      }
    }

    // Always keep browser localStore synchronized as well
    const store = getLocalStore();
    const sIds = records.map(r => r.studentId);
    store.attendanceLogs = (store.attendanceLogs || []).filter(a => !(a.date === date && sIds.includes(a.studentId)));
    const nowIso = new Date().toISOString();
    records.forEach(r => {
      store.attendanceLogs.unshift({
        date,
        studentId: r.studentId,
        status: r.status || 'Present',
        timeIn: r.timeIn || '03:30 PM',
        remarks: r.remarks || 'Standard Session',
        className: className || '',
        createdAt: nowIso,
        updatedAt: nowIso
      });
    });

    sIds.forEach(sid => {
      const logs = store.attendanceLogs.filter(a => a.studentId === sid);
      const workingDays = logs.length;
      if (workingDays > 0) {
        const pCount = logs.filter(a => a.status === 'Present').length;
        const lCount = logs.filter(a => a.status === 'Late').length;
        const attendedDays = pCount + (lCount * 0.5);
        const calculated = Math.round((attendedDays / workingDays) * 100);
        const idx = store.students.findIndex(s => s.id === sid);
        if (idx !== -1) {
          store.students[idx].workingDays = workingDays;
          store.students[idx].totalClassesHeld = workingDays;
          store.students[idx].attendedDays = attendedDays;
          store.students[idx].totalClassesAttended = attendedDays;
          store.students[idx].attendancePercentage = calculated;
        }
      }
    });

    saveLocalStore(store);
    return serverData || { success: true, message: `Updated attendance for ${records.length} students` };
  },

  // Fetch Live Student Session (Real-Time Synchronizer for Student Portal)
  async getStudentSession(studentId) {
    try {
      const res = await fetch(`/api/student/${encodeURIComponent(studentId)}/session?t=${Date.now()}`, {
        cache: 'no-store'
      });
      if (res.ok) {
        const data = await res.json();
        return data;
      }
    } catch (err) {
      console.warn('Network sync failed, falling back to local store', err);
    }

    // Fallback using local store
    const store = getLocalStore();
    const target = (studentId || '').toString().toLowerCase();
    const student = (store.students || []).find(s => 
      (s.id && s.id.toString().toLowerCase() === target) ||
      (s.rollNo && s.rollNo.toString().toLowerCase() === target) ||
      (s.name && s.name.toString().toLowerCase() === target)
    );

    if (!student) return null;

    const studentAttendance = (store.attendanceLogs || []).filter(a => {
      if (!a.studentId) return false;
      const aId = a.studentId.toString().toLowerCase();
      return aId === (student.id || '').toString().toLowerCase() ||
             aId === (student.rollNo || '').toString().toLowerCase();
    });

    const totalClasses = studentAttendance.length;
    const presentCount = studentAttendance.filter(a => a.status === 'Present').length;
    const lateCount = studentAttendance.filter(a => a.status === 'Late').length;
    const absentCount = studentAttendance.filter(a => a.status === 'Absent').length;
    const attendedDays = presentCount + (lateCount * 0.5);
    const percentage = totalClasses > 0 ? Number(((attendedDays / totalClasses) * 100).toFixed(1)) : 0;

    const studentTests = [];
    (store.tests || []).forEach(t => {
      const r = (t.results || []).find(res => 
        res.studentId === student.id || res.studentId === student.rollNo
      );
      if (r) studentTests.push({ ...t, ...r });
    });

    const { password: _p, ...safeStudent } = student;

    return {
      success: true,
      role: 'student',
      student: {
        ...safeStudent,
        attendancePercentage: percentage,
        workingDays: totalClasses,
        attendedDays
      },
      attendance: {
        percentage,
        totalClasses,
        presentCount,
        lateCount,
        absentCount,
        attendedDays,
        workingDays: totalClasses,
        logs: studentAttendance
      },
      tests: studentTests,
      notices: store.notices || [],
      instituteInfo: store.instituteInfo || {}
    };
  },

  // Get All Offline Tests
  async getTests(grade = null) {
    try {
      const url = grade && grade !== 'All' ? `/api/tests?grade=${encodeURIComponent(grade)}&t=${Date.now()}` : `/api/tests?t=${Date.now()}`;
      const res = await fetch(url, { cache: 'no-store' });
      if (res.ok) return await res.json();
    } catch (err) {
      console.warn('Failed to fetch tests from API:', err);
    }
    const store = getLocalStore();
    return store.tests || [];
  },

  // Add Test with Marks & Uploaded Sheets
  async addTest(test) {
    try {
      const res = await fetch('/api/tests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(test)
      });
      if (res.ok) return await res.json();
    } catch {}
    const store = getLocalStore();
    test.id = test.id || `TST-${Date.now().toString().slice(-4)}`;
    store.tests = store.tests || [];
    store.tests.unshift(test);

    (test.results || []).forEach(r => {
      const sIdx = store.students.findIndex(s => s.id === r.studentId);
      if (sIdx !== -1) {
        let sum = 0, cnt = 0;
        store.tests.forEach(t => {
          const match = (t.results || []).find(x => x.studentId === r.studentId);
          if (match) {
            sum += Number(match.percentage || (match.marksObtained / t.maxMarks) * 100);
            cnt++;
          }
        });
        if (cnt > 0) {
          store.students[sIdx].overallPercentage = Number((sum / cnt).toFixed(1));
        }
      }
    });

    saveLocalStore(store);
    return { success: true, test };
  },

  // Update Test with Marks & Uploaded Sheets
  async updateTest(id, updates) {
    try {
      const res = await fetch(`/api/tests/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
      if (res.ok) return await res.json();
    } catch (err) {
      console.warn('Failed to update test on API:', err);
    }
    const store = getLocalStore();
    store.tests = Array.isArray(store.tests) ? store.tests : [];
    const idx = store.tests.findIndex(t => t.id === id);
    if (idx !== -1) {
      store.tests[idx] = { ...store.tests[idx], ...updates };
      saveLocalStore(store);
      return { success: true, test: store.tests[idx] };
    } else {
      const newEntry = { id, ...updates };
      store.tests.unshift(newEntry);
      saveLocalStore(store);
      return { success: true, test: newEntry };
    }
  },

  // Delete Test
  async deleteTest(id) {
    try {
      const res = await fetch(`/api/tests/${id}`, { method: 'DELETE' });
      if (res.ok) return await res.json();
    } catch (err) {
      console.warn('Failed to delete test on API:', err);
    }
    const store = getLocalStore();
    store.tests = (store.tests || []).filter(t => t.id !== id);
    saveLocalStore(store);
    return { success: true };
  },

  // Add Notice
  async addNotice(notice) {
    try {
      const res = await fetch('/api/notices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(notice)
      });
      if (res.ok) return await res.json();
    } catch {}
    const store = getLocalStore();
    notice.id = notice.id || `NTC-${Date.now().toString().slice(-4)}`;
    store.notices = store.notices || [];
    store.notices.unshift(notice);
    saveLocalStore(store);
    return { success: true, notice };
  },

  // Delete Notice
  async deleteNotice(id) {
    try {
      const res = await fetch(`/api/notices/${id}`, { method: 'DELETE' });
      if (res.ok) return await res.json();
    } catch {}
    const store = getLocalStore();
    store.notices = (store.notices || []).filter(n => n.id !== id);
    saveLocalStore(store);
    return { success: true };
  },

  // Update Notice
  async updateNotice(id, updatedNotice) {
    try {
      const res = await fetch(`/api/notices/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedNotice)
      });
      if (res.ok) return await res.json();
    } catch {}
    const store = getLocalStore();
    const idx = (store.notices || []).findIndex(n => n.id === id);
    if (idx !== -1) {
      store.notices[idx] = { ...store.notices[idx], ...updatedNotice, id };
      saveLocalStore(store);
      return { success: true, notice: store.notices[idx] };
    }
    return { success: false, error: 'Notice not found' };
  },

  // ASSIGNMENTS API
  async getAssignments(params = {}) {
    const query = new URLSearchParams();
    if (params.grade) query.append('grade', params.grade);
    query.append('t', Date.now());
    try {
      const res = await fetch(`/api/assignments?${query.toString()}`, { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        return Array.isArray(data) ? data : [];
      }
    } catch {}
    const store = getLocalStore();
    let list = store.assignments || [];
    if (params.grade && params.grade !== 'All' && params.grade !== 'All Classes') {
      list = list.filter(a => !a.grade || a.grade === 'All Classes' || a.grade.toLowerCase() === params.grade.toLowerCase());
    }
    return list;
  },

  async addAssignment(assignment) {
    try {
      const res = await fetch('/api/assignments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(assignment)
      });
      if (res.ok) return await res.json();
    } catch {}
    const store = getLocalStore();
    assignment.id = assignment.id || `ASG-${Date.now().toString().slice(-4)}`;
    assignment.createdAt = new Date().toISOString();
    assignment.submissions = assignment.submissions || [];
    store.assignments = store.assignments || [];
    store.assignments.unshift(assignment);
    saveLocalStore(store);
    return { success: true, assignment };
  },

  async updateAssignment(id, updates) {
    try {
      const res = await fetch(`/api/assignments/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
      if (res.ok) return await res.json();
    } catch {}
    const store = getLocalStore();
    const idx = (store.assignments || []).findIndex(a => a.id === id);
    if (idx !== -1) {
      store.assignments[idx] = { ...store.assignments[idx], ...updates, id };
      saveLocalStore(store);
      return { success: true, assignment: store.assignments[idx] };
    }
    return { success: false, error: 'Assignment not found' };
  },

  async deleteAssignment(id) {
    try {
      const res = await fetch(`/api/assignments/${id}`, { method: 'DELETE' });
      if (res.ok) return await res.json();
    } catch {}
    const store = getLocalStore();
    store.assignments = (store.assignments || []).filter(a => a.id !== id);
    saveLocalStore(store);
    return { success: true };
  },

  async deleteAssignmentPhoto(id, photoIndex) {
    try {
      const res = await fetch(`/api/assignments/${id}/photos/${photoIndex}`, { method: 'DELETE' });
      if (res.ok) return await res.json();
    } catch {}
    const store = getLocalStore();
    const idx = (store.assignments || []).findIndex(a => a.id === id);
    if (idx !== -1 && store.assignments[idx].photos) {
      store.assignments[idx].photos.splice(photoIndex, 1);
      saveLocalStore(store);
      return { success: true, photos: store.assignments[idx].photos };
    }
    return { success: false, error: 'Photo not found' };
  },

  async submitAssignmentAnswer(assignmentId, submissionData) {
    try {
      const res = await fetch(`/api/assignments/${assignmentId}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submissionData)
      });
      if (res.ok) return await res.json();
    } catch {}
    const store = getLocalStore();
    const idx = (store.assignments || []).findIndex(a => a.id === assignmentId);
    if (idx !== -1) {
      const asg = store.assignments[idx];
      asg.submissions = asg.submissions || [];
      const sIdx = asg.submissions.findIndex(s => s.studentId === submissionData.studentId);
      const sub = {
        id: sIdx !== -1 ? asg.submissions[sIdx].id : `SUB-${Date.now().toString().slice(-4)}`,
        assignmentId,
        ...submissionData,
        submittedAt: new Date().toISOString(),
        status: 'Submitted'
      };
      if (sIdx !== -1) asg.submissions[sIdx] = sub;
      else asg.submissions.push(sub);
      saveLocalStore(store);
      return { success: true, submission: sub };
    }
    throw new Error('Assignment not found');
  },

  async gradeAssignmentSubmission(assignmentId, subId, gradeData) {
    try {
      const res = await fetch(`/api/assignments/${assignmentId}/submissions/${subId}/grade`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(gradeData)
      });
      if (res.ok) return await res.json();
    } catch {}
    const store = getLocalStore();
    const aIdx = (store.assignments || []).findIndex(a => a.id === assignmentId);
    if (aIdx !== -1) {
      const sIdx = (store.assignments[aIdx].submissions || []).findIndex(s => s.id === subId);
      if (sIdx !== -1) {
        store.assignments[aIdx].submissions[sIdx] = {
          ...store.assignments[aIdx].submissions[sIdx],
          ...gradeData,
          status: gradeData.status || 'Reviewed'
        };
        saveLocalStore(store);
        return { success: true, submission: store.assignments[aIdx].submissions[sIdx] };
      }
    }
    throw new Error('Submission not found');
  },

  // RECORDED LECTURES & HIGH-CAPACITY VIDEO API
  async getLectures(params = {}) {
    const query = new URLSearchParams();
    if (params.grade) query.append('grade', params.grade);
    query.append('t', Date.now());
    try {
      const res = await fetch(`/api/lectures?${query.toString()}`, { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        return Array.isArray(data) ? data : [];
      }
    } catch {}
    const store = getLocalStore();
    let list = store.lectures || [];
    if (params.grade && params.grade !== 'All' && params.grade !== 'All Classes') {
      list = list.filter(l => !l.grade || l.grade === 'All Classes' || l.grade.toLowerCase() === params.grade.toLowerCase());
    }
    return list;
  },

  async addLecture(lecture) {
    try {
      const res = await fetch('/api/lectures', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(lecture)
      });
      if (res.ok) return await res.json();
    } catch {}
    const store = getLocalStore();
    lecture.id = lecture.id || `LEC-${Date.now().toString().slice(-4)}`;
    lecture.createdAt = new Date().toISOString();
    lecture.views = 0;
    store.lectures = store.lectures || [];
    store.lectures.unshift(lecture);
    saveLocalStore(store);
    return { success: true, lecture };
  },

  async updateLecture(id, updates) {
    try {
      const res = await fetch(`/api/lectures/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
      if (res.ok) return await res.json();
    } catch {}
    const store = getLocalStore();
    const idx = (store.lectures || []).findIndex(l => l.id === id);
    if (idx !== -1) {
      store.lectures[idx] = { ...store.lectures[idx], ...updates, id };
      saveLocalStore(store);
      return { success: true, lecture: store.lectures[idx] };
    }
    return { success: false, error: 'Lecture not found' };
  },

  async deleteLecture(id) {
    try {
      const res = await fetch(`/api/lectures/${id}`, { method: 'DELETE' });
      if (res.ok) return await res.json();
    } catch {}
    const store = getLocalStore();
    store.lectures = (store.lectures || []).filter(l => l.id !== id);
    saveLocalStore(store);
    return { success: true };
  },

  // Stream video upload for 5-10 GB video files with live progress callback
  uploadLectureVideo(lectureId, file, onProgress) {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open('POST', `/api/lectures/${lectureId}/video`, true);
      xhr.setRequestHeader('Content-Type', 'application/octet-stream');
      xhr.setRequestHeader('x-filename', file.name || 'video.mp4');

      if (xhr.upload && onProgress) {
        xhr.upload.onprogress = (event) => {
          if (event.lengthComputable) {
            const percent = Math.round((event.loaded / event.total) * 100);
            onProgress({
              percent,
              loadedBytes: event.loaded,
              totalBytes: event.total
            });
          }
        };
      }

      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const res = JSON.parse(xhr.responseText);
            resolve(res);
          } catch (e) {
            resolve({ success: true, message: 'Upload completed' });
          }
        } else {
          reject(new Error(`Video upload failed with status ${xhr.status}`));
        }
      };

      xhr.onerror = () => {
        reject(new Error('Network error during video upload.'));
      };

      xhr.send(file);
    });
  },

  async incrementLectureView(id) {
    try {
      await fetch(`/api/lectures/${id}/view`, { method: 'POST' });
    } catch {}
  },

  // ONLINE MCQ OLYMPIAD TESTS API (UPCOMING, ACTIVE, COMPLETED, MISSED)
  async getOnlineTests(params = {}) {
    const query = new URLSearchParams();
    if (params.grade) query.append('grade', params.grade);
    query.append('t', Date.now());
    try {
      const res = await fetch(`/api/online-tests?${query.toString()}`, { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        return Array.isArray(data) ? data : [];
      }
    } catch {}
    const store = getLocalStore();
    let list = store.onlineTests || [];
    if (params.grade && params.grade !== 'All' && params.grade !== 'All Classes') {
      list = list.filter(t => !t.grade || t.grade === 'All Classes' || t.grade.toLowerCase() === params.grade.toLowerCase());
    }
    return list;
  },

  async addOnlineTest(test) {
    try {
      const res = await fetch('/api/online-tests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(test)
      });
      if (res.ok) return await res.json();
    } catch {}
    const store = getLocalStore();
    test.id = test.id || `MCQ-${Date.now().toString().slice(-4)}`;
    test.createdAt = new Date().toISOString();
    test.attempts = test.attempts || [];
    store.onlineTests = store.onlineTests || [];
    store.onlineTests.unshift(test);
    saveLocalStore(store);
    return { success: true, test };
  },

  async updateOnlineTest(id, updates) {
    try {
      const res = await fetch(`/api/online-tests/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
      if (res.ok) return await res.json();
    } catch {}
    const store = getLocalStore();
    const idx = (store.onlineTests || []).findIndex(t => t.id === id);
    if (idx !== -1) {
      store.onlineTests[idx] = { ...store.onlineTests[idx], ...updates, id };
      saveLocalStore(store);
      return { success: true, test: store.onlineTests[idx] };
    }
    return { success: false, error: 'Test not found' };
  },

  async deleteOnlineTest(id) {
    try {
      const res = await fetch(`/api/online-tests/${id}`, { method: 'DELETE' });
      if (res.ok) return await res.json();
    } catch {}
    const store = getLocalStore();
    store.onlineTests = (store.onlineTests || []).filter(t => t.id !== id);
    saveLocalStore(store);
    return { success: true };
  },

  async submitOnlineTestAttempt(testId, attemptData) {
    try {
      const res = await fetch(`/api/online-tests/${testId}/attempt`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(attemptData)
      });
      if (res.ok) return await res.json();
    } catch {}
    const store = getLocalStore();
    const tIdx = (store.onlineTests || []).findIndex(t => t.id === testId);
    if (tIdx !== -1) {
      const test = store.onlineTests[tIdx];
      test.attempts = test.attempts || [];
      const attempt = {
        id: `ATT-${Date.now().toString().slice(-4)}`,
        testId,
        ...attemptData,
        submittedAt: new Date().toISOString()
      };
      if (!attemptData.isPractice) {
        test.attempts.unshift(attempt);
      }
      saveLocalStore(store);
      return { success: true, attempt };
    }
    throw new Error('Test not found');
  },

  // Submit Enquiry
  async submitEnquiry(enquiry) {
    try {
      const res = await fetch('/api/enquiry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(enquiry)
      });
      if (res.ok) return await res.json();
    } catch {}
    const store = getLocalStore();
    store.enquiries = store.enquiries || [];
    enquiry.id = `ENQ-${Date.now().toString().slice(-4)}`;
    enquiry.timestamp = new Date().toISOString();
    store.enquiries.unshift(enquiry);
    saveLocalStore(store);
    return { success: true, enquiryId: enquiry.id };
  },

  // Get all enquiries / queries
  async getEnquiries() {
    try {
      const res = await fetch(`/api/enquiries?t=${Date.now()}`, { cache: 'no-store' });
      if (res.ok) {
        const json = await res.json();
        return json.enquiries || [];
      }
    } catch (e) {
      console.warn('Backend fetch failed for enquiries', e);
    }
    const store = getLocalStore();
    return store.enquiries || [];
  },

  async updateEnquiry(id, updates) {
    try {
      const res = await fetch(`/api/enquiries/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn('Update enquiry failed', e);
    }
    const store = getLocalStore();
    const idx = (store.enquiries || []).findIndex(e => e.id === id);
    if (idx !== -1) {
      store.enquiries[idx] = { ...store.enquiries[idx], ...updates };
      saveLocalStore(store);
      return { success: true, enquiry: store.enquiries[idx] };
    }
    return { success: false };
  },

  async deleteEnquiry(id) {
    try {
      const res = await fetch(`/api/enquiries/${id}`, { method: 'DELETE' });
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn('Delete enquiry failed', e);
    }
    const store = getLocalStore();
    store.enquiries = (store.enquiries || []).filter(e => e.id !== id);
    saveLocalStore(store);
    return { success: true };
  },

  // Student Doubts Counter & Desk
  async getDoubts() {
    try {
      const res = await fetch(`/api/doubts?t=${Date.now()}`, { cache: 'no-store' });
      if (res.ok) {
        const json = await res.json();
        return json.doubts || [];
      }
    } catch (e) {
      console.warn('Backend fetch failed for doubts', e);
    }
    const store = getLocalStore();
    return store.doubts || initialData.doubts || [];
  },

  async createDoubt(doubtData) {
    try {
      const res = await fetch('/api/doubts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(doubtData)
      });
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn('Create doubt failed', e);
    }
    const store = getLocalStore();
    store.doubts = store.doubts || initialData.doubts || [];
    const newDoubt = {
      id: `DBT-${Date.now().toString().slice(-4)}`,
      ...doubtData,
      date: new Date().toISOString().split('T')[0]
    };
    store.doubts.unshift(newDoubt);
    saveLocalStore(store);
    return { success: true, doubt: newDoubt };
  },

  async updateDoubt(id, updates) {
    try {
      const res = await fetch(`/api/doubts/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn('Update doubt failed', e);
    }
    const store = getLocalStore();
    store.doubts = store.doubts || initialData.doubts || [];
    const idx = store.doubts.findIndex(d => d.id === id);
    if (idx !== -1) {
      store.doubts[idx] = { ...store.doubts[idx], ...updates };
      saveLocalStore(store);
      return { success: true, doubt: store.doubts[idx] };
    }
    return { success: false };
  },

  async deleteDoubt(id) {
    try {
      const res = await fetch(`/api/doubts/${id}`, { method: 'DELETE' });
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn('Delete doubt failed', e);
    }
    const store = getLocalStore();
    store.doubts = (store.doubts || initialData.doubts || []).filter(d => d.id !== id);
    saveLocalStore(store);
    return { success: true };
  },

  // Executive Summary (Queries, Doubts, Members snapshot)
  async getExecutiveSummary() {
    try {
      const res = await fetch(`/api/overview/executive-summary?t=${Date.now()}`, { cache: 'no-store' });
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn('Executive summary fetch failed', e);
    }
    return null;
  },

  // Submit GTSE Registration (Saves to server Excel register)
  async submitGTSERegistration(regData) {
    try {
      const res = await fetch('/api/gtse-registration', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(regData)
      });
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn('Backend offline, saving locally', e);
    }
    const store = getLocalStore();
    store.gtseRegistrations = store.gtseRegistrations || [];
    regData.id = `GTSE-${Date.now().toString().slice(-6)}`;
    regData.timestamp = new Date().toLocaleString('en-IN');
    store.gtseRegistrations.unshift(regData);
    saveLocalStore(store);
    return { success: true, registrationId: regData.id, local: true };
  },

  // Get GTSE Registrations (For Admin Portal Only)
  async getGTSERegistrations() {
    try {
      const res = await fetch(`/api/gtse-registrations?t=${Date.now()}`, { cache: 'no-store' });
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn('Backend fetch failed', e);
    }
    const store = getLocalStore();
    return store.gtseRegistrations || [];
  },

  // Student Categorized Records Vault (Admissions, GTSE/GST, Queries by Class)
  async getRecordsOverview() {
    try {
      const res = await fetch(`/api/records/overview?t=${Date.now()}`, { cache: 'no-store' });
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn('Records overview fetch failed', e);
    }
    return { success: false, categories: [] };
  },

  async openRecordsFolder(category = '', className = '') {
    try {
      const res = await fetch('/api/records/open-folder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ category, className })
      });
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn('Open records folder failed', e);
    }
    return { success: false };
  },

  downloadRecordFileUrl(relPath) {
    return `/api/records/download-file?relPath=${encodeURIComponent(relPath)}`;
  },

  // Results Group Photo API
  async getResultsPhoto() {
    try {
      const res = await fetch(`/api/results-photo?t=${Date.now()}`, { cache: 'no-store' });
      if (res.ok) return await res.json();
    } catch {}
    const store = getLocalStore();
    return store.resultsPhoto || initialData.resultsPhoto;
  },

  async updateResultsPhoto(photoData) {
    try {
      const res = await fetch('/api/admin/results-photo', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(photoData)
      });
      if (res.ok) {
        const json = await res.json();
        const store = getLocalStore();
        store.resultsPhoto = json.resultsPhoto;
        saveLocalStore(store);
        broadcastChange('gcc_results_photo_updated', json.resultsPhoto);
        return json;
      }
    } catch {}
    const store = getLocalStore();
    store.resultsPhoto = { ...(store.resultsPhoto || initialData.resultsPhoto), ...photoData };
    saveLocalStore(store);
    broadcastChange('gcc_results_photo_updated', store.resultsPhoto);
    return { success: true, resultsPhoto: store.resultsPhoto };
  },

  // ==========================================
  // Shining Stars (Topper Showcase) API
  // ==========================================
  async getShiningStars() {
    try {
      const res = await fetch(`/api/shining-stars?t=${Date.now()}`, { cache: 'no-store' });
      if (res.ok) return await res.json();
    } catch {}
    const store = getLocalStore();
    return store.shiningStars || initialData.shiningStars || [];
  },

  async addShiningStar(star) {
    try {
      const res = await fetch('/api/admin/shining-stars', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(star)
      });
      if (res.ok) {
        const json = await res.json();
        const store = getLocalStore();
        store.shiningStars = json.shiningStars;
        saveLocalStore(store);
        broadcastChange('gcc_shining_stars_updated', json.shiningStars);
        return json;
      }
    } catch {}
    const store = getLocalStore();
    const newStar = { ...star, id: 'star-' + Date.now() };
    store.shiningStars = [newStar, ...(store.shiningStars || initialData.shiningStars || [])];
    saveLocalStore(store);
    broadcastChange('gcc_shining_stars_updated', store.shiningStars);
    return { success: true, star: newStar, shiningStars: store.shiningStars };
  },

  async updateShiningStars(stars) {
    try {
      const res = await fetch('/api/admin/shining-stars', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(stars)
      });
      if (res.ok) {
        const json = await res.json();
        const store = getLocalStore();
        store.shiningStars = json.shiningStars;
        saveLocalStore(store);
        broadcastChange('gcc_shining_stars_updated', json.shiningStars);
        return json;
      }
    } catch {}
    const store = getLocalStore();
    store.shiningStars = stars;
    saveLocalStore(store);
    broadcastChange('gcc_shining_stars_updated', store.shiningStars);
    return { success: true, shiningStars: stars };
  },

  async deleteShiningStar(id) {
    try {
      const res = await fetch(`/api/admin/shining-stars/${id}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        const json = await res.json();
        const store = getLocalStore();
        store.shiningStars = json.shiningStars;
        saveLocalStore(store);
        broadcastChange('gcc_shining_stars_updated', json.shiningStars);
        return json;
      }
    } catch {}
    const store = getLocalStore();
    store.shiningStars = (store.shiningStars || []).filter(s => s.id !== id);
    saveLocalStore(store);
    broadcastChange('gcc_shining_stars_updated', store.shiningStars);
    return { success: true, shiningStars: store.shiningStars };
  },

  // ==========================================
  // Impact Stats API (15 Courses, 7286 Students, 25 Teachers)
  // ==========================================
  async getImpactStats() {
    try {
      const res = await fetch(`/api/impact-stats?t=${Date.now()}`, { cache: 'no-store' });
      if (res.ok) return await res.json();
    } catch {}
    const store = getLocalStore();
    return store.impactStats || initialData.impactStats || { courses: 15, students: 7286, teachers: 25 };
  },

  async updateImpactStats(stats) {
    try {
      const res = await fetch('/api/admin/impact-stats', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(stats)
      });
      if (res.ok) {
        const json = await res.json();
        const store = getLocalStore();
        store.impactStats = json.impactStats;
        saveLocalStore(store);
        broadcastChange('gcc_impact_stats_updated', json.impactStats);
        return json;
      }
    } catch {}
    const store = getLocalStore();
    store.impactStats = { ...(store.impactStats || initialData.impactStats), ...stats };
    saveLocalStore(store);
    broadcastChange('gcc_impact_stats_updated', store.impactStats);
    return { success: true, impactStats: store.impactStats };
  },

  // ==========================================
  // Features Carousel API
  // ==========================================
  async getFeatures() {
    try {
      const res = await fetch(`/api/features?t=${Date.now()}`, { cache: 'no-store' });
      if (res.ok) return await res.json();
    } catch {}
    const store = getLocalStore();
    return store.features || initialData.features || [];
  },

  async addFeature(feature) {
    try {
      const res = await fetch('/api/admin/features', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(feature)
      });
      if (res.ok) {
        const json = await res.json();
        const store = getLocalStore();
        store.features = json.features;
        saveLocalStore(store);
        broadcastChange('gcc_features_updated', json.features);
        return json;
      }
    } catch {}
    const store = getLocalStore();
    const newFeature = { ...feature, id: 'feat-' + Date.now() };
    store.features = [...(store.features || initialData.features || []), newFeature];
    saveLocalStore(store);
    broadcastChange('gcc_features_updated', store.features);
    return { success: true, feature: newFeature, features: store.features };
  },

  async updateFeatures(features) {
    try {
      const res = await fetch('/api/admin/features', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(features)
      });
      if (res.ok) {
        const json = await res.json();
        const store = getLocalStore();
        store.features = json.features;
        saveLocalStore(store);
        broadcastChange('gcc_features_updated', json.features);
        return json;
      }
    } catch {}
    const store = getLocalStore();
    store.features = features;
    saveLocalStore(store);
    broadcastChange('gcc_features_updated', store.features);
    return { success: true, features: features };
  },

  async deleteFeature(id) {
    try {
      const res = await fetch(`/api/admin/features/${id}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        const json = await res.json();
        const store = getLocalStore();
        store.features = json.features;
        saveLocalStore(store);
        broadcastChange('gcc_features_updated', json.features);
        return json;
      }
    } catch {}
    const store = getLocalStore();
    store.features = (store.features || []).filter(f => f.id !== id);
    saveLocalStore(store);
    broadcastChange('gcc_features_updated', store.features);
    return { success: true, features: store.features };
  },

  // ==========================================
  // Explore Courses API
  // ==========================================
  async getExploreCourses() {
    try {
      const res = await fetch(`/api/explore-courses?t=${Date.now()}`, { cache: 'no-store' });
      if (res.ok) return await res.json();
    } catch {}
    const store = getLocalStore();
    return store.exploreCourses || initialData.exploreCourses || [];
  },

  async addExploreCourse(course) {
    try {
      const res = await fetch('/api/admin/explore-courses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(course)
      });
      if (res.ok) {
        const json = await res.json();
        const store = getLocalStore();
        store.exploreCourses = json.exploreCourses;
        saveLocalStore(store);
        broadcastChange('gcc_explore_courses_updated', json.exploreCourses);
        return json;
      }
    } catch {}
    const store = getLocalStore();
    const newCourse = { ...course, id: 'course-' + Date.now() };
    store.exploreCourses = [...(store.exploreCourses || initialData.exploreCourses || []), newCourse];
    saveLocalStore(store);
    broadcastChange('gcc_explore_courses_updated', store.exploreCourses);
    return { success: true, course: newCourse, exploreCourses: store.exploreCourses };
  },

  async updateExploreCourses(courses) {
    try {
      const res = await fetch('/api/admin/explore-courses', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(courses)
      });
      if (res.ok) {
        const json = await res.json();
        const store = getLocalStore();
        store.exploreCourses = json.exploreCourses;
        saveLocalStore(store);
        broadcastChange('gcc_explore_courses_updated', json.exploreCourses);
        return json;
      }
    } catch {}
    const store = getLocalStore();
    store.exploreCourses = courses;
    saveLocalStore(store);
    broadcastChange('gcc_explore_courses_updated', store.exploreCourses);
    return { success: true, exploreCourses: courses };
  },

  async deleteExploreCourse(id) {
    try {
      const res = await fetch(`/api/admin/explore-courses/${id}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        const json = await res.json();
        const store = getLocalStore();
        store.exploreCourses = json.exploreCourses;
        saveLocalStore(store);
        broadcastChange('gcc_explore_courses_updated', json.exploreCourses);
        return json;
      }
    } catch {}
    const store = getLocalStore();
    store.exploreCourses = (store.exploreCourses || []).filter(c => c.id !== id);
    saveLocalStore(store);
    broadcastChange('gcc_explore_courses_updated', store.exploreCourses);
    return { success: true, exploreCourses: store.exploreCourses };
  },

  // Directors Management API
  async getDirectors() {
    try {
      const res = await fetch(`/api/directors?t=${Date.now()}`, { cache: 'no-store' });
      if (res.ok) {
        const list = await res.json();
        return Array.isArray(list) ? list : [];
      }
    } catch {}
    const store = getLocalStore();
    return Array.isArray(store.directors) ? store.directors : [];
  },

  async addDirector(director) {
    try {
      const res = await fetch('/api/admin/directors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(director)
      });
      if (res.ok) {
        const json = await res.json();
        const store = getLocalStore();
        store.directors = json.directors;
        saveLocalStore(store);
        broadcastChange('gcc_directors_updated', json.directors);
        return json;
      }
    } catch {}
    const store = getLocalStore();
    const newDir = { ...director, id: 'dir-' + Date.now() };
    store.directors = [...(store.directors || []), newDir];
    saveLocalStore(store);
    broadcastChange('gcc_directors_updated', store.directors);
    return { success: true, director: newDir, directors: store.directors };
  },

  async updateDirectors(directors) {
    try {
      const res = await fetch('/api/admin/directors', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(directors)
      });
      if (res.ok) {
        const json = await res.json();
        const store = getLocalStore();
        store.directors = json.directors;
        saveLocalStore(store);
        broadcastChange('gcc_directors_updated', json.directors);
        return json;
      }
    } catch {}
    const store = getLocalStore();
    store.directors = directors;
    saveLocalStore(store);
    broadcastChange('gcc_directors_updated', store.directors);
    return { success: true, directors };
  },

  async deleteDirector(id) {
    try {
      const res = await fetch(`/api/admin/directors/${id}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        const json = await res.json();
        const store = getLocalStore();
        store.directors = json.directors;
        saveLocalStore(store);
        broadcastChange('gcc_directors_updated', json.directors);
        return json;
      }
    } catch {}
    const store = getLocalStore();
    store.directors = (store.directors || []).filter(d => d.id !== id);
    saveLocalStore(store);
    broadcastChange('gcc_directors_updated', store.directors);
    return { success: true, directors: store.directors };
  },

  // Latest News & Events Management API
  async getNewsEvents() {
    try {
      const res = await fetch(`/api/news-events?t=${Date.now()}`, { cache: 'no-store' });
      if (res.ok) {
        const list = await res.json();
        return Array.isArray(list) ? list : [];
      }
    } catch {}
    const store = getLocalStore();
    return Array.isArray(store.newsEvents) ? store.newsEvents : (initialData.newsEvents || []);
  },

  async addNewsEvent(item) {
    try {
      const res = await fetch('/api/admin/news-events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(item)
      });
      if (res.ok) {
        const json = await res.json();
        const store = getLocalStore();
        store.newsEvents = json.newsEvents;
        saveLocalStore(store);
        broadcastChange('gcc_news_events_updated', json.newsEvents);
        return json;
      }
    } catch {}
    const store = getLocalStore();
    const newItem = { ...item, id: 'news-' + Date.now() };
    store.newsEvents = [newItem, ...(store.newsEvents || [])];
    saveLocalStore(store);
    broadcastChange('gcc_news_events_updated', store.newsEvents);
    return { success: true, item: newItem, newsEvents: store.newsEvents };
  },

  async updateNewsEvents(items) {
    try {
      const res = await fetch('/api/admin/news-events', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(items)
      });
      if (res.ok) {
        const json = await res.json();
        const store = getLocalStore();
        store.newsEvents = json.newsEvents;
        saveLocalStore(store);
        broadcastChange('gcc_news_events_updated', json.newsEvents);
        return json;
      }
    } catch {}
    const store = getLocalStore();
    store.newsEvents = items;
    saveLocalStore(store);
    broadcastChange('gcc_news_events_updated', store.newsEvents);
    return { success: true, newsEvents: items };
  },

  async deleteNewsEvent(id) {
    try {
      const res = await fetch(`/api/admin/news-events/${id}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        const json = await res.json();
        const store = getLocalStore();
        store.newsEvents = json.newsEvents;
        saveLocalStore(store);
        broadcastChange('gcc_news_events_updated', json.newsEvents);
        return json;
      }
    } catch {}
    const store = getLocalStore();
    store.newsEvents = (store.newsEvents || []).filter(item => item.id !== id);
    saveLocalStore(store);
    broadcastChange('gcc_news_events_updated', store.newsEvents);
    return { success: true, newsEvents: store.newsEvents };
  },

  // ==========================================
  // CENTERS & BRANCHES MANAGEMENT (WITH LIVE GOOGLE MAPS)
  // ==========================================
  async getCenters() {
    try {
      const res = await fetch(`/api/centers?t=${Date.now()}`, { cache: 'no-store' });
      if (res.ok) {
        const list = await res.json();
        return Array.isArray(list) ? list : [];
      }
    } catch {}
    const store = getLocalStore();
    return Array.isArray(store.centers) ? store.centers : (initialData.centers || []);
  },

  async addCenter(centerData) {
    try {
      const res = await fetch('/api/admin/centers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(centerData)
      });
      if (res.ok) {
        const json = await res.json();
        const store = getLocalStore();
        store.centers = json.centers;
        saveLocalStore(store);
        broadcastChange('gcc_centers_updated', json.centers);
        return json;
      }
    } catch {}
    const store = getLocalStore();
    if (!Array.isArray(store.centers)) store.centers = [];
    const newCenter = {
      ...centerData,
      id: 'center-' + Date.now()
    };
    store.centers.push(newCenter);
    saveLocalStore(store);
    broadcastChange('gcc_centers_updated', store.centers);
    return { success: true, center: newCenter, centers: store.centers };
  },

  async updateCenter(id, centerData) {
    try {
      const res = await fetch(`/api/admin/centers/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(centerData)
      });
      if (res.ok) {
        const json = await res.json();
        const store = getLocalStore();
        store.centers = json.centers;
        saveLocalStore(store);
        broadcastChange('gcc_centers_updated', json.centers);
        return json;
      }
    } catch {}
    const store = getLocalStore();
    if (!Array.isArray(store.centers)) store.centers = [];
    const idx = store.centers.findIndex(c => c.id === id);
    if (idx !== -1) {
      store.centers[idx] = { ...store.centers[idx], ...centerData, id };
    }
    saveLocalStore(store);
    broadcastChange('gcc_centers_updated', store.centers);
    return { success: true, centers: store.centers };
  },

  async saveCenters(centers) {
    try {
      const res = await fetch('/api/admin/centers', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(centers)
      });
      if (res.ok) {
        const json = await res.json();
        const store = getLocalStore();
        store.centers = json.centers;
        saveLocalStore(store);
        broadcastChange('gcc_centers_updated', json.centers);
        return json;
      }
    } catch {}
    const store = getLocalStore();
    store.centers = centers;
    saveLocalStore(store);
    broadcastChange('gcc_centers_updated', store.centers);
    return { success: true, centers };
  },

  async deleteCenter(id) {
    try {
      const res = await fetch(`/api/admin/centers/${id}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        const json = await res.json();
        const store = getLocalStore();
        store.centers = json.centers;
        saveLocalStore(store);
        broadcastChange('gcc_centers_updated', json.centers);
        return json;
      }
    } catch {}
    const store = getLocalStore();
    store.centers = (store.centers || []).filter(c => c.id !== id);
    saveLocalStore(store);
    broadcastChange('gcc_centers_updated', store.centers);
    return { success: true, centers: store.centers };
  },

  // Reset to initial demo data
  async resetData() {
    try {
      const res = await fetch('/api/reset-data', { method: 'POST' });
      if (res.ok) {
        const json = await res.json();
        saveLocalStore(json.data);
        return json;
      }
    } catch {}
    saveLocalStore(initialData);
    return { success: true, data: initialData };
  }
};

export const apiClient = api;
export default api;
