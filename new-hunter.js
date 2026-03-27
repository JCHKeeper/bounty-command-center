const supabase = window.bccSupabase;
const auth = window.bccAuth;
const slugify = window.bccSlugify;
const form = document.getElementById('hunter-form');
const statusEl = document.getElementById('hunter-form-status');

(async function gate() {
  const owner = await auth.isOwner();
  if (!owner) {
    statusEl.textContent = '当前不是 owner，无法写入。请先用 owner 邮箱登录。';
    [...form.elements].forEach(el => { if (el.tagName !== 'DIV') el.disabled = true; });
  }
})();

form?.addEventListener('submit', async (e) => {
  e.preventDefault();
  if (!(await auth.isOwner())) {
    statusEl.textContent = '无写权限。';
    return;
  }
  statusEl.textContent = '正在保存...';
  const fd = new FormData(form);
  const name = String(fd.get('name') || '').trim();
  const initialTags = fd.getAll('initial_tags').map(s => String(s).trim()).filter(Boolean);
  const payload = {
    slug: slugify(name),
    name,
    class: String(fd.get('source') || '').trim(),
    mark: String(fd.get('note') || '').trim(),
    status: '观察中',
    role: '待识别',
    title: '观察档案',
    load: '0',
    success_rate: null,
    avg_tokens: null,
    tags: initialTags
  };
  const { error } = await supabase.from('hunters').insert(payload);
  if (error) {
    statusEl.textContent = `保存失败：${error.message}`;
    return;
  }
  statusEl.textContent = '保存成功，正在跳转...';
  setTimeout(() => window.location.href = `./hunter-detail.html?id=${encodeURIComponent(payload.slug)}`, 600);
});
