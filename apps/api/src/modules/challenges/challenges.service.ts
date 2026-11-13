import { createRequire } from 'module';
import { INITIAL_CHALLENGES } from './challenges.data.ts';
import type { Challenge, TestCase } from './challenges.data.ts';
import { ScoringService } from '../scoring/scoring.service.ts';
import type { ScoreResult } from '../scoring/scoring.service.ts';
import { LeaderboardService } from '../leaderboard/leaderboard.service.ts';

const require = createRequire(import.meta.url);
const { executeCode } = require('../../../../../services/runner/src/runner.js');

export interface SubmissionRecord {
  id: string;
  challengeId: string;
  userId: string;
  pseudo: string;
  language: 'python' | 'javascript';
  code: string;
  status: string;
  allPassed: boolean;
  score: ScoreResult;
  medianCpuTimeMs: number;
  testResults: any[];
  createdAt: string;
}

export class ChallengesService {
  private challenges: Challenge[] = INITIAL_CHALLENGES;
  private submissions: Map<string, SubmissionRecord> = new Map();
  private scoringService = new ScoringService();
  private leaderboardService: LeaderboardService;

  constructor(leaderboardService: LeaderboardService) {
    this.leaderboardService = leaderboardService;
  }

  /**
   * Liste les défis (avec masquage des tests cachés et solutions pour le front)
   */
  public getChallenges(theme?: string) {
    return this.challenges
      .filter(c => !theme || c.theme.toLowerCase() === theme.toLowerCase())
      .map(c => this.sanitizeChallengeForClient(c));
  }

  /**
   * Récupère un défi par son ID ou slug
   */
  public getChallengeById(idOrSlug: string) {
    const challenge = this.challenges.find(c => c.id === idOrSlug || c.slug === idOrSlug);
    if (!challenge) return null;
    return this.sanitizeChallengeForClient(challenge);
  }

  /**
   * Exécute et évalue la soumission d'un code utilisateur
   */
  public async submitChallenge(
    challengeId: string,
    dto: {
      code: string;
      language: 'python' | 'javascript';
      userId?: string;
      pseudo?: string;
    }
  ): Promise<SubmissionRecord> {
    const challenge = this.challenges.find(c => c.id === challengeId || c.slug === challengeId);
    if (!challenge) {
      throw new Error(`Défi introuvable avec l'identifiant '${challengeId}'`);
    }

    const userId = dto.userId || 'runner_current';
    const pseudo = dto.pseudo || 'Runner Anonyme';
    const entrypoint = challenge.entrypoint[dto.language] || (dto.language === 'python' ? 'sort_list' : 'sortList');

    // Appel du Runner avec la totalité des tests (visibles + cachés)
    const runnerResponse = await executeCode({
      language: dto.language,
      code: dto.code,
      entrypoint,
      tests: challenge.tests,
      runs: 5,
      timeoutMs: 4000
    });

    const allPassed = !!runnerResponse.allPassed;
    const medianCpuTimeMs = runnerResponse.medianCpuTimeMs || 0;

    // Calcul du score selon les règles officielles
    const scoreResult = this.scoringService.calculateScore({
      difficulty: challenge.difficulty,
      perfMax: challenge.perfMax,
      tOptMs: challenge.tOptMs,
      tMaxMs: challenge.tMaxMs,
      measuredCpuTimeMs: medianCpuTimeMs,
      allPassed
    });

    const submissionId = `sub_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
    const record: SubmissionRecord = {
      id: submissionId,
      challengeId: challenge.id,
      userId,
      pseudo,
      language: dto.language,
      code: dto.code,
      status: runnerResponse.status || (allPassed ? 'SUCCESS' : 'FAILED'),
      allPassed,
      score: scoreResult,
      medianCpuTimeMs,
      testResults: runnerResponse.results || [],
      createdAt: new Date().toISOString()
    };

    this.submissions.set(submissionId, record);

    // Si validé, mise à jour du leaderboard
    if (scoreResult.validated && scoreResult.totalScore > 0) {
      this.leaderboardService.updatePlayerScore(userId, pseudo, scoreResult.totalScore);
    }

    return record;
  }

  /**
   * Récupère le détail d'une soumission
   */
  public getSubmissionById(id: string): SubmissionRecord | null {
    return this.submissions.get(id) || null;
  }

  /**
   * Sécurisation : retire les tests cachés et solutions de référence avant d'envoyer au client
   */
  private sanitizeChallengeForClient(challenge: Challenge) {
    const { referenceSolutions, ...safeChallenge } = challenge;
    return {
      ...safeChallenge,
      tests: safeChallenge.tests.filter(t => !t.isHidden) // Ne transmet que les tests visibles
    };
  }
}
