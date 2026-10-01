import type { Track } from './types'

export const mockWaveform = Array.from({ length: 56 }, (_, index) => {
  const centerWeight = 1 - Math.abs(index - 27.5) / 27.5
  const primary = Math.abs(Math.sin(index * 1.17 + 0.4))
  const secondary = Math.abs(Math.cos(index * 0.53 + 0.9))
  const height = 16 + centerWeight * 48 + primary * 20 + secondary * 10

  return Math.round(Math.min(100, height))
})

export const mockTracks: Track[] = [
  {
    id: 'snooze',
    title: 'Snooze',
    artist: 'SZA',
    coverUrl: '/images/music-cover.webp',
    duration: 281,
    currentTime: 80,
  },
  {
    id: 'blue-current',
    title: 'Blue Current',
    artist: 'CN-CYQ',
    coverUrl: '/images/music-cover.webp',
    duration: 238,
    currentTime: 52,
  },
]