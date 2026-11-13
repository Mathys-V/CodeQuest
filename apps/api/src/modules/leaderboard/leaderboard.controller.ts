import { Controller, Get, Query } from '@nestjs/common';
import { LeaderboardService } from './leaderboard.service';

@Controller('leaderboards')
export class LeaderboardController {
  constructor(private readonly leaderboardService: LeaderboardService) {}

  @Get('players')
  getPlayersLeaderboard(@Query('limit') limit?: string) {
    const parsedLimit = limit ? parseInt(limit, 10) : 20;
    return {
      updatedAt: new Date().toISOString(),
      leaderboard: this.leaderboardService.getTopPlayers(parsedLimit),
    };
  }
}
