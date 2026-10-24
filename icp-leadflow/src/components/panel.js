export function panel(title, bodyHtml, meta = '') {
  return `
    <div class="panel">
      <div class="panel-header"><h2>${title}</h2>${meta ? `<div class="panel-meta">${meta}</div>` : ''}</div>
      <div class="panel-body">${bodyHtml}</div>
    </div>`;
}

export function panelNoPad(title, bodyHtml, meta = '') {
  return `
    <div class="panel">
      <div class="panel-header"><h2>${title}</h2>${meta ? `<div class="panel-meta">${meta}</div>` : ''}</div>
      <div class="panel-body no-pad" style="overflow-x:auto;">${bodyHtml}</div>
    </div>`;
}
