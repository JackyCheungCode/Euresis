import { leads } from '../data/lead.js';
import { panel, panelNoPad } from '../components/panel.js';
import { table } from '../components/table.js';
import { boolTag, tag } from '../components/tag.js';
import { toolCard, modelTags } from '../components/toolcard.js';

export function renderStep2() {
  const rows = leads.map(l => [
    `<span class="mono">${l.domain}</span>`,
    boolTag(l.icp), l.size, l.revenue, l.type,
    boolTag(l.hiring), boolTag(l.funding),
    l.whatsapp === true ? tag('是', 'green') : tag('否', 'gray'),
    `<span class="mono">${l.facebook}</span>`,
    `<span class="mono">${l.phone}</span>`,
    `<span class="mono">${l.email}</span>`,
  ]);

  return `
    <div class="notification success"><span class="notif-icon">✓</span><div>抓取 247 个域名，183 个返回至少一个联系方式。</div></div>
    ${panelNoPad('结构化信号', table(
      ['域名', 'ICP', '规模', '营收', '类型', '招聘', '融资', 'WA', 'FB', '电话', '邮箱'], rows
    ), '183 / 247')}
    <div class="two-col">
      ${panel('工具', `<div class="tool-grid">
        ${toolCard({ name: 'Apify Domain Contact Scraper', role: '域名联系方式 + 社交链接。', price: '从 $2 / 1K', fields: 'emails · phones · whatsapp · facebooks · linkedIns', badge: tag('运行中', 'green') })}
        ${toolCard({ name: 'Apify Contact Details Scraper', role: '14 平台社交覆盖。', price: '按站点计费', fields: 'emails · phones · socials · verification' })}
      </div>`)}
      ${panel('AI 判定模型', `
        <div style="font-size:0.8125rem;color:var(--cds-gray-60);margin-bottom:1rem;">仅做结构化判定，缺失返回 <span class="tag tag-gray">unknown</span>。</div>
        ${modelTags(['Claude Haiku 4.5', 'GPT-4o mini', 'Gemini 2.5 Flash'], 'Claude Haiku 4.5')}`)}
    </div>`;
}

export function bindStep2() {}
