import dayjs from 'dayjs'

export const isDark = useDark()
export const englishOnly = useStorage('antfu-english-only', false)
export const toggleDark = () => isDark.value = !isDark.value

export function formatDate(d: string | Date, onlyDate = true) {
  const date = dayjs(d)
  if (onlyDate || date.year() === dayjs().year())
    return date.format('MMM D')
  return date.format('MMM D, YYYY')
}

export function readableDistance(distance: number) {
  if (distance > 1000)
    return `${(distance / 1000).toFixed(1)} km`
  return `${distance.toFixed(0)} m`
}
export function readableTime(time: number) {
  const hours = Math.floor(time / 3600)
  const minutes = Math.floor((time - hours * 3600) / 60)
  const seconds = time - hours * 3600 - minutes * 60
  if (hours)
    return `${hours}h ${minutes}m`

  if (minutes)
    return `${minutes}m ${seconds}s`

  return `${seconds}s`
}
