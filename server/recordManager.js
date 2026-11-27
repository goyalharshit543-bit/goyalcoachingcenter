import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import XLSX from 'xlsx';
import { exportClassHierarchies } from '../scripts/exportClassHierarchies.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Primary records directories (both in root for easy user access, and inside server)
export const PROJECT_ROOT_RECORDS = path.resolve(__dirname, '..', 'records');
export const SERVER_RECORDS = path.resolve(__dirname, 'records');

const TARGET_DIRS = [PROJECT_ROOT_RECORDS, SERVER_RECORDS];

export const CATEGORIES = {
  ENROLLED: 'Enrolled_Students',
  GTSE: 'GTSE_Talent_Search_Exam',
  ADMISSIONS: 'Admissions_Applications',
  QUERIES: 'Queries_And_Contact',
  MARKS: 'Examination_Marks_And_Reports'
};

export const STANDARD_CLASSES = [
  'Class_7th',
  'Class_8th',
  'Class_9th',
  'Class_10th',
  'Class_11th_Commerce',
  'Class_12th_Commerce',
  'General'
];

/**
 * Normalizes input string to a clean folder name
 */
export function normalizeClass(input) {
  if (!input) return 'General';
  const str = String(input).toLowerCase();
  
  if (str.includes('12') || str.includes('twelve') || str.includes('xii')) {
    return 'Class_12th_Commerce';
  }
  if (str.includes('11') || str.includes('eleven') || str.includes('xi')) {
    return 'Class_11th_Commerce';
  }
  if (str.includes('10') || str.includes('ten') || str.includes('x')) {
    return 'Class_10th';
  }
  if (str.includes('9') || str.includes('nine') || str.includes('ix')) {
    return 'Class_9th';
  }
  if (str.includes('8') || str.includes('eight') || str.includes('viii')) {
    return 'Class_8th';
  }
  if (str.includes('7') || str.includes('seven') || str.includes('vii')) {
    return 'Class_7th';
  }
  if (str.includes('6') || str.includes('six') || str.includes('vi')) {
    return 'Class_6th';
  }
  return 'General';
}

/**
 * Initializes all class folders under all categories
 */
export function initRecordsDirectories() {
  for (const baseDir of TARGET_DIRS) {
    if (!fs.existsSync(baseDir)) {
      fs.mkdirSync(baseDir, { recursive: true });
    }

    for (const catKey of Object.values(CATEGORIES)) {
      const catDir = path.join(baseDir, catKey);
      if (!fs.existsSync(catDir)) fs.mkdirSync(catDir, { recursive: true });

      for (const cls of STANDARD_CLASSES) {
        const clsDir = path.join(catDir, cls);
        const studentsDir = path.join(clsDir, 'Student_Profiles');
        if (!fs.existsSync(clsDir)) fs.mkdirSync(clsDir, { recursive: true });
        if (!fs.existsSync(studentsDir)) fs.mkdirSync(studentsDir, { recursive: true });
      }
    }
  }
}

/**
 * Helper to remove a row from an Excel file safely by matching a column value
 */
function removeRowFromExcel(filePath, sheetName, colIndex, targetVal) {
  if (!fs.existsSync(filePath)) return;
  try {
    const wb = XLSX.readFile(filePath);
    const ws = wb.Sheets[sheetName];
    if (!ws) return;
    const data = XLSX.utils.sheet_to_json(ws, { header: 1 });
    if (!Array.isArray(data) || data.length <= 1) return;
    
    const headers = data[0];
    const filteredRows = [headers];
    const targetClean = String(targetVal || '').trim().toLowerCase();
    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      const val = String(row[colIndex] || '').trim().toLowerCase();
      if (val !== targetClean) {
        filteredRows.push(row);
      }
    }
    const newWs = XLSX.utils.aoa_to_sheet(filteredRows);
    wb.Sheets[sheetName] = newWs;
    XLSX.writeFile(wb, filePath);
  } catch (err) {
    console.error(`[RecordManager] Error removing row from Excel ${filePath}:`, err.message);
  }
}

/**
 * Helper to safely upsert (update if exists, append if new) a row in an Excel file by matching a key column
 */
