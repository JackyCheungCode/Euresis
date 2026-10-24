let timer = null;
export function showToast(message) {
  const el = document.getElementById('toast');
  el.textContent = message;
  el.style.display = 'block';
  clearTimeout(timer);
  timer = setTimeout(() => { el.style.display = 'none'; }, 2500);
}
