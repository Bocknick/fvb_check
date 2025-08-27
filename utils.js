// Utility functions for FVB Check application

/**
 * Debounce function to limit how often a function can be called
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in milliseconds
 * @returns {Function} Debounced function
 */
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * Validate if data object has required structure
 * @param {Object} data - Data object to validate
 * @returns {boolean} True if valid, false otherwise
 */
function validateDataStructure(data) {
  return data && 
         data.data && 
         Array.isArray(data.data) && 
         data.data.length > 0;
}

/**
 * Safely extract data from rows with error handling
 * @param {Array} rows - Array of data rows
 * @param {string} column - Column name to extract
 * @param {*} defaultValue - Default value if column doesn't exist
 * @returns {Array} Array of extracted values
 */
function safeExtractColumn(rows, column, defaultValue = null) {
  if (!Array.isArray(rows)) return [];
  
  return rows.map(row => {
    if (row && row.hasOwnProperty(column)) {
      return row[column];
    }
    return defaultValue;
  });
}

/**
 * Filter array values based on boolean mask
 * @param {Array} values - Array of values to filter
 * @param {Array} mask - Boolean array for filtering
 * @returns {Array} Filtered array
 */
function filterValuesByMask(values, mask) {
  if (!Array.isArray(values) || !Array.isArray(mask)) return [];
  
  return values.filter((_, index) => mask[index]);
}

/**
 * Clean subtraction with null/undefined handling
 * @param {number} a - First number
 * @param {number} b - Second number
 * @returns {number|null} Result of subtraction or null if invalid
 */
function cleanSubtract(a, b) {
  if (typeof a === 'number' && typeof b === 'number' && 
      !isNaN(a) && !isNaN(b) && isFinite(a) && isFinite(b)) {
    return a - b;
  }
  return null;
}

/**
 * Show loading state
 */
function showLoading() {
  const loadingElement = document.getElementById('loading-indicator');
  if (loadingElement) {
    loadingElement.style.display = 'block';
  }
  document.body.classList.add('loading');
}

/**
 * Hide loading state
 */
function hideLoading() {
  const loadingElement = document.getElementById('loading-indicator');
  if (loadingElement) {
    loadingElement.style.display = 'none';
  }
  document.body.classList.remove('loading');
}

/**
 * Show error message to user
 * @param {string} message - Error message to display
 * @param {string} type - Type of error (error, warning, info)
 */
function showMessage(message, type = 'error') {
  // Remove existing messages
  const existingMessage = document.querySelector('.message');
  if (existingMessage) {
    existingMessage.remove();
  }
  
  const messageDiv = document.createElement('div');
  messageDiv.className = `message message-${type}`;
  messageDiv.textContent = message;
  
  // Style the message
  messageDiv.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    padding: 12px 20px;
    border-radius: 4px;
    color: white;
    font-weight: bold;
    z-index: 1000;
    max-width: 300px;
    word-wrap: break-word;
  `;
  
  // Set background color based on type
  switch (type) {
    case 'error':
      messageDiv.style.backgroundColor = '#dc3545';
      break;
    case 'warning':
      messageDiv.style.backgroundColor = '#ffc107';
      messageDiv.style.color = '#212529';
      break;
    case 'info':
      messageDiv.style.backgroundColor = '#17a2b8';
      break;
    default:
      messageDiv.style.backgroundColor = '#6c757d';
  }
  
  document.body.appendChild(messageDiv);
  
  // Auto-remove after 5 seconds
  setTimeout(() => {
    if (messageDiv.parentNode) {
      messageDiv.remove();
    }
  }, 5000);
}

/**
 * Format number with appropriate precision
 * @param {number} value - Number to format
 * @param {number} precision - Decimal places
 * @returns {string} Formatted number string
 */
function formatNumber(value, precision = 2) {
  if (typeof value !== 'number' || isNaN(value)) return 'N/A';
  return value.toFixed(precision);
}

/**
 * Deep clone object (simple implementation)
 * @param {Object} obj - Object to clone
 * @returns {Object} Cloned object
 */
function deepClone(obj) {
  if (obj === null || typeof obj !== 'object') return obj;
  if (obj instanceof Date) return new Date(obj.getTime());
  if (obj instanceof Array) return obj.map(item => deepClone(item));
  if (typeof obj === 'object') {
    const cloned = {};
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        cloned[key] = deepClone(obj[key]);
      }
    }
    return cloned;
  }
}
