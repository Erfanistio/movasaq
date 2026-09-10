export const isText = (value, max, min = 0) =>
  typeof value === 'string' && value.trim().length >= min && value.length <= max;

export function validContent(kind, id, value) {
  if (kind === 'settings' && id !== 'main') return false;
  const fields = kind === 'settings'
    ? ['name', 'tagline', 'phone', 'email', 'address', 'hours', 'heroTitle', 'heroText']
    : ['title', 'category', 'excerpt', 'body', 'image', 'icon', 'duration'];
  if (fields.some(key => value[key] !== undefined && !isText(value[key], key === 'body' ? 100000 : 2000))) return false;
  if (kind !== 'settings' && (!isText(value.title, 200, 1) || typeof value.published !== 'boolean')) return false;
  if (kind === 'courses' && (!Number.isSafeInteger(value.price) || value.price < 0)) return false;
  return true;
}

export function validDate(value) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(value);
  return Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === value;
}
