export interface Track {
  id: string
  title: string
  artist: string
  coverUrl: string
  duration: number
  currentTime?: number
}

export type PlaybackMode = 'list' | 'single' | 'shuffle'

export interface AudioPlayerCardProps {
  track: Track
  isPlaying?: boolean
  waveform?: number[]
  mode?: PlaybackMode
}
