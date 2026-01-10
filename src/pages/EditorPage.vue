<script setup lang="ts">
import { ref, computed } from 'vue'
import { toast } from 'vue-sonner'
import MapView from '@/features/map/MapView.vue'
import DrawingToolbar from '@/features/geojson-editor/DrawingToolbar.vue'
import PropertiesEditor from '@/features/geojson-editor/PropertiesEditor.vue'
import LayersList from '@/features/geojson-editor/LayersList.vue'
import ZoomControls from '@/features/map/ZoomControls.vue'
import FeatureContextMenu from '@/features/map/FeatureContextMenu.vue'
import { useDraw, useKeyboardShortcuts } from '@/shared/composables'
import type { GeoJSONFeature, GeoJSONFeatureCollection } from '@/shared/types'

const mapRef = ref<InstanceType<typeof MapView> | null>(null)
const selectedFeature = ref<GeoJSONFeature | null>(null)
const hoveredFeatureId = ref<string | null>(null)
const drawMode = ref<'point' | 'line' | 'polygon' | null>(null)
const contextMenuFeature = ref<GeoJSONFeature | null>(null)
const editMode = ref(false)
const originalFeatureBeforeEdit = ref<GeoJSONFeature | null>(null)

// Get computed feature collection from map
const featureCollection = computed<GeoJSONFeatureCollection>(() => {
  return mapRef.value?.featureCollection || { type: 'FeatureCollection', features: [] }
})

// Initialize draw composable once map is ready
let drawComposable: ReturnType<typeof useDraw> | null = null

const onMapReady = () => {
  const map = mapRef.value?.getMap()
  if (map) {
    drawComposable = useDraw(map as L.Map, {
      onFeatureCreated: (feature) => {
        mapRef.value?.addFeature(feature)
        drawMode.value = null
      },
    })
    drawComposable.initDrawControls()
  }
}

// Drawing handlers
const handleDrawPoint = () => {
  drawMode.value = 'point'
  drawComposable?.drawPoint()
}

const handleDrawLine = () => {
  drawMode.value = 'line'
  drawComposable?.drawLine()
}

const handleDrawPolygon = () => {
  drawMode.value = 'polygon'
  drawComposable?.drawPolygon()
}

const handleCancelDraw = () => {
  drawMode.value = null
  drawComposable?.cancelDraw()
}

const handleClearAll = () => {
  toast.promise(
    () =>
      new Promise((resolve) => {
        mapRef.value?.clearFeatures()
        drawComposable?.clearDrawnItems()
        resolve(true)
      }),
    {
      loading: 'Clearing all features...',
      success: 'All features cleared',
      error: 'Failed to clear features',
    },
  )
}

const handleEditFeature = () => {
  if (!selectedFeature.value) return

  // Store original feature state before editing
  originalFeatureBeforeEdit.value = JSON.parse(JSON.stringify(selectedFeature.value))

  editMode.value = true

  // Enable editing on the selected feature's layer
  const layer = mapRef.value?.getFeatureLayer(selectedFeature.value.properties.id)
  if (layer) {
    drawComposable?.enableEdit(layer)
  }
}

const handleSaveEdit = () => {
  if (!selectedFeature.value) return

  // Get updated geometry from the edited layer
  const updatedGeometry = drawComposable?.saveEdit()

  if (updatedGeometry) {
    // Update the feature with new geometry
    const updatedFeature = {
      ...selectedFeature.value,
      geometry: updatedGeometry,
    }
    mapRef.value?.updateFeature(selectedFeature.value.properties.id, updatedFeature)
    selectedFeature.value = updatedFeature
  }
  originalFeatureBeforeEdit.value = null
  editMode.value = false
}

const handleCancelEdit = () => {
  drawComposable?.disableEdit()
  editMode.value = false

  // Restore original feature state if it exists
  if (originalFeatureBeforeEdit.value && selectedFeature.value) {
    mapRef.value?.updateFeature(
      selectedFeature.value.properties.id,
      originalFeatureBeforeEdit.value,
    )
    selectedFeature.value = originalFeatureBeforeEdit.value
    originalFeatureBeforeEdit.value = null
    editMode.value = false
    return
  }

  originalFeatureBeforeEdit.value = null
  editMode.value = false
  selectedFeature.value = null
  mapRef.value?.setSelectedFeature(null)
}

// Zoom handlers
const handleZoomIn = () => {
  const map = mapRef.value?.getMap()
  if (map) {
    map.zoomIn()
  }
}

const handleZoomOut = () => {
  const map = mapRef.value?.getMap()
  if (map) {
    map.zoomOut()
  }
}

const handleZoomCenter = () => {
  const map = mapRef.value?.getMap()
  if (map) {
    map.setView([41.3, 64.6], 6) // Uzbekistan center
  }
}

// Feature handlers
const handleFeatureClick = (feature: GeoJSONFeature) => {
  selectedFeature.value = feature
  contextMenuFeature.value = feature

  mapRef.value?.setSelectedFeature(feature.properties.id)
}

const handleFeatureHover = (feature: GeoJSONFeature | null) => {
  hoveredFeatureId.value = feature?.properties.id || null
}

const handleSelectFeature = (feature: GeoJSONFeature) => {
  selectedFeature.value = feature

  mapRef.value?.setSelectedFeature(feature.properties.id)
}

const handleHoverFeature = (featureId: string | null) => {
  hoveredFeatureId.value = featureId
  mapRef.value?.setHoveredFeature(featureId)
}

