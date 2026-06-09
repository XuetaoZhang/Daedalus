# Daedalus PRD

## 1. 产品定位

**Daedalus: Agentic 3D World Builder for Web3**

Daedalus 使用 GLM-5.1 将 Web3 活动、DAO、NFT 社区或黑客松 Demo Day 的自然语言需求，转化为可浏览、可交互、可验证、可部署的 Three.js 3D 世界。

它不是一个静态 3D 展厅，也不是泛化 3D 建模工具。Daedalus 的核心是一个长程 Agent 工作流：

```text
需求 -> 计划 -> 执行 -> 验证 -> 修复 -> 交付
```

## 2. 要解决的问题

Web3 项目和社区经常需要线上展示空间，例如 Demo Day 展厅、DAO 成员空间、NFT Gallery、赞助商展区、路线图展示、社区活动场地。但现实里，一个可运行的 3D Web 空间通常需要产品、设计、3D、前端、部署多角色协作，小团队很难快速完成。

现有 AI 工具往往有两个断点：

- 只生成文本、图片或代码片段，不能交付可运行的浏览器空间。
- 只做一次性生成，缺少规划、验证、修复和交付闭环。

Daedalus 要解决的是：让非 3D 专业团队用一句 Web3 场景需求，快速得到一个能运行、能演示、能继续迭代的 3D 世界，并且可以看到 Agent 是如何一步步完成任务的。

## 3. 目标用户

- Web3 黑客松参赛团队：需要快速搭建 Demo Day 展示空间。
- DAO / 社区运营者：需要线上展厅、成员墙、路线图空间。
- NFT / 创作者项目方：需要可浏览的藏品展示空间。
- Web3 工具和协议团队：需要比普通 Landing Page 更有记忆点的产品展示页。

## 4. 黑客松匹配点

Daedalus 面向 Z.AI Track，重点展示 GLM-5.1 的长程任务能力，而不是普通聊天或单次 API 调用。

项目必须在 Demo 中清楚呈现：

- **可运行 / 可演示**：浏览器中直接进入 3D 世界。
- **真实问题场景**：Web3 团队缺少快速生成沉浸式展示空间的工具。
- **AI Agent 自主执行过程**：需求理解、空间规划、scene spec 生成、工具调用、验证、修复、交付。
- **安全、权限、成本边界**：MVP 不自动链上交易；钱包连接只读；链上/NFT 数据可使用 mock 或测试网；生成范围受 scene schema 约束。
- **清晰 README、Demo 视频、运行说明**：提交包自动生成基础材料。
- **Web3 相关证明或集成**：项目展台、钱包身份卡、NFT/POAP 墙、链上链接或测试网证明。

## 5. 核心体验

### 5.1 Showcase Mode

用户打开网页后，直接进入一个完成度高的 **AI x Web3 Demo Day Arena**：

- 入口大厅
- 主舞台
- Z.AI Track 展区
- Cobo Track 展区
- 项目展示墙
- 赞助商区域
- NFT / POAP 纪念墙
- 时间线走廊
- 钱包 / 身份 Badge 面板

目标：先抓住评委注意力，证明它不是 PPT。

### 5.2 Agent Builder Mode

用户输入自然语言需求，例如：

```text
为一个 AI x Web3 Hackathon 生成一个线上 Demo Day 展厅：
包含入口大厅、赛道展区、项目展示墙、赞助商区域、时间线、NFT 纪念墙和演讲舞台。
风格要未来感，适合浏览器运行。
```

Daedalus 执行：

1. 分析需求和约束。
2. 生成多步骤计划。
3. 生成受控 `scene spec`。
4. 校验 schema 和空间规则。
5. 渲染 Three.js 场景。
6. 检查关键对象、交互点、性能预算。
7. 发现问题后生成修复计划并修改 spec。
8. 输出可部署包、执行记录和演示材料。

## 6. MVP 范围

### Must Have

- Vite + React + Three.js 可运行项目。
- 固定高完成度 3D Web3 Demo Day 场景。
- 自定义 scene spec 数据结构。
- 基于 scene spec 的模块化渲染器。
- Agent 执行轨迹面板。
- 本地 schema 校验。
- 至少一个可演示的修复循环，例如：
  - 缺少主舞台 -> 自动补齐。
  - 展台数量不足 -> 自动扩展。
  - 未配置 Web3 证明区 -> 自动加入 NFT/POAP 墙。
- README 和 Demo Script 初稿。

### Should Have

- Prompt 输入后生成/更新 scene spec。
- GLM-5.1 API 接入，用于规划和 scene spec 生成。
- 钱包连接按钮，只读展示地址或模拟身份 Badge。
- 项目展台点击交互。
- NFT/POAP mock metadata 展示。
- 浏览器验证脚本，检查 canvas 非空和核心对象存在。

### Could Have

- Playwright 自动截图。
- 导出 `scene.json`、`execution_trace.json`、`submission_package.md`。
- 多主题切换。
- 测试网链上链接或 NFT metadata 拉取。

### Won't Have in Hackathon MVP

- 通用 3D 模型生成。
- 复杂拖拽编辑器。
- 主网交易执行。
- 自动部署用户生成的网站。
- 大规模资产上传和管理。

