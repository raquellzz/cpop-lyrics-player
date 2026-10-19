import { create } from 'zustand';
import type { SongDetail } from '../types';

interface PlayerState {
  currentSong: SongDetail | null;
  activeLineIndex: number;
  isPlaying: boolean;
  playbackRate: number;
  setCurrentSong: (song: SongDetail) => void;
  setActiveLineIndex: (index: number) => void;
  setIsPlaying: (playing: boolean) => void;
  setPlaybackRate: (rate: number) => void;
}

export const usePlayerStore = create<PlayerState>((set) => ({
  currentSong: null,
  activeLineIndex: -1,
  isPlaying: false,
  playbackRate: 1,
  setCurrentSong: (song) => set({ currentSong: song, activeLineIndex: -1 }),
  setActiveLineIndex: (index) =>
    set((state) => (state.activeLineIndex !== index ? { activeLineIndex: index } : state)),
  setIsPlaying: (isPlaying) => set({ isPlaying }),
  setPlaybackRate: (playbackRate) => set({ playbackRate }),
}));