export interface ScoringInput {
  difficulty: number;          // 1 à 5
  perfMax: number;             // ex: 100
  tOptMs: number;              // Temps optimal en ms
  tMaxMs: number;              // Temps limite pour bonus
  measuredCpuTimeMs: number;   // Médiane mesurée sur 5 runs
  allPassed: boolean;          // 100% des tests requis
}

export interface ScoreResult {
  validated: boolean;
  basePoints: number;
  perfPoints: number;
  totalScore: number;
  tOptMs: number;
  tMaxMs: number;
  measuredCpuTimeMs: number;
}

export class ScoringService {
  /**
   * Calcule le score selon les spécifications CodeQuest (Section 4.3)
   * Score = Points_base + Points_perf
   * Points_base = 100 * difficulté
   * Points_perf = Perf_max * clamp(1 - (t - t_opt)/(t_max - t_opt), 0, 1)
   * Avec tolérance de ±5% sur t_opt
   */
  public calculateScore(input: ScoringInput): ScoreResult {
    const { difficulty, perfMax, tOptMs, tMaxMs, measuredCpuTimeMs, allPassed } = input;

    // Si 100% des tests ne passent pas, le score est 0
    if (!allPassed) {
      return {
        validated: false,
        basePoints: 0,
        perfPoints: 0,
        totalScore: 0,
        tOptMs,
        tMaxMs,
        measuredCpuTimeMs,
      };
    }

    const basePoints = 100 * Math.max(1, difficulty);

    // Tolérance de 5% : si t <= tOpt * 1.05, considéré optimal
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

    return {
      validated: true,
      basePoints,
      perfPoints,
      totalScore: basePoints + perfPoints,
      tOptMs,
      tMaxMs,
      measuredCpuTimeMs,
    };
  }
}
