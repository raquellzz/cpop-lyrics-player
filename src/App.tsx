import React, { useEffect, useState } from 'react';
import { Star, UserCircle, LogOut, PlusCircle } from 'lucide-react';
import { Player } from './components/Player';
import { LyricsViewer } from './components/LyricsViewer';
import { SongSelector } from './components/SongSelector';
import { usePlayerStore } from './store/usePlayerStore';
import { useAuthStore } from './store/useAuthStore';
import { supabase } from './lib/supabase';
import { Auth } from './components/Auth';
import { AddSongModal } from './components/AddSongModal';

export const App: React.FC = () => {
  const { playbackRate, setPlaybackRate, currentSong, savedSongIds, toggleFavorite } = usePlayerStore();
  const { user, setUser, signOut } = useAuthStore();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);

  const isFavorite = currentSong ? savedSongIds.includes(currentSong.id) : false;

  // Monitora a sessão do Supabase ao carregar o app
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null, session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null, session);
    });

    return () => subscription.unsubscribe();
  }, [setUser]);

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col items-center p-6">
      
      {/* Exibe o Modal se o state for true */}
      {showAuthModal && <Auth onClose={() => setShowAuthModal(false)} />}

      {/* Novo Modal de Adição */}
    {showAddModal && (
      <AddSongModal 
        onClose={() => setShowAddModal(false)} 
        onSuccess={() => {
          setShowAddModal(false);
          // Opcional: Você pode forçar um reload ou atualizar o Zustand aqui para mostrar a música nova na hora
          window.location.reload(); 
        }} 
      />
    )}

      <header className="w-full max-w-4xl flex items-center justify-between pb-6 mb-6 border-b border-zinc-800">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-white">C-Pop Study Player</h1>
        <p className="text-xs text-zinc-400">Leitor dinâmico de caracteres e pinyin</p>
      </div>
      
      <div className="flex items-center gap-4">
        {user ? (
          <div className="flex items-center gap-3">
            {/* Botão de Adicionar Música (Apenas para logados) */}
            <button 
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-1.5 text-xs bg-zinc-800 hover:bg-zinc-700 text-zinc-300 px-3 py-1.5 rounded-lg transition-colors"
            >
              <PlusCircle className="w-4 h-4" />
              Adicionar
            </button>
            <span className="text-xs text-zinc-500 truncate max-w-[120px]">{user.email}</span>
            <button onClick={signOut} className="text-zinc-500 hover:text-red-400 transition-colors">
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <button onClick={() => setShowAuthModal(true)} className="flex items-center gap-2 text-sm text-zinc-400 hover:text-white transition-colors">
            <UserCircle className="w-5 h-5" />
            <span>Entrar</span>
          </button>
        )}

        {/* Botão Favoritar e Seletor de Músicas */}
        {currentSong && (
          <button onClick={() => { if (!user) setShowAuthModal(true); else toggleFavorite(currentSong.id); }}
            className={`p-2 rounded-full transition-all duration-300 ${isFavorite ? 'text-yellow-500 bg-yellow-500/10' : 'text-zinc-500 hover:bg-zinc-800'}`}>
            <Star className="w-5 h-5" fill={isFavorite ? "currentColor" : "none"} />
          </button>
        )}
        <SongSelector />
      </div>
    </header>

      {/* Restante do layout permanece igual */}
      <main className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-3 gap-6">
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
                      ? 'bg-red-800 text-white shadow-md'
                      : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
                  }`}
                >
                  {rate}x
                </button>
              ))}
            </div>
          </div>
        </section>

        <section className="md:col-span-2 rounded-xl bg-zinc-900/50 border border-zinc-800 shadow-xl">
          <LyricsViewer />
        </section>
      </main>
    </div>
  );
};

export default App;