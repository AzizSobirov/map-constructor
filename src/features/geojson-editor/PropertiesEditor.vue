<script setup lang="ts">
import { ref, watch } from 'vue'
import { useDebounceFn } from '@vueuse/core'
import { X, Eye, EyeOff, Trash2, TableProperties, ChevronDown, Copy, Check } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'vue-sonner'
import type { GeoJSONFeature, FeatureProperties, GeoJSONFeatureCollection } from '@/shared/types'

interface PropertiesEditorProps {
  feature: GeoJSONFeature | null
  features?: GeoJSONFeatureCollection
}

const props = defineProps<PropertiesEditorProps>()

const emit = defineEmits<{
  'update:open': [value: boolean]
  'update:feature': [feature: GeoJSONFeature]
  'update:all-features': [properties: Partial<FeatureProperties>]
  delete: [featureId: string]
}>()

const collapsed = ref(true)

const localProperties = ref<FeatureProperties | null>(null)
const customProperties = ref<Array<{ key: string; value: string }>>([])
const fillColor = ref('#4287F5')
const lineColor = ref('#4287F5')
const fillOpacity = ref(39)
const strokeOpacity = ref(100)
const fillVisible = ref(true)
const strokeVisible = ref(true)
const editingCoordinates = ref(false)
const coordinatesText = ref('')
const copiedId = ref(false)

watch(
  () => props.feature,
  (newFeature) => {
    if (newFeature) {
      collapsed.value = false
      localProperties.value = { ...newFeature.properties }
      fillColor.value = newFeature.properties.fillColor || newFeature.properties.color || '#4287F5'
      lineColor.value = newFeature.properties.lineColor || newFeature.properties.color || '#4287F5'
      fillOpacity.value = newFeature.properties.fillOpacity ?? 39
      strokeOpacity.value = newFeature.properties.strokeOpacity ?? 100

      // Set coordinates text
      if (newFeature.geometry.type === 'Point') {
        const [lng, lat] = newFeature.geometry.coordinates
        coordinatesText.value = `${lat.toFixed(6)}, ${lng.toFixed(6)}`
      } else if (newFeature.geometry.type === 'LineString') {
        coordinatesText.value = newFeature.geometry.coordinates
          .map(([lng, lat]: [number, number]) => `${lat.toFixed(6)}, ${lng.toFixed(6)}`)
          .join('\n')
      } else if (newFeature.geometry.type === 'Polygon') {
        coordinatesText.value = newFeature.geometry.coordinates[0]
          .map(([lng, lat]: [number, number]) => `${lat.toFixed(6)}, ${lng.toFixed(6)}`)
          .join('\n')
      }

      // Extract custom properties (not default ones)
      const defaultKeys = ['id', 'name', 'description', 'color']
      customProperties.value = Object.entries(newFeature.properties)
        .filter(([key]) => !defaultKeys.includes(key))
        .map(([key, value]) => ({ key, value: String(value) }))
    } else {
      localProperties.value = null
      customProperties.value = []
    }
  },
  { immediate: true },
)

const updateProperty = (key: keyof FeatureProperties, value: any) => {
  if (!localProperties.value || !props.feature) return

  localProperties.value[key] = value

  emit('update:feature', {
    ...props.feature,
    properties: { ...localProperties.value },
  })
}

const debouncedUpdateFillColor = useDebounceFn((color: string) => {
  if (props.feature) {
    updateProperty('fillColor', color)
  } else {
    emit('update:all-features', { fillColor: color })
  }
}, 300)

const debouncedUpdateLineColor = useDebounceFn((color: string) => {
  if (props.feature) {
    updateProperty('lineColor', color)
  } else {
    emit('update:all-features', { lineColor: color })
  }
}, 300)

const updateFillColor = (color: string | number) => {
  fillColor.value = String(color)
  debouncedUpdateFillColor(String(color))
}

const updateFillOpacity = (opacity: string | number) => {
  const numOpacity = typeof opacity === 'string' ? parseFloat(opacity) : opacity
  fillOpacity.value = numOpacity
  if (props.feature) {
    updateProperty('fillOpacity', numOpacity)
  } else {
    emit('update:all-features', { fillOpacity: numOpacity })
  }
}

const updateLineColor = (color: string | number) => {
  lineColor.value = String(color)
  debouncedUpdateLineColor(String(color))
}

const updateStrokeOpacity = (opacity: string | number) => {
  const numOpacity = typeof opacity === 'string' ? parseFloat(opacity) : opacity
  strokeOpacity.value = numOpacity
  if (props.feature) {
    updateProperty('strokeOpacity', numOpacity)
  } else {
    emit('update:all-features', { strokeOpacity: numOpacity })
  }
}

