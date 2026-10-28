/**
 * Utility function to check whether a meeting, event, announcement, or communication 
 * has reached its scheduled end time or expiration date.
 * 
 * @param {Object} item - The content object (meeting, event, announcement, communication)
 * @param {Date} [now=new Date()] - The current reference time
 * @returns {boolean} true if the item's end time has passed or status is finished/cancelled; false otherwise.
 */
export function isItemExpired(item, now = new Date()) {
  if (!item) return true;

  // 1. Check explicit status values that mark an item as finished or cancelled
  const statusUpper = (item.status || '').toUpperCase();
  if (['FINISHED', 'CANCELLED', 'EXPIRED', 'COMPLETED', 'ENDED'].includes(statusUpper)) {
    return true;
  }

  try {
    const currentMs = now.getTime();

    // 2. Case A: end_time is a full ISO date-time string (e.g., "2026-10-07T16:00:00.000Z")
    if (item.end_time && typeof item.end_time === 'string' && item.end_time.includes('T')) {
      const endTimeDate = new Date(item.end_time);
      if (!isNaN(endTimeDate.getTime())) {
        return endTimeDate.getTime() <= currentMs;
      }
    }

    // Determine raw date string (e.g. "2026-10-07" or ISO string)
    const rawDateStr = item.end_date || item.date || item.start_date;
    if (!rawDateStr) return false;

    const dateOnly = String(rawDateStr).split('T')[0];
    const dateParts = dateOnly.split('-').map(Number);
    if (dateParts.length < 3 || dateParts.some(isNaN)) return false;

    const [year, month, day] = dateParts;

    // 3. Case B: Has explicit end_time string like "16:00" or "16:00:00"
    if (item.end_time && typeof item.end_time === 'string' && item.end_time.includes(':')) {
      const timeParts = item.end_time.trim().split(':').map(Number);
      const hours = timeParts[0] || 0;
      const minutes = timeParts[1] || 0;
      const seconds = timeParts[2] || 0;

      const endDateTime = new Date(year, month - 1, day, hours, minutes, seconds);
      if (!isNaN(endDateTime.getTime())) {
        return endDateTime.getTime() <= currentMs;
      }
    }

    // 4. Case C: Has end_date without specific end_time (e.g. Announcement)
    if (item.end_date) {
      const endOfDay = new Date(year, month - 1, day, 23, 59, 59, 999);
      if (!isNaN(endOfDay.getTime())) {
        return endOfDay.getTime() <= currentMs;
      }
    }

    // 5. Case D: Single date item without explicit end_time (e.g., event/meeting on a past date)
    const eventDayEnd = new Date(year, month - 1, day, 23, 59, 59, 999);
    if (!isNaN(eventDayEnd.getTime()) && eventDayEnd.getTime() <= currentMs) {
      return true;
    }

  } catch (err) {
    console.error('Error evaluating item expiration:', err);
  }

  return false;
}

/**
 * Utility function to check whether a meeting, event, announcement, or communication 
 * has reached its scheduled start time.
 * 
 * @param {Object} item - The content object
 * @param {Date} [now=new Date()] - The current reference time
 * @returns {boolean} true if current time is at or past start time; false otherwise.
 */
export function isItemStarted(item, now = new Date()) {
  if (!item) return false;

  const statusUpper = (item.status || '').toUpperCase();
  if (['IN_PROGRESS', 'ONGOING', 'STARTED'].includes(statusUpper)) {
    return true;
  }

  try {
    const currentMs = now.getTime();

    // 1. Case A: start_time is a full ISO date-time string
    if (item.start_time && typeof item.start_time === 'string' && item.start_time.includes('T')) {
      const startTimeDate = new Date(item.start_time);
      if (!isNaN(startTimeDate.getTime())) {
        return startTimeDate.getTime() <= currentMs;
      }
    }

    // Determine raw date string (e.g. "2026-10-09")
    const rawDateStr = item.date || item.start_date;
    if (!rawDateStr) return false;

    const dateOnly = String(rawDateStr).split('T')[0];
    const dateParts = dateOnly.split('-').map(Number);
    if (dateParts.length < 3 || dateParts.some(isNaN)) return false;

    const [year, month, day] = dateParts;

    // 2. Case B: Has explicit start_time string like "14:00" or "14:00:00"
    if (item.start_time && typeof item.start_time === 'string' && item.start_time.includes(':')) {
      const timeParts = item.start_time.trim().split(':').map(Number);
      const hours = timeParts[0] || 0;
      const minutes = timeParts[1] || 0;
      const seconds = timeParts[2] || 0;

      const startDateTime = new Date(year, month - 1, day, hours, minutes, seconds);
      if (!isNaN(startDateTime.getTime())) {
        return startDateTime.getTime() <= currentMs;
      }
    }

    // 3. Case C: Single date item without start_time (start of that day at 00:00:00)
    const dayStart = new Date(year, month - 1, day, 0, 0, 0, 0);
    if (!isNaN(dayStart.getTime())) {
      return dayStart.getTime() <= currentMs;
    }
  } catch (err) {
    console.error('Error evaluating item start:', err);
  }

  return false;
}

