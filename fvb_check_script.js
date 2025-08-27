// Main script for FVB Check application - Refactored version

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
  initializeApp();
});

/**
 * Initialize the application
 */
function initializeApp() {
  try {
    setupUI();
    setupEventListeners();
    setupParameterDropdown();
    
    console.log('FVB Check application initialized successfully');
  } catch (error) {
    console.error('Error initializing application:', error);
    showMessage('Failed to initialize application', 'error');
  }
}

/**
 * Setup the main UI structure
 */
function setupUI() {
  const container = document.getElementById('app-container');
  if (!container) {
    throw new Error('App container not found');
  }
  
  container.innerHTML = `
    <div class="app-container">
      <div class="ui">
        <label for="file_input" class="custom-file-label">Upload File</label>
        <input type="file" id="file_input" class="hidden-file-input" accept=".csv,.txt">
        
        <div class="dropdown" id="params">
          <button>Parameters</button>
          <div class="content" id="param_content">
            ${CONFIG.PARAMETERS.map(param => `<a data-param="${param}">${param}</a>`).join('')}
          </div>
        </div>
        
        <form id="dist_form" autocomplete="off" style="width:250px; display:flex; gap: 4px;">
          <div class="autocomplete" style="flex: 2;">
            <input id="dist_input" type="number" placeholder="Dist. (km)" 
                   style="width: 175px; font-size: 14px;" min="0" step="0.1">
          </div>
          <input id="dist_submit" type="submit" value="Filter" 
                 style="flex: 1; width: 100px; font-size: 14px; padding: 12px;">
        </form>
        
        <form id="wmo_form" autocomplete="off" style="width:250px; display:flex; gap: 4px;">
          <div class="autocomplete" style="flex: 2;">
            <input id="wmo_input" type="text" placeholder="WMO" 
                   style="width: 175px; font-size: 14px;">
          </div>
          <input id="wmo_submit" type="submit" value="Filter" 
                 style="flex: 1; width: 100px; font-size: 14px; padding: 12px;">
        </form>
        
        <form id="cruise_form" autocomplete="off" style="width:250px; display:flex; gap: 4px;">
          <div class="autocomplete" style="flex: 2;">
            <input id="cruise_input" type="text" placeholder="Cruise" 
                   style="width: 175px; font-size: 14px;">
          </div>
          <input id="cruise_submit" type="submit" value="Filter" 
                 style="flex: 1; width: 100px; font-size: 14px; padding: 12px;">
        </form>
        
        <div id="reset">
          <button>Reset Selections</button>
        </div>
        
        <div id="open_file"></div>
      </div>
      
      <div id="loading-indicator" style="display: none; position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); z-index: 1000; background: white; padding: 20px; border: 1px solid #ccc; border-radius: 5px;">
        Processing data...
      </div>
      
      <div id="map_content"></div>
      <div id="profile_plot_content"></div>
      <div id="anomaly_plot_content"></div>
      <div id="table_content"></div>
    </div>
  `;
}

/**
 * Setup event listeners for user interactions
 */
function setupEventListeners() {
  // File input handling
  const fileInput = document.getElementById('file_input');
  if (fileInput) {
    fileInput.addEventListener('change', handleFileSelect);
  }
  
  // Reset button
  const resetButton = document.getElementById('reset');
  if (resetButton) {
    resetButton.addEventListener('click', handleReset);
  }
  
  // Distance filter
  const distForm = document.getElementById('dist_form');
  if (distForm) {
    distForm.addEventListener('submit', handleDistanceFilter);
  }
  
  // WMO filter
  const wmoForm = document.getElementById('wmo_form');
  if (wmoForm) {
    wmoForm.addEventListener('submit', handleWmoFilter);
  }
  
  // Cruise filter
  const cruiseForm = document.getElementById('cruise_form');
  if (cruiseForm) {
    cruiseForm.addEventListener('submit', handleCruiseFilter);
  }
  
  // Add debounced input handling for better UX
  const distInput = document.getElementById('dist_input');
  if (distInput) {
    const debouncedDistanceInput = debounce(handleDistanceInput, 500);
    distInput.addEventListener('input', debouncedDistanceInput);
  }
}

/**
 * Setup parameter dropdown functionality
 */
function setupParameterDropdown() {
  const paramContent = document.getElementById('param_content');
  if (!paramContent) return;
  
  // Add click handlers for parameter selection
  paramContent.addEventListener('click', function(event) {
    if (event.target.tagName === 'A') {
      const selectedParam = event.target.getAttribute('data-param');
      if (selectedParam) {
        handleParameterSelection(selectedParam);
      }
    }
  });
  
  // Show/hide dropdown on button click
  const paramButton = document.getElementById('params').querySelector('button');
  if (paramButton) {
    paramButton.addEventListener('click', function() {
      paramContent.style.display = paramContent.style.display === 'block' ? 'none' : 'block';
    });
  }
  
  // Hide dropdown when clicking outside
  document.addEventListener('click', function(event) {
    if (!event.target.closest('#params')) {
      paramContent.style.display = 'none';
    }
  });
}

/**
 * Handle file selection and processing
 */
