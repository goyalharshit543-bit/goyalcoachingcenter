import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.resolve(__dirname, '..');
const LOCAL_DATA_FILE = path.join(PROJECT_ROOT, 'server', 'data.json');

const REMOTE_URL = process.env.REMOTE_URL || 'https://goyalcoachingcenter.up.railway.app';

async function syncData() {
  const targetUrl = process.argv[2] || REMOTE_URL;
  console.log(`🔄 Pulling all live student & admission records from: ${targetUrl}...`);

  try {
    const res = await fetch(`${targetUrl.replace(/\/$/, '')}/api/data`);
    if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
    const remoteData = await res.json();

    // Create a local backup before overwriting
    if (fs.existsSync(LOCAL_DATA_FILE)) {
      const backupDir = path.join(PROJECT_ROOT, 'server', 'backups');
      if (!fs.existsSync(backupDir)) fs.mkdirSync(backupDir, { recursive: true });
      const backupPath = path.join(backupDir, `data.backup-${Date.now()}.json`);
      fs.copyFileSync(LOCAL_DATA_FILE, backupPath);
      console.log(`📁 Local backup saved to: server/backups/${path.basename(backupPath)}`);
    }

    fs.writeFileSync(LOCAL_DATA_FILE, JSON.stringify(remoteData, null, 2), 'utf8');
    console.log('🎉 SUCCESS: All online student registrations, GTSE submissions, admission enquiries, and test scores have been synced to your laptop!');
  } catch (err) {
    console.error('❌ Sync failed:', err.message);
    console.log('💡 Tip: You can pass your live URL directly: npm run sync -- https://your-live-url.com');
  }
}

syncData();
