import type { DemoTrack } from './types'

export const demoTracks: DemoTrack[] = [
  {
    id: 'snooze',
    title: 'Snooze',
    artist: 'SZA',
    album: 'SOS',
    coverUrl: '/images/snooze-cover.png',
    duration: 281,
    startTime: 80,
  },
  {
    id: 'nobody-gets-me',
    title: 'Nobody Gets Me',
    artist: 'SZA',
    album: 'SOS',
    coverUrl: '/images/snooze-cover.png',
    duration: 181,
    startTime: 44,
  },
  {
    id: 'open-arms',
    title: 'Open Arms',
    artist: 'SZA',
    album: 'SOS',
    coverUrl: '/images/snooze-cover.png',
    duration: 239,
    startTime: 63,
  },
]

function buildWaveform(barCount: number) {
  return Array.from({ length: barCount }, (_, index) => {
    const position = index / Math.max(barCount - 1, 1)
    const envelope = 0.26 + Math.sin(Math.PI * position) * 0.74
    const primary = Math.abs(Math.sin(position * 31 + 0.7))
    const secondary = Math.abs(Math.cos(position * 17 + 1.3))
    const height = 12 + envelope * 48 + primary * 29 + secondary * 13

    return Math.round(Math.min(100, height))
  })
}

export const demoWaveform = buildWaveform(40)
