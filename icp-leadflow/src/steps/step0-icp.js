import { icpLayers, generatedQueries, aiSchema } from '../data/icp.js';
import { panel, panelNoPad } from '../components/panel.js';
import { modelTags } from '../components/toolcard.js';
import { tag } from '../components/tag.js';
import { showToast } from '../components/toast.js';

export function renderStep0() {
  const layersHtml = icpLayers.map((layer, i) => `
    <div class="icp-layer ${i === 0 ? 'open' : ''}">
      <div class="icp-layer-header" onclick="this.parentElement.classList.toggle('open')">
        <span>${layer.title}</span><span>▾</span>
      </div>
      <div class="icp-layer-body">
        <div class="icp-field-grid">
          ${layer.fields.map(f => `
            <div class="icp-field"><label>${f.label}</label><div class="val">${f.value}</div></div>
          `).join('')}
        </div>
      </div>
    </div>`).join('');

  const queriesHtml = generatedQueries.map(q =>
    `<span class="c">// ${q.note}</span>\n<span class="s">${q.q}</span>`
  ).join('\n\n');

  return `
    <div class="notification"><span class="notif-icon">ℹ</span><div>ICP 四层字段体系。每个字段标注工作流用途：生成查询 / AI 判定 / 渠道路由 / 优先级分层。</div></div>
    ${panel('ICP 定义（四层）', layersHtml + `
      <div style="display:flex;gap:0.5rem;margin-top:1rem;">
        <button class="btn btn-primary btn-sm" data-toast="ICP 已保存">保存 ICP</button>
        <button class="btn btn-ghost btn-sm" data-toast="已重新生成查询">重新生成查询</button>
      </div>`, '已保存 · 2 分钟前')}
    <div class="two-col">
      ${panelNoPad('生成的查询字符串', `<div class="code-block">${queriesHtml}</div>`)}
      ${panel('AI 判定 Schema', `
        <div class="field-tags">${aiSchema.map(s => tag(s, 'blue')).join('')}</div>
        <div style="margin-top:1rem;"><div class="form-label" style="margin-bottom:0.25rem;">可选模型</div>
        ${modelTags(['Claude Sonnet 4', 'GPT-4o', 'Gemini 2.5 Pro'], 'Claude Sonnet 4')}</div>`)}
    </div>`;
}

export function bindStep0(root) {
  root.querySelectorAll('[data-toast]').forEach(btn => {
    btn.addEventListener('click', () => showToast(btn.dataset.toast));
  });
}
