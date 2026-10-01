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
  const halfCount = Math.ceil(barCount / 2)
  const half = Array.from({ length: halfCount }, (_, index) => {
    const centerWeight = halfCount <= 1 ? 1 : index / (halfCount - 1)
    const crest = Math.abs(Math.sin(index * 1.31 + 0.4))
    const ripple = Math.abs(Math.cos(index * 0.72 + 0.6))
    const height = 16 + centerWeight * 60 + crest * 10 + ripple * 7

    return Math.round(Math.min(100, height))
  })

  return [...half, ...half.slice(0, barCount - halfCount).reverse()]
}

export const demoWaveform = buildWaveform(40)
