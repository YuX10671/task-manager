# 智能任务管理系统（Task Manager）

一个前后端分离的任务管理小项目：**前端 React + 后端 Node.js(Express) + 数据库 Supabase(PostgreSQL)**，中文界面，蓝白清爽卡片式设计，适配电脑与手机。

---

## 一、功能清单

### 核心功能
- [x] 添加任务：输入任务标题，选择优先级（高 / 中 / 低），可设截止日期
- [x] 任务列表：展示全部任务，最新创建的排在最上面
- [x] 完成任务：点击复选框在「未完成 / 已完成」之间切换
- [x] 删除任务：删除不需要的任务
- [x] 优先级筛选：全部 / 高优先级 / 中优先级 / 低优先级
- [x] 已完成任务：标题加删除线、文字颜色变淡

### 实用功能
- [x] 统计：任务总数、已完成数量、未完成数量、完成率
- [x] 任务搜索：按标题关键词搜索
- [x] 截止日期：可选择任务截止日期
- [x] 逾期提醒：未完成且已过期的任务用红色标注

---

## 二、技术栈

| 层级 | 技术 | 说明 |
| --- | --- | --- |
| 前端 | React 18 + Vite | 页面与交互，中文界面 |
| 后端 | Node.js + Express | 提供 REST API，连接数据库 |
| 数据库 | Supabase（PostgreSQL） | 云端保存任务数据 |
| 代码托管 | GitHub | 上传源码 |
| 网站部署 | Vercel | 前端 / 全栈部署 |

---

## 三、目录结构

```
task-manager/
├── api/
│   └── index.js            # Vercel Serverless 函数入口（复用 Express 应用）
├── server/                 # 后端 Node.js 服务
│   ├── src/
│   │   ├── app.js          # Express 应用与路由（增删改查接口）
│   │   ├── index.js        # 本地启动入口
│   │   └── db.js           # 数据访问层（Supabase / 本地文件自动切换）
│   ├── supabase/
│   │   └── schema.sql      # Supabase 建表脚本
│   ├── data/               # 未配置 Supabase 时的本地演示数据（自动生成）
│   ├── .env.example        # 后端环境变量示例
│   └── package.json
├── client/                 # 前端 React 项目
│   ├── src/
│   │   ├── App.jsx         # 主页面与全部交互逻辑
│   │   ├── api.js          # 前端请求后端接口的封装
│   │   ├── main.jsx        # 前端入口
│   │   └── styles.css      # 蓝白响应式样式
│   ├── .env.example        # 前端环境变量示例
│   └── package.json
├── vercel.json             # Vercel 路由重写配置
└── README.md
```

---

## 四、本地运行（先跑通完整版本）

### 1. 环境要求
- Node.js 18 或更高版本（推荐 20+）
- npm 9 或更高版本

### 2. 安装依赖
在项目根目录执行：

```bash
npm run install:all
```

该命令会分别安装 `server`、`client` 和根目录的依赖。

### 3. 启动项目
在项目根目录执行：

```bash
npm run dev
```

会同时启动后端和前端：

- 后端接口：http://localhost:4000
- 前端页面：http://localhost:5173

浏览器打开 **http://localhost:5173** 即可使用。

> 说明：在还没有配置 Supabase 时，后端会自动使用本地 JSON 文件（`server/data/tasks.json`）保存数据，保证项目可以先在本地完整跑通；配置 Supabase 后数据会自动改为存入云端。

### 4. 常用命令

| 命令 | 作用 |
| --- | --- |
| `npm run install:all` | 安装全部依赖 |
| `npm run dev` | 同时启动前后端（开发模式） |
| `npm run build` | 打包前端生产版本（输出到 `client/dist`） |
| `npm start` | 单独启动后端 |

---

## 五、接入 Supabase 云端数据库

> 当前版本已把 Supabase 集成代码写好，只需按下面步骤填入凭证，无需改业务代码。

