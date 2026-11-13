import assert from 'assert';
import { ChallengesService } from '../src/modules/challenges/challenges.service.ts';
import { LeaderboardService } from '../src/modules/leaderboard/leaderboard.service.ts';

async function testChallengesFlow() {
  console.log('🧪 Lancement des tests d\'intégration API Défis & Scoring...\n');

  const leaderboardService = new LeaderboardService();
  const challengesService = new ChallengesService(leaderboardService);

  // 1. Lister les défis
  const challenges = challengesService.getChallenges();
  assert(challenges.length >= 2, 'Il doit y avoir au moins 2 défis initiaux');
  console.log(`✅ ${challenges.length} défis répertoriés avec succès.`);

  // 2. Vérifier la sécurisation (tests cachés masqués au client)
  const bubbleSortChallenge = challengesService.getChallengeById('tri-a-bulles');
  assert(bubbleSortChallenge, 'Le défi du tri à bulles doit exister');
  assert(bubbleSortChallenge.tests.every(t => !t.isHidden), 'Les tests cachés ne doivent pas être renvoyés au client');
  console.log('✅ Sécurité : aucun test caché n\'est exposé au client.');

  // 3. Soumission d'une solution correcte en Python
  console.log('\n⏳ Exécution d\'une soumission valide en Python...');
  const submission = await challengesService.submitChallenge('tri-a-bulles', {
    code: 'def sort_list(lst):\n    return sorted(lst)',
    language: 'python',
    userId: 'runner_mathys',
    pseudo: 'MathysRunner'
  });

  assert.strictEqual(submission.allPassed, true, 'Tous les tests doivent passer');
  assert.strictEqual(submission.status, 'SUCCESS');
  assert(submission.score.totalScore >= 100, 'Le score total doit inclure les 100 points de base');
  console.log(`✅ Soumission validée avec succès ! Score : ${submission.score.totalScore} pts (Base: ${submission.score.basePoints}, Perf: ${submission.score.perfPoints})`);

  // 4. Vérifier la mise à jour du Leaderboard
  const topPlayers = leaderboardService.getTopPlayers();
  const mathysRank = topPlayers.find(p => p.userId === 'runner_mathys');
  assert(mathysRank, 'Le joueur doit être présent dans le classement');
  console.log(`✅ Classement mis à jour : ${mathysRank.pseudo} est classé #${mathysRank.rank} avec ${mathysRank.score} pts.`);

  console.log('\n🎉 Flux complet Défi -> Runner -> Scoring -> Leaderboard VALIDÉ !');
}

testChallengesFlow().catch(err => {
  console.error('\n❌ Échec du test :', err);
  process.exit(1);
});
