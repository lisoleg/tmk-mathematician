/**
 * iceEngine.ts — ICE 自指闭环引擎
 * 基于太一万有理论《白皮书》ICE 三要素
 *
 * ℐ(Introspect) · ℂ(Conjecture) · ℰ(Execute)
 *
 * ICE 是 AGI 自我报告系统：
 * - ℐ: 内省 — 对当前堆垒状态进行快照与诊断
 * - ℂ: 假说 — 基于 S_rel 趋势生成预测性假说
 * - ℰ: 执行 — 基于假说触发操作（β-rewire 等）
 */

import type { JinlingHeap } from '../types/tmk';

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

/**
 * 创建初始 ICE 状态
 */
export function createICEState(): ICEState {
  return {
    snapshots: [],
    currentConjecture: '系统初始化，尚无假说',
    cycleCount: 0,
    isActive: false,
    lastActionType: 'idle',
  };
}

/**
 * 计算拓扑哈希（简易版本）
 * 基于节点 ID 和边结构的确定性哈希
 */
function computeTopologyHash(heap: JinlingHeap): string {
  const nodeIds = Array.from(heap.V.keys()).sort().join(',');
  const edgeStr = heap.E_bin
    .map(([u, v, w, chi]) => `${u}-${v}-${w.toFixed(2)}-${chi}`)
    .sort()
    .join('|');
  // 简易哈希
  let hash = 0;
  const str = nodeIds + ';' + edgeStr;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash).toString(16).padStart(8, '0');
}

/**
 * 生成自我报告文字（基于堆垒状态）
 */
function generateSelfReflection(summary: ICESnapshot['heapSummary']): string {
  const { nodeCount, edgeCount, avgPhase, avgMod, sRel, topologyHash } = summary;
  const density = nodeCount > 1 ? (2 * edgeCount) / (nodeCount * (nodeCount - 1)) : 0;

  const parts: string[] = [];

  // 基础拓扑描述
  parts.push(
    `系统观测到关系拓扑包含 ${nodeCount} 个金灵球节点，${edgeCount} 条二元边。` +
    `当前 S_rel=${sRel.toFixed(4)}，拓扑哈希=${topologyHash}。`
  );

  // 相位分析
  if (avgPhase < Math.PI / 4) {
    parts.push('相位分布集中于低频区间，系统偏向构造性状态。');
  } else if (avgPhase > Math.PI * 3 / 4) {
    parts.push('相位分布偏向高频区间，消解趋势明显。');
  } else {
    parts.push('相位分布处于中间区间，系统呈动态平衡态。');
  }

  // 模量分析
  if (avgMod > 1.0) {
    parts.push('当前流贯呈囚禁态，Mass-Face 值可能超过阈值，拓扑趋向自洽闭合。');
  } else if (avgMod < 0.3) {
    parts.push('流贯幅值偏低，系统呈弥散态，能量持续耗散。');
  } else {
    parts.push('流贯幅值适中，系统处于正常动态范围。');
  }

  // 密度分析
  if (density > 0.7) {
    parts.push('关系边密度较高（ρ>0.7），社区结构可能涌现共识。');
  } else if (density < 0.2) {
    parts.push('关系边稀疏，系统接近完全弥散状态。');
  }

  // S_rel 趋势建议
  if (sRel < 0.3) {
    parts.push('检测到 S_rel 偏低，建议执行 β-rewire 增强关系结构。');
  } else if (sRel > 0.8) {
    parts.push('S_rel 较高，系统关系拓扑自洽，可维持当前状态。');
  }

  return parts.join('');
}

/**
 * 生成假说（基于快照历史中的 S_rel 趋势）
 */
