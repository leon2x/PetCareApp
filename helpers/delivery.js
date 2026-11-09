// Estimated delivery date = today + 2 working days (Mon-Fri). Calculated on the server.
function estimateDelivery(from = new Date(), workingDays = 2) {
  const date = new Date(from.getFullYear(), from.getMonth(), from.getDate());
  let added = 0;
  while (added < workingDays) {
    date.setDate(date.getDate() + 1);
    const day = date.getDay();
    if (day !== 0 && day !== 6) added++;
  }
  return date;
}

function toSqlDate(date) {
  const pad = (n) => String(n).padStart(2, '0');
  return date.getFullYear() + '-' + pad(date.getMonth() + 1) + '-' + pad(date.getDate());
}

// Accepts the value of <input type="datetime-local"> (YYYY-MM-DDTHH:mm).
// Returns { sql, date } or null when it is not a valid slot (future, within 60 days, 09:00-17:00).
function parseAppointment(value, now = new Date()) {
  const match = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/.exec(value || '');
  if (!match) return null;

  const [, y, mo, d, h, mi] = match.map(Number);
  const date = new Date(y, mo - 1, d, h, mi);
  if (Number.isNaN(date.getTime()) || date.getMonth() !== mo - 1) return null;

  const sixtyDays = new Date(now.getTime() + 60 * 24 * 60 * 60 * 1000);
  if (date <= now || date > sixtyDays) return null;
  if (h < 9 || h > 17 || (h === 17 && mi > 0)) return null;

  return { date, sql: match[1] + '-' + match[2] + '-' + match[3] + ' ' + match[4] + ':' + match[5] + ':00' };
}

module.exports = { estimateDelivery, toSqlDate, parseAppointment };
