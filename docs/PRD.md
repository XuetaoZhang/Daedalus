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

## 5. 产品结构与核心体验

Daedalus 不是单一页面 demo，而是一个完整产品形态，至少包含两个一级页面，并通过顶部导航切换：

- `Home`：品牌展示和能力说明页，用于抓住评委眼球、建立品牌记忆、讲清楚产品价值和 GLM-5.1 的长程能力。
- `Studio`：操作平台页，用于输入提示词、观察 Agent 工作流、实时查看生成中的 3D 世界。

### 5.1 全局导航

导航采用统一顶栏，贯穿全站：

- 左侧：Logo + 产品名 `Daedalus`
- 中间：`Home`、`Studio`
- 右侧：`View Demo` / `Enter Studio`

导航目标：

- 让评委在打开网站后能立刻理解这是一个“有品牌、有入口、有操作台”的完整产品。
- 首页负责建立第一印象和叙事。
- Studio 负责证明它真的能工作，而不是概念页。

### 5.2 Home 页面

Home 是宣传页，也是产品总入口。它至少包含两个关键屏。

#### 第一屏：Hero / 品牌首屏

视觉目标参考图 1，但内容要完全服务于 Daedalus 本身。

第一屏必须同时完成四件事：

- 建立品牌识别：展示 `Daedalus` logo、名字、slogan。
- 展示结果形态：使用一个高完成度的示例 3D 场景作为首屏主视觉背景。
- 传达产品价值：一句话讲清楚这是把 Web3 需求转成可部署 3D 世界的 Agent。
- 给出可信度信号：展示已生成世界、元素、模型等统计数字。

第一屏信息结构建议：

- Eyebrow：`AGENTIC 3D WORLD BUILDER FOR WEB3`
- H1：`BUILD WORLDS. NOT SLIDES.`
- Supporting copy：
  `Daedalus turns Web3 briefs into navigable, validated, deployable 3D worlds with a GLM-5.1 agent workflow.`
- Primary CTA：`Enter Studio`
- Secondary CTA：`Watch Demo`
- Stats：
  - `120+ Worlds Generated`
  - `3,000+ Scene Elements`
  - `450+ Reusable Models`

第一屏背景要求：

- 不是静态纯平背景，而是可见的 3D 场景内容。
- 场景可为示例 Demo Day Arena，镜头有轻微运动或自动巡航。
- 首页文案层叠加在场景前景之上，保证可读性。

#### 第二屏：GLM-5.1 长程工作流说明

第二屏不是普通功能列表，而是要真正“展示长程能力”。

这一区块需要把 Agent 闭环拆开，让评委一眼看到：

```text
用户目标 -> 计划 -> 场景生成 -> 浏览器验证 -> 自动修复 -> 打包交付
```

第二屏建议包含：

- 左侧或上方：工作流阶段图
- 右侧或下方：每一步的真实产物或工具调用说明
- 明确标注使用 GLM-5.1 负责：
  - 需求理解
  - 任务拆解
  - 结构化 scene spec 生成
  - 验证结果分析
  - 修复策略生成
  - 提交包整理

建议展示为 6 个步骤卡片：

1. `Interpret Brief`
2. `Plan Spatial Layout`
3. `Generate Scene Spec`
4. `Render and Inspect`
5. `Repair and Optimize`
6. `Export Deliverables`

第二屏的目标：

- 证明 Daedalus 不是“一次性生成器”。
- 证明 GLM-5.1 参与了完整工作流，而不是只调一次 API。
- 为后续切到 Studio 页面做铺垫。

### 5.3 Studio 页面

Studio 是操作平台页，视觉结构参考图 2，但要适配 Daedalus 的产品逻辑。

Studio 页面采用固定两栏布局：

- 左侧：Prompt / 输入面板
- 右侧上半区：Agent Workflow / Validation 面板
- 右侧下半区：3D Scene Preview / 场景预览区

这样安排的原因是：

- 左侧保持输入和参数配置稳定，不被生成过程打断。
- 右侧上半区优先展示 Agent 正在做什么，强化长程任务感。
- 右侧下半区持续展示场景结果，让用户看到生成不是黑盒。

#### 左侧：Prompt 输入面板

用户可以：

- 输入自然语言需求
- 选择场景类型
- 指定风格和约束
- 查看推荐 prompt 示例

输入面板建议字段：

- Prompt textarea
- Scene type：`Hackathon Arena` / `DAO Hall` / `NFT Gallery`
- Theme：`Futuristic` / `Minimal` / `Industrial`
- Constraints：
  - Browser-ready
  - Wallet badge
  - NFT proof wall
  - Timeline corridor
- CTA：`Generate World`

#### 右侧上半区：Agent Workflow / Validation 面板

这里必须是 Studio 的核心卖点，而不是附属区域。

用户需要能看到：

- 当前任务状态
- 多步骤执行轨迹
- 当前步骤调用的工具
- 校验失败与修复记录
- 输出产物列表

可展示内容包括：

- `Task Plan`
- `Execution Trace`
- `Validation Results`
- `Repair Actions`
- `Artifacts`

#### 右侧下半区：3D Scene Preview

这里展示正在生成或已生成的 3D 场景。它必须占据最大视觉权重之一。

预览区能力包括：

- 渲染示例或生成后的 Three.js 场景
- 显示加载、生成、修复中的不同状态
- 提供简单视角交互
- 点击热点查看 booth、NFT wall、stage 等模块说明

Studio 页面的目标：

- 让用户看到“从 prompt 到世界”的过程
- 让评委看到 Agent 在持续工作
- 让最终产物可视、可交互、可验证

### 5.4 页面关系

完整用户路径为：

1. 用户进入 `Home`
2. 在第一屏被品牌和示例世界吸引
3. 在第二屏理解 GLM-5.1 的长程工作流
4. 点击 `Enter Studio`
5. 在 Studio 中输入需求
6. 观察 Agent 计划、执行、验证、修复
7. 查看最终 3D 世界
8. 导出执行轨迹和交付包

### 5.5 线框图

