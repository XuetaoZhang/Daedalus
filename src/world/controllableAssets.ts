export const controllableLandmarkTypes = [
  "bridge",
  "building-archery",
  "building-cabin",
  "building-castle",
  "building-dock",
  "building-farm",
  "building-house",
  "building-market",
  "building-mill",
  "building-mine",
  "building-port",
  "building-sheep",
  "building-smelter",
  "building-tower",
  "building-village",
  "building-wall",
  "building-walls",
  "building-watermill",
  "building-wizard-tower",
] as const;

export type ControllableLandmarkType = (typeof controllableLandmarkTypes)[number];

export type ControllableLandmarkAsset = {
  type: ControllableLandmarkType;
  title: string;
  zhTitle: string;
  preview: string;
  animated?: boolean;
  scale: number;
  y: number;
  rotation?: [number, number, number];
  defaultRegion: "north" | "south" | "east" | "west" | "northwest" | "northeast" | "southwest" | "southeast" | "center_ring" | "outer_ring";
  routeAlias?: "village" | "windmill";
  aliases: string[];
};

const previewBase = "public/kenney_hexagon-kit/Previews";

export const controllableLandmarkRegistry: Record<ControllableLandmarkType, ControllableLandmarkAsset> = {
  bridge: {
    type: "bridge",
    title: "Bridge",
    zhTitle: "桥梁",
    preview: `${previewBase}/bridge.png`,
    scale: 0.86,
    y: 0.18,
    rotation: [0, Math.PI / 2, 0],
    defaultRegion: "center_ring",
    aliases: ["bridge", "wooden bridge", "桥", "桥梁"],
  },
  "building-archery": {
    type: "building-archery",
    title: "Archery Range",
    zhTitle: "箭术营地",
    preview: `${previewBase}/building-archery.png`,
    scale: 0.84,
    y: 0.18,
    rotation: [0, -0.28, 0],
    defaultRegion: "west",
    aliases: ["building-archery", "archery", "archery range", "箭术营地", "弓箭营地", "射箭场"],
  },
  "building-cabin": {
    type: "building-cabin",
    title: "Cabin",
    zhTitle: "木屋",
    preview: `${previewBase}/building-cabin.png`,
    scale: 0.64,
    y: 0.18,
    rotation: [0, 0.32, 0],
    defaultRegion: "southwest",
    aliases: ["building-cabin", "cabin", "hut", "木屋", "小木屋"],
  },
  "building-castle": {
    type: "building-castle",
    title: "Small Castle",
    zhTitle: "小城堡",
    preview: `${previewBase}/building-castle.png`,
    scale: 0.72,
    y: 0.2,
    defaultRegion: "east",
    aliases: ["building-castle", "castle", "small castle", "outpost", "城堡", "小城堡", "前哨城堡"],
  },
  "building-dock": {
    type: "building-dock",
    title: "Dock",
    zhTitle: "码头",
    preview: `${previewBase}/building-dock.png`,
    scale: 0.72,
    y: 0.18,
    rotation: [0, Math.PI / 6, 0],
    defaultRegion: "south",
    aliases: ["building-dock", "dock", "pier", "码头", "栈桥"],
  },
  "building-farm": {
    type: "building-farm",
    title: "Farm",
    zhTitle: "农场",
    preview: `${previewBase}/building-farm.png`,
    scale: 0.76,
    y: 0.18,
    defaultRegion: "south",
    aliases: ["building-farm", "farm", "farmland", "农场", "田地"],
  },
  "building-house": {
    type: "building-house",
    title: "House",
    zhTitle: "民居",
    preview: `${previewBase}/building-house.png`,
    scale: 0.7,
    y: 0.18,
    rotation: [0, -0.2, 0],
    defaultRegion: "west",
    aliases: ["building-house", "house", "home", "民居", "房子", "住宅"],
  },
  "building-market": {
    type: "building-market",
    title: "Market",
    zhTitle: "集市",
    preview: `${previewBase}/building-market.png`,
    scale: 0.74,
    y: 0.18,
    rotation: [0, -0.34, 0],
    defaultRegion: "center_ring",
    aliases: ["building-market", "market", "bazaar", "集市", "市场", "摊位市场"],
  },
  "building-mill": {
    type: "building-mill",
    title: "Windmill",
    zhTitle: "风车",
    preview: `${previewBase}/building-mill.png`,
    animated: true,
    scale: 0.74,
    y: 0.18,
    defaultRegion: "north",
    routeAlias: "windmill",
    aliases: ["building-mill", "windmill", "wind mill", "风车"],
  },
  "building-mine": {
    type: "building-mine",
    title: "Mine",
    zhTitle: "矿场",
    preview: `${previewBase}/building-mine.png`,
    scale: 0.74,
    y: 0.18,
    rotation: [0, -0.24, 0],
    defaultRegion: "northwest",
    aliases: ["building-mine", "mine", "quarry", "矿场", "矿洞", "矿井"],
  },
  "building-port": {
    type: "building-port",
    title: "Port",
    zhTitle: "港口",
    preview: `${previewBase}/building-port.png`,
    scale: 0.78,
    y: 0.18,
    rotation: [0, Math.PI / 10, 0],
    defaultRegion: "southeast",
    aliases: ["building-port", "port", "harbor", "港口", "海港"],
  },
  "building-sheep": {
    type: "building-sheep",
    title: "Sheep Farm",
    zhTitle: "牧场",
    preview: `${previewBase}/building-sheep.png`,
    scale: 0.68,
    y: 0.18,
    defaultRegion: "southwest",
    aliases: ["building-sheep", "sheep farm", "sheep pen", "牧场", "羊圈", "羊场"],
  },
  "building-smelter": {
    type: "building-smelter",
    title: "Smelter",
    zhTitle: "冶炼厂",
    preview: `${previewBase}/building-smelter.png`,
    scale: 0.7,
    y: 0.18,
    defaultRegion: "northwest",
    aliases: ["building-smelter", "smelter", "forge", "冶炼厂", "熔炉", "铁匠铺"],
  },
  "building-tower": {
    type: "building-tower",
    title: "Watch Tower",
    zhTitle: "哨塔",
    preview: `${previewBase}/building-tower.png`,
    scale: 0.62,
    y: 0.18,
    rotation: [0, 0.2, 0],
    defaultRegion: "northeast",
    aliases: ["building-tower", "tower", "watch tower", "guard tower", "哨塔", "塔楼"],
  },
  "building-village": {
    type: "building-village",
    title: "Village",
    zhTitle: "村庄",
    preview: `${previewBase}/building-village.png`,
    scale: 0.72,
    y: 0.18,
    rotation: [0, -0.2, 0],
    defaultRegion: "west",
    routeAlias: "village",
    aliases: ["building-village", "village", "village house", "村庄", "村落"],
  },
  "building-wall": {
    type: "building-wall",
    title: "Wall Segment",
    zhTitle: "城墙段",
    preview: `${previewBase}/building-wall.png`,
    scale: 0.72,
    y: 0.18,
    defaultRegion: "outer_ring",
    aliases: ["building-wall", "wall segment", "single wall", "城墙段", "单段城墙"],
  },
  "building-walls": {
    type: "building-walls",
    title: "Fortified Walls",
    zhTitle: "城墙群",
    preview: `${previewBase}/building-walls.png`,
    scale: 0.68,
    y: 0.19,
    rotation: [0, Math.PI / 6, 0],
    defaultRegion: "outer_ring",
    aliases: ["building-walls", "walls", "fortified walls", "wall set", "城墙群", "防御城墙"],
  },
  "building-watermill": {
    type: "building-watermill",
    title: "Watermill",
    zhTitle: "水车",
    preview: `${previewBase}/building-watermill.png`,
    animated: true,
    scale: 0.78,
    y: 0.18,
    defaultRegion: "south",
    routeAlias: "windmill",
    aliases: ["building-watermill", "watermill", "water mill", "水车"],
  },
  "building-wizard-tower": {
    type: "building-wizard-tower",
    title: "Wizard Tower",
    zhTitle: "魔法塔",
    preview: `${previewBase}/building-wizard-tower.png`,
    scale: 0.76,
    y: 0.18,
    defaultRegion: "south",
    aliases: ["building-wizard-tower", "wizard tower", "magic tower", "mage tower", "魔法塔"],
  },
};

export const controllableLandmarkList = controllableLandmarkTypes.map((type) => controllableLandmarkRegistry[type]);

export const controllableLandmarkAliasMap = controllableLandmarkList.reduce<Record<string, ControllableLandmarkType>>((acc, asset) => {
  acc[asset.type] = asset.type;
  acc[asset.type.replace(/-/g, "_")] = asset.type;

  for (const alias of asset.aliases) {
    acc[alias.trim().toLowerCase().replace(/[\s-]+/g, "_")] = asset.type;
  }

  return acc;
}, {});

export function getControllableLandmarkAsset(type: string) {
  return controllableLandmarkRegistry[type as ControllableLandmarkType];
}
