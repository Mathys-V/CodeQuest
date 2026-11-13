import { Controller, Get, Post, Param, Body, Query, NotFoundException } from '@nestjs/common';
import { ChallengesService } from './challenges.service';

@Controller('challenges')
export class ChallengesController {
  constructor(private readonly challengesService: ChallengesService) {}

  @Get()
  getChallenges(@Query('theme') theme?: string) {
    return this.challengesService.getChallenges(theme);
  }

  @Get(':id')
  getChallenge(@Param('id') id: string) {
    const challenge = this.challengesService.getChallengeById(id);
    if (!challenge) {
      throw new NotFoundException(`Défi avec l'ID '${id}' non trouvé`);
    }
    return challenge;
  }

  @Post(':id/submissions')
  async submitCode(
    @Param('id') id: string,
    @Body() body: { code: string; language: 'python' | 'javascript'; userId?: string; pseudo?: string }
  ) {
    return await this.challengesService.submitChallenge(id, body);
  }
}
