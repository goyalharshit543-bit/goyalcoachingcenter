/**
 * Normalizes and extracts standard class identifiers (e.g. '7', '8', '9', '10', '11', '12')
 * and stream information (e.g. 'commerce', 'science', 'arts') to ensure clean class-wise partitioning.
 */

export function extractGradeNumber(str) {
  if (!str) return '';
  const s = String(str).toLowerCase().trim();
  
  // Check two-digit first to prevent 1 matching 10/11/12
  if (/\b12\b|twelve|xii/i.test(s)) return '12';
  if (/\b11\b|eleven|xi/i.test(s)) return '11';
  if (/\b10\b|ten|x\b/i.test(s)) return '10';
  if (/\b9\b|nine|ix/i.test(s)) return '9';
  if (/\b8\b|eight|viii/i.test(s)) return '8';
  if (/\b7\b|seven|vii/i.test(s)) return '7';
  if (/\b6\b|six|vi\b/i.test(s)) return '6';

  // Fallback regex for pure digits
  const numMatch = s.match(/\d+/);
  if (numMatch) return numMatch[0];

  return '';
}

export function isSameClass(classA, classB) {
  if (!classA || !classB) return false;
  const gradeA = extractGradeNumber(classA);
  const gradeB = extractGradeNumber(classB);
  
  if (!gradeA || !gradeB) return false;
  if (gradeA !== gradeB) return false;

  // For 11th and 12th, also verify stream if specified
  if (gradeA === '11' || gradeA === '12') {
    const sA = String(classA).toLowerCase();
    const sB = String(classB).toLowerCase();
    const isCommA = sA.includes('comm');
    const isCommB = sB.includes('comm');
    const isSciA = sA.includes('sci');
    const isSciB = sB.includes('sci');

    if ((isCommA && isSciB) || (isSciA && isCommB)) {
      return false;
    }
  }

  return true;
}

export function getCanonicalClassName(gradeOrBatch) {
  const g = extractGradeNumber(gradeOrBatch);
  const s = String(gradeOrBatch || '').toLowerCase();
  if (g === '7') return 'Class 7th';
  if (g === '8') return 'Class 8th';
  if (g === '9') return 'Class 9th';
  if (g === '10') return 'Class 10th';
  if (g === '11') return s.includes('sci') ? 'Class 11th Science' : 'Class 11th Commerce';
  if (g === '12') return s.includes('sci') ? 'Class 12th Science' : 'Class 12th Commerce';
  return gradeOrBatch ? String(gradeOrBatch) : 'Unassigned';
}
