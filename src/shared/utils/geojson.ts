import { v4 as uuidv4 } from 'uuid'
import type { GeoJSONFeature, GeoJSONFeatureCollection, FeatureProperties } from '@/shared/types'

/**
 * Validate GeoJSON feature collection
 */
export function validateGeoJSON(data: any): { valid: boolean; error?: string } {
  if (!data || typeof data !== 'object') {
    return { valid: false, error: 'Invalid JSON data' }
  }

  if (data.type !== 'FeatureCollection') {
    return { valid: false, error: 'Must be a FeatureCollection' }
  }

  if (!Array.isArray(data.features)) {
    return { valid: false, error: 'Features must be an array' }
  }

  for (const feature of data.features) {
    if (feature.type !== 'Feature') {
      return { valid: false, error: 'Each item must be a Feature' }
    }

    if (!feature.geometry || !feature.geometry.type) {
      return { valid: false, error: 'Each feature must have valid geometry' }
    }

    const validTypes = ['Point', 'LineString', 'Polygon', 'MultiPolygon']
    if (!validTypes.includes(feature.geometry.type)) {
      return {
        valid: false,
        error: `Unsupported geometry type: ${feature.geometry.type}`,
      }
    }
  }

  return { valid: true }
}

/**
 * Create a new empty FeatureCollection
 */
export function createEmptyFeatureCollection(): GeoJSONFeatureCollection {
  return {
    type: 'FeatureCollection',
    features: [],
  }
}

/**
 * Create default properties for a new feature
 */
export function createDefaultProperties(name: string = 'Untitled Feature'): FeatureProperties {
  return {
    id: uuidv4(),
    name,
    description: '',
    color: '#3b82f6',
  }
}

/**
 * Sanitize feature properties to prevent XSS
 */
export function sanitizeProperties(properties: any): FeatureProperties {
  const sanitized: any = {}

  for (const [key, value] of Object.entries(properties)) {
    if (typeof value === 'string') {
      // Basic XSS prevention: escape HTML entities
      sanitized[key] = value
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#x27;')
    } else {
      sanitized[key] = value
    }
  }

  return sanitized
}

/**
 * Export GeoJSON as formatted string
 */
export function exportGeoJSON(
  featureCollection: GeoJSONFeatureCollection,
  pretty: boolean = true,
): string {
  return JSON.stringify(featureCollection, null, pretty ? 2 : 0)
}

/**
 * Download GeoJSON file
 */
export function downloadGeoJSON(
  featureCollection: GeoJSONFeatureCollection,
  filename: string = 'export.geojson',
) {
  const content = exportGeoJSON(featureCollection)
  const blob = new Blob([content], { type: 'application/geo+json' })
  const url = URL.createObjectURL(blob)

  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()

  URL.revokeObjectURL(url)
}

/**
 * Copy GeoJSON to clipboard
 */
export async function copyToClipboard(
  featureCollection: GeoJSONFeatureCollection,
  pretty: boolean = true,
): Promise<void> {
  const content = exportGeoJSON(featureCollection, pretty)
  await navigator.clipboard.writeText(content)
}

/**
 * Parse uploaded GeoJSON file
 */
export async function parseGeoJSONFile(file: File): Promise<GeoJSONFeatureCollection> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string)
        const validation = validateGeoJSON(data)

        if (!validation.valid) {
          reject(new Error(validation.error))
          return
        }

        // Ensure all features have required properties
        const features = data.features.map((feature: any) => ({
          ...feature,
          properties: {
            ...createDefaultProperties(feature.properties?.name || 'Imported Feature'),
            ...feature.properties,
          },
        }))

        resolve({
          type: 'FeatureCollection',
          features,
        })
      } catch (error) {
        reject(new Error('Failed to parse GeoJSON file'))
      }
    }

    reader.onerror = () => reject(new Error('Failed to read file'))
    reader.readAsText(file)
  })
}
