truncate table public.task_actions, public.task_logs, public.tasks, public.hunters, public.resource_kpis, public.resource_models, public.resource_alerts, public.timeline_events, public.dashboard_kpis restart identity cascade;

insert into public.dashboard_kpis (label, value, unit, variant, sort_order) values
('S级任务', '05', '任务', 'tier-s crest-card', 1),
('执行中', '31', '任务', 'running crest-card', 2),
('停滞中', '05', '任务', 'stalled crest-card', 3),
('待委派', '04', '任务', 'unassigned crest-card', 4),
('待审批', '03', '任务', 'approval crest-card', 5),
('已完成', '14', '任务', 'done crest-card', 6);

insert into public.timeline_events (happened_at_label, title, text, level, sort_order) values
('10:41', 'Northwind 接取 VX-771', '已从普通追猎转入重装突入方案。', 'info', 1),
('10:36', 'Kite 请求补充边境日志', '情报链缺两段访问信息，当前未能完成审计。', 'warn', 2),
('10:28', 'Delta 完成密钥回收单', '已结单并回传战利品，等待冲阶许可。', 'success', 3),
('10:19', '灰港护送单转入待审批', '需要你决定是否启用高价通道。', 'critical', 4);

insert into public.hunters (slug, name, role, class, mark, title, status, model, load, success_rate, avg_tokens, champion, ready_upgrade, is_full, tags) values
('northwind', 'Northwind', '重装先遣 / 风压刀路', 'scout', '锋', '银翼战猎', '高压作战中', 'gpt-5.4', '2 / 3', 91, 38000, true, false, false, '["高危突入","多阶段执行","重装决策"]'::jsonb),
('abyss-3', 'Abyss-3', '深潜回收 / 湮流甲系', 'salvage', '湮', '深潮封收手', '回收线稳定', 'claude-sonnet', '1 / 2', 94, 29000, false, false, false, '["回收","样本比对","中成本"]'::jsonb),
('kite', 'Kite', '边境情报 / 灵感测绘', 'intel', '讯', '风切探报人', '等待补充上下文', 'gemini-2.5-pro', '1 / 3', 87, 17000, false, false, false, '["检索","情报","低成本"]'::jsonb),
('delta', 'Delta', '密钥猎取 / 圣柜兵装', 'vault', '柜', '可换升级', '已够数可换模组', 'gpt-4.1', '0 / 2', 96, 22000, false, true, true, '["密钥","精密操作","高成功率"]'::jsonb),
('morrow', 'Morrow', '后勤补给 / 炉心维护', 'supply', '炉', '灰炉后勤手', '补给链待放行', 'gpt-4o-mini', '1 / 4', 89, 8000, false, false, false, '["后勤","修复","超低成本"]'::jsonb),
('vanta', 'Vanta', '夜幕渗透 / 影蚀装具', 'shadow', '影', '夜烬潜猎手', '高价值潜猎中', 'o3', '2 / 2', 90, 41000, false, false, false, '["潜猎","布控","高成本高收益"]'::jsonb);

