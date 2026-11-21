import { useState, useEffect } from 'react';
import { 
  Clock, 
  Calendar, 
  CheckCircle2, 
  AlertTriangle, 
  Lock, 
  Unlock, 
  Save, 
  Users, 
  RefreshCw,
  Search,
  Filter,
  Check,
  X,
  AlertCircle,
  HelpCircle,
  Sparkles,
  Info
} from 'lucide-react';
import { api } from '../../api/client';

export const AVAILABLE_CLASSES = [
  { id: 'Class 7th', label: 'Class 7th', code: '7' },
  { id: 'Class 8th', label: 'Class 8th', code: '8' },
  { id: 'Class 9th', label: 'Class 9th', code: '9' },
  { id: 'Class 10th', label: 'Class 10th', code: '10' },
  { id: 'Class 11th (Science)', label: 'Class 11th (Science)', code: '11-sci' },
  { id: 'Class 11th (Commerce)', label: 'Class 11th (Commerce)', code: '11-comm' },
  { id: 'Class 12th (Science)', label: 'Class 12th (Science)', code: '12-sci' },
  { id: 'Class 12th (Commerce)', label: 'Class 12th (Commerce)', code: '12-comm' },
  { id: 'All', label: 'All Classes', code: 'all' }
];

export function matchesStudentClass(student, targetClass) {
  if (!targetClass || targetClass === 'All') return true;
  const grade = (student.grade || '').toLowerCase();
  const batch = (student.batch || '').toLowerCase();
  const t = targetClass.toLowerCase();

  if (t.includes('7')) return grade.includes('7') || batch.includes('7');
  if (t.includes('8')) return grade.includes('8') || batch.includes('8');
  if (t.includes('9')) return grade.includes('9') || batch.includes('9');
  if (t.includes('10')) return grade.includes('10') || batch.includes('10');
  
  if (t.includes('11') && (t.includes('sci') || t.includes('science'))) {
    return (grade.includes('11') || batch.includes('11')) && (grade.includes('sci') || batch.includes('sci'));
  }
  if (t.includes('11') && (t.includes('comm') || t.includes('commerce'))) {
    return (grade.includes('11') || batch.includes('11')) && (grade.includes('comm') || batch.includes('comm'));
  }
  if (t.includes('11')) return grade.includes('11') || batch.includes('11');

  if (t.includes('12') && (t.includes('sci') || t.includes('science'))) {
    return (grade.includes('12') || batch.includes('12')) && (grade.includes('sci') || batch.includes('sci'));
  }
  if (t.includes('12') && (t.includes('comm') || t.includes('commerce'))) {
    return (grade.includes('12') || batch.includes('12')) && (grade.includes('comm') || batch.includes('comm'));
  }
  if (t.includes('12')) return grade.includes('12') || batch.includes('12');

  return grade.includes(t) || batch.includes(t);
}