/**
 * Returns the computed status key ('COMPLETED', 'ONGOING', 'UPCOMING', 'CANCELLED', 'DRAFT')
 * 
 * @param {Object} item 
 * @param {Date} [now=new Date()]
 * @returns {string} 
 */
export function getItemComputedStatus(item, now = new Date()) {
  if (!item) return 'UNKNOWN';

  const rawStatus = (item.status || '').toUpperCase();
  if (rawStatus === 'CANCELLED' || rawStatus === 'DRAFT') {
    return rawStatus;
  }

  // 1. Has the item already completed / expired?
  if (isItemExpired(item, now)) {
    return 'COMPLETED';
  }

  // 2. Has the item's start time been reached?
  if (isItemStarted(item, now)) {
    return 'ONGOING';
  }

  return 'UPCOMING';
}

/**
 * Returns human readable status label in FR/EN
 * @param {string} computedStatus 
 * @param {string} language 'FR' | 'EN'
 * @returns {string}
 */
export function getStatusLabel(computedStatus, language = 'FR') {
  switch (computedStatus) {
    case 'COMPLETED':
    case 'FINISHED':
    case 'EXPIRED':
    case 'ENDED':
      return language === 'FR' ? 'Terminé(e)' : 'Completed';
    case 'ONGOING':
    case 'IN_PROGRESS':
      return language === 'FR' ? 'En cours' : 'Ongoing';
    case 'CANCELLED':
      return language === 'FR' ? 'Annulé(e)' : 'Cancelled';
    case 'DRAFT':
      return language === 'FR' ? 'Brouillon' : 'Draft';
    case 'PUBLISHED':
      return language === 'FR' ? 'Publié(e)' : 'Published';
    case 'UPCOMING':
    case 'SCHEDULED':
    default:
      return language === 'FR' ? 'À venir' : 'Upcoming';
  }
}

/**
 * Formats a raw date string (e.g. '2026-10-09' or ISO string) into a localized readable date.
 * Example: 'Vendredi 9 Octobre 2026' (FR) or 'Friday, October 9, 2026' (EN)
 * 
 * @param {string|Date} rawDate 
 * @param {string} [lang='FR'] 'FR' | 'EN'
 * @returns {string}
 */
export function formatDisplayDate(rawDate, lang = 'FR') {
  if (!rawDate) return '';
  try {
    const dateStr = String(rawDate).split('T')[0];
    const parts = dateStr.split('-').map(Number);
    let d;
    if (parts.length === 3 && !parts.some(isNaN)) {
      d = new Date(parts[0], parts[1] - 1, parts[2]);
    } else {
      d = new Date(rawDate);
    }
    if (isNaN(d.getTime())) return String(rawDate);

    const formatted = d.toLocaleDateString(lang === 'FR' ? 'fr-FR' : 'en-US', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });

    // Capitalize words for clean display (e.g. Vendredi 9 Octobre 2026)
    return formatted
      .split(' ')
      .map(w => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ');
  } catch (err) {
    return String(rawDate);
  }
}

/**
 * Returns a human-friendly complete date string for any item type (meeting, event, announcement, communication).
 * 
 * @param {Object} item 
 * @param {string} [lang='FR']
 * @returns {string}
 */
export function getItemDateLabel(item, lang = 'FR') {
  if (!item) return '';

  // 1. Announcements with start_date and end_date
  if (item.start_date && item.end_date && item.start_date !== item.end_date) {
    const start = formatDisplayDate(item.start_date, lang);
    const end = formatDisplayDate(item.end_date, lang);
    return lang === 'FR' ? `Du ${start} au ${end}` : `From ${start} to ${end}`;
  }

  // 2. Specific date
  const rawDate = item.date || item.start_date || item.publish_date || item.end_date || item.created_at;
  if (rawDate) {
    return formatDisplayDate(rawDate, lang);
  }

  return '';
}

export default {
  isItemExpired,
  isItemStarted,
  getItemComputedStatus,
  getStatusLabel,
  formatDisplayDate,
  getItemDateLabel
};
