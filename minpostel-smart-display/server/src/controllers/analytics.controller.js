import { sendSuccess } from '../utils/response.util.js';

let scanCounts = {
  today: 0,
  total: 42 // Mock some existing scans
};

export const recordScan = (req, res) => {
  scanCounts.today += 1;
  scanCounts.total += 1;
  
  // Just redirect to the intended location after recording
  const redirectTo = req.query.redirect || '/';
  return res.redirect(redirectTo);
};

export const getAnalytics = (req, res) => {
  const data = {
    scans: {
      today: scanCounts.today,
      total: scanCounts.total,
      history: [12, 19, 15, 25, 22, 30, scanCounts.today] // Mock 7-day history
    },
    uptime: {
      percentage: 99.8,
      downtime_minutes_today: 0
    }
  };
  return sendSuccess(res, 'Analytics retrieved', data);
};
