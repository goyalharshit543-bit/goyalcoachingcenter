import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { exportClassHierarchies } from './exportClassHierarchies.js';
import { 
  initRecordsDirectories, 
  rebuildEnrolledStudentsExcel, 
  rebuildMasterMarksAndTestsExcel 
} from '../server/recordManager.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.resolve(__dirname, '..');
const DATA_FILE = path.join(PROJECT_ROOT, 'server', 'data.json');

/**
 * clean_and_export.js
 * -------------------
 * Runs post‑sync clean‑up and generates Excel reports for all classes and marks registers.
 */

(async () => {
  try {
    console.log('🔧 Running clean‑up and Excel export...');
    if (fs.existsSync(DATA_FILE)) {
      const db = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
      initRecordsDirectories();
      rebuildEnrolledStudentsExcel(db.students || []);
      rebuildMasterMarksAndTestsExcel(db);
    }
    await exportClassHierarchies();
    console.log('✅ Export completed successfully with all student marks.');
  } catch (err) {
    console.error('❌ Export failed:', err);
    process.exit(1);
  }
})();
