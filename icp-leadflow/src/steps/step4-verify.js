import { leads } from '../data/lead.js';
import { panel, panelNoPad } from '../components/panel.js';
import { table } from '../components/table.js';
import { tag } from '../components/tag.js';
import { toolCard } from '../components/toolcard.js';

export function renderStep4() {
  const rows = leads.map(l => [
    `<span class="mono">${l.domain}</span>`,
    tag('valid', 'green'),
    tag(l.lineType, l.lineType === 'mobile' ? 'teal' : 'yellow'),
    l.lineType === 'mobile' ? tag(l.waRegistered ? 'eligible' : '未注册', l.waRegistered ? 'green' : 'red') : tag('不适用', 'gray'),
    tag(l.emailStatus, l.emailStatus === 'valid' ? 'green' : 'yellow'),
    tag('Hunter', 'gray'),
    tag(l.route, 'blue'),
  ]);

  return `
    <div class="notification warning"><span class="notif-icon">⚠</span><div>验证层不可跳过。landline 不查 WhatsApp，accept-all 邮箱降级人工复核。</div></div>
    ${panelNoPad('验证结果', table(
      ['域名', '电话验证', '线路类型', 'WA 资格', '邮箱验证', '验证器', '路由决策'], rows
    ), 'Twilio 61 次 · Hunter 54 次')}
    <div class="two-col">
      ${panel('验证工具', `<div class="tool-grid">
        ${toolCard({ name: 'Twilio Lookup v2', role: '线路类型判断。', price: '$0.008 / 次', fields: 'line_type_intelligence.type', badge: tag('运行中', 'green') })}
        ${toolCard({ name: 'Hunter Email Verifier', role: 'SMTP + MX 检测。', price: '~0.5 credit / 次', fields: 'status · mx_records · smtp_check', badge: tag('运行中', 'green') })}
      </div>`)}
      ${panel('路由决策摘要', `
        <div class="info-list">
          ${[
            ['WhatsApp 可触达', '38 条', 'var(--cds-teal-60)'],
            ['电话外呼（mobile）', '23 条', 'var(--cds-blue-60)'],
            ['电话外呼（landline）', '12 条', 'var(--cds-gray-70)'],
            ['邮件可触达', '54 条', 'var(--cds-green-40)'],
            ['降级人工复核', '9 条', 'var(--cds-yellow-30)'],
          ].map(([k, v, c]) => `<div class="info-item"><span class="info-key">${k}</span><span class="info-value" style="font-family:var(--cds-font-sans);color:${c};font-weight:600;">${v}</span></div>`).join('')}
        </div>`)}
    </div>`;
}

export function bindStep4() {}