#### Home 线框图

```text
+----------------------------------------------------------------------------------+
| Logo Daedalus                 Home | Studio                     View Demo Studio |
+----------------------------------------------------------------------------------+
|                                                                                  |
|  AGENTIC 3D WORLD BUILDER FOR WEB3                                               |
|  BUILD WORLDS. NOT SLIDES.                                                       |
|  Daedalus turns Web3 briefs into navigable, validated, deployable 3D worlds.    |
|                                                                                  |
|  [Enter Studio]                                                  |
|                                                                                  |
|  120+ Worlds Generated   3,000+ Scene Elements   450+ Reusable Models           |
|                                                                                  |
|                                              [Large immersive 3D world preview]  |
|                                              [Auto-moving showcase scene]        |
|                                                                                  |
+----------------------------------------------------------------------------------+
|                           GLM-5.1 Long-Horizon Workflow                          |
+----------------------------------------------------------------------------------+
| Interpret Brief | Plan Layout | Generate Spec | Render Inspect | Repair | Export |
|     card        |    card     |      card     |      card      |  card  |  card  |
|                                                                                  |
+----------------------------------------------------------------------------------+
```

### 5.6 页面模块清单

#### Home 模块清单

Home 页面按从上到下的阅读顺序包含以下模块：

- `Global Nav`
- `Hero Showcase`
- `Proof Metrics`
- `GLM-5.1 Workflow Section`
- `Use Case Strip`
- `Footer CTA`

各模块职责如下：

- `Global Nav`：让用户在品牌展示和 Studio 操作台之间快速切换。
- `Hero Showcase`：在第一屏完成品牌识别、价值传达和视觉吸引。
- `Proof Metrics`：展示世界数量、元素数量、模型数量等可信度信号。
- `GLM-5.1 Workflow Section`：展示长程 Agent 闭环。
- `Use Case Strip`：展示适用场景，如 Hackathon Arena、DAO Hall、NFT Gallery。
- `Footer CTA`：再次引导进入 Studio 或观看演示。

#### Studio 模块清单

Studio 页面按主要工作区划分包含以下模块：

- `Studio Nav`
- `Prompt Composer`
- `World Settings`
- `Agent Workflow`
- `Validation & Repair`
- `3D Preview`
- `Artifacts Drawer`

各模块职责如下：

- `Studio Nav`：保持跨页一致导航，并提供返回 Home 的路径。
- `Prompt Composer`：输入用户需求和示例 prompt。
- `World Settings`：设置场景类型、主题、约束条件。
- `Agent Workflow`：显示计划、执行步骤和当前状态。
- `Validation & Repair`：显示失败项、修复动作和最终结果。
- `3D Preview`：承载主要 Three.js 场景预览。
- `Artifacts Drawer`：展示 scene spec、trace、README、demo script 等导出物。

### 5.7 页面状态设计

#### Home 状态

Home 页面状态较少，但必须处理以下几种表现：

- `default`：首屏自动播放示例 3D 世界，CTA 可点击。
- `hero-loading`：首屏 3D 场景尚未加载完成时，展示品牌文字与轻量占位背景。
- `metrics-animated`：统计数字以滚动或渐进方式出现，增强“系统已运行过”的感觉。

#### Studio 状态

Studio 页面需要明确以下核心状态：

- `idle`：尚未输入 prompt，展示推荐案例与默认示例世界。
- `planning`：Agent 正在理解需求并生成任务计划。
- `generating`：Agent 正在输出 scene spec 并更新世界结构。
- `validating`：系统正在运行规则检查、浏览器检查或结构检查。
- `repairing`：发现问题后自动生成修复方案并应用。
- `complete`：3D 世界生成完成，产物区可导出。
- `error`：当模型返回异常或 scene spec 校验失败时，给出可读错误和重试入口。

### 5.8 关键交互

产品必须具备以下关键交互，才能支撑完整演示：

- 用户在 Home 点击 `Enter Studio` 后，直接进入 Studio，并保留示例 prompt。
- 用户在 Studio 输入 prompt 后，可以看到工作流面板逐步推进，而不是瞬时完成。
- 生成期间，右侧 3D 预览区必须有可感知反馈，例如占位场景、局部更新、状态标签。
- 当验证失败时，工作流面板必须明确显示失败原因，随后展示修复动作。
- 完成后，用户可以查看产物，例如 `scene_spec.json`、`execution_trace.json`、`README` 草稿。

### 5.9 信息架构

```text
Daedalus
├── Home
│   ├── Hero Showcase
│   ├── Metrics
│   ├── GLM-5.1 Workflow
│   ├── Use Cases
│   └── CTA Footer
└── Studio
    ├── Prompt Composer
    ├── World Settings
    ├── Agent Workflow
    ├── Validation & Repair
    ├── 3D Preview
    └── Artifacts
```

#### Studio 线框图

```text
+----------------------------------------------------------------------------------+
| Logo Daedalus                 Home | Studio                     View Demo Studio |
+----------------------------------------------------------------------------------+
| Prompt & Controls              | Agent Workflow / Validation                     |
|--------------------------------|-------------------------------------------------|
| Prompt textarea                | Task Plan                                       |
| Scene type                     | Step 1 Analyze                                  |
| Theme                          | Step 2 Plan                                     |
| Constraints                    | Step 3 Generate Spec                            |
| Example prompts                | Step 4 Validate                                 |
| [Generate World]               | Step 5 Repair                                   |
|                                | Step 6 Export                                   |
|                                | Validation logs                                 |
|                                | Repair actions                                  |
|                                | Output artifacts                                |
|--------------------------------+-------------------------------------------------|
| Prompt presets / help          | 3D Scene Preview                                |
|                                |-------------------------------------------------|
|                                | Three.js world                                  |
|                                | camera controls                                 |
|                                | hotspots / labels                               |
|                                | generate / repair status                        |
+----------------------------------------------------------------------------------+
```

## 6. MVP 范围

### Must Have

