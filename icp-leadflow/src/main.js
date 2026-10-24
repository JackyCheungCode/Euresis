import { state } from './state.js';
import { renderNav, renderStats, renderStep, goToStep } from './router.js';
import { showToast } from './components/toast.js';
import { renderIntegrations, bindIntegrations } from './pages/integrations.js';
import { renderStep0, bindStep0 } from './steps/step0-icp.js';
import { loadIntegrations } from './services/integrations.js';
import { supabase } from './services/supabase.js';

async function setView(view) {
  const workflow = document.getElementById('workflowView');
  const icp = document.getElementById('icpView');
  const integrations = document.getElementById('integrationsView');
  workflow.hidden = view !== 'workflow';
  icp.hidden = view !== 'icp';
  integrations.hidden = view !== 'integrations';
  document.querySelectorAll('[data-view]').forEach(button => {
    const active = button.dataset.view === view;
    button.classList.toggle('active', active);
    button.setAttribute('aria-current', active ? 'page' : 'false');
  });
  if (view === 'icp') {
    const root = document.getElementById('icpDefinitionContainer');
    root.innerHTML = renderStep0();
    bindStep0(root);
  }
  if (view === 'integrations') {
    try {
      await loadIntegrations();
      renderIntegrations();
      await bindIntegrations();
    } catch (error) {
      const errorNode = document.getElementById('integrationCards');
      errorNode.textContent = error.message || '无法加载配置';
      errorNode.className = 'notification warning';
    }
  }
  document.title = view === 'integrations' ? 'API 和 AI 集成 · Euresis' : view === 'icp' ? '企业 ICP · Euresis' : '搜索 API 发现 · Euresis';
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
    else showToast('已完成所有步骤，可在数据库中查看处理结果');
  });
  document.getElementById('btnRerun').addEventListener('click', () => {
    const action = document.querySelector('#stepContainer [data-run-stage], #stepContainer #discoverLeads, #stepContainer #saveIcpFields');
    if (action && !action.disabled) action.click();
    else showToast('当前阶段暂无可重新运行的操作');
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
  document.addEventListener('euresis:leads-updated', async () => { renderStats(); await renderStep(); });
}
let initialized = false;
let activeUserId = null;
let signupMode = false;
function setAuthenticated(session) {
  const gate = document.getElementById('authGate');
  const shell = document.querySelector('.app-shell');
  const header = document.querySelector('.global-header');
  if (!session) {
    activeUserId = null;
    document.body.classList.remove('authenticated');
    gate.hidden = false;
    shell.hidden = true;
    header.hidden = true;
    return;
  }
  const userId = session.user?.id || null;
  const accountChanged = activeUserId !== userId;
  activeUserId = userId;
  document.body.classList.add('authenticated');
  gate.hidden = true;
  shell.hidden = false;
  header.hidden = false;
  if (!initialized) {
    initialized = true;
    init();
    const logout = document.getElementById('logoutButton');
    logout?.addEventListener('click', async () => {
      logout.disabled = true;
      const { error } = await supabase.auth.signOut();
      logout.disabled = false;
      if (error) showToast('退出登录失败：' + error.message);
    });
  } else if (accountChanged) {
    renderNav();
    renderStats();
    renderStep();
    if (!document.getElementById('integrationsView').hidden) setView('integrations');
  }
}
function setAuthMessage(message, isError = false) {
  const node = document.getElementById('authMessage');
  node.textContent = message;
  node.classList.toggle('error', isError);
}
function updateAuthMode() {
  document.getElementById('authTitle').textContent = signupMode ? '创建 Euresis 账号' : '登录 Euresis';
  document.getElementById('authSubmit').textContent = signupMode ? '创建账号' : '登录';
  document.getElementById('authModeToggle').textContent = signupMode ? '已有账号？返回登录' : '没有账号？创建账号';
  document.getElementById('authPassword').autocomplete = signupMode ? 'new-password' : 'current-password';
  setAuthMessage('');
}
function initAuth() {
  const form = document.getElementById('authForm');
  document.getElementById('authModeToggle').addEventListener('click', () => {
    signupMode = !signupMode;
    updateAuthMode();
  });
  form.addEventListener('submit', async event => {
    event.preventDefault();
    const email = document.getElementById('authEmail').value.trim();
    const password = document.getElementById('authPassword').value;
    const submit = document.getElementById('authSubmit');
    submit.disabled = true;
    setAuthMessage(signupMode ? '正在创建账号…' : '正在验证登录信息…');
    try {
      if (signupMode) {
        const { data, error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        if (data.session) {
          setAuthenticated(data.session);
        } else {
          setAuthMessage('账号已创建。请检查邮箱完成验证，然后返回登录。');
        }
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        setAuthenticated(data.session);
      }
    } catch (error) {
      setAuthMessage(error.message || '身份验证失败', true);
    } finally {
      submit.disabled = false;
    }
  });
  supabase.auth.getSession().then(({ data, error }) => {
    if (error) setAuthMessage(error.message, true);
    setAuthenticated(data?.session || null);
  });
  supabase.auth.onAuthStateChange((_event, session) => setAuthenticated(session));
}
initAuth();
