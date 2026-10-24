export const icpLayers = [
  {
    title: '第一层 · 企业属性（Firmographic）',
    fields: [
      { label: '行业 / 细分领域', value: '光伏分销' },
      { label: '员工规模区间', value: '50–200 人' },
      { label: '营收区间', value: '$5M–$50M' },
      { label: '成立年限', value: '≥ 3 年' },
      { label: '公司类型', value: '分销商 / 系统集成商' },
      { label: '地域 / 目标市场', value: 'DACH（DE/AT/CH）' },
      { label: '技术栈', value: 'Shopify / HubSpot' },
      { label: '是否上市', value: '否（排除上市）' },
      { label: '供应链角色', value: '一级 / 二级分销' },
    ],
  },
  {
    title: '第二层 · 联系人角色（Persona）',
    fields: [
      { label: '目标职位', value: '采购经理 / 运营总监 / CEO' },
      { label: '决策权限', value: '最终决策 / 影响者' },
      { label: '部门', value: '采购 / 运营 / 供应链' },
      { label: '资历层级', value: '总监及以上' },
      { label: '每公司联系人上限', value: '2–3 人' },
    ],
  },
  {
    title: '第三层 · 购买信号（Trigger Signals）',
    fields: [
      { label: '招聘信号', value: '采购/运营岗位招聘' },
      { label: '融资信号', value: '近 12 个月有融资' },
      { label: '扩张信号', value: '新市场 / 新办公室' },
      { label: '技术变更信号', value: '更换电商/CRM' },
      { label: '内容信号', value: '近期发布白皮书' },
      { label: '展会信号', value: 'Intersolar 参展' },
    ],
  },
  {
    title: '第四层 · 排除条件（Disqualifiers）',
    fields: [
      { label: '排除行业', value: '电商平台 / 论坛 / 媒体' },
      { label: '排除公司类型', value: '终端用户' },
      { label: '排除地域', value: '非 DACH' },
      { label: '排除规模', value: '<10 或 >1000 人' },
      { label: '排除状态', value: '已倒闭 / 被收购' },
    ],
  },
];

export const generatedQueries = [
  { q: '"photovoltaic" (distributor OR reseller) site:.de -forum -amazon', note: 'Q1 企业属性' },
  { q: 'site:.de "photovoltaic" ("we are hiring" OR "vertriebsmitarbeiter")', note: 'Q2 招聘信号' },
  { q: 'site:.de "photovoltaic" ("Shopify" OR "HubSpot")', note: 'Q3 技术栈' },
  { q: 'site:.de "photovoltaic" "Intersolar"', note: 'Q4 展会信号' },
];

export const aiSchema = [
  'icp_match', 'employee_range', 'revenue_range', 'company_type',
  'has_hiring_signal', 'has_funding_signal', 'tech_stack_matches',
  'has_whatsapp_link', 'facebook_page_url',
];
