export interface LyricSegment {
  hanzi: string;
  pinyin?: string; // Opcional: calculado em runtime se omitido
  translation?: string;
}

export interface LyricLine {
  time: number; // Em segundos
  segments: LyricSegment[];
  lineTranslation: string;
}

export interface SongMetadata {
  id: string;
  title: string;
  artist: string;
  youtubeId: string;
  dataFile: string;
}

export interface SongDetail extends SongMetadata {
  lyrics: LyricLine[];
}