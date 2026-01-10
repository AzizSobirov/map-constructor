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
</style>
