/**
 * mnq8.ts — MNQ8 更新律 + HEX_RING_GAP / BACKGROUND_OSC
 * 基于太一万有理论《白皮书》核心数值引擎
 *
 * MNQ8 步骤：
 * 1. 将球转为 GoldenSymbol（a=mod·cos(phase), b=mod·sin(phase), c=0）
 * 2. 对每个邻居球，执行阴龙积积累：total_flux = total_flux ⊙ nbr_golden
 * 3. 计算 flux_norm_sq = |total_flux|²
 * 4. 若 flux_norm_sq > MASS_THRESHOLD：
 *    → HEX_RING_GAP 触发（囚禁，CONFINED）
 *    → excess_loop_hold = flux_norm_sq - MASS_THRESHOLD
 * 5. 否则：BACKGROUND_OSC（弥散，DISPERSED）
 *    → 能量稍微耗散 mod *= 0.95
 */

import type { JinlingSphere, JinlingHeap } from '../types/tmk';
import {
  sphereToGolden,
  yinLongProduct,
  goldenNormSq,
  goldenToSphereParams,
  goldenOne,
} from './goldenSymbol';
import type { GoldenSymbol } from './goldenSymbol';
import { createEmptyHeap, addSphere as heapAddSphere, addBinaryEdge as heapAddBinaryEdge } from './JinlingHeap';

/** 囚禁触发阈值（白皮书 v13 数值） */
export const MASS_THRESHOLD = 1.5;

/** 边界泄漏极限（白皮书 v13 数值） */
export const BOUNDARY_LEAK_LIMIT = 0.164;

/** 弥散耗散系数 */
const DISPERSE_DECAY = 0.95;

/** MNQ8 单球更新结果 */
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

/**
 * 获取指定球的邻居球列表（基于二元边）
 */
function getNeighbors(sphere: JinlingSphere, heap: JinlingHeap): JinlingSphere[] {
  const neighbors: JinlingSphere[] = [];
  for (const [u, v, _w, _chi] of heap.E_bin) {
    if (u === sphere.sid) {
      const nbr = heap.V.get(v);
      if (nbr) neighbors.push(nbr);
    } else if (v === sphere.sid) {
      const nbr = heap.V.get(u);
      if (nbr) neighbors.push(nbr);
    }
  }
  return neighbors;
}

/**
 * MNQ8 单球更新
 *
 * @param sphere 目标金灵球
 * @param neighbors 邻居金灵球列表
 * @param lambdaCoupling 阴龙积耦合调谐系数（默认 1.0）
 */
export function mnq8Update(
  sphere: JinlingSphere,
  neighbors: JinlingSphere[],
  lambdaCoupling: number = 1.0
): MNQ8Result {
  // Step 1: 转换为 GoldenSymbol
  const selfGolden = sphereToGolden(sphere);

  // Step 2: 对每个邻居执行阴龙积积累
  let totalFlux = goldenOne(); // 乘法单位元
  for (const nbr of neighbors) {
    const nbrGolden = sphereToGolden(nbr);
    totalFlux = yinLongProduct(totalFlux, nbrGolden, lambdaCoupling);
  }
  // 将自身也纳入（最终 totalFlux = self ⊙ totalFlux_neighbor）
  totalFlux = yinLongProduct(selfGolden, totalFlux, lambdaCoupling);

  // Step 3: 计算 flux_norm_sq
  const massFace = goldenNormSq(totalFlux);

  // Step 4/5: 判定状态
  let newMod = sphere.mod;
  let newPhase = sphere.phase;
  let status: 'CONFINED' | 'DISPERSED' = 'DISPERSED';
  let excessLoopHold = 0;
  let boundaryLeak = 0;

  if (massFace > MASS_THRESHOLD) {
    // HEX_RING_GAP 触发（囚禁态）
    status = 'CONFINED';
    excessLoopHold = massFace - MASS_THRESHOLD;
    // 边界泄漏 = excess_loop_hold / (MASS_THRESHOLD + excess_loop_hold) 的归一化
    boundaryLeak = BOUNDARY_LEAK_LIMIT * (excessLoopHold / (MASS_THRESHOLD + excessLoopHold));
    // 囚禁态：mod 不变，phase 由 totalFlux 决定
    const params = goldenToSphereParams(totalFlux);
    newMod = params.mod;
    newPhase = params.phase;
  } else {
    // BACKGROUND_OSC（弥散态）
    status = 'DISPERSED';
    // 能量耗散
    newMod = sphere.mod * DISPERSE_DECAY;
    boundaryLeak = (1 - massFace / MASS_THRESHOLD) * BOUNDARY_LEAK_LIMIT;
    // phase 微扰（弥散下轻微随机化）
    const params = goldenToSphereParams(totalFlux);
    newPhase = sphere.phase + (params.phase - sphere.phase) * 0.1;
  }

  return {
    sid: sphere.sid,
    newMod,
    newPhase,
    status,
    massFace,
    excessLoopHold,
    boundaryLeak,
    totalFlux,
  };
}