- Vite + React + Three.js 可运行项目。
- 两个一级页面：`Home` 与 `Studio`。
- 全局导航可以在两个页面之间切换。
- Home 第一屏包含品牌信息、slogan、CTA、3D 场景背景和统计数字。
- Home 第二屏完整展示 GLM-5.1 长程工作流。
- Studio 页面包含 Prompt 输入区、Agent 工作流区、3D 场景预览区。
- 固定高完成度 3D Web3 Demo Day 场景，作为首页背景和 Studio 初始示例。
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
- 首页统计数字带有真实或 mock 数据来源。
- 首页 Hero 背景场景具备轻微镜头运动或自动巡航。
- 钱包连接按钮，只读展示地址或模拟身份 Badge。
- 项目展台点击交互。
- NFT/POAP mock metadata 展示。
- 浏览器验证脚本，检查 canvas 非空和核心对象存在。
- Studio 页面具备 `idle`、`planning`、`generating`、`validating`、`repairing`、`complete` 状态显示。

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

## 9. 视觉资产策略

Daedalus 采用“预置高质量资产 + GLM-5.1 动态编排”的方式，而不是让模型在演示现场从零生成全部 3D 资产。

核心原则：

- 使用最有视觉效果并且可靠性强的方式。
- 优先保证风格统一、画面稳定、性能可控。
- GLM-5.1 负责“理解、规划、编排、修复”，不负责从零生成高质量 3D 模型资产。

### 9.1 预置的三种风格

首版产品预置三种可演示风格，并允许通过 prompt 关键词匹配切换：

- `Game Style`
  参考图 1。特点是类策略游戏 / 类轻游戏地图感，适合首页 Hero 和高视觉冲击演示。
- `Animation Style`
  参考图 2。特点是低模、明亮、玩具化、卡通岛屿感，适合品牌展示和轻交互世界。
- `Voxel Style`
  参考图 3。特点是体素方块化、规则网格化、模块感强，适合快速生成和高可控搭建。

产品默认策略：

- `Home` 首屏默认使用 `Game Style`。
- `Studio` 支持通过关键词或显式选择切换三种预置风格。
- 真实演示时优先展示 `Game Style`，因为最容易打出“类游戏世界”的第一印象。

### 9.1.1 图像参照拆解

#### 图 1 对应的 `Game Style`

从参考图中提炼的关键特征：

- 俯视角或轻斜俯视角
- 沙盘 / diorama 式圆盘世界
- 低模但不粗糙，建筑和单位都带有“策略游戏 UI”语义
- 阵营色非常明确，蓝、红、黄可以一眼区分
- 地图元素清晰：河流、桥、道路、塔、防御点、资源点、行军箭头
- 画面重心在“世界可操作”而不是“单一角色表演”

设计结论：

- `Game Style` 需要强调阵营、路径、据点、资源点和可读性
- 首页 Hero 可以使用带自动巡航的战争沙盘式世界
- Studio 默认世界也优先采用这种风格，因为最像“AI 生成了一个真正可用的游戏地图”

#### 图 2 对应的 `Animation Style`

从参考图中提炼的关键特征：

- 明亮高饱和配色
- 岛屿化、多分区、世界地图感
- 低模卡通资产统一，几何体圆润
- 空间更偏品牌展示和探索，而非战斗
- 镜头更适合环游、漫游、悬停聚焦

设计结论：

- `Animation Style` 适合做品牌宣传页、主题场馆、创作者空间
- 更适合展示展区、城市、展馆、IP 角色，而不是复杂战斗单位
- 可以作为“好看、轻快、可浏览”的次主风格

#### 图 3 对应的 `Voxel Style`

从参考图中提炼的关键特征：

- 方块体素结构极强
- 画面规则、模块清楚、易于拼装
- 世界更像“生成式搭建结果”而不是手工美术大场景
- 适合快速变化、快速验证和生成感展示

设计结论：

- `Voxel Style` 最适合展示“根据 prompt 现场搭出世界”
- 它的视觉冲击不一定最强，但最能体现 Agent 可控生成
- 可以作为技术可信度风格，用来证明 Daedalus 不是纯预渲染展示

### 9.2 每种风格需要预置的资产

#### A. Game Style 资产包

目标：做出“可玩的类策略 / 类沙盘世界”观感。

必须预置：

- 地形底盘：圆盘地台、河流、道路、桥梁、山体、台地
- 建筑模块：主城、前哨、塔楼、资源点、城门、纪念碑、舞台
- 单位模块：步兵、弓兵、骑兵、旗手、守卫
- 环境模块：树木、岩石、围栏、营火、谷仓、风车
- UI 辅助模块：路径箭头、区域标签、资源牌、阵营徽记
- 特效模块：旗帜摆动、轻粒子、路径高亮、阵营高光圈

推荐额外预置：

- 一个英雄主角 archetype
- 两套阵营色
- 一套自动巡航镜头路径
- 一套战术交互提示 UI

最小可交付资产 checklist：

- 1 个主城 prefab
- 2 个分城 / 哨站 prefab
- 1 个塔楼 prefab
- 1 个资源点 prefab
- 1 段河流系统
- 1 座桥 prefab
- 1 套道路 spline
- 3 类单位 prefab：步兵 / 远程 / 骑兵
- 1 套阵营旗帜
- 1 套路径箭头和选区特效
- 1 个地图标签组件
- 1 个英雄或指挥官角色

镜头语言：

- 默认使用轻斜俯视角
- 首页使用慢速巡航和焦点切换
- Studio 使用可控 orbit，但初始镜头保持沙盘可读性

适合承载的 Web3 场景：

- Hackathon Arena
- DAO Territory Map
- Sponsor Battlefront / Track Competition Map

#### B. Animation Style 资产包

目标：做出“品牌展示级”的明亮卡通 3D 世界。

必须预置：

- 地形模块：多岛屿底座、海面、台阶、桥梁、坡道
- 建筑模块：展馆、塔、舞台、标志性小建筑、主题装置
- 装饰模块：云朵、树木、热气球、雕塑、路牌、彩色地块
- 交互模块：浮动热点、信息气泡、发光按钮、传送点
- 特效模块：柔和水面、轻漂浮动画、环境粒子

