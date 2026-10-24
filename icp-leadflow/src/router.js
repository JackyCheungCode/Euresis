import { state, setStep } from './state.js';
import { renderStep0, bindStep0 } from './steps/step0-icp.js';
import { renderStep1, bindStep1 } from './steps/step1-discover.js';
import { renderStep2, bindStep2 } from './steps/step2-scrape.js';
import { renderStep3, bindStep3 } from './steps/step3-enrich.js';
import { renderStep4, bindStep4 } from './steps/step4-verify.js';
import { renderStep5, bindStep5 } from './steps/step5-research.js';
import { renderStep6, bindStep6 } from './steps/step6-rounter.js';

const modules = [
  { render: renderStep0, bind: bindStep0 },
  { render: renderStep1, bind: bindStep1 },
  { render: renderStep2, bind: bindStep2 },
  { render: renderStep3, bind: bindStep3 },
  { render: renderStep4, bind: bindStep4 },
  { render: renderStep5, bind: bindStep5 },
  { render: renderStep6, bind: bindStep6 },
];

export function renderNav() {
  const nav = document.getElementById('stepsNav');
  nav.innerHTML = state.steps.map(s => `
    <button type="button" class="cds-progress-step ${s.id === state.currentStep ? 'active' : ''} ${s.id < state.currentStep ? 'completed' : ''}" data-step="${s.id}" aria-current="${s.id === state.currentStep ? 'step' : 'false'}">
      <span class="cds-progress-marker" aria-hidden="true">${s.id < state.currentStep ? '✓' : s.id + 1}</span>
      <span class="cds-progress-copy"><span class="cds-progress-label">${s.label}</span><span class="cds-progress-description">${s.desc}</span></span>
    </button>`).join('');

  nav.querySelectorAll('.cds-progress-step').forEach(el => {
    el.addEventListener('click', () => goToStep(Number(el.dataset.step)));
  });
}

export function renderStats() {
  const row = document.getElementById('statsRow');
  row.innerHTML = state.stats.map(s => `
    <div class="stat">
      <div class="label">${s.label}</div>
      <div class="value" ${s.color ? `style="color:${s.color}"` : ''}>${s.value} <small>${s.unit}</small></div>
    </div>`).join('');
}

export function renderStep() {
  const container = document.getElementById('stepContainer');
  const mod = modules[state.currentStep];
  container.innerHTML = `<div class="step-content active">${mod.render()}</div>`;
  mod.bind(container);
  document.getElementById('actionInfo').textContent =
    `当前步骤：${state.currentStep + 1} / ${state.totalSteps} · ${state.steps[state.currentStep].label} · 模拟运行中`;
}

export function goToStep(index) {
  if (index < 0 || index >= state.totalSteps) return;
  setStep(index);
  renderNav();
  renderStep();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}
