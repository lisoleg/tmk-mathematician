/**
 * idoInfoForce.ts — IDO 信息力引擎
 * 基于太一万有理论《白皮书》信息散逸与时间箭头
 *
 * I(heap) = 信息量 = -Σ_i p_i·log(p_i)  // 基于节点连接概率
 * F_info(i) = 该节点的信息力梯度
 * 时间箭头：β-步单向性由 IDO 信息散逸保证
 */

import type { JinlingHeap, JinlingSphere } from '../types/tmk';

/**
 * 计算金陵堆的信息量（Shannon 熵）
 *
 * I(heap) = -Σ_i p_i·log₂(p_i)
 * p_i = degree(i) / total_degree（归一化连接概率）
 *
 * @param heap 金陵堆
 * @returns 信息量（bits）
 */
export function computeInfoAmount(heap: JinlingHeap): number {
  const nodeCount = heap.V.size;
  if (nodeCount === 0) return 0;

  // 计算每个节点的度数
  const degrees = new Map<string, number>();
  for (const sid of heap.V.keys()) {
    degrees.set(sid, 0);
  }

  let totalDegree = 0;
  for (const [u, v, _w, _chi] of heap.E_bin) {
    degrees.set(u, (degrees.get(u) || 0) + 1);
    degrees.set(v, (degrees.get(v) || 0) + 1);
    totalDegree += 2;
  }

  if (totalDegree === 0) return 0;

  // Shannon 熵
  let entropy = 0;
  for (const degree of degrees.values()) {
    if (degree > 0) {
      const p = degree / totalDegree;
      entropy -= p * Math.log2(p);
    }
  }

  return entropy;
}

/**
 * 计算指定节点的信息力梯度
 *
 * F_info(i) = ∂I/∂p_i ≈ log₂(p_i) + 1/ln(2)（微分近似）
 * 实际上：F_info(i) = -log₂(p_i) - 1/ln(2)（信息力 = 负熵梯度）
 * 归一化到 [0, 1] 区间
 *
 * @param heap 金陵堆
 * @param sid 节点 ID
 * @returns 信息力值（归一化）
 */
export function computeInfoForce(heap: JinlingHeap, sid: string): number {
  // 计算该节点的度数
  let degree = 0;
  let totalDegree = 0;

  for (const [u, v, _w, _chi] of heap.E_bin) {
    if (u === sid || v === sid) degree++;
    totalDegree += 2;
  }

  if (totalDegree === 0 || degree === 0) return 0;

  const p = degree / totalDegree;
  // 信息力 = -log₂(p)（高度连接的节点 p 大，但 -log(p) 小；
  // 低连接节点 p 小，-log(p) 大，即更"珍贵"的信息量）
  const infoForce = -Math.log2(p);

  // 归一化：最大可能信息力 = log₂(N)，其中 N = 节点数
  const maxInfoForce = Math.log2(heap.V.size) || 1;
  return Math.min(infoForce / maxInfoForce, 1.0);
}

/**
 * IDO 更新：基于信息力梯度调整节点 mod
 *
 * 信息力高的节点 → 增强其 mod（信息聚焦）
 * 信息力低的节点 → 轻微衰减（信息散逸）
 *
 * @param heap 金陵堆
 * @param dt 时间步长（默认 0.01）
 * @returns 更新后的金陵堆
 */
export function idoUpdate(heap: JinlingHeap, dt: number = 0.01): JinlingHeap {
  const totalInfo = computeInfoAmount(heap);
  if (totalInfo === 0) return heap;

  const newV = new Map<string, JinlingSphere>();

  for (const [sid, sphere] of heap.V) {
    const force = computeInfoForce(heap, sid);
    // 信息力驱动的 mod 微调
    // 力越大 → mod 增长（信息聚焦）；力越小 → mod 轻微衰减（散逸）
    const modDelta = (force - 0.5) * dt;
    const newMod = Math.max(0.01, sphere.mod + modDelta);

    newV.set(sid, {
      ...sphere,
      mod: newMod,
    });
  }

  return {
    V: newV,
    E_bin: [...heap.E_bin],
    F_hyper: [...heap.F_hyper],
  };
}

/**
 * 根据信息量历史判定时间箭头方向
 *
 * @param history 信息量时间序列 [I(t₀), I(t₁), ...]
 * @returns 'forward'（熵增/散逸）、'backward'（熵减/聚焦）、'static'（持平）
 */
export function getTimeArrow(history: number[]): 'forward' | 'backward' | 'static' {
  if (history.length < 2) return 'static';

  // 计算信息量的线性趋势
  const n = history.length;
  let sumX = 0;
  let sumY = 0;
  let sumXY = 0;
  let sumX2 = 0;

  for (let i = 0; i < n; i++) {
    sumX += i;
    sumY += history[i];
    sumXY += i * history[i];
    sumX2 += i * i;
  }

  const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);

  // 阈值判断
  const threshold = 0.001;
  if (slope > threshold) return 'forward';   // 信息量增长 → 熵增散逸
  if (slope < -threshold) return 'backward';  // 信息量减少 → 熵减聚焦
  return 'static';
}
