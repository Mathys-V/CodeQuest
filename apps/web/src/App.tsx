import React from 'react';

export default function App() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8 bg-slate-950 text-cyan-400">
      <header className="text-center space-y-4 max-w-xl">
        <div className="inline-block px-3 py-1 text-xs font-semibold uppercase tracking-wider text-fuchsia-400 border border-fuchsia-500/30 rounded-full bg-fuchsia-950/20">
          Système ORACLE corrompu
        </div>
        <h1 className="text-4xl font-extrabold tracking-tight text-white drop-shadow-[0_0_15px_rgba(34,211,238,0.5)]">
          Code<span className="text-cyan-400">Quest</span>
        </h1>
        <p className="text-sm text-slate-400">
          Plateforme web d'apprentissage et de défis informatiques. Préparez-vous à reprendre le contrôle du Réseau.
        </p>
      </header>

      <section className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-4xl">
        <div className="p-5 border border-cyan-500/20 bg-slate-900/60 rounded-lg shadow-lg">
          <h2 className="text-lg font-bold text-cyan-300">Défis Algorithmiques</h2>
          <p className="text-xs text-slate-400 mt-2">Tris, complexité, débogage et validation en bac à sable.</p>
        </div>
        <div className="p-5 border border-fuchsia-500/20 bg-slate-900/60 rounded-lg shadow-lg">
          <h2 className="text-lg font-bold text-fuchsia-300">Cryptographie & Sécu</h2>
          <p className="text-xs text-slate-400 mt-2">Chiffrements de César, Vigenère, XOR, Stéganographie et QR codes.</p>
        </div>
        <div className="p-5 border border-emerald-500/20 bg-slate-900/60 rounded-lg shadow-lg">
          <h2 className="text-lg font-bold text-emerald-300">Gamification & Social</h2>
          <p className="text-xs text-slate-400 mt-2">Équipes, Points de Vie, Boss corrompus et économie virtuelle.</p>
        </div>
      </section>
    </main>
  );
}
