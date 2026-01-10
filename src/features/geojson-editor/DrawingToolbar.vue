<script setup lang="ts">
import { ref } from 'vue'
import {
  MapPin,
  Route,
  Pentagon,
  Trash2,
  X,
  Edit,
  Save,
  Check,
  Upload,
  Download,
  Copy,
} from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import type { DrawMode, GeoJSONFeatureCollection } from '@/shared/types'
import { downloadGeoJSON, copyToClipboard, parseGeoJSONFile } from '@/shared/utils'
import { toast } from 'vue-sonner'

interface DrawingToolbarProps {
  drawMode?: DrawMode
  editMode?: boolean
  selectedFeature?: boolean
  featureCollection: GeoJSONFeatureCollection
}

const props = defineProps<DrawingToolbarProps>()

const emit = defineEmits<{
  drawPoint: []
  drawLine: []
  drawPolygon: []
  clearAll: []
  cancelDraw: []
  editFeature: []
  saveEdit: []
  cancelEdit: []
  import: [data: GeoJSONFeatureCollection]
}>()

const showImportDialog = ref(false)
const importError = ref<string | null>(null)
const fileInputRef = ref<HTMLInputElement | null>(null)
const geoJsonText = ref('')

const handleDrawPoint = () => {
  emit('drawPoint')
}

const handleDrawLine = () => {
  emit('drawLine')
}

const handleDrawPolygon = () => {
  emit('drawPolygon')
}

const handleClearAll = () => {
  emit('clearAll')
}

const handleCancel = () => {
  emit('cancelDraw')
}

const handleEdit = () => {
  emit('editFeature')
}

const handleSaveEdit = () => {
  emit('saveEdit')
}

const handleCancelEdit = () => {
  emit('cancelEdit')
}