推荐额外预置：

- 一个 mascot 主角 archetype
- 若干颜色主题变体
- 首页自动镜头环游路径
- 一组浮动信息卡和发光热点

最小可交付资产 checklist：

- 3 个岛屿底座 prefab
- 2 个地标建筑 prefab
- 1 个主舞台 prefab
- 1 个展馆 / 展位 prefab
- 1 套树木和云朵装饰
- 1 套水面与漂浮物效果
- 1 个 mascot 主角
- 1 套热点气泡组件
- 1 套彩色区域标签组件

镜头语言：

- 默认使用平滑环游或轻推镜头
- 首页更适合横向浏览整个岛链世界
- Studio 更适合聚焦不同岛区和展位

适合承载的 Web3 场景：

- NFT Gallery World
- Creator Showcase Island
- Demo Day Expo Park

#### C. Voxel Style 资产包

目标：做出“生成感强、结构感强、可靠性强”的体素世界。

必须预置：

- 基础体素块：地面、草地、水、岩石、木头、叶子、玻璃、发光块
- 地形模板：平原、小山、湖泊、树林、台阶、平台
- 建筑模板：小屋、塔、门、舞台、展台、围墙
- 功能模板：出生点、资源点、路标、传送门
- 交互模板：选中框、网格高亮、放置预览、热点标记

推荐额外预置：

- 一个 voxel 主角 archetype
- 一套第一人称或第三人称简单相机
- 一组可快速拼装的模块化 prefab
- 一套可显示网格和放置预览的构建反馈

最小可交付资产 checklist：

- 8 类基础 block
- 3 套地形模板
- 2 套树木模板
- 2 套小建筑模板
- 1 套舞台 / 展台模板
- 1 个 voxel 主角
- 1 套网格高亮和选中反馈
- 1 套快速生成动画

镜头语言：

- 默认使用轻第三人称或斜俯视角
- 可以切换到更近距离以突出方块细节
- Studio 中适合展示“逐块生成”或“区域填充生成”

适合承载的 Web3 场景：

- Builder Sandbox
- Prototype World
- Prompt-to-World Live Demo

### 9.3 跨风格通用预置资产

无论哪种风格，都建议共用一组“系统级资产”：

- Web3 展示模块：NFT wall、project booth、timeline、wallet badge、sponsor zone
- 导航和交互模块：热点图标、标题牌、区域标签、路径提示
- 相机模块：hero shot、orbit、fly-through、focus target
- 光照模板：hero lighting、studio lighting、ambient world lighting
- 状态模板：loading、generating、validating、repairing、complete

跨风格都需要做风格化适配的 Web3 模块：

- `project booth`
- `main stage`
- `sponsor zone`
- `timeline corridor`
- `nft wall`
- `wallet badge shrine`
- `agent command center`

### 9.4 哪些内容由 GLM-5.1 动态生成

GLM-5.1 动态生成的不是“全部模型”，而是以下可控内容：

- 世界类型判断：Hackathon Arena / DAO Hall / NFT Gallery
- 风格识别：根据关键词匹配 `Game`、`Animation`、`Voxel`
- 场景布局：区域数量、区域顺序、主次关系、空间分布
- 资产选择：在预置资产库中选择哪类 prefab、哪种变体、哪种阵营色
- 场景文案：场馆名称、标签、展位名、说明文字
- 交互配置：哪些区域可点击、跳转什么内容、显示什么说明
- 镜头规划：首页巡航镜头、Studio 预览聚焦点、重要节点镜头
- 验证与修复：发现缺区、过密、缺 proof 模块、风格冲突后生成修复方案
- 导出产物：scene spec、trace、README、demo script

可直接由 prompt 触发的风格关键词策略：

- 如果用户写 `kingdom`, `arena`, `battle`, `tower`, `camp`, `troops`
  则优先匹配 `Game Style`
- 如果用户写 `island`, `cute`, `colorful`, `world map`, `expo`, `playful`
  则优先匹配 `Animation Style`
- 如果用户写 `voxel`, `block`, `sandbox`, `minecraft`, `builder`
  则优先匹配 `Voxel Style`

GLM 的职责是把这些关键词映射为：

- 风格类型
- 世界模板
- 资产选择表
- 交互配置
- 镜头脚本

### 9.5 哪些内容不由 GLM 现场生成

为了保证成功率，以下内容不在演示时现场生成：

- 高质量 3D 主角模型
- 高质量建筑模型
- 高质量动画骨骼
- 复杂材质贴图
- 大规模新资产上传和自动清洗

这些内容都通过预置资产库解决。

### 9.6 主角策略

主角不建议完全自由生成，建议采用“半固定主角”策略。

具体方案：

- 每种风格预置 1 个默认主角 archetype
- 允许 GLM-5.1 根据 prompt 选择使用哪一种主角
- 同一风格下只允许少量外观变体，例如阵营色、披风色、头盔、工具

推荐配置：

- `Game Style`：战术英雄或指挥官角色
- `Animation Style`：品牌 mascot 或轻卡通向导角色
- `Voxel Style`：体素 explorer / builder 角色

这样做的原因：

- 主角存在会强化“类游戏 / 类世界”的沉浸感
- 预置 archetype 比临场生成更稳
- 少量变体足够体现“根据 prompt 做出响应”

### 9.7 是否支持主题切换

支持，但范围受控。

首版只支持三种预置主题切换：

- `Game`
- `Animation`
- `Voxel`

切换方式：

- 用户在 Studio 显式选择
- 或者 GLM-5.1 根据 prompt 关键词自动推荐

关键词示例：

- `strategy`, `battlefield`, `kingdom`, `campaign` -> `Game`
- `cute`, `toy`, `bright`, `playful`, `cartoon` -> `Animation`
- `block`, `voxel`, `minecraft-like`, `grid world` -> `Voxel`

首版不支持：

- 任意自定义风格现场生成
- 用户上传参考图后一键训出新风格

