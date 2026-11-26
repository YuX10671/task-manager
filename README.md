# 智能任务管理系统（Task Manager）

React + Node.js(Express) + Supabase(PostgreSQL)，中文界面、蓝白卡片式、适配电脑与手机。

## 功能

- 添加任务、优先级（高/中/低）、截止日期
- 任务列表（最新在最上面）、完成状态切换、删除
- 优先级筛选、标题搜索
- 已完成任务显示删除线与变淡文字；逾期任务红色提醒
- 统计：任务总数、已完成、未完成、完成率

## 目录结构

```
task-manager/
├── index.html            # 页面入口
├── vite.config.js        # 前端构建与本地 /api 代理
├── src/                  # React 前端
│   ├── App.jsx           # 页面与全部交互
│   ├── api.js            # 接口封装
│   ├── main.jsx
│   └── styles.css        # 蓝白响应式样式
├── server/               # Node.js 后端
│   ├── app.js            # Express 路由（增删改查）
│   ├── db.js             # 数据层（Supabase / 本地文件自动切换）
│   ├── dev.js            # 本地启动入口
│   └── supabase/schema.sql
├── api/index.js          # Vercel Serverless 函数入口
├── vercel.json           # Vercel 构建与路由配置
└── .env.example
```

## 本地运行

```bash
npm install
npm run dev
```

- 前端：http://localhost:5173
- 后端：http://localhost:4000

未配置 Supabase 时自动用本地 `data/tasks.json` 存数据；配置后自动走云端。

## 接入 Supabase

1. 新建项目，在 SQL Editor 执行 `server/supabase/schema.sql`。
2. 复制 `.env.example` 为 `.env`，填入 **Project Settings → API** 中的：
   - `SUPABASE_URL`
   - `SUPABASE_ANON_KEY`（publishable key）
   - `SUPABASE_SERVICE_ROLE_KEY`（secret key，服务端用，勿外泄）
3. 重启后端，页面顶部显示「已连接云端数据库」即成功。

## 部署到 Vercel

1. 把仓库导入 Vercel（Framework 选 Vite，构建命令 `npm run build`，输出目录 `dist`，根目录保持默认）。
2. 在 Environment Variables 添加上面三个 Supabase 变量。
3. Deploy 后即可通过 `xxx.vercel.app` 访问；`/api/**` 由 `api/index.js` 处理。
4. 绑定自己的域名：Vercel → Settings → Domains，按提示配置 DNS。

## 常用命令

| 命令 | 作用 |
| --- | --- |
| `npm run dev` | 同时启动前后端 |
| `npm run build` | 构建前端到 `dist` |
| `npm start` | 只启动后端 |
