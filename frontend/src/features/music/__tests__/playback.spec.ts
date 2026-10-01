import { describe, expect, it } from 'vitest'

import {
  clamp,
  cyclePlaybackMode,
  formatTime,
  nextTrackIndex,
  previousTrackIndex,
  progressRatio,
} from '../playback'

describe('music playback helpers', () => {
  it('formats track time as mm:ss', () => {
    expect(formatTime(80)).toBe('01:20')
    expect(formatTime(281)).toBe('04:41')
    expect(formatTime(-1)).toBe('00:00')
  })

  it('converts elapsed time into a bounded progress ratio', () => {
    expect(progressRatio(80, 281)).toBeCloseTo(0.2847, 4)
    expect(progressRatio(-5, 281)).toBe(0)
    expect(progressRatio(400, 281)).toBe(1)
    expect(progressRatio(10, 0)).toBe(0)
  })

  it('wraps next and previous track indexes', () => {
    expect(nextTrackIndex(2, 3)).toBe(0)
    expect(previousTrackIndex(0, 3)).toBe(2)
  })

  it('uses a deterministic shuffle fallback without repeating the track', () => {
    expect(nextTrackIndex(1, 3, true, () => 0.34)).toBe(2)
    expect(nextTrackIndex(1, 3, true, () => 0.7)).toBe(2)
    expect(previousTrackIndex(1, 3, true, () => 0)).toBe(0)
  })

  it('clamps arbitrary values', () => {
    expect(clamp(12, 0, 10)).toBe(10)
    expect(clamp(-4, 0, 10)).toBe(0)
  })

  it('cycles playback mode in the expected order', () => {
    expect(cyclePlaybackMode('shuffle')).toBe('list')
    expect(cyclePlaybackMode('list')).toBe('single')
    expect(cyclePlaybackMode('single')).toBe('shuffle')
  })
})
