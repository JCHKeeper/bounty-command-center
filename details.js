const byId = (id) => document.getElementById(id);
const supabase = window.bccSupabase;

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
      <div class="timeline-time">${escapeHtml(item.happened_at_label || '')}</div>
      <div class="timeline-body"><strong>${escapeHtml(item.title || '')}</strong><p>${escapeHtml(item.text || '')}</p></div>
    </article>
  `).join('');
}

function renderActions(items = []) {
  return items.map(item => `<button type="button">${escapeHtml(item.label || item)}</button>`).join('');
}

async function initTaskPage() {
  const id = getParam('id');
  const { data: task } = await supabase.from('tasks').select('*').eq('slug', id).maybeSingle();
  if (!task) return;
  const [{ data: logs }, { data: actions }] = await Promise.all([
    supabase.from('task_logs').select('*').eq('task_id', task.id).order('created_at'),
    supabase.from('task_actions').select('*').eq('task_id', task.id).order('sort_order')
  ]);
  byId('detail-title').textContent = task.title;
  byId('detail-subtitle').textContent = task.meta || '';
  byId('detail-chip').textContent = `${task.badge || ''} / ${task.status || ''}`;
  byId('detail-summary').textContent = task.description || task.summary || '';
  byId('detail-stats').innerHTML = renderPairs([
    { label: '等级', value: task.badge },
    { label: '当前状态', value: task.status },
    { label: '当前猎人', value: task.hunter_label || '-' },
    { label: '截止时间', value: task.deadline_label || '-' },
    { label: '赏格', value: task.reward_label || '-' },
    { label: 'Token', value: task.tokens_label || '-' }
  ]);
  byId('detail-progress').innerHTML = renderPairs([
    { label: '最新进展', value: task.latest_progress || task.summary || '-' },
    { label: '最近更新', value: task.updated_at_label || '-' },
    { label: '当前问题', value: task.current_issue || '无' },
    { label: '完成标准', value: task.done_when || '-' }
  ]);
  byId('detail-log').innerHTML = renderTimeline(logs || []);
  byId('detail-actions').innerHTML = renderActions(actions || []);
}

async function initHunterPage() {
  const id = getParam('id');
  const { data: hunter } = await supabase.from('hunters').select('*').eq('slug', id).maybeSingle();
  if (!hunter) return;
  byId('detail-title').textContent = hunter.name;
  byId('detail-subtitle').textContent = hunter.role || '';
  byId('detail-chip').textContent = hunter.title || '猎人名鉴';
  byId('detail-summary').textContent = `这名猎人当前状态：${hunter.status || '未知'}。适合处理 ${(hunter.tags || []).join(' / ') || '多类任务'}。`;
  byId('detail-stats').innerHTML = renderPairs([
    { label: '模型', value: hunter.model || '-' },
    { label: '当前承载', value: hunter.load || '-' },
    { label: '成功率', value: `${Number(hunter.success_rate || 0)}%` },
    { label: '平均消耗', value: `${Math.round(Number(hunter.avg_tokens || 0) / 1000)}k` },
    { label: '评级', value: hunter.grade || '-' },
    { label: '状态', value: hunter.status || '-' }
  ]);
  byId('detail-side').innerHTML = renderPairs((hunter.tags || []).map(tag => ({ label: '专长标签', value: tag })));
}

async function initResourcePage() {
  const [{ data: kpis }, { data: models }] = await Promise.all([
    supabase.from('resource_kpis').select('*').order('sort_order'),
    supabase.from('resource_models').select('*').order('sort_order')
  ]);
  byId('detail-title').textContent = '资源消耗总览';
  byId('detail-subtitle').textContent = '按模型 / 任务 / 异常提醒继续追踪';
  byId('detail-chip').textContent = 'TOKEN / COST';
  byId('detail-summary').textContent = '这页承接首页的资源消耗模块，后续继续拆成任务消耗排行、猎人消耗排行、模型曲线。';
  byId('detail-stats').innerHTML = renderPairs(kpis || []);
  byId('detail-side').innerHTML = renderPairs((models || []).map(item => ({ label: item.name, value: `${item.tokens || '-'} · ${item.cost || '-'}` })));
}

const mode = document.body.dataset.page;
if (mode === 'task') initTaskPage().catch(console.error);
if (mode === 'hunter') initHunterPage().catch(console.error);
if (mode === 'resource') initResourcePage().catch(console.error);
