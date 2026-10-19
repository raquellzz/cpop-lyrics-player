import React from 'react';
import { Player } from './components/Player';
import { LyricsViewer } from './components/LyricsViewer';
import { SongSelector } from './components/SongSelector';
import { usePlayerStore } from './store/usePlayerStore';

export const App: React.FC = () => {
  const { playbackRate, setPlaybackRate } = usePlayerStore();

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col items-center p-6">
      <header className="w-full max-w-4xl flex items-center justify-between pb-6 mb-6 border-b border-zinc-800">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white">
            C-Pop Study Player
          </h1>
          <p className="text-xs text-zinc-400">Leitor dinâmico de caracteres chineses e pinyin</p>
        </div>
        <SongSelector />
      </header>

      <main className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Painel Esquerdo: Mídia e Controles de Velocidade */}
        <section className="space-y-4">
          <Player />

          <div className="p-4 rounded-lg bg-zinc-900 border border-zinc-800">
            <span className="text-xs text-zinc-400 block mb-2 uppercase tracking-wide">
              Velocidade de Reprodução
            </span>
            <div className="flex gap-2">
              {[0.5, 0.75, 1.0].map((rate) => (
                <button
                  key={rate}
                  onClick={() => setPlaybackRate(rate)}
                  className={`flex-1 py-1.5 rounded text-xs font-semibold transition ${
                    playbackRate === rate
                      ? 'bg-red-600 text-white'
                      : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
                  }`}
                >
                  {rate}x
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Painel Central/Direito: Letras sincronizadas */}
        <section className="md:col-span-2 rounded-xl bg-zinc-900/50 border border-zinc-800">
          <LyricsViewer />
        </section>
      </main>
    </div>
  );
};

export default App;