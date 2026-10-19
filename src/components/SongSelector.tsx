import React, { useEffect, useState } from 'react';
import type { SongMetadata } from '../types';
import { usePlayerStore } from '../store/usePlayerStore';

export const SongSelector: React.FC = () => {
  const [catalog, setCatalog] = useState<SongMetadata[]>([]);
  const setCurrentSong = usePlayerStore((s) => s.setCurrentSong);

  useEffect(() => {
    fetch(`${import.meta.env.BASE_URL}catalog.json`)
      .then((res) => res.json())
      .then((data) => {
        setCatalog(data);
        if (data.length > 0) loadSong(data[0]);
      })
      .catch((err) => console.error('Erro ao ler catálogo:', err));
  }, []);

  const loadSong = async (item: SongMetadata) => {
    try {
      const res = await fetch(`${import.meta.env.BASE_URL}${item.dataFile}`);
      const songData = await res.json();
      setCurrentSong(songData);
    } catch (err) {
      console.error('Erro ao carregar detalhes da música:', err);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <label className="text-xs text-zinc-400 uppercase tracking-widest">Música:</label>
      <select
        className="bg-zinc-800 text-zinc-200 text-sm px-3 py-1.5 rounded-lg border border-zinc-700 focus:outline-none focus:border-red-500"
        onChange={(e) => {
          const selected = catalog.find((m) => m.id === e.target.value);
          if (selected) loadSong(selected);
        }}
      >
        {catalog.map((m) => (
          <option key={m.id} value={m.id}>
            {m.title} — {m.artist}
          </option>
        ))}
      </select>
    </div>
  );
};