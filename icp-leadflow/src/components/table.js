export function table(headers, rows, caption = '数据记录') {
  const thead = `<cds-table-head><cds-table-header-row>${headers.map(h => `<cds-table-header-cell scope="col">${h}</cds-table-header-cell>`).join('')}</cds-table-header-row></cds-table-head>`;
  const tbody = `<cds-table-body>${rows.map((row, index) => `<cds-table-row data-record-row data-record-index="${index}" tabindex="0" aria-label="查看第 ${index + 1} 条记录详情">${row.map(cell => `<cds-table-cell>${cell}</cds-table-cell>`).join('')}</cds-table-row>`).join('')}</cds-table-body>`;
  return `<div class="cds-data-table-container"><cds-table class="data-table" aria-label="${caption}">${thead}${tbody}</cds-table></div>`;
}
