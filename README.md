# GeoJSON Map Editor

A browser-based interactive map application for creating, editing, importing, and exporting GeoJSON data. Built with Vue 3, TypeScript, Leaflet, and Tailwind CSS.

## Features

### Core Functionality
- **Interactive Map**: Built on Leaflet with OpenStreetMap tiles
- **Drawing Tools**: Create Points, LineStrings, and Polygons
- **Feature Management**: Edit properties, colors, names, and descriptions
- **GeoJSON Support**: Full RFC 7946 compliant import/export
- **Layers Panel**: View and manage all features with visibility controls
- **Properties Editor**: Side panel for detailed feature customization
- **Keyboard Shortcuts**: Enhanced UX with Delete and Escape keys

### Supported Geometry Types
- Point
- LineString
- Polygon
- MultiPolygon

### Import/Export
- Import `.geojson` files via upload or drag-and-drop
- Export to GeoJSON file
- Copy GeoJSON to clipboard
- Pretty-printed or minified output

## Technology Stack

### Frontend
- **Vue 3** - Composition API
- **TypeScript** - Type safety
- **Vite** - Build tool
- **Leaflet** - Interactive maps
- **leaflet-draw** - Drawing controls
- **shadcn/ui** - UI components (Vue port)
- **Tailwind CSS** - Styling

### Architecture
Feature-based architecture for scalability:
```
src/
├── app/                    # Application setup
├── shared/                 # Shared resources
│   ├── ui/                # UI components
│   ├── composables/       # Vue composables
│   ├── utils/             # Utility functions
│   └── types/             # TypeScript types
├── features/              # Feature modules
│   ├── map/              # Map rendering
│   ├── geojson-editor/   # Drawing & editing
│   ├── layers/           # Layer management
│   └── export/           # Import/export
└── pages/                # Page components
```

## Getting Started

### Prerequisites
- Node.js 20.19.0+ or 22.12.0+
- npm or yarn

### Installation

1. Clone the repository
2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser to the URL shown in the terminal (usually `http://localhost:5173`)

### Build for Production

```bash
npm run build
```

The built files will be in the `dist/` directory.

## Usage Guide

### Drawing Features

1. **Draw a Point**: Click the pin icon in the toolbar, then click on the map
2. **Draw a Line**: Click the line icon, then click points to create a path
3. **Draw a Polygon**: Click the square icon, then click points to create a shape

### Editing Features

1. Click on any feature to open the Properties Editor
2. Edit the name, description, color, or add custom properties
3. Changes are reflected on the map in real-time

### Managing Layers

- View all features in the Layers panel (left side)
- Click eye icon to show/hide features
- Click feature name to edit its properties
- Click trash icon to delete a feature

### Importing GeoJSON

1. Click "Import" in the header
2. Upload a `.geojson` file or drag & drop it
3. Features will appear on the map

### Exporting Data

- **Download**: Save as a `.geojson` file
- **Copy**: Copy GeoJSON to clipboard

### Keyboard Shortcuts

- `Esc` - Cancel drawing or close properties editor
- `Delete` - Remove selected feature

## Project Structure

### Key Files

#### Composables
- `useMap.ts` - Map initialization and GeoJSON rendering
- `useDraw.ts` - Drawing controls and feature creation
- `useKeyboardShortcuts.ts` - Keyboard event handling

#### Utilities
- `geojson.ts` - GeoJSON validation, parsing, and export functions
- `constants.ts` - Map configuration and default values

#### Features
- `MapView.vue` - Main map component
- `DrawingToolbar.vue` - Drawing control buttons
- `PropertiesEditor.vue` - Feature properties panel
- `LayersList.vue` - Feature list and visibility controls
- `ExportControls.vue` - Import/export UI

## Configuration

### Map Settings
Default map settings can be modified in `src/shared/utils/constants.ts`:

```typescript
export const DEFAULT_MAP_CENTER: [number, number] = [41.3, 69.2] // Tashkent
export const DEFAULT_MAP_ZOOM = 6
export const MIN_ZOOM = 2
export const MAX_ZOOM = 18
```

### Base Layers
Additional map tile layers can be added in the `BASE_LAYERS` array.

## Performance

The application is optimized to handle 1,000+ features smoothly by:
- Avoiding deep watchers on feature collections
- Using Leaflet's native rendering for GeoJSON
- Selective re-rendering of only affected layers

## Security

- Client-side only (no backend required)
- Feature properties are sanitized to prevent XSS
- File processing happens entirely in the browser

## Recommended IDE Setup

[VS Code](https://code.visualstudio.com/) + [Vue (Official)](https://marketplace.visualstudio.com/items?itemName=Vue.volar)

## Type Support for `.vue` Imports in TS

TypeScript cannot handle type information for `.vue` imports by default, so we replace the `tsc` CLI with `vue-tsc` for type checking. In editors, we need [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) to make the TypeScript language service aware of `.vue` types.

## Customize configuration

See [Vite Configuration Reference](https://vite.dev/config/).

## Project Setup

```sh
npm install
```

### Compile and Hot-Reload for Development

```sh
npm run dev
```

### Type-Check, Compile and Minify for Production

```sh
npm run build
```

### Lint with [ESLint](https://eslint.org/)

```sh
npm run lint
```
