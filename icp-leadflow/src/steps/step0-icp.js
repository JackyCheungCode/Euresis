import { icpLayers, aiSchema } from '../data/icp.js';
import { optionsForField, optionLabel, optionValue, MARKET_OPTIONS } from '../data/icp-options.js';
import { panelNoPad } from '../components/panel.js';
import { tag } from '../components/tag.js';
import { showToast } from '../components/toast.js';
import { supabase } from '../services/supabase.js';

const escapeHtml = value => String(value ?? '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);
let savedProfileId = null;
const MODELS = [
  { value: 'gpt-4o-mini', label: 'OpenAI · gpt-4o-mini' },
  { value: 'gpt-4o', label: 'OpenAI · gpt-4o' },
  { value: 'claude-3-5-haiku-latest', label: 'Anthropic · Claude Haiku' },
  { value: 'claude-sonnet-4-20250514', label: 'Anthropic · Claude Sonnet 4' },
];
function renderSelect(key, options, selected, label) {
  const normalized = [{ value: '', label: '不限 / 请选择' }, ...options.map(option => ({
    value: String(optionValue(option)), label: optionLabel(option),
    flag: typeof option === 'object' ? option.flag : null,
  }))];
  const choice = normalized.find(option => option.value === String(selected ?? '')) || normalized[0];
  return `<div class="cds-select icp-carbon-select" data-select-wrap="${escapeHtml(key)}">
    <button type="button" class="cds-select-trigger" aria-haspopup="listbox" aria-expanded="false" aria-label="${escapeHtml(label)}">
      <span class="cds-select-current">${choice.flag ? `<span class="flag-circle" aria-hidden="true">${choice.flag}</span>` : ''}${escapeHtml(choice.label)}</span><span class="cds-select-chevron" aria-hidden="true">⌄</span>
    </button>
    <div class="cds-select-menu" role="listbox" aria-label="${escapeHtml(label)}" hidden>
      ${normalized.map(option => `<button type="button" class="cds-select-option" role="option" data-value="${escapeHtml(option.value)}" aria-selected="${option.value === choice.value}">${option.flag ? `<span class="flag-circle" aria-hidden="true">${option.flag}</span>` : ''}<span>${escapeHtml(option.label)}</span></button>`).join('')}
    </div>
    <input type="hidden" data-icp-field="${escapeHtml(key)}" value="${escapeHtml(choice.value)}">
  </div>`;
}
const DEFAULT_DOMAIN_BLACKLIST = 'alibaba.com, 1688.com, made-in-china.com, globalsources.com, china.cn, ec21.com, tradekey.com, dhgate.com, europages.com, kompass.com, thomasnet.com, indiamart.com, tradeindia.com, exportersindia.com, ecplaza.net, go4worldbusiness.com, linkedin.com, facebook.com, twitter.com, x.com, instagram.com, pinterest.com, tiktok.com, reddit.com, quora.com, medium.com, tumblr.com, weibo.com, youtube.com, vimeo.com, dailymotion.com, bilibili.com, twitch.tv, amazon.com, ebay.com, walmart.com, etsy.com, aliexpress.com, temu.com, wish.com, rakuten.com, crunchbase.com, zoominfo.com, dnb.com, bloomberg.com, owler.com, apollo.io, lusha.com, yelp.com, yellowpages.com, manta.com, bbb.org, trustpilot.com, glassdoor.com, wikipedia.org, wikidata.org, indeed.com, monster.com, ziprecruiter.com, simplyhired.com, 51job.com, zhaopin.com, eventbrite.com, 10times.com, prnewswire.com, businesswire.com, globenewswire.com, blogspot.com, wordpress.com, substack.com, craigslist.org, google.com, microsoft.com, apple.com, adobe.com, salesforce.com, hubspot.com, zoom.us, dropbox.com';
const MULTI_FIELDS = new Set(['行业 / 细分领域','目标职位','部门','排除行业','排除公司类型','排除规模','招聘信号','扩张信号','融资信号','技术变更信号']);
const REGIONS = {'北美':['加拿大','美国','墨西哥'],'东南亚':['文莱','柬埔寨','印度尼西亚','老挝','马来西亚','缅甸','菲律宾','新加坡','泰国','东帝汶','越南'],'东亚':['中国大陆','中国澳门','中国香港','中国台湾','日本','韩国','朝鲜','蒙古'],'南亚':['阿富汗','孟加拉国','不丹','印度','马尔代夫','尼泊尔','巴基斯坦','斯里兰卡'],'欧洲':['奥地利','比利时','丹麦','芬兰','法国','德国','希腊','爱尔兰','意大利','荷兰','挪威','波兰','葡萄牙','西班牙','瑞典','瑞士','英国'],'中东':['巴林','伊朗','伊拉克','以色列','约旦','科威特','阿曼','卡塔尔','沙特阿拉伯','土耳其','阿联酋'],'拉丁美洲':['阿根廷','巴西','智利','哥伦比亚','秘鲁','乌拉圭'],'非洲':['阿尔及利亚','埃及','加纳','肯尼亚','摩洛哥','尼日利亚','南非']};
function renderMultiSelect(key, options, label) {
 const normalized=options.map(o=>({value:String(optionValue(o)),label:optionLabel(o),flag:typeof o==='object'?o.flag:null}));
 return '<div class="cds-multi icp-multi" data-multi-wrap="'+escapeHtml(key)+'"><button type="button" class="cds-select-trigger" aria-expanded="false" aria-label="'+escapeHtml(label)+'"><span class="cds-multi-current">不限 / 请选择</span><span class="cds-select-chevron">⌄</span></button><div class="cds-multi-menu" hidden><input class="cds-text-input cds-multi-search" type="search" placeholder="搜索选项…"><div class="cds-multi-options">'+normalized.map(o=>'<label class="cds-multi-option">'+(o.flag?'<span class="flag-circle">'+o.flag+'</span>':'')+'<input type="checkbox" value="'+escapeHtml(o.value)+'"><span>'+escapeHtml(o.label)+'</span></label>').join('')+'</div><div class="cds-multi-footer"><button type="button" class="btn btn-ghost btn-sm" data-multi-clear>清除选择</button><button type="button" class="btn btn-primary btn-sm" data-multi-done>完成</button></div></div><input type="hidden" data-icp-field="'+escapeHtml(key)+'" value=""></div>';
}
function renderGeography(key,label) {
 const options=MARKET_OPTIONS.map(o=>'<label class="cds-multi-option" data-country="'+escapeHtml(o.value)+'"><span class="flag-circle">'+o.flag+'</span><input type="checkbox" value="'+escapeHtml(o.value)+'"><span>'+escapeHtml(o.label)+'</span></label>').join('');
 const regions=Object.keys(REGIONS).map(r=>'<button type="button" class="btn btn-ghost btn-sm" data-region="'+escapeHtml(r)+'">'+escapeHtml(r)+'</button>').join('');
 return '<div class="cds-multi icp-multi icp-geography" data-multi-wrap="'+escapeHtml(key)+'"><button type="button" class="cds-select-trigger" aria-expanded="false"><span class="cds-multi-current">选择大区或国家/地区（可多选）</span><span class="cds-select-chevron">⌄</span></button><div class="cds-multi-menu" hidden><input class="cds-text-input cds-multi-search" type="search" placeholder="搜索国家/地区…"><div class="cds-region-pills">'+regions+'</div><div class="cds-multi-options">'+options+'</div><div class="cds-multi-footer"><button type="button" class="btn btn-ghost btn-sm" data-multi-clear>清除选择</button><button type="button" class="btn btn-primary btn-sm" data-multi-done>完成</button></div></div><input type="hidden" data-icp-field="'+escapeHtml(key)+'" value=""></div>';
}
function renderField(key,label) {
 if(label==='目标地理位置'||label==='国家 / 地区'||label==='排除国家 / 地区') return renderGeography(key,label);
 if(label==='排除渠道域名（黑名单）') return '<div class="icp-blacklist"><textarea class="cds-textarea" rows="4" data-icp-field="'+escapeHtml(key)+'" placeholder="输入域名，使用逗号或换行分隔"></textarea><div class="icp-blacklist-actions"><button type="button" class="btn btn-ghost btn-sm" data-fill-blacklist>一键填充默认黑名单</button><span class="field-help" data-blacklist-count>0 个域名</span></div></div>';
 if(label==='自定义黑名单域名') return '<div class="icp-domain-tags"><div class="icp-domain-entry"><input class="cds-text-input" data-domain-input placeholder="competitor.com"><button type="button" class="btn btn-secondary btn-sm" data-domain-add>添加</button></div><div class="icp-domain-chip-list" data-domain-chip-list></div><input type="hidden" data-icp-field="'+escapeHtml(key)+'" value=""></div>';
 if(MULTI_FIELDS.has(label)) return renderMultiSelect(key,optionsForField(label),label);
 return renderSelect(key,optionsForField(label),'',label);
}
function updateMultiLabel(wrap) {
 const values=[...wrap.querySelectorAll('.cds-multi-options input:checked')].map(i=>i.value); const hidden=wrap.querySelector('[data-icp-field]'); if(hidden) hidden.value=values.join(', ');
 const current=wrap.querySelector('.cds-multi-current'); if(current) current.textContent=values.length?values.slice(0,3).join('、')+(values.length>3?' 等 '+values.length+' 项':''):'不限 / 请选择';
}
function modelSelect() {
  const selected = 'gpt-4o-mini';
  return renderSelect('aiModel', MODELS, selected, '选择 AI 模型');
}
function queryPreview(root) {
  const layers = [...root.querySelectorAll('.icp-layer')];
  const selections = layers.map(layer => [...layer.querySelectorAll('.icp-field')].map(field => ({
    label: field.querySelector('label')?.textContent?.trim() || '',
    value: field.querySelector('[data-icp-field]')?.value || '',
  })).filter(item => item.value && item.value !== '不限' && item.value !== '不排除'));
  const format = items => items.length
    ? items.map(item => `${item.label}：${item.value}`).join('；')
    : '';
  const companyTerms = [...(selections[0] || []), ...(selections[2] || [])];
  const company = root.querySelector('[data-query-preview]');
  const persona = root.querySelector('[data-persona-preview]');
  const exclusion = root.querySelector('[data-exclusion-preview]');
  if (company) company.textContent = format(companyTerms) || '选择行业、国家/地区、规模或购买信号后，实时生成筛选条件';
  if (persona) persona.textContent = format(selections[1] || []) || '选择目标职位、决策权限、部门或资历层级';
  if (exclusion) exclusion.textContent = format(selections[3] || []) || '选择需要排除的行业、地域、规模或状态';
}
export function renderStep0() {
  const layersHtml = icpLayers.map((layer, i) => `
    <section class="icp-layer ${i === 0 ? 'open' : ''}">
      <h3 class="icp-layer-heading"><button class="icp-layer-header" type="button" aria-expanded="${i === 0 ? 'true' : 'false'}"><span>${escapeHtml(layer.title)}</span><span class="icp-layer-chevron" aria-hidden="true">⌄</span></button></h3>
      <div class="icp-layer-body" ${i === 0 ? '' : 'hidden'}>
        <div class="icp-field-grid">
          ${layer.fields.map((field, fieldIndex) => {
            const key = `layer-${i}-field-${fieldIndex}`;
            return `<div class="icp-field"><label>${escapeHtml(field.label)}</label>${renderField(key, field.label)}</div>`;
          }).join('')}
        </div>
      </div>
    </section>`).join('');
  const queries = [
    ['企业筛选', 'data-query-preview'],
    ['联系人角色', 'data-persona-preview'],
    ['排除规则', 'data-exclusion-preview'],
  ];
  return `
    <div class="notification"><span class="notif-icon" aria-hidden="true">i</span><div>定义你的目标客户标准。行业、员工区间、公司类型、国家/地区及其余可枚举字段均使用 Carbon 风格自定义选择器；保存后将写入当前账号的 Supabase 数据库。</div></div>
    <section class="icp-definition-section" aria-labelledby="icpDefinitionTitle">
      <div class="icp-section-heading"><div><h2 id="icpDefinitionTitle">ICP 定义</h2><p>四层筛选条件 · 按需选择，无需手动输入</p></div><div class="icp-section-actions"><button class="btn btn-ghost btn-sm" type="button" id="resetIcpFields">清空条件</button><button class="btn btn-primary btn-sm" type="button" id="saveIcpFields">保存 ICP</button></div></div>
      <div class="stage-progress" data-icp-progress hidden aria-live="polite"><div class="stage-progress-heading"><span data-icp-progress-label>等待保存</span><strong data-icp-progress-percent>0%</strong></div><div class="stage-progress-track" role="progressbar" aria-label="ICP 保存任务进度" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0" data-icp-progressbar><span data-icp-progress-fill></span></div><p class="stage-progress-detail" data-icp-progress-detail>等待执行</p></div>
      ${layersHtml}
    </section>
    <div class="two-col icp-support-grid">
      ${panelNoPad('实时查询预览', `<div class="generated-queries"><div class="generated-query"><span class="query-note">当前筛选</span><code data-query-preview>请先选择筛选条件</code></div><div class="generated-query"><span class="query-note">目标联系人</span><code data-persona-preview>选择职位、部门与资历层级</code></div><div class="generated-query"><span class="query-note">排除规则</span><code data-exclusion-preview>按需配置排除条件</code></div></div>`)}
      <section class="panel icp-schema-panel"><div class="panel-header"><h2>AI 判定 Schema</h2><span class="panel-meta">结构化输出字段</span></div><div class="panel-body"><div class="field-tags">${aiSchema.map(field => tag(field, 'blue')).join('')}</div><div class="model-picker-wrap"><label class="form-label">AI 模型</label>${modelSelect()}<p class="field-help">仅显示常用模型。实际调用前需在「API 与 AI 集成」配置对应服务及可用模型。</p></div></div></section>
    </div>`;
}
function updateSelectedLabel(wrap, option) {
  const label = wrap.querySelector('.cds-select-current');
  label.innerHTML = '';
  if (option.querySelector('.flag-circle')) label.append(option.querySelector('.flag-circle').cloneNode(true));
  const text = document.createElement('span');
  text.textContent = option.querySelector('span:last-child')?.textContent || option.textContent.trim();
  label.append(text);
}
function bindSelects(root) {
  root.querySelectorAll('.cds-select-trigger').forEach(trigger => trigger.addEventListener('click', () => {
    const wrap = trigger.closest('.cds-select');
    const menu = wrap.querySelector('.cds-select-menu');
    const willOpen = menu.hidden;
    root.querySelectorAll('.cds-select-menu').forEach(other => {
      other.hidden = true;
      other.closest('.cds-select').querySelector('.cds-select-trigger').setAttribute('aria-expanded', 'false');
    });
    menu.hidden = !willOpen;
    trigger.setAttribute('aria-expanded', String(willOpen));
  }));
  root.querySelectorAll('.cds-select-option').forEach(option => option.addEventListener('click', () => {
    const wrap = option.closest('.cds-select');
    const field = wrap.querySelector('input[type="hidden"]');
    field.value = option.dataset.value;
    updateSelectedLabel(wrap, option);
    wrap.querySelector('.cds-select-menu').hidden = true;
    wrap.querySelector('.cds-select-trigger').setAttribute('aria-expanded', 'false');
    wrap.querySelectorAll('.cds-select-option').forEach(item => item.setAttribute('aria-selected', String(item === option)));
    queryPreview(root);
  }));
}
export function bindStep0(root) {
  bindSelects(root);
  root.querySelectorAll('.cds-multi').forEach(wrap=>{
    const trigger=wrap.querySelector('.cds-select-trigger'),menu=wrap.querySelector('.cds-multi-menu');
    trigger.addEventListener('click',()=>{const opening=menu.hidden;root.querySelectorAll('.cds-multi-menu').forEach(m=>{m.hidden=true;m.closest('.cds-multi').querySelector('.cds-select-trigger').setAttribute('aria-expanded','false');});menu.hidden=!opening;trigger.setAttribute('aria-expanded',String(opening));});
    wrap.querySelectorAll('.cds-multi-options input').forEach(i=>i.addEventListener('change',()=>{updateMultiLabel(wrap);queryPreview(root);}));
    wrap.querySelector('[data-multi-clear]')?.addEventListener('click',()=>{wrap.querySelectorAll('.cds-multi-options input').forEach(i=>i.checked=false);updateMultiLabel(wrap);queryPreview(root);});
    wrap.querySelector('[data-multi-done]')?.addEventListener('click',()=>{menu.hidden=true;trigger.setAttribute('aria-expanded','false');});
    wrap.querySelector('.cds-multi-search')?.addEventListener('input',e=>{const q=e.target.value.toLocaleLowerCase();wrap.querySelectorAll('.cds-multi-option').forEach(row=>row.hidden=!row.textContent.toLocaleLowerCase().includes(q));});
    wrap.querySelectorAll('[data-region]').forEach(button=>button.addEventListener('click',()=>{const names=REGIONS[button.dataset.region]||[];const inputs=[...wrap.querySelectorAll('.cds-multi-options input')].filter(i=>names.includes(i.value));const selectAll=inputs.some(i=>!i.checked);inputs.forEach(i=>i.checked=selectAll);updateMultiLabel(wrap);queryPreview(root);}));
  });
  root.querySelectorAll('[data-fill-blacklist]').forEach(b=>b.addEventListener('click',()=>{const area=b.closest('.icp-blacklist').querySelector('textarea');area.value=DEFAULT_DOMAIN_BLACKLIST;area.dispatchEvent(new Event('input',{bubbles:true}));}));
  root.querySelectorAll('.icp-blacklist textarea').forEach(area=>area.addEventListener('input',()=>{const n=area.value.split(/[\\s,;]+/).filter(Boolean).length;area.closest('.icp-blacklist').querySelector('[data-blacklist-count]').textContent=n+' 个域名';queryPreview(root);}));
  root.querySelectorAll('.icp-domain-tags').forEach(wrap=>{const input=wrap.querySelector('[data-domain-input]'),hidden=wrap.querySelector('[data-icp-field]'),list=wrap.querySelector('[data-domain-chip-list]');const paint=()=>{const values=(hidden.value||'').split(',').filter(Boolean);list.innerHTML=values.map(v=>'<span class="icp-domain-chip">'+escapeHtml(v)+'<button type="button" data-remove-domain="'+escapeHtml(v)+'">×</button></span>').join('');list.querySelectorAll('[data-remove-domain]').forEach(b=>b.addEventListener('click',()=>{hidden.value=values.filter(v=>v!==b.dataset.removeDomain).join(',');paint();queryPreview(root);}));};const add=()=>{const v=input.value.trim().toLowerCase().replace(/^https?:\\/\\//,'').replace(/^www\\./,'').split('/')[0];if(v&&!v.includes(' ')&&!hidden.value.split(',').includes(v)){hidden.value=[hidden.value,v].filter(Boolean).join(',');paint();queryPreview(root);}input.value='';};wrap.querySelector('[data-domain-add]').addEventListener('click',add);input.addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();add();}});paint();});
  queryPreview(root);
  root.querySelectorAll('.icp-layer-header').forEach(button => button.addEventListener('click', () => {
    const layer = button.closest('.icp-layer');
    const body = layer.querySelector('.icp-layer-body');
    const open = button.getAttribute('aria-expanded') !== 'true';
    button.setAttribute('aria-expanded', String(open));
    layer.classList.toggle('open', open);
    body.hidden = !open;
  }));
  const modelWrap = root.querySelector('[data-select-wrap="aiModel"]');
  const icpProgress = root.querySelector('[data-icp-progress]');
  const updateIcpProgress = (percent, label, detailText) => {
    const value = Math.max(0, Math.min(100, Math.round(percent)));
    if (icpProgress) icpProgress.hidden = false;
    icpProgress?.querySelector('[data-icp-progress-fill]')?.style.setProperty('width', value + '%');
    icpProgress?.querySelector('[data-icp-progressbar]')?.setAttribute('aria-valuenow', String(value));
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
      const wrap = input.closest('.cds-select, .cds-multi');
      if (wrap?.matches('.cds-multi')) {
        wrap.querySelectorAll('.cds-multi-options input').forEach(option => { option.checked = false; option.closest('label').hidden = false; });
        const search = wrap.querySelector('.cds-multi-search'); if (search) search.value = '';
        updateMultiLabel(wrap); return;
      }
      if (!wrap) return;
      const first = wrap.querySelector('.cds-select-option[data-value=""]');
      if (first) { updateSelectedLabel(wrap, first); wrap.querySelectorAll('.cds-select-option').forEach(item => item.setAttribute('aria-selected', String(item === first))); }
    });
    if (savedProfileId) {
      const { error } = await supabase.from('icp_profiles').delete().eq('id', savedProfileId);
      if (error) { showToast('清空数据库条件失败：' + error.message); return; }
      savedProfileId = null;
    }
    queryPreview(root);
    showToast('已清空当前 ICP 条件');
  });
  root.querySelectorAll('[data-icp-field]').forEach(input => { input.addEventListener('change',()=>queryPreview(root)); input.addEventListener('input',()=>queryPreview(root)); });
  supabase.auth.getUser().then(async ({ data: { user } }) => {
    if (!user) return;
    const { data, error } = await supabase.from('icp_profiles').select('id,criteria').eq('user_id', user.id).order('updated_at', { ascending: false }).limit(1).maybeSingle();
    if (error || !data) return;
    savedProfileId = data.id;
    Object.entries(data.criteria || {}).forEach(([key, value]) => {
      const input = root.querySelector(`[data-icp-field="${key}"]`);
      if (!input) return;
      input.value = String(value ?? '');
      const wrap = input.closest('.cds-select, .cds-multi');
      if (wrap?.matches('.cds-multi')) {
        const values = input.value.split(',').map(value => value.trim());
        wrap.querySelectorAll('.cds-multi-options input').forEach(option => { option.checked = values.includes(option.value); });
        updateMultiLabel(wrap);
        const countNode = wrap.querySelector('[data-blacklist-count]');
        if (countNode) countNode.textContent = input.value.split(/[\\s,;]+/).filter(Boolean).length + ' 个域名';
        return;
      }
      if (!wrap) return;
      const option = [...wrap.querySelectorAll('.cds-select-option')].find(item => item.dataset.value === input.value);
      if (option) {
        updateSelectedLabel(wrap, option);
        wrap.querySelectorAll('.cds-select-option').forEach(item => item.setAttribute('aria-selected', String(item === option)));
      }
    });
    queryPreview(root);
  });
  if (modelWrap) {
    const stored = localStorage.getItem('euresis.icp.model');
    if (stored) {
      const hidden = modelWrap.querySelector('input[type="hidden"]');
      const option = [...modelWrap.querySelectorAll('.cds-select-option')].find(item => item.dataset.value === stored);
      if (hidden && option) {
        hidden.value = stored;
        updateSelectedLabel(modelWrap, option);
      }
    }
    modelWrap.querySelectorAll('.cds-select-option').forEach(option => option.addEventListener('click', () => localStorage.setItem('euresis.icp.model', option.dataset.value)));
  }
}
