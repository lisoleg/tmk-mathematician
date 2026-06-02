/**
 * useHeap — 金陵堆全局状态管理 Hook
 * 管理金灵球、边、超边、β-rewire 运行状态等
 */

import { useState, useCallback, useRef } from 'react';
import type {
  JinlingHeap,
  JinlingSphere,
  Hyperedge,
  BetaRewireParams,
  RewireStepResult,
  DiscoveryEntry,
  Layer,
  MNQ8Result,
  ICEState,
} from '../types/tmk';
import {
  createEmptyHeap,
  addSphere as heapAddSphere,
  removeSphere as heapRemoveSphere,
  addBinaryEdge as heapAddBinaryEdge,
  removeBinaryEdge as heapRemoveBinaryEdge,
  addHyperedge as heapAddHyperedge,
  cloneHeap,
  createDemoHeap,
} from '../core/JinlingHeap';
import { betaRewire, betaRewireStep, computeSRelComponents, computeSRel } from '../core/betaRewire';
import { mnq8Step, createHexRingGapDemo } from '../core/mnq8';
import { iceIntrospect, createICEState } from '../core/iceEngine';

export interface HeapState {
  /** 金陵堆数据 */
  heap: JinlingHeap;
  /** 当前选中的球体 ID */
  selectedSid: string | null;
  /** β-rewire 参数 */
  rewireParams: BetaRewireParams;
  /** β-rewire 步骤结果 */
  rewireHistory: RewireStepResult[];
  /** S_rel 演化曲线数据 */
  sRelCurve: Array<{ step: number; sRel: number; sM: number; sH: number }>;
  /** 发现日志 */
  discoveries: DiscoveryEntry[];
  /** 当前层级 */
  layer: Layer;
  /** 是否正在运行 β-rewire */
  isRewiring: boolean;
  /** 自动运行定时器 ID */
  autoRunTimer: ReturnType<typeof setInterval> | null;
}