/**
 * MNQ8 全堆更新（一步）
 *
 * @param heap 当前金陵堆
 * @param lambdaCoupling 阴龙积耦合调谐系数
 */
export function mnq8Step(
  heap: JinlingHeap,
  lambdaCoupling: number = 1.0
): {
  updatedHeap: JinlingHeap;
  results: Map<string, MNQ8Result>;
  hexRingGap: boolean;
  backgroundOsc: boolean;
  confinedCount: number;
  dispersedCount: number;
} {
  const results = new Map<string, MNQ8Result>();
  const newV = new Map<string, JinlingSphere>();

  // 对每个球执行 MNQ8 更新
  for (const [sid, sphere] of heap.V) {
    const neighbors = getNeighbors(sphere, heap);
    const result = mnq8Update(sphere, neighbors, lambdaCoupling);
    results.set(sid, result);

    // 应用更新到球体
    newV.set(sid, {
      ...sphere,
      mod: result.newMod,
      phase: result.newPhase,
    });
  }

  const updatedHeap: JinlingHeap = {
    V: newV,
    E_bin: [...heap.E_bin],
    F_hyper: [...heap.F_hyper],
  };

  // 统计
  let confinedCount = 0;
  let dispersedCount = 0;
  for (const result of results.values()) {
    if (result.status === 'CONFINED') confinedCount++;
    else dispersedCount++;
  }

  return {
    updatedHeap,
    results,
    hexRingGap: confinedCount > 0,
    backgroundOsc: dispersedCount > 0,
    confinedCount,
    dispersedCount,
  };
}

/**
 * 创建 HEX_RING_GAP 演示（6球六边形 + 中心球）
 *
 * 6 个球排列为正六边形，1 个中心球与所有外圈球相连，
 * 构成经典的 HEX_RING_GAP 囚禁场景。
 */
export function createHexRingGapDemo(): JinlingHeap {
  let heap = createEmptyHeap();
  const R = 1.0; // 六边形半径
  const centerMod = 1.5;  // 大模值以确保中心球囚禁触发
  const ringMod = 1.2;    // 环球需要足够大的模以触发 HEX_RING_GAP
  const ringPhaseBase = 0.1; // 近零相位基线，让 cos(phase) 接近 1

  // 创建中心球
  const center: JinlingSphere = {
    sid: 'hex-center',
    i_int: 0,
    ports: 0xFF,
    chi: 1,
    mod: centerMod,
    phase: 0,
  };
  heap = heapAddSphere(heap, center);

  // 创建 6 个六边形球
  for (let k = 0; k < 6; k++) {
    const angle = (Math.PI / 3) * k;
    const sphere: JinlingSphere = {
      sid: `hex-ring-${k}`,
      i_int: k + 1,
      ports: 0xFF,
      chi: k % 2 === 0 ? 1 : -1,
      mod: ringMod,
      phase: ringPhaseBase + angle * 0.5,
    };
    heap = heapAddSphere(heap, sphere);
  }

  // 中心 → 每个外圈球 的边
  for (let k = 0; k < 6; k++) {
    heap = heapAddBinaryEdge(heap, 'hex-center', `hex-ring-${k}`, 1.0, 1);
  }

  // 外圈相邻球之间的边（正六边形边）
  for (let k = 0; k < 6; k++) {
    const next = (k + 1) % 6;
    heap = heapAddBinaryEdge(heap, `hex-ring-${k}`, `hex-ring-${next}`, 0.5, -1);
  }

  return heap;
}
