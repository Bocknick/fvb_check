# FVB Check - Oceanographic Data Analysis Tool

A web-based tool for comparing float and bottle data from oceanographic research cruises, with enhanced code structure and maintainability.

## Overview

FVB Check (Float vs. Bottle Check) is designed for quality control and validation of oceanographic float data by comparing it against traditional bottle sampling data. The tool provides interactive visualizations including maps, profile plots, anomaly analysis, and statistical tables.

## Recent Refactoring Improvements

### 🏗️ **Modular Architecture**
- **`config.js`** - Centralized configuration and constants
- **`utils.js`** - Utility functions for common operations
- **`state.js`** - Centralized state management with reactive updates
- **`visualization.js`** - Visualization manager for all plotting logic
- **`fvb_helper_functions.js`** - Core data processing functions (existing)
- **`fvb_check_script.js`** - Main application logic (refactored)

### 🚀 **Performance & UX Improvements**
- **Debounced Input Handling** - Prevents excessive API calls during typing
- **Loading States** - Visual feedback during data processing
- **Error Handling** - Comprehensive error handling with user-friendly messages
- **Input Validation** - Data structure validation and sanitization

### 🧹 **Code Quality Improvements**
- **Eliminated Code Duplication** - Consolidated repeated logic into reusable functions
- **Consistent Naming** - Standardized variable and function naming conventions
- **JSDoc Documentation** - Comprehensive function documentation
- **State Management** - Centralized state with reactive updates

### 🎨 **UI/UX Enhancements**
- **Enhanced Form Styling** - Better input focus states and hover effects
- **Message System** - Toast-style notifications for user feedback
- **Loading Indicators** - Visual feedback during operations
- **Responsive Design** - Improved layout and interaction patterns

## Features

### Oceanographic Parameters
- **Chemical**: Nitrate, pH, Oxygen, DIC, pCO2, Alkalinity
- **Physical**: Temperature, Salinity, Chlorophyll
- **Spatial/Temporal**: Distance measurements

### Visualization Components
- **Interactive Map** - Geographic data display with Leaflet.js
- **Profile Plots** - Depth-based float vs. bottle comparisons
- **Anomaly Analysis** - Statistical difference analysis
- **Data Tables** - Tabular data with Z-score calculations

### Data Processing
- **CSV Import** - Support for standard oceanographic data formats
- **Filtering** - By WMO, cruise, distance, and parameter
- **Statistical Analysis** - Z-scores, differences, and summaries
- **Data Validation** - Structure and content validation

## Technical Stack

- **Frontend**: Vanilla JavaScript (ES6+)
- **Mapping**: Leaflet.js with custom graticule extension
- **Charts**: Plotly.js for interactive plotting
- **Data Processing**: PapaParse (CSV), Chroma.js (colors), Simple Statistics
- **Architecture**: Modular ES6 modules with state management

## Getting Started

### Prerequisites
- Modern web browser with ES6+ support
- No build tools required - runs directly in browser

### Installation
1. Clone the repository
2. Open `index.html` in a web browser
3. Upload your oceanographic data file (CSV format)

### Data Format
Your CSV should include columns for:
- `WMO` - World Meteorological Organization identifier
- `CRUISE` - Cruise identifier
- `CTDPRS` - Depth (pressure)
- Parameter columns matching the available options

## Code Structure

### Configuration (`config.js`)
```javascript
const CONFIG = {
  DEFAULT_PARAMS: { /* default parameter settings */ },
  LAYOUT: { /* layout constants */ },
  PARAMETERS: [ /* available parameters */ ],
  PARAM_MAPPINGS: { /* parameter name mappings */ }
};
```

### State Management (`state.js`)
```javascript
const appState = new AppState();
appState.updateParameters('Nitrate');
appState.updateFilters({ maxDistance: 1000 });
```

### Visualization Manager (`visualization.js`)
```javascript
const visualizationManager = new VisualizationManager();
visualizationManager.updateAllVisualizations();
visualizationManager.handleWmoSelection(wmoId);
```

## Contributing

### Code Style
- Use ES6+ features (const/let, arrow functions, template literals)
- Follow JSDoc documentation standards
- Maintain consistent naming conventions (camelCase)
- Add error handling for all external operations

### Adding New Features
1. **Parameters**: Add to `CONFIG.PARAM_MAPPINGS`
2. **Visualizations**: Extend `VisualizationManager` class
3. **Data Processing**: Add functions to `fvb_helper_functions.js`
4. **UI Components**: Update `setupUI()` in main script

## Browser Compatibility

- **Chrome**: 60+
- **Firefox**: 55+
- **Safari**: 12+
- **Edge**: 79+

## License

This project is designed for oceanographic research and educational purposes.

## Support

For issues or questions related to the refactored code:
1. Check the browser console for error messages
2. Verify data format matches expected structure
3. Ensure all required dependencies are loaded

---

*Refactored for improved maintainability, performance, and user experience while preserving all original functionality.*
