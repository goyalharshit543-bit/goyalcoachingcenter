import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import XLSX from 'xlsx';
import { extractGradeNumber, getCanonicalClassName, isSameClass } from '../src/utils/classMatcher.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.resolve(__dirname, '..');
const DATA_FILE = path.join(PROJECT_ROOT, 'server', 'data.json');
const EXPORT_DIR = path.join(PROJECT_ROOT, 'Class_Organized_Records');

export function safeWriteExcel(wb, filePath) {
  try {
    XLSX.writeFile(wb, filePath);
    return true;
  } catch (err) {
    if (err.code === 'EBUSY') {
      console.warn(`[LOCKED FILE NOTICE] "${path.basename(filePath)}" is currently OPEN in Microsoft Excel. Please close it so changes can be written.`);
      try {
        const ext = path.extname(filePath);
        const altPath = filePath.replace(new RegExp(`\\${ext}$`), `_Latest${ext}`);
        XLSX.writeFile(wb, altPath);
      } catch {}
    } else {
      console.error(`[EXCEL ERROR] Writing ${filePath}:`, err.message);
    }
    return false;
  }
}

export function exportClassHierarchies() {
  console.log(`\n=====================================================================`);
  console.log(`[DATA ORGANIZER] GENERATING CLASS -> SUBJECT -> STUDENT DIRECTORIES`);
  console.log(`Destination Folder: ${EXPORT_DIR}`);
  console.log(`=====================================================================\n`);

  if (!fs.existsSync(DATA_FILE)) {
    console.error(`[Error] data.json not found at: ${DATA_FILE}`);
    return;
  }

  const db = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
  const students = db.students || [];
  const tests = db.tests || [];
  const onlineTests = db.onlineTests || [];
  const assignments = db.assignments || [];
  const attendanceLogs = db.attendanceLogs || [];

  // Recalculate marks and evaluation statistics for all students to ensure absolute accuracy
  students.forEach(student => {
    let sumPct = 0;
    let count = 0;
    const sClean = (val) => String(val || '').trim().toLowerCase();
    const sId = sClean(student.id);
    const sRoll = sClean(student.rollNo);
    const sName = sClean(student.name);

    tests.forEach(t => {
      const match = (t.results || []).find(r => {
        const rId = sClean(r.studentId);
        const rRoll = sClean(r.rollNo);
        const rName = sClean(r.studentName || r.name);
        return (
          (rId && (rId === sId || rId === sRoll)) ||
          (rRoll && (rRoll === sRoll || rRoll === sId)) ||
          (rName && sName && (rName === sName || rName.includes(sName) || sName.includes(rName)))
        );
      });
      if (match) {
        const max = Number(t.maxMarks || match.maxMarks) || 50;
        const scored = Number(match.marksObtained);
        const p = match.percentage !== undefined ? Number(match.percentage) : ((scored / max) * 100);
        sumPct += p;
        count++;
      }
    });

    student.totalTestsEvaluated = count;
    if (count > 0) {
      student.overallPercentage = Number((sumPct / count).toFixed(1));
      if (!student.teacherRemarks || student.teacherRemarks.includes('Newly admitted') || student.teacherRemarks.includes('No assessments')) {
        student.teacherRemarks = student.overallPercentage >= 85
          ? 'Distinction student. Superb analytical problem solving and consistent high ranks.'
          : 'Diligent student. Good concept clarity and active classroom participation.';
      }
    }
  });

  if (!fs.existsSync(EXPORT_DIR)) {
    fs.mkdirSync(EXPORT_DIR, { recursive: true });
  }

  // 1. Group students by clean canonical class name
  const classBuckets = {
    'Class 7th': [],
    'Class 8th': [],
    'Class 9th': [],
    'Class 10th': [],
    'Class 11th Commerce': [],
    'Class 11th Science': [],
    'Class 12th Commerce': [],
    'Class 12th Science': []
  };

  students.forEach(student => {
    const canonical = getCanonicalClassName(student.grade || student.batch);
    if (!classBuckets[canonical]) {
      classBuckets[canonical] = [];
    }
    classBuckets[canonical].push(student);
  });

  // Track summary stats
  let totalDossiersCreated = 0;
  let totalExcelReportsCreated = 0;

  // Process each class folder
  for (const [className, classStudents] of Object.entries(classBuckets)) {
    try {
      const classFolder = path.join(EXPORT_DIR, className.replace(/\s+/g, '_'));

      if (classStudents.length === 0) {
        if (fs.existsSync(classFolder)) {
          // Update roster to be cleanly empty so deleted students don't linger
          const rosterExcelPath = path.join(classFolder, `00_${className.replace(/\s+/g, '_')}_Master_Roster.xlsx`);
          const emptyWb = XLSX.utils.book_new();
          const emptyWs = XLSX.utils.aoa_to_sheet([
            ['S.No', 'Roll No / Login ID', 'Student Full Name', 'Class & Stream', 'Batch Name', 'Parent Name', 'Parent Contact', 'Fee Status', 'Remarks']
          ]);
          XLSX.utils.book_append_sheet(emptyWb, emptyWs, `${className} Roster`);
          safeWriteExcel(emptyWb, rosterExcelPath);

          const altRosterPath = path.join(classFolder, `00_${className.replace(/\s+/g, '_')}_Master_Roster_Latest.xlsx`);
          if (fs.existsSync(altRosterPath)) {
            try { fs.unlinkSync(altRosterPath); } catch {}
          }
          const attExcelPath = path.join(classFolder, `00_${className.replace(/\s+/g, '_')}_Attendance_Register.xlsx`);
          if (fs.existsSync(attExcelPath)) {
            try { fs.unlinkSync(attExcelPath); } catch {}
          }
          const studentsFolder = path.join(classFolder, 'Individual_Student_Profiles');
          if (fs.existsSync(studentsFolder)) {
            try { fs.rmSync(studentsFolder, { recursive: true, force: true }); } catch {}
          }
          const subjectsFolder = path.join(classFolder, 'Subjects');
          if (fs.existsSync(subjectsFolder)) {
            try { fs.rmSync(subjectsFolder, { recursive: true, force: true }); } catch {}
          }
        }
        continue;
      }

      if (!fs.existsSync(classFolder)) {
        fs.mkdirSync(classFolder, { recursive: true });
      }

      // A. Class Master Register Excel
      const classRosterRows = classStudents.map((s, idx) => ({
        'S.No': idx + 1,
        'Roll No / Login ID': s.rollNo || s.id,
        'Student Full Name': s.name,
        'Class & Stream': `${className} (${s.stream || 'Standard'})`,
        'Batch Name': s.batch || className,
        'Parent Name': s.parentName || 'N/A',
        'Parent Contact': s.parentPhone || 'N/A',
        'Student Contact': s.studentPhone || s.parentPhone || 'N/A',
        'Enrollment Date': s.enrollmentDate || '2026-11-20',
        'Total Fees': s.fees?.total || s.totalFees || 38000,
        'Fees Paid': s.fees?.paid || s.paidFees || 38000,
        'Fee Balance': s.fees?.due ?? 0,
        'Fee Status': s.fees?.status || (s.fees?.due === 0 ? 'Fully Paid' : 'Pending'),
        'Overall Marks %': `${s.overallPercentage || 0}%`,
        'Attendance %': `${s.attendancePercentage || 0}%`,
        'Classes Attended': `${s.attendedDays ?? s.totalClassesAttended ?? 0} / ${s.workingDays ?? s.totalClassesHeld ?? 0}`,
        'Teacher Remarks': s.teacherRemarks || 'Consistent performance'
      }));

      const rosterWb = XLSX.utils.book_new();
      const rosterWs = XLSX.utils.json_to_sheet(classRosterRows);
      XLSX.utils.book_append_sheet(rosterWb, rosterWs, `${className} Roster`);
      const rosterExcelPath = path.join(classFolder, `00_${className.replace(/\s+/g, '_')}_Master_Roster.xlsx`);
      if (safeWriteExcel(rosterWb, rosterExcelPath)) {
        totalExcelReportsCreated++;
      }

      // B. Class Attendance History Excel
      const classAttendance = attendanceLogs.filter(a => {
        return classStudents.some(s => 
          (s.id && String(s.id).toLowerCase() === String(a.studentId).toLowerCase()) ||
          (s.rollNo && String(s.rollNo).toLowerCase() === String(a.studentId).toLowerCase())
        );
      });

      if (classAttendance.length > 0) {
        const attRows = classAttendance.map((a, idx) => {
          const student = classStudents.find(s => 
            (s.id && String(s.id).toLowerCase() === String(a.studentId).toLowerCase()) ||
            (s.rollNo && String(s.rollNo).toLowerCase() === String(a.studentId).toLowerCase())
          );
          return {
            'Record ID': idx + 1,
            'Date': a.date,
            'Student Name': student ? student.name : a.studentId,
            'Roll Number': student ? student.rollNo : a.studentId,
            'Class': className,
            'Attendance Status': a.status,
            'Check-in Time': a.timeIn || '03:30 PM',
            'Session Remarks': a.remarks || 'Standard Session'
          };
        });
        const attWb = XLSX.utils.book_new();
        const attWs = XLSX.utils.json_to_sheet(attRows);
        XLSX.utils.book_append_sheet(attWb, attWs, 'Attendance Logs');
        const attExcelPath = path.join(classFolder, `00_${className.replace(/\s+/g, '_')}_Attendance_Register.xlsx`);
        if (safeWriteExcel(attWb, attExcelPath)) {
          totalExcelReportsCreated++;
        }
      }

      // C. Class Master Examination & Test Marks Register Excel
      const classTests = tests.filter(t => isSameClass(t.grade || t.batch, className));
      const classOnlineTests = onlineTests.filter(ot => isSameClass(ot.grade, className) || !ot.grade || ot.grade.includes('All'));
      const sClean = (val) => String(val || '').trim().toLowerCase();

      // Sheet 1: Student Marks Summary for this class
      const classMarksSummaryRows = classStudents.map((s, idx) => {
        const sId = sClean(s.id);
        const sRoll = sClean(s.rollNo);
        const sName = sClean(s.name);

        let offlineCount = 0;
        classTests.forEach(t => {
          if ((t.results || []).some(r => sClean(r.rollNo) === sRoll || sClean(r.studentId) === sId || sClean(r.studentName) === sName)) {
            offlineCount++;
          }
        });

        let onlineCount = 0;
        classOnlineTests.forEach(ot => {
          if ((ot.attempts || []).some(a => sClean(a.rollNo) === sRoll || sClean(a.studentId) === sId || sClean(a.studentName) === sName)) {
            onlineCount++;
          }
        });

        const overallPct = Number(s.overallPercentage || 0);
        return {
          'S.No': idx + 1,
          'Roll No / Login ID': s.rollNo || s.id,
          'Student Full Name': s.name,
          'Class & Stream': `${className} (${s.stream || 'Standard'})`,
          'Parent Contact': s.parentPhone || 'N/A',
          'Overall Marks %': `${overallPct}%`,
          'Total Tests Taken': offlineCount + onlineCount,
          'Offline Tests Evaluated': offlineCount,
          'Olympiad Tests Attempted': onlineCount,
          'Attendance %': `${s.attendancePercentage || 0}%`,
          'Classes Attended': `${s.attendedDays ?? s.totalClassesAttended ?? 0} / ${s.workingDays ?? s.totalClassesHeld ?? 0}`,
          'Academic Standing': overallPct >= 85 ? 'Distinction Student (Top 5%)' : (overallPct >= 60 ? 'First Class' : 'Regular Track'),
          'Teacher Remarks': s.teacherRemarks || 'Active student with regular attendance'
        };
      });

      // Sheet 2: Offline Test Scores
      const classOfflineScoresRows = [];
      let offNo = 1;
      classTests.forEach(t => {
        (t.results || []).forEach(r => {
          const stu = classStudents.find(s => 
            (s.id && sClean(s.id) === sClean(r.studentId)) ||
            (s.rollNo && (sClean(s.rollNo) === sClean(r.rollNo) || sClean(s.rollNo) === sClean(r.studentId))) ||
            (s.name && sClean(s.name) === sClean(r.studentName || r.name))
          );
          classOfflineScoresRows.push({
            'S.No': offNo++,
            'Test Title': t.title,
            'Subject': t.subject || 'All Subjects',
            'Exam Date': t.date,
            'Roll Number': r.rollNo || (stu ? stu.rollNo : r.studentId),
            'Student Name': r.studentName || (stu ? stu.name : 'N/A'),
            'Marks Scored': r.marksObtained !== undefined ? r.marksObtained : 'Absent',
            'Max Marks': t.maxMarks || 50,
            'Percentage %': `${r.percentage !== undefined ? r.percentage : 0}%`,
            'Batch Rank': r.rank || '-',
            'Performance Status': r.status || (Number(r.percentage || 0) >= 85 ? 'Distinction' : 'Passed'),
            'Class Highest': t.highestMarks || '-',
            'Class Average': t.avgMarks || '-',
            'Teacher Remarks': r.remarks || 'Evaluated successfully'
          });
        });
      });

      // Sheet 3: Olympiad MCQ Scores
      const classOlympiadScoresRows = [];
      let olyNo = 1;
      classOnlineTests.forEach(ot => {
        (ot.attempts || []).forEach(att => {
          const stu = classStudents.find(s => 
            (s.id && sClean(s.id) === sClean(att.studentId)) ||
            (s.rollNo && (sClean(s.rollNo) === sClean(att.rollNo) || sClean(s.rollNo) === sClean(att.studentId))) ||
            (s.name && sClean(s.name) === sClean(att.studentName))
          );
          if (stu) {
            classOlympiadScoresRows.push({
              'S.No': olyNo++,
              'Olympiad Title': ot.title,
              'Subject': ot.subject || 'Olympiad',
              'Attempt Date': att.submittedAt ? new Date(att.submittedAt).toLocaleDateString() : 'Recent',
              'Roll Number': att.rollNo || stu.rollNo,
              'Student Name': att.studentName || stu.name,
              'Score Scored': att.score,
              'Max Score': att.maxScore || ot.totalMarks || 40,
              'Accuracy %': `${att.accuracy || 0}%`,
              'Correct Count': att.correctCount,
              'Incorrect Count': att.incorrectCount,
              'Time Taken': `${Math.floor((att.timeTakenSeconds || 0)/60)}m ${(att.timeTakenSeconds || 0)%60}s`,
              'Performance Status': att.accuracy >= 85 ? 'Distinction' : 'Completed'
            });
          }
        });
      });

      const marksRegisterWb = XLSX.utils.book_new();
      const wsSum = XLSX.utils.json_to_sheet(classMarksSummaryRows);
      const wsOff = XLSX.utils.json_to_sheet(classOfflineScoresRows.length > 0 ? classOfflineScoresRows : [{ 'Notice': 'No offline test marks recorded yet.' }]);
      const wsOly = XLSX.utils.json_to_sheet(classOlympiadScoresRows.length > 0 ? classOlympiadScoresRows : [{ 'Notice': 'No Olympiad attempts recorded yet.' }]);

      XLSX.utils.book_append_sheet(marksRegisterWb, wsSum, `${className} Marks Summary`);
      XLSX.utils.book_append_sheet(marksRegisterWb, wsOff, 'Offline Test Scores');
      XLSX.utils.book_append_sheet(marksRegisterWb, wsOly, 'Olympiad MCQ Scores');

      const marksRegisterExcelPath = path.join(classFolder, `00_${className.replace(/\s+/g, '_')}_Marks_And_Tests_Register.xlsx`);
      if (safeWriteExcel(marksRegisterWb, marksRegisterExcelPath)) {
        totalExcelReportsCreated++;
      }

      // D. Subjects Subfolders (e.g. Mathematics, Science, Accounts, Economics)
      const classAssignments = assignments.filter(a => isSameClass(a.grade, className));
      
      const subjectSet = new Set(['General_Academics']);
      classTests.forEach(t => { if (t.subject) subjectSet.add(t.subject.trim().replace(/[^a-zA-Z0-9_\-\s]/g, '')); });
      classAssignments.forEach(a => { if (a.subject) subjectSet.add(a.subject.trim().replace(/[^a-zA-Z0-9_\-\s]/g, '')); });

      if (className.includes('7') || className.includes('8')) {
        subjectSet.add('Mathematics');
        subjectSet.add('Science');
        subjectSet.add('English');
      } else if (className.includes('9') || className.includes('10')) {
        subjectSet.add('Mathematics');
        subjectSet.add('Science_Physics_Chemistry_Biology');
        subjectSet.add('Social_Science');
      } else if (className.includes('Commerce')) {
        subjectSet.add('Accountancy');
        subjectSet.add('Business_Studies');
        subjectSet.add('Economics');
        subjectSet.add('Applied_Mathematics');
      }

      const subjectsFolder = path.join(classFolder, 'Subjects');
      if (!fs.existsSync(subjectsFolder)) fs.mkdirSync(subjectsFolder, { recursive: true });

      for (const subject of subjectSet) {
        const subjectDir = path.join(subjectsFolder, subject.replace(/\s+/g, '_'));
        if (!fs.existsSync(subjectDir)) fs.mkdirSync(subjectDir, { recursive: true });

        // Tests in this subject
        const subjTests = classTests.filter(t => (t.subject || '').toLowerCase().includes(subject.toLowerCase().slice(0, 4)));
        if (subjTests.length > 0) {
          const testRows = [];
          subjTests.forEach(t => {
            (t.results || []).forEach(r => {
              const stu = classStudents.find(s => s.id === r.studentId || s.rollNo === r.studentId || s.rollNo === r.rollNo);
              testRows.push({
                'Test Title': t.title,
                'Date': t.date,
                'Student Roll': r.rollNo || (stu ? stu.rollNo : 'N/A'),
                'Student Name': r.studentName || (stu ? stu.name : 'N/A'),
                'Max Marks': t.maxMarks || 50,
                'Marks Obtained': r.marksObtained ?? 'Absent',
                'Percentage': `${r.percentage || 0}%`,
                'Grade Awarded': r.grade || 'N/A',
                'Evaluated Status': r.marksObtained !== undefined ? 'Evaluated' : 'Pending'
              });
            });
          });

          if (testRows.length > 0) {
            const testWb = XLSX.utils.book_new();
            const testWs = XLSX.utils.json_to_sheet(testRows);
            XLSX.utils.book_append_sheet(testWb, testWs, 'Marks Register');
            const testExcelPath = path.join(subjectDir, `${subject.replace(/\s+/g, '_')}_Marks_Register.xlsx`);
            if (safeWriteExcel(testWb, testExcelPath)) {
              totalExcelReportsCreated++;
            }
          }
        } else {
          const testExcelPath = path.join(subjectDir, `${subject.replace(/\s+/g, '_')}_Marks_Register.xlsx`);
          if (fs.existsSync(testExcelPath)) {
            try { fs.unlinkSync(testExcelPath); } catch {}
          }
        }
      }

      // D. Individual Student Dossier Subfolders (Class -> Students -> [Roll_StudentName])
      const studentsFolder = path.join(classFolder, 'Individual_Student_Profiles');
      if (!fs.existsSync(studentsFolder)) {
        fs.mkdirSync(studentsFolder, { recursive: true });
      } else {
        // Purge folders of any student who has been deleted from this class
        try {
          const existingDirs = fs.readdirSync(studentsFolder);
          const activeRolls = new Set(classStudents.map(s => String(s.rollNo || s.id).trim().toUpperCase()));
          const activeDirNames = new Set(classStudents.map(s => {
            const studentCleanName = (s.name || 'Student').replace(/[^a-zA-Z0-9_\-\s]/g, '').trim().replace(/\s+/g, '_');
            return `Roll_${s.rollNo || 'NA'}_${studentCleanName}`.toUpperCase();
          }));

          for (const dir of existingDirs) {
            const match = dir.match(/^Roll_([^_]+)_/i);
            const r = match ? match[1].trim().toUpperCase() : null;
            const isMatchActive = r ? activeRolls.has(r) : false;
            const isDirActive = activeDirNames.has(dir.toUpperCase());

            if (!isMatchActive && !isDirActive) {
              console.log(`[DATA ORGANIZER] Purging deleted student dossier: ${dir}`);
              try { fs.rmSync(path.join(studentsFolder, dir), { recursive: true, force: true }); } catch {}
            }
          }
        } catch (err) {
          console.error('[DATA ORGANIZER] Dossier cleanup error:', err.message);
        }
      }

      classStudents.forEach(student => {
        const studentCleanName = (student.name || 'Student').replace(/[^a-zA-Z0-9_\-\s]/g, '').trim().replace(/\s+/g, '_');
        const studentDirName = `Roll_${student.rollNo || 'NA'}_${studentCleanName}`;
        const studentPath = path.join(studentsFolder, studentDirName);
        if (!fs.existsSync(studentPath)) fs.mkdirSync(studentPath, { recursive: true });

        // 1. Text Summary Card
        const studentTestsList = classTests.map(t => {
          const res = (t.results || []).find(r => 
            (r.studentId && (r.studentId === student.id || r.studentId === student.rollNo)) ||
            (r.rollNo && (r.rollNo === student.rollNo || r.rollNo === student.id))
          );
          return {
            title: t.title,
            subject: t.subject || 'All Subjects',
            date: t.date,
            maxMarks: t.maxMarks,
            marksObtained: res ? res.marksObtained : 'Not Attempted / Pending',
            percentage: res ? `${res.percentage}%` : 'N/A'
          };
        });

        const profileCard = `=====================================================================
GOYAL COACHING CENTER - COMPLETE STUDENT RECORD CARD
=====================================================================
STUDENT INFORMATION:
- Student Name        : ${student.name}
- Roll Number (ID)    : ${student.rollNo || student.id}
- Enrolled Class      : ${className}
- Academic Stream     : ${student.stream || 'Standard'}
- Batch Assignment    : ${student.batch || className}
- Enrollment Date     : ${student.enrollmentDate || '2026-11-20'}
- Login Password      : ${student.password || 'student123'}

GUARDIAN & CONTACT DETAILS:
- Father/Mother Name  : ${student.parentName || 'N/A'}
- Parent Phone Number : ${student.parentPhone || 'N/A'}
- Student Phone Number: ${student.studentPhone || student.parentPhone || 'N/A'}

FINANCIAL & FEE STATUS:
- Total Course Fee    : Rs. ${student.fees?.total || student.totalFees || 38000}
- Amount Paid to Date : Rs. ${student.fees?.paid || student.paidFees || 38000}
- Current Outstanding : Rs. ${student.fees?.due ?? 0}
- Fee Status Badge    : ${student.fees?.status || (student.fees?.due === 0 ? 'Fully Paid' : 'Pending')}
- Last Receipt Number : ${student.fees?.lastReceipt || 'REC-OFFLINE'}

ACADEMIC & ATTENDANCE PERFORMANCE:
- Overall Score %     : ${student.overallPercentage || 0}%
- Total Attendance %  : ${student.attendancePercentage || 0}%
- Total Classes       : ${student.attendedDays ?? student.totalClassesAttended ?? 0} Attended out of ${student.workingDays ?? student.totalClassesHeld ?? 0} Working Days
- Faculty Remarks     : ${student.teacherRemarks || 'Regular and attentive in class sessions'}

DETAILED TEST & EXAMINATION RESULTS:
${studentTestsList.length > 0 ? studentTestsList.map((t, i) => `  ${i+1}. [${t.date}] ${t.title} (${t.subject}): Scored ${t.marksObtained} / ${t.maxMarks} (${t.percentage})`).join('\n') : '  - No offline examinations recorded yet.'}
=====================================================================
Exported Automatically by Goyal Coaching Center Organizer
=====================================================================`;

        fs.writeFileSync(path.join(studentPath, `Dossier_${student.rollNo}_${studentCleanName}.txt`), profileCard, 'utf8');

        // 2. Student Individual Excel Sheet
        const studentSheetRows = [
          { Field: 'Full Name', Value: student.name },
          { Field: 'Roll Number', Value: student.rollNo || student.id },
          { Field: 'Class & Stream', Value: `${className} - ${student.stream || 'Standard'}` },
          { Field: 'Batch', Value: student.batch || className },
          { Field: 'Parent Name', Value: student.parentName || 'N/A' },
          { Field: 'Parent Contact', Value: student.parentPhone || 'N/A' },
          { Field: 'Fee Status', Value: student.fees?.status || 'Fully Paid' },
          { Field: 'Fee Total', Value: student.fees?.total || 38000 },
          { Field: 'Fee Paid', Value: student.fees?.paid || 38000 },
          { Field: 'Fee Balance', Value: student.fees?.due ?? 0 },
          { Field: 'Overall Marks %', Value: `${student.overallPercentage || 0}%` },
          { Field: 'Attendance %', Value: `${student.attendancePercentage || 0}%` },
          { Field: 'Teacher Remarks', Value: student.teacherRemarks || 'Good performance' }
        ];

        const sWb = XLSX.utils.book_new();
        const sWs = XLSX.utils.json_to_sheet(studentSheetRows);
        XLSX.utils.book_append_sheet(sWb, sWs, 'Profile');

        if (studentTestsList.length > 0) {
          const testsWs = XLSX.utils.json_to_sheet(studentTestsList);
          XLSX.utils.book_append_sheet(sWb, testsWs, 'Exams');
        }

        const indivExcelPath = path.join(studentPath, `Report_${student.rollNo}_${studentCleanName}.xlsx`);
        if (safeWriteExcel(sWb, indivExcelPath)) {
          totalDossiersCreated++;
        }
      });

      console.log(`✓ Processed ${className}: ${classStudents.length} Students Organized with Roster, Attendance & Individual Dossiers`);
    } catch (classErr) {
      console.error(`[DATA ORGANIZER] Error processing class ${className}:`, classErr.message);
    }
  }

  console.log(`\n=====================================================================`);
  console.log(`SUCCESS: Organization Complete!`);
  console.log(`- Total Class Directories   : ${Object.keys(classBuckets).length}`);
  console.log(`- Individual Student Folders: ${totalDossiersCreated}`);
  console.log(`- Generated Excel Reports   : ${totalExcelReportsCreated}`);
  console.log(`- Root Output Directory     : ${EXPORT_DIR}`);
  console.log(`=====================================================================\n`);
}

// Allow direct CLI execution: node scripts/exportClassHierarchies.js
if (process.argv[1] && process.argv[1].endsWith('exportClassHierarchies.js')) {
  exportClassHierarchies();
}
