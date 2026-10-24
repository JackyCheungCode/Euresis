export const state = {
  currentStep: 0,
  totalSteps: 7,
  steps: [
    { id: 0, label: 'ICP 定义', desc: '四层字段 · 查询生成' },
    { id: 1, label: '候选发现', desc: 'SERP · Maps' },
    { id: 2, label: '公开信号抓取', desc: 'Domain Contact Scraper' },
    { id: 3, label: '联系方式补齐', desc: 'Apollo · Clay · WhatsApp' },
    { id: 4, label: '验证层', desc: 'Twilio · Hunter' },
    { id: 5, label: '简单背调', desc: 'Apollo · Bright Data' },
    { id: 6, label: '渠道路由', desc: '输出 · 分流' },
  ],
  stats: [
    { label: '候选公司', value: 0, unit: '家' },
    { label: 'ICP 匹配', value: 0, unit: '家', color: 'var(--cds-green-40)' },
    { label: '有效电话', value: 0, unit: '条' },
    { label: 'WhatsApp 已注册', value: 0, unit: '条', color: 'var(--cds-teal-60)' },
    { label: '有效邮箱', value: 0, unit: '条' },
    { label: '背调完成', value: 0, unit: '家' },
  ],
};

export function setStep(index) { state.currentStep = index; }
