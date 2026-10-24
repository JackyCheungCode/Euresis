const INDUSTRIES = `农业与食品生产|林业与木材|渔业与水产养殖|采矿与金属|石油与天然气|可再生能源|太阳能与光伏|风能|电力与公用事业|电池与储能|电气设备|工业自动化|工业机械|机器人|电子与半导体|计算机硬件|软件与 SaaS|人工智能|云计算与数据中心|网络安全|电信|互联网与数字媒体|电子商务|零售|批发与分销|消费品|服装与纺织|奢侈品|汽车与零部件|航空航天|船舶与海事|铁路与交通运输|物流与供应链|仓储与配送|建筑与工程|建筑材料|房地产|室内设计与家具|化工|塑料与橡胶|制药|生物技术|医疗器械|医院与医疗服务|健康与保健|金融服务|银行|保险|投资与资产管理|会计与审计|法律服务|管理咨询|人力资源|招聘与猎头|市场营销与广告|公关与传播|教育与培训|科研与实验室|政府与公共管理|非营利组织|旅游与酒店|餐饮与食品服务|娱乐与媒体|影视与音乐|游戏|体育与健身|环境服务与回收|水处理|包装与印刷|纸浆与造纸|安防与设施管理|航空服务|专业服务|其他行业`.split('|');

const COMPANY_TYPES = `上市公司|私营企业|非上市公众公司|国有企业|国有控股企业|政府机构|公共事业单位|跨国企业|大型企业集团|中小企业|初创公司|独角兽企业|家族企业|合资企业|外商独资企业|合伙企业|个体经营|控股公司|母公司|子公司|分公司|制造商|原始设备制造商（OEM）|原始设计制造商（ODM）|品牌方|批发商|分销商|经销商|代理商|零售商|系统集成商|解决方案提供商|服务商|咨询公司|软件厂商|平台企业|电商企业|采购组织|贸易公司|进口商|出口商|终端用户|非营利组织|教育机构|研究机构|其他类型`.split('|');

const SUPPLY_ROLES = `原材料供应商|零部件供应商|一级供应商（Tier 1）|二级供应商（Tier 2）|三级供应商（Tier 3）|制造商|合同制造商（CM）|原始设备制造商（OEM）|原始设计制造商（ODM）|品牌所有者|进口商|出口商|批发商|总分销商|区域分销商|授权分销商|经销商|代理商|增值经销商（VAR）|系统集成商|解决方案提供商|物流服务商（3PL）|仓储与履约服务商|采购代理|贸易商|零售商|电商渠道|安装商/承包商|售后服务商|回收与逆向物流|终端客户/买方|其他角色`.split('|');

const EMPLOYEE_RANGES = ['1 人（个体）','2–10 人','11–50 人','51–200 人','201–500 人','501–1,000 人','1,001–5,000 人','5,001–10,000 人','10,000 人以上','未知'];
const REVENUE_RANGES = ['低于 100 万美元','100 万–500 万美元','500 万–1,000 万美元','1,000 万–5,000 万美元','5,000 万–1 亿美元','1 亿–5 亿美元','5 亿–10 亿美元','10 亿美元以上','未知'];
const COUNTRIES = `AC AD AE AF AG AI AL AM AO AQ AR AS AT AU AW AX AZ BA BB BD BE BF BG BH BI BJ BL BM BN BO BQ BR BS BT BV BW BY BZ CA CC CD CF CG CH CI CK CL CM CN CO CR CU CV CW CX CY CZ DE DJ DK DM DO DZ EC EE EG EH ER ES ET FI FJ FK FM FO FR GA GB GD GE GF GG GH GI GL GM GN GP GQ GR GS GT GU GW GY HK HM HN HR HT HU ID IE IL IM IN IO IQ IR IS IT JE JM JO JP KE KG KH KI KM KN KP KR KW KY KZ LA LB LC LI LK LR LS LT LU LV LY MA MC MD ME MF MG MH MK ML MM MN MO MP MQ MR MS MT MU MV MW MX MY MZ NA NC NE NF NG NI NL NO NP NR NU NZ OM PA PE PF PG PH PK PL PM PN PR PS PT PW PY QA RE RO RS RU RW SA SB SC SD SE SG SH SI SJ SK SL SM SN SO SR SS ST SV SX SY SZ TC TD TF TG TH TJ TK TL TM TN TO TR TT TV TW TZ UA UG UM US UY UZ VA VC VE VG VI VN VU WF WS YE YT ZA ZM ZW XK`.split(' ');
const displayNames = new Intl.DisplayNames(['zh-CN'], { type: 'region' });
const FLAGS = { CN: '中国大陆', HK: '中国香港', MO: '中国澳门', TW: '中国台湾' };
const flagFor = code => String.fromCodePoint(...[...code].map(char => 127397 + char.charCodeAt(0)));
export const MARKET_OPTIONS = COUNTRIES.map(code => ({
  value: FLAGS[code] || displayNames.of(code) || code,
  label: (FLAGS[code] || displayNames.of(code) || code),
  flag: flagFor(code),
  code,
})).sort((a, b) => {
  const priority = ['中国大陆','中国香港','中国澳门','中国台湾'];
  const ai = priority.indexOf(a.value), bi = priority.indexOf(b.value);
  if (ai >= 0 || bi >= 0) return (ai < 0 ? 99 : ai) - (bi < 0 ? 99 : bi);
  return a.label.localeCompare(b.label, 'zh-CN');
});