### 9.8 风格统一原则

为了让世界看起来不是“拼贴”，每种风格必须统一以下维度：

- 地形语言：圆润 / 规则 / 方块化
- 建筑比例：小比例、中比例、塔楼高度关系
- 材质语言：写实低模、卡通低模、体素块面
- 色彩策略：主色、辅色、功能色、阵营色
- 光照策略：阴影强弱、环境光、轮廓高亮
- UI 标签策略：标签形状、描边、字号、阵营色用法
- 动效策略：旗帜、粒子、浮动、镜头速度

统一原则要求：

- 同一个世界一次只使用一种主风格
- 跨风格混用仅限少量系统 UI，不混用核心建筑和地形资产
- Web3 功能模块在三种风格下都要各自做风格化适配

首版每种风格的统一锚点：

- `Game Style`：阵营感、沙盘感、策略地图可读性
- `Animation Style`：岛屿感、品牌感、轻快浏览感
- `Voxel Style`：生成感、模块感、构建感

### 9.9 首页与演示优先级

为了兼顾视觉冲击和可靠性，演示优先级如下：

1. `Home Hero` 使用 `Game Style`
2. `Studio` 默认载入 `Game Style` 示例世界
3. `Animation Style` 作为品牌展示与切换演示
4. `Voxel Style` 作为“快速生成、强结构、可控性高”的对照演示

首页 Hero 的具体要求：

- 使用 `Game Style` 的预制示例世界
- 画面中至少出现主城、分城、桥、河、道路、单位、路径箭头
- 镜头不需要用户操作也能成立
- 文案叠加后依然能读清主世界结构
- 如果首页只展示一种风格，必须是 `Game Style`

### 9.9.1 今日必须完成的 Game Style P0 资产

今天的 P0 目标是做出一个可运行、可截图、可作为首页 Hero 背景的 Game Style 沙盘世界。

画面目标：

- 参考图 1 的策略沙盘构图
- 保留圆盘地图、阵营据点、河流、桥梁、道路、军队、路径箭头和标签
- 使用 Daedalus 自有命名与 Web3 语义，不照搬参考图中的具体品牌和文字

今天必须完成的资产：

| 优先级 | 资产 | 用途 | 制作方式 |
| --- | --- | --- | --- |
| P0 | 圆盘地台 | 世界底盘和首页 Hero 主体 | Three.js 程序化 |
| P0 | 河流系统 | 切分地图空间，形成视觉流动 | Three.js 程序化 |
| P0 | 桥梁 | 连接蓝方主城和中部区域 | Three.js 程序化 |
| P0 | 道路系统 | 串联主城、分城、资源点 | Three.js 程序化 |
| P0 | 蓝方主城 | 首页主视觉锚点 | 程序化低模建筑 |
| P0 | 红方 / 黄方 / 绿方据点 | 构成沙盘世界规模感 | 程序化低模建筑 |
| P0 | 前哨营地 | 中部可交互目标点 | 程序化低模道具 |
| P0 | 箭塔 | 右侧战术据点 | 程序化低模建筑 |
| P0 | 资源点 | 左下角经济模块 | 程序化低模道具 |
| P0 | 树木 / 岩石 / 围栏 | 丰富地图细节 | 程序化低模 |
| P0 | 三类单位 | 步兵、远程、骑兵，建立类游戏感 | 程序化低模角色 |
| P0 | 行军路径箭头 | 展示策略和操作感 | Three.js 程序化 |
| P0 | 区域标签 | 展示据点名称和模块语义 | Drei Text + 面板 |
| P0 | 资源栏 / 命令栏 UI | 强化游戏界面感 | HTML overlay |
| P0 | 小地图 | 强化策略游戏参考感 | HTML overlay |

今天不做的资产：

- 复杂骨骼动画
- 高精角色模型
- 真实第三方 GLB 资产
- 完整战斗系统
- 真实资源生产系统

今天的验收标准：

- 打开页面能看到完整 Game Style 沙盘
- 地图中至少有 4 个阵营 / 区域据点
- 有河流、桥、道路、路径箭头、单位和标签
- 有顶部资源栏、底部命令区、小地图
- 场景可以作为首页 Hero 或 Studio 预览使用

### 9.10 资产预制方式

首版建议的资产预制方式：

- 使用低模或轻量风格化 3D 资产，而不是高精写实模型
- 资产以可复用 prefab 方式组织
- 每种风格建立独立目录和命名规则
- 共享统一的 scene spec 映射层
- 先做“最小高质量资产集”，不追求一次铺满所有内容

预制优先级建议：

1. 先完成 `Game Style` 最小集，因为它承担首页和主演示
2. 再完成 `Animation Style` 最小集，用于风格切换证明
3. 最后完成 `Voxel Style` 最小集，用于生成能力展示

资产制作建议：

- 尽量使用低模、风格统一、轻骨骼或无骨骼资产
- 尽量避免复杂 PBR 材质链路
- 单位、建筑、地形优先保证 silhouette 清晰
- 先做 prefab 变体，不追求大量独立模型

### 9.11 资产应该怎么做

为了兼顾时间、视觉效果和稳定性，资产制作采用“三段式方案”：

1. `优先复用`
   先寻找可商用或可演示的低模 / 风格化资产，快速建立基础世界。
2. `统一改造`
   对复用资产进行统一缩放、配色、材质、命名和风格修正，让它们看起来像一个产品，而不是拼凑。
3. `重点补做`
   对首页 Hero、主角、关键建筑、Web3 功能模块进行定制补做，确保记忆点和品牌感。

这个顺序比“全部从零建模”更稳，也比“完全交给模型现场生成”可靠得多。

### 9.12 资产来源策略

资产来源按优先级排序如下：

#### A. 第一优先级：现成低模 / 风格化资产

适合用于：

- 树木、岩石、围栏、风车、营火、桥梁、基础建筑
- 岛屿、地形块、简单塔楼、道具
- 低模单位或体素角色

使用原则：

- 必须能统一风格
- 必须支持导出为 `glb` / `gltf`
- 必须允许修改颜色、材质或结构

