/**
 * TMK 数学家 — 核心类型定义
 * 基于太一万有理论的数学发现引擎数据结构
 */

/** N₈ 端口位掩码常量 */
export const PORT = {
  // 构造/肯端口 (χ=+1)
  cn: 1 << 0,  // Construct North In   — 接收上游构造流
  cx: 1 << 1,  // Construct South Out  — 向下游输出构造结果
  ce: 1 << 2,  // Construct East  In   — 横向构造接收
  cw: 1 << 3,  // Construct West  Out  — 横向构造发射

  // 消解/否端口 (χ=-1)
  an: 1 << 4,  // Annihilate North In  — 接收待消解项
  ax: 1 << 5,  // Annihilate South Out — 输出消解残差
  ae: 1 << 6,  // Annihilate East  In  — 横向消解接收
  aw: 1 << 7,  // Annihilate West  Out — 横向消解发射

  // 元端口
  obs: 1 << 8,   // Observe   — L₅现象截影锚定点
  self: 1 << 9,  // Selfref   — ICE自指闭环接入点
} as const;

/** N₈ 核心掩码（8位） */
export const N8_CORE = 0xFF;

/** 端口名称映射 */
export const PORT_NAMES: Record<number, string> = {
  [PORT.cn]: 'CN (构造北入)',
  [PORT.cx]: 'CX (构造南出)',
  [PORT.ce]: 'CE (构造东入)',
  [PORT.cw]: 'CW (构造西出)',
  [PORT.an]: 'AN (消解北入)',
  [PORT.ax]: 'AX (消解南出)',
  [PORT.ae]: 'AE (消解东入)',
  [PORT.aw]: 'AW (消解西出)',
  [PORT.obs]: 'OBS (观察)',
  [PORT.self]: 'SELF (自指)',
};

/** 端口方位角度映射（用于可视化渲染） */
export const PORT_ANGLES: Record<number, number> = {
  [PORT.cn]: -Math.PI / 2,     // 北（上）
  [PORT.cx]: Math.PI / 2,      // 南（下）
  [PORT.ce]: 0,                 // 东（右）
  [PORT.cw]: Math.PI,           // 西（左）
  [PORT.an]: -Math.PI / 2 + Math.PI / 8,
  [PORT.ax]: Math.PI / 2 + Math.PI / 8,
  [PORT.ae]: Math.PI / 8,
  [PORT.aw]: Math.PI + Math.PI / 8,
  [PORT.obs]: -Math.PI / 4,
  [PORT.self]: Math.PI * 3 / 4,
};

/** 端口方向类型：入(in) / 出(out) */
export const PORT_DIRECTION: Record<number, 'in' | 'out'> = {
  [PORT.cn]: 'in',
  [PORT.cx]: 'out',
  [PORT.ce]: 'in',
  [PORT.cw]: 'out',
  [PORT.an]: 'in',
  [PORT.ax]: 'out',
  [PORT.ae]: 'in',
  [PORT.aw]: 'out',
  [PORT.obs]: 'in',
  [PORT.self]: 'out',
};

/** 端口手性类型：构造 / 消解 / 元 */
export type PortChirality = 'construct' | 'annihilate' | 'meta';

/** 端口手性映射 */
export const PORT_CHIRALITY: Record<number, PortChirality> = {
  [PORT.cn]: 'construct',
  [PORT.cx]: 'construct',
  [PORT.ce]: 'construct',
  [PORT.cw]: 'construct',
  [PORT.an]: 'annihilate',
  [PORT.ax]: 'annihilate',
  [PORT.ae]: 'annihilate',
  [PORT.aw]: 'annihilate',
  [PORT.obs]: 'meta',
  [PORT.self]: 'meta',
};

/**
 * 金灵球 — TMK 核心数据结构
 * 每个金灵球是一个自指数学实体
 */
export interface JinlingSphere {
  /** 唯一标识 */
  sid: string;
  /** blake3(S‑expr(type_fingerprint)) ∈ ℤ_p */
  i_int: number;
  /** N₈ core mask(bits0‑7)|obs(bit8)|selfref(bit9) */
  ports: number;
  /** +1 构造 / -1 消解 */
  chi: number;
  /** m in EML number z=m⊗e^{iθ} */
  mod: number;
  /** θ ∈ [0,2π) */
  phase: number;
}

/**
 * 超边类型
 */
export type HyperedgeKind = 'add' | 'mul' | 'wedge' | 'meet' | 'gp' | 'colocate' | 'beta_split';

/**
 * 超边 — k-ary 关系
 */
export interface Hyperedge {
  /** k-ary 源球集合 (k≥2) */
  src: string[];
  /** 目标金灵球 */
  tgt: string;
  /** 超边运算类型 */
  kind: HyperedgeKind;
  /** 源球的 Clifford grade */
  gradeSrc: number[];
  /** 目标球的 Clifford grade */
  gradeTgt: number;
  /** 权重 */
  w: number;
}

/**
 * 金陵堆 — TMK 拓扑结构
 */
