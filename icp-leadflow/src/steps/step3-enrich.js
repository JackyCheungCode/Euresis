import { leads } from '../data/lead.js';
import { panel, panelNoPad } from '../components/panel.js';
import { table } from '../components/table.js';
import { boolTag, tag } from '../components/tag.js';
import { toolCard } from '../components/toolcard.js';

export function renderStep3() {
  const rows = leads.map(l => [
    `<span class="mono">${l.domain}</span>`,
    `<span class="mono">${l.phone}</span>`,
    tag(l.phoneSource, l.phoneSource === 'apollo' ? 'blue' : 'purple'),
    tag(l.lineType, l.lineType === 'mobile' ? 'teal' : 'yellow'),
    l.waRegistered === null ? tag('跳过', 'gray') : boolTag(l.waRegistered),
    l.waName,
    l.address,
    tag(l.emailStatus, l.emailStatus === 'valid' ? 'green' : 'yellow'),
  ]);

  return `
    <div class="notification warning"><span class="notif-icon">⚠</span><div>仅对 <strong>icp_match = true</strong> 的 83 家线索开启高成本补齐。</div></div>
    ${panelNoPad('补齐结果 · 多 API 并行', table(
      ['域名', '电话', '来源', '线路类型', 'WA 注册', 'WA 公开名', '地址', '邮箱状态'], rows
    ), 'Apollo 61 条 · Clay 14 条 · WA 38 条')}
    <div class="two-col">
      ${panel('使用中的工具', `<div class="tool-grid">
        ${toolCard({ name: 'Apollo Enrichment', role: '公司电话、地址、员工数。', price: '1 credit / 公司', fields: 'primary_phone · locations · employee_count', badge: tag('运行中', 'green') })}
        ${toolCard({ name: 'Clay', role: '多 provider 瀑布流。', price: '$167/月起', fields: 'waterfall · 75+ providers', badge: tag('命中 14 条', 'yellow') })}
        ${toolCard({ name: 'Apify WhatsApp Validator', role: '号码是否注册 WhatsApp。', price: '$0.50 / 1K', fields: 'isRegistered · normalizedNumber · lineType', badge: tag('运行中', 'green') })}
        ${toolCard({ name: 'Apify FB Page Contact Scraper', role: 'FB 页面公开邮箱/电话。', price: '$4.2–6 / 1K', fields: 'emails · phones · website' })}
      </div>`)}
      ${panelNoPad('补齐后记录（示例）', `<div class="code-block">{
  <span class="k">"domain"</span>: <span class="s">"solardist.de"</span>,
  <span class="k">"phone"</span>: <span class="s">"+493012345678"</span>,
  <span class="k">"phone_source"</span>: <span class="s">"apollo"</span>,
  <span class="k">"line_type"</span>: <span class="s">"mobile"</span>,
  <span class="k">"whatsapp_registered"</span>: <span class="b">true</span>,
  <span class="k">"whatsapp_public_name"</span>: <span class="s">"SolarDist GmbH"</span>,
  <span class="k">"facebook_page_url"</span>: <span class="s">"facebook.com/solardist"</span>,
  <span class="k">"address"</span>: <span class="s">"Berlin, DE"</span>
}</div>`)}
    </div>`;
}

export function bindStep3() {}
