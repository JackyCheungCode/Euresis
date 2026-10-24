export const icpLayers = [
  { title: '第一层 · 企业属性（Firmographic）', fields: [
    { label: '行业 / 细分领域' }, { label: '员工规模区间' }, { label: '营收区间' }, { label: '成立年限' },
    { label: '公司类型' }, { label: '目标地理位置' }, { label: '技术栈' }, { label: '是否上市' }, { label: '供应链角色' },\n    { label: '融资阶段' }, { label: '商业模式' }, { label: '产品 / 服务类别' }, { label: '目标客户市场' },
  ]},
  { title: '第二层 · 联系人角色（Persona）', fields: [
    { label: '目标职位' }, { label: '决策权限' }, { label: '部门' }, { label: '资历层级' }, { label: '每公司联系人上限' },\n    { label: '购买委员会角色' }, { label: '采购决策流程' },
  ]},
  { title: '第三层 · 购买信号（Trigger Signals）', fields: [
    { label: '招聘信号' }, { label: '融资信号' }, { label: '扩张信号' }, { label: '技术变更信号' }, { label: '内容信号' }, { label: '展会信号' },\n    { label: '购买意向行为' }, { label: '产品发布信号' },
  ]},
  { title: '第四层 · 排除条件（Disqualifiers）', fields: [
    { label: '排除行业' }, { label: '排除公司类型' }, { label: '排除国家 / 地区' }, { label: '排除规模' }, { label: '排除状态' }, { label: '排除渠道域名（黑名单）' }, { label: '自定义黑名单域名' },\n  ]},\n  { title: '第五层 · 商业匹配度（Commercial Fit）', fields: [\n    { label: '预算区间' }, { label: '采购周期' }, { label: '最低交易规模' }, { label: '目标毛利区间' }, { label: '销售覆盖区域' }, { label: '客户价值等级' },\n  ]},\n  { title: '第六层 · 需求与痛点（Needs & Pains）', fields: [\n    { label: '核心痛点' }, { label: '解决方案需求' }, { label: '业务优先级' }, { label: '当前替代方案' }, { label: '预期成果' },\n  ]},\n  { title: '第七层 · 数据质量与合规（Data Quality）', fields: [\n    { label: '最低数据质量要求' }, { label: '网站状态要求' }, { label: '联系人信息要求' }, { label: '合规排除规则' },\n  ]},\n  { title: '第八层 · 评分与优化（Scoring & Feedback）', fields: [\n    { label: 'ICP 匹配阈值' }, { label: '购买意向阈值' }, { label: '信号时效窗口' }, { label: '每批线索上限' }, { label: '评分策略' },\n  ]},
  ]},
];

export const aiSchema = [
  'company_name','domain','industry','employee_range','country_region','company_type','supply_chain_role',
  'icp_match','icp_score','contact_name','contact_title','email','phone','email_status','phone_type',
  'whatsapp_registered','hiring_signal','funding_signal','expansion_signal','technology_stack',
  'research_summary','source_url','confidence','disqualifiers',
];
