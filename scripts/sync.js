import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { migrateExistingRecords, initRecordsDirectories } from '../server/recordManager.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.resolve(__dirname, '..');
const LOCAL_DATA_FILE = path.join(PROJECT_ROOT, 'server', 'data.json');

const DEFAULT_GLOBAL_URL = 'https://goyal-coaching-web-production.up.railway.app';

async function syncData() {
  const targetUrl = process.argv[2] || process.env.REMOTE_URL || DEFAULT_GLOBAL_URL;
  console.log(`=======================================================`);
  console.log(`[GOYAL COACHING CENTER] SYNCING FROM GLOBAL CLOUD HOST`);
  console.log(`Connecting to: ${targetUrl}...`);
  console.log(`=======================================================`);

  try {
    const res = await fetch(`${targetUrl.replace(/\/$/, '')}/api/data`);
    if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
    const remoteData = await res.json();

    // Check count of items before and after
    let oldEnquiriesCount = 0;
    let oldGTSECount = 0;
    if (fs.existsSync(LOCAL_DATA_FILE)) {
      try {
        const oldDb = JSON.parse(fs.readFileSync(LOCAL_DATA_FILE, 'utf8'));
        oldEnquiriesCount = (oldDb.enquiries || []).length;
        oldGTSECount = (oldDb.gtseRegistrations || []).length;
      } catch {}
      
      const backupDir = path.join(PROJECT_ROOT, 'server', 'backups');
      if (!fs.existsSync(backupDir)) fs.mkdirSync(backupDir, { recursive: true });
      const backupPath = path.join(backupDir, `data.backup-${Date.now()}.json`);
      fs.copyFileSync(LOCAL_DATA_FILE, backupPath);
    }

    // Save remote data to local data.json
    fs.writeFileSync(LOCAL_DATA_FILE, JSON.stringify(remoteData, null, 2), 'utf8');

    // Update all local Excel sheets and class records folders
    initRecordsDirectories();
    migrateExistingRecords(remoteData);

    const newEnquiriesCount = (remoteData.enquiries || []).length;
    const newGTSECount = (remoteData.gtseRegistrations || []).length;
    const addedEnquiries = Math.max(0, newEnquiriesCount - oldEnquiriesCount);
    const addedGTSE = Math.max(0, newGTSECount - oldGTSECount);

    console.log(`SUCCESS: Cloud data successfully pulled to your laptop!`);
    console.log(`- Total Enquiries & Admissions: ${newEnquiriesCount} (${addedEnquiries} new while offline)`);
    console.log(`- Total GTSE Registrations: ${newGTSECount} (${addedGTSE} new while offline)`);
    console.log(`- Excel registers updated in: records/`);
    console.log(`=======================================================`);
  } catch (err) {
    console.error(`Sync notice: Could not reach ${targetUrl} (${err.message}).`);
    console.log(`Will retry on next laptop startup or when manually running 'npm run sync'.`);
  }
}

syncData();
