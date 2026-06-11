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
| Logo Daedalus                 Home | Studio                                      |
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


## 15. 项目一句话

Daedalus turns Web3 event briefs into validated, deployable 3D worlds with a GLM-5.1 agent workflow that plans, generates, verifies, repairs, and packages the scene.
