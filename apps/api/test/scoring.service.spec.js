const assert = require('assert');

// Test standalone de la logique de calcul de score
function calculateScore(input) {
  const { difficulty, perfMax, tOptMs, tMaxMs, measuredCpuTimeMs, allPassed } = input;

  if (!allPassed) {
    return { validated: false, basePoints: 0, perfPoints: 0, totalScore: 0 };
  }

  const basePoints = 100 * Math.max(1, difficulty);
  let effectiveT = measuredCpuTimeMs;
  const toleranceMargin = tOptMs * 0.05;
  if (effectiveT <= tOptMs + toleranceMargin) {
    effectiveT = tOptMs;
  }

  let perfPoints = 0;
  if (tMaxMs > tOptMs) {
    const ratio = 1 - (effectiveT - tOptMs) / (tMaxMs - tOptMs);
    const clampedRatio = Math.max(0, Math.min(1, ratio));
    perfPoints = Math.round(perfMax * clampedRatio);
  } else if (effectiveT <= tOptMs) {
    perfPoints = perfMax;
  }

  return { validated: true, basePoints, perfPoints, totalScore: basePoints + perfPoints };
}

console.log('🧪 Tests de la formule de Scoring (Section 4.3)...');

// 1. Échec des tests -> 0 point
{
  const res = calculateScore({ difficulty: 3, perfMax: 100, tOptMs: 10, tMaxMs: 50, measuredCpuTimeMs: 12, allPassed: false });
  assert.strictEqual(res.totalScore, 0);
  assert.strictEqual(res.validated, false);
  console.log('✅ Échec de validation -> 0 point');
}

// 2. Performance optimale -> Score max
{
  const res = calculateScore({ difficulty: 2, perfMax: 50, tOptMs: 10, tMaxMs: 50, measuredCpuTimeMs: 8, allPassed: true });
  assert.strictEqual(res.basePoints, 200);
  assert.strictEqual(res.perfPoints, 50);
  assert.strictEqual(res.totalScore, 250);
  console.log('✅ Temps optimal -> Points base (200) + Perf max (50) = 250');
}

// 3. Performance médiane -> 50% du bonus
{
  const res = calculateScore({ difficulty: 1, perfMax: 100, tOptMs: 10, tMaxMs: 50, measuredCpuTimeMs: 30, allPassed: true });
  assert.strictEqual(res.basePoints, 100);
  assert.strictEqual(res.perfPoints, 50);
  assert.strictEqual(res.totalScore, 150);
  console.log('✅ Temps médian -> 50% du bonus');
}

// 4. Performance au-delà de t_max -> 0 bonus perf mais points de base acquis
{
  const res = calculateScore({ difficulty: 4, perfMax: 100, tOptMs: 10, tMaxMs: 50, measuredCpuTimeMs: 100, allPassed: true });
  assert.strictEqual(res.basePoints, 400);
  assert.strictEqual(res.perfPoints, 0);
  assert.strictEqual(res.totalScore, 400);
  console.log('✅ Dépassement t_max -> 0 bonus mais points base conservés');
}

// 5. Plage de tolérance ±5%
{
  const res = calculateScore({ difficulty: 1, perfMax: 100, tOptMs: 100, tMaxMs: 200, measuredCpuTimeMs: 104, allPassed: true });
  assert.strictEqual(res.perfPoints, 100); // 104 <= 105 (100 + 5%)
  console.log('✅ Tolérance ±5% prise en compte');
}

console.log('🎉 Tous les tests de scoring sont validés !');
