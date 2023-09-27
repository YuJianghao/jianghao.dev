<script setup lang="ts">
import dayjs from 'dayjs'
import { readableDistance, readableTime, useActivities } from '~/logics'
import type { BaseActivity } from '~/types'

const { activities, currentActivityIdx } = useActivities()
function onClick(activity: BaseActivity) {
  currentActivityIdx.value = activities.value.findIndex(a => a.id === activity.id)
}
</script>

<template>
  <div class="mt-10 op-40 hover:op-100 transition-200">
    <div v-for="activity in activities" :key="activity.id" class="select-none cursor-pointer" @click="onClick(activity)">
      <div class="max-w-7xl mx-auto md:pl-12 pl-0 text-gray-4 dark:text-gray-6 py-1 hover:text-orange hover:bg-#77777720 transition-100">
        {{ dayjs(activity.startDate).format('YYYY-MM-DD') }} - {{ activity.sportType }} - {{ activity.name }} - {{ readableDistance(activity.distance) }} / {{ readableTime(activity.movingTime) }}
      </div>
    </div>
  </div>
</template>
