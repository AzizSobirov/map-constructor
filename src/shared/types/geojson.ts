import type { LatLngExpression } from 'leaflet'

export interface FeatureProperties {
  id: string
  name: string
  description?: string
  color: string
  [key: string]: any
}

export interface GeoJSONFeature {
  type: 'Feature'
  id?: string | number
  geometry: {
    type: 'Point' | 'LineString' | 'Polygon' | 'MultiPolygon'
    coordinates: any
  }
  properties: FeatureProperties
}

export interface GeoJSONFeatureCollection {
  type: 'FeatureCollection'
  features: GeoJSONFeature[]
}

export interface MapConfig {
  center: LatLngExpression
  zoom: number
  minZoom?: number
  maxZoom?: number
}

export interface BaseLayer {
  id: string
  name: string
  url: string
  attribution?: string
}

export type DrawMode = 'point' | 'line' | 'polygon' | null
