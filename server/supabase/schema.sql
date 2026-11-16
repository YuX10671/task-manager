-- ================================================
-- 智能任务管理系统 · Supabase 建表脚本
-- 在 Supabase 控制台 -> SQL Editor 中粘贴并执行一次即可
-- ================================================

-- tasks 任务表
create table if not exists public.tasks (
  id         uuid primary key default gen_random_uuid(),
  title      text not null,
  priority   text not null default '低' check (priority in ('高', '中', '低')),
  completed  boolean not null default false,
  due_date   date,
  created_at timestamptz not null default now()
);

-- 便于按创建时间倒序展示（最新任务在最上面）
create index if not exists tasks_created_at_idx on public.tasks (created_at desc);

-- 开启行级安全
alter table public.tasks enable row level security;

-- 实训阶段简化：允许匿名读写（正式上线请改为登录认证 + 受限策略）
create policy "anon_read_tasks"   on public.tasks for select using (true);
create policy "anon_insert_tasks" on public.tasks for insert with check (true);
create policy "anon_update_tasks"  on public.tasks for update using (true);
create policy "anon_delete_tasks"  on public.tasks for delete using (true);
