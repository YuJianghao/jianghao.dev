export interface Post {
  path: string
  title: string
  date: string
  lang?: string
  desc?: string
  platform?: string
  duration?: string
  recording?: string
  radio?: boolean
  video?: boolean
  inperson?: boolean
  redirect?: string
}

export interface BaseActivity {
  id: number
  name: string
  distance: number
  movingTime: number
  elapsedTime: number
  totalElevationGain: number
  sportType: string
  startDate: string
  map: {
    points: [number, number][]
    width: number
    height: number
  } | null
}