#### B. 第二优先级：程序化生成与代码资产

适合用于：

- 河流、道路、网格、路径箭头
- 热点、标签、UI 面板、光圈、选中框
- 粒子、轮廓发光、状态高亮

使用原则：

- 这类内容尽量不要做成重模型
- 能用 Three.js 直接生成的，就不要增加外部美术依赖

#### C. 第三优先级：定制补做资产

适合用于：

- 首页主城
- 主角 archetype
- Web3 核心模块，如 NFT wall、Agent command center、wallet badge shrine
- 风格辨识度最高的地标建筑

使用原则：

- 只补最关键的“记忆点资产”
- 不做大而全的原创资产池

### 9.13 资产制作流程

每个资产都遵循同一制作流程：

1. 选定所属风格：`Game` / `Animation` / `Voxel`
2. 定义资产类型：`terrain` / `building` / `unit` / `prop` / `effect`
3. 确定用途：Hero、Studio 默认世界、可复用模块、交互热点
4. 统一比例和朝向
5. 统一材质和颜色体系
6. 导出为标准格式
7. 放入 prefab 映射体系
8. 在真实场景中验证

每个新资产进入仓库前至少要通过这几个检查：

- 风格是否一致
- 是否能在目标相机下看清轮廓
- 是否会造成明显性能压力
- 是否能被 scene spec 正确引用

### 9.14 文件格式与技术规范

首版资产建议统一使用：

- 模型格式：`glb`
- 简单交换格式：`gltf` + 贴图
- UI 图标或标签：程序化生成优先，其次使用 `svg`

技术规范建议：

- 单位、主角、建筑尽量以 `glb` 管理
- 重复资产尽量实例化，不重复导入多个副本
- 贴图数量尽量少，优先纯色材质、渐变材质、轻贴图
- 体素风优先程序化方块，不依赖大贴图

### 9.15 尺寸、命名与目录规则

为了让 GLM-5.1 和 scene spec 能稳定引用资产，必须统一命名。

命名规则建议：

```text
{style}_{type}_{name}_{variant}
```

示例：

```text
game_building_main_castle_a
game_unit_knight_blue_a
animation_prop_cloud_soft_b
voxel_building_stage_small_a
```

目录规则建议：

```text
assets/
├── game/
│   ├── terrain/
│   ├── buildings/
│   ├── units/
│   ├── props/
│   └── effects/
├── animation/
│   ├── terrain/
│   ├── buildings/
│   ├── mascot/
│   ├── props/
│   └── effects/
└── voxel/
    ├── blocks/
    ├── terrain/
    ├── buildings/
    ├── character/
    └── effects/
```

scene spec 不直接写文件路径，而是引用逻辑 id，例如：

```json
{
  "assetId": "game_building_main_castle_a"
}
```

### 9.16 材质与贴图策略

为了保证风格统一和性能稳定，首版材质策略如下：

- `Game Style`
  使用轻写实低模材质，颜色偏柔和，保留阴影层次，尽量少用高频贴图
- `Animation Style`
  使用高明度、低复杂度、色块明确的卡通材质
- `Voxel Style`
  使用纯色块面、少贴图、强边界的方块材质

通用原则：

- 先用材质统一风格，再考虑是否增加贴图细节
- 如果一个资产必须靠复杂贴图才能成立，首版应尽量替换成更简洁的资产

### 9.17 主角与单位资产怎么做

主角和单位最容易拖慢进度，所以必须控制范围。

推荐方案：

- `Game Style`
  1 个主角，3 类基础单位，全部用统一阵营色和简化动画
- `Animation Style`
  1 个 mascot 主角，不做复杂战斗骨骼
- `Voxel Style`
  1 个 voxel 角色，只保留移动 / 待机两类表现

动作策略：

- 首版只保留 `idle`、`move`、`focus` 这类必要表现
- 不做复杂战斗动作树
- 不做实时换装系统

### 9.18 Web3 功能资产怎么做

为了让 Web3 不是贴标签，而是真正进到世界里，以下模块建议单独预制：

- `NFT Wall`
  作为可点击展示墙，承载 NFT 图片、metadata、作品说明
- `Project Booth`
  作为项目展位，点击后展示项目名、简介、Demo、GitHub
- `Wallet Badge Shrine`
  作为身份展示点，展示已连接钱包地址或 mock badge
- `Timeline Corridor`
  作为项目历程展示区，承载学习、构建、提交、Demo Day
- `Agent Command Center`
  作为 Agent 核心中控台，视觉上强化“世界由 Agent 在生成”

这几个模块都应该在三种风格下各自有一套适配版本，而不是只有一版通用模型。

### 9.19 相机与演示镜头怎么做

视觉效果很多时候不只是资产本身，而是镜头。

首版建议预置三类镜头：

- `Hero Camera`
  用于首页首屏自动巡航
- `Studio Preview Camera`
  用于右下场景预览，强调可读性
- `Focus Camera`
  用于点击某个 booth、主城、NFT wall 时自动聚焦

镜头必须是预设的，不依赖临场 AI 即兴生成。
GLM-5.1 可以做的是在预设镜头模板中选择、排序和调整焦点。

### 9.20 资产性能预算

为了避免演示时卡顿，必须给资产设预算。

建议预算原则：

- 首页 Hero 世界优先看效果，但对象数量仍要可控
- Studio 默认世界优先看稳定性，不追求超大地图
- 每种风格都要能在普通浏览器里流畅运行

首版策略：

- 优先少而精，不优先多
- 多用实例化
- 多用程序化地形与路径
- 少用复杂骨骼角色和高面数模型

### 9.21 资产验收标准

每个进入正式 demo 的资产至少满足：

- 与目标风格一致
- 在默认镜头下轮廓清楚
- 与同类资产并排时不突兀
- 可以被 scene spec 稳定引用
- 不会明显拖慢页面

每个风格包至少满足：

- 有完整世界底盘
- 有地标建筑
- 有 Web3 功能模块
- 有一个主角或风格锚点角色
- 有一套可直接展示的默认镜头

