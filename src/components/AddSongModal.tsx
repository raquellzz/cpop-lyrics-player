import React, { useState } from 'react';
import { pinyin } from 'pinyin-pro';
import { supabase } from '../lib/supabase';
import { X, UploadCloud, Music } from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';
import type { LyricLine } from '../types';

interface AddSongModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

export const AddSongModal: React.FC<AddSongModalProps> = ({ onClose, onSuccess }) => {
  const { user } = useAuthStore();
  const [title, setTitle] = useState('');
  const [artist, setArtist] = useState('');
  const [youtubeLink, setYoutubeLink] = useState('');
  const [lrcText, setLrcText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Extrai o ID de URLs como "youtube.com/watch?v=123" ou "youtu.be/123"
  const extractYoutubeId = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : url; // Retorna o próprio texto se já for o ID
  };

  const processLrcAndSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!user) {
      setError('Você precisa estar logado para adicionar músicas.');
      setLoading(false);
      return;
    }

    try {
      const ytId = extractYoutubeId(youtubeLink);
      if (ytId.length !== 11) {
        throw new Error('Link ou ID do YouTube inválido.');
      }

      // 1. Processamento da Letra (LRC -> JSON)
      const lines = lrcText.split('\n');
      const timeRegex = /\[(\d{2}):(\d{2}(?:\.\d{2,3})?)\](.*)/;
      const lyricsArray: LyricLine[] = [];

      lines.forEach(line => {
        const match = timeRegex.exec(line.trim());
        if (match) {
          const minutes = parseInt(match[1], 10);
          const seconds = parseFloat(match[2]);
          const hanziText = match[3].trim();

          if (hanziText) {
            const segments = hanziText.split('').map(char => ({
              hanzi: char,
              pinyin: pinyin(char, { toneType: 'symbol', type: 'string' }),
              translation: ""
            }));

            lyricsArray.push({
              time: Number(((minutes * 60) + seconds).toFixed(2)),
              segments,
              lineTranslation: "" // A ser editado posteriormente se necessário
            });
          }
        }
      });

      if (lyricsArray.length === 0) {
        throw new Error('Não foi possível ler as marcações de tempo no texto LRC.');
      }

      // Gera um ID único simples
      const songId = `${artist}_${title}`.toLowerCase().replace(/[^a-z0-9]/g, '_').substring(0, 30);

      // 2. Inserção no Supabase
      const { error: dbError } = await supabase.from('songs').insert({
        id: songId + '_' + Date.now().toString().slice(-4),
        title,
        artist,
        youtube_id: ytId,
        lyrics_data: lyricsArray
      });

      if (dbError) throw dbError;

      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Erro ao processar e salvar a música.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/90 backdrop-blur-sm p-4">
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl w-full max-w-2xl relative max-h-[90vh] overflow-y-auto scrollbar-thin scrollbar-thumb-zinc-700 p-8">
        <button onClick={onClose} className="absolute top-4 right-4 text-zinc-500 hover:text-white">
          <X className="w-6 h-6" />
        </button>
        
        <div className="flex items-center gap-3 mb-6">
          <Music className="w-6 h-6 text-red-500" />
          <h2 className="text-2xl font-bold text-white">Adicionar Música</h2>
        </div>

        <form onSubmit={processLrcAndSave} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-zinc-400 uppercase tracking-widest mb-1">Título</label>
              <input type="text" required value={title} onChange={e => setTitle(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-red-600"
                placeholder="Ex: Call Me Baby" />
            </div>
            <div>
              <label className="block text-xs text-zinc-400 uppercase tracking-widest mb-1">Artista</label>
              <input type="text" required value={artist} onChange={e => setArtist(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-red-600"
                placeholder="Ex: EXO" />
            </div>
          </div>

          <div>
            <label className="block text-xs text-zinc-400 uppercase tracking-widest mb-1">Link do YouTube</label>
            <input type="text" required value={youtubeLink} onChange={e => setYoutubeLink(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-red-600"
              placeholder="Cole a URL do clipe ou o ID..." />
          </div>

          <div>
            <label className="block text-xs text-zinc-400 uppercase tracking-widest mb-1">Letra Sincronizada (.LRC)</label>
            <p className="text-xs text-zinc-500 mb-2">Cole o conteúdo do arquivo com as marcações de tempo. O Pinyin será gerado automaticamente.</p>
            <textarea required value={lrcText} onChange={e => setLrcText(e.target.value)}
              className="w-full h-40 bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-3 text-sm text-zinc-300 font-mono focus:outline-none focus:border-red-600 scrollbar-thin scrollbar-thumb-zinc-700"
              placeholder="[00:15.30]我爱你&#10;[00:18.45]..." />
          </div>

          {error && <div className="p-3 bg-red-900/20 border border-red-900/50 rounded-lg text-sm text-red-400">{error}</div>}

          <button type="submit" disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-red-800 hover:bg-red-700 text-white font-bold py-3 rounded-lg transition-colors disabled:opacity-50 mt-4">
            {loading ? 'Processando...' : <><UploadCloud className="w-5 h-5" /> Enviar para o Catálogo</>}
          </button>
        </form>
      </div>
    </div>
  );
};