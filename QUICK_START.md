# Quick Start Guide - GeoJSON Map Editor

## 🚀 Running the Application

The application is currently running at: **http://localhost:5174**

## 📝 First Steps

### 1. Drawing Your First Feature

**Draw a Point:**
1. Click the 📍 (pin) icon in the bottom toolbar
2. Click anywhere on the map to place a point
3. The feature will appear on the map

**Draw a Line:**
1. Click the ➖ (line) icon in the bottom toolbar
2. Click to create each point along the line
3. Double-click or press Enter to finish

**Draw a Polygon:**
1. Click the ⬜ (square) icon in the bottom toolbar
2. Click to create each corner of the polygon
3. Double-click or click the first point again to close the polygon

### 2. Editing Feature Properties

1. Click on any feature on the map
2. The Properties Editor will open on the right side
3. You can edit:
   - **Name**: Give your feature a meaningful name
   - **Description**: Add detailed information
   - **Color**: Choose from presets or use the color picker
   - **Custom Properties**: Add any key-value pairs you need

### 3. Managing Layers

The Layers Panel on the left shows all your features:
- Click the 👁️ icon to show/hide a feature
- Click the feature name to edit its properties
- Click the 🗑️ icon to delete a feature

### 4. Importing Existing GeoJSON

1. Click **Import** in the top-right header
2. Either:
   - Click "Choose File" and select a `.geojson` file
   - Drag and drop a `.geojson` file into the upload area
3. Your features will appear on the map

### 5. Exporting Your Work

**Download as File:**
1. Click **Download** in the header
2. A `.geojson` file will be saved to your downloads folder

**Copy to Clipboard:**
1. Click **Copy** in the header
2. The GeoJSON is now in your clipboard, ready to paste anywhere

## ⌨️ Keyboard Shortcuts

- **Esc** - Cancel current drawing OR close properties editor
- **Delete** - Remove the currently selected feature

## 🎨 Tips & Tricks

### Color Coding
Use the 8 preset colors for quick categorization:
- 🔵 Blue - Default
- 🔴 Red - Important/Danger
- 🟢 Green - Safe/Complete
- 🟡 Amber - Warning
- 🟣 Purple - Special
- 🌸 Pink - Highlight
- 🔷 Cyan - Info
- 🟠 Orange - Alert

### Custom Properties
Add custom properties for integration with other systems:
- `category: "restaurant"`
- `capacity: "100"`
- `status: "active"`

### Organizing Features
- Name features consistently for easy searching
- Use colors to visually group related features
- Add descriptions for context that others might need

## 🌍 Default Map Location

The map is centered on **Tashkent, Uzbekistan** at coordinates `[41.3, 69.2]`.

To change this:
1. Open `src/shared/utils/constants.ts`
2. Modify `DEFAULT_MAP_CENTER`
3. Restart the dev server

## 🐛 Troubleshooting

**Features not appearing?**
- Check the Layers panel - the feature might be hidden (eye icon)
- Try zooming out to see if features are outside the current view

**Can't edit a feature?**
- Click directly on the feature to select it
- Check that the Properties Editor is open

**Import not working?**
- Ensure your file is valid GeoJSON (RFC 7946 compliant)
- Check that geometry types are supported (Point, LineString, Polygon, MultiPolygon)

## 📚 Sample GeoJSON

Here's a minimal example you can import:

```json
{
  "type": "FeatureCollection",
  "features": [
    {
      "type": "Feature",
      "geometry": {
        "type": "Point",
        "coordinates": [69.2, 41.3]
      },
      "properties": {
        "name": "Tashkent Center",
        "description": "Capital of Uzbekistan"
      }
    }
  ]
}
```

Save this as `sample.geojson` and import it to test!

## 🎯 Common Use Cases

**1. Planning Routes**
- Draw LineStrings for roads or paths
- Add properties like distance, duration, difficulty

**2. Defining Areas**
- Draw Polygons for zones, regions, or boundaries
- Color-code by type or status

**3. Marking Locations**
- Place Points for POIs (Points of Interest)
- Add detailed information in descriptions

**4. Data Collection**
- Use custom properties to track specific attributes
- Export for use in GIS software or databases

## 🔧 Development Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Type checking
npm run type-check

# Lint code
npm run lint
```

## 📖 More Information

- Full documentation: See `README.md`
- Implementation details: See `IMPLEMENTATION.md`
- Technical specification: See the original spec document

---

Happy Mapping! 🗺️
