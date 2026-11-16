// Vercel Serverless Function 入口：复用 Express 应用
// 部署到 Vercel 时，/api/** 请求会由该函数处理
import { app } from '../server/src/app.js'

export default app
