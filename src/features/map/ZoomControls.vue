<script setup lang="ts">
import { Plus, Minus, Fullscreen } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'

const emit = defineEmits<{
  zoomIn: []
  zoomOut: []
  zoomCenter: []
}>()

const handleZoomIn = () => {
  emit('zoomIn')
}

const handleZoomOut = () => {
  emit('zoomOut')
}

const handleZoomCenter = () => {
  emit('zoomCenter')
}
</script>

<template>
  <div class="flex gap-2">
    <div class="flex gap-0.5 rounded-lg border border-gray-200 bg-white p-1 shadow-md">
      <Button
        variant="ghost"
        size="icon"
        class="h-8 w-8 text-gray-700 hover:bg-gray-100"
        @click="handleZoomIn"
        title="Zoom in"
      >
        <Plus class="h-4 w-4" />
      </Button>

      <div class="h-px bg-gray-200" />

      <Button
        variant="ghost"
        size="icon"
        class="h-8 w-8 text-gray-700 hover:bg-gray-100"
        @click="handleZoomOut"
        title="Zoom out"
      >
        <Minus class="h-4 w-4" />
      </Button>
    </div>
    <div class="flex gap-0.5 rounded-lg border border-gray-200 bg-white p-1 shadow-md">
      <Button
        variant="ghost"
        size="icon"
        class="h-8 w-8 text-gray-700 hover:bg-gray-100"
        @click="handleZoomCenter"
        title="Zoom out"
      >
        <Fullscreen class="h-4 w-4" />
      </Button>
    </div>
  </div>
</template>