const updateCoordinates = () => {
  if (!props.feature) return

  try {
    const lines = coordinatesText.value.split('\n').filter((line) => line.trim())

    if (props.feature.geometry.type === 'Point') {
      if (lines.length === 0) throw new Error('No coordinates provided')
      const firstLine = lines[0]
      if (!firstLine) throw new Error('No coordinates provided')
      const parts = firstLine.split(',').map((s) => parseFloat(s.trim()))
      if (parts.length < 2) throw new Error('Invalid coordinates format')
      const [lat, lng] = parts
      if (isNaN(lat!) || isNaN(lng!)) throw new Error('Invalid coordinates')

      emit('update:feature', {
        ...props.feature,
        geometry: {
          type: 'Point',
          coordinates: [lng!, lat!],
        },
      })
    } else if (props.feature.geometry.type === 'LineString') {
      const coords = lines.map((line) => {
        const parts = line.split(',').map((s) => parseFloat(s.trim()))
        if (parts.length < 2) throw new Error('Invalid coordinates format')
        const [lat, lng] = parts
        if (isNaN(lat!) || isNaN(lng!)) throw new Error('Invalid coordinates')
        return [lng!, lat!]
      })

      emit('update:feature', {
        ...props.feature,
        geometry: {
          type: 'LineString',
          coordinates: coords,
        },
      })
    } else if (props.feature.geometry.type === 'Polygon') {
      const coords = lines.map((line) => {
        const parts = line.split(',').map((s) => parseFloat(s.trim()))
        if (parts.length < 2) throw new Error('Invalid coordinates format')
        const [lat, lng] = parts
        if (isNaN(lat!) || isNaN(lng!)) throw new Error('Invalid coordinates')
        return [lng!, lat!]
      })

      emit('update:feature', {
        ...props.feature,
        geometry: {
          type: 'Polygon',
          coordinates: [coords],
        },
      })
    }

    editingCoordinates.value = false
  } catch (error) {
    console.error('Failed to update coordinates:', error)
  }
}

const addCustomProperty = () => {
  customProperties.value.push({ key: '', value: '' })
}

const updateCustomProperty = (index: number, key: string, value: string) => {
  if (!localProperties.value || !props.feature) return

  const oldKey = customProperties.value[index]?.key
  customProperties.value[index] = { key, value }

  // Remove old key if it was renamed
  if (oldKey && oldKey !== key) {
    delete localProperties.value[oldKey]
  }

  // Add new property
  if (key) {
    localProperties.value[key] = value

    emit('update:feature', {
      ...props.feature,
      properties: { ...localProperties.value },
    })
  }
}

const removeCustomProperty = (index: number) => {
  if (!localProperties.value || !props.feature) return

  const key = customProperties.value[index]?.key
  if (key) {
    delete localProperties.value[key]
  }

  customProperties.value.splice(index, 1)

  emit('update:feature', {
    ...props.feature,
    properties: { ...localProperties.value },
  })
}

const handleDelete = () => {
  if (!props.feature) return

  emit('delete', props.feature.properties.id)
  emit('update:open', false)
}

const close = () => {
  emit('update:open', false)
}

const toggleCollapse = () => {
  collapsed.value = !collapsed.value
}

const copyId = async () => {
  if (!props.feature) return

  try {
    await navigator.clipboard.writeText(props.feature.properties.id)
    copiedId.value = true
    toast.success('ID copied to clipboard')
    setTimeout(() => {
      copiedId.value = false
    }, 2000)
  } catch (error) {
    toast.error('Failed to copy ID')
  }
}
</script>

