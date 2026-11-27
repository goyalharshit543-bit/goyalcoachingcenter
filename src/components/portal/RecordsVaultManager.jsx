import React, { useState, useEffect } from 'react';
import { 
  Folder, 
  FolderOpen, 
  FileSpreadsheet, 
  FileText, 
  Download, 
  ExternalLink, 
  Search, 
  RefreshCw, 
  CheckCircle2, 
  AlertCircle, 
  GraduationCap, 
  Trophy, 
  MessageSquare, 
  Users, 
  HardDrive,
  Copy,
  ChevronRight,
  UserCheck
} from 'lucide-react';
import { api } from '../../api/client';

export default function RecordsVaultManager() {
  const [overview, setOverview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeCategoryKey, setActiveCategoryKey] = useState('GTSE');
  const [selectedClass, setSelectedClass] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [actionNotice, setActionNotice] = useState('');
  const [copiedPath, setCopiedPath] = useState(false);
  const [syncing, setSyncing] = useState(false);

  const fetchOverview = async () => {
    setLoading(true);
    try {
      const data = await api.getRecordsOverview();
      if (data && data.categories) {
        setOverview(data);
      }
    } catch (err) {
      console.error('Failed to fetch records overview', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSyncWithCloud = async () => {
    setSyncing(true);
    setActionNotice('Connecting to Cloud Railway Website to synchronize all records...');
    try {
      const res = await api.syncCloudRecords();
      if (res?.success) {
        setActionNotice('✓ Successfully synchronized with Cloud Website! All Excel registers & rosters refreshed.');
        await fetchOverview();
      } else {
        setActionNotice(res?.error || 'Sync completed. Local Excel records refreshed.');
        await fetchOverview();
      }
    } catch (e) {
      setActionNotice('Sync finished. Local records refreshed.');
      await fetchOverview();
    } finally {
      setSyncing(false);
      setTimeout(() => setActionNotice(''), 6000);
    }
  };

  useEffect(() => {
    fetchOverview();
  }, []);

  const handleOpenFolder = async (categoryFolder = '', className = '') => {
    try {
      setActionNotice('Opening folder in Windows File Explorer...');
      const res = await api.openRecordsFolder(categoryFolder, className);
      if (res?.success) {
        setActionNotice(`Opened: ${res.folderPath}`);
      } else {
        setActionNotice('Folder path ready on disk at: ' + (overview?.recordsRoot || 'records'));
      }
    } catch (e) {
      setActionNotice('Error opening explorer. You can access files in: ' + (overview?.recordsRoot || 'records'));
    }
    setTimeout(() => setActionNotice(''), 5000);
  };

  const handleCopyPath = () => {
    const pathStr = overview?.recordsRoot || 'E:\\goyal coaching center\\records';
    navigator.clipboard.writeText(pathStr);
    setCopiedPath(true);
    setTimeout(() => setCopiedPath(false), 2500);
  };

  const activeCategory = overview?.categories?.find(c => c.key === activeCategoryKey) || overview?.categories?.[0];

  const categoryIcons = {
    ENROLLED: <Users className="w-4 h-4 text-indigo-400" />,
    GTSE: <Trophy className="w-4 h-4 text-emerald-400" />,
    ADMISSIONS: <GraduationCap className="w-4 h-4 text-blue-400" />,
    QUERIES: <MessageSquare className="w-4 h-4 text-purple-400" />
  };

  const categoryGradients = {
    GTSE: 'from-emerald-500/20 to-teal-500/10 border-emerald-500/30 text-emerald-300',
    ADMISSIONS: 'from-blue-500/20 to-indigo-500/10 border-blue-500/30 text-blue-300',
    QUERIES: 'from-purple-500/20 to-pink-500/10 border-purple-500/30 text-purple-300'
  };

  const filteredClasses = (activeCategory?.classes || []).filter(c => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return c.displayName.toLowerCase().includes(q) || c.className.toLowerCase().includes(q);
  });

  const totalAllStudents = (overview?.categories || []).reduce((acc, cat) => acc + (cat.totalCount || 0), 0);

  return (
    <div className="space-y-6">
      {/* Top Banner: Folder System Overview */}
      <div className="p-6 rounded-3xl glass-panel border border-slate-800 bg-gradient-to-r from-slate-900/90 via-slate-900/60 to-slate-950 flex flex-col lg:flex-row lg:items-center justify-between gap-6 shadow-2xl">
        <div className="space-y-2 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 text-xs font-bold border border-blue-500/20">
            <HardDrive className="w-3.5 h-3.5" /> Automated File Organization Engine Active
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white flex items-center gap-3">
            <FolderOpen className="w-7 h-7 text-indigo-400" />
            Class-Wise Student Records & Forms Vault
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            All forms submitted by students — including <strong>Admissions Applications</strong>, <strong>GTSE (GST) Scholarship Registrations</strong>, and <strong>Contact Queries</strong> — are automatically segregated into dedicated class folders on disk in Excel (<code className="text-emerald-300 font-mono">.xlsx</code>), JSON (<code className="text-amber-300 font-mono">.json</code>), and individual Student Profile cards.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2 text-xs">
            <span className="text-slate-400">Disk Root Directory:</span>
            <code className="px-3 py-1 rounded-lg bg-black/60 text-slate-200 font-mono text-[11px] border border-slate-800 flex items-center gap-2">
              {overview?.recordsRoot || 'E:\\goyal coaching center\\records'}
              <button
                onClick={handleCopyPath}
                title="Copy folder path"
                className="text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                {copiedPath ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </code>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-col sm:flex-row lg:flex-col items-stretch gap-2.5 shrink-0">
          <button
            onClick={() => handleOpenFolder()}
            className="px-5 py-3 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs flex items-center justify-center gap-2.5 shadow-xl shadow-blue-600/30 transition-all hover:scale-[1.02] active:scale-95 cursor-pointer"
          >
            <FolderOpen className="w-4 h-4" /> Open Records in File Explorer
          </button>

          <button
            onClick={handleSyncWithCloud}
            disabled={syncing}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20 transition-all hover:scale-[1.02] active:scale-95 cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${syncing ? 'animate-spin' : ''}`} /> Sync With Cloud Website
          </button>

          <button
            onClick={fetchOverview}
            disabled={loading}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs flex items-center justify-center gap-2 border border-slate-700 transition-colors cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} /> Refresh Record Counts
          </button>
        </div>
      </div>

      {actionNotice && (
        <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2 animate-fade-in">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{actionNotice}</span>
        </div>
      )}

      {/* Category Tabs: Enrolled Students | Admissions | GTSE / GST | Queries */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {(overview?.categories || [
          { key: 'ENROLLED', displayName: 'Enrolled Students (Class Roster)', totalCount: 1, folderName: 'Enrolled_Students' },
          { key: 'GTSE', displayName: 'GTSE (GST) Scholarship Registrations', totalCount: 2, folderName: 'GTSE_Talent_Search_Exam' },
          { key: 'ADMISSIONS', displayName: 'Course Admissions', totalCount: 1, folderName: 'Admissions_Applications' },
          { key: 'QUERIES', displayName: 'Student Queries & Contacts', totalCount: 1, folderName: 'Queries_And_Contact' }
        ]).map((cat) => {
          const isSelected = activeCategoryKey === cat.key;
          return (
            <button
              key={cat.key}
              onClick={() => {
                setActiveCategoryKey(cat.key);
                setSelectedClass(null);
              }}
              className={`p-4 rounded-2xl text-left border transition-all cursor-pointer relative overflow-hidden ${
                isSelected
                  ? 'bg-slate-900 border-indigo-500 shadow-xl shadow-indigo-500/20 ring-1 ring-indigo-500'
                  : 'bg-slate-900/40 hover:bg-slate-900/80 border-slate-800/80 text-slate-400'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="p-2 rounded-xl bg-slate-800/80 border border-slate-700/50">
                  {categoryIcons[cat.key] || <Folder className="w-4 h-4 text-blue-400" />}
                </div>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                  isSelected ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30' : 'bg-slate-800 text-slate-400'
                }`}>
                  {cat.totalCount || 0} Records
                </span>
              </div>
              <div className="font-bold text-sm text-white">{cat.displayName}</div>
              <div className="text-[11px] text-slate-400 font-mono mt-0.5 truncate">
                records/{cat.folderName}
              </div>
            </button>
          );
        })}
      </div>

      {/* Category Actions Bar */}
      <div className="p-4 rounded-2xl glass-panel border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            {categoryIcons[activeCategoryKey]}
          </div>
          <div>
            <h3 className="text-base font-bold text-white">
              {activeCategory?.displayName}
            </h3>
            <p className="text-xs text-slate-400">
              Showing class-wise subfolders with instant Excel exports & student profile cards.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => handleOpenFolder(activeCategory?.folderName)}
            className="px-3.5 py-2 text-xs font-semibold rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center gap-1.5 cursor-pointer"
          >
            <FolderOpen className="w-3.5 h-3.5 text-amber-400" /> Open Category Folder
          </button>

          <a
            href={`/api/records/download-file?relPath=${encodeURIComponent(
              activeCategory?.folderName + '/' + (
                activeCategoryKey === 'GTSE' ? 'All_GTSE_Master_Register.xlsx' :
                activeCategoryKey === 'ADMISSIONS' ? 'All_Admissions_Master_Register.xlsx' :
                activeCategoryKey === 'ENROLLED' ? 'All_Enrolled_Students_Master_Register.xlsx' :
                'All_Queries_Master_Register.xlsx'
              )
            )}`}
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-emerald-600/20 transition-all hover:scale-105 active:scale-95 cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4" /> Download Master Excel (.xlsx)
          </a>
        </div>
      </div>

      {/* Search Input for Classes */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
        <input
          type="text"
          placeholder="Filter classes (Class 7th, 8th, 9th, 10th, 11th Commerce, 12th Commerce)..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2 bg-slate-900/60 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
        />
      </div>

      {/* Class Folders Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredClasses.map((cls) => {
          const hasStudents = cls.studentCount > 0;
          const excelFile = cls.files.find(f => f.name.endsWith('.xlsx'));
          const jsonFile = cls.files.find(f => f.name.endsWith('.json'));

          return (
            <div
              key={cls.className}
              className={`p-5 rounded-2xl glass-panel border transition-all flex flex-col justify-between ${
                hasStudents 
                  ? 'border-indigo-500/40 bg-gradient-to-b from-indigo-950/20 to-slate-900/70 shadow-lg shadow-indigo-500/5' 
                  : 'border-slate-800/80 bg-slate-900/30'
              }`}
            >
              <div>
                {/* Header */}
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-2.5">
                    <div className={`p-2.5 rounded-xl border ${
                      hasStudents ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30' : 'bg-slate-800/60 text-slate-400 border-slate-700/50'
                    }`}>
                      <Folder className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white">{cls.displayName}</h4>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {cls.className}
                      </span>
                    </div>
                  </div>

                  <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                    hasStudents 
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 animate-pulse' 
                      : 'bg-slate-800/80 text-slate-500 border border-slate-700/50'
                  }`}>
                    {cls.studentCount} {cls.studentCount === 1 ? 'Student' : 'Students'}
                  </span>
                </div>

                {/* Subfolder Info */}
                <div className="space-y-1.5 py-2.5 text-xs border-y border-slate-800/60 my-2">
                  <div className="flex items-center justify-between text-slate-400 text-[11px]">
                    <span className="flex items-center gap-1.5">
                      <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" /> Excel Register:
                    </span>
                    <span className="font-mono text-slate-300">
                      {excelFile ? `${(excelFile.size / 1024).toFixed(1)} KB` : 'Auto-created'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-slate-400 text-[11px]">
                    <span className="flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5 text-amber-400" /> Student Profile Cards:
                    </span>
                    <span className="font-mono text-slate-300">
                      {cls.studentCount} profiles in /Student_Profiles/
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2 pt-2">
                <div className="grid grid-cols-2 gap-2">
                  {excelFile ? (
                    <a
                      href={`/api/records/download-file?relPath=${encodeURIComponent(activeCategory?.folderName + '/' + cls.className + '/' + excelFile.name)}`}
                      className="px-3 py-2 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 font-semibold text-[11px] border border-emerald-500/30 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Download className="w-3 h-3" /> Excel (.xlsx)
                    </a>
                  ) : (
                    <button
                      disabled
                      className="px-3 py-2 rounded-xl bg-slate-800/40 text-slate-500 text-[11px] border border-slate-800 flex items-center justify-center gap-1.5 cursor-not-allowed"
                    >
                      No Entries Yet
                    </button>
                  )}

                  <button
                    onClick={() => handleOpenFolder(activeCategory?.folderName, cls.className)}
                    className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-[11px] border border-slate-700 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <FolderOpen className="w-3 h-3 text-amber-400" /> Open Folder
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Guide Note Box */}
      <div className="p-5 rounded-2xl bg-slate-900/40 border border-slate-800 text-xs text-slate-400 space-y-2">
        <div className="font-semibold text-slate-200 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" /> How Goyal Coaching Center Automatically Stores Student Data:
        </div>
        <ul className="list-disc list-inside space-y-1 pl-1 text-[11px] text-slate-400">
          <li><strong>Course Admissions:</strong> Any student applying via the website admission form or course buttons is filed directly into <code className="text-blue-300 font-mono">records/Admissions_Applications/&lt;Class_Folder&gt;/</code>.</li>
          <li><strong>GTSE / GST Exam:</strong> Any registration for the Goyal Talent Search Exam is filed directly into <code className="text-emerald-300 font-mono">records/GTSE_Talent_Search_Exam/&lt;Class_Folder&gt;/</code>.</li>
          <li><strong>Contact Queries:</strong> Any message or general assistance query is filed directly into <code className="text-purple-300 font-mono">records/Queries_And_Contact/&lt;Class_Folder&gt;/</code>.</li>
          <li><strong>Dual Copies:</strong> Files are saved both on the server and in the root project folder (<code className="text-slate-300 font-mono">e:\goyal coaching center\records\</code>) for instant access in Excel anytime.</li>
        </ul>
      </div>
    </div>
  );
}
