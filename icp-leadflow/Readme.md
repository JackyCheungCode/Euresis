# Euresis — ICP LeadFlow

Euresis 是基于 IBM Carbon Design 语言构建的 ICP 获客工作流。生产环境使用 Supabase Auth、Postgres RLS 与 Edge Function 网关，不再加载预置演示线索。

## 功能

- 七阶段 ICP 获客流程与 Carbon 风格 Progress Indicator
- ICP 行业、员工规模、公司类型、国家/地区、上市状态、供应链角色等自定义选择器
- 国家/地区旗帜标识；中国大陆、中国澳门、中国香港、中国台湾分别列出
- Serper、Tavily、OpenAI、Anthropic、Apollo、Hunter、Apify、n8n 与自定义 OpenAI 兼容 API 配置
- API 凭据保存在 Supabase 服务端专用表中，由需要登录的 Edge Function 代理请求，不回传密钥
- ICP、线索与工作流执行历史写入同名 Supabase 项目 `euresis`
- 按用户启用 RLS；未登录用户无法访问工作区
- 移动端响应式布局、Carbon 风格表格与记录详情弹窗

## 本地运行

```bash
npm install
npm run dev
```

本地前端使用已配置的 Supabase 项目。生产 Edge Function 的 CORS 响应目前只允许 Euresis 的 Workers 地址；本地开发可以查看 UI，但如需从本地调用集成网关，需同时调整函数的 CORS 响应头和来源白名单。

## 构建

```bash
npm run build
```

构建脚本会把入口 HTML、CSS 与 ES modules 打包为单文件 Cloudflare Worker，输出至 `dist/worker.js`。生产 Worker 名称为 `euresis`。

## 数据与安全

- Supabase 项目：`euresis`
- 用户数据表：`icp_profiles`、`leads`、`workflow_runs`
- 服务端集成配置表：`integration_configs`（仅服务端角色可访问）
- API 凭据不能放入前端源码、浏览器存储或 Git 仓库。
- 新账号可能需要先完成邮箱验证，具体取决于 Supabase Auth 设置。

## 生产地址

https://euresis.xg-y.workers.dev
