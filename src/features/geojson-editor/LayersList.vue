<script setup lang="ts">
import { ref, computed } from 'vue'
import {
  Layers,
  Eye,
  EyeOff,
  Trash2,
  Edit3,
  Check,
  X,
  ChevronDown,
  SplinePointer,
} from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import type { GeoJSONFeature } from '@/shared/types'
import Badge from '@/components/ui/badge/Badge.vue'

interface LayersListProps {
  features: GeoJSONFeature[]
  selectedFeatureId?: string | null
  hoveredFeatureId?: string | null
}

const props = defineProps<LayersListProps>()

const emit = defineEmits<{
  selectFeature: [feature: GeoJSONFeature]
  deleteFeature: [featureId: string]
  renameFeature: [featureId: string, newName: string]
  hoverFeature: [featureId: string | null]
}>()

const collapsed = ref(true)
const hiddenFeatures = ref<Set<string>>(new Set())
const editingFeatureId = ref<string | null>(null)
const editingName = ref('')

const visibleFeatures = computed(() => {
  return props.features.filter((f) => !hiddenFeatures.value.has(f.properties.id))
})

const toggleCollapse = () => {
  collapsed.value = !collapsed.value
}

const toggleFeatureVisibility = (featureId: string) => {
  if (hiddenFeatures.value.has(featureId)) {
    hiddenFeatures.value.delete(featureId)
  } else {
    hiddenFeatures.value.add(featureId)
  }
}

const isFeatureVisible = (featureId: string) => {
  return !hiddenFeatures.value.has(featureId)
}

const selectFeature = (feature: GeoJSONFeature) => {
  if (editingFeatureId.value) return
  emit('selectFeature', feature)
}

const handleMouseEnter = (featureId: string) => {
  emit('hoverFeature', featureId)
}

const handleMouseLeave = () => {
  emit('hoverFeature', null)
}

const deleteFeature = (featureId: string, event: Event) => {
  event.stopPropagation()
  emit('deleteFeature', featureId)
}

const startRename = (feature: GeoJSONFeature, event: Event) => {
  event.stopPropagation()
  editingFeatureId.value = feature.properties.id
  editingName.value = feature.properties.name
}

const saveRename = (featureId: string, event: Event) => {
  event.stopPropagation()
  if (editingName.value.trim()) {
    emit('renameFeature', featureId, editingName.value.trim())
  }
  editingFeatureId.value = null
  editingName.value = ''
}

const cancelRename = (event: Event) => {
  event.stopPropagation()
  editingFeatureId.value = null
  editingName.value = ''
}

const getGeometryIcon = (type: string) => {
  switch (type) {
    case 'Point':
      return '📍'
    case 'LineString':
      return '📏'
    case 'Polygon':
    case 'MultiPolygon':
      return '⬜'
    default:
      return '🗺️'
  }
}
</script>

<template>
  <div
    class="fixed left-3 top-3 z-40 w-72 rounded-lg border bg-white/80 backdrop-blur-2xl shadow-lg select-none overflow-hidden"
  >
    <!-- Header -->
    <div
      class="flex cursor-pointer items-center justify-between border-b border-gray-200 px-3 py-2.5"
      @click="toggleCollapse"
    >
      <div class="flex items-center gap-2">
        <Layers class="h-4 w-4 text-gray-600" />
        <h3 class="text-sm font-semibold text-gray-900">Features</h3>
      </div>

      <div class="flex items-center gap-2">
        <Badge class="h-5 min-w-5 rounded-full px-1 font-mono tabular-nums">
          {{ features.length }}
        </Badge>
        <button class="text-gray-500 hover:text-gray-700">
          <ChevronDown class="size-5" :class="{ 'rotate-180': !collapsed }" />
        </button>
      </div>
    </div>

    <!-- Content -->
    <div v-if="!collapsed" class="max-h-[calc(100vh-65px)] overflow-y-auto">
      <div v-if="features.length === 0" class="p-6 text-center">
        <p class="text-sm font-medium text-gray-500">No features</p>
        <p class="mt-1 text-xs text-gray-400">Start drawing</p>
      </div>

      <div v-else class="divide-y divide-gray-100">
        <div
          v-for="feature in features"
          :key="feature.properties.id"
          class="group flex items-center gap-2 px-3 py-2 transition-colors cursor-pointer"
          :class="{
            'bg-blue-50': props.selectedFeatureId === feature.properties.id,
            'bg-gray-50':
              props.hoveredFeatureId === feature.properties.id &&
              props.selectedFeatureId !== feature.properties.id,
            'hover:bg-gray-50': props.selectedFeatureId !== feature.properties.id,
          }"
          @click="selectFeature(feature)"
          @mouseenter="handleMouseEnter(feature.properties.id)"
          @mouseleave="handleMouseLeave"
        >
          <!-- Checkbox/Visibility -->
          <button
            class="flex h-4 w-4 items-center justify-center rounded border transition-colors"
            :class="
              isFeatureVisible(feature.properties.id)
                ? 'border-blue-500 bg-blue-500'
                : 'border-gray-300 bg-white'
            "
            @click.stop="toggleFeatureVisibility(feature.properties.id)"
          >
            <SplinePointer
              v-if="isFeatureVisible(feature.properties.id)"
              class="h-3 w-3 text-white"
            />
          </button>

          <!-- Feature info -->
          <div class="min-w-0 flex-1">
            <div
              v-if="editingFeatureId === feature.properties.id"
              class="flex items-center gap-1"
              @click.stop
            >
              <Input
                v-model="editingName"
                class="h-6 border-blue-500 text-xs"
                @keydown.enter="saveRename(feature.properties.id, $event)"
                @keydown.esc="cancelRename($event)"
                autofocus
              />
              <Button
                variant="ghost"
                size="icon"
                class="h-6 w-6"
                @click="saveRename(feature.properties.id, $event)"
              >
                <Check class="h-3 w-3 text-green-600" />
              </Button>
              <Button variant="ghost" size="icon" class="h-6 w-6" @click="cancelRename($event)">
                <X class="h-3 w-3 text-red-600" />
              </Button>
            </div>
            <div v-else class="flex items-center gap-2">
              <div
                class="h-3 w-3 rounded-sm border border-gray-300"
                :style="{ backgroundColor: feature.properties.color }"
              />
              <span class="truncate text-sm font-medium text-gray-900">
                {{ feature.properties.name }}
              </span>
            </div>
          </div>

          <!-- Actions -->
          <div
            class="flex items-center gap-0.5 opacity-0 transition-opacity group-hover:opacity-100"
          >
            <Button
              variant="ghost"
              size="icon"
              class="h-6 w-6"
              title="Rename"
              @click.stop="startRename(feature, $event)"
            >
              <Edit3 class="h-3 w-3 text-gray-500" />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              class="h-6 w-6"
              title="Delete"
              @click.stop="deleteFeature(feature.properties.id, $event)"
            >
              <Trash2 class="h-3 w-3 text-red-500" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
