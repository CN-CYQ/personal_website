export type WeatherKind =
  | 'sunny'
  | 'partly-cloudy'
  | 'cloudy'
  | 'rain'
  | 'thunder'

export interface WeatherForecastDay {
  id: string
  label: string
  date: string
  kind: WeatherKind
  condition: string
  precipitation: number
  high: number
  low: number
}

export interface HeroWeatherData {
  location: string
  condition: string
  temperature: number
  dateLabel: string
  weekday: string
  forecasts: WeatherForecastDay[]
}
