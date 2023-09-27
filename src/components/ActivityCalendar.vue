<script setup lang="ts">
import { addDays, differenceInDays, format, subDays } from 'date-fns'
import { breakpointsTailwind, useBreakpoints } from '@vueuse/core'
import activities from '../../strava-activities.json'
import type { BaseActivity } from '~/types'
import { readableDistance, readableTime } from '~/logics'

const WEEK_COUNT = 53
const TOTAL_DAYS = WEEK_COUNT * 7 - (6 - new Date().getDay())
const calendar = computed(() => {
  const list = Array.from({ length: TOTAL_DAYS }).map((_, idx) => ({
    date: subDays(new Date(), idx),
    activities: [] as BaseActivity[],
  }))
  ;(activities as BaseActivity[]).forEach((activity) => {
    const date = new Date(activity.startDate)
    const current = addDays(new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate()), 1)
    const idx = differenceInDays(current, date)
    if (idx >= TOTAL_DAYS)
      return
    list[idx].activities.push(activity)
  })
  return list
})
function getCalendarIndex(row: number, col: number) {
  return TOTAL_DAYS - ((col) * 7 + (row + 1))
}
function getCalendar(row: number, col: number) {
  return calendar.value[getCalendarIndex(row, col)]
}
const table = computed(() => {
  return Array.from({ length: 7 }).fill(0).map((_, row) => {
    return Array.from({ length: WEEK_COUNT }).fill(0).map((_, col) => {
      return calendar.value[getCalendarIndex(row, col)]
    }).filter(Boolean)
  })
})
function getWeekDay(idx: number) {
  if (idx === 1)
    return 'MON'
  if (idx === 3)
    return 'WED'
  if (idx === 5)
    return 'FRI'
}
function getMonthDay(week: number) {
  const firstDayOfWeek = getCalendar(0, week)
  if (!firstDayOfWeek)
    return
  const firstDay = firstDayOfWeek.date
  const startDay = subDays(firstDay, 1)
  const lastDay = addDays(firstDay, 6)
  if (startDay.getMonth() !== lastDay.getMonth())
    return format(lastDay, 'MMM')
}
function getDayDistance(day: { activities: BaseActivity[] }) {
  return day.activities.reduce((acc, activity) => acc + activity.distance, 0)
}
function color(day: { activities: BaseActivity[] }) {
  const distance = getDayDistance(day)
  const thresholds = [5000, 2000, 1000, 0]
  const color = ['bg-orange-6', 'bg-orange-5', 'bg-orange-3', 'bg-orange-2']
  for (const idx in thresholds) {
    if (distance > thresholds[idx])
      return color[idx]
  }
}

const breakpoints = useBreakpoints(breakpointsTailwind)
const scrollDivRef = ref()

watch(breakpoints.current(), () => {
  if (!scrollDivRef.value)
    return
  scrollDivRef.value.scrollTo({
    left: scrollDivRef.value.scrollWidth,
    behavior: 'smooth',
  })
}, {
  immediate: true,
})
</script>

<template>
  <div class="max-w-7xl mx-auto">
    <div class="text-3xl font-bold pl-12 pt-5 mb-10 text-gray-5 dark:text-gray">
      Running & Hiking Activities
    </div>
    <div ref="scrollDivRef" class="overflow-x-auto no-scrollbar">
      <table class="w-max  border-separate border-spacing-1 table-fixed">
        <thead>
          <tr class="h-4">
            <td class="w-10" />
            <td v-for="week in WEEK_COUNT" :key="week" class="relative w-4">
              <span class="text-xs absolute top-0 op-50">
                {{ getMonthDay(week - 1) }}
              </span>
            </td>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(row, rowKey) in table" :key="rowKey" class="h-4">
            <td class="relative">
              <span class="absolute bottom--0.05 text-xs op-50">
                {{ getWeekDay(rowKey) }}
              </span>
            </td>
            <td
              v-for="(day, colKey) in row" :key="colKey" class="border-rounded-1 relative day"
              :class="day.activities.length ? color(day) : 'bg-gray-2 dark:bg-gray-7'"
            >
              <div v-if="getDayDistance(day)" class="absolute display-none z-1 w-max text-xs top-0 left-5 pointer-events-none p-1 border-rounded bg-gray-9 text-gray-3">
                <div v-for="activity in day.activities" :key="activity.id">
                  {{ activity.sportType }}: {{ readableDistance(activity.distance) }} / {{ readableTime(activity.movingTime) }}
                </div>
                <div class="op-50 text-2xs">
                  {{ format(day.date, 'yyyy-MM-dd') }}
                </div>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <div class="text-xl font-bold pl-12 pt-2 mt-4 text-gray-3 dark:text-gray-6">
      Distance: {{ readableDistance(activities.reduce((acc, activity) => acc + activity.distance, 0)) }}
    </div>
    <div class="text-xl font-bold pl-12 pt-2 text-gray-3 dark:text-gray-6">
      Moving Time: {{ readableTime(activities.reduce((acc, activity) => acc + activity.movingTime, 0)) }}
    </div>
  </div>
</template>

<style scoped>
.day:hover div{
  display: block;
}
</style>
