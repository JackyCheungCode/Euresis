import { leads } from '../data/lead.js';
import { panel, panelNoPad } from '../components/panel.js';
import { table } from '../components/table.js';
import { tag, statusTag } from '../components/tag.js';
import { toolCard } from '../components/toolcard.js';

export function renderStep1() {
  const rows = leads.map((l, i) => [
    i + 1, `<span class="mono">${l.domain}</span>`, l.title,
    tag(l.source, 'gray'), l.region, statusTag(l.status),
  ]);

  return `
    <div class="notification success"><span class="notif-icon">✓</span><div>已执行 4 条查询，返回 247 个候选域名，按域名去重。</div></div>
    ${panelNoPad('候选公司列表', table(['#', '公司域名', '标题', '来源', '地域', '状态'], rows), '247 条 · 显示前 6 条')}
    ${panel('工具与模型', `<div class="tool-grid">
      ${toolCard({ name: 'Serper.dev', role: '最低成本 Google SERP 入口。', price: '~$1 / 1K 次', fields: 'q · gl · hl · num', badge: tag('运行中', 'green') })}
      ${toolCard({ name: 'Brave Search API', role: '独立索引，SERP 备用源。', price: '$5 / 1K 次', fields: 'q · country · search_lang' })}
    </div>`)}`;
}

export function bindStep1() {}
