const byId = (id) => document.getElementById(id);

function escapeHtml(str = '') {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function slugify(str = '') {
  return String(str).toLowerCase().trim().replace(/[^a-z0-9\u4e00-\u9fa5]+/g, '-').replace(/^-+|-+$/g, '');
}

function renderKpis(items) {
  return items.map(item => `
    <article class="kpi-card ${escapeHtml(item.variant || '')}">
      <div class="kpi-motif" aria-hidden="true">
        <span></span><span></span><span></span>
      </div>
      <span>${escapeHtml(item.label)}</span>
      <strong>${escapeHtml(item.value)}<small>${escapeHtml(item.unit || '任务')}</small></strong>
    </article>
  `).join('');
}

function renderFacts(items) {
  return items.map(item => `
    <div class="focus-meta-item ${item.highlight ? 'medal-highlight' : ''}">
      <span>${escapeHtml(item.label)}</span>
      <strong>${escapeHtml(item.value)}</strong>
    </div>
  `).join('');
}

function renderRewards(items) {
  return items.map(item => `
    <div class="reward-cell">
      <span>${escapeHtml(item.label)}</span>
      <strong>${escapeHtml(item.value)}</strong>
    </div>
  `).join('');
}

function renderAlerts(items) {
  return items.map(item => `
    <article class="alert-item ${item.critical ? 'critical pulse-soft' : ''}">
      <div>
        <strong>${escapeHtml(item.title)}</strong>
        <p>${escapeHtml(item.text)}</p>
      </div>
      <span>${escapeHtml(item.time)}</span>
    </article>
  `).join('');
}

function renderTimeline(items) {
  return items.map(item => `
    <article class="timeline-item ${escapeHtml(item.level || '')}">
      <div class="timeline-time">${escapeHtml(item.time)}</div>
      <div class="timeline-body">
        <strong>${escapeHtml(item.title)}</strong>
        <p>${escapeHtml(item.text)}</p>
      </div>
    </article>
  `).join('');
}

function renderSummaryStrip(items) {
  return items.map(item => `
    <article class="summary-pill ${escapeHtml(item.variant || '')}">
      <span>${escapeHtml(item.label)}</span>
      <strong>${escapeHtml(item.value)}</strong>
      ${item.note ? `<em>${escapeHtml(item.note)}</em>` : ''}
    </article>
  `).join('');
}

function renderTaskTabs(items, active) {
  return items.map(item => `
    <button class="tab ${item.key === active ? 'active' : ''}" data-task-tab="${escapeHtml(item.key)}">${escapeHtml(item.label)}</button>
  `).join('');
}

function renderTaskBoard(items) {
  return items.map(task => `
    <article class="bounty-row compact-bounty-row ${escapeHtml(task.tierClass || '')} ${task.statusKey === 'blocked' ? 'blocked' : ''} ${task.statusKey === 'approval' ? 'approval' : ''}">
      <div class="bounty-row-main">
        <div class="bounty-row-head compact-bounty-head">
          <div class="bounty-main-ident">
            <span class="badge ${escapeHtml(task.badgeType || 'info')}">${escapeHtml(task.badge)}</span>
            <div class="task-title">${escapeHtml(task.title)}</div>
          </div>
          <a href="./task-detail.html?id=${encodeURIComponent(slugify(task.title))}" class="ghost-btn row-link">查看详情</a>
        </div>
        <div class="bounty-row-facts compact-facts task-card-facts">
          <span class="fact-status">任务状态：<strong>${escapeHtml(task.status)}</strong></span>
          <span class="fact-hunter">委托猎人：<strong>${escapeHtml(task.hunter)}</strong></span>
          <span class="fact-progress">任务进度：<strong>${Number(task.progress) || 0}%</strong></span>
          <span class="fact-time">委托时间：<strong>${escapeHtml(task.publishedAt || task.updatedAt || '-')}</strong></span>
        </div>
      </div>
    </article>
  `).join('');
}

function renderHunters(items) {
  return items.map(h => `
    <article class="hunter-card dossier-card ${h.champion ? 'champion' : ''} ${h.readyUpgrade ? 'ready-upgrade' : ''}">
      <div class="hunter-head">
        <div class="hunter-ident">
          <span class="class-mark ${escapeHtml(h.class || '')}">${escapeHtml(h.mark || '')}</span>
          <div>
            <div class="hunter-name">${escapeHtml(h.name)}</div>
            <div class="hunter-role">${escapeHtml(h.role)}</div>
          </div>
        </div>
        <div class="medal-count">${escapeHtml(h.medals)}</div>
      </div>
      <div class="medal-track ${h.full ? 'full' : ''}"><span style="width:${Number(h.progress) || 0}%"></span></div>
      <div class="hunter-foot">
        <span>${escapeHtml(h.status)}</span>
        <strong>${escapeHtml(h.title)}</strong>
      </div>
      <div class="hunter-weekly">本周 ${escapeHtml(h.weekly)}</div>
      <div class="dossier-metrics">
        <span>模型：<strong>${escapeHtml(h.model)}</strong></span>
        <span>当前承载：<strong>${escapeHtml(h.load)}</strong></span>
        <span>成功率：<strong>${escapeHtml(h.successRate)}</strong></span>
        <span>均耗：<strong>${escapeHtml(h.avgTokens)}</strong></span>
      </div>
      <div class="dossier-tags">${(h.tags || []).map(tag => `<span>${escapeHtml(tag)}</span>`).join('')}</div>
      <div class="dossier-actions"><a class="ghost-btn row-link" href="./hunter-detail.html?id=${encodeURIComponent(slugify(h.name))}">查看档案</a></div>
    </article>
  `).join('');
}

function renderResourceKpis(items) {
  return items.map(item => `
    <article class="resource-kpi ${escapeHtml(item.variant || '')}">
      <span>${escapeHtml(item.label)}</span>
      <strong>${escapeHtml(item.value)}</strong>
      <p>${escapeHtml(item.note || '')}</p>
    </article>
  `).join('');
}

function renderModelBars(items) {
  const max = Math.max(...items.map(item => Number(item.percent) || 0), 1);
  return items.map(item => `
    <article class="model-bar-item">
      <div class="model-bar-top">
        <strong>${escapeHtml(item.name)}</strong>
        <span>${escapeHtml(item.tokens)} · ${escapeHtml(item.cost)}</span>
      </div>
      <div class="model-bar-track"><span style="width:${(Number(item.percent) || 0) / max * 100}%"></span></div>
    </article>
  `).join('');
}

function renderSpendAlerts(items) {
  return items.map(item => `
    <article class="spend-alert ${item.critical ? 'critical' : ''}">
      <strong>${escapeHtml(item.title)}</strong>
      <span>${escapeHtml(item.meta)}</span>
    </article>
  `).join('');
}

function attachTaskBoardInteractions(data) {
  const tabs = data.taskBoard?.tabs || [];
  const allTasks = data.taskBoard?.items || [];
  const summary = byId('task-summary');
  const board = byId('task-board');
  const note = byId('task-view-note');
  const searchInput = byId('task-search');
  const tabsRoot = byId('task-tabs');
  let activeTab = tabs[0]?.key || 'all';

  function filteredTasks() {
    const query = (searchInput?.value || '').trim().toLowerCase();
    return allTasks.filter(task => {
      const tabMatch = activeTab === 'all' || task.tierKey === activeTab;
      const searchMatch = !query || [task.title, task.hunter, task.status, task.latestProgress, task.type].join(' ').toLowerCase().includes(query);
      return tabMatch && searchMatch;
    });
  }

  function render() {
    const current = filteredTasks();
    const activeLabel = tabs.find(tab => tab.key === activeTab)?.label || '全榜';
    if (board) board.innerHTML = renderTaskBoard(current);
    if (note) note.innerHTML = `当前视角：${activeLabel}${searchInput?.value ? ` · 检索“${escapeHtml(searchInput.value)}”` : ''} · <a href="./task-detail.html">进入任务详情页骨架</a>`;
    if (tabsRoot) tabsRoot.innerHTML = renderTaskTabs(tabs, activeTab);
    tabsRoot?.querySelectorAll('[data-task-tab]').forEach(btn => {
      btn.addEventListener('click', () => {
        activeTab = btn.getAttribute('data-task-tab') || 'all';
        render();
      });
    });
  }

  render();
}

async function init() {
  const res = await fetch('./data-1646.json', { cache: 'no-store' });
  const data = await res.json();

  const heroEyebrow = byId('hero-eyebrow');
  const kpiRow = byId('kpi-row');
  if (heroEyebrow && !heroEyebrow.textContent.trim()) heroEyebrow.textContent = data.hero?.eyebrow || '';
  if (kpiRow) kpiRow.innerHTML = renderKpis(data.kpis || []);

  byId('timeline-list').innerHTML = renderTimeline(data.timeline || []);
  byId('hunter-summary').innerHTML = renderSummaryStrip(data.hunterSummary || []);
  byId('roster-grid').innerHTML = renderHunters(data.hunters || []);
  byId('resource-kpis').innerHTML = renderResourceKpis(data.resources?.kpis || []);
  byId('model-bars').innerHTML = renderModelBars(data.resources?.models || []);
  byId('spend-alerts').innerHTML = renderSpendAlerts(data.resources?.alerts || []);

  const dossierPanelTag = document.querySelector('.dossier-panel .panel-tag');
  if (dossierPanelTag) dossierPanelTag.innerHTML = `<a href="./hunter-detail.html">HUNTER DOSSIERS</a>`;

  attachTaskBoardInteractions(data);
}

init().catch(err => {
  console.error('Failed to load dashboard data', err);
});
