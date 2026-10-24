export function tag(text, variant = 'gray', withDot = false) {
  const dot = withDot ? '<span class="dot"></span>' : '';
  return `<span class="tag tag-${variant}">${dot}${text}</span>`;
}

export function boolTag(value) {
  if (value === true) return tag('True', 'green');
  if (value === false) return tag('False', 'gray');
  return tag('Unknown', 'yellow');
}

export function statusTag(status) {
  const map = {
    scraped: ['已抓取', 'green'],
    pending: ['待处理', 'yellow'],
    skipped: ['跳过', 'red'],
  };
  const [text, variant] = map[status] || ['未知', 'gray'];
  return tag(text, variant, true);
}
