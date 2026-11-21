import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import XLSX from 'xlsx';

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
  QUERIES: 'Queries_And_Contact'
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
 * Helper to append a row to an Excel file safely
 */
function appendRowToExcel(filePath, sheetName, headers, rowData) {
  try {
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

    let wb;
    if (fs.existsSync(filePath)) {
      try {
        wb = XLSX.readFile(filePath);
      } catch {
        wb = XLSX.utils.book_new();
      }
    } else {
      wb = XLSX.utils.book_new();
    }

    let ws = wb.Sheets[sheetName];
    if (!ws) {
      ws = XLSX.utils.aoa_to_sheet([headers, rowData]);
      XLSX.utils.book_append_sheet(wb, ws, sheetName);
    } else {
      XLSX.utils.sheet_add_aoa(ws, [rowData], { origin: -1 });
    }

    XLSX.writeFile(wb, filePath);
  } catch (err) {
    console.error(`[RecordManager] Error writing Excel to ${filePath}:`, err.message);
  }
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
  return { studentId, rollNo, className };
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

    // 3. Enrolled Students
    if (Array.isArray(db.students) && db.students.length > 0) {
      for (const student of db.students) {
        recordEnrolledStudent(student);
      }
    }
  } catch (err) {
    console.error('[RecordManager] Migration error:', err.message);
  }
}
