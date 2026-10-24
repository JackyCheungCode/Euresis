import { state } from './state.js';
import { renderNav, renderStats, renderStep, goToStep } from './router.js';
import { showToast } from './components/toast.js';

function init() {
  renderStats();
  renderNav();
  renderStep();

  document.getElementById('btnPrev').addEventListener('click', () => {
    if (state.currentStep > 0) goToStep(state.currentStep - 1);
    else showToast('已经是第一步');
  });

  document.getElementById('btnNext').addEventListener('click', () => {
    if (state.currentStep < state.totalSteps - 1) goToStep(state.currentStep + 1);
    else showToast('已完成所有步骤，可导出结果');
  });

  document.getElementById('btnRerun').addEventListener('click', () => {
    showToast('已模拟重新运行当前节点');
  });
}

init();
