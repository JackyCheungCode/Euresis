export function toolCard({ name, role, price, fields, badge }) {
  return `
    <div class="tool-card">
      <div class="tool-name">${name}${badge || ''}</div>
      <div class="tool-role">${role}</div>
      ${price ? `<div class="tool-price">${price}</div>` : ''}
      <div class="tool-fields">${fields}</div>
    </div>`;
}

export function modelTags(models, recommended) {
  return `<div class="model-tags">${models.map(m =>
    `<span class="model-tag ${m === recommended ? 'recommended' : ''}">${m}</span>`
  ).join('')}</div>`;
}
