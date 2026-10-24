import { leads } from '../data/lead.js';
import { panel, panelNoPad } from '../components/panel.js';
import { table } from '../components/table.js';
import { tag, boolTag } from '../components/tag.js';
import { toolCard } from '../components/toolcard.js';

export function renderStep5() {
  const rows = leads.map(l => [
    `<span class="mono">${l.domain}</span>`,
    tag(l.fundingRound, l.fundingRound === '未披露' ? 'gray' : 'blue'),
    `<span class="mono">${l.fundingRaised}</span>`,
    `<span style="color:${l.growth.startsWith('+') ? 'var(--cds-green-40)' : 'var(--cds-gray-50)'};font-weight:600;">${l.growth}</span>`,
    boolTag(l.hiring),
    boolTag(l.funding),
    `${l.glassdoor} ★`,
  ]);

  return `
    <div class="notification"><span class="notif-icon">ℹ</span><div>背调只输出标量字段，不产出长篇报告。</div></div>
    ${panelNoPad('背调信号', table(
      ['域名', '最近融资', '融资额', '6 个月增长', '正在招聘', '融资信号', 'Glassdoor'], rows
    ), '29 家已完成 · 显示 4 条')}
    ${panel('背调工具', `<div class="tool-grid">
      ${toolCard({ name: 'Apollo Organization Enrichment', role: '融资事件、技术栈、员工增长。', price: '1 credit / 公司', fields: 'funding_events · current_technologies · departmental_head_count' })}
      ${toolCard({ name: 'Bright Data Business Search', role: '跨源公司背调信号。', price: '$2–3 / 1K 次', fields: 'funding_stage · employees_in_linkedin · linkedin_followers' })}
    </div>`)};
}

export function bindStep5() {}
