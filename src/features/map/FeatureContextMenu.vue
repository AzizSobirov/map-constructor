<script setup lang="ts">
import { ref } from 'vue'
import { Square, Edit, Move, Trash2, Copy, MapIcon, ExternalLink } from 'lucide-vue-next'
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from '@/components/ui/context-menu'
import type { GeoJSONFeature } from '@/shared/types'

interface FeatureContextMenuProps {
  feature: GeoJSONFeature | null
}

const props = defineProps<FeatureContextMenuProps>()

const emit = defineEmits<{
  modify: [feature: GeoJSONFeature]
  delete: [featureId: string]
  copyCoordinates: [feature: GeoJSONFeature]
  openInGoogleMaps: [feature: GeoJSONFeature]
}>()

const handleModify = () => {
  if (props.feature) {
    emit('modify', props.feature)
  }
}

const handleDelete = () => {
  if (props.feature) {
    emit('delete', props.feature.properties.id)
  }
}

const handleCopyCoordinates = () => {
  if (props.feature) {
    emit('copyCoordinates', props.feature)
  }
}

const handleOpenInGoogleMaps = () => {
  if (props.feature) {
    emit('openInGoogleMaps', props.feature)
  }
}
</script>

<template>
  <ContextMenu>
    <ContextMenuTrigger as-child>
      <slot />
    </ContextMenuTrigger>
    <ContextMenuContent v-if="feature" class="w-56">
      <div class="px-2 py-1.5">
        <div class="flex items-center gap-2">
          <Square class="h-4 w-4 text-blue-500" />
          <span class="font-semibold text-sm">{{ feature.properties.name }}</span>
        </div>
      </div>

      <ContextMenuSeparator />

      <ContextMenuItem @click="handleModify">
        <Edit class="mr-2 h-4 w-4" />
        <span>Modify</span>
      </ContextMenuItem>

      <ContextMenuItem disabled>
        <Move class="mr-2 h-4 w-4" />
        <span>Transform</span>
      </ContextMenuItem>

      <ContextMenuItem @click="handleDelete" class="text-red-600">
        <Trash2 class="mr-2 h-4 w-4" />
        <span>Delete</span>
      </ContextMenuItem>

      <ContextMenuSeparator />

      <ContextMenuItem disabled>
        <MapIcon class="mr-2 h-4 w-4" />
        <span>Search this area</span>
      </ContextMenuItem>

      <ContextMenuItem @click="handleCopyCoordinates">
        <Copy class="mr-2 h-4 w-4" />
        <span>Copy Coordinates</span>
      </ContextMenuItem>

      <ContextMenuItem @click="handleOpenInGoogleMaps">
        <ExternalLink class="mr-2 h-4 w-4" />
        <span>Open in Google Maps</span>
      </ContextMenuItem>
    </ContextMenuContent>
  </ContextMenu>
</template>
