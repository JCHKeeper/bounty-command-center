const supabase = window.bccSupabase;
const slugify = window.bccSlugify;
const form = document.getElementById('hunter-form');
const statusEl = document.getElementById('hunter-form-status');
form?.addEventListener('submit', async (e) => {
  e.preventDefault();
  statusEl.textContent = '正在保存...';
  const fd = new FormData(form);
  const name = String(fd.get('name') || '').trim();
  const payload = {
    slug: slugify(name),
    name,
    role: String(fd.get('role') || '').trim(),
    title: String(fd.get('title') || '').trim(),
    status: String(fd.get('status') || '').trim(),
    model: String(fd.get('model') || '').trim(),
    load: String(fd.get('load') || '').trim(),
    success_rate: Number(fd.get('success_rate') || 0),
    avg_tokens: Number(fd.get('avg_tokens') || 0),
    tags: String(fd.get('tags') || '').split(',').map(s => s.trim()).filter(Boolean)
  };
  const { error } = await supabase.from('hunters').insert(payload);
  if (error) {
    statusEl.textContent = `保存失败：${error.message}`;
    return;
  }
  statusEl.textContent = '保存成功，正在跳转...';
  setTimeout(() => window.location.href = `./hunter-detail.html?id=${encodeURIComponent(payload.slug)}`, 600);
});
