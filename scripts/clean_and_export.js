import { exportClassHierarchies } from './exportClassHierarchies.js';

/**
 * clean_and_export.js
 * -------------------
 * Runs post‑sync clean‑up and generates Excel reports for all classes.
 * The sync process already respects `deletedStudentRolls`, so the exported
 * Excel files will reflect the data after those eight students have been
 * removed.
 */

(async () => {
  try {
    console.log('🔧 Running clean‑up and Excel export...');
    await exportClassHierarchies();
    console.log('✅ Export completed.');
  } catch (err) {
    console.error('❌ Export failed:', err);
    process.exit(1);
  }
})();
