import { icpLayers, aiSchema } from '../data/icp.js';
import { optionsForField, optionLabel, optionValue, MARKET_OPTIONS } from '../data/icp-options.js';
import { panelNoPad } from '../components/panel.js';
import { tag } from '../components/tag.js';
import { showToast } from '../components/toast.js';
import { supabase } from '../services/supabase.js';
import { leads, loadLeads } from '../data/lead.js';
import { integrationClient, loadIntegrations } from '../services/integrations.js';

const escapeHtml = value => String(value ?? '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);
let savedProfileId = null;
const MODELS = [
  { value: 'gpt-4o-mini', label: 'OpenAI · gpt-4o-mini' },
  { value: 'gpt-4o', label: 'OpenAI · gpt-4o' },
  { value: 'claude-3-5-haiku-latest', label: 'Anthropic · Claude Haiku' },
  { value: 'claude-sonnet-4-20250514', label: 'Anthropic · Claude Sonnet 4' },
];
function renderSelect(key, options, selected, label) {
 const normalized=[{value:'',label:'不限 / 请选择'},...options.map(option=>({value:String(optionValue(option)),label:optionLabel(option),flag:typeof option==='object'?option.flag:null}))];
 const choice=normalized.find(option=>option.value===String(selected??''))||normalized[0];
 return `<div class="cds-select icp-carbon-select" data-select-wrap="${escapeHtml(key)}"><cds-dropdown class="carbon-select-control" title-text="${escapeHtml(label)}" label="${escapeHtml(choice.label)}" value="${escapeHtml(choice.value)}" data-carbon-select>${normalized.map(option=>`<cds-dropdown-item value="${escapeHtml(option.value)}" ${option.value===choice.value?'selected':''}>${option.flag?`<span class="flag-circle" aria-hidden="true">${option.flag}</span>`:''}${escapeHtml(option.label)}</cds-dropdown-item>`).join('')}</cds-dropdown><input type="hidden" data-icp-field="${escapeHtml(key)}" value="${escapeHtml(choice.value)}"></div>`;
}
function renderMultiSelect(key, options, label) {
 const normalized=options.map(o=>({value:String(optionValue(o)),label:optionLabel(o),flag:typeof o==='object'?o.flag:null}));
 return `<div class="cds-multi icp-multi" data-multi-wrap="${escapeHtml(key)}"><cds-multi-select class="carbon-multi-control" filterable="true" title-text="${escapeHtml(label)}" label="不限 / 请选择" data-carbon-multi>${normalized.map(o=>`<cds-multi-select-item value="${escapeHtml(o.value)}">${o.flag?'<span class="flag-circle">'+o.flag+'</span>':''}${escapeHtml(o.label)}</cds-multi-select-item>`).join('')}</cds-multi-select><div class="icp-multi-actions"><cds-button type="button" data-multi-clear kind="ghost" size="sm">清除选择</cds-button></div><input type="hidden" data-icp-field="${escapeHtml(key)}" value=""></div>`;
}
function renderGeography(key,label) {
 const options=MARKET_OPTIONS.map(o=>`<cds-multi-select-item value="${escapeHtml(o.value)}" data-country="${escapeHtml(o.value)}">${o.flag} ${escapeHtml(o.label)}</cds-multi-select-item>`).join('');
 const regions=Object.keys(REGIONS).map(r=>`<cds-button type="button" data-region="${escapeHtml(r)}" kind="ghost" size="sm">${escapeHtml(r)}</cds-button>`).join('');
 return `<div class="cds-multi icp-multi icp-geography" data-multi-wrap="${escapeHtml(key)}"><cds-multi-select class="carbon-multi-control" filterable="true" title-text="${escapeHtml(label)}" label="选择大区或国家/地区（可多选）" data-carbon-multi>${options}</cds-multi-select><div class="cds-region-pills">${regions}</div><div class="icp-multi-actions"><cds-button type="button" data-multi-clear kind="ghost" size="sm">清除选择</cds-button></div><input type="hidden" data-icp-field="${escapeHtml(key)}" value=""></div>`;
}
function renderKeywordTags(key,label) {
 const placeholder=label==='企业产品关键字描述'?'输入产品、设备、技术或解决方案关键词后按 Enter':'输入需要排除的产品关键词后按 Enter';
 return '<div class="icp-keyword-tags"><div class="icp-keyword-entry"><cds-text-input class="cds-text-input" data-keyword-input type="text" autocomplete="off" placeholder="'+escapeHtml(placeholder)+'" aria-label="'+escapeHtml(placeholder)+'"></cds-text-input><cds-button type="button" class="btn btn-secondary btn-sm" data-keyword-add kind="secondary" size="sm">添加</cds-button></div><div class="icp-keyword-chip-list"></div><input type="hidden" data-icp-field="'+escapeHtml(key)+'" value=""></div>';
}
function paintKeywordTags(wrap) {
 const hidden=wrap.querySelector('[data-icp-field]'),list=wrap.querySelector('.icp-keyword-chip-list');if(!hidden||!list)return;
 const values=[...new Set(String(hidden.value||'').split(/[,;\n]+/).map(v=>v.trim()).filter(Boolean))];hidden.value=values.join(', ');
 list.innerHTML=values.map(v=>'<cds-tag class="icp-keyword-chip" type="blue">'+escapeHtml(v)+'<cds-button type="button" data-remove-keyword="'+escapeHtml(v)+'" aria-label="删除关键词" kind="ghost">×</cds-button></cds-tag>').join('');
 list.querySelectorAll('[data-remove-keyword]').forEach(button=>button.addEventListener('click',()=>{hidden.value=values.filter(v=>v!==button.dataset.removeKeyword).join(', ');paintKeywordTags(wrap);hidden.dispatchEvent(new Event('change',{bubbles:true}));}));
}
function bindKeywordTags(root) {
 root.querySelectorAll('.icp-keyword-tags').forEach(wrap=>{const input=wrap.querySelector('[data-keyword-input]'),hidden=wrap.querySelector('[data-icp-field]');
 const add=()=>{const value=input.value.trim(),values=String(hidden.value||'').split(/[,;\n]+/).map(v=>v.trim()).filter(Boolean);if(value&&!values.some(v=>v.toLowerCase()===value.toLowerCase()))values.push(value);hidden.value=values.join(', ');input.value='';paintKeywordTags(wrap);hidden.dispatchEvent(new Event('change',{bubbles:true}));};
 wrap.querySelector('[data-keyword-add]').addEventListener('click',add);input.addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();add();}});paintKeywordTags(wrap);
 });
}
function renderField(key,label) {
 if(label==='目标地理位置'||label==='国家 / 地区'||label==='排除国家 / 地区') return renderGeography(key,label);
 if(label==='排除渠道域名（黑名单）') return '<div class="icp-blacklist"><cds-textarea class="cds-textarea" rows="4" data-icp-field="'+escapeHtml(key)+'" placeholder="输入域名，使用逗号或换行分隔" aria-label="输入域名，使用逗号或换行分隔"></cds-textarea><div class="icp-blacklist-actions"><cds-button type="button" class="btn btn-ghost btn-sm" data-fill-blacklist kind="ghost" size="sm">一键填充默认黑名单</cds-button><span class="field-help" data-blacklist-count>0 个域名</span></div></div>';
 if(label==='自定义黑名单域名') return '<div class="icp-domain-tags"><div class="icp-domain-entry"><cds-text-input class="cds-text-input" data-domain-input placeholder="competitor.com" aria-label="competitor.com"></cds-text-input><cds-button type="button" class="btn btn-secondary btn-sm" data-domain-add kind="secondary" size="sm">添加</cds-button></div><div class="icp-domain-chip-list" data-domain-chip-list></div><input type="hidden" data-icp-field="'+escapeHtml(key)+'" value=""></div>';
 if(MULTI_FIELDS.has(label)) return renderMultiSelect(key,optionsForField(label),label);
 return renderSelect(key,optionsForField(label),'',label);
}
function updateMultiLabel(wrap) {
 const items=[...wrap.querySelectorAll('cds-multi-select-item')];
 const values=items.filter(item=>item.selected||item.hasAttribute('selected')).map(item=>item.value);
 const hidden=wrap.querySelector('[data-icp-field]');if(hidden)hidden.value=values.join(', ');
}
function modelSelect() {
  const selected = 'gpt-4o-mini';
  return renderSelect('aiModel', MODELS, selected, '选择 AI 模型');
}
function queryPreview(root) {
  const layers=[...root.querySelectorAll('.icp-layer')];
  const selections=layers.map(layer=>[...layer.querySelectorAll('.icp-field')].map(field=>({label:field.querySelector('label')?.textContent?.trim()||'',value:field.querySelector('[data-icp-field]')?.value||''})).filter(item=>item.value&&item.value!=='不限'&&item.value!=='不排除'));
  const format=items=>items.length?items.map(item=>item.label+'：'+item.value).join('；'):'';
  const values=(layer,index)=>String(layers[layer]?.querySelectorAll('.icp-field')[index]?.querySelector('[data-icp-field]')?.value||'').split(/[,;\n]+/).map(v=>v.trim()).filter(v=>v&&v!=='不限'&&v!=='不排除');
  const phrase=arr=>arr.length?'('+arr.map(v=>'"'+v.replace(/"/g,'\\"')+'"').join(' OR ')+')':'';
  const industry=values(0,0), geography=values(0,5), size=values(0,1), companyType=values(0,4), technology=values(0,6), supply=values(0,8), funding=values(0,9), businessModel=values(0,10), products=values(0,11), markets=values(0,12), productKeywords=values(8,0);
  const syntax=[phrase(industry),phrase(geography),phrase(size),phrase(companyType),phrase(technology),phrase(supply),phrase(funding),phrase(businessModel),phrase(products),phrase(markets),phrase(productKeywords)].filter(Boolean);
  const persona=[...values(1,0),...values(1,1),...values(1,2)]; if(persona.length)syntax.push(phrase(persona));
  const signals=[...values(2,0),...values(2,1),...values(2,2),...values(2,3),...values(2,6),...values(2,7)]; if(signals.length)syntax.push(phrase(signals));
  const blacklist=[...values(3,5),...values(3,6)].map(v=>v.toLowerCase().replace(/^https?:\/\//,'').replace(/^www\./,'').split('/')[0]).filter(Boolean);
  const exclude=[...values(3,0),...values(3,1),...values(3,2),...values(3,3),...values(3,4),...values(3,7)];
  const advanced=(syntax.filter(Boolean).join(' ')||'B2B distributors manufacturers')+' companies businesses official website'+(blacklist.length?' '+[...new Set(blacklist)].map(v=>'-site:'+v).join(' '):'')+(exclude.length?' -'+exclude.map(v=>'"'+v+'"').join(' -'):'');
  const company=root.querySelector('[data-query-preview]'),personaNode=root.querySelector('[data-persona-preview]'),exclusion=root.querySelector('[data-exclusion-preview]'),syntaxNode=root.querySelector('[data-query-syntax]');
  if(company)company.textContent=format(selections.flatMap((items,index)=>[1,3,6].includes(index)?[]:items))||'选择企业属性和购买信号后，实时生成筛选条件';
  if(personaNode)personaNode.textContent=format(selections[1]||[])||'选择职位、决策权限、部门或资历层级';
  if(exclusion)exclusion.textContent=format([...(selections[3]||[]),...(selections[6]||[])])||'选择排除条件或域名黑名单';
  if(syntaxNode)syntaxNode.textContent=advanced;
  renderLocalMatches(root);
}

function splitValues(value) { return String(value || '').split(',').map(v => v.trim()).filter(Boolean); }
function renderLocalMatches(root) {
  const selected = {};
  root.querySelectorAll('.icp-layer .icp-field').forEach(field => {
    const label = field.querySelector('label')?.textContent?.trim();
    const value = field.querySelector('[data-icp-field]')?.value || '';
    if (label && value) selected[label] = splitValues(value);
  });
  const includes = (value, values) => values.some(v => String(value || '').toLocaleLowerCase().includes(v.toLocaleLowerCase()));
  const matches = leads.filter(lead => {
    const positive = [
      ['行业 / 细分领域', lead.industry],
      ['目标地理位置', lead.region || lead.data?.country_region],
      ['员工规模区间', lead.employeeRange || lead.size],
      ['营收区间', lead.revenue || lead.data?.revenue],
      ['公司类型', lead.companyType || lead.type],
      ['目标职位', lead.contactTitle],
    ];
    for (const [label, value] of positive) {
      const wanted = selected[label];
      if (wanted?.length && !includes(value, wanted)) return false;
    }
    const negative = [
      ['排除行业', lead.industry],
      ['排除公司类型', lead.companyType || lead.type],
      ['排除国家 / 地区', lead.region || lead.data?.country_region],
      ['排除规模', lead.employeeRange || lead.size],
    ];
    if (negative.some(([label, value]) => selected[label]?.length && includes(value, selected[label]))) return false;
    const blacklist = [
      ...(selected['排除渠道域名（黑名单）'] || []),
      ...(selected['自定义黑名单域名'] || []),
    ].map(v => v.toLowerCase().replace(/^https?:\/\//, '').replace(/^www\./, '').split('/')[0]);
    const domain = String(lead.domain || lead.website || '').toLowerCase().replace(/^www\./, '');
    if (domain && blacklist.some(d => d && (domain === d || domain.endsWith('.' + d)))) return false;
    const threshold = selected['ICP 匹配阈值']?.[0]?.match(/(\d+)/)?.[1];
    if (threshold && typeof lead.score === 'number' && lead.score < Number(threshold)) return false;
    return true;
  });
  const count = root.querySelector('[data-icp-match-count]');
  const sample = root.querySelector('[data-icp-sample]');
  if (count) count.textContent = `现有线索库匹配：${matches.length} 家`;
  if (sample) {
    const rows = matches.slice(0, 5);
    sample.innerHTML = rows.length ? rows.map(lead => `<cds-table-row><cds-table-cell>${escapeHtml(lead.companyName || lead.title || '未命名企业')}</cds-table-cell><cds-table-cell>${escapeHtml(lead.domain || lead.website || '—')}</cds-table-cell><cds-table-cell>${escapeHtml(lead.region || '—')}</cds-table-cell><cds-table-cell>${escapeHtml(lead.industry || '—')}</cds-table-cell><cds-table-cell>${escapeHtml(lead.employeeRange || '—')}</cds-table-cell><cds-table-cell>${escapeHtml(lead.score ?? '—')}</cds-table-cell></cds-table-row>`).join('') : '<cds-table-row><cds-table-cell colspan="6" class="icp-empty-match">暂无匹配记录；保存 ICP 后可在搜索 API 发现阶段获取新候选企业。</cds-table-cell></cds-table-row>';
  }
}

export function renderStep0() {
  const layersHtml = `<cds-accordion>${icpLayers.map((layer, i) => `
    <cds-accordion-item class="icp-layer" title="${escapeHtml(layer.title)}" ${i === 0 ? 'open' : ''}>
      <div class="icp-layer-body">
        <div class="icp-field-grid">
          ${layer.fields.map((field, fieldIndex) => {
            const key = `layer-${i}-field-${fieldIndex}`;
            return `<div class="icp-field"><label>${escapeHtml(field.label)}</label>${renderField(key, field.label)}</div>`;
          }).join('')}
        </div>
      </div>
    </cds-accordion-item>`).join('')}</cds-accordion>`;
  const queries = [
    ['企业筛选', 'data-query-preview'],
    ['联系人角色', 'data-persona-preview'],
    ['排除规则', 'data-exclusion-preview'],
  ];
  return `
    <cds-inline-notification class="notification" kind="info" title="ICP 配置说明" hide-close-button>以企业筛选、购买委员会、实时触发信号、商业匹配度、需求痛点、数据质量与评分反馈定义理想客户。保存后写入当前账号的 Supabase 数据库。</cds-inline-notification>
    <section class="icp-definition-section" aria-labelledby="icpDefinitionTitle">
      <div class="icp-section-heading"><div><h2 id="icpDefinitionTitle">ICP 定义</h2><p>八层筛选条件 · 企业属性、联系人、触发信号、商业匹配、需求痛点、数据质量与评分优化</p></div><div class="icp-section-actions"><cds-button class="btn btn-ghost btn-sm" type="button" id="resetIcpFields" kind="ghost" size="sm">清空条件</cds-button><cds-button class="btn btn-primary btn-sm" type="button" id="saveIcpFields" kind="primary" size="sm">保存 ICP</cds-button></div></div>
      <div class="stage-progress" data-icp-progress hidden aria-live="polite"><div class="stage-progress-heading"><span data-icp-progress-label>等待保存</span><strong data-icp-progress-percent>0%</strong></div><cds-inline-loading data-icp-progressbar status="active" description="等待保存"></cds-inline-loading><p class="stage-progress-detail" data-icp-progress-detail>等待执行</p></div>
      ${layersHtml}
    </section>
    <div class="two-col icp-support-grid">
      ${panelNoPad('实时查询预览', `<div class="generated-queries"><div class="generated-query"><span class="query-note">当前筛选</span><code data-query-preview>请先选择筛选条件</code></div><div class="generated-query"><span class="query-note">目标联系人</span><code data-persona-preview>选择职位、部门与资历层级</code></div><div class="generated-query"><span class="query-note">排除规则</span><code data-exclusion-preview>按需配置排除条件</code></div><div class="generated-query generated-query-syntax"><span class="query-note">最终高级搜索语法（实时拼接）</span><code data-query-syntax>B2B distributors manufacturers companies businesses official website</code></div><section class="query-translation" aria-label="搜索语法翻译"><div class="query-translation-heading"><div><strong>DeepL 搜索语法翻译</strong><p class="field-help">只翻译引号中的关键词；OR、site:、减号、括号、引号和域名等搜索语法保持原样。</p></div><div class="query-translation-controls"><div><label>目标语言</label><div class="cds-select" data-translation-select><cds-dropdown class="carbon-select-control" title-text="目标语言" label="英语（美国）" value="EN-US" data-translation-carbon><cds-dropdown-item value="EN-US" selected>英语（美国）</cds-dropdown-item><cds-dropdown-item value="EN-GB" >英语（英国）</cds-dropdown-item><cds-dropdown-item value="DE" >德语</cds-dropdown-item><cds-dropdown-item value="FR" >法语</cds-dropdown-item><cds-dropdown-item value="ES" >西班牙语</cds-dropdown-item><cds-dropdown-item value="IT" >意大利语</cds-dropdown-item><cds-dropdown-item value="NL" >荷兰语</cds-dropdown-item><cds-dropdown-item value="PL" >波兰语</cds-dropdown-item><cds-dropdown-item value="PT-BR" >葡萄牙语（巴西）</cds-dropdown-item><cds-dropdown-item value="JA" >日语</cds-dropdown-item><cds-dropdown-item value="KO" >韩语</cds-dropdown-item><cds-dropdown-item value="ZH" >中文</cds-dropdown-item><cds-dropdown-item value="SV" >瑞典语</cds-dropdown-item><cds-dropdown-item value="DA" >丹麦语</cds-dropdown-item><cds-dropdown-item value="FI" >芬兰语</cds-dropdown-item><cds-dropdown-item value="CS" >捷克语</cds-dropdown-item><cds-dropdown-item value="EL" >希腊语</cds-dropdown-item><cds-dropdown-item value="HU" >匈牙利语</cds-dropdown-item><cds-dropdown-item value="ID" >印尼语</cds-dropdown-item><cds-dropdown-item value="RO" >罗马尼亚语</cds-dropdown-item><cds-dropdown-item value="RU" >俄语</cds-dropdown-item><cds-dropdown-item value="TR" >土耳其语</cds-dropdown-item><cds-dropdown-item value="UK" >乌克兰语</cds-dropdown-item></cds-dropdown><input type="hidden" data-translation-language value="EN-US"></div><cds-button type="button" class="btn btn-primary btn-sm" data-translate-query kind="primary" size="sm">翻译搜索语法</cds-button></div></div><code class="translated-query-code" data-translated-query>配置并启用 DeepL API 后，可选择目标语言并翻译关键词。</code><p class="field-help" data-translation-status role="status">翻译结果可用于下一次企业搜索；修改 ICP 条件后需重新翻译。</p><input type="hidden" data-icp-field="translatedQuery" value=""><input type="hidden" data-icp-field="translatedSourceQuery" value=""><input type="hidden" data-icp-field="translatedLanguage" value="EN-US"></section></div><div class="icp-preview-table-wrap"><div class="icp-preview-table-heading"><strong data-icp-match-count>现有线索库匹配：加载中</strong><span class="field-help">基于当前账号已保存线索，不代表外部搜索总量</span></div><div class="cds-data-table-container"><cds-table class="data-table icp-preview-table"><cds-table-head><cds-table-header-row><cds-table-header-cell>企业</cds-table-header-cell><cds-table-header-cell>域名</cds-table-header-cell><cds-table-header-cell>地区</cds-table-header-cell><cds-table-header-cell>行业</cds-table-header-cell><cds-table-header-cell>员工规模</cds-table-header-cell><cds-table-header-cell>评分</cds-table-header-cell></cds-table-header-row></cds-table-head><cds-table-body data-icp-sample><cds-table-row><cds-table-cell colspan="6">正在读取当前账号线索…</cds-table-cell></cds-table-row></cds-table-body></cds-table></div></div>`)}
      <section class="panel icp-schema-panel"><div class="panel-header"><h2>AI 判定 Schema</h2><span class="panel-meta">结构化输出字段</span></div><div class="panel-body"><p class="field-help">Schema v2.0 · 仅允许定义字段；未知信息留空并标记缺失，关键字段附可访问证据 URL 与原文摘录。置信度统一为 0–1。</p><div class="field-tags">${Object.keys(aiSchema.properties).map(field => tag(field, 'blue')).join('')}</div><cds-accordion><cds-accordion-item title="查看完整 JSON Schema"><pre class="cds-code-snippet">${escapeHtml(JSON.stringify(aiSchema,null,2))}</pre></cds-accordion-item></cds-accordion><div class="model-picker-wrap"><label class="form-label">AI 模型</label>${modelSelect()}<p class="field-help">仅显示常用模型。实际调用前需在「API 与 AI 集成」配置对应服务及可用模型。</p></div></div></section>
    </div>`;
}
function bindSelects(root) {
 root.querySelectorAll('[data-select-wrap] cds-dropdown').forEach(dropdown=>{
  const hidden=dropdown.closest('[data-select-wrap]')?.querySelector('[data-icp-field]');
  dropdown.addEventListener('cds-dropdown-selected',event=>{if(hidden){hidden.value=String(event.detail?.item?.value??dropdown.value??'');hidden.dispatchEvent(new Event('change',{bubbles:true}));}queryPreview(root);});
  if(hidden&&hidden.value)dropdown.value=hidden.value;
 });
}
export function bindStep0(root) {
  bindSelects(root);
  bindKeywordTags(root);
  root.querySelector('[data-translation-select] cds-dropdown')?.addEventListener('cds-dropdown-selected',event=>{const val=event.detail?.item?.value||'EN-US';root.querySelector('[data-translation-language]').value=val;const translated=root.querySelector('[data-icp-field="translatedQuery"]');if(translated)translated.value='';const output=root.querySelector('[data-translated-query]');if(output)output.textContent='目标语言已变更，请重新翻译。';const status=root.querySelector('[data-translation-status]');if(status)status.textContent='请选择目标语言后重新翻译，避免使用旧语言结果。';});
  root.querySelector('[data-translate-query]')?.addEventListener('click', async event => {
    const button=event.currentTarget, source=root.querySelector('[data-query-syntax]')?.textContent||'';
    const target=root.querySelector('[data-translation-language]')?.value||'EN-US';
    const status=root.querySelector('[data-translation-status]'), output=root.querySelector('[data-translated-query]');
    const pattern=/"([^"]*)"/g, matches=[...source.matchAll(pattern)];
    if(!matches.length){status.textContent='当前语法没有可翻译的引号关键词。';return;}
    button.disabled=true;button.textContent='翻译中…';status.textContent='正在调用 DeepL；OR、site:、括号和域名等语法不会被翻译。';
    try {
      await loadIntegrations();
      const result=await integrationClient.call('deepl',{text:matches.map(match=>match[1]),target_lang:target});
      const translations=result.translations||[];
      if(translations.length!==matches.length)throw new Error('DeepL 返回的翻译数量与关键词数量不一致');
      let index=0;
      const translated=source.replace(pattern,()=>'"'+String(translations[index++]?.text||'').replace(/"/g,'')+'"');
      output.textContent=translated;
      root.querySelector('[data-icp-field="translatedQuery"]').value=translated;
      root.querySelector('[data-icp-field="translatedSourceQuery"]').value=source;
      root.querySelector('[data-icp-field="translatedLanguage"]').value=target;
      const {data:{user}}=await supabase.auth.getUser();if(!user)throw new Error('请先登录后保存翻译结果');
      const criteria={};root.querySelectorAll('[data-icp-field]').forEach(input=>{criteria[input.dataset.icpField]=input.value;});
      const {data:profile,error:profileError}=await supabase.from('icp_profiles').select('id').eq('user_id',user.id).order('updated_at',{ascending:false}).limit(1).maybeSingle();
      if(profileError)throw profileError;
      const payload={user_id:user.id,name:'默认 ICP',criteria,updated_at:new Date().toISOString()};
      const saved=profile?.id?await supabase.from('icp_profiles').update(payload).eq('id',profile.id).select('id').single():await supabase.from('icp_profiles').insert(payload).select('id').single();
      if(saved.error)throw saved.error;savedProfileId=saved.data.id;
      status.textContent='翻译完成并已保存。下一次企业搜索会在原始语法未变化时使用该翻译。';
      showToast('DeepL 翻译完成并已保存');
    } catch(error) {
      status.textContent=error.message||'翻译失败';showToast('DeepL 翻译失败：'+(error.message||'未知错误'));
    } finally {button.disabled=false;button.textContent='翻译搜索语法';}
  });
  root.querySelectorAll('.cds-multi').forEach(wrap=>{
    const control=wrap.querySelector('cds-multi-select');
    control?.addEventListener('cds-multi-select-selected',()=>{updateMultiLabel(wrap);queryPreview(root);});
    wrap.querySelector('[data-multi-clear]')?.addEventListener('click',()=>{
      wrap.querySelectorAll('cds-multi-select-item').forEach(item=>{item.selected=false;item.removeAttribute('selected');});
      control?.requestUpdate?.();updateMultiLabel(wrap);queryPreview(root);
    });
    wrap.querySelectorAll('[data-region]').forEach(button=>button.addEventListener('click',()=>{
      const names=REGIONS[button.dataset.region]||[];
      const items=[...wrap.querySelectorAll('cds-multi-select-item')].filter(item=>names.includes(item.value));
      const selectAll=items.some(item=>!item.selected&&!item.hasAttribute('selected'));
      items.forEach(item=>{item.selected=selectAll;if(selectAll)item.setAttribute('selected','');else item.removeAttribute('selected');});
      control?.requestUpdate?.();updateMultiLabel(wrap);queryPreview(root);
    }));
  });
  root.querySelectorAll('[data-fill-blacklist]').forEach(b=>b.addEventListener('click',()=>{const area=b.closest('.icp-blacklist').querySelector('cds-textarea');area.value=DEFAULT_DOMAIN_BLACKLIST;area.dispatchEvent(new Event('input',{bubbles:true}));}));
  root.querySelectorAll('.icp-blacklist textarea').forEach(area=>area.addEventListener('input',()=>{const n=area.value.split(/[\s,;]+/).filter(Boolean).length;area.closest('.icp-blacklist').querySelector('[data-blacklist-count]').textContent=n+' 个域名';queryPreview(root);}));
  root.querySelectorAll('.icp-domain-tags').forEach(wrap=>{const input=wrap.querySelector('[data-domain-input]'),hidden=wrap.querySelector('[data-icp-field]'),list=wrap.querySelector('[data-domain-chip-list]');const paint=()=>{const values=(hidden.value||'').split(',').filter(Boolean);list.innerHTML=values.map(v=>'<cds-tag class="icp-domain-chip" type="gray">'+escapeHtml(v)+'<cds-button type="button" data-remove-domain="'+escapeHtml(v)+'" kind="ghost">×</cds-button></cds-tag>').join('');list.querySelectorAll('[data-remove-domain]').forEach(b=>b.addEventListener('click',()=>{hidden.value=values.filter(v=>v!==b.dataset.removeDomain).join(',');paint();queryPreview(root);}));};const add=()=>{const v=input.value.trim().toLowerCase().replace(/^https?:\/\//,'').replace(/^www\./,'').split('/')[0];if(v&&!v.includes(' ')&&!hidden.value.split(',').includes(v)){hidden.value=[hidden.value,v].filter(Boolean).join(',');paint();queryPreview(root);}input.value='';};wrap.querySelector('[data-domain-add]').addEventListener('click',add);input.addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();add();}});paint();});
  queryPreview(root);
  loadLeads().then(() => queryPreview(root)).catch(error => { console.warn('加载 ICP 预览线索失败', error); });
  const modelWrap = root.querySelector('[data-select-wrap="aiModel"]');
  const icpProgress = root.querySelector('[data-icp-progress]');
  const updateIcpProgress = (percent, label, detailText) => {
    const value = Math.max(0, Math.min(100, Math.round(percent)));
    if (icpProgress) icpProgress.hidden = false;
    const bar=icpProgress?.querySelector('[data-icp-progressbar]'); if(bar)bar.setAttribute('description',label+' · '+detailText);
    const pct = icpProgress?.querySelector('[data-icp-progress-percent]');
    const title = icpProgress?.querySelector('[data-icp-progress-label]');
    const detail = icpProgress?.querySelector('[data-icp-progress-detail]');
    if (pct) pct.textContent = value + '%';
    if (title) title.textContent = label;
    if (detail) detail.textContent = detailText;
  };
  root.querySelector('#saveIcpFields')?.addEventListener('click', async () => {
    updateIcpProgress(10, '正在验证登录状态', '检查当前账号与数据库会话');
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) { updateIcpProgress(100, '保存失败', '登录状态已过期，请重新登录'); showToast('登录状态已过期，请重新登录'); return; }
    updateIcpProgress(35, '正在准备 ICP 条件', '读取所有筛选字段并提交数据库');
    const criteria = {};
    root.querySelectorAll('[data-icp-field]').forEach(input => { criteria[input.dataset.icpField] = input.value; });
    const payload = { user_id: user.id, name: '默认 ICP', criteria, updated_at: new Date().toISOString() };
    const button = root.querySelector('#saveIcpFields');
    button.disabled = true;
    try {
      let result;
      if (savedProfileId) result = await supabase.from('icp_profiles').update(payload).eq('id', savedProfileId).select('id').single();
      else result = await supabase.from('icp_profiles').insert(payload).select('id').single();
      if (result.error) throw result.error;
      savedProfileId = result.data.id;
      updateIcpProgress(100, 'ICP 保存完成', '筛选条件已写入当前账号的 Supabase 数据库');
      showToast('ICP 条件已保存到 Supabase');
    } catch (error) { updateIcpProgress(100, 'ICP 保存失败', error.message || '数据库错误'); showToast('保存失败：' + (error.message || '数据库错误')); }
    finally { button.disabled = false; }
  });
  root.querySelector('#resetIcpFields')?.addEventListener('click', async () => {
    root.querySelectorAll('[data-icp-field]').forEach(input => {
      input.value = '';
      const keywordWrap=input.closest('.icp-keyword-tags');if(keywordWrap){paintKeywordTags(keywordWrap);return;}
      const wrap = input.closest('.cds-select, .cds-multi');
      if (wrap?.matches('.cds-multi')) {
        wrap.querySelectorAll('cds-multi-select-item').forEach(option => { option.selected = false; option.removeAttribute('selected'); });
        const search = wrap.querySelector('.cds-multi-search'); if (search) search.value = '';
        updateMultiLabel(wrap); return;
      }
      if (!wrap) return;
      const dropdown=wrap.querySelector('cds-dropdown'); if(dropdown) dropdown.value='';
    });
    if (savedProfileId) {
      const { error } = await supabase.from('icp_profiles').delete().eq('id', savedProfileId);
      if (error) { showToast('清空数据库条件失败：' + error.message); return; }
      savedProfileId = null;
    }
    queryPreview(root);
    showToast('已清空当前 ICP 条件');
  });
  root.querySelectorAll('[data-icp-field]').forEach(input => { const refresh=()=>{if(!['translatedQuery','translatedSourceQuery','translatedLanguage'].includes(input.dataset.icpField)){const translated=root.querySelector('[data-icp-field="translatedQuery"]');if(translated)translated.value='';const output=root.querySelector('[data-translated-query]');if(output)output.textContent='条件已变更，请重新翻译后再搜索。';}queryPreview(root);};input.addEventListener('change',refresh);input.addEventListener('input',refresh); });
  supabase.auth.getUser().then(async ({ data: { user } }) => {
    if (!user) return;
    const { data, error } = await supabase.from('icp_profiles').select('id,criteria').eq('user_id', user.id).order('updated_at', { ascending: false }).limit(1).maybeSingle();
    if (error || !data) return;
    savedProfileId = data.id;
    Object.entries(data.criteria || {}).forEach(([key, value]) => {
      const input = root.querySelector(`[data-icp-field="${key}"]`);
      if (!input) return;
      input.value = String(value ?? '');
      const keywordWrap=input.closest('.icp-keyword-tags');if(keywordWrap){paintKeywordTags(keywordWrap);return;}
      if(input.dataset.icpField==='translatedQuery'){const output=root.querySelector('[data-translated-query]');if(output&&input.value)output.textContent=input.value;}
      if(input.dataset.icpField==='translatedLanguage'){const select=root.querySelector('[data-translation-select]');const dropdown=select?.querySelector('cds-dropdown');if(dropdown){dropdown.value=input.value;select.querySelector('[data-translation-language]').value=input.value;}}
      const wrap = input.closest('.cds-select, .cds-multi');
      if (wrap?.matches('.cds-multi')) {
        const values = input.value.split(',').map(value => value.trim());
        wrap.querySelectorAll('cds-multi-select-item').forEach(option => { option.selected = values.includes(option.value); if(option.selected) option.setAttribute('selected',''); else option.removeAttribute('selected'); });
        updateMultiLabel(wrap);
        const countNode = wrap.querySelector('[data-blacklist-count]');
        if (countNode) countNode.textContent = input.value.split(/[\s,;]+/).filter(Boolean).length + ' 个域名';
        return;
      }
      if (!wrap) return;
      const dropdown=wrap.querySelector('cds-dropdown'); if(dropdown) dropdown.value=input.value;
    });
    queryPreview(root);
  });
  if (modelWrap) {
    const stored = localStorage.getItem('euresis.icp.model');
    if (stored) {
      const hidden = modelWrap.querySelector('input[type="hidden"]');
      const dropdown=modelWrap.querySelector('cds-dropdown'); if(hidden && dropdown?.querySelector('cds-dropdown-item[value="'+CSS.escape(stored)+'"]')) { hidden.value=stored; dropdown.value=stored; }
    }
    modelWrap.querySelector('cds-dropdown')?.addEventListener('cds-dropdown-selected',event=>localStorage.setItem('euresis.icp.model',event.detail?.item?.value||''));
  }
}
