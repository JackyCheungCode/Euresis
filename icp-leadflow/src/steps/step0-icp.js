import { icpLayers, generatedQueries, aiSchema } from '../data/icp.js';
import { panelNoPad } from '../components/panel.js';
import { tag } from '../components/tag.js';
import { showToast } from '../components/toast.js';

const escapeHtml = value => String(value ?? '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);
function readSavedFields() {
  try { return JSON.parse(localStorage.getItem('euresis.icp.fields.v1') || '{}'); } catch { return {}; }
}
function modelPicker() {
  const models = ['Claude Sonnet 4', 'GPT-4o', 'Gemini 2.5 Pro'];
  const current = localStorage.getItem('euresis.icp.model') || models[0];
  return `<div class="cds-select model-picker" data-model-picker>
    <button class="cds-select-trigger" type="button" aria-haspopup="listbox" aria-expanded="false"><span>${escapeHtml(current)}</span><span aria-hidden="true">⌄</span></button>
    <div class="cds-select-menu" role="listbox" aria-label="选择 AI 模型" hidden>
      ${models.map(model => `<button type="button" class="cds-select-option" role="option" data-model="${escapeHtml(model)}" aria-selected="${model === current}">${escapeHtml(model)}</button>`).join('')}
    </div>
  </div>`;
}
export function renderStep0() {
  const saved = readSavedFields();
  const layersHtml = icpLayers.map((layer, i) => `
    <section class="icp-layer ${i === 0 ? 'open' : ''}">
      <h3 class="icp-layer-heading"><button class="icp-layer-header" type="button" aria-expanded="${i === 0 ? 'true' : 'false'}"><span>${escapeHtml(layer.title)}</span><span class="icp-layer-chevron" aria-hidden="true">⌄</span></button></h3>
      <div class="icp-layer-body" ${i === 0 ? '' : 'hidden'}>
        <div class="icp-field-grid">
          ${layer.fields.map((field, fieldIndex) => {
            const key = `layer-${i}-field-${fieldIndex}`;
            const value = Object.prototype.hasOwnProperty.call(saved, key) ? saved[key] : field.value;
            return `<div class="icp-field"><label for="icp-${key}">${escapeHtml(field.label)}</label><input class="cds-text-input" id="icp-${key}" name="${key}" data-icp-field="${key}" value="${escapeHtml(value)}" autocomplete="off"></div>`;
          }).join('')}
        </div>
      </div>
    </section>`).join('');
  const queriesHtml = generatedQueries.map(q => `<div class="generated-query"><span class="query-note">${escapeHtml(q.note)}</span><code>${escapeHtml(q.q)}</code><button type="button" class="btn btn-ghost btn-sm" data-copy-query="${escapeHtml(q.q)}">复制</button></div>`).join('');
  const model = modelPicker();
  return `
    <div class="notification"><span class="notif-icon" aria-hidden="true">i</span><div>定义目标客户、联系人、购买信号与排除条件。修改字段后保存，后续查询生成可使用这些值。</div></div>
    <section class="icp-definition-section" aria-labelledby="icpDefinitionTitle">
      <div class="icp-section-heading"><div><h2 id="icpDefinitionTitle">ICP 定义</h2><p>四层客户筛选条件 · 可直接编辑</p></div><div class="icp-section-actions"><button class="btn btn-ghost btn-sm" type="button" id="resetIcpFields">恢复示例</button><button class="btn btn-primary btn-sm" type="button" id="saveIcpFields">保存 ICP</button></div></div>
      ${layersHtml}
    </section>
    <div class="two-col icp-support-grid">
      ${panelNoPad('生成的查询字符串', `<div class="generated-queries">${queriesHtml}</div>`)}
      <section class="panel icp-schema-panel">
        <div class="panel-header"><h2>AI 判定 Schema</h2><span class="panel-meta">结构化输出字段</span></div>
        <div class="panel-body"><div class="field-tags">${aiSchema.map(field => tag(field, 'blue')).join('')}</div>
          <div class="model-picker-wrap"><label class="form-label">AI 模型</label>${model}<p class="field-help">模型列表为前端选项；要发起真实模型请求，请先在「API 与 AI 集成」配置服务。</p></div>
        </div>
      </section>
    </div>`;
}
export function bindStep0(root) {
  root.querySelectorAll('.icp-layer-header').forEach(button => {
    button.addEventListener('click', () => {
      const layer = button.closest('.icp-layer');
      const body = layer.querySelector('.icp-layer-body');
      const open = button.getAttribute('aria-expanded') !== 'true';
      button.setAttribute('aria-expanded', String(open));
      layer.classList.toggle('open', open);
      body.hidden = !open;
    });
  });
  root.querySelectorAll('[data-copy-query]').forEach(button => button.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(button.dataset.copyQuery);
      showToast('查询字符串已复制');
    } catch { showToast('复制失败，请手动选择查询字符串'); }
  }));
  const modelSelect = root.querySelector('[data-model-picker]');
  if (modelSelect) {
    const trigger = modelSelect.querySelector('.cds-select-trigger');
    const menu = modelSelect.querySelector('.cds-select-menu');
    trigger.addEventListener('click', () => {
      menu.hidden = !menu.hidden;
      trigger.setAttribute('aria-expanded', String(!menu.hidden));
    });
    modelSelect.querySelectorAll('[data-model]').forEach(option => option.addEventListener('click', () => {
      trigger.querySelector('span').textContent = option.dataset.model;
      modelSelect.querySelectorAll('[data-model]').forEach(item => item.setAttribute('aria-selected', String(item === option)));
      menu.hidden = true;
      trigger.setAttribute('aria-expanded', 'false');
      localStorage.setItem('euresis.icp.model', option.dataset.model);
    }));
  }
  root.querySelector('#saveIcpFields')?.addEventListener('click', () => {
    const values = {};
    root.querySelectorAll('[data-icp-field]').forEach(input => { values[input.dataset.icpField] = input.value.trim(); });
    localStorage.setItem('euresis.icp.fields.v1', JSON.stringify(values));
    showToast('ICP 定义已保存');
  });
  root.querySelector('#resetIcpFields')?.addEventListener('click', () => {
    localStorage.removeItem('euresis.icp.fields.v1');
    showToast('已恢复示例字段');
    const container = document.getElementById('stepContainer');
    container.innerHTML = `<div class="step-content active">${renderStep0()}</div>`;
    bindStep0(container);
  });
}
