export interface LeaderboardEntry {
  rank: number;
  userId: string;
  pseudo: string;
  score: number;
  submissionsCount: number;
  updatedAt: string;
}

export class LeaderboardService {
  private inMemoryScores: Map<string, { pseudo: string; score: number; submissionsCount: number; updatedAt: Date }> = new Map();

  constructor() {
    // Joueurs fictifs pour pré-remplir le classement selon l'univers du Lore
    this.inMemoryScores.set("user_runner_01", { pseudo: "CipherRunner", score: 250, submissionsCount: 4, updatedAt: new Date() });
    this.inMemoryScores.set("user_runner_02", { pseudo: "GhostInTheShell", score: 180, submissionsCount: 2, updatedAt: new Date() });
    this.inMemoryScores.set("user_runner_03", { pseudo: "ByteMaster", score: 120, submissionsCount: 1, updatedAt: new Date() });
  }

  /**
   * Enregistre ou met à jour le score d'un joueur
   */
  public updatePlayerScore(userId: string, pseudo: string, pointsEarned: number): void {
    const existing = this.inMemoryScores.get(userId);
    if (existing) {
      existing.score = Math.max(existing.score, existing.score + pointsEarned);
      existing.submissionsCount += 1;
      existing.updatedAt = new Date();
    } else {
      this.inMemoryScores.set(userId, {
        pseudo,
        score: pointsEarned,
        submissionsCount: 1,
        updatedAt: new Date()
      });
    }
  }

  /**
   * Récupère le classement ordonné (score décroissant, puis soumission la plus ancienne)
   */
  public getTopPlayers(limit: number = 20): LeaderboardEntry[] {
    const list = Array.from(this.inMemoryScores.entries()).map(([userId, data]) => ({
      userId,
      pseudo: data.pseudo,
      score: data.score,
      submissionsCount: data.submissionsCount,
      updatedAt: data.updatedAt.toISOString(),
      rawDate: data.updatedAt
    }));

    // Tri : score décroissant, puis plus ancienne soumission (Section 4.3 : à score égal, la soumission la plus ancienne gagne)
    list.sort((a, b) => {
      if (b.score !== a.score) {
        return b.score - a.score;
      }
      return a.rawDate.getTime() - b.rawDate.getTime();
    });

    return list.slice(0, limit).map((item, idx) => ({
      rank: idx + 1,
      userId: item.userId,
      pseudo: item.pseudo,
      score: item.score,
      submissionsCount: item.submissionsCount,
      updatedAt: item.updatedAt
    }));
  }
}