export function useHeap() {
  const [heap, setHeap] = useState<JinlingHeap>(() => createDemoHeap());
  const [selectedSid, setSelectedSid] = useState<string | null>(null);
  const [rewireParams, setRewireParams] = useState<BetaRewireParams>({
    alpha: 1.0,
    beta: 1.0,
    steps: 10,
  });
  const [rewireHistory, setRewireHistory] = useState<RewireStepResult[]>([]);
  const [sRelCurve, setSRelCurve] = useState<Array<{ step: number; sRel: number; sM: number; sH: number }>>([]);
  const [discoveries, setDiscoveries] = useState<DiscoveryEntry[]>([]);
  const [layer, setLayer] = useState<Layer>('L1');
  const [isRewiring, setIsRewiring] = useState(false);
  const autoRunRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // MNQ8 状态
  const [mnq8Results, setMnq8Results] = useState<Map<string, MNQ8Result>>(new Map());

  // ICE 状态
  const [iceState, setIceState] = useState<ICEState>(() => createICEState());

  /** 添加金灵球 */
  const addSphere = useCallback((sphere: JinlingSphere) => {
    setHeap(prev => heapAddSphere(prev, sphere));
  }, []);

  /** 移除金灵球 */
  const removeSphere = useCallback((sid: string) => {
    setHeap(prev => heapRemoveSphere(prev, sid));
    setSelectedSid(prev => prev === sid ? null : prev);
  }, []);

  /** 更新金灵球 */
  const updateSphere = useCallback((sid: string, updater: (s: JinlingSphere) => JinlingSphere) => {
    setHeap(prev => {
      const sphere = prev.V.get(sid);
      if (!sphere) return prev;
      const newV = new Map(prev.V);
      newV.set(sid, updater(sphere));
      return { ...prev, V: newV };
    });
  }, []);

  /** 添加二元边 */
  const addEdge = useCallback((u: string, v: string, w: number, chi: number) => {
    setHeap(prev => heapAddBinaryEdge(prev, u, v, w, chi));
  }, []);

  /** 移除二元边 */
  const removeEdge = useCallback((index: number) => {
    setHeap(prev => heapRemoveBinaryEdge(prev, index));
  }, []);

  /** 添加超边 */
  const addHyperedgeFn = useCallback((hyperedge: Hyperedge) => {
    setHeap(prev => heapAddHyperedge(prev, hyperedge));
  }, []);

  /** 执行单步 β-rewire */
  const runRewireStep = useCallback(() => {
    setHeap(prev => {
      const { result, newHeap } = betaRewireStep(prev, rewireParams, rewireHistory.length + 1);
      setRewireHistory(h => [...h, result]);
      setSRelCurve(c => [...c, {
        step: result.step,
        sRel: result.sRel,
        sM: result.sM,
        sH: result.sH,
      }]);
      if (result.discovery && result.discovery !== '无可用候选操作') {
        let discoveryType: DiscoveryEntry['type'] = 'new_edge';
        if (result.candidate.type === 'del_edge') discoveryType = 'del_edge';
        else if (result.candidate.type === 'elaboration') discoveryType = 'new_sphere';
        else if (result.candidate.type === 'add_edge') discoveryType = 'new_edge';

        setDiscoveries(d => [...d, {
          timestamp: Date.now(),
          type: discoveryType,
          description: result.discovery,
          spheres: result.candidate.edge
            ? [result.candidate.edge[0], result.candidate.edge[1]]
            : result.candidate.newSphere
              ? [result.candidate.newSphere.sid]
              : [],
        }]);
      }
      return newHeap;
    });
  }, [rewireParams, rewireHistory.length]);

  /** 执行多步 β-rewire */
  const runRewire = useCallback(() => {
    setIsRewiring(true);
    setHeap(prev => {
      const { steps, finalHeap, discoveries: newDiscoveries } = betaRewire(prev, rewireParams);
      setRewireHistory(h => [...h, ...steps]);
      setSRelCurve(c => [
        ...c,
        ...steps.map(s => ({ step: s.step, sRel: s.sRel, sM: s.sM, sH: s.sH })),
      ]);
      setDiscoveries(d => [...d, ...newDiscoveries]);
      setIsRewiring(false);
      return finalHeap;
    });
  }, [rewireParams]);

  /** 开始自动运行 β-rewire */
  const startAutoRewire = useCallback(() => {
    if (autoRunRef.current) return;
    setIsRewiring(true);
    autoRunRef.current = setInterval(() => {
      runRewireStep();
    }, 500);
  }, [runRewireStep]);

  /** 停止自动运行 */
  const stopAutoRewire = useCallback(() => {
    if (autoRunRef.current) {
      clearInterval(autoRunRef.current);
      autoRunRef.current = null;
    }
    setIsRewiring(false);
  }, []);

  /** 清空重置 */
  const resetHeap = useCallback(() => {
    stopAutoRewire();
    setHeap(createEmptyHeap());
    setSelectedSid(null);
    setRewireHistory([]);
    setSRelCurve([]);
    setDiscoveries([]);
  }, [stopAutoRewire]);

  /** 加载演示数据 */
  const loadDemo = useCallback(() => {
    stopAutoRewire();
    setHeap(createDemoHeap());
    setSelectedSid(null);
    setRewireHistory([]);
    setSRelCurve([]);
    setDiscoveries([]);
  }, [stopAutoRewire]);

  /** 计算当前 S_rel */
  const currentSRel = computeSRelComponents(heap, rewireParams.alpha, rewireParams.beta);

  // ==================== MNQ8 操作 ====================

  /** 运行 MNQ8 单步 */
  const runMNQ8Step = useCallback(() => {
    setHeap(prev => {
      const { updatedHeap, results } = mnq8Step(prev);
      setMnq8Results(results);
      return updatedHeap;
    });
  }, []);

  /** 运行 MNQ8 全量（n 步） */
  const runMNQ8Full = useCallback((n: number = 5) => {
    setHeap(prev => {
      let current = prev;
      let lastResults = new Map<string, MNQ8Result>();
      for (let i = 0; i < n; i++) {
        const { updatedHeap, results } = mnq8Step(current);
        current = updatedHeap;
        lastResults = results;
      }
      setMnq8Results(lastResults);
      return current;
    });
  }, []);

  /** 载入 HEX_RING_GAP 演示 */
  const loadHexRingGap = useCallback(() => {
    stopAutoRewire();
    const demoHeap = createHexRingGapDemo();
    setHeap(demoHeap);
    setSelectedSid(null);
    setRewireHistory([]);
    setSRelCurve([]);
    setDiscoveries([]);
    // 自动运行一步 MNQ8 以获得初始结果
    const { updatedHeap, results } = mnq8Step(demoHeap);
    setHeap(updatedHeap);
    setMnq8Results(results);
  }, [stopAutoRewire]);

  // ==================== ICE 操作 ====================

  /** ICE tick（内省一步） */
  const tickICE = useCallback(() => {
    setIceState(prev => {
      if (!prev.isActive) return prev;
      return iceIntrospect(prev, heap, currentSRel.sRel);
    });
  }, [heap, currentSRel.sRel]);

  /** 切换 ICE 激活状态 */
  const toggleICE = useCallback(() => {
    setIceState(prev => ({
      ...prev,
      isActive: !prev.isActive,
      lastActionType: prev.isActive ? 'idle' : 'introspect',
    }));
  }, []);

  /** 清空 ICE 状态 */
  const clearICE = useCallback(() => {
    setIceState(createICEState());
  }, []);

  return {
    heap,
    selectedSid,
    setSelectedSid,
    rewireParams,
    setRewireParams,
    rewireHistory,
    sRelCurve,
    discoveries,
    layer,
    setLayer,
    isRewiring,
    addSphere,
    removeSphere,
    updateSphere,
    addEdge,
    removeEdge,
    addHyperedge: addHyperedgeFn,
    runRewireStep,
    runRewire,
    startAutoRewire,
    stopAutoRewire,
    resetHeap,
    loadDemo,
    currentSRel,
    // MNQ8
    mnq8Results,
    runMNQ8Step,
    runMNQ8Full,
    loadHexRingGap,
    // ICE
    iceState,
    tickICE,
    toggleICE,
    clearICE,
  };
}
