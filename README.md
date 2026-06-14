# Daedalus

[English](#english) | [中文](#中文)

---

## English

Daedalus is an agentic 3D world-building platform for immersive Web3 spaces. It turns natural-language briefs into structured scene plans, renders them as browser-based 3D environments, and shows the full workflow from planning to validation and export.

It is designed as a real product surface rather than a single demo page:

- `Home` presents the brand, value proposition, and a live 3D hero scene
- `Studio` lets users enter prompts, watch the workflow progress, and inspect the generated 3D world

### What Daedalus does

- Converts product, event, community, and virtual-space briefs into structured 3D scene specs
- Renders stylized 3D environments directly in the browser with Three.js
- Exposes an observable agent workflow with planning, validation, repair, and export states
- Supports reusable landmark assets such as castles, windmills, watermills, and towers
- Exports scene specs, execution traces, validation reports, and presentation-ready artifacts

### Product experience

#### Home

- Large 3D background scene integrated into the hero section
- Brand, slogan, metrics, and entry points into the creation flow
- Workflow section explaining how the agent interprets, plans, validates, repairs, and delivers a world

#### Studio

- Prompt input for generating or updating a world
- Live workflow panel showing the current planning step
- Real-time 3D preview of the generated environment
- Validation and artifact panels for inspecting structured outputs

### World system

Daedalus uses a controlled scene schema instead of generating arbitrary frontend code. The model produces structured world data, and the renderer turns that data into a stable visual environment.

Current scene capabilities include:

- Zone-based world layout
- Style presets such as `game`, `animation`, and `voxel`
- Landmark placement by semantic region
- Hex-tile terrain composition
- Prefab-based scene rendering

### Tech stack

- React
- TypeScript
- Vite
- Three.js
- React Three Fiber
- Drei
- Zod

### Local development

```bash
npm install
npm run dev
```

### Environment

Create a `.env` file if you want to enable a live planning provider:

```bash
VITE_GLM_API_KEY=your_key_here
VITE_GLM_BASE_URL=https://api.z.ai/api/paas/v4
VITE_GLM_MODEL=glm-5.1
```
or other planning providers:

Example:

```bash
VITE_DEEPSEEK_API_KEY=your_key_here
VITE_DEEPSEEK_BASE_URL=https://api.deepseek.com
VITE_DEEPSEEK_MODEL=deepseek-chat
```

The current architecture keeps the provider layer isolated, so it can be adapted to other OpenAI-compatible or GLM-compatible endpoints.

### Project structure

```text
src/
  agent/        planner, validation, workflow, provider abstraction
  world/        scene schema, layout, renderer, prefab composition
  components/   UI building blocks
  assets/       static front-end assets
docs/
  PRD.md        product definition and interaction design
```

### Current focus

Daedalus is being built as a practical platform for:

- immersive product showcases
- Web3 community spaces
- virtual demo environments
- browser-based world prototyping

### License

No license file has been added yet.

---

## 中文

Daedalus 是一个面向沉浸式 Web3 空间的 Agent 式 3D 世界生成平台。它可以把自然语言需求转换为结构化场景方案，在浏览器中渲染为 3D 环境，并完整展示从规划、验证到导出的工作流。

它不是单一的演示页，而是一个完整的平台形态：

- `Home` 用来展示品牌、产品价值和首屏 3D 场景
- `Studio` 用来输入提示词、观察工作流，并查看生成出的 3D 世界

### Daedalus 能做什么

- 将产品空间、活动空间、社区空间、虚拟展示空间需求转换为结构化 3D 场景规范
- 基于 Three.js 在浏览器中直接渲染风格化 3D 世界
- 展示可观察的 Agent 工作流，包括规划、验证、修复和导出
- 支持复用地标资产，例如城堡、风车、水车、魔法塔
- 导出 scene spec、执行轨迹、验证报告和演示材料

### 产品体验

#### Home 页面

- 首屏以大型 3D 场景作为背景
- 展示品牌、slogan、关键数字和进入创作流程的入口
- 通过工作流模块说明系统如何理解需求、规划空间、验证结构、修复问题并交付结果

#### Studio 页面

- 输入提示词并生成或更新世界
- 通过实时工作流面板查看当前执行阶段
- 在 3D 预览区查看生成结果
- 在验证区和产物区检查结构化输出

### 世界生成系统

Daedalus 采用受控 scene schema，而不是让模型直接生成任意前端代码。模型负责输出结构化世界数据，渲染器负责把这些数据转成稳定、可展示的 3D 场景。

当前支持的能力包括：

- 基于 zone 的世界布局
- `game`、`animation`、`voxel` 等风格预设
- 基于语义区域的地标放置
- 六边形地块地形拼装
- 基于 prefab 的场景渲染

### 技术栈

- React
- TypeScript
- Vite
- Three.js
- React Three Fiber
- Drei
- Zod

### 本地运行

```bash
npm install
npm run dev
```

### 环境变量

如果你希望启用在线规划模型，可以创建 `.env` 文件并配置：

```bash
VITE_GLM_API_KEY=your_key_here
VITE_GLM_BASE_URL=https://api.z.ai/api/paas/v4
VITE_GLM_MODEL=glm-5.1
```
或者其他模型提供商:

例如:

```bash
VITE_DEEPSEEK_API_KEY=your_key_here
VITE_DEEPSEEK_BASE_URL=https://api.deepseek.com
VITE_DEEPSEEK_MODEL=deepseek-chat
```

当前架构已经将 provider 层隔离，因此后续可以切换到其他 OpenAI 兼容接口，或接入 GLM 兼容接口。

### 项目结构

```text
src/
  agent/        规划、验证、工作流、模型提供方抽象
  world/        场景 schema、布局、渲染器、prefab 组合
  components/   UI 组件
  assets/       前端静态资源
docs/
  PRD.md        产品定义与交互设计
```

### 当前定位

Daedalus 正在被构建为一个真正可用的平台，适合以下场景：

- 沉浸式产品展示
- Web3 社区空间
- 虚拟活动场景
- 浏览器内 3D 世界快速原型

### License

当前仓库还没有添加正式许可证文件。
