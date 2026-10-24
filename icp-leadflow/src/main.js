import { state } from './state.js';
import { renderNav, renderStats, renderStep, goToStep } from './router.js';
import { showToast } from './components/toast.js';
import { renderIntegrations, bindIntegrations } from './pages/integrations.js';

function setView(view) {
  const workflow = document.getElementById('workflowView');
  const integrations = document.getElementById('integrationsView');
  workflow.hidden = view !== 'workflow';
  integrations.hidden = view !== 'integrations';
  document.querySelectorAll('[data-view]').forEach(button => {
    const active = button.dataset.view === view;
    button.classList.toggle('active', active);
    button.setAttribute('aria-current', active ? 'page' : 'false');
  });
  if (view === 'integrations') {
    renderIntegrations();
    bindIntegrations();
  }
  document.title = view === 'integrations' ? 'API 与 AI 集成 · Euresis' : 'Euresis · AI Growth Workspace';
}

function init() {
  renderStats();
  renderNav();
  renderStep();
  document.getElementById('sidebarToggle').addEventListener('click', () => {
    const shell = document.getElementById('appShell');
    const collapsed = shell.classList.toggle('sidebar-collapsed');
    document.getElementById('sidebarToggle').setAttribute('aria-expanded', String(!collapsed));
    document.getElementById('sidebarToggle').setAttribute('aria-label', collapsed ? '展开侧边栏' : '收起侧边栏');
  });
  document.querySelectorAll('[data-view]').forEach(button => {
    button.addEventListener('click', () => setView(button.dataset.view));
  });
  document.getElementById('btnPrev').addEventListener('click', () => {
    if (state.currentStep > 0) goToStep(state.currentStep - 1);
    else showToast('已经是第一步');
  });
  document.getElementById('btnNext').addEventListener('click', () => {
    if (state.currentStep < state.totalSteps - 1) goToStep(state.currentStep + 1);
    else showToast('已完成所有步骤，可导出结果');
  });
  document.getElementById('btnRerun').addEventListener('click', () => {
    showToast('当前仍为演示数据；配置 API 后可接入真实服务');
  });
  setView('workflow');
}
init();
