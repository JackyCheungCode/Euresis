import { supabase } from '../services/supabase.js';

export const leads = [];
export async function loadLeads() {
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) { leads.splice(0, leads.length); return leads; }
  const data = [];
  const pageSize = 1000;
  for (let offset = 0; ; offset += pageSize) {
    const { data: page, error } = await supabase.from('leads').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).range(offset, offset + pageSize - 1);
    if (error) throw error;
    data.push(...(page || []));
    if (!page || page.length < pageSize) break;
  }
  const mapped = data.map(row => {
    const extra = row.data || {};
    let domain = row.website || '';
    try { domain = new URL(domain.startsWith('http') ? domain : 'https://' + domain).hostname; } catch {}
    return {
      id: row.id, userId: row.user_id, domain, rootDomain: row.root_domain || extra.root_domain || null, title: row.company_name || domain || '未命名企业',
      source: row.source || 'manual', region: row.country_region || '—', status: row.status || 'new',
      icp: extra.icp_match ?? null, size: row.employee_range || '—', revenue: extra.revenue || '—',
      type: row.company_type || '—', hiring: extra.hiring ?? null, funding: extra.funding ?? null,
      whatsapp: extra.whatsapp ?? null, facebook: extra.facebook || '—', phone: row.phone || '—',
      email: row.email || '—', phoneSource: extra.phoneSource || '—', lineType: extra.lineType || '—',
      waRegistered: extra.waRegistered ?? null, waName: extra.waName || '—', address: extra.address || '—',
      emailStatus: extra.emailStatus || 'pending', fundingRound: extra.fundingRound || '—',
      fundingRaised: extra.fundingRaised || '—', growth: extra.growth || '—', glassdoor: extra.glassdoor || '—',
      route: extra.route || '待分流', companyName: row.company_name, website: row.website, industry: row.industry,
      employeeRange: row.employee_range, companyType: row.company_type, contactName: row.contact_name,
      contactTitle: row.contact_title, score: row.score, data: extra, createdAt: row.created_at,
    };
  });
  leads.splice(0, leads.length, ...mapped);
  return leads;
}
