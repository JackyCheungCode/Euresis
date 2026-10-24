import { renderStagePage, bindStagePage } from '../components/stage.js';

export function renderStep2() { return renderStagePage('scrape'); }
export function bindStep2(root) { return bindStagePage(root, 'scrape'); }
