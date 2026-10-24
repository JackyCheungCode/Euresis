import { renderStagePage, bindStagePage } from '../components/stage.js';

export function renderStep3() { return renderStagePage('enrich'); }
export function bindStep3(root) { return bindStagePage(root, 'enrich'); }
