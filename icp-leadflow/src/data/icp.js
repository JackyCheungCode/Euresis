export const icpLayers = [
  { title: '第一层 · 企业属性（Firmographic）', fields: [
    { label: '行业 / 细分领域' }, { label: '员工规模区间' }, { label: '营收区间' }, { label: '成立年限' },
    { label: '公司类型' }, { label: '国家 / 地区' }, { label: '技术栈' }, { label: '是否上市' }, { label: '供应链角色' },
  ]},
  { title: '第二层 · 联系人角色（Persona）', fields: [
    { label: '目标职位' }, { label: '决策权限' }, { label: '部门' }, { label: '资历层级' }, { label: '每公司联系人上限' },
  ]},
  { title: '第三层 · 购买信号（Trigger Signals）', fields: [
    { label: '招聘信号' }, { label: '融资信号' }, { label: '扩张信号' }, { label: '技术变更信号' }, { label: '内容信号' }, { label: '展会信号' },
  ]},
  { title: '第四层 · 排除条件（Disqualifiers）', fields: [
    { label: '排除行业' }, { label: '排除公司类型' }, { label: '排除地域' }, { label: '排除规模' }, { label: '排除状态' },
  ]},
];

export const aiSchema = [
  'company_name','domain','industry','employee_range','country_region','company_type','supply_chain_role',
  'icp_match','icp_score','contact_name','contact_title','email','phone','email_status','phone_type',
  'whatsapp_registered','hiring_signal','funding_signal','expansion_signal','technology_stack',
  'research_summary','source_url','confidence','disqualifiers',
];
