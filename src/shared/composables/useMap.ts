import { ref, onMounted, onUnmounted, type Ref } from 'vue'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import type { MapConfig, GeoJSONFeatureCollection, GeoJSONFeature } from '@/shared/types'
import { DEFAULT_MAP_CENTER, DEFAULT_MAP_ZOOM, MIN_ZOOM, MAX_ZOOM } from '@/shared/utils/constants'

export interface UseMapOptions {
  config?: Partial<MapConfig>
  onFeatureClick?: (feature: GeoJSONFeature, layer: L.Layer) => void
  onFeatureHover?: (feature: GeoJSONFeature | null) => void
}

export function useMap(containerRef: Ref<HTMLElement | null>, options: UseMapOptions = {}) {
  const map = ref<L.Map | null>(null)
  const geoJsonLayer = ref<L.GeoJSON | null>(null)
  const featureCollection = ref<GeoJSONFeatureCollection>({
    type: 'FeatureCollection',
    features: [],
  })
  const selectedFeatureId = ref<string | null>(null)
  const hoveredFeatureId = ref<string | null>(null)

  const config: MapConfig = {
    center: options.config?.center || DEFAULT_MAP_CENTER,
    zoom: options.config?.zoom || DEFAULT_MAP_ZOOM,
    minZoom: options.config?.minZoom || MIN_ZOOM,
    maxZoom: options.config?.maxZoom || MAX_ZOOM,
  }

  /**
   * Initialize the map instance
   */
  const initMap = () => {
    if (!containerRef.value || map.value) return

    // Create map instance
    map.value = L.map(containerRef.value, {
      center: config.center,
      zoom: config.zoom,
      minZoom: config.minZoom,
      maxZoom: config.maxZoom,
      zoomControl: false,
    })

    // Add default tile layer (OpenStreetMap)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: config.maxZoom || MAX_ZOOM,
    }).addTo(map.value as L.Map)

    // Initialize GeoJSON layer
    initGeoJSONLayer()
  }

  /**
   * Initialize GeoJSON layer with styling and events
   */
  const initGeoJSONLayer = () => {
    if (!map.value) return

    geoJsonLayer.value = L.geoJSON(undefined, {
      style: (feature) => {
        const isSelected = feature?.properties?.id === selectedFeatureId.value
        const isHovered = feature?.properties?.id === hoveredFeatureId.value
        const hasSelection = selectedFeatureId.value !== null

        return {
          color: feature?.properties?.color || '#3b82f6',
          weight: isSelected || isHovered ? 4 : 3,
          opacity: 1,
          fillOpacity: hasSelection && !isSelected ? 0.15 : isSelected || isHovered ? 0.5 : 0.4,
        }
      },
      pointToLayer: (feature, latlng) => {
        const isSelected = feature?.properties?.id === selectedFeatureId.value
        const isHovered = feature?.properties?.id === hoveredFeatureId.value
        const hasSelection = selectedFeatureId.value !== null

        return L.circleMarker(latlng, {
          radius: isSelected || isHovered ? 10 : 8,
          fillColor: feature.properties?.color || '#3b82f6',
          color: '#fff',
          weight: 2,
          opacity: 1,
          fillOpacity: hasSelection && !isSelected ? 0.35 : isSelected || isHovered ? 1 : 0.8,
        })
      },
      onEachFeature: (feature, layer) => {
        // Click event
        layer.on('click', () => {
          if (options.onFeatureClick) {
            options.onFeatureClick(feature as GeoJSONFeature, layer)
          }
        })

        // Hover events
        layer.on('mouseover', () => {
          hoveredFeatureId.value = feature.properties?.id || null
          refreshStyles()
          if (options.onFeatureHover) {
            options.onFeatureHover(feature as GeoJSONFeature)
          }
        })

        layer.on('mouseout', () => {
          hoveredFeatureId.value = null
          refreshStyles()
          if (options.onFeatureHover) {
            options.onFeatureHover(null)
          }
        })
      },
    }).addTo(map.value as L.Map)
  }

  /**
   * Refresh layer styles based on current selection/hover state
   */
  const refreshStyles = () => {
    if (geoJsonLayer.value) {
      geoJsonLayer.value.eachLayer((layer: any) => {
        if (layer.feature) {
          const isSelected = layer.feature.properties?.id === selectedFeatureId.value
          const isHovered = layer.feature.properties?.id === hoveredFeatureId.value
          const hasSelection = selectedFeatureId.value !== null

          if (layer.setStyle) {
            layer.setStyle({
              color: layer.feature.properties?.color || '#3b82f6',
              weight: isSelected || isHovered ? 4 : 3,
              opacity: 1,
              fillOpacity: hasSelection && !isSelected ? 0.15 : isSelected || isHovered ? 0.5 : 0.4,
            })
          }

          // Update marker radius for points
          if (layer instanceof L.CircleMarker) {
            layer.setRadius(isSelected || isHovered ? 10 : 8)
            layer.setStyle({
              opacity: 1,
              fillOpacity: hasSelection && !isSelected ? 0.35 : isSelected || isHovered ? 1 : 0.8,
            })
          }
        }
      })
    }
  }

  /**
   * Set the selected feature and refresh styles
   */
  const setSelectedFeature = (featureId: string | null) => {
    selectedFeatureId.value = featureId
    refreshStyles()
  }

  /**
   * Set the hovered feature from sidebar and refresh styles
   */
  const setHoveredFeature = (featureId: string | null) => {
    hoveredFeatureId.value = featureId
    refreshStyles()
  }

  /**
   * Load GeoJSON data onto the map
   */
  const loadGeoJSON = (data: GeoJSONFeatureCollection) => {
    featureCollection.value = data

    if (geoJsonLayer.value) {
      geoJsonLayer.value.clearLayers()
      geoJsonLayer.value.addData(data)

      // Fit bounds if there are features
      if (data.features.length > 0 && map.value) {
        const bounds = geoJsonLayer.value.getBounds()
        if (bounds.isValid()) {
          map.value.fitBounds(bounds, { padding: [50, 50] })
        }
      }
    }
  }

  /**
   * Add a feature to the map
   */
  const addFeature = (feature: GeoJSONFeature) => {
    featureCollection.value.features.push(feature)
    if (geoJsonLayer.value) {
      geoJsonLayer.value.addData(feature)
    }
  }

  /**
   * Update a feature on the map
   */
  const updateFeature = (featureId: string, updates: Partial<GeoJSONFeature>) => {
    const index = featureCollection.value.features.findIndex((f) => f.properties.id === featureId)

    if (index !== -1) {
      const existingFeature = featureCollection.value.features[index]
      if (!existingFeature) return

      featureCollection.value.features[index] = {
        ...existingFeature,
        ...updates,
        type: 'Feature',
        properties: {
          ...existingFeature.properties,
          ...updates.properties,
        },
      } as GeoJSONFeature

      // Reload GeoJSON to reflect changes
      loadGeoJSON(featureCollection.value)
    }
  }

  /**
   * Remove a feature from the map
   */
  const removeFeature = (featureId: string) => {
    featureCollection.value.features = featureCollection.value.features.filter(
      (f) => f.properties.id !== featureId,
    )
    loadGeoJSON(featureCollection.value)
  }

  /**
   * Clear all features from the map
   */
  const clearFeatures = () => {
    featureCollection.value.features = []
    if (geoJsonLayer.value) {
      geoJsonLayer.value.clearLayers()
    }
  }

  /**
   * Change base layer
   */
  const changeBaseLayer = (url: string, attribution?: string) => {
    if (!map.value) return

    // Remove existing tile layers
    map.value.eachLayer((layer) => {
      if (layer instanceof L.TileLayer) {
        map.value?.removeLayer(layer)
      }
    })

    // Add new tile layer
    L.tileLayer(url, {
      attribution: attribution || '',
      maxZoom: config.maxZoom || MAX_ZOOM,
    }).addTo(map.value as L.Map)

    // Re-add GeoJSON layer to keep it on top
    if (geoJsonLayer.value) {
      geoJsonLayer.value.bringToFront()
    }
  }

  /**
   * Get map instance
   */
  const getMap = () => map.value

  /**
   * Get layer for a specific feature ID
   */
  const getFeatureLayer = (featureId: string): L.Layer | null => {
    if (!geoJsonLayer.value) return null

    let targetLayer: L.Layer | null = null
    geoJsonLayer.value.eachLayer((layer: any) => {
      if (layer.feature?.properties?.id === featureId) {
        targetLayer = layer
      }
    })
    return targetLayer
  }

  /**
   * Destroy map instance
   */
  const destroyMap = () => {
    if (map.value) {
      map.value.remove()
      map.value = null
    }
  }

  onMounted(() => {
    initMap()
  })

  onUnmounted(() => {
    destroyMap()
  })

  return {
    map,
    featureCollection,
    initMap,
    loadGeoJSON,
    addFeature,
    updateFeature,
    removeFeature,
    clearFeatures,
    changeBaseLayer,
    getMap,
    getFeatureLayer,
    destroyMap,
    setSelectedFeature,
    setHoveredFeature,
    refreshStyles,
  }
}
