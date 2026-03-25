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
    <a href="./task-detail.html?id=${encodeURIComponent(slugify(task.title))}" class="task-card-link">
      <article class="bounty-row compact-bounty-row task-card-compact ${escapeHtml(task.tierClass || '')} ${task.statusKey === 'blocked' ? 'blocked' : ''} ${task.statusKey === 'approval' ? 'approval' : ''}">
        <div class="bounty-row-main">
          <div class="bounty-row-head compact-bounty-head compact-card-head">
            <span class="badge ${escapeHtml(task.badgeType || 'info')}">${escapeHtml(task.badge)}</span>
          </div>
          <div class="task-title compact-task-title">${escapeHtml(task.title)}</div>
          <div class="task-meta-grid compact-task-meta-grid">
            <div class="task-meta-row">
              <span class="task-meta-label">任务状态</span>
              <strong>${escapeHtml(task.status)}</strong>
            </div>
            <div class="task-meta-row">
              <span class="task-meta-label">委托猎人</span>
              <strong>${escapeHtml(task.hunter)}</strong>
            </div>
            <div class="task-meta-row">
              <span class="task-meta-label">任务进度</span>
              <strong>${Number(task.progress) || 0}%</strong>
            </div>
            <div class="task-meta-row">
              <span class="task-meta-label">委托时间</span>
              <strong>${escapeHtml(task.publishedAt || task.updatedAt || '-')}</strong>
            </div>
          </div>
        </div>
      </article>
    </a>
  `).join('');
}

function getHunterGrade(h) {
  if (h.grade) return h.grade;
  const success = Number(String(h.successRate || '').replace('%', '')) || 0;
  const avg = Number(String(h.avgTokens || '').toLowerCase().replace('k', '')) || 0;
  if (success >= 95 && avg <= 25) return 'S';
  if (success >= 90) return 'A';
  if (success >= 86) return 'B';
  if (success >= 80) return 'C';
  return 'D';
}

function getSpendBand(value = '') {
  const avg = Number(String(value).toLowerCase().replace('k', '')) || 0;
  if (avg <= 10) return '超低耗';
  if (avg <= 20) return '低耗';
  if (avg <= 35) return '中耗';
  return '高耗';
}

function getStatusTone(status = '') {
  if (/空闲|可派|升级/.test(status)) return 'ready';
  if (/执行|作战|潜猎|稳定/.test(status)) return 'active';
  if (/等待|放行|上下文|补充/.test(status)) return 'waiting';
  if (/满|高压|风险/.test(status)) return 'risk';
  return 'neutral';
}

function renderHunters(items) {
  return items.map(h => {
    const grade = getHunterGrade(h);
    const skills = (h.skills || h.tags || []).slice(0, 3);
    const spendBand = h.spendBand || getSpendBand(h.avgTokens);
    const statusTone = getStatusTone(h.status);
    return `
    <article class="hunter-card dossier-card grade-${escapeHtml(grade.toLowerCase())} ${h.champion ? 'champion' : ''} ${h.readyUpgrade ? 'ready-upgrade' : ''}">
      <div class="hunter-head hunter-head-compact">
        <div class="hunter-ident hunter-ident-flat">
          <div class="hunter-title-wrap">
            <div class="hunter-name-row">
              <div class="hunter-name-inline">
                <div class="hunter-name">${escapeHtml(h.name)}</div>
                <span class="grade-badge grade-${escapeHtml(grade.toLowerCase())}">${escapeHtml(grade)}</span>
              </div>
              <a class="hunter-link-inline" href="./hunter-detail.html?id=${encodeURIComponent(slugify(h.name))}">查看档案</a>
            </div>
          </div>
        </div>
      </div>
      <div class="hunter-status-row">
        <span class="hunter-status-chip ${escapeHtml(statusTone)}">${escapeHtml(h.status)}</span>
      </div>
      <div class="hunter-skill-block">
        <span class="hunter-block-label">擅长技能</span>
        <div class="hunter-skills">${skills.map(tag => `<span>${escapeHtml(tag)}</span>`).join('')}</div>
      </div>
      <div class="dossier-metrics compact-dossier-metrics compact-dossier-metrics-inline">
        <span>成功率<strong>${escapeHtml(h.successRate)}</strong></span>
        <span>均耗<strong>${escapeHtml(h.avgTokens)} · ${escapeHtml(spendBand)}</strong></span>
      </div>
    </article>
  `;
  }).join('');
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
