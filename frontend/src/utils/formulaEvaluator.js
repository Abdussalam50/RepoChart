/**
 * Mengevaluasi formula kustom berbasis baris data CSV secara dinamis.
 * 
 * @param {Object} row - Baris data CSV saat ini (objek key-value)
 * @param {Array} steps - Langkah-langkah formula (misal: [{operand: 'Klik', operator: '÷'}, ...])
 * @param {Object} columnMapping - Pemetaan nama operand ke kolom CSV sesungguhnya
 * @returns {Number} Hasil evaluasi formula
 */
export function evaluateFormula(row, steps, columnMapping = {}) {
  if (!steps || steps.length === 0) return 0;

  const resolve = (operand) => {
    if (operand === undefined || operand === null) return 0;
    
    // Jika operand adalah angka murni atau string angka konstanta
    if (typeof operand === 'number') return operand;
    if (!isNaN(Number(operand))) return Number(operand);
    
    // Cari nama kolom yang terpetakan atau nama operand langsung
    const col = columnMapping[operand] ?? operand;
    
    // Ambil nilai dari kolom baris CSV
    const rawVal = row[col];
    if (rawVal === undefined || rawVal === null) return 0;
    
    // Bersihkan koma dan spasi sebelum parsing float
    const cleanVal = String(rawVal).replace(/[,\s]/g, '');
    return parseFloat(cleanVal) || 0;
  };

  try {
    let result = resolve(steps[0].operand);

    for (let i = 1; i < steps.length; i++) {
      const val = resolve(steps[i].operand);
      const op = steps[i - 1].operator;
      
      if (op === '÷') {
        result = val !== 0 ? result / val : 0;
      } else if (op === '×') {
        result = result * val;
      } else if (op === '+') {
        result = result + val;
      } else if (op === '−') {
        result = result - val;
      }
    }

    return isNaN(result) || !isFinite(result) ? 0 : result;
  } catch (error) {
    console.error('Error evaluating formula:', error);
    return 0;
  }
}
