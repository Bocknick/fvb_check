// Visualization manager for FVB Check application

class VisualizationManager {
  constructor() {
    this.currentPlots = {
      map: null,
      summary: null,
      profile: null,
      anomaly: null,
      table: null
    };
  }
  
  /**
   * Update all visualizations based on current state
   */
  updateAllVisualizations() {
    if (!appState.hasData()) {
      console.warn('No data available for visualization');
      return;
    }
    
    const state = appState.getState();
    const data = state.data;
    const params = state.parameters;
    const filters = state.filters;
    
    try {
      // Update map
      this.updateMap(data, params, filters);
      
      // Update summary plot
      this.updateSummaryPlot(data, params, filters);
      
      // Update table
      this.updateTable(data, params, filters);
      
      // Update profile plot if WMO is selected
      if (filters.wmo && filters.wmo.length > 0) {
        this.updateProfilePlot(data, params, filters);
        this.updateAnomalyPlot(data, params, filters);
      }
      
    } catch (error) {
      console.error('Error updating visualizations:', error);
      showMessage(`Error updating visualizations: ${error.message}`, 'error');
    }
  }
  
  /**
   * Update map visualization
   */
  updateMap(data, params, filters) {
    try {
      const mapPlot = make_map(data, params.float, params.bottle, params.title, 
                              filters.maxDistance, filters.wmo, filters.cruise);
      
      if (mapPlot && document.getElementById('map_content')) {
        Plotly.newPlot('map_content', mapPlot.traces, mapPlot.layout, { 
          displayModeBar: false 
        });
        this.currentPlots.map = mapPlot;
      }
    } catch (error) {
      console.error('Error updating map:', error);
    }
  }
  
  /**
   * Update summary plot
   */
  updateSummaryPlot(data, params, filters) {
    try {
      const summaryPlot = make_summary_plot(data, params.float, params.bottle, 
                                          params.title, filters.maxDistance, 
                                          filters.wmo, filters.cruise);
      
      if (summaryPlot && document.getElementById('profile_plot_content')) {
        Plotly.newPlot('profile_plot_content', summaryPlot.hist_trace, 
                      summaryPlot.layout, { displayModeBar: false });
        this.currentPlots.summary = summaryPlot;
      }
    } catch (error) {
      console.error('Error updating summary plot:', error);
    }
  }
  
  /**
   * Update profile plot
   */
  updateProfilePlot(data, params, filters) {
    try {
      const profilePlot = make_profile_plot(data, params.float, params.bottle, 
                                          params.title, filters.wmo, 
                                          params.units, filters.cruise);
      
      if (profilePlot && document.getElementById('profile_plot_content')) {
        Plotly.newPlot('profile_plot_content', profilePlot.traces, 
                      profilePlot.layout, { displayModeBar: false });
        this.currentPlots.profile = profilePlot;
      }
    } catch (error) {
      console.error('Error updating profile plot:', error);
    }
  }
  
  /**
   * Update anomaly plot
   */
  updateAnomalyPlot(data, params, filters) {
    try {
      const anomalyPlot = make_anomaly_plot(data, params.float, params.bottle, 
                                           params.title, filters.wmo, params.units);
      
      if (anomalyPlot && document.getElementById('anomaly_plot_content')) {
        Plotly.newPlot('anomaly_plot_content', [anomalyPlot.diff_trace], 
                      anomalyPlot.layout, { displayModeBar: false });
        this.currentPlots.anomaly = anomalyPlot;
      }
    } catch (error) {
      console.error('Error updating anomaly plot:', error);
    }
  }
  
  /**
   * Update table
   */
  updateTable(data, params, filters) {
    try {
      const tablePlot = make_table(data, params.float, params.bottle, 
                                 filters.wmo, filters.cruise, filters.maxDistance);
      
      if (tablePlot && document.getElementById('table_content')) {
        Plotly.newPlot('table_content', tablePlot.data, tablePlot.layout, 
                      { displayModeBar: false });
        this.currentPlots.table = tablePlot;
      }
    } catch (error) {
      console.error('Error updating table:', error);
    }
  }
  
  /**
   * Handle WMO selection and update related visualizations
   */
  handleWmoSelection(clickedWmo) {
    if (!appState.hasData()) return;
    
    const state = appState.getState();
    const data = state.data;
    const params = state.parameters;
    const filters = state.filters;
    
    // Update UI layout for WMO selection
    this.updateLayoutForWmoSelection();
    
    try {
      // Update profile plot
      const profilePlot = make_profile_plot(data, params.float, params.bottle, 
                                          params.title, [clickedWmo], 
                                          params.units, filters.cruise);
      
      // Update anomaly plot
      const anomalyPlot = make_anomaly_plot(data, params.float, params.bottle, 
                                           params.title, [clickedWmo], params.units);
      
      // Update table with WMO filter
      const tablePlot = make_table(data, params.float, params.bottle, 
                                 [clickedWmo], filters.cruise, 
                                 filters.maxDistance, true);
      
      // Render all plots
      if (profilePlot && document.getElementById('profile_plot_content')) {
        Plotly.newPlot('profile_plot_content', profilePlot.traces, 
                      profilePlot.layout, { displayModeBar: false });
      }
      
      if (anomalyPlot && document.getElementById('anomaly_plot_content')) {
        Plotly.newPlot('anomaly_plot_content', [anomalyPlot.diff_trace], 
                      anomalyPlot.layout, { displayModeBar: false });
      }
      
      if (tablePlot && document.getElementById('table_content')) {
        Plotly.newPlot('table_content', tablePlot.data, tablePlot.layout, 
                      { displayModeBar: false });
      }
      
    } catch (error) {
      console.error('Error handling WMO selection:', error);
      showMessage(`Error updating WMO selection: ${error.message}`, 'error');
    }
  }
  
  /**
   * Update layout when WMO is selected
   */
  updateLayoutForWmoSelection() {
    const anomalyContent = document.getElementById('anomaly_plot_content');
    const tableContent = document.getElementById('table_content');
    
    if (anomalyContent) {
      anomalyContent.style.gridColumn = '3/4';
      anomalyContent.style.border = '1px solid black';
      anomalyContent.style.boxShadow = '0 4px 10px rgba(0, 0, 0, 0.1)';
    }
    
    if (tableContent) {
      tableContent.style.gridColumn = '4/5';
    }
  }
  
  /**
   * Reset layout to default state
   */
  resetLayout() {
    const tableContent = document.getElementById('table_content');
    const mapContent = document.getElementById('map_content');
    
    if (tableContent) {
      tableContent.style.gridColumn = '3/5';
    }
    
    if (mapContent) {
      mapContent.style.border = '1px solid black';
      mapContent.style.boxShadow = '0 4px 10px rgba(0, 0, 0, 0.1)';
    }
  }
  
  /**
   * Clear all visualizations
   */
  clearAll() {
    const plotContainers = [
      'map_content',
      'profile_plot_content', 
      'anomaly_plot_content',
      'table_content'
    ];
    
    plotContainers.forEach(containerId => {
      const container = document.getElementById(containerId);
      if (container) {
        container.innerHTML = '';
      }
    });
    
    this.currentPlots = {
      map: null,
      summary: null,
      profile: null,
      anomaly: null,
      table: null
    };
  }
  
  /**
   * Get current plot objects
   */
  getCurrentPlots() {
    return { ...this.currentPlots };
  }
}

// Create global visualization manager instance
const visualizationManager = new VisualizationManager();
