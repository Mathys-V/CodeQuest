import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { ChallengesController } from './modules/challenges/challenges.controller';
import { ChallengesService } from './modules/challenges/challenges.service';
import { LeaderboardController } from './modules/leaderboard/leaderboard.controller';
import { LeaderboardService } from './modules/leaderboard/leaderboard.service';

@Module({
  imports: [],
  controllers: [AppController, ChallengesController, LeaderboardController],
  providers: [LeaderboardService, ChallengesService],
})
export class AppModule {}