with inserted_tasks as (
  insert into public.tasks (slug, title, meta, badge, badge_type, status, status_key, tier_key, tier_class, summary, description, latest_progress, published_at_label, updated_at_label, current_issue, done_when, hunter_label, deadline_label, tokens_label, reward_label, risk, risk_level, task_type, focus, needs_action, high_cost, deadline_risk, progress)
  values
  ('vx-771', '追猎裂界兽核 · VX-771', '猎杀单 · Northwind / Vanta · 6 分钟前回报', 'SS级', 'danger', '执行中', 'doing', 's', 'tier-s', '当前建议从持续围猎改为重装突入，避免继续拉高外环耗损。', '目标是封回裂界兽核并控制外环损耗，不追求无意义拉锯。当前最关键的是及时切换方案，用更强执行位快速收束战线。', '外围封锁已经完成，正在评估是否直接切换重装突入。', '今天 09:12', '6 分钟前', '若继续围猎，Token 与时间都会继续放大。', '兽核封回、外环失压停止、任务正式结单。', 'Northwind / Vanta', '1h 20m', '186k', '¥188,000', '高风险', 'danger', '猎杀 / 封收', true, true, true, true, 70),
  ('gray-port-escort', '护送情报员穿越灰港封锁', '护送单 · 待你点头 · 12 分钟前更新', 'A级', 'warn', '待审批', 'approval', 'a', 'tier-a', '方案已经齐了，只差是否启用高价安全通道。', '目标是安全护送情报员穿越灰港封锁区。现有两套方案均可执行，但高价通道需要你拍板才能放行。', '路线、掩护与接应都已准备完毕。', '今天 09:48', '12 分钟前', '等待是否启用高价安全通道。', '情报员安全抵达接应点并确认资料完整。', '待委派', '34m', '28k', '¥52,000', '拍板中', 'warn', '护送', false, true, false, true, 82),
  ('key-recovery-delta', '回收黑匣密钥并校验权限链', '精密单 · Delta · 18 分钟前更新', 'S级', 'danger', '待升级', 'queued', 's', 'tier-s', '主任务已完成，当前更适合转成冲阶 / 模组更换流程。', 'Delta 已完成主任务回收，但当前更重要的是是否直接进入升级与模组切换。', '密钥已经回收，权限链校验完成。', '今天 08:55', '18 分钟前', '要不要立刻开升级流程。', '密钥归档完毕，权限链确认，升级流程开启。', 'Delta', '今天内', '22k', '¥76,000', '机会窗口', 'success', '回收 / 校验', false, true, false, false, 100)
  returning id, slug
)
insert into public.task_logs (task_id, happened_at_label, title, text, level)
select id, '10:41', 'Northwind 回报最新态势', '外围封锁已稳，但需要决定是否上重装。', 'info' from inserted_tasks where slug = 'vx-771'
union all
select id, '10:35', 'Vanta 提交风险评估', '继续拉扯将明显抬高消耗。', 'warn' from inserted_tasks where slug = 'vx-771'
union all
select id, '10:22', '任务进入第三阶段封锁', '已具备收束条件。', 'success' from inserted_tasks where slug = 'vx-771'
union all
select id, '10:19', '任务转入待审批', '只差放行高价通道。', 'critical' from inserted_tasks where slug = 'gray-port-escort'
union all
select id, '10:14', '护送方案已齐', '执行队列已经就位。', 'success' from inserted_tasks where slug = 'gray-port-escort'
union all
select id, '10:28', '密钥回收完成', '已完成黑匣回收并同步主档案。', 'success' from inserted_tasks where slug = 'key-recovery-delta';

with task_refs as (select id, slug from public.tasks)
insert into public.task_actions (task_id, label, sort_order)
select id, '标记完成', 1 from task_refs where slug = 'vx-771'
union all select id, '改为停滞', 2 from task_refs where slug = 'vx-771'
union all select id, '改为待审批', 3 from task_refs where slug = 'vx-771'
union all select id, '更换猎人', 4 from task_refs where slug = 'vx-771'
union all select id, '打开原始记录', 5 from task_refs where slug = 'vx-771'
union all select id, '批准放行', 1 from task_refs where slug = 'gray-port-escort'
union all select id, '驳回方案', 2 from task_refs where slug = 'gray-port-escort'
union all select id, '改为停滞', 3 from task_refs where slug = 'gray-port-escort'
union all select id, '更换猎人', 4 from task_refs where slug = 'gray-port-escort'
union all select id, '开始升级流程', 1 from task_refs where slug = 'key-recovery-delta'
union all select id, '登记模组更换', 2 from task_refs where slug = 'key-recovery-delta';

insert into public.resource_kpis (label, value, note, variant, sort_order) values
('今日 Token', '524k', '+12%', 'violet', 1),
('今日成本', '¥146.8', 'S级为主', 'warn', 2),
('产出比', '78%', '无需重跑', 'success', 3);

insert into public.resource_models (name, tokens, cost, percent, sort_order) values
('gpt-5.4', '148k', '¥46.2', 148, 1),
('claude-sonnet', '96k', '¥24.6', 96, 2),
('gemini-2.5-pro', '71k', '¥15.3', 71, 3);

insert into public.resource_alerts (title, meta, critical, sort_order) values
('VX-771 已烧 186k', '切重装突入', true, 1),
('Kite 审计重跑 3 次', '先补日志', false, 2);