export interface JinlingHeap {
  /** 金灵球集合 */
  V: Map<string, JinlingSphere>;
  /** 二元边 (u, v, w, chi) */
  E_bin: Array<[string, string, number, number]>;
  /** 超边集合 */
  F_hyper: Hyperedge[];
}

/**
 * β-rewire 候选操作
 */
export interface RewireCandidate {
  type: 'add_edge' | 'del_edge' | 'elaboration';
  /** 涉及的边/球 */
  edge?: [string, string, number, number];
  /** 删除的边索引 */
  delIndex?: number;
  /** 新诞生的球 */
  newSphere?: JinlingSphere;
  /** 新诞生的超边 */
  newHyperedge?: Hyperedge;
  /** S_rel 值 */
  sRel: number;
}

/**
 * β-rewire 参数
 */
export interface BetaRewireParams {
  /** α — 边数权重 */
  alpha: number;
  /** β — 相位熵权重 */
  beta: number;
  /** 迭代步数 */
  steps: number;
}

/**
 * β-rewire 单步结果
 */
export interface RewireStepResult {
  /** 步骤序号 */
  step: number;
  /** 选中的候选操作 */
  candidate: RewireCandidate;
  /** 当前 S_rel */
  sRel: number;
  /** S_rel 分量：α·M */
  sM: number;
  /** S_rel 分量：β·H */
  sH: number;
  /** 发现描述 */
  discovery: string;
}

/**
 * PCT 端口兼容性校验结果
 */
export interface PCTResult {
  /** 方向互补 */
  directionOk: boolean;
  /** 手性相容 */
  chiralityOk: boolean;
  /** 相位可锁 */
  phaseOk: boolean;
  /** 阶守恒 */
  gradeOk: boolean;
  /** 总体兼容 */
  compatible: boolean;
  /** 详情说明 */
  details: string[];
}

/**
 * 发现日志条目
 */
export interface DiscoveryEntry {
  /** 时间戳 */
  timestamp: number;
  /** 发现类型 */
  type: 'new_sphere' | 'new_edge' | 'del_edge' | 'new_hyperedge' | 'phase_lock' | 'grade_conserve';
  /** 描述 */
  description: string;
  /** 相关球体 */
  spheres: string[];
  /** 详细数据 */
  data?: Record<string, unknown>;
}

/**
 * 层级枚举
 */
export type Layer = 'L1' | 'L2' | 'L3' | 'L4' | 'L5';

/**
 * CHL 对比条目
 */
export interface CHLEntry {
  /** 概念名称 */
  concept: string;
  /** 经典 CHL 描述 */
  classical: string;
  /** TMK 描述 */
  tmk: string;
}

/**
 * D3 力导向图节点数据
 */
export interface SimNode extends d3.SimulationNodeDatum {
  sid: string;
  chi: number;
  phase: number;
  mod: number;
  ports: number;
  radius: number;
}

/**
 * D3 力导向图边数据
 */
export interface SimLink extends d3.SimulationLinkDatum<SimNode> {
  weight: number;
  chi: number;
  index: number;
}

// 导入 d3 用于类型
import type * as d3 from 'd3';

// ==================== 白皮书升级：金符 / MNQ8 / ICE ====================

/** 金符 3D 复广数 */
export interface GoldenSymbol {
  /** 流贯幅值分量（实轴） */
  a: number;
  /** 波性振荡分量（i 轴，i²=-1） */
  b: number;
  /** 关系相位分量（j 轴，j²=-1，j 与 i 对易） */
  c: number;
}

/** MNQ8 更新结果 */
export interface MNQ8Result {
  /** 球体 ID */
  sid: string;
  /** 更新后的 mod */
  newMod: number;
  /** 更新后的 phase */
  newPhase: number;
  /** 状态：囚禁 / 弥散 */
  status: 'CONFINED' | 'DISPERSED';
  /** |total_flux|² — Mass-Face 值 */
  massFace: number;
  /** massFace - MASS_THRESHOLD（仅 CONFINED 时有意义） */
  excessLoopHold: number;
  /** 边界泄漏估计 */
  boundaryLeak: number;
  /** 累积阴龙积结果 */
  totalFlux: GoldenSymbol;
}

/** ICE 快照 */
export interface ICESnapshot {
  /** 快照序号 */
  id: number;
  /** 时间戳 */
  timestamp: number;
  /** 堆垒摘要 */
  heapSummary: {
    nodeCount: number;
    edgeCount: number;
    avgPhase: number;
    avgMod: number;
    sRel: number;
    topologyHash: string;
  };
  /** 自动生成的内省文字 */
  selfReflection: string;
  /** 当前假说 */
  conjecture: string;
}

/** ICE 状态 */
export interface ICEState {
  /** 快照历史 */
  snapshots: ICESnapshot[];
  /** 当前假说 */
  currentConjecture: string;
  /** 循环计数 */
  cycleCount: number;
  /** 是否激活 */
  isActive: boolean;
  /** 上次动作类型 */
  lastActionType: 'introspect' | 'conjecture' | 'execute' | 'idle';
}
