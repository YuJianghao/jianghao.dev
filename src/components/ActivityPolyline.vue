<script setup lang="ts">
import { format } from 'date-fns'
import { isDark, readableDistance, readableTime, useActivities } from '~/logics'

const { currentActivity, activities, currentActivityIdx } = useActivities()
function next() {
  currentActivityIdx.value = Math.floor(Math.random() * activities.value.length)
}
const activityInfo = computed(() => {
  return `${currentActivity.value.sportType}: ${readableDistance(currentActivity.value.distance)} / ${readableTime(currentActivity.value.movingTime)}`
})
const infoElRef = ref()
const hoverRef = useElementHover(infoElRef)
</script>

<template>
  <div v-if="isDark" class="bg fixed top-0 left-0 bottom-0 right-0 pointer-events-none z--1 op-20">
    <img class="h-full object-tl object-cover max-w-initial max-h-initial" src="/images/snow_mountain_bg.png">
  </div>
  <div
    class="activity-polyline transition position-fixed p-4 lg:top-0 sm:top-50% top-60% bottom-0 right-0 w-full lg:w-80% pointer-events-none"
    :class="hoverRef ? 'op-100 z-1' : 'op-30'"
  >
    <ActivitySvg
      :key="currentActivity.id" :activity="currentActivity" class="h-full w-full"
      @animation-end="next"
    />
  </div>
  <div
    ref="infoElRef" class="
      transition
      position-fixed bottom-0 right-0
      font-bold p-4 mb-10 text-orange op-30
      hover:op-100 hover:bg-write hover:z-1
      cursor-default select-none
      text-right sm:text-left
      pr-10 sm:pr-40
      text-xs sm:text-base
    "
  >
    <div>{{ format(new Date(currentActivity.startDate), 'yyyy-MM-dd') }}</div>
    <div>
      <span>{{ currentActivity.name }}</span>
    </div>
    <div>{{ activityInfo }}</div>
  </div>
</template>
