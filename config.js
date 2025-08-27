// Configuration file for FVB Check application
const CONFIG = {
  // Default parameters
  DEFAULT_PARAMS: {
    float_param: "Float Nitrate",
    bottle_param: "NITRAT",
    plot_title: "Nitrate",
    units: "\u03BCmol/kg"
  },
  
  // Layout constants
  LAYOUT: {
    TABLE_COLUMN_SPAN: "3/5",
    DEFAULT_MAX_DISTANCE: 5000,
    PLOT_DIMENSIONS: { 
      width: 290, 
      height: 390 
    },
    TABLE_DIMENSIONS: {
      width: 800,
      height: 390
    }
  },
  
  // Available parameters for analysis
  PARAMETERS: [
    "Nitrate", "pH", "Oxygen", "DIC", "pCO2", 
    "Alkalinity", "Chlorophyll", "Temperature", 
    "Salinity", "Distance (space)", "Distance (time)"
  ],
  
  // Parameter mappings (Float to Bottle parameter names)
  PARAM_MAPPINGS: {
    "Nitrate": { float: "Float Nitrate", bottle: "NITRAT", units: "\u03BCmol/kg" },
    "pH": { float: "Float pH", bottle: "PH", units: "" },
    "Oxygen": { float: "Float Oxygen", bottle: "OXYGEN", units: "\u03BCmol/kg" },
    "DIC": { float: "Float DIC", bottle: "DIC", units: "\u03BCmol/kg" },
    "pCO2": { float: "Float pCO2", bottle: "PCO2", units: "\u03BCmol/kg" },
    "Alkalinity": { float: "Float Alkalinity", bottle: "ALKALI", units: "\u03BCmol/kg" },
    "Chlorophyll": { float: "Float Chlorophyll", bottle: "CHLA", units: "mg/m³" },
    "Temperature": { float: "Float Temperature", bottle: "CTDTMP", units: "°C" },
    "Salinity": { float: "Float Salinity", bottle: "CTDSAL", units: "PSU" },
    "Distance (space)": { float: "Distance (space)", bottle: "", units: "km" },
    "Distance (time)": { float: "Distance (time)", bottle: "", units: "days" }
  },
  
  // Plot styling
  PLOT_STYLES: {
    font_family: "Menlo,Consolas,monaco,monospace",
    font_size: 14,
    colors: {
      bottle: '#0397A8',
      float: '#F89D28',
      background: 'white'
    }
  },
  
  // UI styling
  UI_STYLES: {
    button_background: '#E1BC29',
    border_color: 'black',
    shadow: '0 4px 10px rgba(0, 0, 0, 0.1)'
  }
};

// Freeze the config to prevent accidental modifications
Object.freeze(CONFIG);
