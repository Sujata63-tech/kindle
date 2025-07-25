import React, { useState, useEffect } from 'react';
import { notifyDashboardUpdate } from '../../utils/dashboardEvents';

const DashboardDebug = () => {
  const [eventLog, setEventLog] = useState([]);

  // Listen for dashboard events
  useEffect(() => {
    const handleEvent = (event) => {
      console.log('Dashboard event captured:', event.detail);
      setEventLog(prev => [
        ...prev.slice(-9), // Keep only last 10 events
        {
          time: new Date().toLocaleTimeString(),
          source: event.detail.source,
          data: event.detail
        }
      ]);
    };

    window.addEventListener('dashboard:refresh', handleEvent);
    return () => window.removeEventListener('dashboard:refresh', handleEvent);
  }, []);

  // Test function to trigger an update
  const triggerTestUpdate = () => {
    console.log('Triggering test update...');
    notifyDashboardUpdate('debug', { message: 'Manual test update' });
  };

  return (
    <div className="fixed bottom-4 right-4 bg-white p-4 rounded-lg shadow-lg z-50 max-w-xs">
      <h3 className="font-bold mb-2">Dashboard Debug</h3>
      <button 
        onClick={triggerTestUpdate}
        className="bg-blue-500 text-white px-3 py-1 rounded text-sm mb-3"
      >
        Test Update
      </button>
      
      <div className="text-xs space-y-1 max-h-40 overflow-y-auto">
        <div className="font-semibold text-gray-600">Event Log:</div>
        {eventLog.length === 0 ? (
          <div className="text-gray-400 italic">No events captured yet</div>
        ) : (
          eventLog.map((event, index) => (
            <div key={index} className="border-b border-gray-100 py-1">
              <div className="flex justify-between">
                <span className="font-medium">{event.source}</span>
                <span className="text-gray-500 text-xs">{event.time}</span>
              </div>
              <div className="text-gray-600 truncate">
                {JSON.stringify(event.data)}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default DashboardDebug;
