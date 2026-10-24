# Euresis

基于 IBM Carbon Design System 视觉规范的 ICP 获客工作流控制台。当前版本保留七阶段工作流与示例数据，并提供独立的 API 与 AI 集成配置页。

## 本地运行

```bash
npm install
npm run dev
```

## 构建 Worker

```bash
npm run build
```

构建脚本将静态 HTML、CSS、ES Module 和示例数据打包为 `dist/worker.js`，供 Cloudflare Worker 部署。

## API 与 AI 集成

从侧边栏进入「API 与 AI 集成」可配置 Tavily、Serper、OpenAI、Anthropic、Apollo、Hunter、Apify、n8n Webhook 和 OpenAI 兼容端点。工作流模块可通过 `src/services/integrations.js` 的 `integrationClient.call(provider, payload)` 调用已启用服务。

当前版本是静态前端：API 元数据保存在当前浏览器，密钥只保存在当前浏览器会话中；部分服务可能因服务商 CORS、权限或账号套餐而无法从浏览器直接测试。生产环境应改为经过身份验证的服务端代理，并使用 Cloudflare Secrets / 安全存储保存凭据。现有工作流页面仍使用演示数据，不会仅因填写密钥而自动执行真实获客任务。
