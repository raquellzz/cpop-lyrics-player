import React, { useEffect, useRef } from 'react';
import YouTube, { type YouTubePlayer, type YouTubeProps } from 'react-youtube';
import { usePlayerStore } from '../store/usePlayerStore';

export const Player: React.FC = () => {
  const { currentSong, setActiveLineIndex, setIsPlaying, playbackRate } = usePlayerStore();
  const playerRef = useRef<YouTubePlayer | null>(null);
  const animFrameId = useRef<number | null>(null);

  // Loop de sincronização com requestAnimationFrame
  const syncLyrics = () => {
    if (playerRef.current && currentSong?.lyrics) {
      const currentTime: number = playerRef.current.getCurrentTime();
      const lyrics = currentSong.lyrics;

      let foundIndex = -1;
      for (let i = 0; i < lyrics.length; i++) {
        if (currentTime >= lyrics[i].time) {
          foundIndex = i;
        } else {
          break;
        }
      }
      setActiveLineIndex(foundIndex);
    }
    animFrameId.current = requestAnimationFrame(syncLyrics);
  };

  const onReady: YouTubeProps['onReady'] = (event) => {
    playerRef.current = event.target;
    playerRef.current.setPlaybackRate(playbackRate);
  };

  const onStateChange: YouTubeProps['onStateChange'] = (event) => {
    // 1 = Playing, 2 = Paused
    if (event.data === 1) {
      setIsPlaying(true);
      if (!animFrameId.current) animFrameId.current = requestAnimationFrame(syncLyrics);
    } else {
      setIsPlaying(false);
      if (animFrameId.current) {
        cancelAnimationFrame(animFrameId.current);
        animFrameId.current = null;
      }
    }
  };

  useEffect(() => {
    if (playerRef.current) {
      playerRef.current.setPlaybackRate(playbackRate);
    }
  }, [playbackRate]);

  useEffect(() => {
    return () => {
      if (animFrameId.current) cancelAnimationFrame(animFrameId.current);
    };
  }, []);

  if (!currentSong) return null;

  return (
    <div className="rounded-lg overflow-hidden border border-zinc-800 bg-zinc-900 shadow-md">
      <YouTube
        videoId={currentSong.youtubeId}
        opts={{
          height: '200',
          width: '100%',
          playerVars: { autoplay: 0, controls: 1, modestbranding: 1 },
        }}
        onReady={onReady}
        onStateChange={onStateChange}
      />
    </div>
  );
};