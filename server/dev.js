// 本地启动入口：监听端口并运行后端服务
import { app, db } from './app.js'

const PORT = process.env.PORT || 4000

app.listen(PORT, () => {
  console.log(`后端服务已启动: http://localhost:${PORT}`)
  console.log(
    `当前数据存储: ${db.mode === 'supabase' ? 'Supabase 云端数据库' : '本地文件（未配置 Supabase 环境变量）'}`
  )
})
