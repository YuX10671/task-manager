// 前端与后端 API 通信封装
// 本地开发走 Vite 代理 /api；生产环境可通过 VITE_API_BASE 指定后端地址
const BASE = import.meta.env.VITE_API_BASE || '/api'

async function request(url, options = {}) {
  const res = await fetch(BASE + url, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(data.error || '请求失败，请稍后重试')
  return data
}

export const api = {
  health: () => request('/health'),
  list: () => request('/tasks'),
  create: (payload) =>
    request('/tasks', { method: 'POST', body: JSON.stringify(payload) }),
  update: (id, payload) =>
    request(`/tasks/${id}`, { method: 'PATCH', body: JSON.stringify(payload) }),
  remove: (id) => request(`/tasks/${id}`, { method: 'DELETE' }),
}
