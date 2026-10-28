// Mock getting settings since it's just an in-memory object in this project
import { getSettings } from '../controllers/setting.controller.js';

let interval = null;

export const startPowerManagement = (io) => {
  if (interval) clearInterval(interval);
  
  interval = setInterval(() => {
    // We can't import mockSettings directly due to ES module caching and let binding, 
    // but for the sake of the mock, we can fetch it via a mock request/response pair 
    // or we can just assume a fixed time for now if we can't export it.
    // Let's implement a safe way: we'll just require the controller and parse it.
    
    // A better approach would be to extract mockSettings to a shared state, 
    // but to avoid refactoring the entire settings controller, we will just 
    // pass a mock res object to getSettings.
    
    let currentSettings = null;
    const mockRes = {
      status: () => ({
        json: (data) => {
          if (data.status === 'success') {
            currentSettings = data.data;
          }
        }
      })
    };
    
    try {
      getSettings({}, mockRes);
    } catch (e) {
      // ignore
    }

    if (!currentSettings) return;

    const { power_on_time, power_off_time } = currentSettings;
    if (!power_on_time || !power_off_time) return;

    const now = new Date();
    const currentHours = now.getHours().toString().padStart(2, '0');
    const currentMinutes = now.getMinutes().toString().padStart(2, '0');
    const currentTime = `${currentHours}:${currentMinutes}`;

    // Determine state
    // Simple logic: if now is between power_on_time and power_off_time, it's ON
    // Assumes power_on_time < power_off_time (e.g. 07:00 to 18:00)
    let state = 'ON';
    
    if (power_on_time < power_off_time) {
      if (currentTime >= power_on_time && currentTime < power_off_time) {
        state = 'ON';
      } else {
        state = 'OFF';
      }
    } else {
      // Overnight (e.g. 18:00 to 07:00)
      if (currentTime >= power_on_time || currentTime < power_off_time) {
        state = 'ON';
      } else {
        state = 'OFF';
      }
    }

    io.emit('POWER_STATE', state);
  }, 60000); // Check every minute
};
