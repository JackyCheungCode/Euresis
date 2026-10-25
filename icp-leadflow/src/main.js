import { state } from './state.js';
import { renderNav, renderStats, renderStep, goToStep } from './router.js';
import { showToast } from './components/toast.js';
import { renderIntegrations, bindIntegrations } from './pages/integrations.js';
import { loadIntegrations } from './services/integrations.js';
import { supabase } from './services/supabase.js';

async function setView(view) {
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
    try {
      await loadIntegrations();
      renderIntegrations();
      await bindIntegrations();
    } catch (error) {
      const errorNode = document.getElementById('integrationCards');
      errorNode.innerHTML = '<cds-inline-notification kind="error" title="无法加载集成配置" hide-close-button>' + String(error.message || '无法加载配置').replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char])) + '</cds-inline-notification>'; 
    }
  }
  document.title = view === 'integrations' ? 'API 和 AI 集成 · Euresis' : '搜索 API 发现 · Euresis';
}

function openRecordDetails(row) {
  const modal = document.getElementById('recordModal');
  const body = document.getElementById('recordModalBody');
  const table = row.closest('cds-table');
  const headers = [...table.querySelectorAll('cds-table-header-cell')].map(th => th.textContent.trim());
  const cells = [...row.querySelectorAll('cds-table-cell')].map(td => td.textContent.trim());
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
  const leadId = row.dataset.leadId;
  if (leadId) {
    const actions = document.createElement('div');
    actions.className = 'record-detail-actions';
    actions.innerHTML = '<cds-button type="button" class="btn btn-secondary btn-sm" data-detail-action="enrich" kind="secondary" size="sm">补全联系方式</cds-button><cds-button type="button" class="btn btn-primary btn-sm" data-detail-action="research" kind="primary" size="sm">企业背调</cds-button>';
    actions.querySelectorAll('[data-detail-action]').forEach(button => button.addEventListener('click', async () => {
      const stage = button.dataset.detailAction;
      closeRecordDetails();
      await goToStep(stage === 'enrich' ? 3 : 5);
      document.getElementById('stepContainer').dispatchEvent(new CustomEvent('euresis:run-lead-action', { detail: { stage, leadId } }));
    }));
    body.append(actions);
  }
  modal.open = true;
  document.getElementById('recordModalClose').focus();
  document.body.classList.add('modal-open');
}
function closeRecordDetails() {
  document.getElementById('recordModal').open = false;
  document.body.classList.remove('modal-open');
}
function init() {
  renderStats();
  renderNav();
  renderStep();
  const appShell = document.getElementById('appShell');
  const sidebarToggle = document.getElementById('sidebarToggle');
  if (window.matchMedia('(max-width: 600px)').matches) {
    appShell.classList.add('sidebar-collapsed');
    sidebarToggle.setAttribute('aria-expanded', 'false');
    sidebarToggle.setAttribute('aria-label', '展开侧边栏');
  }
  document.getElementById('sidebarToggle').addEventListener('click', () => {
    const shell = document.getElementById('appShell');
    const collapsed = shell.classList.toggle('sidebar-collapsed');
    document.getElementById('sidebarToggle').setAttribute('aria-expanded', String(!collapsed));
    document.getElementById('sidebarToggle').setAttribute('aria-label', collapsed ? '展开侧边栏' : '收起侧边栏');
  });
  document.querySelectorAll('[data-view]').forEach(button => {
    button.addEventListener('click', () => {
      setView(button.dataset.view);
      if (window.matchMedia('(max-width: 600px)').matches) {
        appShell.classList.add('sidebar-collapsed');
        sidebarToggle.setAttribute('aria-expanded', 'false');
        sidebarToggle.setAttribute('aria-label', '展开侧边栏');
      }
    });
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
    const row = event.target.closest('cds-table-row[data-record-row]');
    if (row && !event.target.closest('a,button,input,select,textarea,cds-button,cds-checkbox,cds-text-input,cds-dropdown,cds-multi-select,cds-toggle')) openRecordDetails(row);
    if (event.target.closest('#recordModalClose, #recordModalDone')) closeRecordDetails();
    if (event.target.id === 'recordModal') closeRecordDetails();
  });
  document.getElementById('recordModal')?.addEventListener('cds-modal-closed', closeRecordDetails);
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && document.getElementById('recordModal').open) closeRecordDetails();
    if ((event.key === 'Enter' || event.key === ' ') && event.target.matches('cds-table-row[data-record-row]')) {
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
  const submitButton = document.getElementById('authSubmit');
  const modeButton = document.getElementById('authModeToggle');

  // Don't let browser-native constraint validation silently prevent the submit handler.
  form.noValidate = true;

  const authenticate = async event => {
    event?.preventDefault();
    const emailInput = document.getElementById('authEmail');
    const passwordInput = document.getElementById('authPassword');
    const email = emailInput.value.trim();
    const password = passwordInput.value;

    if (!email || !/^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(email)) {
      setAuthMessage('请输入有效的邮箱地址。', true);
      emailInput.focus();
      return;
    }
    if (!password || (!signupMode && password.length < 1) || (signupMode && password.length < 8)) {
      setAuthMessage(signupMode ? '密码至少需要 8 位字符。' : '请输入密码。', true);
      passwordInput.focus();
      return;
    }

    submitButton.disabled = true;
    submitButton.textContent = signupMode ? '正在创建账号…' : '正在登录…';
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
      setAuthMessage(error?.message || '身份验证失败，请稍后重试。', true);
    } finally {
      submitButton.disabled = false;
      submitButton.textContent = signupMode ? '创建账号' : '登录';
    }
  };

  // Bind both the physical button tap and form submit; either path reaches the same handler.
  submitButton.addEventListener('click', authenticate);
  form.addEventListener('submit', authenticate);
  modeButton.addEventListener('click', () => {
    signupMode = !signupMode;
    updateAuthMode();
  });

  supabase.auth.getSession().then(({ data, error }) => {
    if (error) setAuthMessage(error.message, true);
    setAuthenticated(data?.session || null);
  }).catch(error => setAuthMessage(error?.message || '无法连接身份验证服务。', true));

  supabase.auth.onAuthStateChange((_event, session) => setAuthenticated(session));
}
initAuth();