### 9.22 演示 fallback 方案

为了防止演示现场因为资产或生成结果不稳定而翻车，必须保留 fallback。

fallback 设计如下：

- 如果 GLM-5.1 返回异常，则回退到对应风格的默认模板世界
- 如果某个资产缺失，则回退到该风格的基础 prefab
- 如果主角未能正确加载，则回退到该风格默认主角
- 如果 Studio 生成失败，则仍可展示首页 Hero 和预置 Studio 示例世界

这保证了：

- 最坏情况下仍然有可演示画面
- 风格不会因为个别资产失败而崩掉
- 黑客松现场不会因为单点故障全盘失效

### 9.23 资产获取与制作决策

首版不建议把资产来源完全押在 GitHub 上，也不建议完全依赖 AI 临场生成。

最佳策略是：

1. 用成熟资产站点快速拿到基础资产
2. 用程序化和代码方式生成规则性资产
3. 只对最关键的品牌资产做定制统一

原因：

- GitHub 上有很多示例项目，但资产质量、授权、风格一致性参差不齐
- 资产站点更容易拿到成体系的低模资产包
- 规则性资产自己生成最稳
- 关键资产自己统一，才能形成 Daedalus 的产品辨识度

### 9.24 是否需要去 GitHub 找资源

需要，但不是主战场。

GitHub 更适合找：

- 体素世界或低模场景的实现思路
- Three.js / React Three Fiber 的 prefab 组织方式
- 相机、路径、热点、标签、轮廓发光等代码方案
- 可参考的开源 demo 结构

GitHub 不适合作为首要资产来源的原因：

- 很多仓库只给代码，不给可直接商用的资产包
- 资产授权常常不够清楚
- 单独仓库里的模型风格通常不统一

因此：

- `代码参考` 优先去 GitHub
- `成套低模资产` 优先去专门资产站点
- `关键品牌资产` 由我们自己统一制作

### 9.25 推荐的资产来源

适合首版项目的基础来源：

