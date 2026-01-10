<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import type { GeoJSONFeature } from '@/shared/types'

interface MouseFollowerProps {
  hoveredFeature: GeoJSONFeature | null
}

const props = defineProps<MouseFollowerProps>()

const mouseX = ref(0)
const mouseY = ref(0)
const isVisible = ref(false)

const handleMouseMove = (e: MouseEvent) => {
  mouseX.value = e.clientX
  mouseY.value = e.clientY
  isVisible.value = !!props.hoveredFeature
}

onMounted(() => {
  window.addEventListener('mousemove', handleMouseMove)
})

onUnmounted(() => {
  window.removeEventListener('mousemove', handleMouseMove)
})
</script>

<template>
  <div
    v-if="isVisible && hoveredFeature"
    class="pointer-events-none fixed z-10000 rounded-lg bg-white/95 backdrop-blur-sm px-3 py-2 shadow-lg border border-gray-200"
    :style="{
      left: `${mouseX + 12}px`,
      top: `${mouseY + 12}px`,
    }"
  >
    <div class="flex items-center gap-2">
      <div
        class="h-3 w-3 rounded-sm shrink-0"
        :style="{ backgroundColor: hoveredFeature.properties.color || '#3b82f6' }"
      />
      <div class="text-sm font-medium text-gray-900">
        {{ hoveredFeature.properties.name || 'Unnamed Feature' }}
      </div>
    </div>
    <div
      v-if="hoveredFeature.properties.description"
      class="mt-1 text-xs text-gray-500 max-w-50 truncate"
    >
      {{ hoveredFeature.properties.description }}
    </div>
    <div class="mt-1 text-xs text-gray-400">
      {{ hoveredFeature.geometry.type }}
    </div>
  </div>
</template>
