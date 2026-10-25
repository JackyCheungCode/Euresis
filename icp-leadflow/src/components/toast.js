let timer = null;
const escapeHtml = value => String(value ?? '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);
export function showToast(message, kind = 'info') {
  const host = document.getElementById('toast');
  if (!host) return;
  clearTimeout(timer);
  const toast = document.createElement('cds-toast-notification');
  toast.setAttribute('kind', ['info','success','warning','error'].includes(kind) ? kind : 'info');
  toast.setAttribute('title', 'Euresis');
  toast.setAttribute('subtitle', String(message ?? ''));
  toast.setAttribute('timeout', '2500');
  toast.setAttribute('low-contrast', '');
  host.replaceChildren(toast);
  host.style.display = 'block';
  timer = setTimeout(() => { host.replaceChildren(); host.style.display = 'none'; }, 2600);
}