<template>
  <div
    class="fixed right-3 top-3 z-40 w-72 rounded-lg border bg-white/80 backdrop-blur-2xl shadow-lg select-none overflow-hidden"
  >
    <!-- Header -->
    <div
      class="flex cursor-pointer items-center justify-between border-b border-gray-200 px-3 py-2.5"
      @click="toggleCollapse"
    >
      <div class="flex items-center gap-2">
        <TableProperties class="h-4 w-4 text-gray-600" />
        <h3 class="text-sm font-semibold text-gray-900">Properties</h3>
      </div>

      <div class="flex items-center gap-2">
        <button class="text-gray-500 hover:text-gray-700">
          <ChevronDown class="size-5" :class="{ 'rotate-180': !collapsed }" />
        </button>
      </div>
    </div>

    <!-- Content -->
    <div v-if="!collapsed" class="max-h-[calc(100vh-65px)] overflow-y-auto">
      <div v-if="!feature && (!features || features.features.length === 0)" class="p-6 text-center">
        <p class="text-sm font-medium text-gray-500">No properties</p>
        <p class="mt-1 text-xs text-gray-400">Start drawing</p>
      </div>

      <!-- Bulk edit mode when no feature selected but features exist -->
      <div
        v-else-if="!feature && features && features.features.length > 0"
        class="divide-y divide-gray-100"
      >
        <div class="space-y-4 p-4">
          <div class="mb-4 rounded-md bg-blue-50 p-3">
            <p class="text-xs font-medium text-blue-900">Bulk Edit Mode</p>
            <p class="mt-1 text-xs text-blue-700">
              Changes will apply to all {{ features.features.length }} features
            </p>
          </div>

          <!-- Fill Color -->
          <div class="space-y-1.5">
            <Label for="fill-color" class="text-xs font-medium text-gray-700">Fill Color</Label>
            <div class="flex items-center gap-2">
              <label
                for="fill-color-input"
                class="relative h-8 w-8 cursor-pointer rounded-md p-0.5 border border-gray-300 shrink-0"
              >
                <div class="size-full rounded-sm" :style="{ backgroundColor: fillColor }"></div>

                <input
                  id="fill-color-input"
                  type="color"
                  :value="fillColor"
                  @input="updateFillColor(($event.target as HTMLInputElement).value)"
                  class="hidden"
                />
              </label>

              <Input
                id="fill-color"
                :model-value="fillColor.toUpperCase()"
                @update:model-value="updateFillColor"
                placeholder="#4287F5"
                class="h-8 flex-1 text-sm font-mono uppercase"
              />

              <Input
                id="fill-opacity"
                :model-value="fillOpacity"
                @update:model-value="updateFillOpacity"
                type="number"
                min="0"
                max="100"
                class="h-8 w-16 text-sm"
                placeholder="Opacity"
              />
            </div>
          </div>

          <!-- Line Color -->
          <div class="space-y-1.5">
            <Label for="line-color" class="text-xs font-medium text-gray-700">Line Color</Label>
            <div class="flex items-center gap-2">
              <label
                for="line-color-input"
                class="relative h-8 w-8 cursor-pointer rounded-md p-0.5 border border-gray-300 shrink-0"
              >
                <div class="size-full rounded-sm" :style="{ backgroundColor: lineColor }"></div>

                <input
                  id="line-color-input"
                  type="color"
                  :value="lineColor"
                  @input="updateLineColor(($event.target as HTMLInputElement).value)"
                  class="hidden"
                />
              </label>

              <Input
                id="line-color"
                :model-value="lineColor.toUpperCase()"
                @update:model-value="updateLineColor"
                placeholder="#4287F5"
                class="h-8 flex-1 text-sm font-mono uppercase"
              />

              <Input
                id="stroke-opacity"
                :model-value="strokeOpacity"
                @update:model-value="updateStrokeOpacity"
                type="number"
                min="0"
                max="100"
                class="h-8 w-16 text-sm"
                placeholder="Opacity"
              />
            </div>
          </div>
        </div>
      </div>

      <div v-else class="divide-y divide-gray-100">
        <div class="space-y-4 p-4">
          <!-- Name -->
          <div class="space-y-1.5">
            <Label for="feature-name" class="text-xs font-medium text-gray-700">Name</Label>
            <Input
              id="feature-name"
              :model-value="localProperties?.name"
              @update:model-value="updateProperty('name', $event)"
              placeholder="Feature name"
              class="h-8 text-sm"
            />
          </div>

          <!-- Fill Color -->
          <div class="space-y-1.5">
            <Label for="fill-color" class="text-xs font-medium text-gray-700">Fill Color</Label>
            <div class="flex items-center gap-2">
              <label
                for="fill-color-input"
                class="relative h-8 w-8 cursor-pointer rounded-md p-0.5 border border-gray-300 shrink-0"
              >
                <div class="size-full rounded-sm" :style="{ backgroundColor: fillColor }"></div>

                <input
                  id="fill-color-input"
                  type="color"
                  :value="fillColor"
                  @input="updateFillColor(($event.target as HTMLInputElement).value)"
                  class="hidden"
                />
              </label>

              <Input
                id="fill-color"
                :model-value="fillColor.toUpperCase()"
                @update:model-value="updateFillColor"
                placeholder="#4287F5"
                class="h-8 flex-1 text-sm font-mono uppercase"
              />

              <Input
                id="fill-opacity"
                :model-value="fillOpacity"
                @update:model-value="updateFillOpacity"
                type="number"
                min="0"
                max="100"
                class="h-8 w-16 text-sm"
                placeholder="Opacity"
              />
            </div>
          </div>

          <!-- Line Color -->
          <div class="space-y-1.5">
            <Label for="line-color" class="text-xs font-medium text-gray-700">Line Color</Label>
            <div class="flex items-center gap-2">
              <label
                for="line-color-input"
                class="relative h-8 w-8 cursor-pointer rounded-md p-0.5 border border-gray-300 shrink-0"
              >
                <div class="size-full rounded-sm" :style="{ backgroundColor: lineColor }"></div>

                <input
                  id="line-color-input"
                  type="color"
                  :value="lineColor"
                  @input="updateLineColor(($event.target as HTMLInputElement).value)"
                  class="hidden"
                />
              </label>

              <Input
                id="line-color"
                :model-value="lineColor.toUpperCase()"
                @update:model-value="updateLineColor"
                placeholder="#4287F5"
                class="h-8 flex-1 text-sm font-mono uppercase"
              />

              <Input
                id="stroke-opacity"
                :model-value="strokeOpacity"
                @update:model-value="updateStrokeOpacity"
                type="number"
                min="0"
                max="100"
                class="h-8 w-16 text-sm"
                placeholder="Opacity"
              />
            </div>
          </div>

          <!-- Coordinates -->
          <div class="space-y-1.5">
            <div class="flex items-center justify-between">
              <Label class="text-xs font-medium text-gray-700">Coordinates</Label>
              <Button
                v-if="!editingCoordinates"
                variant="ghost"
                size="sm"
                class="h-6 text-xs text-blue-600 hover:bg-blue-50"
                @click="editingCoordinates = true"
              >
                Edit
              </Button>
              <div v-else class="flex gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  class="h-6 text-xs text-green-600 hover:bg-green-50"
                  @click="updateCoordinates"
                >
                  Save
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  class="h-6 text-xs text-gray-600 hover:bg-gray-50"
                  @click="editingCoordinates = false"
                >
                  Cancel
                </Button>
              </div>
            </div>
            <textarea
              v-model="coordinatesText"
              :disabled="!editingCoordinates"
              class="flex w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-xs font-mono ring-offset-background placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 disabled:cursor-not-allowed disabled:bg-gray-50 disabled:opacity-70"
              style="min-height: 80px"
              placeholder="lat, lng"
            />
            <p class="text-xs text-gray-500">
              Format: lat, lng (one per line for LineString/Polygon)
            </p>
          </div>

          <!-- ID (read-only) -->
          <div class="space-y-1.5">
            <Label for="feature-id" class="text-xs font-medium text-gray-700">ID</Label>
            <div class="flex gap-2">
              <Input
                id="feature-id"
                :model-value="localProperties?.id"
                disabled
                class="h-8 flex-1 font-mono text-xs"
              />
              <Button
                variant="ghost"
                size="icon"
                class="h-8 w-8 shrink-0"
                @click="copyId"
                title="Copy ID"
              >
                <Check v-if="copiedId" class="h-4 w-4 text-green-600" />
                <Copy v-else class="h-4 w-4 text-gray-600" />
              </Button>
            </div>
          </div>

          <!-- Custom Properties -->
          <div class="space-y-2">
            <div class="flex items-center justify-between">
              <Label class="text-xs font-medium text-gray-700">Custom Properties</Label>
              <Button
                variant="ghost"
                size="sm"
                class="h-7 text-xs text-blue-600 hover:bg-blue-50"
                @click="addCustomProperty"
              >
                Add
              </Button>
            </div>

            <div v-for="(prop, index) in customProperties" :key="index" class="space-y-1.5">
              <div class="flex gap-1.5">
                <Input
                  :model-value="prop.key"
                  @update:model-value="updateCustomProperty(index, String($event), prop.value)"
                  placeholder="Key"
                  class="h-8 flex-1 text-sm"
                />
                <Input
                  :model-value="prop.value"
                  @update:model-value="updateCustomProperty(index, prop.key, String($event))"
                  placeholder="Value"
                  class="h-8 flex-1 text-sm"
                />
                <Button
                  variant="ghost"
                  size="icon"
                  class="h-8 w-8 text-red-500 hover:bg-red-50"
                  @click="removeCustomProperty(index)"
                >
                  <X class="h-3 w-3" />
                </Button>
              </div>
            </div>
          </div>

          <!-- Geometry Type (read-only) -->
          <div v-if="feature" class="space-y-1.5">
            <Label class="text-xs font-medium text-gray-700">Geometry Type</Label>
            <Input :model-value="feature.geometry.type" disabled class="h-8 text-sm" />
          </div>

          <!-- Actions -->
          <div class="pt-2">
            <Button
              variant="ghost"
              class="h-9 w-full border border-red-200 bg-red-50 text-sm font-medium text-red-600 hover:bg-red-100"
              @click="handleDelete"
            >
              Delete Feature
            </Button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
