import { useEffect, useMemo, useState } from 'react'
import { api } from './api.js'

const PRIORITIES = ['高', '中', '低']
const FILTERS = [
  { key: 'all', label: '全部' },
  { key: '高', label: '高优先级' },
  { key: '中', label: '中优先级' },
  { key: '低', label: '低优先级' },
]

// 判断任务是否逾期：有截止日期、未完成，且截止日期早于今天
function isOverdue(task) {
  if (!task.due_date || task.completed) return false
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const due = new Date(task.due_date + 'T00:00:00')
  return due < today
}

function formatDate(dateStr) {
  if (!dateStr) return ''
  const [y, m, d] = dateStr.split('-')
  return `${y}年${Number(m)}月${Number(d)}日`
}

export default function App() {
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [mode, setMode] = useState('')

  const [title, setTitle] = useState('')
  const [priority, setPriority] = useState('中')
  const [dueDate, setDueDate] = useState('')
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('all')
  const [submitting, setSubmitting] = useState(false)

  async function load() {
    try {
      const [list, health] = await Promise.all([api.list(), api.health()])
      setTasks(list)
      setMode(health.mode)
      setError('')
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  // 新增任务
  async function handleAdd(e) {
    e.preventDefault()
    if (!title.trim() || submitting) return
    setSubmitting(true)
    try {
      const created = await api.create({
        title,
        priority,
        due_date: dueDate || null,
      })
      setTasks((prev) => [created, ...prev])
      setTitle('')
      setDueDate('')
      setPriority('中')
      setError('')
    } catch (e) {
      setError(e.message)
    } finally {
      setSubmitting(false)
    }
  }

  // 切换完成 / 未完成（先更新界面，再同步到后端）
  async function handleToggle(task) {
    const next = !task.completed
    setTasks((prev) =>
      prev.map((t) => (t.id === task.id ? { ...t, completed: next } : t))
    )
    try {
      await api.update(task.id, { completed: next })
    } catch (e) {
      setTasks((prev) =>
        prev.map((t) => (t.id === task.id ? { ...t, completed: !next } : t))
      )
      setError(e.message)
    }
  }

  // 删除任务
  async function handleDelete(task) {
    setTasks((prev) => prev.filter((t) => t.id !== task.id))
    try {
      await api.remove(task.id)
    } catch (e) {
      setError(e.message)
      load()
    }
  }

  // 统计数据
  const stats = useMemo(() => {
    const total = tasks.length
    const done = tasks.filter((t) => t.completed).length
    const active = total - done
    const rate = total === 0 ? 0 : Math.round((done / total) * 100)
    return { total, done, active, rate }
  }, [tasks])

  // 筛选 + 搜索
  const visible = useMemo(() => {
    const kw = search.trim().toLowerCase()
    return tasks.filter((t) => {
      if (filter !== 'all' && t.priority !== filter) return false
      if (kw && !t.title.toLowerCase().includes(kw)) return false
      return true
    })
  }, [tasks, filter, search])

  return (
    <div className="page">
      <header className="header">
        <h1>智能任务管理系统</h1>
        <p className="subtitle">高效安排每一天，轻松掌握待办事项</p>
        <span className={mode === 'supabase' ? 'mode-badge ok' : 'mode-badge warn'}>
          {mode === 'supabase' ? '已连接云端数据库' : '本地演示存储 · 配置 Supabase 后将存入云端'}
        </span>
      </header>

      {error && <div className="alert">{error}</div>}

      {/* 统计卡片 */}
      <section className="stats">
        <div className="stat-card">
          <div className="stat-num">{stats.total}</div>
          <div className="stat-label">任务总数</div>
        </div>
        <div className="stat-card">
          <div className="stat-num done">{stats.done}</div>
          <div className="stat-label">已完成</div>
        </div>
        <div className="stat-card">
          <div className="stat-num active">{stats.active}</div>
          <div className="stat-label">未完成</div>
        </div>
        <div className="stat-card">
          <div className="stat-num rate">{stats.rate}%</div>
          <div className="stat-label">完成率</div>
        </div>
      </section>

      {/* 新增任务表单 */}
      <section className="card form-card">
        <form onSubmit={handleAdd} className="form">
          <input
            className="input title-input"
            type="text"
            placeholder="输入任务标题，例如：完成实训报告"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <div className="form-row">
            <label className="field">
              <span>优先级</span>
              <select
                className="input"
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
              >
                {PRIORITIES.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </label>
            <label className="field">
              <span>截止日期</span>
              <input
                className="input"
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
              />
            </label>
            <button className="btn primary" type="submit" disabled={submitting || !title.trim()}>
              {submitting ? '添加中…' : '添加任务'}
            </button>
          </div>
        </form>
      </section>

      {/* 搜索与筛选 */}
      <section className="toolbar">
        <input
          className="input search-input"
          type="text"
          placeholder="搜索任务标题…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <div className="filters">
          {FILTERS.map((f) => (
            <button
              key={f.key}
              className={filter === f.key ? 'filter-btn active' : 'filter-btn'}
              onClick={() => setFilter(f.key)}
            >
              {f.label}
            </button>
          ))}
        </div>
      </section>

      {/* 任务列表 */}
      <section className="task-list">
        {loading ? (
          <div className="empty">加载中…</div>
        ) : visible.length === 0 ? (
          <div className="empty">暂无任务，添加一条新任务吧</div>
        ) : (
          visible.map((task) => {
            const overdue = isOverdue(task)
            return (
              <div
                key={task.id}
                className={
                  task.completed ? 'task-card completed' : 'task-card'
                }
              >
                <input
                  type="checkbox"
                  className="checkbox"
                  checked={task.completed}
                  onChange={() => handleToggle(task)}
                  aria-label="切换完成状态"
                />
                <div className="task-main">
                  <div className="task-title">{task.title}</div>
                  <div className="task-meta">
                    <span className={`priority p-${task.priority}`}>{task.priority}优先级</span>
                    {task.due_date && (
                      <span className={overdue ? 'due overdue' : 'due'}>
                        {overdue ? '已逾期 · ' : '截止 '}
                        {formatDate(task.due_date)}
                      </span>
                    )}
                  </div>
                </div>
                <button
                  className="btn danger"
                  onClick={() => handleDelete(task)}
                  aria-label="删除任务"
                >
                  删除
                </button>
              </div>
            )
          })
        )}
      </section>

      <footer className="footer">智能任务管理系统 · React + Node.js + Supabase</footer>
    </div>
  )
}
