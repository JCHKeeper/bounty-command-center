const supabase = window.bccSupabase;
const auth = window.bccAuth;
const slugify = window.bccSlugify;
const form = document.getElementById('task-form');
const statusEl = document.getElementById('task-form-status');
function inferTier(badge = '') { const v = badge.toLowerCase(); if (v.includes('s')) return 's'; if (v.includes('a')) return 'a'; if (v.includes('b')) return 'b'; if (v.includes('c')) return 'c'; return 'd'; }
function inferBadgeType(badge = '') { const tier = inferTier(badge); if (tier === 's') return 'danger'; if (tier === 'a') return 'warn'; return 'info'; }

(async function gate() {
  const owner = await auth.isOwner();
  if (!owner) {
    statusEl.textContent = '当前不是 owner，无法发布任务。请先用 owner 邮箱登录。';
    [...form.elements].forEach(el => { if (el.tagName !== 'DIV') el.disabled = true; });
  }
})();

form?.addEventListener('submit', async (e) => {
  e.preventDefault();
  if (!(await auth.isOwner())) {
    statusEl.textContent = '无写权限。';
    return;
  }
  statusEl.textContent = '正在发布...';
  const fd = new FormData(form);
  const title = String(fd.get('title') || '').trim();
  const badge = String(fd.get('badge') || '').trim();
  const status = String(fd.get('status') || '').trim();
  const tier = inferTier(badge);
  const payload = {
    slug: slugify(title), title, badge, badge_type: inferBadgeType(badge), status,
    status_key: /审批/.test(status) ? 'approval' : /执行/.test(status) ? 'doing' : 'queued',
    tier_key: tier, tier_class: `tier-${tier}`,
    summary: String(fd.get('summary') || '').trim(),
    description: String(fd.get('description') || '').trim(),
    latest_progress: '任务刚创建，等待进一步推进。', published_at_label: '刚刚', updated_at_label: '刚刚',
    hunter_label: String(fd.get('hunter_label') || '').trim(), deadline_label: String(fd.get('deadline_label') || '').trim(),
    reward_label: String(fd.get('reward_label') || '').trim(), tokens_label: String(fd.get('tokens_label') || '').trim(), progress: 0,
    meta: `${badge} · ${status}`
  };
  const { data, error } = await supabase.from('tasks').insert(payload).select('slug,id').single();
  if (error) { statusEl.textContent = `发布失败：${error.message}`; return; }
  await supabase.from('task_actions').insert([{ task_id: data.id, label: '标记完成', sort_order: 1 }, { task_id: data.id, label: '改为停滞', sort_order: 2 }, { task_id: data.id, label: '更换猎人', sort_order: 3 }]);
  await supabase.from('task_logs').insert({ task_id: data.id, happened_at_label: '刚刚', title: '任务已创建', text: '已从发布页录入任务。', level: 'info' });
  statusEl.textContent = '发布成功，正在跳转...';
  setTimeout(() => window.location.href = `./task-detail.html?id=${encodeURIComponent(data.slug)}`, 600);
});
