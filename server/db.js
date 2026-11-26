// 数据访问层：优先连接 Supabase 云端数据库；
// 若未配置 Supabase 环境变量，则自动回退到本地 JSON 文件存储，保证项目可先在本地跑通。
// 后续在 .env 中填入 Supabase 凭证后，无需改动业务代码即可切换到云端。

import dotenv from 'dotenv'
import { createClient } from '@supabase/supabase-js'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

// 必须在读取环境变量之前加载 .env（ESM 导入会被提升，故在此处先配置）
dotenv.config()

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const DATA_FILE = path.join(__dirname, '..', 'data', 'tasks.json')
const TABLE = 'tasks'

const SUPABASE_URL = process.env.SUPABASE_URL
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY

const useSupabase = Boolean(SUPABASE_URL && SUPABASE_KEY)

let supabase = null
if (useSupabase) {
  supabase = createClient(SUPABASE_URL, SUPABASE_KEY)
}

// ---------- 本地 JSON 文件回退存储 ----------
function readLocal() {
  try {
    if (!fs.existsSync(DATA_FILE)) return []
    return JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'))
  } catch {
    return []
  }
}

function writeLocal(tasks) {
  fs.mkdirSync(path.dirname(DATA_FILE), { recursive: true })
  fs.writeFileSync(DATA_FILE, JSON.stringify(tasks, null, 2))
}

export const db = {
  // 当前存储模式，供健康检查与界面提示使用
  mode: useSupabase ? 'supabase' : 'local',

  // 查询全部任务，按创建时间倒序（最新在最上面）
  async list() {
    if (useSupabase) {
      const { data, error } = await supabase
        .from(TABLE)
        .select('*')
        .order('created_at', { ascending: false })
      if (error) throw error
      return data
    }
    return readLocal().sort(
      (a, b) => new Date(b.created_at) - new Date(a.created_at)
    )
  },

  // 新增任务
  async create(payload) {
    if (useSupabase) {
      const { data, error } = await supabase
        .from(TABLE)
        .insert(payload)
        .select()
        .single()
      if (error) throw error
      return data
    }
    const tasks = readLocal()
    const task = {
      id: crypto.randomUUID(),
      created_at: new Date().toISOString(),
      ...payload,
    }
    tasks.unshift(task)
    writeLocal(tasks)
    return task
  },

  // 修改任务（完成状态 / 标题 / 优先级 / 截止日期）
  async update(id, payload) {
    if (useSupabase) {
      const { data, error } = await supabase
        .from(TABLE)
        .update(payload)
        .eq('id', id)
        .select()
        .single()
      if (error) throw error
      return data
    }
    const tasks = readLocal()
    const idx = tasks.findIndex((t) => t.id === id)
    if (idx === -1) throw new Error('任务不存在或已被删除')
    tasks[idx] = { ...tasks[idx], ...payload }
    writeLocal(tasks)
    return tasks[idx]
  },

  // 删除任务
  async remove(id) {
    if (useSupabase) {
      const { error } = await supabase.from(TABLE).delete().eq('id', id)
      if (error) throw error
      return true
    }
    writeLocal(readLocal().filter((t) => t.id !== id))
    return true
  },
}
