/**
 * Liu 机制变分原理
 * 基于 TMK 理论，Liu 机制描述了金灵球之间的变分动力学
 * δS_Liu = 0 是系统的平衡条件
 */

import type { JinlingHeap, JinlingSphere } from '../types/tmk';
import { phaseEntropy } from './betaRewire';

/**
 * Liu 作用量
 * S_Liu = ∫ (T - V) dt
 * 简化为离散形式：S_Liu = Σ_i (T_i - V_i)
 * 其中 T 是动能（相位变化率），V 是势能（拓扑约束）
 */
export function liuAction(heap: JinlingHeap): number {
  const spheres = Array.from(heap.V.values());
  if (spheres.length === 0) return 0;

  // 动能 T：相位变化的总动能（由 mod 权重）
  let kineticEnergy = 0;
  for (const s of spheres) {
    // 动能与 mod 和相位变化率成正比
    kineticEnergy += 0.5 * s.mod * s.phase * s.phase;
  }

  // 势能 V：拓扑约束（边数 × 平均权重）
  let potentialEnergy = 0;
  for (const [u, v, w, chi] of heap.E_bin) {
    potentialEnergy += chi * w;
  }
  for (const f of heap.F_hyper) {
    potentialEnergy += f.w;
  }

  return kineticEnergy - potentialEnergy;
}

/**
 * Liu 变分 δS
 * 计算当前堆的变分导数近似值
 */
export function liuVariation(heap: JinlingHeap, epsilon: number = 0.01): number {
  // 对每个球的相位施加微扰，计算作用量变化
  const currentAction = liuAction(heap);
  let totalVariation = 0;

  const spheres = Array.from(heap.V.values());
  for (const sphere of spheres) {
    // 正向微扰
    const perturbedSphere: JinlingSphere = {
      ...sphere,
      phase: sphere.phase + epsilon,
    };
    const perturbedHeap: JinlingHeap = {
      ...heap,
      V: new Map(heap.V).set(sphere.sid, perturbedSphere),
    };
    const perturbedAction = liuAction(perturbedHeap);
    const derivative = (perturbedAction - currentAction) / epsilon;
    totalVariation += derivative * derivative;
  }

  return Math.sqrt(totalVariation);
}

/**
 * Liu 机制平衡判定
 * 当 δS_Liu ≈ 0 时系统处于平衡态
 */
export function isLiuEquilibrium(heap: JinlingHeap, threshold: number = 0.1): boolean {
  const variation = liuVariation(heap);
  return variation < threshold;
}

/**
 * 计算 Liu 自由能
 * F_Liu = S_rel - T·S_entropy
 * 其中 T 是"温度"参数，S_entropy 是信息熵
 */
export function liuFreeEnergy(heap: JinlingHeap, temperature: number = 1.0): number {
  const H = phaseEntropy(heap);
  const M = heap.E_bin.length + heap.F_hyper.length;
  // 简化的自由能
  return M - temperature * H;
}

/**
 * Liu 机制演化方向
 * 返回系统的演化方向描述
 */
export function liuEvolutionDirection(heap: JinlingHeap): {
  direction: 'minimizing' | 'expanding' | 'equilibrium';
  description: string;
} {
  const variation = liuVariation(heap);
  const H = phaseEntropy(heap);
  const M = heap.E_bin.length + heap.F_hyper.length;

  if (variation < 0.1) {
    return {
      direction: 'equilibrium',
      description: `系统接近平衡态 (δS=${variation.toFixed(4)}), 边数=${M}, 熵=${H.toFixed(4)}`,
    };
  } else if (H > Math.log2(Math.max(heap.V.size, 2))) {
    return {
      direction: 'expanding',
      description: `系统正在扩张 (熵=${H.toFixed(4)}), 相位空间利用率高`,
    };
  } else {
    return {
      direction: 'minimizing',
      description: `系统正在极小化 S_rel (边数=${M}, 熵=${H.toFixed(4)})`,
    };
  }
}