export default function ClassAttendanceManager({ 
  students = [], 
  attendanceLogs = [], 
  onDataSaved, 
  isAdmin = false,
  currentUser = null 
}) {
  const [selectedClass, setSelectedClass] = useState('Class 7th');
  const [attendanceDate, setAttendanceDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [attendanceMap, setAttendanceMap] = useState({}); // { [studentId]: { status, remarks } }
  const [saving, setSaving] = useState(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [adminOverrideLock, setAdminOverrideLock] = useState(false);

  // Filter students by selected class
  const classStudents = students.filter(s => matchesStudentClass(s, selectedClass));

  // Determine 20-Hour Edit Status for selected date
  const logsForDate = attendanceLogs.filter(a => a.date === attendanceDate);
  const classLogsForDate = logsForDate.filter(a => classStudents.some(s => s.id === a.studentId));
  const hasExistingLogs = classLogsForDate.length > 0;

  const firstLog = classLogsForDate[0];
  const createdTime = firstLog?.createdAt ? new Date(firstLog.createdAt).getTime() : null;
  const TWENTY_HOURS_MS = 20 * 60 * 60 * 1000;
  
  const now = Date.now();
  const elapsedMs = createdTime ? (now - createdTime) : 0;
  const isPast20Hours = createdTime ? (elapsedMs > TWENTY_HOURS_MS) : false;
  const hoursRemaining = createdTime ? Math.max(0, Number(((TWENTY_HOURS_MS - elapsedMs) / (3600 * 1000)).toFixed(1))) : 20;

  // Is editing allowed?
  const isLocked = hasExistingLogs && isPast20Hours && !(isAdmin && adminOverrideLock);

  // Pre-fill or update attendanceMap whenever date, selectedClass, or students change
  useEffect(() => {
    const newMap = {};
    classStudents.forEach(s => {
      const existing = classLogsForDate.find(l => l.studentId === s.id);
      if (existing) {
        newMap[s.id] = {
          status: existing.status || 'Present',
          remarks: existing.remarks || 'Regular attendance record'
        };
      } else {
        newMap[s.id] = {
          status: 'Present',
          remarks: 'Present on time'
        };
      }
    });
    setAttendanceMap(newMap);
    setErrorMsg('');
  }, [attendanceDate, selectedClass, students.length, attendanceLogs.length]);

  // Bulk mark status shortcut
  const handleMarkAll = (status) => {
    if (isLocked) return;
    const updated = { ...attendanceMap };
    classStudents.forEach(s => {
      updated[s.id] = {
        ...updated[s.id],
        status,
        remarks: status === 'Present' ? 'Present on time' : status === 'Late' ? 'Late arrival' : 'Absent from class'
      };
    });
    setAttendanceMap(updated);
  };

  // Save Attendance to Backend
  const handleSave = async () => {
    setErrorMsg('');
    setSaveSuccessMsg('');
    setSaving(true);

    try {
      const records = classStudents.map(s => ({
        studentId: s.id,
        status: attendanceMap[s.id]?.status || 'Present',
        timeIn: attendanceMap[s.id]?.status === 'Present' ? '04:00 PM' : attendanceMap[s.id]?.status === 'Late' ? '04:25 PM' : '-',
        remarks: attendanceMap[s.id]?.remarks || 'Class session record',
        className: selectedClass
      }));

      const res = await api.recordAttendanceBatch(
        attendanceDate, 
        records, 
        selectedClass, 
        isAdmin && adminOverrideLock
      );

      setSaveSuccessMsg(`Attendance saved successfully for ${records.length} students of ${selectedClass} on ${attendanceDate}! Data pushed to Student Portal in real-time.`);
      if (onDataSaved) await onDataSaved();
    } catch (err) {
      setErrorMsg(err.message || 'Failed to save attendance. Please check credentials or edit window.');
    } finally {
      setSaving(false);
    }
  };

  // Helper: compute working days & percentage for a student
  const getStudentStats = (studentId) => {
    const sLogs = attendanceLogs.filter(a => a.studentId === studentId);
    const workingDays = sLogs.length;
    const pCount = sLogs.filter(a => a.status === 'Present').length;
    const lCount = sLogs.filter(a => a.status === 'Late').length;
    const aCount = sLogs.filter(a => a.status === 'Absent').length;
    const attendedDays = pCount + (lCount * 0.5);
    const pct = workingDays > 0 ? Number(((attendedDays / workingDays) * 100).toFixed(1)) : 0;

    return {
      workingDays,
      attendedDays,
      presentCount: pCount,
      lateCount: lCount,
      absentCount: aCount,
      percentage: pct
    };
  };

  return (
    <div className="space-y-5">
      {/* 1. Header & Class Selection Pills */}
      <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Clock className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <span>Class-Wise Attendance & Assessment Register</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Select any class below to automatically load all enrolled students, take daily attendance, and calculate working-day percentages.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <span className="px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 font-bold text-xs border border-blue-200 dark:border-blue-800">
              {classStudents.length} Students in {selectedClass}
            </span>
          </div>
        </div>

        {/* Class Selection Buttons */}
        <div>
          <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-2">
            Select Class:
          </label>
          <div className="flex flex-wrap gap-2">
            {AVAILABLE_CLASSES.map(cls => {
              const isSelected = selectedClass === cls.id;
              const count = students.filter(s => matchesStudentClass(s, cls.id)).length;

              return (
                <button
                  key={cls.id}
                  type="button"
                  onClick={() => setSelectedClass(cls.id)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                    isSelected
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25 scale-[1.02]'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
                  }`}
                >
                  <span>{cls.label}</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                    isSelected ? 'bg-white/20 text-white' : 'bg-slate-200 dark:bg-slate-900 text-slate-600 dark:text-slate-400'
                  }`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* 2. Date Picker, 20-Hour Modification Window Alert & Action Bar */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <div>
            <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1">
              Attendance Date
            </label>
            <div className="relative">
              <input
                type="date"
                value={attendanceDate}
                onChange={(e) => setAttendanceDate(e.target.value)}
                className="px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-xs font-semibold focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div className="flex items-end gap-2 pt-4">
            <button
              type="button"
              disabled={isLocked}
              onClick={() => handleMarkAll('Present')}
              className="px-3 py-2 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-xs font-bold hover:bg-emerald-200 dark:hover:bg-emerald-900 cursor-pointer disabled:opacity-50"
            >
              ✓ Mark All Present
            </button>
            <button
              type="button"
              disabled={isLocked}
              onClick={() => handleMarkAll('Absent')}
              className="px-3 py-2 rounded-xl bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800 text-xs font-bold hover:bg-rose-200 dark:hover:bg-rose-900 cursor-pointer disabled:opacity-50"
            >
              ✕ Mark All Absent
            </button>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex items-center gap-3">
          {isAdmin && isPast20Hours && (
            <label className="flex items-center gap-1.5 text-xs text-amber-600 dark:text-amber-400 font-semibold cursor-pointer">
              <input
                type="checkbox"
                checked={adminOverrideLock}
                onChange={(e) => setAdminOverrideLock(e.target.checked)}
                className="rounded border-slate-400 text-blue-600"
              />
              <span>Master Admin Override Lock</span>
            </label>
          )}

          <button
            onClick={handleSave}
            disabled={saving || isLocked}
            className="px-5 py-2.5 rounded-xl bg-[#1976d2] hover:bg-blue-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer disabled:opacity-50"
          >
            {saving ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Saving & Pushing...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Save & Push to Student Portal</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* 20-Hour Modification Rule Alert Badge */}
      {hasExistingLogs ? (
        !isPast20Hours ? (
          <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
              <span>
                <strong>20-Hour Edit Window Active:</strong> Attendance was recorded on this date. You have <strong>{hoursRemaining} hours remaining</strong> to modify or correct attendance records.
              </span>
            </div>
            <span className="px-2 py-0.5 rounded bg-emerald-200 dark:bg-emerald-900 font-bold text-[10px] shrink-0">
              Editable
            </span>
          </div>
        ) : (
          <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-300 text-xs flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Lock className="w-4 h-4 shrink-0 text-rose-600" />
              <span>
                <strong>Attendance Locked:</strong> More than 20 hours have elapsed since this attendance was recorded. As per coaching policy, changes are locked.
              </span>
            </div>
            <span className="px-2 py-0.5 rounded bg-rose-200 dark:bg-rose-900 font-bold text-[10px] shrink-0">
              Locked (20h Expired)
            </span>
          </div>
        )
      ) : (
        <div className="p-3.5 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-300 text-xs flex items-center gap-2">
          <Info className="w-4 h-4 shrink-0 text-blue-600" />
          <span>
            <strong>New Attendance Session:</strong> No attendance recorded yet for <strong>{selectedClass}</strong> on <strong>{attendanceDate}</strong>. Once saved, a 20-hour modification window starts.
          </span>
        </div>
      )}

      {/* Success / Error Messages */}
      {saveSuccessMsg && (
        <div className="p-3.5 rounded-xl bg-emerald-100 dark:bg-emerald-950 border border-emerald-300 dark:border-emerald-700 text-emerald-900 dark:text-emerald-200 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{saveSuccessMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-3.5 rounded-xl bg-rose-100 dark:bg-rose-950 border border-rose-300 dark:border-rose-700 text-rose-900 dark:text-rose-200 text-xs flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* 3. Class Student Attendance Table with Working Days & Percentage */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <h3 className="font-bold text-slate-800 dark:text-white text-xs uppercase tracking-wider">
            {selectedClass} Student Roster ({classStudents.length} Students)
          </h3>
          <span className="text-[11px] text-slate-500 dark:text-slate-400">
            Formula: (Attended Days ÷ Total Working Days) × 100
          </span>
        </div>

        {classStudents.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 uppercase tracking-wider border-b border-slate-200 dark:border-slate-700 text-[11px]">
                <tr>
                  <th className="p-3">Roll No</th>
                  <th className="p-3">Student Name</th>
                  <th className="p-3 text-center">Total Working Days</th>
                  <th className="p-3 text-center">Days Attended</th>
                  <th className="p-3 text-center">Attendance %</th>
                  <th className="p-3 text-center">Status for {attendanceDate}</th>
                  <th className="p-3">Teacher Reason / Remarks</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-800 dark:text-slate-200">
                {classStudents.map((s) => {
                  const stats = getStudentStats(s.id);
                  const currentStatus = attendanceMap[s.id]?.status || 'Present';

                  return (
                    <tr key={s.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40">
                      <td className="p-3 font-mono font-bold text-blue-600 dark:text-blue-400">
                        {s.rollNo}
                      </td>
                      <td className="p-3">
                        <div className="font-bold text-slate-900 dark:text-white">{s.name}</div>
                        <div className="text-[10px] text-slate-400">{s.grade} • {s.batch}</div>
                      </td>
                      <td className="p-3 text-center font-bold">
                        <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-mono">
                          {stats.workingDays} Days
                        </span>
                      </td>
                      <td className="p-3 text-center font-bold">
                        <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-mono">
                          {stats.attendedDays} Days
                        </span>
                      </td>
                      <td className="p-3 text-center">
                        <div className="inline-flex flex-col items-center">
                          <span className={`px-2.5 py-1 rounded-lg font-bold text-xs ${
                            stats.percentage >= 85 ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300' :
                            stats.percentage >= 75 ? 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300' :
                            stats.workingDays === 0 ? 'bg-slate-100 dark:bg-slate-800 text-slate-500' :
                            'bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300'
                          }`}>
                            {stats.workingDays > 0 ? `${stats.percentage}%` : 'New'}
                          </span>
                          {stats.workingDays > 0 && (
                            <span className="text-[10px] text-slate-400 mt-0.5">
                              ({stats.attendedDays}/{stats.workingDays})
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Status Selection Buttons */}
                      <td className="p-3 text-center">
                        <div className="inline-flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700">
                          <button
                            type="button"
                            disabled={isLocked}
                            onClick={() => setAttendanceMap({
                              ...attendanceMap,
                              [s.id]: { ...attendanceMap[s.id], status: 'Present', remarks: 'Present on time' }
                            })}
                            className={`px-3 py-1 rounded-lg font-bold text-[11px] transition-colors cursor-pointer disabled:opacity-50 ${
                              currentStatus === 'Present'
                                ? 'bg-emerald-600 text-white shadow'
                                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                            }`}
                          >
                            Present
                          </button>
                          <button
                            type="button"
                            disabled={isLocked}
                            onClick={() => setAttendanceMap({
                              ...attendanceMap,
                              [s.id]: { ...attendanceMap[s.id], status: 'Late', remarks: 'Late arrival' }
                            })}
                            className={`px-3 py-1 rounded-lg font-bold text-[11px] transition-colors cursor-pointer disabled:opacity-50 ${
                              currentStatus === 'Late'
                                ? 'bg-amber-600 text-white shadow'
                                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                            }`}
                          >
                            Late
                          </button>
                          <button
                            type="button"
                            disabled={isLocked}
                            onClick={() => setAttendanceMap({
                              ...attendanceMap,
                              [s.id]: { ...attendanceMap[s.id], status: 'Absent', remarks: 'Absent from class' }
                            })}
                            className={`px-3 py-1 rounded-lg font-bold text-[11px] transition-colors cursor-pointer disabled:opacity-50 ${
                              currentStatus === 'Absent'
                                ? 'bg-rose-600 text-white shadow'
                                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                            }`}
                          >
                            Absent
                          </button>
                        </div>
                      </td>

                      {/* Remarks Input */}
                      <td className="p-3">
                        <input
                          type="text"
                          disabled={isLocked}
                          placeholder="e.g. On time, doctor visit..."
                          value={attendanceMap[s.id]?.remarks || ''}
                          onChange={(e) => setAttendanceMap({
                            ...attendanceMap,
                            [s.id]: { ...attendanceMap[s.id], remarks: e.target.value }
                          })}
                          className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white text-xs focus:outline-none focus:border-blue-500 disabled:opacity-50"
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center text-slate-400 text-xs">
            No students found enrolled in {selectedClass}. Use "Add Student" to register students for this class.
          </div>
        )}
      </div>
    </div>
  );
}
