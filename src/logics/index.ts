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