export function upsertRowInExcel(filePath, sheetName, headers, rowData, keyColIndex = 0) {
  try {
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

    let wb;
    let existingRows = [];
    if (fs.existsSync(filePath)) {
      try {
        wb = XLSX.readFile(filePath);
        const ws = wb.Sheets[sheetName];
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
      existingRows = [headers, rowData];
    } else {
      const targetVal = String(rowData[keyColIndex] || '').trim().toLowerCase();
      let matchIdx = -1;
      for (let i = 1; i < existingRows.length; i++) {
        const val = String(existingRows[i][keyColIndex] || '').trim().toLowerCase();
        if (val === targetVal) {
          matchIdx = i;
          break;
        }
      }
      if (matchIdx !== -1) {
        existingRows[matchIdx] = rowData;
      } else {
        existingRows.push(rowData);
      }
    }

    const newWs = XLSX.utils.aoa_to_sheet(existingRows);
    wb.Sheets[sheetName] = newWs;
    if (!wb.SheetNames.includes(sheetName)) {
      wb.SheetNames.push(sheetName);
    }

    XLSX.writeFile(wb, filePath);
  } catch (err) {
    console.error(`[RecordManager] Error writing Excel to ${filePath}:`, err.message);
  }
}

/**
 * Helper to append/upsert a row to an Excel file safely without creating duplicate rows
 */
export function appendRowToExcel(filePath, sheetName, headers, rowData, keyColIndex = 0) {
  return upsertRowInExcel(filePath, sheetName, headers, rowData, keyColIndex);
}

/**
 * Helper to append to a JSON file array
 */
function appendToJsonFile(filePath, item) {
  try {
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

    let list = [];
    if (fs.existsSync(filePath)) {
      try {
        const raw = fs.readFileSync(filePath, 'utf-8');
        list = JSON.parse(raw);
        if (!Array.isArray(list)) list = [];
      } catch {
        list = [];
      }
    }

    // avoid duplicate ID
    const existingIdx = list.findIndex(x => x.id === item.id);
    if (existingIdx >= 0) {
      list[existingIdx] = item;
    } else {
      list.unshift(item);
    }

    fs.writeFileSync(filePath, JSON.stringify(list, null, 2), 'utf-8');
  } catch (err) {
    console.error(`[RecordManager] Error writing JSON to ${filePath}:`, err.message);
  }
}

/**
 * Saves GTSE registration into class folders and master register
 */
export function recordGTSESubmission(reg) {
  initRecordsDirectories();

  const className = normalizeClass(reg.presentClass);
  const studentId = reg.id || `GTSE-${Date.now().toString().slice(-6)}`;
  const timestamp = reg.timestamp || new Date().toLocaleString('en-IN');

  const headers = [
    'Registration ID',
    'Registration Date',
    'Class',
    'Student Name',
    'Date of Birth',
    'Gender',
    "Father's / Guardian Name",
    'School Name',
    'Student Mobile',
    'Father Mobile',
    'Email Address',
    'Permanent Address',
    'City & State',
    'Declaration'
  ];

  const row = [
    studentId,
    timestamp,
    reg.presentClass || className,
    reg.name || '',
    reg.dob || '',
    reg.gender || '',
    reg.fatherName || '',
    reg.school || '',
    reg.studentNo || '',
    reg.fatherNo || '',
    reg.email || '',
    reg.address || '',
    reg.cityState || '',
    reg.declaration ? 'Accepted' : 'No'
  ];

  const textSummary = `==========================================================
GOYAL COACHING CENTER - GTSE SCHOLARSHIP REGISTRATION
==========================================================
Registration ID : ${studentId}
Submission Date : ${timestamp}
Target Class    : ${reg.presentClass || className}

STUDENT DETAILS:
----------------------------------------------------------
Student Name    : ${reg.name}
Date of Birth   : ${reg.dob}
Gender          : ${reg.gender}
School Name     : ${reg.school}
Student Mobile  : ${reg.studentNo}
Email Address   : ${reg.email || 'N/A'}

PARENT / GUARDIAN DETAILS:
----------------------------------------------------------
Father's Name   : ${reg.fatherName}
Father's Mobile : ${reg.fatherNo || 'N/A'}

RESIDENTIAL ADDRESS:
----------------------------------------------------------
Address         : ${reg.address}
City / State    : ${reg.cityState}
Declaration     : ${reg.declaration ? 'Accepted & Verified' : 'Pending'}
==========================================================
`;

  // Write across both root /records/ and server /records/
  for (const baseDir of TARGET_DIRS) {
    const catDir = path.join(baseDir, CATEGORIES.GTSE);
    const clsDir = path.join(catDir, className);

    // 1. Class Specific Excel
    const classExcelPath = path.join(clsDir, `GTSE_${className}_Registrations.xlsx`);
    appendRowToExcel(classExcelPath, className, headers, row);

    // 2. Class Specific JSON
    const classJsonPath = path.join(clsDir, `GTSE_${className}_Registrations.json`);
    appendToJsonFile(classJsonPath, { ...reg, id: studentId, timestamp, normalizedClass: className });

    // 3. Master Category Excel
    const masterExcelPath = path.join(catDir, 'All_GTSE_Master_Register.xlsx');
    appendRowToExcel(masterExcelPath, 'All_GTSE_Students', headers, row);

    // 4. Individual Student Profile
    const safeName = (reg.name || 'Student').replace(/[^a-zA-Z0-9_-]/g, '_');
    const studentProfilePath = path.join(clsDir, 'Student_Profiles', `${safeName}_${studentId}.txt`);
    fs.writeFileSync(studentProfilePath, textSummary, 'utf-8');
  }

  console.log(`[RecordManager] Successfully categorized GTSE registration for ${reg.name} under ${className}`);
  return { studentId, className };
}

/**
 * Saves Admission form submission into class folders and master register
 */
export function recordAdmissionSubmission(adm) {
  initRecordsDirectories();

  const className = normalizeClass(adm.course || adm.grade || adm.class);
  const admissionId = adm.id || `ADM-${Date.now().toString().slice(-6)}`;
  const timestamp = adm.timestamp || new Date().toLocaleString('en-IN');

  const headers = [
    'Admission ID',
    'Date & Time',
    'Target Class',
    'Course Name',
    'Student Name',
    "Parent's Name",
    'Contact Phone',
    'Email Address',
    'Preferred Branch',
    'Student Message'
  ];

  const row = [
    admissionId,
    timestamp,
    className,
    adm.course || 'Regular Admission',
    adm.name || '',
    adm.parentName || '',
    adm.phone || adm.mobile || '',
    adm.email || '',
    adm.branch || 'Bhikhi (Main Center)',
    adm.message || ''
  ];

  const textSummary = `==========================================================
GOYAL COACHING CENTER - ADMISSION APPLICATION
==========================================================
Admission ID    : ${admissionId}
Submission Date : ${timestamp}
Target Class    : ${className}
Course          : ${adm.course || 'Regular Batch Admission'}

APPLICANT DETAILS:
----------------------------------------------------------
Student Name    : ${adm.name}
Parent's Name   : ${adm.parentName || 'N/A'}
Contact Phone   : ${adm.phone || adm.mobile}
Email Address   : ${adm.email || 'N/A'}
Preferred Branch: ${adm.branch || 'Bhikhi Center'}
Requirements    : ${adm.message || 'N/A'}
==========================================================
`;

  for (const baseDir of TARGET_DIRS) {
    const catDir = path.join(baseDir, CATEGORIES.ADMISSIONS);
    const clsDir = path.join(catDir, className);

    // 1. Class Specific Excel
    const classExcelPath = path.join(clsDir, `Admissions_${className}.xlsx`);
    appendRowToExcel(classExcelPath, className, headers, row);

    // 2. Class Specific JSON
    const classJsonPath = path.join(clsDir, `Admissions_${className}.json`);
    appendToJsonFile(classJsonPath, { ...adm, id: admissionId, timestamp, normalizedClass: className });

    // 3. Master Category Excel
    const masterExcelPath = path.join(catDir, 'All_Admissions_Master_Register.xlsx');
    appendRowToExcel(masterExcelPath, 'All_Admissions', headers, row);

    // 4. Individual Student Profile
    const safeName = (adm.name || 'Applicant').replace(/[^a-zA-Z0-9_-]/g, '_');
    const studentProfilePath = path.join(clsDir, 'Student_Profiles', `${safeName}_${admissionId}.txt`);
    fs.writeFileSync(studentProfilePath, textSummary, 'utf-8');
  }

  console.log(`[RecordManager] Successfully categorized Admission for ${adm.name} under ${className}`);
  return { admissionId, className };
}

/**
 * Saves Contact / Query form submission into class folders and master register
 */
export function recordQuerySubmission(query) {
  initRecordsDirectories();

  const className = normalizeClass(query.course || query.class || query.message);
  const queryId = query.id || `ENQ-${Date.now().toString().slice(-6)}`;
  const timestamp = query.timestamp || new Date().toLocaleString('en-IN');

  const headers = [
    'Query ID',
    'Date & Time',
    'Category / Class',
    'Name',
    'Mobile Number',
    'Email Address',
    'Message / Query',
    'Source'
  ];

  const row = [
    queryId,
    timestamp,
    className,
    query.name || '',
    query.mobile || query.phone || '',
    query.email || '',
    query.message || '',
    query.source || 'Website Contact Form'
  ];

  const textSummary = `==========================================================
GOYAL COACHING CENTER - STUDENT QUERY / CONTACT REQUEST
==========================================================
Query Reference : ${queryId}
Submission Date : ${timestamp}
Classification  : ${className}

INQUIRY DETAILS:
----------------------------------------------------------
Name            : ${query.name}
Mobile Number   : ${query.mobile || query.phone}
Email Address   : ${query.email || 'N/A'}
Source          : ${query.source || 'Website Contact Form'}
Message / Query : ${query.message}
==========================================================
`;

  for (const baseDir of TARGET_DIRS) {
    const catDir = path.join(baseDir, CATEGORIES.QUERIES);
    const clsDir = path.join(catDir, className);

    // 1. Class Specific Excel
    const classExcelPath = path.join(clsDir, `Queries_${className}.xlsx`);
    appendRowToExcel(classExcelPath, className, headers, row);

    // 2. Class Specific JSON
    const classJsonPath = path.join(clsDir, `Queries_${className}.json`);
    appendToJsonFile(classJsonPath, { ...query, id: queryId, timestamp, normalizedClass: className });

    // 3. Master Category Excel
    const masterExcelPath = path.join(catDir, 'All_Queries_Master_Register.xlsx');
    appendRowToExcel(masterExcelPath, 'All_Queries', headers, row);

    // 4. Individual Profile
    const safeName = (query.name || 'User').replace(/[^a-zA-Z0-9_-]/g, '_');
    const profilePath = path.join(clsDir, 'Student_Profiles', `${safeName}_${queryId}.txt`);
    fs.writeFileSync(profilePath, textSummary, 'utf-8');
  }

  console.log(`[RecordManager] Successfully categorized Query for ${query.name} under ${className}`);
  return { queryId, className };
}

/**
 * Saves an enrolled student created in Admin Portal into their class folder & Excel master
 */
export function recordEnrolledStudent(student) {
  initRecordsDirectories();

  const className = normalizeClass(student.grade || student.batch);
  const studentId = student.id || student.rollNo;
  const rollNo = student.rollNo || studentId;
  const timestamp = student.enrollmentDate || new Date().toISOString().split('T')[0];

  const headers = [
    'Roll Number (Login ID)',
    'Student Name',
    'Login Password',
    'Class / Grade',
    'Academic Stream',
    'Batch Assigned',
    'Parent Name',
    'Parent Phone',
    'Total Fees (Rs)',
    'Paid Fees (Rs)',
    'Fee Status',
    'Enrollment Date',
    'Teacher Remarks'
  ];

  const row = [
    rollNo,
    student.name || '',
    student.password || 'student123',
    student.grade || className,
    student.stream || '',
    student.batch || '',
    student.parentName || '',
    student.parentPhone || '',
    student.fees?.total || student.totalFees || 0,
    student.fees?.paid || student.paidFees || 0,
    student.fees?.status || 'Active',
    timestamp,
    student.teacherRemarks || ''
  ];

  const textSummary = `==========================================================
GOYAL COACHING CENTER - OFFICIAL ENROLLED STUDENT DOSSIER
==========================================================
Roll Number (Login ID) : ${rollNo}
Student Full Name      : ${student.name}
Portal Login Password  : ${student.password || 'student123'}
Enrollment Date        : ${timestamp}
Enrolled Grade         : ${student.grade || className}
Academic Stream        : ${student.stream || 'N/A'}
Assigned Batch         : ${student.batch || 'N/A'}

PARENT & CONTACT DETAILS:
----------------------------------------------------------
Parent / Guardian Name : ${student.parentName || 'N/A'}
Parent Phone Number    : ${student.parentPhone || 'N/A'}
Alternate Phone        : ${student.studentPhone || 'N/A'}

FEE ACCOUNT STATUS:
----------------------------------------------------------
Total Fee Assigned     : Rs. ${student.fees?.total || student.totalFees || 0}
Amount Deposited       : Rs. ${student.fees?.paid || student.paidFees || 0}
Balance Due            : Rs. ${student.fees?.due ?? 0}
Account Clearance      : ${student.fees?.status || 'Active'}
Receipt Reference      : ${student.fees?.lastReceipt || 'N/A'}

INSTITUTIONAL NOTES:
----------------------------------------------------------
Teacher Remarks        : ${student.teacherRemarks || 'Enrolled in official GCC database.'}
==========================================================
`;

  for (const baseDir of TARGET_DIRS) {
    const catDir = path.join(baseDir, CATEGORIES.ENROLLED);
    const clsDir = path.join(catDir, className);
    const profDir = path.join(clsDir, 'Student_Profiles');

    // 1. Class Specific Excel
    const classExcelPath = path.join(clsDir, `Enrolled_${className}_Students.xlsx`);
    appendRowToExcel(classExcelPath, className, headers, row);

    // 2. Class Specific JSON
    const classJsonPath = path.join(clsDir, `Enrolled_${className}_Students.json`);
    appendToJsonFile(classJsonPath, { ...student, id: studentId, rollNo, normalizedClass: className });

    // 3. Master Enrolled Students Excel
    const masterExcelPath = path.join(catDir, 'All_Enrolled_Students_Master_Register.xlsx');
    appendRowToExcel(masterExcelPath, 'All_Enrolled_Students', headers, row);

    // 4. Individual Student Profile Text Card
    const safeName = (student.name || 'Student').replace(/[^a-zA-Z0-9_-]/g, '_');
    const studentProfilePath = path.join(profDir, `${safeName}_Roll_${rollNo}.txt`);
    fs.writeFileSync(studentProfilePath, textSummary, 'utf-8');
  }

  console.log(`[RecordManager] Successfully categorized Enrolled Student ${student.name} (Roll: ${rollNo}) under ${className}`);
  
  // Rebuild clean Excel registers and regenerate Class_Organized_Records
  try {
    exportClassHierarchies();
  } catch (err) {
    console.error('[RecordManager] exportClassHierarchies error:', err.message);
  }

  return { studentId, rollNo, className };
}

/**
 * Completely rebuilds enrolled student Excel registers and JSON files cleanly from db.students
 * ensuring zero duplicated rows and full synchronization with Class_Organized_Records.
 */
export function rebuildEnrolledStudentsExcel(studentsList = null) {
  initRecordsDirectories();
  let students = studentsList;
  if (!students) {
    try {
      const dataFilePath = path.resolve(__dirname, 'data.json');
      if (fs.existsSync(dataFilePath)) {
        const raw = fs.readFileSync(dataFilePath, 'utf-8');
        const db = JSON.parse(raw);
        students = db.students || [];
      }
    } catch {
      students = [];
    }
  }

  const headers = [
    'Roll Number (Login ID)',
    'Student Name',
    'Login Password',
    'Class / Grade',
    'Academic Stream',
    'Batch Assigned',
    'Parent Name',
    'Parent Phone',
    'Total Fees (Rs)',
    'Paid Fees (Rs)',
    'Fee Status',
    'Overall Marks %',
    'Total Tests Evaluated',
    'Attendance %',
    'Classes Attended',
    'Enrollment Date',
    'Teacher Remarks'
  ];

  const studentRows = (students || []).map(s => {
    const className = normalizeClass(s.grade || s.batch);
    const rollNo = s.rollNo || s.id;
    const timestamp = s.enrollmentDate || '2026-11-20';
    const overallPct = s.overallPercentage !== undefined ? `${s.overallPercentage}%` : '0%';
    const testsCount = s.totalTestsEvaluated !== undefined ? s.totalTestsEvaluated : 0;
    const attPct = s.attendancePercentage !== undefined ? `${s.attendancePercentage}%` : '0%';
    const attendedClasses = `${s.attendedDays ?? s.totalClassesAttended ?? 0} / ${s.workingDays ?? s.totalClassesHeld ?? 0}`;
    return [
      rollNo,
      s.name || '',
      s.password || 'student123',
      s.grade || className,
      s.stream || '',
      s.batch || '',
      s.parentName || '',
      s.parentPhone || '',
      s.fees?.total || s.totalFees || 0,
      s.fees?.paid || s.paidFees || 0,
      s.fees?.status || (s.fees?.due === 0 ? 'Fully Paid' : 'Pending'),
      overallPct,
      testsCount,
      attPct,
      attendedClasses,
      timestamp,
      s.teacherRemarks || ''
    ];
  });

  for (const baseDir of TARGET_DIRS) {
    const catDir = path.join(baseDir, CATEGORIES.ENROLLED);
    if (!fs.existsSync(catDir)) fs.mkdirSync(catDir, { recursive: true });

    // 1. Clean Master Enrolled Students Excel
    const masterExcelPath = path.join(catDir, 'All_Enrolled_Students_Master_Register.xlsx');
    const masterWb = XLSX.utils.book_new();
    const masterWs = XLSX.utils.aoa_to_sheet([headers, ...studentRows]);
    XLSX.utils.book_append_sheet(masterWb, masterWs, 'All_Enrolled_Students');
    try {
      XLSX.writeFile(masterWb, masterExcelPath);
    } catch (err) {
      console.error(`[RecordManager] Error writing master excel ${masterExcelPath}:`, err.message);
    }

    // 2. Clean Class-specific Excels & JSONs
    for (const cls of STANDARD_CLASSES) {
      const clsDir = path.join(catDir, cls);
      if (!fs.existsSync(clsDir)) fs.mkdirSync(clsDir, { recursive: true });

      const classStudents = (students || []).filter(s => normalizeClass(s.grade || s.batch) === cls);
      const classRows = classStudents.map(s => {
        const rollNo = s.rollNo || s.id;
        const timestamp = s.enrollmentDate || '2026-11-20';
        const overallPct = s.overallPercentage !== undefined ? `${s.overallPercentage}%` : '0%';
        const testsCount = s.totalTestsEvaluated !== undefined ? s.totalTestsEvaluated : 0;
        const attPct = s.attendancePercentage !== undefined ? `${s.attendancePercentage}%` : '0%';
        const attendedClasses = `${s.attendedDays ?? s.totalClassesAttended ?? 0} / ${s.workingDays ?? s.totalClassesHeld ?? 0}`;
        return [
          rollNo,
          s.name || '',
          s.password || 'student123',
          s.grade || cls,
          s.stream || '',
          s.batch || '',
          s.parentName || '',
          s.parentPhone || '',
          s.fees?.total || s.totalFees || 0,
          s.fees?.paid || s.paidFees || 0,
          s.fees?.status || (s.fees?.due === 0 ? 'Fully Paid' : 'Pending'),
          overallPct,
          testsCount,
          attPct,
          attendedClasses,
          timestamp,
          s.teacherRemarks || ''
        ];
      });

      const classExcelPath = path.join(clsDir, `Enrolled_${cls}_Students.xlsx`);
      const classWb = XLSX.utils.book_new();
      const classWs = XLSX.utils.aoa_to_sheet([headers, ...classRows]);
      XLSX.utils.book_append_sheet(classWb, classWs, cls);
      try {
        XLSX.writeFile(classWb, classExcelPath);
      } catch (err) {
        console.error(`[RecordManager] Error writing class excel ${classExcelPath}:`, err.message);
      }

      const classJsonPath = path.join(clsDir, `Enrolled_${cls}_Students.json`);
      try {
        fs.writeFileSync(classJsonPath, JSON.stringify(classStudents, null, 2), 'utf-8');
      } catch (err) {
        console.error(`[RecordManager] Error writing class json ${classJsonPath}:`, err.message);
      }
    }
  }

  // Also regenerate Class_Organized_Records
  try {
    exportClassHierarchies();
  } catch (err) {
    console.error('[RecordManager] exportClassHierarchies error:', err.message);
  }
}

/**
 * Generates comprehensive Master Examination Marks Registers in records/Examination_Marks_And_Reports/
 * and server/records/Examination_Marks_And_Reports/
 */
export function rebuildMasterMarksAndTestsExcel(dbInput = null) {
  let db = dbInput;
  if (!db) {
    try {
      const dataFilePath = path.resolve(__dirname, 'data.json');
      if (fs.existsSync(dataFilePath)) {
        db = JSON.parse(fs.readFileSync(dataFilePath, 'utf-8'));
      }
    } catch {
      db = { students: [], tests: [], onlineTests: [] };
    }
  }

  const students = db.students || [];
  const tests = db.tests || [];
  const onlineTests = db.onlineTests || [];

  // Sheet 1: Individual test scores
  const scoreRows = [];
  let sNo = 1;

  // Process offline tests
  tests.forEach(test => {
    (test.results || []).forEach(r => {
      const stu = students.find(s => 
        (s.id && String(s.id).toLowerCase() === String(r.studentId || '').toLowerCase()) ||
        (s.rollNo && String(s.rollNo).toLowerCase() === String(r.rollNo || r.studentId || '').toLowerCase())
      );
      scoreRows.push({
        'S.No': sNo++,
        'Roll Number': r.rollNo || (stu ? stu.rollNo : r.studentId),
        'Student Name': r.studentName || (stu ? stu.name : 'N/A'),
        'Class / Grade': test.grade || test.batch || (stu ? stu.grade : 'Class 10'),
        'Exam Type': test.type || 'Offline Classroom Test',
        'Test Title': test.title,
        'Subject': test.subject || 'All Subjects',
        'Exam Date': test.date,
        'Marks Scored': r.marksObtained !== undefined ? r.marksObtained : 'Absent',
        'Max Marks': test.maxMarks || 50,
        'Percentage %': `${r.percentage !== undefined ? r.percentage : 0}%`,
        'Batch Rank': r.rank || '-',
        'Result Status': r.status || (Number(r.percentage || 0) >= 85 ? 'Distinction' : 'Passed'),
        'Class Highest': test.highestMarks || '-',
        'Class Average': test.avgMarks || '-',
        'Teacher Feedback': r.remarks || 'Evaluated successfully'
      });
    });
  });

  // Process online Olympiad tests
  onlineTests.forEach(ot => {
    (ot.attempts || []).forEach(att => {
      const stu = students.find(s => 
        (s.id && String(s.id).toLowerCase() === String(att.studentId || '').toLowerCase()) ||
        (s.rollNo && String(s.rollNo).toLowerCase() === String(att.rollNo || att.studentId || '').toLowerCase())
      );
      scoreRows.push({
        'S.No': sNo++,
        'Roll Number': att.rollNo || (stu ? stu.rollNo : att.studentId),
        'Student Name': att.studentName || (stu ? stu.name : 'N/A'),
        'Class / Grade': ot.grade || (stu ? stu.grade : 'Class 10'),
        'Exam Type': 'Olympiad MCQ Arena',
        'Test Title': ot.title,
        'Subject': ot.subject || 'Olympiad',
        'Exam Date': att.submittedAt ? new Date(att.submittedAt).toLocaleDateString() : 'Recent',
        'Marks Scored': att.score,
        'Max Marks': att.maxScore || ot.totalMarks || 40,
        'Percentage %': `${att.accuracy || 0}%`,
        'Batch Rank': '-',
        'Result Status': att.accuracy >= 85 ? 'Distinction' : 'Completed',
        'Class Highest': '-',
        'Class Average': '-',
        'Teacher Feedback': `${att.correctCount} Correct, ${att.incorrectCount} Wrong in ${Math.floor((att.timeTakenSeconds || 0)/60)}m`
      });
    });
  });

  // Sheet 2: Student Master Academic Summary
  const studentSummaryRows = students.map((s, idx) => {
    const sClean = (val) => String(val || '').trim().toLowerCase();
    const sId = sClean(s.id);
    const sRoll = sClean(s.rollNo);
    const sName = sClean(s.name);

    let offlineCount = 0;
    tests.forEach(t => {
      if ((t.results || []).some(r => sClean(r.rollNo) === sRoll || sClean(r.studentId) === sId || sClean(r.studentName) === sName)) {
        offlineCount++;
      }
    });

    let onlineCount = 0;
    onlineTests.forEach(ot => {
      if ((ot.attempts || []).some(a => sClean(a.rollNo) === sRoll || sClean(a.studentId) === sId || sClean(a.studentName) === sName)) {
        onlineCount++;
      }
    });

    const overallPct = Number(s.overallPercentage || 0);
    return {
      'S.No': idx + 1,
      'Roll Number': s.rollNo || s.id,
      'Student Name': s.name,
      'Class / Grade': s.grade || s.batch || 'Class 10',
      'Academic Stream': s.stream || 'Standard',
      'Parent Contact': s.parentPhone || 'N/A',
      'Overall Marks %': `${overallPct}%`,
      'Total Tests Taken': offlineCount + onlineCount,
      'Offline Tests Evaluated': offlineCount,
      'Olympiad Tests Attempted': onlineCount,
      'Center Attendance %': `${s.attendancePercentage || 0}%`,
      'Classes Attended': `${s.attendedDays ?? s.totalClassesAttended ?? 0} / ${s.workingDays ?? s.totalClassesHeld ?? 0}`,
      'Performance Standing': overallPct >= 85 ? 'Distinction Student (Top 5%)' : (overallPct >= 60 ? 'First Class' : 'Regular Track'),
      'Teacher / Director Remarks': s.teacherRemarks || 'Active student with regular attendance'
    };
  });

  for (const baseDir of TARGET_DIRS) {
    const marksDir = path.join(baseDir, CATEGORIES.MARKS);
    if (!fs.existsSync(marksDir)) fs.mkdirSync(marksDir, { recursive: true });

    // Master All-Students Marks Workbook
    const masterMarksPath = path.join(marksDir, 'All_Students_Master_Marks_Register.xlsx');
    const masterMarksWb = XLSX.utils.book_new();
    const ws1 = XLSX.utils.json_to_sheet(scoreRows.length > 0 ? scoreRows : [{ 'Notice': 'No examination records evaluated yet.' }]);
    const ws2 = XLSX.utils.json_to_sheet(studentSummaryRows);
    XLSX.utils.book_append_sheet(masterMarksWb, ws2, 'Students_Marks_Summary');
    XLSX.utils.book_append_sheet(masterMarksWb, ws1, 'All_Tests_Scorecard');

    try {
      XLSX.writeFile(masterMarksWb, masterMarksPath);
    } catch (err) {
      console.error(`[RecordManager] Error writing master marks excel ${masterMarksPath}:`, err.message);
    }

    // Class-specific marks registers
    for (const cls of STANDARD_CLASSES) {
      const clsDir = path.join(marksDir, cls);
      if (!fs.existsSync(clsDir)) fs.mkdirSync(clsDir, { recursive: true });

      const classStudents = students.filter(s => normalizeClass(s.grade || s.batch) === cls);
      const classRolls = new Set(classStudents.map(s => String(s.rollNo || s.id).trim().toLowerCase()));

      const classScoreRows = scoreRows.filter(r => classRolls.has(String(r['Roll Number']).trim().toLowerCase()));
      const classSummaryRows = studentSummaryRows.filter(s => classRolls.has(String(s['Roll Number']).trim().toLowerCase()));

      const classMarksPath = path.join(clsDir, `${cls}_Marks_Register.xlsx`);
      const classMarksWb = XLSX.utils.book_new();
      const cws1 = XLSX.utils.json_to_sheet(classSummaryRows.length > 0 ? classSummaryRows : [{ 'Notice': 'No students enrolled in this class.' }]);
      const cws2 = XLSX.utils.json_to_sheet(classScoreRows.length > 0 ? classScoreRows : [{ 'Notice': 'No tests evaluated for this class yet.' }]);
      XLSX.utils.book_append_sheet(classMarksWb, cws1, `${cls}_Summary`);
      XLSX.utils.book_append_sheet(classMarksWb, cws2, `${cls}_Scores`);

      try {
        XLSX.writeFile(classMarksWb, classMarksPath);
      } catch (err) {
        console.error(`[RecordManager] Error writing class marks excel ${classMarksPath}:`, err.message);
      }
    }
  }
}

/**
 * Removes an enrolled student from disk files, class JSON, and Excel registers
 */
export function removeEnrolledStudent(identifier) {
  if (!identifier) return;
  const targetId = String(identifier).trim().toLowerCase();

  for (const baseDir of TARGET_DIRS) {
    const catDir = path.join(baseDir, CATEGORIES.ENROLLED);
    if (!fs.existsSync(catDir)) continue;

    for (const cls of STANDARD_CLASSES) {
      const clsDir = path.join(catDir, cls);
      const profDir = path.join(clsDir, 'Student_Profiles');

      // 1. Delete matching text dossier card
      if (fs.existsSync(profDir)) {
        try {
          const files = fs.readdirSync(profDir);
          for (const file of files) {
            const fLower = file.toLowerCase();
            if (fLower.includes(`_roll_${targetId}.txt`) || fLower.includes(`_${targetId}.txt`)) {
              fs.unlinkSync(path.join(profDir, file));
            }
          }
        } catch (err) {
          console.error(`[RecordManager] Error deleting profile for ${targetId}:`, err.message);
        }
      }

      // 2. Remove from Class JSON
      const classJsonPath = path.join(clsDir, `Enrolled_${cls}_Students.json`);
      if (fs.existsSync(classJsonPath)) {
        try {
          const raw = fs.readFileSync(classJsonPath, 'utf8');
          const list = JSON.parse(raw);
          if (Array.isArray(list)) {
            const filtered = list.filter(s => 
              String(s.id || '').toLowerCase() !== targetId &&
              String(s.rollNo || '').toLowerCase() !== targetId
            );
            fs.writeFileSync(classJsonPath, JSON.stringify(filtered, null, 2), 'utf8');
          }
        } catch {}
      }

      // 3. Remove from Class Excel (column 0 = Roll Number)
      const classExcelPath = path.join(clsDir, `Enrolled_${cls}_Students.xlsx`);
      removeRowFromExcel(classExcelPath, cls, 0, targetId);
    }

    // 4. Remove from Master Enrolled Excel (column 0 = Roll Number)
    const masterExcelPath = path.join(catDir, 'All_Enrolled_Students_Master_Register.xlsx');
    removeRowFromExcel(masterExcelPath, 'All_Enrolled_Students', 0, targetId);
  }
  console.log(`[RecordManager] Successfully purged records for Enrolled Student ID/Roll: ${identifier}`);

  // Re-export Class_Organized_Records
  try {
    exportClassHierarchies();
  } catch (err) {
    console.error('[RecordManager] exportClassHierarchies error:', err.message);
  }
}

/**
 * Returns summary tree of all folders and student counts for Admin Portal
 */
export function getRecordsOverview() {
  initRecordsDirectories();

  const overview = {
    recordsRoot: PROJECT_ROOT_RECORDS,
    serverRecords: SERVER_RECORDS,
    categories: []
  };

  for (const [key, catFolder] of Object.entries(CATEGORIES)) {
    const catPath = path.join(PROJECT_ROOT_RECORDS, catFolder);
    const categoryInfo = {
      key,
      folderName: catFolder,
      displayName: key === 'ENROLLED' ? 'Enrolled Students (Class Roster)' : key === 'GTSE' ? 'GTSE (GST) Scholarship Registrations' : key === 'ADMISSIONS' ? 'Course Admissions' : 'Student Queries & Contacts',
      totalCount: 0,
      classes: []
    };

    if (fs.existsSync(catPath)) {
      for (const cls of STANDARD_CLASSES) {
        const clsPath = path.join(catPath, cls);
        let studentCount = 0;
        let files = [];

        if (fs.existsSync(clsPath)) {
          const contents = fs.readdirSync(clsPath);
          for (const item of contents) {
            const itemPath = path.join(clsPath, item);
            const stat = fs.statSync(itemPath);
            if (stat.isFile()) {
              files.push({
                name: item,
                size: stat.size,
                updatedAt: stat.mtime
              });
            }
          }

          // Read count from JSON if present
          const jsonFile = contents.find(f => f.endsWith('.json'));
          if (jsonFile) {
            try {
              const raw = fs.readFileSync(path.join(clsPath, jsonFile), 'utf-8');
              const arr = JSON.parse(raw);
              if (Array.isArray(arr)) studentCount = arr.length;
            } catch {
              studentCount = 0;
            }
          }
        }

        categoryInfo.totalCount += studentCount;
        categoryInfo.classes.push({
          className: cls,
          displayName: cls.replace(/_/g, ' '),
          studentCount,
          files,
          path: clsPath
        });
      }
    }

    overview.categories.push(categoryInfo);
  }

  return overview;
}

/**
 * Migrates existing data.json registrations into the folder hierarchy
 */
export function migrateExistingRecords(db) {
  try {
    initRecordsDirectories();

    // 1. GTSE
    if (Array.isArray(db.gtseRegistrations) && db.gtseRegistrations.length > 0) {
      for (const reg of db.gtseRegistrations) {
        recordGTSESubmission(reg);
      }
    }

    // 2. Enquiries / Admissions
    if (Array.isArray(db.enquiries) && db.enquiries.length > 0) {
      for (const enq of db.enquiries) {
        if (enq.course && !enq.source?.includes('Contact')) {
          recordAdmissionSubmission(enq);
        } else {
          recordQuerySubmission(enq);
        }
      }
    }

    // 3. Enrolled Students (clean rebuild without duplicate rows)
    if (Array.isArray(db.students)) {
      rebuildEnrolledStudentsExcel(db.students);
    }
  } catch (err) {
    console.error('[RecordManager] Migration error:', err.message);
  }
}
