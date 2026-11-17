// Groups the existing services into simple categories for filtering and icons.
// The services table has no category column, so the category is derived from the name.
const CATEGORIES = {
  grooming: { key: 'grooming', label: 'Grooming', icon: '🛁' },
  health: { key: 'health', label: 'Health', icon: '🩺' },
  care: { key: 'care', label: 'Daycare & Sitting', icon: '🏡' }
};

function categoryFor(name) {
  const text = String(name || '').toLowerCase();
  if (/(bath|groom|nail|trim|shampoo)/.test(text)) return CATEGORIES.grooming;
  if (/(health|vaccin|dental|vet|check)/.test(text)) return CATEGORIES.health;
  return CATEGORIES.care;
}

module.exports = { CATEGORIES, categoryFor };
