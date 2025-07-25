/**
 * Dashboard Events Utility
 * 
 * This utility provides functions to notify the dashboard about data changes
 * that should trigger a refresh of the dashboard data.
 */

/**
 * Notify the dashboard that data has been updated
 * This will trigger a refresh of the dashboard data
 * 
 * @param {string} source - The source of the update (e.g., 'todo', 'poetry', 'order')
 * @param {object} [data] - Optional data about the update
 */
export const notifyDashboardUpdate = (source, data = {}) => {
  console.log(`Dashboard update requested by ${source}`, data);
  
  // Dispatch a custom event that the Dashboard component is listening for
  const event = new CustomEvent('dashboard:refresh', {
    detail: {
      timestamp: new Date().toISOString(),
      source,
      ...data
    }
  });
  
  window.dispatchEvent(event);
};

/**
 * Subscribe to dashboard refresh events
 * @param {Function} callback - Function to call when dashboard refreshes
 * @returns {Function} Unsubscribe function
 */
export const onDashboardRefresh = (callback) => {
  const handler = (event) => callback(event.detail);
  window.addEventListener('dashboard:refresh', handler);
  return () => window.removeEventListener('dashboard:refresh', handler);
};
