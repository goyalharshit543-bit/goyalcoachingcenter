import { useState } from 'react';
import { 
  Award, 
  Calendar, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  TrendingUp, 
  RotateCw, 
  Printer, 
  Sparkles,
  FileCheck2,
  BookOpen,
  UserCheck
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid 
} from 'recharts';

export default function ReportCardFlip3D({ student, attendance, tests, instituteInfo }) {
  const [isFlipped, setIsFlipped] = useState(false);

  // Prepare chart data from tests
  const chartData = (tests || []).slice().reverse().map((t, idx) => ({
    name: t.title.length > 18 ? t.title.substring(0, 16) + '...' : t.title,
    date: t.date,
    marks: Number(t.percentage || 0),
    avg: Number(t.avgMarks && t.maxMarks ? ((t.avgMarks / t.maxMarks) * 100).toFixed(1) : 65)
  }));

  const handlePrint = () => {
    window.print();
  };

  const totalClasses = attendance?.totalClasses ?? 0;
  const attendanceRate = totalClasses > 0 ? (attendance?.percentage ?? student?.attendancePercentage ?? 0) : 0;
  const isGoodAttendance = attendanceRate >= 85;
  const isAvgAttendance = attendanceRate >= 75 && attendanceRate < 85;
  const testsCount = tests?.length ?? 0;
  const hasAcademicScore = testsCount > 0 && Number(student?.overallPercentage) > 0;

  return (
    <div className="w-full">
      {/* 3D Flip Card Container */}
      <div className="perspective-2000 w-full min-h-[660px]">
        {/* Controls Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4 no-print">
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase tracking-wider font-semibold text-amber-400 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" /> 3D Interactive Report Card
            </span>
            <span className="text-xs text-slate-400">
              (Viewing: <strong className="text-white">{isFlipped ? 'Attendance & Discipline Record' : 'Academic Marks & Test Analysis'}</strong>)
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsFlipped(!isFlipped)}
              className="px-4 py-2 text-xs font-semibold rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-lg shadow-blue-500/20 flex items-center gap-2 transition-all transform active:scale-95 cursor-pointer"
            >
              <RotateCw className="w-3.5 h-3.5 animate-spin-reverse" />
              Flip to {isFlipped ? 'Marks & Ranks' : 'Attendance Record'}
            </button>
            <button
              onClick={handlePrint}
              className="px-4 py-2 text-xs font-semibold rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center gap-2 transition-all cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              Print / Save PDF
            </button>
          </div>
        </div>

        {/* 3D Flipping Card Body */}
        <div
          className={`relative w-full transition-transform duration-700 transform-style-3d ${
            isFlipped ? 'rotate-y-180' : ''
          }`}
          style={{ minHeight: '680px' }}
        >
          {/* ================= FRONT SIDE: Academic Marks & Analysis ================= */}
          <div className="w-full h-full rounded-3xl glass-panel-glow p-6 sm:p-8 backface-hidden border border-blue-500/30">
            {/* Institute Official Crest Header */}
            <div className="flex items-center justify-between pb-3.5 mb-5 border-b border-amber-500/30">
              <div className="flex items-center gap-2.5">
                <img
                  src="/goyal-logo.png"
                  alt="Goyal Coaching Centre"
                  className="w-10 h-10 rounded-full object-cover border border-amber-400 bg-white p-0.5 shadow-md shadow-amber-500/20"
                />
                <div>
                  <div className="text-sm font-black text-white tracking-wide leading-none font-outfit">
                    GOYAL COACHING CENTRE
                  </div>
                  <div className="text-[10px] font-serif italic text-amber-300 mt-0.5">
                    "Build a Better Future"
                  </div>
                </div>
              </div>
              <div className="text-[10px] uppercase font-mono font-bold text-amber-300 bg-blue-950/80 px-2.5 py-1 rounded-full border border-blue-500/40">
                Official Academic Transcripts • Session 2026-27
              </div>
            </div>

            {/* Header info */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
              <div className="flex items-center gap-4">
                <img
                  src={student.photo}
                  alt={student.name}
                  className="w-16 h-16 rounded-2xl object-cover ring-2 ring-blue-500/40 shadow-xl"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-2xl font-bold text-white tracking-tight">{student.name}</h2>
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-500/20 text-blue-400 border border-blue-500/30">
                      {student.grade}
                    </span>
                  </div>
                  <p className="text-sm text-slate-400 mt-0.5">
                    Roll No: <span className="font-mono text-amber-300 font-bold">{student.rollNo}</span> • Batch: <span className="text-slate-300">{student.batch}</span>
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Parent: {student.parentName} ({student.parentPhone})
                  </p>
                </div>
              </div>

              {/* Performance Score Badge */}
              <div className="flex items-center gap-3 bg-slate-900/80 p-3 rounded-2xl border border-slate-800">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-yellow-600 flex items-center justify-center text-slate-950 font-black text-xl shadow-lg shadow-amber-500/20">
                  {student.batchRank && hasAcademicScore ? `#${student.batchRank}` : '-'}
                </div>
                <div>
                  <div className="text-xs text-slate-400 font-medium">Batch Rank</div>
                  <div className="text-base font-bold text-amber-300">
                    {student.batchRank && hasAcademicScore
                      ? `Top ${Math.round(((student.batchRank) / (student.totalBatchStudents || 40)) * 100)}% of Batch`
                      : 'New Admission'}
                  </div>
                  <div className="text-[11px] text-slate-500">
                    {hasAcademicScore ? `Overall: ${student.overallPercentage}%` : 'No Tests Taken Yet'}
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Metrics Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 my-6">
              <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80">
                <div className="text-xs text-slate-400 flex items-center gap-1.5 mb-1">
                  <Award className="w-4 h-4 text-amber-400" /> Overall Score
                </div>
                <div className="text-2xl font-black text-amber-400">
                  {hasAcademicScore ? `${student.overallPercentage}%` : 'N/A'}
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5">
                  {hasAcademicScore ? 'Evaluated Distinction' : 'No Tests Taken Yet'}
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80">
                <div className="text-xs text-slate-400 flex items-center gap-1.5 mb-1">
                  <UserCheck className="w-4 h-4 text-emerald-400" /> Attendance
                </div>
                <div className="text-2xl font-black text-emerald-400">{attendanceRate}%</div>
                <div className="text-[11px] text-slate-500 mt-0.5">
                  {totalClasses > 0 ? `${totalClasses} Days Monitored` : '0 Days Monitored'}
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80">
                <div className="text-xs text-slate-400 flex items-center gap-1.5 mb-1">
                  <FileCheck2 className="w-4 h-4 text-blue-400" /> Tests Taken
                </div>
                <div className="text-2xl font-black text-blue-400">{tests?.length || 0}</div>
                <div className="text-[11px] text-slate-500 mt-0.5">Weekly & Grand Mock</div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80">
                <div className="text-xs text-slate-400 flex items-center gap-1.5 mb-1">
                  <Sparkles className="w-4 h-4 text-purple-400" /> Target Goal
                </div>
                <div className="text-sm font-bold text-purple-300 leading-tight mt-1">
                  {student.targetExam || 'IIT-JEE / CBSE Boards'}
                </div>
              </div>
            </div>

            {/* Performance Chart */}
            <div className="mb-6 p-5 rounded-2xl bg-slate-900/40 border border-slate-800">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-blue-400" /> Test Marks Progression vs. Batch Average
                </h3>
                <div className="flex items-center gap-4 text-xs">
                  <span className="flex items-center gap-1.5 text-blue-400">
                    <span className="w-3 h-3 rounded-full bg-blue-500 inline-block"></span> {student.name}'s Score
                  </span>
                  <span className="flex items-center gap-1.5 text-slate-400">
                    <span className="w-3 h-3 rounded-full bg-slate-600 inline-block"></span> Batch Avg
                  </span>
                </div>
              </div>

              {chartData.length > 0 ? (
                <div className="h-52 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="studentScoreGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4}/>
                          <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                      <XAxis dataKey="name" stroke="#64748b" tick={{ fontSize: 11 }} />
                      <YAxis stroke="#64748b" domain={[0, 100]} tick={{ fontSize: 11 }} />
                      <Tooltip
                        contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px' }}
                        labelStyle={{ color: '#f8fafc', fontWeight: 'bold' }}
                      />
                      <Area type="monotone" dataKey="marks" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#studentScoreGrad)" name="Student Marks %" />
                      <Area type="monotone" dataKey="avg" stroke="#64748b" strokeWidth={2} strokeDasharray="4 4" fill="none" name="Batch Average %" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <p className="text-center py-8 text-sm text-slate-400">No test data recorded yet.</p>
              )}
            </div>

            {/* Test History List */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-amber-400" /> Recent Test Details & Subject Breakdown
              </h3>

              <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
                {(tests || []).map((t, idx) => (
                  <div key={idx} className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition-colors">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-white text-sm">{t.title}</span>
                          <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-400 border border-blue-500/20">
                            {t.type}
                          </span>
                        </div>
                        <div className="text-xs text-slate-400 mt-0.5">
                          Date: <span className="text-slate-300">{t.date}</span> • Highest Score: <span className="text-amber-400">{t.highestMarks}/{t.maxMarks}</span> • Batch Avg: {t.avgMarks}
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <div className="text-base font-black text-amber-400">
                            {t.marksObtained} <span className="text-xs text-slate-400 font-normal">/ {t.maxMarks}</span>
                          </div>
                          <div className="text-[11px] text-slate-400 font-medium">
                            Rank #{t.rank || 1} • {t.percentage}%
                          </div>
                        </div>
                        <span className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center font-bold text-xs">
                          {t.grade || 'A+'}
                        </span>
                      </div>
                    </div>

                    {/* Breakdown subjects if present */}
                    {t.breakdown && t.breakdown.length > 0 && (
                      <div className="mt-2.5 pt-2 border-t border-slate-800/80 flex flex-wrap gap-2">
                        {t.breakdown.map((sb, sidx) => (
                          <span key={sidx} className="text-[11px] px-2 py-1 rounded bg-slate-800 text-slate-300">
                            {sb.subject}: <strong className="text-white">{sb.scored}/{sb.max}</strong>
                          </span>
                        ))}
                      </div>
                    )}

                    {t.feedback && (
                      <p className="mt-2 text-xs italic text-slate-400 bg-slate-950/40 p-2 rounded-lg border-l-2 border-amber-500">
                        "{t.feedback}"
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Teacher remarks */}
            {student.teacherRemarks && (
              <div className="mt-5 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30">
                <div className="text-xs font-semibold text-amber-400 uppercase tracking-wider mb-1">
                  Faculty Mentor Feedback ({student.mentorFaculty || 'Er. Alok Goyal'})
                </div>
                <p className="text-sm text-slate-200">"{student.teacherRemarks}"</p>
              </div>
            )}
          </div>

          {/* ================= BACK SIDE: Attendance & Discipline Record ================= */}
          <div className="absolute inset-0 w-full h-full rounded-3xl glass-panel-glow p-6 sm:p-8 backface-hidden rotate-y-180 border border-emerald-500/30 overflow-y-auto">
            {/* Institute Official Crest Header */}
            <div className="flex items-center justify-between pb-3.5 mb-5 border-b border-amber-500/30">
              <div className="flex items-center gap-2.5">
                <img
                  src="/goyal-logo.png"
                  alt="Goyal Coaching Centre"
                  className="w-10 h-10 rounded-full object-cover border border-amber-400 bg-white p-0.5 shadow-md shadow-amber-500/20"
                />
                <div>
                  <div className="text-sm font-black text-white tracking-wide leading-none font-outfit">
                    GOYAL COACHING CENTRE
                  </div>
                  <div className="text-[10px] font-serif italic text-amber-300 mt-0.5">
                    "Build a Better Future"
                  </div>
                </div>
              </div>
              <div className="text-[10px] uppercase font-mono font-bold text-emerald-300 bg-emerald-950/80 px-2.5 py-1 rounded-full border border-emerald-500/40">
                Official Biometric Attendance Ledger
              </div>
            </div>

            {/* Header info */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
              <div>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  Official Attendance & Attendance Log
                </span>
                <h2 className="text-2xl font-bold text-white mt-1">{student.name}'s Attendance Record</h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Roll No: {student.rollNo} • Batch: {student.batch} • Academic Year 2026-27
                </p>
              </div>

              {/* Attendance percentage indicator */}
              <div className="flex items-center gap-3 bg-slate-900/90 p-3 rounded-2xl border border-slate-800">
                <div className={`w-14 h-14 rounded-2xl flex flex-col items-center justify-center font-black text-xl shadow-lg ${
                  isGoodAttendance 
                    ? 'bg-emerald-500 text-slate-950 shadow-emerald-500/20' 
                    : isAvgAttendance
                    ? 'bg-amber-500 text-slate-950 shadow-amber-500/20'
                    : 'bg-rose-500 text-white shadow-rose-500/20'
                }`}>
                  {attendanceRate}%
                </div>
                <div>
                  <div className="text-xs font-semibold text-white">
                    {isGoodAttendance ? 'Excellent Attendance' : isAvgAttendance ? 'Average Attendance' : 'Low Attendance Alert'}
                  </div>
                  <div className="text-[11px] text-slate-400">
                    {isGoodAttendance ? 'Eligible for all exams & honors' : 'Compulsory 85% requirement'}
                  </div>
                </div>
              </div>
            </div>

            {/* Attendance Counters */}
            <div className="grid grid-cols-3 gap-3 my-6">
              <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-center">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 mx-auto mb-1" />
                <div className="text-2xl font-black text-emerald-400">{attendance?.presentCount ?? 23}</div>
                <div className="text-xs text-emerald-300 font-medium">Days Present</div>
              </div>

              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-center">
                <Clock className="w-5 h-5 text-amber-400 mx-auto mb-1" />
                <div className="text-2xl font-black text-amber-400">{attendance?.lateCount ?? 1}</div>
                <div className="text-xs text-amber-300 font-medium">Late Marks</div>
              </div>

              <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-center">
                <XCircle className="w-5 h-5 text-rose-400 mx-auto mb-1" />
                <div className="text-2xl font-black text-rose-400">{attendance?.absentCount ?? 1}</div>
                <div className="text-xs text-rose-300 font-medium">Days Absent</div>
              </div>
            </div>

            {/* Attendance Day-by-Day Log */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-emerald-400" /> Day-by-Day Biometric & Faculty Attendance Register
                </h3>
                <span className="text-xs text-slate-400">Real-time sync</span>
              </div>

              <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                {(attendance?.logs || []).map((log, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-slate-900/70 border border-slate-800/80 flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-3">
                      <div className="font-mono font-medium text-slate-300">{log.date}</div>
                      <span className={`px-2 py-0.5 rounded-full font-semibold ${
                        log.status === 'Present'
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : log.status === 'Late'
                          ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                          : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                      }`}>
                        {log.status}
                      </span>
                    </div>

                    <div className="flex items-center gap-4 text-slate-400">
                      <span>Time In: <strong className="text-slate-300">{log.timeIn || '07:00 AM'}</strong></span>
                      <span className="italic text-slate-400">{log.remarks || 'Standard session'}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Attendance rule alert */}
            <div className="mt-6 p-4 rounded-2xl bg-slate-900/90 border border-slate-800 flex items-start gap-3">
              <Calendar className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-semibold text-white uppercase tracking-wider">
                  Compulsory Institute Attendance Policy
                </h4>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  As per Goyal Coaching Center academic regulations, minimum <strong>85% attendance</strong> is mandatory to remain eligible for All India Mock Test Series, scholarship renewals, and faculty recommendation letters. If the student is sick, parents must submit leave intimation in advance.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Print only official Report Card layout */}
      <div className="hidden print-only p-8 text-black bg-white">
        <div className="border-b-2 border-black pb-4 mb-4 text-center">
          <h1 className="text-3xl font-black uppercase tracking-wider">{instituteInfo?.name || 'Goyal Coaching Center'}</h1>
          <p className="text-sm font-semibold">{instituteInfo?.address || 'SCO 42-45, Educational Complex, Sector 14, Main Road, New Delhi'}</p>
          <p className="text-xs text-gray-600">Phone: {instituteInfo?.phone} • Email: {instituteInfo?.email}</p>
          <h2 className="text-lg font-bold uppercase mt-3 underline">Student Academic & Attendance Performance Ledger</h2>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
          <div>
            <p><strong>Student Name:</strong> {student.name}</p>
            <p><strong>Roll Number:</strong> {student.rollNo}</p>
            <p><strong>Class & Stream:</strong> {student.grade} - {student.stream}</p>
            <p><strong>Batch:</strong> {student.batch}</p>
          </div>
          <div>
            <p><strong>Parent / Guardian:</strong> {student.parentName}</p>
            <p><strong>Contact Phone:</strong> {student.parentPhone}</p>
            <p><strong>Overall Percentage:</strong> {student.overallPercentage}%</p>
            <p><strong>Attendance Rate:</strong> {attendanceRate}%</p>
          </div>
        </div>

        <h3 className="font-bold text-base mb-2 border-b pb-1">Test Scores Record</h3>
        <table className="w-full text-xs border-collapse border border-gray-400 mb-6">
          <thead>
            <tr className="bg-gray-200">
              <th className="border border-gray-400 p-2 text-left">Test Name</th>
              <th className="border border-gray-400 p-2 text-center">Date</th>
              <th className="border border-gray-400 p-2 text-center">Max</th>
              <th className="border border-gray-400 p-2 text-center">Scored</th>
              <th className="border border-gray-400 p-2 text-center">%</th>
              <th className="border border-gray-400 p-2 text-center">Rank</th>
              <th className="border border-gray-400 p-2 text-left">Teacher's Note</th>
            </tr>
          </thead>
          <tbody>
            {(tests || []).map((t, idx) => (
              <tr key={idx}>
                <td className="border border-gray-400 p-2 font-medium">{t.title}</td>
                <td className="border border-gray-400 p-2 text-center">{t.date}</td>
                <td className="border border-gray-400 p-2 text-center">{t.maxMarks}</td>
                <td className="border border-gray-400 p-2 text-center font-bold">{t.marksObtained}</td>
                <td className="border border-gray-400 p-2 text-center">{t.percentage}%</td>
                <td className="border border-gray-400 p-2 text-center">#{t.rank || 1}</td>
                <td className="border border-gray-400 p-2 italic">{t.feedback || 'Good attempt'}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="mt-8 pt-4 border-t border-gray-400 flex justify-between text-xs">
          <div>
            <p>Date of Issue: {new Date().toLocaleDateString()}</p>
            <p className="mt-8">________________________</p>
            <p className="font-semibold">Parent's Signature</p>
          </div>
          <div className="text-center">
            <p className="mt-12 font-bold text-gray-700">[ GCC OFFICIAL SEAL ]</p>
          </div>
          <div className="text-right">
            <p>Verification QR: GCC-VERIFIED</p>
            <p className="mt-8">________________________</p>
            <p className="font-semibold">Director / Academic Head</p>
          </div>
        </div>
      </div>
    </div>
  );
}