const OPTIONS = {
  '行业 / 细分领域': INDUSTRIES,
  '员工规模区间': EMPLOYEE_RANGES,
  '营收区间': REVENUE_RANGES,
  '成立年限': ['未满 1 年','1–3 年','3–5 年','6–10 年','11–20 年','20 年以上','未知'],
  '公司类型': COMPANY_TYPES,
  '地域 / 目标市场': MARKET_OPTIONS,
  '技术栈': ['SAP','Oracle','Microsoft Dynamics','Salesforce','HubSpot','Shopify','Magento / Adobe Commerce','WooCommerce','BigCommerce','Odoo','NetSuite','Microsoft 365','Google Workspace','AWS','Microsoft Azure','Google Cloud','自研系统','未知/不限','其他'],
  '是否上市': ['不限','是，已上市','否，非上市','排除上市公司'],
  '供应链角色': SUPPLY_ROLES,
  '目标职位': ['CEO / 总经理','创始人 / 联合创始人','董事会成员','采购总监','采购经理','供应链总监','供应链经理','运营总监','运营经理','销售总监','业务发展总监','商务拓展经理','工厂厂长','生产总监','技术总监 / CTO','IT 总监 / CIO','财务总监 / CFO','可持续发展负责人','项目经理','其他决策人'],
  '决策权限': ['最终决策人','预算负责人','采购决策人','技术评估人','影响者','使用者','推荐者','未知'],
  '部门': ['管理层','采购','供应链','运营','生产制造','工程','研发','信息技术（IT）','销售','市场营销','财务','法务','人力资源','可持续发展','其他部门'],
  '资历层级': ['创始人/所有者','C-Level 高管','副总裁/VP','总监','高级经理','经理','主管/组长','高级专员','专员','其他'],
  '每公司联系人上限': ['1 人','2 人','3 人','5 人','10 人','不限'],
  '招聘信号': ['不限','正在招聘采购岗位','正在招聘供应链岗位','正在招聘运营岗位','正在招聘销售岗位','正在招聘工程岗位','近期有招聘活动','无招聘信号'],
  '融资信号': ['不限','近 3 个月融资','近 6 个月融资','近 12 个月融资','近 24 个月融资','已上市/公开融资','无近期融资','未知'],
  '扩张信号': ['不限','进入新市场','开设新办公室','新建工厂/仓库','新增产线','跨境扩张','并购活动','无扩张信号'],
  '技术变更信号': ['不限','更换 CRM','更换 ERP','更换电商平台','云迁移','自动化/AI 项目','数字化转型','无技术变更'],
  '内容信号': ['不限','近期发布白皮书','发布行业报告','发布案例研究','新闻/公告','参加网络研讨会','无近期内容'],
  '展会信号': ['不限','Intersolar','Hannover Messe','SPS','CES','MWC','Canton Fair / 广交会','行业展会（其他）','无展会信号'],
  '排除行业': INDUSTRIES,
  '排除公司类型': COMPANY_TYPES,
  '排除地域': MARKET_OPTIONS,
  '排除规模': EMPLOYEE_RANGES,
  '排除状态': ['不排除','已倒闭','破产清算','已被收购','停业','制裁/限制名单','无有效网站','重复企业','其他']
};
export function optionsForField(label) {
  return OPTIONS[label] || ['不限','是','否','未知','其他'];
}
export function optionLabel(option) {
  return typeof option === 'string' ? option : option.label;
}
export function optionValue(option) {
  return typeof option === 'string' ? option : option.value;
}