## 7. Agent 工作流

### 7.1 输入

- 用户自然语言需求。
- 场景类型：hackathon demo day / DAO hall / NFT gallery。
- 约束：浏览器运行、模块数量、Web3 集成、安全边界。

### 7.2 输出

- `scene_spec.json`
- `execution_trace.json`
- 可运行 3D 页面
- `README.md`
- `DEMO_SCRIPT.md`
- `SUBMISSION_PACKAGE.md`

### 7.3 工具链

```text
GLM-5.1 Planner
-> Scene Spec Generator
-> Schema Validator
-> Three.js Renderer
-> Browser / Canvas Validator
-> Repair Planner
-> Package Exporter
```

### 7.4 示例执行轨迹

```json
[
  { "step": "analyze_requirement", "status": "done" },
  { "step": "create_spatial_plan", "status": "done" },
  { "step": "generate_scene_spec", "status": "done" },
  {
    "step": "validate_scene_spec",
    "status": "failed",
    "issue": "missing nft_wall for Web3 proof"
  },
  { "step": "repair_scene_spec", "status": "done" },
  { "step": "render_preview", "status": "done" },
  { "step": "browser_validation", "status": "done" },
  { "step": "export_package", "status": "done" }
]
```

## 8. Scene Spec 设计

MVP 不让 GLM-5.1 直接生成 Three.js 代码，而是生成受控 JSON。前端渲染器负责把 JSON 转成稳定的 3D 世界。

```json
{
  "title": "AI x Web3 Demo Day Arena",
  "theme": "futuristic",
  "worldType": "web3_demo_day",
  "zones": [
    {
      "id": "main-stage",
      "type": "main_stage",
      "title": "Demo Day Stage",
      "position": [0, 0, -8],
      "interactions": ["view_schedule"]
    }
  ],
  "web3Proofs": [
    {
      "type": "nft_wall",
      "title": "Builder Proof Wall",
      "source": "mock_metadata"
    }
  ]
}
```

## 9. 安全与边界

- GLM-5.1 不直接执行任意代码。
- 生成内容必须通过 scene schema 校验。
- MVP 不触发主网交易，不读取私钥。
- 钱包连接只用于展示地址或身份 Badge。
- 外部链接、项目链接、链上证明需要显式展示，不隐藏跳转。
- 所有 Agent 操作记录写入执行轨迹，方便评委审计。

## 10. Demo 脚本

1. 打开 Daedalus，直接进入 3D Demo Day Arena。
2. 镜头从入口大厅移动到主舞台。
3. 点击项目展台，展示项目卡片和 Web3 证明。
4. 打开 Agent Builder 面板。
5. 输入新需求：增加赞助商区域和三个 DeFi AI Agent 项目展台。
6. Agent 展示计划。
7. scene spec 更新，场景出现新区域。
8. Validator 发现缺少 Web3 proof，Agent 自动补上 NFT/POAP 墙。
9. 导出执行轨迹和提交包。

## 11. 里程碑

### 2026-06-09

- 建立独立仓库。
- 完成 PRD。
- 搭建 Vite + React + R3F 项目骨架。
- 定义 scene spec 和 Agent workflow。

### 2026-06-10

- 完成可浏览 3D 展厅。
- 完成项目展台、舞台、NFT 墙、时间线。
- 完成 Agent Trace UI。
- 完成 mock prompt -> scene spec -> render。

### 2026-06-11 中午

- 完成可运行 demo。
- 开始录制视频。
- 输出 README、Demo Script、提交文案初稿。

### 2026-06-12

- 接入 GLM-5.1 或准备可降级 mock。
- 完成验证/修复闭环。
- 完成部署。

### 2026-06-13 中午

- 提交项目。
- 确认视频、README、运行说明、Web3 集成说明完整。

### 2026-06-14 晚

- Demo Day 展示。

## 12. 验收标准

- `npm run dev` 能启动项目。
- 首页第一屏就是 3D 世界，不是 Landing Page。
- 场景中至少有 6 类 Web3 空间模块。
- 用户能看到 Agent 执行轨迹。
- 至少一次验证失败和修复成功被明确展示。
- README 能解释问题、方案、架构、运行方式和 Z.AI Track 匹配点。
- Demo 视频能在 2 分钟内讲清楚完整闭环。

## 13. 风险与应对

| 风险 | 影响 | 应对 |
| --- | --- | --- |
| 通用 3D 生成过大 | 无法按时完成 | 只做 Web3 展厅垂直场景 |
| GLM-5.1 接入不稳定 | Demo 中断 | 保留 mock planner 和预置 trace |
| 视觉效果不够强 | 难抓评委眼球 | 先做 Showcase Mode，高完成度场景优先 |
| Agent 像一次性生成 | 赛道匹配弱 | 强制展示计划、验证、修复、交付 |
| Three.js 性能问题 | 运行卡顿 | 使用程序化几何体，限制对象数量 |

## 14. 项目一句话

Daedalus turns Web3 event briefs into validated, deployable 3D worlds with a GLM-5.1 agent workflow that plans, generates, verifies, repairs, and packages the scene.
