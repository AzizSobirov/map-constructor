<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useMap } from '@/shared/composables'
import type { GeoJSONFeature, GeoJSONFeatureCollection } from '@/shared/types'

interface MapViewProps {
  onFeatureClick?: (feature: GeoJSONFeature) => void
  onFeatureHover?: (feature: GeoJSONFeature | null) => void
}

const props = defineProps<MapViewProps>()

const emit = defineEmits<{
  featureClick: [feature: GeoJSONFeature]
  featureHover: [feature: GeoJSONFeature | null]
  mapReady: []
}>()

const mapContainer = ref<HTMLElement | null>(null)

const {
  map,
  featureCollection,
  loadGeoJSON,
  addFeature,
  updateFeature,
  removeFeature,
  clearFeatures,
  changeBaseLayer,
  getMap,
  getFeatureLayer,
  setSelectedFeature,
  setHoveredFeature,
  refreshStyles,
} = useMap(mapContainer, {
  onFeatureClick: (feature) => {
    emit('featureClick', feature)
    props.onFeatureClick?.(feature)
  },
  onFeatureHover: (feature) => {
    emit('featureHover', feature)
    props.onFeatureHover?.(feature)
  },
})

onMounted(() => {
  emit('mapReady')
})

// Expose methods for parent components
defineExpose({
  loadGeoJSON,
  addFeature,
  updateFeature,
  removeFeature,
  clearFeatures,
  changeBaseLayer,
  getMap,
  getFeatureLayer,
  featureCollection,
  setSelectedFeature,
  setHoveredFeature,
  refreshStyles,
})
</script>

<template>
  <div ref="mapContainer" class="h-full w-full" />
</template>

<style scoped>
/* Ensure Leaflet containers have proper sizing */
:deep(.leaflet-container) {
  height: 100%;
  width: 100%;
  z-index: 0;
}

/* Style edit handles to be circular */
:deep(.leaflet-editing-icon) {
  border-radius: 50% !important;
  width: 12px !important;
  height: 12px !important;
  margin-left: -6px !important;
  margin-top: -6px !important;
  border: 2px solid #fff !important;
  background-color: #3b82f6 !important;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2) !important;
}

:deep(.leaflet-editing-icon:hover) {
  background-color: #2563eb !important;
  width: 14px !important;
  height: 14px !important;
  margin-left: -7px !important;
  margin-top: -7px !important;
}

/* Style middle marker (for adding vertices) */
:deep(.leaflet-marker-icon.leaflet-div-icon.leaflet-editing-icon.leaflet-touch-icon) {
  opacity: 0.6;
}

:deep(.leaflet-marker-icon.leaflet-div-icon.leaflet-editing-icon.leaflet-touch-icon:hover) {
  opacity: 1;
}
</style>
