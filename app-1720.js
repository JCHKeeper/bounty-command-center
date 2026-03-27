const byId = (id) => document.getElementById(id);
const supabase = window.bccSupabase;
const auth = window.bccAuth;

function escapeHtml(str = '') {
  return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

function renderKpis(items) { return items.map(item => `<article class="kpi-card ${escapeHtml(item.variant || '')}"><div class="kpi-motif" aria-hidden="true"><span></span><span></span><span></span></div><span>${escapeHtml(item.label)}</span><strong>${escapeHtml(item.value)}<small>${escapeHtml(item.unit || '项')}</small></strong></article>`).join(''); }
function renderTimeline(items) { return items.map(item => `<article class="timeline-item ${escapeHtml(item.level || '')}"><div class="timeline-time">${escapeHtml(item.happened_at_label || item.time || '')}</div><div class="timeline-body"><strong>${escapeHtml(item.title)}</strong><p>${escapeHtml(item.text || '')}</p></div></article>`).join(''); }
function renderSummaryStrip(items) { return items.map(item => `<article class="summary-pill hunter-summary-card ${escapeHtml(item.variant || '')}"><span class="summary-label">${escapeHtml(item.label)}</span><strong class="summary-value">${escapeHtml(item.value)}</strong></article>`).join(''); }
function renderTaskTabs(items, active) { return items.map(item => `<button class="tab ${item.key === active ? 'active' : ''}" data-task-tab="${escapeHtml(item.key)}">${escapeHtml(item.label)}</button>`).join(''); }
function getHunterGrade(h) { if (h.grade) return h.grade; const hasStats = h.success_rate !== null && h.success_rate !== undefined && h.avg_tokens !== null && h.avg_tokens !== undefined; if (!hasStats) return '观察'; const success = Number(h.success_rate || 0); const avg = Number(h.avg_tokens || 0) / 1000; if (success >= 95 && avg <= 25) return 'S'; if (success >= 90) return 'A'; if (success >= 86) return 'B'; if (success >= 80) return 'C'; return 'D'; }
function getSpendBand(value = 0) { const avg = Number(value || 0) / 1000; if (avg <= 10) return '超低耗'; if (avg <= 20) return '低耗'; if (avg <= 35) return '中耗'; return '高耗'; }
function getStatusTone(status = '') { if (/空闲|可接|可派|升级|可调度/.test(status)) return 'ready'; if (/执行|作战|潜猎|稳定|重点/.test(status)) return 'active'; if (/等待|放行|上下文|补充|观察/.test(status)) return 'waiting'; if (/满|高压|风险|暂缓/.test(status)) return 'risk'; return 'neutral'; }
function renderTaskBoard(items) { return items.map(task => `<a href="./task-detail.html?id=${encodeURIComponent(task.slug)}" class="task-card-link"><article class="bounty-row compact-bounty-row task-card-compact ${escapeHtml(task.tier_class || '')} ${task.status_key === 'blocked' ? 'blocked' : ''} ${task.status_key === 'approval' ? 'approval' : ''}"><div class="bounty-row-main"><div class="bounty-row-head compact-bounty-head compact-card-head"><span class="badge ${escapeHtml(task.badge_type || 'info')}">${escapeHtml(task.badge || '')}</span></div><div class="task-title compact-task-title">${escapeHtml(task.title)}</div><div class="task-meta-grid compact-task-meta-grid"><div class="task-meta-row"><span class="task-meta-label">任务状态</span><strong>${escapeHtml(task.status)}</strong></div><div class="task-meta-row"><span class="task-meta-label">委托猎人</span><strong>${escapeHtml(task.hunter_label || '-')}</strong></div><div class="task-meta-row"><span class="task-meta-label">任务进度</span><strong>${Number(task.progress) || 0}%</strong></div><div class="task-meta-row"><span class="task-meta-label">委托时间</span><strong>${escapeHtml(task.published_at_label || task.updated_at_label || '-')}</strong></div></div></div></article></a>`).join(''); }
function renderHunters(items) { return items.map(h => { const grade = getHunterGrade(h); const tags = (h.tags || []).slice(0, 3); const hasSuccessRate = h.success_rate !== null && h.success_rate !== undefined; const hasAvgTokens = h.avg_tokens !== null && h.avg_tokens !== undefined; const spendBand = hasAvgTokens ? (h.spend_band || getSpendBand(h.avg_tokens)) : '待生成'; const statusTone = getStatusTone(h.status); const summary = h.mark || (hasSuccessRate ? `成功率 ${Number(h.success_rate)}%，画像持续更新中` : '任务样本不足，画像将在后续任务中自动生成'); return `<article class="hunter-card dossier-card ${grade === '观察' ? 'grade-d' : `grade-${escapeHtml(String(grade).toLowerCase())}`} ${h.champion ? 'champion' : ''} ${h.ready_upgrade ? 'ready-upgrade' : ''}"><div class="hunter-head hunter-head-compact"><div class="hunter-ident hunter-ident-flat"><div class="hunter-title-wrap"><div class="hunter-name-row"><div class="hunter-name-inline"><div class="hunter-name">${escapeHtml(h.name)}</div><span class="grade-badge ${grade === '观察' ? 'grade-d' : `grade-${escapeHtml(String(grade).toLowerCase())}`} ">${escapeHtml(grade)}</span></div><a class="hunter-link-inline" href="./hunter-detail.html?id=${encodeURIComponent(h.slug)}">查看档案</a></div></div></div></div><div class="hunter-status-row hunter-status-skill-row"><span class="hunter-status-chip ${escapeHtml(statusTone)}">${escapeHtml(h.status || '观察中')}</span><div class="hunter-skills hunter-skills-inline">${tags.length ? tags.map(tag => `<span>${escapeHtml(tag)}</span>`).join('') : '<span>暂无标签</span>'}</div></div><div class="dossier-metrics compact-dossier-metrics compact-dossier-metrics-inline"><span>来源<strong>${escapeHtml(h.class || '-')}</strong></span><span>画像<strong>${escapeHtml(hasAvgTokens ? `${Math.round(Number(h.avg_tokens || 0) / 1000)}k · ${spendBand}` : '待生成')}</strong></span></div><p class="muted" style="margin:10px 0 0;line-height:1.5;">${escapeHtml(summary)}</p></article>`; }).join(''); }
function renderResourceKpis(items) { return items.map(item => `<article class="resource-kpi ${escapeHtml(item.variant || '')}"><span>${escapeHtml(item.label)}</span><strong>${escapeHtml(item.value)}</strong><p>${escapeHtml(item.note || '')}</p></article>`).join(''); }
function renderModelBars(items) { const max = Math.max(...items.map(item => Number(item.percent) || 0), 1); return items.map(item => `<article class="model-bar-item"><div class="model-bar-top"><strong>${escapeHtml(item.name)}</strong><span>${escapeHtml(item.tokens || '')} · ${escapeHtml(item.cost || '')}</span></div><div class="model-bar-track"><span style="width:${(Number(item.percent) || 0) / max * 100}%"></span></div></article>`).join(''); }
function renderSpendAlerts(items) { return items.map(item => `<article class="spend-alert ${item.critical ? 'critical' : ''}"><strong>${escapeHtml(item.title)}</strong><span>${escapeHtml(item.meta || '')}</span></article>`).join(''); }
function buildHunterSummary(hunters) { const total = hunters.length; const observing = hunters.filter(h => /观察/.test(h.status || '')).length; const ready = hunters.filter(h => /可调度|空闲|可接|可派/.test(h.status || '')).length; const profiled = hunters.filter(h => h.success_rate !== null && h.success_rate !== undefined).length; return [{ label: '已注册猎人', value: String(total).padStart(2, '0') }, { label: '观察池中', value: String(observing).padStart(2, '0') }, { label: '可调度', value: String(ready).padStart(2, '0') }, { label: '已生成画像', value: String(profiled).padStart(2, '0') }]; }

function attachTaskBoardInteractions(data, owner) {
  const tabs = [{ key: 'all', label: '全部' }, { key: 's', label: 'S级' }, { key: 'a', label: 'A级' }, { key: 'b', label: 'B级' }, { key: 'c', label: 'C级' }, { key: 'd', label: 'D级' }];
  const allTasks = data.tasks || []; const board = byId('task-board'); const note = byId('task-view-note'); const tabsRoot = byId('task-tabs'); let activeTab = 'all';
  function render() {
    const current = allTasks.filter(task => activeTab === 'all' || task.tier_key === activeTab);
    const activeLabel = tabs.find(tab => tab.key === activeTab)?.label || '全榜';
    if (board) board.innerHTML = renderTaskBoard(current);
    if (note) { note.style.display = 'block'; note.innerHTML = owner ? `当前视角：${activeLabel} · 已登录 owner，可发布和编辑。` : `当前视角：${activeLabel} · 当前为只读模式，登录 owner 后可写。`; }
    if (tabsRoot) tabsRoot.innerHTML = renderTaskTabs(tabs, activeTab);
    tabsRoot?.querySelectorAll('[data-task-tab]').forEach(btn => btn.addEventListener('click', () => { activeTab = btn.getAttribute('data-task-tab') || 'all'; render(); }));
  }
  render();
}

async function loadDashboardData() {
  const [{ data: kpis }, { data: timeline }, { data: hunters }, { data: tasks }, { data: resourceKpis }, { data: models }, { data: alerts }] = await Promise.all([
    supabase.from('dashboard_kpis').select('*').order('sort_order'),
    supabase.from('timeline_events').select('*').order('sort_order'),
    supabase.from('hunters').select('*').order('created_at'),
    supabase.from('tasks').select('*').order('created_at', { ascending: false }),
    supabase.from('resource_kpis').select('*').order('sort_order'),
    supabase.from('resource_models').select('*').order('sort_order'),
    supabase.from('resource_alerts').select('*').order('sort_order')
  ]);
  return { kpis: kpis || [], timeline: timeline || [], hunters: hunters || [], tasks: tasks || [], resourceKpis: resourceKpis || [], models: models || [], alerts: alerts || [] };
}

async function init() {
  const owner = await auth.isOwner();
  const publishLink = byId('publish-task-link'); const hunterLink = byId('new-hunter-link');
  if (publishLink && !owner) { publishLink.style.display = 'none'; }
  if (hunterLink && !owner) { hunterLink.style.display = 'none'; }
  const data = await loadDashboardData();
  byId('kpi-row').innerHTML = renderKpis(data.kpis);
  byId('timeline-list').innerHTML = renderTimeline(data.timeline);
  byId('hunter-summary').innerHTML = renderSummaryStrip(buildHunterSummary(data.hunters));
  byId('roster-grid').innerHTML = renderHunters(data.hunters);
  byId('resource-kpis').innerHTML = renderResourceKpis(data.resourceKpis);
  byId('model-bars').innerHTML = renderModelBars(data.models);
  byId('spend-alerts').innerHTML = renderSpendAlerts(data.alerts);
  attachTaskBoardInteractions(data, owner);
}

init().catch(err => {
  console.error('Failed to load dashboard data', err);
  if (byId('task-view-note')) { byId('task-view-note').style.display = 'block'; byId('task-view-note').textContent = '数据加载失败，请稍后刷新。'; }
});
