// State management for FVB Check application

class AppState {
  constructor() {
    this._state = {
      data: null,
      parameters: {
        float: CONFIG.DEFAULT_PARAMS.float_param,
        bottle: CONFIG.DEFAULT_PARAMS.bottle_param,
        title: CONFIG.DEFAULT_PARAMS.plot_title,
        units: CONFIG.DEFAULT_PARAMS.units
      },
      filters: {
        wmo: null,
        cruise: null,
        maxDistance: CONFIG.LAYOUT.DEFAULT_MAX_DISTANCE
      },
      metadata: {
        wmoList: [],
        cruiseList: []
      },
      ui: {
        selectedParameter: 'Nitrate',
        isMapVisible: true,
        isTableVisible: true,
        isProfileVisible: true,
        isAnomalyVisible: false
      }
    };
    
    this._listeners = [];
  }
  
  /**
   * Get current state
   * @returns {Object} Current state object
   */
  getState() {
    return deepClone(this._state);
  }
  
  /**
   * Subscribe to state changes
   * @param {Function} listener - Function to call when state changes
   * @returns {Function} Unsubscribe function
   */
  subscribe(listener) {
    this._listeners.push(listener);
    
    return () => {
      const index = this._listeners.indexOf(listener);
      if (index > -1) {
        this._listeners.splice(index, 1);
      }
    };
  }
  
  /**
   * Notify all listeners of state change
   */
  _notifyListeners() {
    this._listeners.forEach(listener => {
      try {
        listener(this.getState());
      } catch (error) {
        console.error('Error in state listener:', error);
      }
    });
  }
  
  /**
   * Update state with new values
   * @param {Object} updates - Object with properties to update
   */
  updateState(updates) {
    this._state = { ...this._state, ...updates };
    this._notifyListeners();
  }
  
  /**
   * Update specific nested property
   * @param {string} path - Dot-separated path to property (e.g., 'filters.maxDistance')
   * @param {*} value - New value
   */
  updateNestedProperty(path, value) {
    const keys = path.split('.');
    const newState = deepClone(this._state);
    
    let current = newState;
    for (let i = 0; i < keys.length - 1; i++) {
      if (!(keys[i] in current)) {
        current[keys[i]] = {};
      }
      current = current[keys[i]];
    }
    
    current[keys[keys.length - 1]] = value;
    this._state = newState;
    this._notifyListeners();
  }
  
  /**
   * Set data
   * @param {Object} data - New data object
   */
  setData(data) {
    if (!validateDataStructure(data)) {
      throw new Error('Invalid data structure provided');
    }
    this.updateState({ data });
  }
  
  /**
   * Update parameters
   * @param {string} parameterName - Name of the parameter to update
   */
  updateParameters(parameterName) {
    const mapping = CONFIG.PARAM_MAPPINGS[parameterName];
    if (!mapping) {
      throw new Error(`Unknown parameter: ${parameterName}`);
    }
    
    this.updateState({
      parameters: {
        float: mapping.float,
        bottle: mapping.bottle,
        title: parameterName,
        units: mapping.units
      },
      ui: {
        ...this._state.ui,
        selectedParameter: parameterName
      }
    });
  }
  
  /**
   * Update filters
   * @param {Object} filterUpdates - Filter updates
   */
  updateFilters(filterUpdates) {
    this.updateState({
      filters: { ...this._state.filters, ...filterUpdates }
    });
  }
  
  /**
   * Update metadata
   * @param {Object} metadataUpdates - Metadata updates
   */
  updateMetadata(metadataUpdates) {
    this.updateState({
      metadata: { ...this._state.metadata, ...metadataUpdates }
    });
  }
  
  /**
   * Reset to default state
   */
  reset() {
    this._state = {
      data: this._state.data, // Keep data
      parameters: {
        float: CONFIG.DEFAULT_PARAMS.float_param,
        bottle: CONFIG.DEFAULT_PARAMS.bottle_param,
        title: CONFIG.DEFAULT_PARAMS.plot_title,
        units: CONFIG.DEFAULT_PARAMS.units
      },
      filters: {
        wmo: null,
        cruise: null,
        maxDistance: CONFIG.LAYOUT.DEFAULT_MAX_DISTANCE
      },
      metadata: this._state.metadata, // Keep metadata
      ui: {
        selectedParameter: 'Nitrate',
        isMapVisible: true,
        isTableVisible: true,
        isProfileVisible: true,
        isAnomalyVisible: false
      }
    };
    
    this._notifyListeners();
  }
  
  /**
   * Get current parameters
   * @returns {Object} Current parameters
   */
  getParameters() {
    return { ...this._state.parameters };
  }
  
  /**
   * Get current filters
   * @returns {Object} Current filters
   */
  getFilters() {
    return { ...this._state.filters };
  }
  
  /**
   * Get current data
   * @returns {Object} Current data
   */
  getData() {
    return this._state.data;
  }
  
  /**
   * Check if data is loaded
   * @returns {boolean} True if data is loaded
   */
  hasData() {
    return this._state.data !== null;
  }
}

// Create global state instance
const appState = new AppState();
