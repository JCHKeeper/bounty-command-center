const supabase = window.bccSupabase;
const auth = window.bccAuth;
const slugify = window.bccSlugify;
const form = document.getElementById('marketing-intake-form');
const statusEl = document.getElementById('statusBox');
const previewEl = document.getElementById('preview');

const fields = [
  'projectName','location','propertyType','priceRange','developer','handover',
  'sellingPoints','mustEmphasize','avoidClaims','targetAudience','customerFocus',
  'channel','deliverableType','style','deadline','links','extraNotes'
];

const labels = {
  projectName: '项目名称',
  location: '项目位置',
  propertyType: '物业类型',
  priceRange: '价格区间',
  developer: '开发商 / 品牌',
  handover: '交房 / 现房情况',
  sellingPoints: '核心卖点',
  mustEmphasize: '必须强调的点',
  avoidClaims: '不能乱写 / 不能碰的点',
  targetAudience: '目标客户',
  customerFocus: '客户最在意什么',
  channel: '发布渠道',
  deliverableType: '要我做什么',
  style: '风格要求',
  deadline: '截止时间',
  links: '链接 / PDF / 图片 / 补充材料',
  extraNotes: '补充说明'
};

function value(id) {
  return (document.getElementById(id)?.value || '').trim();
}

function setStatus(text, klass = '') {
  statusEl.className = 'status ' + klass;
  statusEl.textContent = text;
}

function buildRequest() {
  const lines = [];
  lines.push('请按下面这份房地产推广需求直接出稿。');
  lines.push('');
  for (const id of fields) {
    const val = value(id);
    if (!val) continue;
    lines.push(`【${labels[id]}】`);
    lines.push(val);
    lines.push('');
  }
  lines.push('【执行要求】');
  lines.push('1. 先理解项目和目标客户');
  lines.push('2. 按发布渠道和风格要求出稿');
  lines.push('3. 直接给可发布版本');
  lines.push('4. 如果信息不足，先列出最关键缺口，再给可先用版本');
  return lines.join('\n').trim();
}

function updatePreview() {
  previewEl.textContent = buildRequest();
}

async function gate() {
  const owner = await auth.isOwner();
  if (!owner) {
    setStatus('当前不是 owner，无法直接提交入库。你可以先登录 owner 邮箱；未登录时仍可复制标准需求发给我。', 'warn');
    const submitBtn = document.getElementById('submitBtn');
    if (submitBtn) submitBtn.disabled = true;
  }
}

async function submitMarketingRequest() {
  if (!(await auth.isOwner())) {
    setStatus('无写权限。请先用 owner 邮箱登录后再提交。', 'warn');
    return;
  }
  const projectName = value('projectName');
  const deliverableType = value('deliverableType');
  const channel = value('channel');
  const titleBase = projectName || '未命名项目';
  const title = `房地产推广需求｜${titleBase}`;
  const slugBase = slugify(`${titleBase}-${Date.now()}`);
  const requestBody = buildRequest();
  const summaryBits = [value('location'), value('targetAudience'), channel, deliverableType].filter(Boolean);
  const summary = summaryBits.length ? summaryBits.join('｜') : '新的房地产推广需求';
  const payload = {
    slug: slugBase,
    title,
    meta: ['推广部', channel || '未写渠道', '刚提交'].filter(Boolean).join(' · '),
    badge: 'MKT',
    badge_type: 'info',
    status: '待出稿',
    status_key: 'queued',
    tier_key: 'b',
    tier_class: 'tier-b',
    summary,
    description: requestBody,
    latest_progress: '表单已提交，等待按需求出稿。',
    published_at_label: '刚刚',
    updated_at_label: '刚刚',
    current_issue: '',
    done_when: '已交付本次所需推广文案/排版内容。',
    hunter_label: '房地产推广部总监',
    deadline_label: value('deadline'),
    reward_label: '',
    tokens_label: '',
    progress: 0,
    task_type: '房地产推广',
    risk: '待处理',
    risk_level: 'safe',
    needs_action: true,
    focus: true,
    high_cost: false,
    deadline_risk: false
  };

  setStatus('正在提交到指挥中心…', 'warn');
  const { data, error } = await supabase.from('tasks').insert(payload).select('id,slug').single();
  if (error) {
    setStatus(`提交失败：${error.message}`, 'warn');
    return;
  }

  await supabase.from('task_logs').insert({
    task_id: data.id,
    happened_at_label: '刚刚',
    title: '推广需求已提交',
    text: '已通过网页表单进入任务库，等待出稿。',
    level: 'info'
  });

  await supabase.from('task_actions').insert([
    { task_id: data.id, label: '开始出稿', sort_order: 1 },
    { task_id: data.id, label: '补充资料', sort_order: 2 },
    { task_id: data.id, label: '标记完成', sort_order: 3 }
  ]);

  setStatus('提交成功，已进入指挥中心任务库。你可以直接继续发下一单，或打开任务详情查看。', 'ok');
  window.setTimeout(() => {
    window.location.href = `./task-detail.html?id=${encodeURIComponent(data.slug)}`;
  }, 700);
}

fields.forEach(id => {
  const el = document.getElementById(id);
  if (el) el.addEventListener('input', updatePreview);
});

document.getElementById('copyBtn')?.addEventListener('click', async () => {
  const text = buildRequest();
  try {
    await navigator.clipboard.writeText(text);
    setStatus('已复制标准需求。你现在直接发给我，我就能按这个格式出稿。', 'ok');
  } catch (err) {
    setStatus('复制失败了。你可以手动选中右侧预览内容再复制。', 'warn');
  }
});

document.getElementById('downloadBtn')?.addEventListener('click', () => {
  const text = buildRequest();
  const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  const project = value('projectName') || 'marketing-request';
  const safe = project.replace(/[^a-zA-Z0-9\u4e00-\u9fa5_-]+/g, '-');
  a.href = url;
  a.download = `${safe}-推广需求.txt`;
  a.click();
  URL.revokeObjectURL(url);
  setStatus('需求文件已下载。', 'ok');
});

document.getElementById('submitBtn')?.addEventListener('click', submitMarketingRequest);
form?.addEventListener('reset', () => {
  setTimeout(() => {
    updatePreview();
    setStatus('已清空。重新填好后可提交入库，或复制标准需求发给我。', 'warn');
  }, 0);
});

updatePreview();
gate();