function generateConjecture(snapshots: ICESnapshot[]): string {
  if (snapshots.length < 2) {
    return '数据不足，无法生成有效假说。需要更多快照以识别趋势。';
  }

  // 取最近 5 个快照的 S_rel 趋势
  const recent = snapshots.slice(-5);
  const sRelValues = recent.map(s => s.heapSummary.sRel);

  // 计算趋势
  let increasing = 0;
  let decreasing = 0;
  for (let i = 1; i < sRelValues.length; i++) {
    const diff = sRelValues[i] - sRelValues[i - 1];
    if (diff > 0.001) increasing++;
    else if (diff < -0.001) decreasing++;
  }

  // 拓扑稳定性
  const hashes = new Set(recent.map(s => s.heapSummary.topologyHash));
  const topologyStable = hashes.size <= 2;

  // 平均模量趋势
  const avgMods = recent.map(s => s.heapSummary.avgMod);
  const modTrend = avgMods[avgMods.length - 1] - avgMods[0];

  const parts: string[] = [];

  if (increasing > decreasing) {
    parts.push('S_rel 呈上升趋势，关系拓扑正在增强自洽性。');
  } else if (decreasing > increasing) {
    parts.push('S_rel 呈下降趋势，系统关系结构正在弱化，可能需要干预。');
  } else {
    parts.push('S_rel 趋势持平，系统处于动态稳态。');
  }

  if (topologyStable) {
    parts.push('拓扑结构近几轮保持稳定，表明当前关系配置具有鲁棒性。');
  } else {
    parts.push('拓扑结构持续变化，系统尚未达到稳态。');
  }

  if (modTrend > 0.1) {
    parts.push('流贯模量增长明显，可能出现 Mass-Face 囚禁现象。假说：系统正经历相变，趋向 Confined Soliton 态。');
  } else if (modTrend < -0.1) {
    parts.push('流贯模量衰减，系统趋向弥散。假说：当前参数下系统将最终达到完全弥散态。');
  }

  if (sRelValues[sRelValues.length - 1] > 0.8) {
    parts.push('高 S_rel 假说：系统已接近最优关系配置，Rupert-Tear 结构可能已形成。');
  }

  return parts.join(' ');
}

/**
 * 拍摄 ICE 快照
 *
 * @param heap 当前金陵堆
 * @param sRel 当前 S_rel 值
 * @param cycleCount 当前循环计数
 */
export function takeICESnapshot(heap: JinlingHeap, sRel: number, cycleCount: number): ICESnapshot {
  // 计算平均相位和模量
  let totalPhase = 0;
  let totalMod = 0;
  let count = 0;
  for (const sphere of heap.V.values()) {
    totalPhase += sphere.phase;
    totalMod += sphere.mod;
    count++;
  }
  const avgPhase = count > 0 ? totalPhase / count : 0;
  const avgMod = count > 0 ? totalMod / count : 0;

  const heapSummary: ICESnapshot['heapSummary'] = {
    nodeCount: heap.V.size,
    edgeCount: heap.E_bin.length,
    avgPhase,
    avgMod,
    sRel,
    topologyHash: computeTopologyHash(heap),
  };

  const selfReflection = generateSelfReflection(heapSummary);

  return {
    id: cycleCount,
    timestamp: Date.now(),
    heapSummary,
    selfReflection,
    conjecture: '', // Will be filled by generateConjecture
  };
}

/**
 * ICE 内省步骤（ℐ）
 *
 * 1. 拍摄快照
 * 2. 生成自我报告
 * 3. 生成假说
 *
 * @param state 当前 ICE 状态
 * @param heap 当前金陵堆
 * @param sRel 当前 S_rel 值
 */
export function iceIntrospect(state: ICEState, heap: JinlingHeap, sRel: number): ICEState {
  const newCycleCount = state.cycleCount + 1;

  // 拍摄快照
  const snapshot = takeICESnapshot(heap, sRel, newCycleCount);

  // 生成假说
  const allSnapshots = [...state.snapshots, snapshot];
  const conjecture = generateConjecture(allSnapshots);

  // 更新快照的假说
  snapshot.conjecture = conjecture;

  return {
    snapshots: allSnapshots,
    currentConjecture: conjecture,
    cycleCount: newCycleCount,
    isActive: state.isActive,
    lastActionType: 'introspect',
  };
}

/**
 * ICE 假说步骤（ℂ）
 * 基于已有快照生成新假说（不拍摄新快照）
 */
export function iceConjecture(state: ICEState): ICEState {
  const conjecture = generateConjecture(state.snapshots);
  return {
    ...state,
    currentConjecture: conjecture,
    lastActionType: 'conjecture',
  };
}

/**
 * ICE 执行步骤（ℰ）
 * 标记为执行态（实际执行由外部调度）
 */
export function iceExecute(state: ICEState): ICEState {
  return {
    ...state,
    lastActionType: 'execute',
  };
}
