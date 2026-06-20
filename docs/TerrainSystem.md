# Terrain System Proposal

## 1. Goal

Upgrade Daedalus from a mostly fixed hex board with local terrain variation into a real terrain system that can:

- generate different world landmasses from a seed
- support higher-level terrain intents from the LLM
- keep settlements, landmarks, roads, and waterways spatially valid
- preserve the current browser-first rendering model

This proposal deliberately separates:

- `LLM planning` for terrain intent
- `deterministic generation` for the actual terrain layout
- `layout solving` for placing zones and landmarks
- `validation / repair` for enforcing world consistency

The main idea is simple:

`The model proposes the world shape. The renderer and solver make it real.`

## 2. Why this matters

Right now the Studio world can:

- place zones in semantic positions
- place landmark buildings by natural language
- render hex tiles with some local variation

But it does not yet behave like a full terrain system.

It cannot yet reliably express:

- `海边小屋`
- `西南角做一个半月形海湾`
- `东北侧全是山区`
- `西部地区全是森林`
- `一张每次生成都不同，但依然合理的地图`

The system currently decides terrain mostly inside `WorldRenderer.tsx`, which is good for MVP but too coupled for a more polished product.

## 3. Target capabilities

### 3.1 Seeded variety

Each generation should be able to produce a different terrain layout from a seed while staying consistent across renders.

Example:

- `terrainSeed: 18342`
- `terrainProfile: coastal`

### 3.2 Higher-level terrain intent

The model should be able to request terrain intent instead of tile-by-tile output.

Example intents:

- bay
- coast
- river
- lake
- forest
- mountains
- plains
- rocky edge

### 3.3 Layout awareness

Terrain should influence where zones and landmarks are placed.

Rules such as:

- main stage should not spawn in water
- dock / port should prefer coastline
- cabin / village should prefer grass or sand near coast
- wizard tower can prefer high ground
- watermill should prefer river edges

### 3.4 Validation

The system should validate:

- no zone sits on water unless allowed
- coastline is continuous enough
- landmarks respect terrain affinity
- roads stay connected
- user-requested terrain intents are visible

## 4. Proposed data model

### 4.1 SceneSpec extensions

Add terrain-related fields:

```ts
terrainSeed?: number;
terrainProfile?: "coastal" | "forest" | "mountain" | "river" | "plain" | "mixed";
terrainDirectives?: TerrainDirective[];
```

### 4.2 TerrainDirective

```ts
type TerrainDirective = {
  type: "bay" | "forest" | "mountain" | "river" | "lake" | "coast" | "plain";
  region?: "north" | "south" | "east" | "west" | "northwest" | "northeast" | "southwest" | "southeast" | "center_ring" | "outer_ring";
  shape?: "soft" | "crescent" | "linear" | "blob";
  density?: "light" | "medium" | "dense";
  size?: "small" | "medium" | "large";
};
```

### 4.3 Terrain cell state

Each hex cell should have a generated biome:

```ts
type TerrainBiome = "grass" | "sand" | "water" | "forest" | "mountain" | "rock";
```

Optional metadata:

- elevation
- moisture
- shoreline distance
- region membership

## 5. Generation pipeline

### Stage A: LLM terrain plan

The planner outputs:

- terrain profile
- seed
- a small set of terrain directives

It should not output per-cell geometry.

This keeps the output stable and model-agnostic.

### Stage B: deterministic terrain generation

Use the seed + directives to generate:

- landmass
- coastline
- inland forest
- mountain clusters
- river / lake / bay shapes
- sand transition zones

This should live outside `WorldRenderer.tsx`.

### Stage C: layout solving

Given terrain cells, place:

- zones
- landmarks
- paths
- decorative prefabs

The solver should choose valid cells, not just fixed coordinates.

### Stage D: validation and repair

Validate world constraints and, if needed, repair by:

- shifting zone anchors
- changing a directive
- adjusting the seed
- regenerating terrain around a failed region

## 6. System split

### 6.1 New modules

Suggested files:

```text
src/world/terrain/
  terrainTypes.ts
  terrainPlan.ts
  terrainGenerator.ts
  terrainSolver.ts
  terrainValidation.ts
```

### 6.2 Existing modules to refactor

- `sceneSpec.ts`
- `sceneSchema.ts`
- `providers.ts`
- `mockPlanner.ts`
- `studioWorldLayout.ts`
- `WorldRenderer.tsx`
- `studioWorkflow.ts`

## 7. Rendering strategy

The renderer should no longer decide terrain from scratch.

Instead:

- read a generated terrain map
- map each cell to a prefab tile
- render coastline, forest, mountain, sand, water consistently

`WorldRenderer.tsx` should become a consumer of terrain output, not the origin of terrain logic.

## 8. Layout strategy

The layout solver should know terrain constraints.

Example rules:

- zone placement chooses suitable terrain first
- landmarks inherit terrain affinity
- roads route through passable cells
- water-adjacent assets prefer coastline cells

This allows prompts like:

- `海边小屋`
- `山顶魔法塔`
- `河边村庄`
- `北部森林里的小木屋`

## 9. Validation strategy

Validation should include:

- `zone_not_on_water`
- `coastline_broken`
- `landmark_wrong_biome`
- `route_disconnected`
- `terrain_directive_not_fulfilled`

Repair should prefer small corrections:

- move the zone
- change a landmark anchor
- regenerate a local patch
- adjust terrain seed only if needed

## 10. Recommended implementation order

### Phase 1

- extract terrain generation into its own module
- add seed + profile to `SceneSpec`
- keep current visual output mostly unchanged

Current implementation status:

- `SceneSpec` now accepts `terrainSeed` and `terrainProfile`
- the planner prompt and local planner both provide those fields
- `WorldRenderer.tsx` consumes generated terrain tiles instead of owning the terrain rules directly
- `terrainProfile` currently supports `coastal`, `forest`, `mountain`, `river`, `plain`, and `mixed`
- zone plazas, roads, and river cells are protected so buildings still land on readable terrain

### Phase 2

- add terrain directives
- support seeded variation
- let the planner output terrain profiles

Current implementation status:

- seeded variation is partially active through `terrainSeed`
- terrain profiles already produce visibly different base terrain distributions
- explicit region directives such as `南边一片水域`, `西侧森林`, and `东北侧山区` are now supported at a first-pass level
- directives are applied as soft regional biome influences, while zone plazas and routes remain protected from terrain overwrite
- landmark terrain affinity is active for common prefab types: docks, ports, watermills, and bridges create local water/sand context; mines, towers, smelters, and wizard towers create local stone/mountain context; villages, farms, houses, cabins, and markets keep walkable grass context

### Phase 3

- add layout constraints
- make zones and landmarks terrain-aware
- add validation and repair for terrain violations

### Phase 4

- support higher-level natural language terrain phrases
- add coast / bay / mountain / forest compositions
- make the map feel more authored and less procedural

## 11. Product position

This upgrade changes Daedalus from:

- `structured world renderer`

into:

- `agentic terrain-aware world builder`

That is a much stronger product story.
