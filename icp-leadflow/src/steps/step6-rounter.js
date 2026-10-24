import { panel, panelNoPad } from '../components/panel.js';
import { table } from '../components/table.js';
import { tag } from '../components/tag.js';

export function renderStep6() {
  const rules = [
    ['line_type = mobile 且 whatsapp_registered = true', 'WhatsApp Business API 序列', '38', '已就绪', 'green'],
    ['line_type = mobile 但 WhatsApp 未注册', '电话外呼序列', '23', '已就绪', 'green'],
    ['line_type = landline', '电话外呼，不查 WhatsApp', '12', '已就绪', 'green'],
    ['email_status = valid', '邮件序列', '54', '已就绪', 'green'],
    ['email_status = accept-all', '降级人工复核', '9', '待处理', 'yellow'],
    ['facebook_page_url 存在', '广告再营销 / 页面互动', '31', '已标记', 'blue'],
    ['无任何验证渠道', '待人工复核，不自动触达', '4', '人工', 'red'],
  ];

  return `
    <div class="notification success"><span class="notif-icon">✓</span><div>最终输出：83 条 ICP 匹配线索，已按验证结果分流。</div></div>
    ${panelNoPad('路由规则', table(
      ['条件', '路由目标', '数量', '状态'],
      rules.map(r => [`<code>${r[0]}</code>`, r[1], r[2], tag(r[3], r[4])])
    ), '自动分流')}
    <div class="two-col">
      ${panel('输出落地', `
        <div class="info-list">
          ${[
            ['n8n 工作流', '已触发 · 7 节点'],
            ['Google Sheets', 'LeadFlow_Master_2026Q1'],
            ['CRM 同步', '✓ 已完成'],
            ['审计字段', 'source · verified_at · verifier'],
          ].map(([k, v]) => `<div class="info-item"><span class="info-key">${k}</span><span class="info-value" style="font-family:var(--cds-font-sans);">${v}</span></div>`).join('')}
        </div>`)}
      ${panelNoPad('最终记录示例', `<div class="code-block">{
  <span class="k">"domain"</span>: <span class="s">"solardist.de"</span>,
  <span class="k">"company_name"</span>: <span class="s">"SolarDist GmbH"</span>,
  <span class="k">"icp_match"</span>: <span class="b">true</span>,
  <span class="k">"phone"</span>: <span class="s">"+493012345678"</span>,
  <span class="k">"line_type"</span>: <span class="s">"mobile"</span>,
  <span class="k">"whatsapp_registered"</span>: <span class="b">true</span>,
  <span class="k">"email"</span>: <span class="s">"info@solardist.de"</span>,
  <span class="k">"email_status"</span>: <span class="s">"valid"</span>,
  <span class="k">"route"</span>: <span class="s">"whatsapp+email"</span>
}</div>`)}
    </div>`;
}

export function bindStep6() {}
