const byId = (id) => document.getElementById(id);

function escapeHtml(str = '') {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function getParam(name) {
  return new URLSearchParams(window.location.search).get(name) || '';
}

function slugify(str = '') {
  return String(str).toLowerCase().trim().replace(/[^a-z0-9\u4e00-\u9fa5]+/g, '-').replace(/^-+|-+$/g, '');
}

function renderPairs(items = []) {
  return items.map(item => `
    <article class="summary-pill">
      <span>${escapeHtml(item.label)}</span>
      <strong>${escapeHtml(item.value)}</strong>
      ${item.note ? `<em>${escapeHtml(item.note)}</em>` : ''}
    </article>
  `).join('');
}

function renderTimeline(items = []) {
  return items.map(item => `
    <article class="timeline-item ${escapeHtml(item.level || '')}">
      <div class="timeline-time">${escapeHtml(item.time || '')}</div>
      <div class="timeline-body">
        <strong>${escapeHtml(item.title || '')}</strong>
        <p>${escapeHtml(item.text || '')}</p>
      </div>
    </article>
  `).join('');
}

function renderActions(items = []) {
  return items.map(label => `<button type="button">${escapeHtml(label)}</button>`).join('');
}

async function loadData() {
  const res = await fetch('./data.json?v=20260319-1138', { cache: 'no-store' });
  return res.json();
}

async function initTaskPage() {
  const data = await loadData();
  const id = getParam('id');
  const tasks = data.taskBoard?.items || [];
  const task = tasks.find(item => slugify(item.title) === id) || tasks[0];
  if (!task) return;

  byId('detail-title').textContent = task.title;
  byId('detail-subtitle').textContent = task.meta;
  byId('detail-chip').textContent = `${task.badge} / ${task.status}`;
  byId('detail-summary').textContent = task.description || task.summary || '';
  byId('detail-stats').innerHTML = renderPairs([
    { label: '等级', value: task.badge },
    { label: '当前状态', value: task.status },
    { label: '当前猎人', value: task.hunter },
    { label: '截止时间', value: task.deadline },
    { label: '赏格', value: task.reward },
    { label: 'Token', value: task.tokens }
  ]);
  byId('detail-progress').innerHTML = renderPairs([
    { label: '最新进展', value: task.latestProgress || task.summary },
    { label: '最近更新', value: task.updatedAt || '刚刚' },
    { label: '当前问题', value: task.currentIssue || '无' },
    { label: '完成标准', value: task.doneWhen || '达到预期结果后直接结单' }
  ]);
  byId('detail-log').innerHTML = renderTimeline(task.log || []);
  byId('detail-actions').innerHTML = renderActions(task.actions || ['标记完成', '改为停滞', '改为待审批', '更换猎人']);
}

async function initHunterPage() {
  const data = await loadData();
  const id = getParam('id');
  const hunters = data.hunters || [];
  const hunter = hunters.find(item => slugify(item.name) === id) || hunters[0];
  if (!hunter) return;

  byId('detail-title').textContent = hunter.name;
  byId('detail-subtitle').textContent = hunter.role;
  byId('detail-chip').textContent = hunter.title;
  byId('detail-summary').textContent = `这名猎人当前状态：${hunter.status}。适合处理 ${hunter.tags?.join(' / ') || '多类任务'}。`;
  byId('detail-stats').innerHTML = renderPairs([
    { label: '模型', value: hunter.model },
    { label: '当前承载', value: hunter.load },
    { label: '成功率', value: hunter.successRate },
    { label: '平均消耗', value: hunter.avgTokens },
    { label: '勋章数', value: hunter.medals },
    { label: '本周变化', value: hunter.weekly }
  ]);
  byId('detail-side').innerHTML = renderPairs((hunter.tags || []).map(tag => ({ label: '专长标签', value: tag })));
}

async function initResourcePage() {
  const data = await loadData();
  byId('detail-title').textContent = '资源消耗总览';
  byId('detail-subtitle').textContent = '按模型 / 任务 / 异常提醒继续追踪';
  byId('detail-chip').textContent = 'TOKEN / COST';
  byId('detail-summary').textContent = '这页先承接首页的资源消耗模块，后续可以继续拆成任务消耗排行、猎人消耗排行、模型曲线。';
  byId('detail-stats').innerHTML = renderPairs(data.resources?.kpis || []);
  byId('detail-side').innerHTML = renderPairs((data.resources?.models || []).map(item => ({ label: item.name, value: `${item.tokens} · ${item.cost}`, note: item.note })));
}

const mode = document.body.dataset.page;
if (mode === 'task') initTaskPage().catch(console.error);
if (mode === 'hunter') initHunterPage().catch(console.error);
if (mode === 'resource') initResourcePage().catch(console.error);