const handleImportClick = () => {
  showImportDialog.value = true
  importError.value = null
  geoJsonText.value = ''
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

const handleTextImport = () => {
  try {
    const data = JSON.parse(geoJsonText.value)

    // Validate it's a GeoJSON
    if (!data.type || (data.type !== 'FeatureCollection' && data.type !== 'Feature')) {
      throw new Error('Invalid GeoJSON format')
    }

    // Convert Feature to FeatureCollection if needed
    const featureCollection: GeoJSONFeatureCollection =
      data.type === 'Feature' ? { type: 'FeatureCollection', features: [data] } : data

    emit('import', featureCollection)
    showImportDialog.value = false
    importError.value = null
    geoJsonText.value = ''
  } catch (error) {
    importError.value = error instanceof Error ? error.message : 'Invalid GeoJSON'
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

const handleDownload = () => {
  const timestamp = new Date().toISOString().split('T')[0]
  downloadGeoJSON(props.featureCollection, `export-${timestamp}.geojson`)
}

const handleCopy = async () => {
  try {
    await copyToClipboard(props.featureCollection)
    toast.success('GeoJSON copied to clipboard')
  } catch (error) {
    console.error('Failed to copy to clipboard:', error)
    toast.error('Failed to copy to clipboard')
  }
}
</script>

<template>
  <div class="flex items-center gap-1 rounded-lg border border-gray-200 bg-white p-1 shadow-md">
    <Button
      variant="ghost"
      size="icon"
      :class="[
        'h-8 w-8 transition-colors',
        props.drawMode === 'point'
          ? 'bg-blue-500 text-white hover:bg-blue-600'
          : 'text-gray-700 hover:bg-gray-100',
      ]"
      @click="handleDrawPoint"
      title="Draw Point (Marker)"
    >
      <MapPin class="h-4 w-4" />
    </Button>

    <Button
      variant="ghost"
      size="icon"
      :class="[
        'h-8 w-8 transition-colors',
        props.drawMode === 'line'
          ? 'bg-blue-500 text-white hover:bg-blue-600'
          : 'text-gray-700 hover:bg-gray-100',
      ]"
      @click="handleDrawLine"
      title="Draw Line (Route)"
    >
      <Route class="h-4 w-4" />
    </Button>

    <Button
      variant="ghost"
      size="icon"
      :class="[
        'h-8 w-8 transition-colors',
        props.drawMode === 'polygon'
          ? 'bg-blue-500 text-white hover:bg-blue-600'
          : 'text-gray-700 hover:bg-gray-100',
      ]"
      @click="handleDrawPolygon"
      title="Draw Polygon (Area)"
    >
      <Pentagon class="h-4 w-4" />
    </Button>

    <div class="mx-0.5 h-6 w-px bg-gray-200" />

    <!-- Import/Export Tools -->
    <Button
      variant="ghost"
      size="icon"
      class="h-8 w-8 text-gray-700 hover:bg-gray-100"
      @click="handleImportClick"
      title="Import GeoJSON"
    >
      <Upload class="h-4 w-4" />
    </Button>

    <Button
      variant="ghost"
      size="icon"
      class="h-8 w-8 text-gray-700 hover:bg-gray-100"
      @click="handleDownload"
      title="Download GeoJSON"
    >
      <Download class="h-4 w-4" />
    </Button>

    <Button
      variant="ghost"
      size="icon"
      class="h-8 w-8 text-gray-700 hover:bg-gray-100"
      @click="handleCopy"
      title="Copy GeoJSON"
    >
      <Copy class="h-4 w-4" />
    </Button>

    <div class="mx-0.5 h-6 w-px bg-gray-200" />

    <Button
      variant="ghost"
      size="icon"
      class="h-8 w-8 text-destructive hover:bg-gray-100"
      @click="handleClearAll"
      :title="props.selectedFeature ? 'Delete Selected Feature' : 'Clear All Features'"
    >
      <Trash2 class="h-4 w-4" />
    </Button>

    <Button
      v-if="props.drawMode"
      variant="ghost"
      size="sm"
      class="ml-1 h-8 gap-1 bg-gray-100 px-3 text-xs font-medium text-gray-700 hover:bg-gray-200"
      @click="handleCancel"
    >
      <X class="h-3 w-3" />
      Cancel
    </Button>

    <!-- Edit Mode Buttons -->
    <template v-if="!props.drawMode">
      <div v-if="!props.editMode && props.selectedFeature" class="mx-0.5 h-6 w-px bg-gray-200" />

      <Button
        v-if="!props.editMode && props.selectedFeature"
        variant="ghost"
        size="sm"
        class="h-8 gap-1 bg-blue-50 px-3 text-xs font-medium text-blue-600 hover:bg-blue-100"
        @click="handleEdit"
        title="Edit selected feature"
      >
        <Edit class="h-3 w-3" />
        Edit
      </Button>

      <template v-if="props.editMode">
        <div class="mx-0.5 h-6 w-px bg-gray-200" />

        <Button
          variant="ghost"
          size="sm"
          class="h-8 gap-1 bg-green-50 px-3 text-xs font-medium text-green-600 hover:bg-green-100"
          @click="handleSaveEdit"
          title="Save changes"
        >
          <Check class="h-3 w-3" />
          Save
        </Button>

        <Button
          variant="ghost"
          size="sm"
          class="h-8 gap-1 bg-gray-100 px-3 text-xs font-medium text-gray-700 hover:bg-gray-200"
          @click="handleCancelEdit"
          title="Cancel editing"
        >
          <X class="h-3 w-3" />
          Cancel
        </Button>
      </template>
    </template>
  </div>

  <!-- Import Dialog -->
  <Dialog v-model:open="showImportDialog">
    <DialogContent class="max-w-md" @dragover.prevent @drop.prevent="handleDrop">
      <DialogTitle class="text-lg font-semibold">Import GeoJSON</DialogTitle>
      <DialogDescription class="text-sm text-gray-600">
        Upload a file, paste GeoJSON text, or drag and drop
      </DialogDescription>

      <Tabs default-value="upload" class="w-full">
        <TabsList class="grid w-full grid-cols-2">
          <TabsTrigger value="upload">Upload</TabsTrigger>
          <TabsTrigger value="paste">Paste</TabsTrigger>
        </TabsList>

        <TabsContent value="upload" class="space-y-4">
          <div
            class="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 p-8 transition-colors hover:border-blue-500"
          >
            <Upload class="mb-2 h-10 w-10 text-gray-400" />
            <p class="mb-2 text-sm text-gray-600">Drop your GeoJSON file here or click to browse</p>
            <input
              ref="fileInputRef"
              type="file"
              accept=".geojson,.json"
              class="hidden"
              @change="handleFileSelect"
            />
            <Button variant="default" @click="() => fileInputRef?.click()"> Select File </Button>
          </div>
        </TabsContent>

        <TabsContent value="paste" class="space-y-4">
          <div class="space-y-2">
            <Textarea
              v-model="geoJsonText"
              placeholder='Paste your GeoJSON here, e.g.:
{
  "type": "FeatureCollection",
  "features": [...]
}'
              class="min-h-50 font-mono text-xs"
            />
            <Button variant="default" class="w-full" @click="handleTextImport">
              Import GeoJSON
            </Button>
          </div>
        </TabsContent>
      </Tabs>

      <p v-if="importError" class="text-sm text-red-600">{{ importError }}</p>
    </DialogContent>
  </Dialog>
</template>
