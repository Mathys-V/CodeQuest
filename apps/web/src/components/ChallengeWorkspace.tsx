import React, { useState, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import {
  fetchChallenges,
  submitChallengeCode,
  fetchLeaderboard,
  Challenge,
  SubmissionResult,
  LeaderboardEntry
} from '../services/api';

export const ChallengeWorkspace: React.FC = () => {
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [selectedChallenge, setSelectedChallenge] = useState<Challenge | null>(null);
  const [language, setLanguage] = useState<'python' | 'javascript'>('python');
  const [code, setCode] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<SubmissionResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [showLeaderboard, setShowLeaderboard] = useState(false);

  useEffect(() => {
    fetchChallenges().then(data => {
      setChallenges(data);
      if (data.length > 0) {
        setSelectedChallenge(data[0]);
        setCode(data[0].starterCode.python);
      }
    });
    fetchLeaderboard().then(setLeaderboard);
  }, []);

  const handleChallengeChange = (ch: Challenge) => {
    setSelectedChallenge(ch);
    setCode(ch.starterCode[language]);
    setResult(null);
    setError(null);
  };

  const handleLanguageChange = (lang: 'python' | 'javascript') => {
    setLanguage(lang);
    if (selectedChallenge) {
      setCode(selectedChallenge.starterCode[lang]);
    }
  };

  const handleResetCode = () => {
    if (selectedChallenge) {
      setCode(selectedChallenge.starterCode[language]);
    }
  };

  const handleSubmit = async () => {
    if (!selectedChallenge) return;
    setIsSubmitting(true);
    setError(null);

    try {
      const res = await submitChallengeCode(selectedChallenge.id, {
        code,
        language,
        pseudo: 'Runner-Alpha'
      });
      setResult(res);
      // Actualiser le classement si le défi a été réussi
      if (res.allPassed) {
        fetchLeaderboard().then(setLeaderboard);
      }
    } catch (err: any) {
      setError(err.message || "Erreur de connexion au serveur d'exécution.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!selectedChallenge) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-950 text-cyan-400">
        <div className="animate-pulse">Chargement de la matrice CodeQuest...</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-slate-950 text-slate-100 overflow-hidden font-mono">
      {/* Barre de navigation supérieure */}
      <header className="flex items-center justify-between px-6 py-3 border-b border-cyan-500/20 bg-slate-900/80 backdrop-blur">
        <div className="flex items-center gap-4">
          <span className="text-xl font-black tracking-wider text-white">
            CODE<span className="text-cyan-400">QUEST</span>
          </span>
          <span className="text-xs px-2 py-0.5 rounded bg-cyan-950 border border-cyan-500/30 text-cyan-300">
            Secteur : {selectedChallenge.theme}
          </span>
        </div>

        <div className="flex items-center gap-3">
          {/* Sélecteur de défi */}
          <select
            className="bg-slate-800 border border-slate-700 text-xs text-slate-200 rounded px-3 py-1.5 focus:border-cyan-400 focus:outline-none"
            value={selectedChallenge.id}
            onChange={(e) => {
              const ch = challenges.find(c => c.id === e.target.value);
              if (ch) handleChallengeChange(ch);
            }}
          >
            {challenges.map(c => (
              <option key={c.id} value={c.id}>
                Niv.{c.difficulty} - {c.title}
              </option>
            ))}
          </select>

          <button
            onClick={() => setShowLeaderboard(!showLeaderboard)}
            className="px-3 py-1.5 text-xs font-semibold rounded border border-fuchsia-500/40 text-fuchsia-300 hover:bg-fuchsia-950/40 transition"
          >
            🏆 Classement
          </button>
        </div>
      </header>

      {/* Zone de travail principale en deux colonnes */}
      <div className="flex flex-1 overflow-hidden">
        {/* Colonne de gauche : Énoncé & Tests */}
        <section className="w-1/3 border-r border-slate-800 flex flex-col bg-slate-900/40 overflow-y-auto p-5">
          <div className="mb-4">
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase tracking-widest text-slate-400">
                Difficulté : {Array(selectedChallenge.difficulty).fill('★').join('')}
              </span>
              <span className="text-xs text-fuchsia-400 font-bold">
                {selectedChallenge.basePoints} pts base + {selectedChallenge.perfMax} pts perf
              </span>
            </div>
            <h1 className="text-lg font-bold text-white mt-1">{selectedChallenge.title}</h1>
          </div>

          <div className="bg-slate-950/70 border border-slate-800 rounded p-4 text-xs text-slate-300 whitespace-pre-line leading-relaxed mb-4">
            {selectedChallenge.statement}
          </div>

          <div className="mb-4">
            <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
              Spécifications de performance :
            </h2>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="bg-slate-900 border border-slate-800 p-2 rounded">
                <span className="text-slate-400">Temps optimal (t_opt) :</span>
                <p className="text-cyan-400 font-bold">{selectedChallenge.tOptMs} ms</p>
              </div>
              <div className="bg-slate-900 border border-slate-800 p-2 rounded">
                <span className="text-slate-400">Seuil limite (t_max) :</span>
                <p className="text-amber-400 font-bold">{selectedChallenge.tMaxMs} ms</p>
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
              Jeux d'essais publics ({selectedChallenge.tests.length}) :
            </h2>
            <div className="space-y-2">
              {selectedChallenge.tests.map((t, idx) => (
                <div key={t.id || idx} className="bg-slate-950/60 border border-slate-800 p-2.5 rounded text-xs">
                  <div className="text-slate-400">Entrée : <code className="text-cyan-300">{JSON.stringify(t.input)}</code></div>
                  <div className="text-slate-400 mt-1">Attendu : <code className="text-emerald-300">{JSON.stringify(t.expected)}</code></div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Colonne de droite : Monaco Editor & Console de résultats */}
        <section className="flex-1 flex flex-col overflow-hidden bg-slate-950">
          {/* Barre d'actions de l'éditeur */}
          <div className="flex items-center justify-between px-4 py-2 border-b border-slate-800 bg-slate-900/60">
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleLanguageChange('python')}
                className={`px-3 py-1 text-xs rounded transition ${
                  language === 'python'
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Python 3
              </button>
              <button
                onClick={() => handleLanguageChange('javascript')}
                className={`px-3 py-1 text-xs rounded transition ${
                  language === 'javascript'
                    ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/40'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                JavaScript (Node)
              </button>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={handleResetCode}
                className="text-xs text-slate-400 hover:text-slate-200 transition"
              >
                Réinitialiser
              </button>

              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className={`px-4 py-1.5 text-xs font-bold rounded shadow-lg transition flex items-center gap-2 ${
                  isSubmitting
                    ? 'bg-slate-700 text-slate-400 cursor-not-allowed'
                    : 'bg-cyan-500 text-slate-950 hover:bg-cyan-400 active:scale-95'
                }`}
              >
                {isSubmitting ? (
                  <>
                    <span className="animate-spin inline-block h-3 w-3 border-2 border-slate-950 border-t-transparent rounded-full" />
                    Exécution (5 runs)...
                  </>
                ) : (
                  '⚡ Exécuter & Soumettre'
                )}
              </button>
            </div>
          </div>

          {/* Éditeur Monaco */}
          <div className="flex-1 overflow-hidden">
            <Editor
              height="100%"
              theme="vs-dark"
              language={language === 'python' ? 'python' : 'javascript'}
              value={code}
              onChange={(val) => setCode(val || '')}
              options={{
                minimap: { enabled: false },
                fontSize: 13,
                fontFamily: "ui-monospace, monospace",
                scrollBeyondLastLine: false,
                tabSize: 4,
                automaticLayout: true
              }}
            />
          </div>

          {/* Console de retour d'exécution */}
          <div className="h-64 border-t border-slate-800 bg-slate-900/90 flex flex-col p-4 overflow-y-auto">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800 mb-3">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Console de validation & Télémétrie
              </span>

              {result && (
                <div className="flex items-center gap-3">
                  <span className={`text-xs px-2 py-0.5 rounded font-bold ${
                    result.allPassed ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/40' : 'bg-red-950 text-red-400 border border-red-500/40'
                  }`}>
                    {result.status}
                  </span>
                  <span className="text-xs text-cyan-300">
                    Temps CPU médian : {result.medianCpuTimeMs} ms
                  </span>
                </div>
              )}
            </div>

            {error && (
              <div className="p-3 bg-red-950/40 border border-red-500/30 text-red-300 text-xs rounded">
                {error}
              </div>
            )}

            {!result && !error && (
              <div className="flex-1 flex items-center justify-center text-slate-500 text-xs">
                Cliquez sur "Exécuter & Soumettre" pour tester votre algorithme dans le bac à sable.
              </div>
            )}

            {result && (
              <div className="space-y-3">
                {/* Cartes de Score */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-slate-950/80 border border-slate-800 p-2.5 rounded">
                    <span className="text-[10px] text-slate-400 uppercase">Points de base</span>
                    <p className="text-sm font-bold text-slate-200">{result.score.basePoints} pts</p>
                  </div>
                  <div className="bg-slate-950/80 border border-slate-800 p-2.5 rounded">
                    <span className="text-[10px] text-slate-400 uppercase">Bonus Performance</span>
                    <p className="text-sm font-bold text-fuchsia-400">+{result.score.perfPoints} pts</p>
                  </div>
                  <div className="bg-slate-950/80 border border-cyan-500/30 p-2.5 rounded shadow-[0_0_10px_rgba(34,211,238,0.15)]">
                    <span className="text-[10px] text-cyan-400 uppercase">Score Total</span>
                    <p className="text-base font-black text-cyan-300">{result.score.totalScore} pts</p>
                  </div>
                </div>

                {/* Détails des tests */}
                <div className="space-y-1">
                  {result.testResults.map((t, idx) => (
                    <div
                      key={t.testId || idx}
                      className={`flex items-center justify-between p-2 rounded text-xs ${
                        t.passed ? 'bg-emerald-950/20 text-emerald-300' : 'bg-red-950/20 text-red-300'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span>{t.passed ? '✅' : '❌'}</span>
                        <span className="font-bold">{t.testId}</span>
                        {t.isHidden && <span className="text-[10px] bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded">Caché</span>}
                        {t.error && <span className="text-red-400 text-[10px]">({t.error})</span>}
                      </div>
                      <span className="text-slate-400 text-[11px]">{t.durationMs} ms</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>
      </div>

      {/* Modal / Volet latéral de Classement */}
      {showLeaderboard && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-cyan-500/30 rounded-xl w-full max-w-lg p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                🏆 Classement des Runners (Temps Réel)
              </h2>
              <button
                onClick={() => setShowLeaderboard(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2 max-h-80 overflow-y-auto">
              {leaderboard.map((player) => (
                <div
                  key={player.userId}
                  className={`flex items-center justify-between p-3 rounded-lg border text-xs ${
                    player.rank === 1
                      ? 'bg-amber-950/30 border-amber-500/40 text-amber-300'
                      : 'bg-slate-950/60 border-slate-800 text-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="font-black text-sm w-6">#{player.rank}</span>
                    <span className="font-bold">{player.pseudo}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-slate-400 text-[11px]">{player.submissionsCount} soumissions</span>
                    <span className="font-black text-cyan-400">{player.score} pts</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
