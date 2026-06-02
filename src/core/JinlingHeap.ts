/**
 * 金陵堆类 — TMK 拓扑结构管理
 */

import type { JinlingSphere, JinlingHeap, Hyperedge } from '../types/tmk';

/**
 * 创建一个空的金陵堆
 * @returns 空的金陵堆
 */
export function createEmptyHeap(): JinlingHeap {
  return {
    V: new Map(),
    E_bin: [],
    F_hyper: [],
  };
}

/**
 * 向金陵堆中添加金灵球
 * @param heap 金陵堆
 * @param sphere 金灵球
 * @returns 更新后的金陵堆
 */
export function addSphere(heap: JinlingHeap, sphere: JinlingSphere): JinlingHeap {
  const newV = new Map(heap.V);
  newV.set(sphere.sid, sphere);
  return { ...heap, V: newV };
}

/**
 * 从金陵堆中移除金灵球
 * @param heap 金陵堆
 * @param sid 球体 ID
 * @returns 更新后的金陵堆
 */
export function removeSphere(heap: JinlingHeap, sid: string): JinlingHeap {
  const newV = new Map(heap.V);
  newV.delete(sid);
  // 同时移除关联的边
  const newE = heap.E_bin.filter(([u, v]) => u !== sid && v !== sid);
  // 同时移除关联的超边
  const newF = heap.F_hyper.filter(
    f => !f.src.includes(sid) && f.tgt !== sid
  );
  return { V: newV, E_bin: newE, F_hyper: newF };
}

/**
 * 添加二元边
 * @param heap 金陵堆
 * @param u 源球 ID
 * @param v 目标球 ID
 * @param w 权重
 * @param chi 手性
 * @returns 更新后的金陵堆
 */
export function addBinaryEdge(
  heap: JinlingHeap,
  u: string,
  v: string,
  w: number,
  chi: number
): JinlingHeap {
  // 检查球是否存在
  if (!heap.V.has(u) || !heap.V.has(v)) {
    return heap;
  }
  // 检查是否已存在
  const exists = heap.E_bin.some(([eu, ev]) => eu === u && ev === v);
  if (exists) return heap;

  const newE = [...heap.E_bin, [u, v, w, chi] as [string, string, number, number]];
  return { ...heap, E_bin: newE };
}

/**
 * 移除二元边
 * @param heap 金陵堆
 * @param index 边索引
 * @returns 更新后的金陵堆
 */
export function removeBinaryEdge(heap: JinlingHeap, index: number): JinlingHeap {
  const newE = heap.E_bin.filter((_, i) => i !== index);
  return { ...heap, E_bin: newE };
}

/**
 * 添加超边
 * @param heap 金陵堆
 * @param hyperedge 超边
 * @returns 更新后的金陵堆
 */
export function addHyperedge(heap: JinlingHeap, hyperedge: Hyperedge): JinlingHeap {
  const newF = [...heap.F_hyper, hyperedge];
  return { ...heap, F_hyper: newF };
}

/**
 * 获取球体的邻居（通过二元边连接）
 * @param heap 金陵堆
 * @param sid 球体 ID
 * @returns 邻居球体 ID 列表
 */
export function getNeighbors(heap: JinlingHeap, sid: string): string[] {
  const neighbors: string[] = [];
  for (const [u, v] of heap.E_bin) {
    if (u === sid && !neighbors.includes(v)) neighbors.push(v);
    if (v === sid && !neighbors.includes(u)) neighbors.push(u);
  }
  return neighbors;
}

/**
 * 获取球体的度数
 * @param heap 金陵堆
 * @param sid 球体 ID
 * @returns 度数
 */
export function getDegree(heap: JinlingHeap, sid: string): number {
  let degree = 0;
  for (const [u, v] of heap.E_bin) {
    if (u === sid) degree++;
    if (v === sid) degree++;
  }
  return degree;
}

/**
 * 计算金陵堆的边数
 * @param heap 金陵堆
 * @returns 二元边 + 超边总数
 */
export function edgeCount(heap: JinlingHeap): number {
  return heap.E_bin.length + heap.F_hyper.length;
}

/**
 * 深拷贝金陵堆
 * @param heap 金陵堆
 * @returns 拷贝
 */
export function cloneHeap(heap: JinlingHeap): JinlingHeap {
  return {
    V: new Map(heap.V),
    E_bin: [...heap.E_bin],
    F_hyper: [...heap.F_hyper],
  };
}

/**
 * 获取未连接的球对
 * @param heap 金陵堆
 * @returns 未连接的球对列表 [u, v]
 */
export function getUnconnectedPairs(heap: JinlingHeap): Array<[string, string]> {
  const sids = Array.from(heap.V.keys());
  const connected = new Set<string>();
  for (const [u, v] of heap.E_bin) {
    connected.add(`${u}->${v}`);
    connected.add(`${v}->${u}`);
  }

  const pairs: Array<[string, string]> = [];
  for (let i = 0; i < sids.length; i++) {
    for (let j = i + 1; j < sids.length; j++) {
      const key1 = `${sids[i]}->${sids[j]}`;
      if (!connected.has(key1)) {
        pairs.push([sids[i], sids[j]]);
      }
    }
  }
  return pairs;
}

/**
 * 生成示例金陵堆（用于演示）
 * @returns 包含几个示例球体和边的金陵堆
 */
export function createDemoHeap(): JinlingHeap {
  let heap = createEmptyHeap();

  // 创建5个示例球体
  const s1 = { sid: 'S-alpha', i_int: 100001, ports: 0b1100110011, chi: 1, mod: 7, phase: 0 };
  const s2 = { sid: 'S-beta', i_int: 100002, ports: 0b1100110011, chi: 1, mod: 13, phase: Math.PI / 3 };
  const s3 = { sid: 'S-gamma', i_int: 100003, ports: 0b1111000011, chi: -1, mod: 5, phase: Math.PI / 2 };
  const s4 = { sid: 'S-delta', i_int: 100004, ports: 0b1111000011, chi: -1, mod: 11, phase: Math.PI };
  const s5 = { sid: 'S-epsilon', i_int: 100005, ports: 0b1111111111, chi: 1, mod: 17, phase: Math.PI * 1.5 };

  heap = addSphere(heap, s1);
  heap = addSphere(heap, s2);
  heap = addSphere(heap, s3);
  heap = addSphere(heap, s4);
  heap = addSphere(heap, s5);

  // 添加示例边
  heap = addBinaryEdge(heap, 'S-alpha', 'S-beta', 1.0, 1);
  heap = addBinaryEdge(heap, 'S-beta', 'S-gamma', 0.8, -1);
  heap = addBinaryEdge(heap, 'S-gamma', 'S-delta', 1.2, -1);
  heap = addBinaryEdge(heap, 'S-delta', 'S-alpha', 0.6, 1);
  heap = addBinaryEdge(heap, 'S-epsilon', 'S-alpha', 0.9, 1);
  heap = addBinaryEdge(heap, 'S-epsilon', 'S-beta', 1.1, 1);

  // 添加示例超边
  heap = addHyperedge(heap, {
    src: ['S-alpha', 'S-beta', 'S-epsilon'],
    tgt: 'S-gamma',
    kind: 'wedge',
    gradeSrc: [1, 1, 2],
    gradeTgt: 2,
    w: 1.5,
  });

  return heap;
}
