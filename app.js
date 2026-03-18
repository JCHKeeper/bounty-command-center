const byId = (id) => document.getElementById(id);

function escapeHtml(str = '') {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function renderKpis(items) {
  return items.map(item => `
    <article class="kpi-card ${escapeHtml(item.variant || '')}">
      <span>${escapeHtml(item.label)}</span>
      <strong>${escapeHtml(item.value)}</strong>
      <em>${escapeHtml(item.note)}</em>
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

function renderQuickActions(items) {
  return items.map(label => `<button>${escapeHtml(label)}</button>`).join('');
}

function renderMedalSummary(items) {
  return items.map(item => `
    <div class="summary-pill"><span>${escapeHtml(item.label)}</span><strong>${escapeHtml(item.value)}</strong></div>
  `).join('');
}

function renderHunters(items) {
  return items.map(h => `
    <article class="hunter-card ${h.champion ? 'champion' : ''} ${h.readyUpgrade ? 'ready-upgrade' : ''}">
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
    </article>
  `).join('');
}

function renderTasks(items) {
  return items.map(task => `
    <article class="compact-task-row ${task.blocked ? 'blocked' : ''} ${task.done ? 'done' : ''}">
      <div>
        <div class="task-title">${escapeHtml(task.title)}</div>
        <div class="task-meta">${escapeHtml(task.meta)}</div>
      </div>
      <span class="badge ${escapeHtml(task.badgeType || 'info')}">${escapeHtml(task.badge)}</span>
    </article>
  `).join('');
}

async function init() {
  const res = await fetch('./data.json?v=20260318-1424', { cache: 'no-store' });
  const data = await res.json();

  byId('hero-eyebrow').textContent = data.hero.eyebrow;
  byId('hero-title').textContent = data.hero.title;
  byId('hero-description').textContent = data.hero.description;
  byId('kpi-row').innerHTML = renderKpis(data.kpis || []);

  const bounty = data.primeBounty;
  byId('bounty-ribbon').textContent = bounty.ribbon;
  byId('wanted-seal').textContent = bounty.seal;
  byId('wanted-id').textContent = bounty.id;
  byId('wanted-publisher').textContent = bounty.publisher;
  byId('bounty-title').textContent = bounty.title;
  byId('bounty-meta').textContent = bounty.meta;
  byId('bounty-priority').textContent = bounty.priority;
  byId('bounty-summary').textContent = bounty.summary;
  byId('bounty-facts').innerHTML = renderFacts(bounty.facts || []);
  byId('bounty-rewards').innerHTML = renderRewards(bounty.rewards || []);
  byId('bounty-actions').innerHTML = (bounty.actions || []).map((label, i) => `<a class="${i === 0 ? 'primary-btn bounty-btn' : 'ghost-btn'}" href="#">${escapeHtml(label)}</a>`).join('');

  byId('alerts-list').innerHTML = renderAlerts(data.alerts || []);
  byId('quick-actions').innerHTML = renderQuickActions(data.quickActions || []);
  byId('medal-rule').innerHTML = `${escapeHtml(data.medalRule).replace('100', '<strong>100</strong>')}`;
  byId('medal-summary').innerHTML = renderMedalSummary(data.medalSummary || []);
  byId('roster-grid').innerHTML = renderHunters(data.hunters || []);
  byId('task-list').innerHTML = renderTasks(data.tasks || []);
}

init().catch(err => {
  console.error('Failed to load dashboard data', err);
});
