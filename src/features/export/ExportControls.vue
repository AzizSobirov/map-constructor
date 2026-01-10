<script setup lang="ts">
import { ref } from 'vue'
import { Download, Copy, Upload, Check } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog'
import type { GeoJSONFeatureCollection } from '@/shared/types'
import { downloadGeoJSON, copyToClipboard, parseGeoJSONFile } from '@/shared/utils'

interface ExportControlsProps {
  featureCollection: GeoJSONFeatureCollection
}

const props = defineProps<ExportControlsProps>()

const emit = defineEmits<{
  import: [data: GeoJSONFeatureCollection]
}>()

const showImportDialog = ref(false)
const importError = ref<string | null>(null)
const fileInputRef = ref<HTMLInputElement | null>(null)
const copied = ref(false)

const handleDownload = () => {
  const timestamp = new Date().toISOString().split('T')[0]
  downloadGeoJSON(props.featureCollection, `export-${timestamp}.geojson`)
}

const handleCopy = async () => {
  try {
    await copyToClipboard(props.featureCollection)
    copied.value = true
    setTimeout(() => {
      copied.value = false
    }, 2000)
  } catch (error) {
    console.error('Failed to copy to clipboard:', error)
  }
}

const handleImportClick = () => {
  showImportDialog.value = true
  importError.value = null
}

const handleFileSelect = async (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]

  if (!file) return

  try {
    const data = await parseGeoJSONFile(file)
    emit('import', data)
    showImportDialog.value = false
    importError.value = null

    // Reset file input
    if (fileInputRef.value) {
      fileInputRef.value.value = ''
    }
  } catch (error) {
    importError.value = error instanceof Error ? error.message : 'Failed to import file'
  }
}

const handleDragOver = (event: DragEvent) => {
  event.preventDefault()
}

const handleDrop = async (event: DragEvent) => {
  event.preventDefault()

  const file = event.dataTransfer?.files[0]
  if (!file) return

  try {
    const data = await parseGeoJSONFile(file)
    emit('import', data)
    showImportDialog.value = false
    importError.value = null
  } catch (error) {
    importError.value = error instanceof Error ? error.message : 'Failed to import file'
  }
}
</script>

<template>
  <div class="flex gap-1">
    <Button
      variant="ghost"
      size="icon"
      class="h-8 w-8 rounded bg-white text-gray-700 shadow hover:bg-gray-100"
      @click="handleImportClick"
      title="Import GeoJSON"
    >
      <Upload class="h-4 w-4" />
    </Button>

    <Button
      variant="ghost"
      size="icon"
      class="h-8 w-8 rounded bg-white text-gray-700 shadow hover:bg-gray-100"
      @click="handleDownload"
      title="Download GeoJSON"
    >
      <Download class="h-4 w-4" />
    </Button>

    <Button
      variant="ghost"
      size="icon"
      class="h-8 w-8 rounded bg-white text-gray-700 shadow hover:bg-gray-100"
      @click="handleCopy"
      title="Copy to Clipboard"
    >
      <component
        :is="copied ? Check : Copy"
        class="h-4 w-4"
        :class="{ 'text-green-600': copied }"
      />
    </Button>
  </div>

  <!-- Import Dialog -->
  <Dialog v-model:open="showImportDialog">
    <DialogContent class="max-w-md">
      <DialogTitle class="text-lg font-semibold text-gray-900">Import GeoJSON</DialogTitle>
      <DialogDescription class="text-sm text-gray-600">
        Upload a .geojson file or drag and drop it below
      </DialogDescription>

      <div
        class="mt-4 flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 p-8 transition-colors hover:border-blue-400 hover:bg-blue-50/30"
        style="min-height: 180px"
        @dragover="handleDragOver"
        @drop="handleDrop"
      >
        <Upload class="mb-3 h-10 w-10 text-gray-400" />
        <p class="mb-2 text-sm font-medium text-gray-700">Drag and drop your .geojson file</p>
        <p class="mb-4 text-xs text-gray-500">or</p>

        <input
          ref="fileInputRef"
          type="file"
          accept=".geojson,.json"
          class="hidden"
          @change="handleFileSelect"
        />

        <Button
          variant="ghost"
          class="h-8 border border-gray-300 bg-white px-4 text-sm text-gray-700 hover:bg-gray-100"
          @click="fileInputRef?.click()"
        >
          Choose File
        </Button>
      </div>

      <p v-if="importError" class="mt-2 text-sm text-red-600">
        {{ importError }}
      </p>

      <div class="mt-4 rounded-lg bg-blue-50 p-3 text-xs">
        <p class="font-semibold text-gray-900">Supported formats:</p>
        <ul class="mt-1 list-inside list-disc space-y-0.5 text-gray-700">
          <li>GeoJSON FeatureCollection</li>
          <li>Geometry types: Point, LineString, Polygon</li>
          <li>RFC 7946 compliant</li>
        </ul>
      </div>
    </DialogContent>
  </Dialog>
</template>