const handleUpdateFeature = (updatedFeature: GeoJSONFeature) => {
  mapRef.value?.updateFeature(updatedFeature.properties.id, updatedFeature)
}

const handleDeleteFeature = (featureId: string) => {
  toast.promise(
    () =>
      new Promise((resolve) => {
        mapRef.value?.removeFeature(featureId)
        if (selectedFeature.value?.properties.id === featureId) {
          selectedFeature.value = null
          mapRef.value?.setSelectedFeature(null)
        }
        resolve(true)
      }),
    {
      loading: 'Deleting feature...',
      success: 'Feature deleted successfully',
      error: 'Failed to delete feature',
    },
  )
}

const handleRenameFeature = (featureId: string, newName: string) => {
  const feature = featureCollection.value.features.find((f) => f.properties.id === featureId)
  if (feature) {
    mapRef.value?.updateFeature(featureId, {
      ...feature,
      properties: { ...feature.properties, name: newName },
    })
  }
}

// Import handler
const handleImport = (data: GeoJSONFeatureCollection) => {
  mapRef.value?.loadGeoJSON(data)
}

// Context menu handlers
const handleModifyFeature = (feature: GeoJSONFeature) => {
  selectedFeature.value = feature
  editMode.value = true
}

const handleCopyCoordinates = (feature: GeoJSONFeature) => {
  let coordsText = ''

  if (feature.geometry.type === 'Point') {
    const [lng, lat] = feature.geometry.coordinates
    coordsText = `${lat.toFixed(6)}, ${lng.toFixed(6)}`
  } else if (feature.geometry.type === 'LineString') {
    coordsText = feature.geometry.coordinates
      .map(([lng, lat]: [number, number]) => `${lat.toFixed(6)}, ${lng.toFixed(6)}`)
      .join('\n')
  } else if (feature.geometry.type === 'Polygon') {
    coordsText = feature.geometry.coordinates[0]
      .map(([lng, lat]: [number, number]) => `${lat.toFixed(6)}, ${lng.toFixed(6)}`)
      .join('\n')
  }

  navigator.clipboard.writeText(coordsText)
  toast.success('Coordinates copied to clipboard')
}

const handleOpenInGoogleMaps = (feature: GeoJSONFeature) => {
  let url = ''

  if (feature.geometry.type === 'Point') {
    const [lng, lat] = feature.geometry.coordinates
    url = `https://www.google.com/maps?q=${lat},${lng}`
  } else if (feature.geometry.type === 'LineString' || feature.geometry.type === 'Polygon') {
    const coords =
      feature.geometry.type === 'LineString'
        ? feature.geometry.coordinates
        : feature.geometry.coordinates[0]
    const [lng, lat] = coords[0]
    url = `https://www.google.com/maps?q=${lat},${lng}`
  }

  if (url) {
    window.open(url, '_blank')
  }
}

// Keyboard shortcuts
useKeyboardShortcuts({
  Delete: () => {
    if (selectedFeature.value) {
      handleDeleteFeature(selectedFeature.value.properties.id)
    }
  },
  Escape: () => {
    if (drawMode.value) {
      handleCancelDraw()
      selectedFeature.value = null
      mapRef.value?.setSelectedFeature(null)
    }
  },
})
</script>

<template>
  <div class="relative h-screen w-screen overflow-hidden bg-gray-50">
    <!-- Map with Context Menu -->
    <FeatureContextMenu
      :feature="contextMenuFeature"
      @modify="handleModifyFeature"
      @delete="handleDeleteFeature"
      @copy-coordinates="handleCopyCoordinates"
      @open-in-google-maps="handleOpenInGoogleMaps"
    >
      <div class="relative z-2! h-full w-full">
        <MapView
          ref="mapRef"
          @feature-click="handleFeatureClick"
          @feature-hover="handleFeatureHover"
          @map-ready="onMapReady"
        />
      </div>
    </FeatureContextMenu>

    <!--  Toolbar -->
    <div class="fixed bottom-6 left-1/2 z-40 -translate-x-1/2 flex items-center gap-4">
      <!-- Drawing actions -->
      <DrawingToolbar
        :draw-mode="drawMode"
        :edit-mode="editMode"
        :selected-feature="!!selectedFeature"
        :feature-collection="featureCollection"
        @draw-point="handleDrawPoint"
        @draw-line="handleDrawLine"
        @draw-polygon="handleDrawPolygon"
        @clear-all="handleClearAll"
        @cancel-draw="handleCancelDraw"
        @edit-feature="handleEditFeature"
        @save-edit="handleSaveEdit"
        @cancel-edit="handleCancelEdit"
        @import="handleImport"
      />

      <!-- Zoom Controls -->
      <ZoomControls
        @zoom-in="handleZoomIn"
        @zoom-out="handleZoomOut"
        @zoom-center="handleZoomCenter"
      />
    </div>

    <!-- Layers List -->
    <LayersList
      :features="featureCollection.features"
      :selected-feature-id="selectedFeature?.properties.id"
      :hovered-feature-id="hoveredFeatureId"
      @select-feature="handleSelectFeature"
      @delete-feature="handleDeleteFeature"
      @rename-feature="handleRenameFeature"
      @hover-feature="handleHoverFeature"
    />

    <!-- Properties Editor -->
    <PropertiesEditor
      :feature="selectedFeature"
      @update:open="
        (val) => {
          if (!val) {
            selectedFeature = null
            mapRef?.setSelectedFeature(null)
          }
        }
      "
      @update:feature="handleUpdateFeature"
      @delete="handleDeleteFeature"
    />
  </div>
</template>