async function handleFileSelect(event) {
  const file = event.target.files[0];
  if (!file) return;
  
  showLoading();
  
  try {
    const data = await processFileData(file);
    appState.setData(data);
    
    // Extract metadata from the data
    const metadata = extractMetadata(data);
    appState.updateMetadata(metadata);
    
    // Update all visualizations
    visualizationManager.updateAllVisualizations();
    
    showMessage(`File "${file.name}" loaded successfully with ${data.data.length} data points`, 'info');
    
  } catch (error) {
    console.error('Error processing file:', error);
    showMessage(`Error processing file: ${error.message}`, 'error');
  } finally {
    hideLoading();
  }
}

/**
 * Process uploaded file data
 */
async function processFileData(file) {
  return new Promise((resolve, reject) => {
    if (!file) {
      reject(new Error('No file provided'));
      return;
    }
    
    const reader = new FileReader();
    
    reader.onload = function(event) {
      try {
        const csvData = event.target.result;
        const parsedData = Papa.parse(csvData, {
          header: true,
          skipEmptyLines: true,
          dynamicTyping: true
        });
        
        if (parsedData.errors && parsedData.errors.length > 0) {
          console.warn('CSV parsing warnings:', parsedData.errors);
        }
        
        resolve(parsedData);
      } catch (error) {
        reject(new Error(`Failed to parse CSV: ${error.message}`));
      }
    };
    
    reader.onerror = function() {
      reject(new Error('Failed to read file'));
    };
    
    reader.readAsText(file);
  });
}

/**
 * Extract metadata from loaded data
 */
function extractMetadata(data) {
  if (!validateDataStructure(data)) {
    return { wmoList: [], cruiseList: [] };
  }
  
  const wmoSet = new Set();
  const cruiseSet = new Set();
  
  data.data.forEach(row => {
    if (row.WMO) wmoSet.add(row.WMO);
    if (row.CRUISE) cruiseSet.add(row.CRUISE);
  });
  
  return {
    wmoList: Array.from(wmoSet).sort(),
    cruiseList: Array.from(cruiseSet).sort()
  };
}

/**
 * Handle parameter selection
 */
function handleParameterSelection(parameterName) {
  try {
    appState.updateParameters(parameterName);
    visualizationManager.updateAllVisualizations();
    
    // Update dropdown button text
    const paramButton = document.getElementById('params').querySelector('button');
    if (paramButton) {
      paramButton.textContent = parameterName;
    }
    
    // Hide dropdown
    const paramContent = document.getElementById('param_content');
    if (paramContent) {
      paramContent.style.display = 'none';
    }
    
  } catch (error) {
    console.error('Error updating parameter:', error);
    showMessage(`Error updating parameter: ${error.message}`, 'error');
  }
}

/**
 * Handle distance filter
 */
function handleDistanceFilter(event) {
  event.preventDefault();
  
  const distInput = document.getElementById('dist_input');
  const distance = Number(distInput.value);
  
  if (distance === 0 || isNaN(distance)) {
    appState.updateFilters({ maxDistance: CONFIG.LAYOUT.DEFAULT_MAX_DISTANCE });
  } else {
    appState.updateFilters({ maxDistance: distance });
  }
  
  visualizationManager.updateAllVisualizations();
}

/**
 * Handle distance input (debounced)
 */
function handleDistanceInput(event) {
  const distance = Number(event.target.value);
  
  if (distance > 0 && !isNaN(distance)) {
    appState.updateFilters({ maxDistance: distance });
    visualizationManager.updateAllVisualizations();
  }
}

/**
 * Handle WMO filter
 */
function handleWmoFilter(event) {
  event.preventDefault();
  
  const wmoInput = document.getElementById('wmo_input');
  const wmoValue = wmoInput.value.trim();
  
  if (wmoValue) {
    appState.updateFilters({ wmo: [wmoValue] });
  } else {
    appState.updateFilters({ wmo: null });
  }
  
  visualizationManager.updateAllVisualizations();
}

/**
 * Handle cruise filter
 */
function handleCruiseFilter(event) {
  event.preventDefault();
  
  const cruiseInput = document.getElementById('cruise_input');
  const cruiseValue = cruiseInput.value.trim();
  
  if (cruiseValue) {
    appState.updateFilters({ cruise: [cruiseValue] });
  } else {
    appState.updateFilters({ cruise: null });
  }
  
  visualizationManager.updateAllVisualizations();
}

/**
 * Handle reset button click
 */
function handleReset() {
  try {
    appState.reset();
    visualizationManager.resetLayout();
    visualizationManager.updateAllVisualizations();
    
    // Clear form inputs
    const inputs = ['dist_input', 'wmo_input', 'cruise_input'];
    inputs.forEach(id => {
      const input = document.getElementById(id);
      if (input) input.value = '';
    });
    
    // Reset parameter button text
    const paramButton = document.getElementById('params').querySelector('button');
    if (paramButton) {
      paramButton.textContent = 'Parameters';
    }
    
    showMessage('All selections have been reset', 'info');
    
  } catch (error) {
    console.error('Error resetting application:', error);
    showMessage(`Error resetting application: ${error.message}`, 'error');
  }
}

/**
 * Handle WMO click from map (called by external functions)
 */
function handleWmoClick(clickedWmo) {
  try {
    appState.updateFilters({ wmo: [clickedWmo] });
    visualizationManager.handleWmoSelection(clickedWmo);
  } catch (error) {
    console.error('Error handling WMO click:', error);
    showMessage(`Error handling WMO selection: ${error.message}`, 'error');
  }
}

// Export functions that may be called from other modules
window.handleWmoClick = handleWmoClick;