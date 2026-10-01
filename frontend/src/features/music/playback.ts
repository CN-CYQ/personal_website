import type { PlaybackMode } from './types'

export function clamp(value: number, minimum: number, maximum: number) {
  return Math.min(Math.max(value, minimum), maximum)
}

export function formatTime(value: number) {
  if (!Number.isFinite(value) || value < 0) {
    return '00:00'
  }

  const totalSeconds = Math.floor(value)
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60

  return `${minutes.toString().padStart(2, '0')}:${seconds
    .toString()
    .padStart(2, '0')}`
}

export function progressRatio(currentTime: number, duration: number) {
  if (!Number.isFinite(duration) || duration <= 0) {
    return 0
  }

  return clamp(currentTime / duration, 0, 1)
}

export function nextTrackIndex(
  currentIndex: number,
  trackCount: number,
  shuffle = false,
  random: () => number = Math.random,
) {
  if (trackCount <= 0) {
    return 0
  }

  if (trackCount === 1) {
    return 0
  }

  if (!shuffle) {
    return (currentIndex + 1) % trackCount
  }

  const candidate = Math.floor(clamp(random(), 0, 0.999999) * trackCount)

  return candidate === currentIndex ? (candidate + 1) % trackCount : candidate
}

export function previousTrackIndex(
  currentIndex: number,
  trackCount: number,
  shuffle = false,
  random: () => number = Math.random,
) {
  if (trackCount <= 0) {
    return 0
  }

  if (trackCount === 1) {
    return 0
  }

  if (shuffle) {
    return nextTrackIndex(currentIndex, trackCount, true, random)
  }

  return (currentIndex - 1 + trackCount) % trackCount
}

export function cyclePlaybackMode(mode: PlaybackMode): PlaybackMode {
  if (mode === 'shuffle') {
    return 'list'
  }

  if (mode === 'list') {
    return 'single'
  }

  return 'shuffle'
}
