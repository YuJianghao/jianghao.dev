<script setup lang="ts">
import type { BaseActivity } from '~/types'

const props = defineProps<{
  activity: BaseActivity
}>()
const emits = defineEmits(['animation-end'])
const { activity } = toRefs(props)
const svg = computed(() => {
  const { points, width, height } = activity.value.map
  const rate = 800 / width
  function pos([x, y]: [number, number]) {
    return `${x * rate} ${height * rate - y * rate}`
  }
  const pathLength = points.reduce((acc, [x, y], i) => {
    if (i === 0)
      return acc
    const [prevX, prevY] = points[i - 1]
    return acc + Math.sqrt((x - prevX) ** 2 + (y - prevY) ** 2)
  }, 0,
  ) * rate

  return {
    rate,
    ratio: width / height,
    viewBox: `-2 -2 ${width * rate + 2} ${height * rate + 2}`,
    path: {
      length: pathLength,
      d: `M ${pos(points[0])} ${points.slice(1).map(pos).join(' ')}`,
    },
  }
})
</script>

<template>
  <svg
    :viewBox="svg.viewBox" preserveAspectRatio="xMaxYMax meet" :style="{
      aspectRatio: svg.ratio,
    }"
  >
    <path
      :d="svg.path.d" stroke="orange" fill="none"
      :style="`--length: ${svg.path.length + 10}; animation-duration: ${svg.path.length / 100}s`"
      @animationend="emits('animation-end')"
    />
  </svg>
</template>

<style scoped>
@media (prefers-reduced-motion) {
  path {
    animation: none !important;
    stroke-dasharray: unset !important;
  }
}

@keyframes grow {
  from {
    stroke-dashoffset: 1px;
    stroke-dasharray: 0 var(--length);
    opacity: 0;
  }

  2% {
    opacity: 1;
  }

  98% {

    opacity: 1;
  }

  to {
    opacity: 0;
    stroke-dasharray: var(--length) 0;
  }
}

path {
  stroke-dashoffset: 1px;
  stroke-dasharray: var(--length) 0;
  animation-name: grow;
  animation-timing-function: linear;
  animation-fill-mode: forwards;
  animation-delay: 0s;
  transform-origin: center;
  stroke-width: 2px
}
</style>
