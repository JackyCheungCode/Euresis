const TYPE_MAP = { green: 'green', red: 'red', yellow: 'warm-gray', blue: 'blue', gray: 'gray', teal: 'teal', purple: 'purple' };
const escapeHtml = value => String(value ?? '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);
export function tag(text, variant = 'gray', withDot = false) {
  const type = TYPE_MAP[variant] || 'gray';
  const dot = withDot ? '<span class="dot" aria-hidden="true"></span>' : '';
  return `<cds-tag type="${type}">${dot}${escapeHtml(text)}</cds-tag>`;
}
export function boolTag(value) {
  if (value === true) return tag('True', 'green');
  if (value === false) return tag('False', 'gray');
  return tag('Unknown', 'yellow');
}
export function statusTag(status) {
  const map = { scraped: ['已抓取', 'green'], pending: ['待处理', 'yellow'], skipped: ['跳过', 'red'] };
  const [text, variant] = map[status] || ['未知', 'gray'];
  return tag(text, variant, true);
}
