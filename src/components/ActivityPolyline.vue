<script setup lang="ts">
import { format } from 'date-fns'
import activities from '../../strava-activities.json'
import { readableDistance, readableTime } from '~/logics'
import type { BaseActivity } from '~/types'

function getRandomActivity() {
  return activities[Math.floor(Math.random() * activities.length)] as BaseActivity
}
const activityRef = ref(getRandomActivity())
function next() {
  activityRef.value = getRandomActivity()
}
const activityInfo = computed(() => {
  return `${activityRef.value.sportType}: ${readableDistance(activityRef.value.distance)} / ${readableTime(activityRef.value.movingTime)}`
})
const infoElRef = ref()
const hoverRef = useElementHover(infoElRef)
</script>

<template>
  <div
    class="activity-polyline transition position-fixed p-4 top-0 bottom-0 right-0 left-30% pointer-events-none" :class="hoverRef ? 'op-100 z-1' : 'op-30'"
  >
    <ActivitySvg
      :key="activityRef.id" :activity="activityRef" class="h-full w-full"
      @animation-end="next"
    />
  </div>
  <div
    ref="infoElRef" class="
      transition
      position-fixed bottom-0 right-0
      font-bold p-4 mb-10 pr-40 font-italic text-orange op-20
      hover:op-100 hover:bg-write hover:z-1
      cursor-default select-none
    "
    @click="next"
  >
    <div>{{ format(new Date(activityRef.startDate), 'yyyy-MM-dd') }}</div>
    <div>
      <span>{{ activityRef.name }}</span>
    </div>
    <div>{{ activityInfo }}</div>
  </div>
</template>
