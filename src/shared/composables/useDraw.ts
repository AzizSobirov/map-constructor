import { ref } from 'vue'
import L from 'leaflet'
import 'leaflet-draw'
import 'leaflet-draw/dist/leaflet.draw.css'
import type { GeoJSONFeature, DrawMode } from '@/shared/types'
import { createDefaultProperties } from '@/shared/utils'

export interface UseDrawOptions {
  onFeatureCreated?: (feature: GeoJSONFeature) => void
}

export function useDraw(map: L.Map | null, options: UseDrawOptions = {}) {
  const drawMode = ref<DrawMode>(null)
  const drawnItems = new L.FeatureGroup()
  let currentDrawHandler: any = null
  let editHandler: L.EditToolbar.Edit | null = null
  let currentEditLayer: L.Layer | null = null
  let editGroup: L.FeatureGroup | null = null

  /**
   * Initialize drawing controls
   */
  const initDrawControls = () => {
    if (!map) return

    // Add feature group to map
    map.addLayer(drawnItems)

    // Listen to draw events
    map.on(L.Draw.Event.CREATED, (event: any) => {
      const layer = event.layer
      const geoJSON = layer.toGeoJSON()

      // Create feature with properties
      const feature: GeoJSONFeature = {
        type: 'Feature',
        geometry: geoJSON.geometry,
        properties: createDefaultProperties(),
      }

      if (options.onFeatureCreated) {
        options.onFeatureCreated(feature)
      }

      // Reset draw mode and re-enable zoom
      drawMode.value = null
      currentDrawHandler = null
      map.dragging.enable()
      map.scrollWheelZoom.enable()
      map.doubleClickZoom.enable()
    })

    map.on(L.Draw.Event.DRAWSTART, () => {
      // Drawing started
    })

    map.on(L.Draw.Event.DRAWSTOP, () => {
      drawMode.value = null
      currentDrawHandler = null
    })
  }

  /**
   * Start drawing a point
   */
  const drawPoint = () => {
    if (!map) return
    cancelDraw()
    drawMode.value = 'point'
    // Disable zoom and pan during drawing to prevent freezing
    map.dragging.disable()
    map.scrollWheelZoom.disable()
    map.doubleClickZoom.disable()
    currentDrawHandler = new L.Draw.Marker(map as any, {})
    currentDrawHandler.enable()
  }

  /**
   * Start drawing a line
   */
  const drawLine = () => {
    if (!map) return
    cancelDraw()
    drawMode.value = 'line'
    // Disable zoom and pan during drawing to prevent freezing
    map.dragging.disable()
    map.scrollWheelZoom.disable()
    map.doubleClickZoom.disable()
    currentDrawHandler = new L.Draw.Polyline(map as any, {
      shapeOptions: {
        color: '#3b82f6',
        weight: 3,
      },
    })
    currentDrawHandler.enable()
  }

  /**
   * Start drawing a polygon
   */
  const drawPolygon = () => {
    if (!map) return
    cancelDraw()
    drawMode.value = 'polygon'
    // Disable zoom and pan during drawing to prevent freezing
    map.dragging.disable()
    map.scrollWheelZoom.disable()
    map.doubleClickZoom.disable()
    currentDrawHandler = new L.Draw.Polygon(map as any, {
      shapeOptions: {
        color: '#3b82f6',
        weight: 3,
        fillOpacity: 0.4,
      },
    })
    currentDrawHandler.enable()
  }

  /**
   * Cancel current drawing
   */
  const cancelDraw = () => {
    if (currentDrawHandler) {
      try {
        currentDrawHandler.disable()
      } catch (e) {
        // Handler may already be disabled
      }
      currentDrawHandler = null
    }
    drawMode.value = null
    // Re-enable zoom and pan
    if (map) {
      map.dragging.enable()
      map.scrollWheelZoom.enable()
      map.doubleClickZoom.enable()
    }
  }

  /**
   * Clear all drawn items
   */
  const clearDrawnItems = () => {
    drawnItems.clearLayers()
  }

  /**
   * Remove draw controls
   */
  const removeDrawControls = () => {
    cancelDraw()
    if (map) {
      map.removeLayer(drawnItems)
    }
  }

  /**
   * Enable editing mode for a specific feature
   */
  const enableEdit = (layer: L.Layer) => {
    if (!map || !layer) return

    disableEdit()

    currentEditLayer = layer

    // Create a FeatureGroup with this layer for editing and add it to the map
    editGroup = new L.FeatureGroup([layer])
    editGroup.addTo(map)

    // Initialize the edit handler with this feature group
    editHandler = new L.EditToolbar.Edit(map as any, {
      featureGroup: editGroup,
    })

    // Enable editing
    editHandler.enable()
  }

  /**
   * Disable editing mode
   */
  const disableEdit = () => {
    if (editHandler) {
      editHandler.disable()
      editHandler = null
    }
    if (editGroup && map) {
      map.removeLayer(editGroup)
      editGroup = null
    }
    currentEditLayer = null
  }

  /**
   * Save edit changes and get updated geometry
   */
  const saveEdit = (): any | null => {
    if (currentEditLayer) {
      const geoJSON = (currentEditLayer as any).toGeoJSON()
      disableEdit()
      return geoJSON.geometry
    }
    return null
  }

  return {
    drawMode,
    initDrawControls,
    drawPoint,
    drawLine,
    drawPolygon,
    cancelDraw,
    clearDrawnItems,
    removeDrawControls,
    enableEdit,
    disableEdit,
    saveEdit,
  }
}
