/**
 * β-rewire 算法 — TMK 核心演化算法
 * 通过增删边和超边饱和来最小化 S_rel
 * S_rel = α·M + β·H
 * 其中 M = 边数，H = 相位 Shannon 熵
 */

import type {
  JinlingHeap,
  JinlingSphere,
  RewireCandidate,
  BetaRewireParams,
  RewireStepResult,
  DiscoveryEntry,
} from '../types/tmk';
import { addSphere, addBinaryEdge, removeBinaryEdge, getUnconnectedPairs, cloneHeap, edgeCount } from './JinlingHeap';
import { createSphere } from './JinlingSphere';
import { isPortCompatible } from './portCompatibility';
import { generateSid } from '../utils/hash';

/**
 * 计算相位 Shannon 熵
 * H = -Σ p_i · log2(p_i)
 * @param heap 金陵堆
 * @returns 相位熵值
 */
export function phaseEntropy(heap: JinlingHeap): number {
  const spheres = Array.from(heap.V.values());
  if (spheres.length === 0) return 0;

  // 将相位空间划分为 16 个箱
  const BINS = 16;
  const binCounts = new Array(BINS).fill(0);

  for (const s of spheres) {
    const normalizedPhase = ((s.phase % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);
    const bin = Math.floor((normalizedPhase / (2 * Math.PI)) * BINS) % BINS;
    binCounts[bin]++;
  }

  // 计算 Shannon 熵
  let entropy = 0;
  const total = spheres.length;
  for (const count of binCounts) {
    if (count > 0) {
      const p = count / total;
      entropy -= p * Math.log2(p);
    }
  }

  return entropy;
}

/**
 * 计算 S_rel 相关自由能
 * S_rel = α·M + β·H
 * @param heap 金陵堆
 * @param alpha 边数权重
 * @beta 相位熵权重
 * @returns S_rel 值
 */
export function computeSRel(heap: JinlingHeap, alpha: number, beta: number): number {
  const M = edgeCount(heap);
  const H = phaseEntropy(heap);
  return alpha * M + beta * H;
}

/**
 * 计算 S_rel 的分量
 * @param heap 金陵堆
 * @param alpha 边数权重
 * @param beta 相位熵权重
 * @returns { sRel, sM, sH }
 */
export function computeSRelComponents(
  heap: JinlingHeap,
  alpha: number,
  beta: number
): { sRel: number; sM: number; sH: number } {
  const M = edgeCount(heap);
  const H = phaseEntropy(heap);
  return {
    sRel: alpha * M + beta * H,
    sM: alpha * M,
    sH: beta * H,
  };
}

/**
 * 生成删边候选
 * 遍历每条二元边，计算删除后的 S_rel
 */
function generateDelEdgeCandidates(
  heap: JinlingHeap,
  alpha: number,
  beta: number
): RewireCandidate[] {
  const candidates: RewireCandidate[] = [];
  const currentSRel = computeSRel(heap, alpha, beta);

  for (let i = 0; i < heap.E_bin.length; i++) {
    const trialHeap = removeBinaryEdge(heap, i);
    const trialSRel = computeSRel(trialHeap, alpha, beta);
    candidates.push({
      type: 'del_edge',
      edge: heap.E_bin[i],
      delIndex: i,
      sRel: trialSRel,
    });
  }

  return candidates;
}

/**
 * 生成加边候选
 * 随机采样未连接且端口兼容的球对，计算添加后的 S_rel
 */
function generateAddEdgeCandidates(
  heap: JinlingHeap,
  alpha: number,
  beta: number,
  sampleCount: number = 10
): RewireCandidate[] {
  const candidates: RewireCandidate[] = [];
  const pairs = getUnconnectedPairs(heap);

  // 过滤端口兼容的对
  const compatiblePairs = pairs.filter(([u, v]) => {
    const su = heap.V.get(u);
    const sv = heap.V.get(v);
    if (!su || !sv) return false;
    return isPortCompatible(su, sv);
  });

  // 随机采样
  const sampled = compatiblePairs
    .sort(() => Math.random() - 0.5)
    .slice(0, sampleCount);

  for (const [u, v] of sampled) {
    const su = heap.V.get(u)!;
    const sv = heap.V.get(v)!;
    const trialHeap = addBinaryEdge(heap, u, v, 1.0, su.chi * sv.chi);
    const trialSRel = computeSRel(trialHeap, alpha, beta);
    candidates.push({
      type: 'add_edge',
      edge: [u, v, 1.0, su.chi * sv.chi],
      sRel: trialSRel,
    });
  }

  return candidates;
}

/**
 * 生成 β-elaboration 候选
 * PHG 超边饱和 → 新球诞生
 */
function generateElaborationCandidates(
  heap: JinlingHeap,
  alpha: number,
  beta: number
): RewireCandidate[] {
  const candidates: RewireCandidate[] = [];

  // 对每条超边，如果所有源球都存在，可以生成新球
  for (const hyper of heap.F_hyper) {
    const allSourcesExist = hyper.src.every(s => heap.V.has(s));
    if (!allSourcesExist) continue;

    // 计算新球的属性
    const srcSpheres = hyper.src.map(s => heap.V.get(s)!);
    const avgMod = srcSpheres.reduce((sum, s) => sum + s.mod, 0) / srcSpheres.length;
    const sumPhase = srcSpheres.reduce((sum, s) => sum + s.phase, 0);
    const newPhase = ((sumPhase % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);
    const dominantChi = srcSpheres.filter(s => s.chi === 1).length >= srcSpheres.length / 2 ? 1 : -1;

    const newSphere = createSphere({
      chi: dominantChi,
      mod: Math.round(avgMod * 1.1),
      phase: newPhase,
    });

    const trialHeap = addSphere(cloneHeap(heap), newSphere);
    // 新球连接到每个源球
    let trialHeap2 = trialHeap;
    for (const srcSid of hyper.src) {
      trialHeap2 = addBinaryEdge(trialHeap2, srcSid, newSphere.sid, 1.0, dominantChi);
    }
    const trialSRel = computeSRel(trialHeap2, alpha, beta);

    candidates.push({
      type: 'elaboration',
      newSphere,
      newHyperedge: {
        src: hyper.src,
        tgt: newSphere.sid,
        kind: hyper.kind,
        gradeSrc: hyper.gradeSrc,
        gradeTgt: hyper.gradeTgt,
        w: hyper.w,
      },
      sRel: trialSRel,
    });
  }

  // 额外：随机 elaboration — 从高度数节点组合生成新球
  const spheres = Array.from(heap.V.values());
  if (spheres.length >= 2) {
    const shuffled = [...spheres].sort(() => Math.random() - 0.5);
    const sources = shuffled.slice(0, Math.min(3, shuffled.length));
    const avgMod = sources.reduce((sum, s) => sum + s.mod, 0) / sources.length;
    const sumPhase = sources.reduce((sum, s) => sum + s.phase, 0);
    const newPhase = ((sumPhase % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);

    const newSphere = createSphere({
      chi: sources[0].chi,
      mod: Math.round(avgMod * 1.05),
      phase: newPhase,
    });

    const trialHeap = addSphere(cloneHeap(heap), newSphere);
    let trialHeap2 = trialHeap;
    for (const src of sources) {
      trialHeap2 = addBinaryEdge(trialHeap2, src.sid, newSphere.sid, 1.0, src.chi);
    }
    const trialSRel = computeSRel(trialHeap2, alpha, beta);

    candidates.push({
      type: 'elaboration',
      newSphere,
      sRel: trialSRel,
    });
  }

  return candidates;
}

/**
 * β-rewire 单步执行
 * 1. 生成所有候选操作
 * 2. 选择 S_rel 最小的候选
 * 3. 应用到金陵堆
 * @param heap 当前金陵堆
 * @param params β-rewire 参数
 * @param step 步骤序号
 * @returns 步骤结果和更新后的金陵堆
 */
export function betaRewireStep(
  heap: JinlingHeap,
  params: BetaRewireParams,
  step: number
): { result: RewireStepResult; newHeap: JinlingHeap } {
  const { alpha, beta } = params;

  // 生成候选
  const delCandidates = generateDelEdgeCandidates(heap, alpha, beta);
  const addCandidates = generateAddEdgeCandidates(heap, alpha, beta);
  const elabCandidates = generateElaborationCandidates(heap, alpha, beta);

  const allCandidates = [...delCandidates, ...addCandidates, ...elabCandidates];

  // 如果没有候选，返回空结果
  if (allCandidates.length === 0) {
    const components = computeSRelComponents(heap, alpha, beta);
    return {
      result: {
        step,
        candidate: { type: 'del_edge', sRel: components.sRel },
        sRel: components.sRel,
        sM: components.sM,
        sH: components.sH,
        discovery: '无可用候选操作',
      },
      newHeap: heap,
    };
  }

  // 选择 S_rel 最小的候选
  const bestCandidate = allCandidates.reduce((best, c) =>
    c.sRel < best.sRel ? c : best
  );

  // 应用候选操作
  let newHeap = cloneHeap(heap);
  let discovery = '';

  switch (bestCandidate.type) {
    case 'del_edge': {
      if (bestCandidate.delIndex !== undefined) {
        const edge = heap.E_bin[bestCandidate.delIndex];
        newHeap = removeBinaryEdge(newHeap, bestCandidate.delIndex);
        discovery = `删边: ${edge[0]} → ${edge[1]} (χ=${edge[3]})`;
      }
      break;
    }
    case 'add_edge': {
      if (bestCandidate.edge) {
        const [u, v, w, chi] = bestCandidate.edge;
        newHeap = addBinaryEdge(newHeap, u, v, w, chi);
        discovery = `加边: ${u} → ${v} (w=${w.toFixed(2)}, χ=${chi})`;
      }
      break;
    }
    case 'elaboration': {
      if (bestCandidate.newSphere) {
        newHeap = addSphere(newHeap, bestCandidate.newSphere);
        // 新球连接到源球
        const srcSids = bestCandidate.newHyperedge?.src || [];
        for (const srcSid of srcSids) {
          newHeap = addBinaryEdge(newHeap, srcSid, bestCandidate.newSphere.sid, 1.0, bestCandidate.newSphere.chi);
        }
        discovery = `新球诞生: ${bestCandidate.newSphere.sid} (χ=${bestCandidate.newSphere.chi}, m=${bestCandidate.newSphere.mod})`;
      }
      break;
    }
  }

  const components = computeSRelComponents(newHeap, alpha, beta);

  return {
    result: {
      step,
      candidate: bestCandidate,
      sRel: components.sRel,
      sM: components.sM,
      sH: components.sH,
      discovery,
    },
    newHeap,
  };
}

/**
 * β-rewire 多步执行
 * @param heap 初始金陵堆
 * @param params β-rewire 参数
 * @returns 步骤结果列表和最终金陵堆
 */
export function betaRewire(
  heap: JinlingHeap,
  params: BetaRewireParams
): { steps: RewireStepResult[]; finalHeap: JinlingHeap; discoveries: DiscoveryEntry[] } {
  const steps: RewireStepResult[] = [];
  const discoveries: DiscoveryEntry[] = [];
  let currentHeap = cloneHeap(heap);

  for (let i = 0; i < params.steps; i++) {
    const { result, newHeap } = betaRewireStep(currentHeap, params, i + 1);
    steps.push(result);

    // 记录发现
    if (result.discovery && result.discovery !== '无可用候选操作') {
      let discoveryType: DiscoveryEntry['type'] = 'new_edge';
      if (result.candidate.type === 'del_edge') discoveryType = 'del_edge';
      else if (result.candidate.type === 'elaboration') discoveryType = 'new_sphere';
      else if (result.candidate.type === 'add_edge') discoveryType = 'new_edge';

      discoveries.push({
        timestamp: Date.now(),
        type: discoveryType,
        description: result.discovery,
        spheres: result.candidate.edge
          ? [result.candidate.edge[0], result.candidate.edge[1]]
          : result.candidate.newSphere
            ? [result.candidate.newSphere.sid]
            : [],
      });
    }

    currentHeap = newHeap;
  }

  return { steps, finalHeap: currentHeap, discoveries };
}
