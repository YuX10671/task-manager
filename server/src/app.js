// Express 应用：对外提供任务管理 REST API
// 抽离 app 以便本地直接启动，也便于部署为 Serverless 函数
import express from 'express'
import cors from 'cors'
import { db } from './db.js'

const app = express()

app.use(cors())
app.use(express.json())

// 健康检查：返回服务状态与当前数据存储模式
app.get('/api/health', (req, res) => {
  res.json({
    ok: true,
    mode: db.mode,
    time: new Date().toISOString(),
  })
})

// 获取全部任务
app.get('/api/tasks', async (req, res) => {
  try {
    const tasks = await db.list()
    res.json(tasks)
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

// 新增任务
app.post('/api/tasks', async (req, res) => {
  try {
    const { title, priority, due_date } = req.body
    if (!title || !title.trim()) {
      return res.status(400).json({ error: '任务标题不能为空' })
    }
    const validPriority = ['高', '中', '低'].includes(priority) ? priority : '低'
    const task = await db.create({
      title: title.trim(),
      priority: validPriority,
      completed: false,
      due_date: due_date || null,
    })
    res.status(201).json(task)
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

// 修改任务（切换完成状态、改标题 / 优先级 / 截止日期）
app.patch('/api/tasks/:id', async (req, res) => {
  try {
    const allowed = ['title', 'priority', 'completed', 'due_date']
    const payload = {}
    for (const key of allowed) {
      if (key in req.body) payload[key] = req.body[key]
    }
    const task = await db.update(req.params.id, payload)
    res.json(task)
  } catch (e) {
    res.status(404).json({ error: e.message })
  }
})

// 删除任务
app.delete('/api/tasks/:id', async (req, res) => {
  try {
    await db.remove(req.params.id)
    res.json({ ok: true })
  } catch (e) {
    res.status(404).json({ error: e.message })
  }
})

export { app, db }
