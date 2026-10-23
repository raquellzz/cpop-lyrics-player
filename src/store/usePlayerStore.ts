import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { SongDetail } from '../types';

interface PlayerState {
  currentSong: SongDetail | null;
  activeLineIndex: number;
  isPlaying: boolean;
  playbackRate: number;
  savedSongIds: string[]; // Novo estado para favoritos
  setCurrentSong: (song: SongDetail) => void;
  setActiveLineIndex: (index: number) => void;
  setIsPlaying: (playing: boolean) => void;
  setPlaybackRate: (rate: number) => void;
  toggleFavorite: (songId: string) => void; // Nova ação
}

export const usePlayerStore = create<PlayerState>()(
  persist(
    (set) => ({
      currentSong: null,
      activeLineIndex: -1,
      isPlaying: false,
      playbackRate: 1,
      savedSongIds: [], // Inicialmente vazio

      setCurrentSong: (song) => set({ currentSong: song, activeLineIndex: -1 }),
      setActiveLineIndex: (index) =>
        set((state) => (state.activeLineIndex !== index ? { activeLineIndex: index } : state)),
      setIsPlaying: (isPlaying) => set({ isPlaying }),
      setPlaybackRate: (playbackRate) => set({ playbackRate }),
      
      toggleFavorite: (songId) =>
        set((state) => ({
          savedSongIds: state.savedSongIds.includes(songId)
            ? state.savedSongIds.filter((id) => id !== songId) // Remove se já existe
            : [...state.savedSongIds, songId], // Adiciona se não existe
        })),
    }),
    {
      name: 'cpop-player-storage', // Nome da chave no localStorage
      partialize: (state) => ({ savedSongIds: state.savedSongIds }), // Salva APENAS os favoritos no disco
    }
  )
);