- Kenney：提供大量分类清晰的 3D 资源包与 starter kits，可直接筛选 3D 资源。来源：[Kenney Assets](https://kenney.nl/assets)
- Quaternius：提供大量免费风格化 3D 资源，包括角色、自然场景、建筑、奇幻与体素相关资源。来源：[Quaternius](https://quaternius.com/)
- Poly Pizza：提供 10,500+ 免费低模模型，适合补充单体角色、树木、建筑、道具。来源：[Poly Pizza](https://poly.pizza/)

这些来源适合的分工：

- Kenney：基础环境件、模块化套件、通用低模资源
- Quaternius：风格化角色、奇幻建筑、自然场景、体素和 RTS 方向素材
- Poly Pizza：零散补件和单体模型

### 9.26 我能不能自己生成一套统一资产

可以，但不建议“整套资产都从零 AI 生成”。

更可行的是生成或制作“统一层”：

- 统一材质
- 统一配色
- 统一标签系统
- 统一地形语言
- 统一热点和交互组件
- 统一 Web3 功能模块

也就是说，我们自己真正要做的不是“几百个模型”，而是让外部基础资产进入同一个视觉系统。

### 9.27 哪些资产适合自己生成

最适合自己生成的是规则性强、结构明确、风格可控的部分：

- 地形底盘
- 河流和道路
- 路径箭头
- 热点、光圈、标签、提示牌
- 体素方块与体素地形
- 展位、舞台、NFT wall、timeline 这类模块化结构
- 简单的低模树木、台阶、平台、立柱、围栏

这些内容可以通过：

- Three.js 程序化建模
- Blender 中的基础几何搭建
- 统一材质系统
- prefab 组合

来完成。

### 9.28 哪些资产不适合自己临场生成

不适合现场从零生成的包括：

- 高质量主角
- 风格鲜明的人物角色
- 高辨识度建筑地标
- 复杂骨骼动画
- 精细载具和复杂机械

这些内容最好采用：

- 现成资产包
- 现成角色基础模型
- 我们做轻度改造和风格统一

### 9.29 如果自己生成，应该怎么做

如果我们自己做统一资产，建议按下面的方法执行。

#### 方法 A：程序化生成系统级资产

适合做：

- 地图底盘
- 圆盘世界
- 河流
- 道路
- 路径箭头
- 高亮圈
- 体素网格
- 标签支架

怎么做：

- 用 Three.js / React Three Fiber 直接生成几何体
- 用 spline 或 path 控制道路和河流
- 用 instancing 重复树木、旗帜、路牌
- 用 shader 或基础材质做发光和高亮

优点：

- 最稳定
- 最统一
- 最容易跟 scene spec 对接

#### 方法 B：低模 prefab 手工搭建

适合做：

- 主城
- 分城
- 舞台
- 展位
- NFT 墙
- Agent 中控台
- 岛屿地标

怎么做：

- 用 Blender 基础几何体快速搭建
- 控制面数和体块关系
- 给不同风格各做一套统一材质
- 导出 `glb`

优点：

- 最容易形成“这是 Daedalus 自己的世界”
- 比完全依赖第三方资产更有品牌感

#### 方法 C：第三方资产二次统一

适合做：

- 树木
- 岩石
- 围栏
- 风车
- 基础房屋
- 简单角色
- 动物和装饰道具

怎么做：

- 选同一风格方向的资产包
- 在 Blender 中统一尺寸、朝向、颜色、材质
- 统一命名后导入工程

优点：

- 节省时间
- 视觉上仍可统一

### 9.30 实际推荐的资产制作路线

如果是我来推进这个黑客松项目，我会这样做：

1. `Game Style`
   基础建筑、树木、桥、风车、围栏先从现成低模资产包里挑
2. `Game Style`
   河流、道路、路径箭头、光圈、标签、资源牌自己程序化做
3. `Game Style`
   主城、主舞台、NFT wall、Agent command center 自己做成定制 prefab
4. `Animation Style`
   岛屿、树木、云朵、地标以低模资产包为主，再统一配色
5. `Voxel Style`
   尽量自己程序化做，因为最统一、最稳、最能体现生成感

这条路线的优点是：

- 首页最强视觉先成立
- Studio 的动态生成也能成立
- 不会陷入“等模型全做完才能开始”的死局

### 9.31 资产制作的最小执行方案

为了尽快进入 demo，可按这套最小方案落地：

#### 第一步：先做 `Game Style` 首页资产

必须完成：

- 主城
- 分城
- 河流
- 道路
- 桥
- 塔楼
- 资源点
- 路径箭头
- 标签组件
- 一组单位
- 一个主角

#### 第二步：再做 `Studio` 必要模块

必须完成：

- Project Booth
- NFT Wall
- Sponsor Zone
- Timeline Corridor
- Agent Command Center

#### 第三步：补风格切换证明

必须完成：

- `Animation Style` 最小岛屿世界
- `Voxel Style` 最小方块世界

### 9.32 我自己能否“统一生成”资产的结论

可以，但合理边界应该是：

- `可以自己统一生成`
  地形、道路、河流、标签、热点、展位、舞台、体素模块、Web3 功能模块
- `可以自己统一改造`
  基础建筑、树木、围栏、桥、风车、基础角色
- `不建议自己从零生成`
  高质量角色、复杂动画、复杂地标、大量高精模型

所以最实际的结论是：

不是“全部去 GitHub 找”，也不是“全部我现场生成”，而是：

`现成资产包打底 + 程序化资产做系统层 + 关键品牌资产自己统一制作`

建议的目录思路：

```text
assets/
├── game/
│   ├── terrain/
│   ├── buildings/
│   ├── units/
│   ├── props/
│   └── effects/
├── animation/
│   ├── terrain/
│   ├── buildings/
│   ├── mascot/
│   ├── props/
│   └── effects/
└── voxel/
    ├── blocks/
    ├── terrain/
    ├── buildings/
    ├── character/
    └── effects/
```

## 10. 安全与边界

- GLM-5.1 不直接执行任意代码。
- 生成内容必须通过 scene schema 校验。
- MVP 不触发主网交易，不读取私钥。
- 钱包连接只用于展示地址或身份 Badge。
- 外部链接、项目链接、链上证明需要显式展示，不隐藏跳转。
- 所有 Agent 操作记录写入执行轨迹，方便评委审计。

## 10.1 地形生成系统升级方向

演示版 Daedalus 已经可以将结构化 scene spec 渲染为浏览器 3D 世界，但当前地形仍然偏固定规则生成。产品级版本需要升级为“地形感知世界生成系统”，让自然语言中的地貌意图真正影响地图、建筑和路径。

升级目标包括：

- 支持每次生成不同但可复现的地图地盘
- 支持 LLM 输出高层地形意图，例如海岸、森林、山区、河流、湖泊、海湾
- 通过程序化地形生成器稳定落地，而不是让 LLM 逐 tile 生成地图
- 让 zone、landmark、道路、河流和地形之间互相约束
- 增加地形验证与修复，例如建筑不落水、道路可达、海岸连续、地貌意图被满足

建议架构：

```text
Prompt
  -> Scene Planner
  -> Terrain Plan
  -> Terrain Generator
  -> Layout Solver
  -> World Validation
  -> Renderer
```

具体技术方案见 [TerrainSystem.md](./TerrainSystem.md)。

## 11. Demo 脚本

1. 打开 `Home` 页面，首屏直接看到 Daedalus 品牌、slogan 和 3D 世界背景。
2. 展示首页统计数字，快速建立“它已经生成过很多世界”的可信度。
3. 下滚到第二屏，展示 GLM-5.1 长程工作流六阶段。
4. 点击 `Enter Studio` 进入操作平台。
5. 在 Prompt 区输入新需求：增加赞助商区域和三个 DeFi AI Agent 项目展台。
6. 中间工作流面板显示计划、执行、验证状态。
7. 右侧 scene preview 更新，场景出现新区域。
8. Validator 发现缺少 Web3 proof，Agent 自动补上 NFT/POAP 墙。
9. 展示最终 3D 场景、执行轨迹和导出产物。

## 12. 里程碑

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

## 13. 验收标准

- `npm run dev` 能启动项目。
- 产品至少包含 `Home` 和 `Studio` 两个页面。
- 顶部导航可以在 `Home` 和 `Studio` 之间切换。
- Home 第一屏包含品牌、slogan、CTA、统计数字和 3D 背景场景。
- Home 第二屏明确展示 GLM-5.1 长程工作流，而不是普通功能列表。
- Studio 页面同时可见 Prompt 输入、Agent 执行过程、3D 场景预览。
- Home 页面存在可读的品牌识别系统：logo、产品名、slogan、CTA。
- Home 页面存在统计数字区，并能够表达“世界 / 元素 / 模型”三个维度。
- Studio 页面在生成过程中能够展示至少 4 种不同状态变化。
- 场景中至少有 6 类 Web3 空间模块。
- 用户能看到 Agent 执行轨迹。
- 至少一次验证失败和修复成功被明确展示。
- README 能解释问题、方案、架构、运行方式和 Z.AI Track 匹配点。
- Demo 视频能在 2 分钟内讲清楚完整闭环。

## 14. 风险与应对

| 风险 | 影响 | 应对 |
| --- | --- | --- |
| 通用 3D 生成过大 | 无法按时完成 | 只做 Web3 展厅垂直场景 |
| GLM-5.1 接入不稳定 | Demo 中断 | 保留 mock planner 和预置 trace |
| 视觉效果不够强 | 难抓评委眼球 | 先做 Showcase Mode，高完成度场景优先 |
| Agent 像一次性生成 | 赛道匹配弱 | 强制展示计划、验证、修复、交付 |
| Three.js 性能问题 | 运行卡顿 | 使用程序化几何体，限制对象数量 |

## 15. 项目一句话

Daedalus turns Web3 event briefs into validated, deployable 3D worlds with a GLM-5.1 agent workflow that plans, generates, verifies, repairs, and packages the scene.
