import React, { useEffect, useState, useRef } from 'react';
import { Search, Music, Star } from 'lucide-react';
import type { SongMetadata, SongDetail } from '../types';
import { usePlayerStore } from '../store/usePlayerStore';
import { supabase } from '../lib/supabase';

export const SongSelector: React.FC = () => {
  const [catalog, setCatalog] = useState<SongMetadata[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  const { setCurrentSong, currentSong, savedSongIds } = usePlayerStore();

  useEffect(() => {
    // fetch(`${import.meta.env.BASE_URL}catalog.json`)
    //   .then((res) => res.json())
    //   .then((data) => {
    //     setCatalog(data);
    //     if (data.length > 0 && !currentSong) loadSong(data[0]);
    //   })
    //   .catch((err) => console.error('Erro ao ler catálogo:', err));
    const fetchCatalog = async () => {
      const { data, error } = await supabase
        .from('songs')
        .select('id, title, artist, youtube_id');
      
      if (error) {
        console.error('Erro ao ler catálogo do Supabase:', error);
      } else if (data) {
        // Mapeando do formato do banco para a interface do frontend
        const formattedCatalog = data.map(song => ({
          id: song.id,
          title: song.title,
          artist: song.artist,
          youtubeId: song.youtube_id,
          dataFile: '' // Não usamos mais arquivo local
        }));
        
        setCatalog(formattedCatalog);
        // Se houver músicas e nenhuma estiver selecionada, carrega a primeira
        if (formattedCatalog.length > 0 && !currentSong) {
          loadSong(formattedCatalog[0]);
        }
      }
    };

    fetchCatalog();
  }, []);

  // Fecha o dropdown se clicar fora dele
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const loadSong = async (item: SongMetadata) => {
    try {
      // Busca a música completa no banco, incluindo o JSONB com a letra
      const { data, error } = await supabase
        .from('songs')
        .select('*')
        .eq('id', item.id)
        .single();

      if (error) throw error;

      if (data) {
        const fullSong: SongDetail = {
          id: data.id,
          title: data.title,
          artist: data.artist,
          youtubeId: data.youtube_id,
          dataFile: '',
          lyrics: data.lyrics_data // Puxamos direto do JSONB
        };
        setCurrentSong(fullSong);
        setIsOpen(false);
        setSearchTerm('');
      }
    } catch (err) {
      console.error('Erro ao carregar música do banco:', err);
    }
  };

  const filteredCatalog = catalog.filter((song) =>
    `${song.title} ${song.artist}`.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="relative w-64 md:w-80" ref={dropdownRef}>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-4 w-4 text-zinc-500" />
        </div>
        <input
          type="text"
          className="block w-full pl-10 pr-3 py-2 border border-zinc-700 rounded-lg leading-5 bg-zinc-900 text-zinc-300 placeholder-zinc-500 focus:outline-none focus:bg-zinc-800 focus:border-red-600 transition-colors sm:text-sm cursor-text"
          placeholder="Buscar música ou artista..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
        />
      </div>

      {isOpen && (
        <div className="absolute z-50 mt-2 w-full bg-zinc-900 border border-zinc-700 rounded-lg shadow-2xl max-h-60 overflow-y-auto scrollbar-thin scrollbar-thumb-zinc-700">
          {filteredCatalog.length === 0 ? (
            <div className="px-4 py-3 text-sm text-zinc-500 text-center">Nenhuma música encontrada.</div>
          ) : (
            filteredCatalog.map((song) => {
              const isSaved = savedSongIds.includes(song.id);
              const isActive = currentSong?.id === song.id;
              
              return (
                <button
                  key={song.id}
                  onClick={() => loadSong(song)}
                  className={`w-full text-left px-4 py-3 flex items-center gap-3 hover:bg-zinc-800 transition-colors border-b border-zinc-800/50 last:border-0 ${
                    isActive ? 'bg-zinc-800/80 border-l-2 border-l-red-500' : ''
                  }`}
                >
                  {isSaved ? (
                    <Star className="h-4 w-4 text-yellow-500 flex-shrink-0" fill="currentColor" />
                  ) : (
                    <Music className="h-4 w-4 text-zinc-600 flex-shrink-0" />
                  )}
                  <div className="truncate">
                    <p className={`text-sm font-medium ${isActive ? 'text-red-400' : 'text-zinc-200'}`}>
                      {song.title}
                    </p>
                    <p className="text-xs text-zinc-500 truncate">{song.artist}</p>
                  </div>
                </button>
              );
            })
          )}
        </div>
      )}
    </div>
  );
};