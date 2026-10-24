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

function openRecordDetails(row) {
  const modal = document.getElementById('recordModal');
  const body = document.getElementById('recordModalBody');
  const table = row.closest('table');
  const headers = [...table.querySelectorAll('thead th')].map(th => th.textContent.trim());
  const cells = [...row.querySelectorAll('td')].map(td => td.textContent.trim());
  body.innerHTML = '';
  const list = document.createElement('dl');
  list.className = 'record-detail-list';
  cells.forEach((value, index) => {
    const wrap = document.createElement('div');
    wrap.className = 'record-detail-item';
    const term = document.createElement('dt');
    term.textContent = headers[index] || '字段 ' + (index + 1);
    const description = document.createElement('dd');
    description.textContent = value || '—';
    wrap.append(term, description);
    list.append(wrap);
  });
  body.append(list);
  modal.hidden = false;
  document.getElementById('recordModalClose').focus();
  document.body.classList.add('modal-open');
}
function closeRecordDetails() {
  document.getElementById('recordModal').hidden = true;
  document.body.classList.remove('modal-open');
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
  document.addEventListener('click', event => {
    const row = event.target.closest('tr[data-record-row]');
    if (row && !event.target.closest('a,button,input,select,textarea')) openRecordDetails(row);
    if (event.target.closest('#recordModalClose, #recordModalDone')) closeRecordDetails();
    if (event.target.id === 'recordModal') closeRecordDetails();
  });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && !document.getElementById('recordModal').hidden) closeRecordDetails();
    if ((event.key === 'Enter' || event.key === ' ') && event.target.matches('tr[data-record-row]')) {
      event.preventDefault();
      openRecordDetails(event.target);
    }
  });
  setView('workflow');
}
init();
