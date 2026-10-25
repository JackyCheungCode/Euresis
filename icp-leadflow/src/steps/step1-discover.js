import { leads, loadLeads } from '../data/lead.js';
import { panelNoPad, panel } from '../components/panel.js';
import { tag, statusTag } from '../components/tag.js';
import { integrationClient, listIntegrations, loadIntegrations } from '../services/integrations.js';
import { supabase } from '../services/supabase.js';
import { showToast } from '../components/toast.js';

const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function renderStep1() {
  const rows = leads.map((lead, index) => [
    index + 1, '<span class="mono">'+esc(lead.domain)+'</span>', esc(lead.title),
    tag(lead.source || '—', 'gray'), esc(lead.region || '—'), statusTag(lead.status || 'new'),
  ]);
  const empty = leads.length ? '' : '<div class="empty-state"><h3>还没有候选企业</h3><p>先在「企业 ICP」保存目标市场，然后在「API 和 AI 集成」启用 Serper 或 Tavily。</p></div>';
  return `
    <div class="notification"><span class="notif-icon">i</span><div>搜索只负责发现候选企业；联系方式补全与企业背调必须在后续页面手动选择记录后执行。系统会按企业根域名去重，并记录每次搜索的数量、来源和去重结果。</div></div>
    <section class="panel discover-panel"><div class="panel-header"><div><h2>候选企业发现</h2><p class="panel-meta">搜索服务 · ICP 条件驱动</p></div><button type="button" id="discoverLeads" class="btn btn-primary btn-sm">运行企业搜索</button></div>
      <div class="panel-body"><div class="discover-controls"><label class="form-group"><span class="form-label">本次目标返回数量</span><div class="cds-select discover-limit-select"><button type="button" class="cds-select-trigger" id="discoverLimitTrigger" aria-expanded="false"><span id="discoverLimitLabel">10 条</span><span class="cds-select-chevron">⌄</span></button><div class="cds-select-menu" id="discoverLimitMenu" hidden><button type="button" class="cds-select-option" data-limit="10">10 条</button><button type="button" class="cds-select-option" data-limit="20">20 条</button><button type="button" class="cds-select-option" data-limit="50">50 条</button><button type="button" class="cds-select-option" data-limit="100">100 条</button></div><input type="hidden" id="discoverLimit" value="10"></div></label><p class="field-help">Serper 单次最多请求 100 条；Tavily 单次最多请求 20 条。实际数量受搜索服务返回结果影响。</p></div>
      <p id="discoverMessage" class="field-help">选择本次数量后运行搜索。重复企业会被跳过，不会再次创建。</p>
      <div class="stage-progress" id="discoverProgress" hidden aria-live="polite"><div class="stage-progress-heading"><span id="discoverProgressLabel">等待搜索任务开始</span><strong id="discoverProgressPercent">0%</strong></div><div class="stage-progress-track" role="progressbar" aria-label="候选发现任务进度" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0" id="discoverProgressBar"><span id="discoverProgressFill"></span></div><p class="stage-progress-detail" id="discoverProgressDetail">等待执行</p></div></div></section>
    ${panelNoPad('候选企业列表', rows.length ? table(['#','企业域名','企业名称','来源','市场','状态'], rows, '候选企业') : empty, `${leads.length} 条数据库记录`)}
    ${panel('数据来源', '<p class="helper-copy">Serper 用于 Google 搜索结果发现；Tavily 用于网页搜索与研究。搜索日志会记录查询语法、目标数量、返回数量、新增数量、重复数量、服务及错误原因。</p>')}
  `;
}
export function bindStep1(root) {
  const button=root.querySelector('#discoverLeads'), message=root.querySelector('#discoverMessage'), limitInput=root.querySelector('#discoverLimit');
  const limitTrigger=root.querySelector('#discoverLimitTrigger'), limitMenu=root.querySelector('#discoverLimitMenu');
  limitTrigger?.addEventListener('click',()=>{limitMenu.hidden=!limitMenu.hidden;limitTrigger.setAttribute('aria-expanded',String(!limitMenu.hidden));});
  root.querySelectorAll('[data-limit]').forEach(option=>option.addEventListener('click',()=>{limitInput.value=option.dataset.limit;root.querySelector('#discoverLimitLabel').textContent=option.dataset.limit+' 条';limitMenu.hidden=true;limitTrigger.setAttribute('aria-expanded','false');root.querySelectorAll('[data-limit]').forEach(item=>item.setAttribute('aria-selected',String(item===option)));}));
  const progress=root.querySelector('#discoverProgress'), progressBar=root.querySelector('#discoverProgressBar'), progressFill=root.querySelector('#discoverProgressFill'), progressLabel=root.querySelector('#discoverProgressLabel'), progressPercent=root.querySelector('#discoverProgressPercent'), progressDetail=root.querySelector('#discoverProgressDetail');
  const updateProgress=(percent,label,detail)=>{const value=Math.max(0,Math.min(100,Math.round(percent)));progress.hidden=false;progressFill.style.width=value+'%';progressBar.setAttribute('aria-valuenow',String(value));progressPercent.textContent=value+'%';progressLabel.textContent=label;progressDetail.textContent=detail;};
  const rootDomain=value=>{
    try {
      let host=new URL(value.startsWith('http')?value:'https://'+value).hostname.toLowerCase().replace(/^www\./,'').replace(/\.$/,'');
      if(/^\d{1,3}(\.\d{1,3}){3}$/.test(host)||host.includes(':')) return host;
      const bits=host.split('.');
      const compound=['co.uk','org.uk','ac.uk','com.au','net.au','org.au','co.nz','com.cn','net.cn','com.sg','com.hk','co.jp','com.br','com.in','co.in','com.mx','com.tr','co.za','com.pl','com.tw','com.my'];
      const suffix=bits.slice(-2).join('.');
      return bits.length>=3&&compound.includes(suffix)?bits.slice(-3).join('.'):bits.slice(-2).join('.');
    } catch { return ''; }
  };
  const splitValues=value=>String(value||'').split(/[,;\n]+/).map(x=>x.trim()).filter(Boolean);
  const blockedDomain=(host,blacklist)=>blacklist.some(domain=>host===domain||host.endsWith('.'+domain));
  button?.addEventListener('click',async()=>{
    button.disabled=true;let runId=null,logId=null;button.textContent='正在搜索…';
    const requested=Math.max(1,Math.min(100,Number(limitInput.value)||10));
    message.textContent='正在读取 ICP 条件并检查搜索服务…';updateProgress(0,'正在准备搜索任务','验证登录、读取 ICP 条件、检查服务配置');
    const startedAt=new Date().toISOString();
    try{
      const {data:{user},error:userError}=await supabase.auth.getUser();if(userError||!user)throw new Error('登录状态已失效，请重新登录');
      const {data:profile,error:profileError}=await supabase.from('icp_profiles').select('id,criteria').eq('user_id',user.id).order('updated_at',{ascending:false}).limit(1).maybeSingle();if(profileError)throw profileError;
      const criteria=profile?.criteria||{};
      const labels=Object.entries(criteria).filter(([k,v])=>String(v||'').trim()&&k!=='aiModel').map(([k,v])=>({key:k,value:String(v)}));
      const get=(layer,index)=>String(criteria['layer-'+layer+'-field-'+index]||'').trim();
      const included=[get(0,0),get(0,4),get(0,5),get(0,8),get(0,9),get(0,10),get(0,11),get(0,12),get(2,0),get(2,1),get(2,2),get(2,3)].filter(Boolean).flatMap(splitValues);
      const excluded=[get(3,0),get(3,1),get(3,2),get(3,3),get(3,4)].filter(Boolean).flatMap(splitValues);
      const blacklist=[...splitValues(get(3,5)),...splitValues(get(3,6))].map(x=>rootDomain(x)||x.toLowerCase().replace(/^www\./,''));
      const queryParts=[];
      const industry=splitValues(get(0,0));if(industry.length)queryParts.push('('+industry.map(x=>'"'+x+'"').join(' OR ')+')');
      const geo=splitValues(get(0,5));if(geo.length)queryParts.push('('+geo.map(x=>'"'+x+'"').join(' OR ')+')');
      const roles=splitValues(get(0,8));if(roles.length)queryParts.push('('+roles.map(x=>'"'+x+'"').join(' OR ')+')');
      const product=splitValues(get(0,11));if(product.length)queryParts.push('('+product.map(x=>'"'+x+'"').join(' OR ')+')');
      const query=(queryParts.length?queryParts.join(' '):'B2B companies distributors manufacturers')+' companies businesses official website';
      const finalQuery=query.trim()+(blacklist.length?' '+[...new Set(blacklist)].map(d=>'-site:'+d).join(' '):'');
      await loadIntegrations();const configs=listIntegrations();const provider=configs.find(x=>x.id==='serper'&&x.enabled)||configs.find(x=>x.id==='tavily'&&x.enabled);
      if(!provider)throw new Error('请先在「API 和 AI 集成」保存并启用 Serper 或 Tavily');
      const effectiveLimit=provider.id==='tavily'?Math.min(requested,20):requested;
      const {data:run,error:runError}=await supabase.from('workflow_runs').insert({user_id:user.id,workflow_key:'discover',current_step:1,status:'running',input:{query:finalQuery,requested_limit:requested,effective_limit:effectiveLimit,provider:provider.id,started_at:startedAt,icp_profile_id:profile?.id||null},output:{}}).select('id').single();if(runError)throw runError;runId=run.id;
      const {data:log,error:logError}=await supabase.from('lead_activity_logs').insert({user_id:user.id,workflow_run_id:runId,action:'discover',provider:provider.id,status:'running',input:{query:finalQuery,requested_limit:requested,effective_limit:effectiveLimit,icp_profile_id:profile?.id||null,started_at:startedAt},output:{}}).select('id').single();if(logError)throw logError;logId=log.id;
      updateProgress(25,'正在调用搜索服务',provider.id+' · 请求 '+effectiveLimit+' 条');
      const response=await integrationClient.call(provider.id,provider.id==='serper'?{query:finalQuery,num:effectiveLimit}:{query:finalQuery,max_results:effectiveLimit,search_depth:'advanced',include_answer:false});
      updateProgress(60,'搜索结果已返回','正在规范化域名、检查现有线索并去重');
      const results=provider.id==='serper'?(response.organic||[]):(response.results||[]);
      const existingRoots=new Set(leads.map(lead=>rootDomain(lead.domain||lead.website)).filter(Boolean));
      const seen=new Set();let duplicateCount=0;
      const records=results.map(item=>{
        const sourceUrl=item.link||item.url||'';const domain=rootDomain(sourceUrl);if(!domain)return null;
        if(existingRoots.has(domain)||seen.has(domain)||blockedDomain(domain,blacklist)){duplicateCount++;return null;}
        seen.add(domain);
        const companyName=String(item.title||domain).replace(/\s*[|–—-]\s*.*$/,'').trim().slice(0,240)||domain;
        return {user_id:user.id,root_domain:domain,company_name:companyName,website:'https://'+domain+'/',country_region:geo.join(', ')||null,industry:industry.join(', ')||null,employee_range:splitValues(get(0,1)).join(', ')||null,company_type:splitValues(get(0,4)).join(', ')||null,supply_chain_role:roles.join(', ')||null,source:provider.id,status:'new',data:{root_domain:domain,source_url:sourceUrl,snippet:item.snippet||item.content||'',search_query:finalQuery,search_position:item.position||null,discovered_at:new Date().toISOString()},updated_at:new Date().toISOString()};
      }).filter(Boolean);
      const saved=records.length?await supabase.from('leads').upsert(records,{onConflict:'user_id,root_domain',ignoreDuplicates:true}).select('id'): {data:[],error:null};
      if(saved.error)throw saved.error;
      const savedCount=(saved.data||[]).length;
      await loadLeads();
      const summary={provider:provider.id,query:finalQuery,requested_count:requested,effective_limit:effectiveLimit,returned_count:results.length,new_count:savedCount,duplicate_count:duplicateCount,filtered_count:Math.max(0,results.length-records.length-duplicateCount),completed_at:new Date().toISOString()};
      message.textContent='搜索完成：API 返回 '+results.length+' 条；新增 '+savedCount+' 条；重复/已存在/黑名单 '+duplicateCount+' 条。'+(effectiveLimit<requested?' 当前服务单次上限为 '+effectiveLimit+' 条。':'');
      updateProgress(100,'搜索任务已完成','API 返回 '+results.length+' · 新增 '+savedCount+' · 重复/过滤 '+(results.length-savedCount));
      await supabase.from('workflow_runs').update({status:'completed',output:summary,updated_at:new Date().toISOString()}).eq('id',runId).eq('user_id',user.id);
      if(logId)await supabase.from('lead_activity_logs').update({status:'completed',output:summary,completed_at:new Date().toISOString()}).eq('id',logId).eq('user_id',user.id);
      showToast('搜索完成：新增 '+savedCount+' 条，跳过重复 '+duplicateCount+' 条');document.dispatchEvent(new CustomEvent('euresis:leads-updated'));
    }catch(error){
      const {data:{user}}=await supabase.auth.getUser();
      if(runId&&user)await supabase.from('workflow_runs').update({status:'failed',error_message:error.message||'搜索失败',output:{requested_count:requested,provider:'unknown',completed_at:new Date().toISOString()},updated_at:new Date().toISOString()}).eq('id',runId).eq('user_id',user.id);
      if(logId&&user)await supabase.from('lead_activity_logs').update({status:'failed',error_message:error.message||'搜索失败',output:{requested_count:requested},completed_at:new Date().toISOString()}).eq('id',logId).eq('user_id',user.id);
      message.textContent=error.message||'搜索失败';updateProgress(100,'搜索任务失败',error.message||'搜索失败');showToast('企业搜索失败：'+(error.message||'未知错误'));
    }finally{button.disabled=false;button.textContent='运行企业搜索';}
  });
}
