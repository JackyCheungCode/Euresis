export function table(headers, rows, caption = '数据记录') {
  const thead = `<thead><tr>${headers.map(h => `<th scope="col">${h}</th>`).join('')}</tr></thead>`;
  const tbody = `<tbody>${rows.map((row, index) => `<tr data-record-row data-record-index="${index}" tabindex="0" aria-label="查看第 ${index + 1} 条记录详情">${row.map(cell => `<td>${cell}</td>`).join('')}</tr>`).join('')}</tbody>`;
  return `<div class="cds-data-table-container"><table class="data-table" aria-label="${caption}">${thead}${tbody}</table></div>`;
}