### 1. 创建 Supabase 项目
1. 打开 [supabase.com](https://supabase.com)，注册 / 登录后新建一个项目（New Project），记下数据库密码。
2. 等待项目初始化完成。

### 2. 创建数据表
1. 进入项目左侧菜单 **SQL Editor**，点击 New Query。
2. 打开本项目 `server/supabase/schema.sql`，把里面的 SQL 全部复制粘贴进去，点击运行（Run）。
3. 在 **Table Editor** 中应能看到 `tasks` 表。

表结构如下：

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `id` | uuid | 主键，自动生成 |
| `title` | text | 任务标题 |
| `priority` | text | 优先级：高 / 中 / 低 |
| `completed` | boolean | 是否完成，默认 false |
| `due_date` | date | 截止日期，可为空 |
| `created_at` | timestamptz | 创建时间，自动生成，用于倒序排序 |

### 3. 填写环境变量
1. 复制 `server/.env.example` 为 `server/.env`：

```bash
cp server/.env.example server/.env
```

2. 在 Supabase 项目 **Settings → API** 中复制以下信息，填入 `server/.env`：

```env
PORT=4000
SUPABASE_URL=https://你的项目-ref.supabase.co
SUPABASE_ANON_KEY=你的anon_key
SUPABASE_SERVICE_ROLE_KEY=你的service_role_key
```

3. 重启后端，页面顶部徽标显示「已连接云端数据库」即表示接入成功。

### 4. 验证云端读写
在页面上添加、勾选完成、删除几条任务，然后回到 Supabase 的 **Table Editor**，能看到数据同步变化，即说明增、查、改、删都已走云端数据库。

---

## 六、部署上线

### 1. 上传到 GitHub
1. 在 GitHub 新建一个空仓库（不要勾选 README / .gitignore）。
2. 在项目根目录执行：

```bash
git init
git add .
git commit -m "智能任务管理系统初版"
git branch -M main
git remote add origin https://github.com/你的用户名/仓库名.git
git push -u origin main
```

> 注意：`.env` 已在 `.gitignore` 中被忽略，密钥不会上传到 GitHub。

### 2. 部署到 Vercel

#### 方案 A：前端与后端一起部署在 Vercel（推荐对应本项目结构）
1. 打开 [vercel.com](https://vercel.com)，用 GitHub 账号登录，点击 **Add New → Project**，选择刚上传的仓库。
2. 配置项目：
   - **Root Directory**：保持仓库根目录。
   - **Framework Preset**：选 `Vite`（或 Other）。
   - **Install Command**：保持默认 `npm install`（安装根目录依赖，即后端函数所需的 express / cors / @supabase/supabase-js 等）。
   - **Build Command**：`npm install --prefix client && npm run build --prefix client`
   - **Output Directory**：`client/dist`
3. 在 **Environment Variables** 中添加 Supabase 相关变量（与 `server/.env` 一致）：
   - `SUPABASE_URL`
   - `SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
4. 点击 **Deploy**。根目录 `api/index.js` 会作为 Serverless 函数处理 `/api/**` 请求，`vercel.json` 已配好路由重写；前端请求 `/api/...` 走同域，`VITE_API_BASE` 留空即可。

#### 方案 B：前后端分离部署
- 后端 Express 单独部署到 Render / Railway / 云服务器，配置 Supabase 环境变量，拿到后端公网地址。
- 前端在 Vercel 导入 `client` 目录，环境变量 `VITE_API_BASE` 填后端地址（例如 `https://your-api.onrender.com`）。

### 3. 绑定自己的域名
1. 在 Vercel 项目 **Settings → Domains** 中添加你的域名。
2. 按提示到域名服务商处配置 DNS 解析（A 记录或 CNAME）。
3. 等待生效后即可通过自己的域名访问。

### 4. 生产环境环境变量汇总

**后端（Serverless / Node 服务）**

| 变量名 | 来源 |
| --- | --- |
| `SUPABASE_URL` | Supabase → Settings → API |
| `SUPABASE_ANON_KEY` | Supabase → Settings → API |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase → Settings → API |

**前端（Vercel）**

| 变量名 | 说明 |
| --- | --- |
| `VITE_API_BASE` | 后端接口地址；前后端同域部署时留空即可 |

---

## 七、常见问题

**Q：页面顶部显示「本地演示存储」？**
A：说明还没配置 Supabase 环境变量。按第五节填好 `server/.env` 并重启后端即可切换到云端。

**Q：添加任务后刷新页面数据还在吗？**
A：接入 Supabase 后数据存在云端，刷新、换设备都在；本地演示模式下数据保存在 `server/data/tasks.json`。

**Q：端口被占用怎么办？**
A：后端默认 4000、前端默认 5173。可在 `server/.env` 修改 `PORT`，或关闭占用对应端口的程序后重启。

**Q：部署后接口报 404 / 跨域？**
A：检查 `VITE_API_BASE` 是否指向正确的后端地址；同域部署时留空，由 `vercel.json` 转发 `/api`。

---

## 八、后续可扩展方向

- 用户注册登录（Supabase Auth），每个人只看自己的任务
- 任务编辑（修改标题 / 优先级 / 日期）
- 任务标签、子任务、提醒通知
- 数据统计图表与深色模式
