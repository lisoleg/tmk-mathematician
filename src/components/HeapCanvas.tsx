/**
 * HeapCanvas — D3.js 力导向图画布
 * 展示金陵堆的完整拓扑，支持拖拽、缩放、点击选中
 */

import React, { useRef, useEffect, useCallback } from 'react';
import * as d3 from 'd3';
import type { JinlingHeap, SimNode, SimLink } from '../types/tmk';
import { PORT, PORT_ANGLES, PORT_DIRECTION, PORT_CHIRALITY } from '../types/tmk';

interface HeapCanvasProps {
  heap: JinlingHeap;
  selectedSid: string | null;
  onSelectSphere: (sid: string | null) => void;
  newlyBornSpheres: Set<string>;
}

const NODE_RADIUS = 24;
const PORT_RADIUS = 4;
const PORT_DISTANCE = 28;

const HeapCanvas: React.FC<HeapCanvasProps> = ({ heap, selectedSid, onSelectSphere, newlyBornSpheres }) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const simulationRef = useRef<d3.Simulation<SimNode, SimLink> | null>(null);

  const drawHeap = useCallback(() => {
    if (!svgRef.current || !containerRef.current) return;

    const width = containerRef.current.clientWidth;
    const height = containerRef.current.clientHeight;
    if (width === 0 || height === 0) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    svg.attr('width', width).attr('height', height);

    // 准备节点和边数据
    const sphereEntries = Array.from(heap.V.entries());
    const nodes: SimNode[] = sphereEntries.map(([sid, sphere]) => ({
      sid,
      chi: sphere.chi,
      phase: sphere.phase,
      mod: sphere.mod,
      ports: sphere.ports,
      radius: NODE_RADIUS,
    }));

    const nodeMap = new Map(nodes.map((n, i) => [n.sid, i]));
    const links: SimLink[] = heap.E_bin.map(([u, v, w, chi], i) => {
      const sourceIdx = nodeMap.get(u);
      const targetIdx = nodeMap.get(v);
      if (sourceIdx === undefined || targetIdx === undefined) return null as unknown as SimLink;
      return { source: sourceIdx, target: targetIdx, weight: w, chi, index: i };
    }).filter(Boolean);

    // 创建力仿真
    const simulation = d3.forceSimulation<SimNode>(nodes)
      .force('link', d3.forceLink<SimNode, SimLink>(links)
        .id((_d, i) => nodes[i]?.sid || '')
        .distance(120))
      .force('charge', d3.forceManyBody().strength(-300))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collision', d3.forceCollide<SimNode>().radius(d => d.radius + 10));

    simulationRef.current = simulation;

    // 创建可缩放容器
    const g = svg.append('g');

    // 缩放行为
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.2, 5])
      .on('zoom', (event) => {
        g.attr('transform', event.transform);
      });
    svg.call(zoom);

    // 定义箭头标记
    svg.append('defs').append('marker')
      .attr('id', 'arrowhead')
      .attr('viewBox', '0 -5 10 10')
      .attr('refX', 30)
      .attr('refY', 0)
      .attr('markerWidth', 8)
      .attr('markerHeight', 8)
      .attr('orient', 'auto')
      .append('path')
      .attr('d', 'M0,-5L10,0L0,5')
      .attr('fill', '#666');

    // 绘制超边区域
    for (const hyper of heap.F_hyper) {
      const hyperNodes = hyper.src
        .map(sid => nodes.find(n => n.sid === sid))
        .filter(Boolean) as SimNode[];
      if (hyperNodes.length < 2) continue;

      const targetNode = nodes.find(n => n.sid === hyper.tgt);
      if (targetNode) hyperNodes.push(targetNode);

      g.append('polygon')
        .attr('class', 'hyperedge-area')
        .attr('fill', hyper.kind === 'wedge' ? '#7c4dff' : '#00b0ff')
        .attr('stroke', hyper.kind === 'wedge' ? '#7c4dff' : '#00b0ff')
        .datum(hyperNodes);
    }

    // 绘制二元边
    const linkGroup = g.append('g').selectAll('line')
      .data(links)
      .enter()
      .append('line')
      .attr('class', 'edge-line')
      .attr('stroke', d => d.chi === 1 ? '#4CAF50' : '#f44336')
      .attr('stroke-width', d => Math.max(1, d.weight * 1.5))
      .attr('stroke-opacity', 0.6)
      .attr('marker-end', 'url(#arrowhead)');

    // 绘制节点组
    const nodeGroup = g.append('g').selectAll('g')
      .data(nodes)
      .enter()
      .append('g')
      .attr('class', d => newlyBornSpheres.has(d.sid) ? 'sphere-birth' : '')
      .call(d3.drag<SVGGElement, SimNode>()
        .on('start', (event, d) => {
          if (!event.active) simulation.alphaTarget(0.3).restart();
          d.fx = d.x;
          d.fy = d.y;
        })
        .on('drag', (event, d) => {
          d.fx = event.x;
          d.fy = event.y;
        })
        .on('end', (event, d) => {
          if (!event.active) simulation.alphaTarget(0);
          d.fx = null;
          d.fy = null;
        })
      );

    // 球体光晕效果
    nodeGroup.append('circle')
      .attr('r', d => d.radius + 6)
      .attr('fill', 'none')
      .attr('stroke', d => {
        const hue = (d.phase / (Math.PI * 2)) * 360;
        return `hsl(${hue}, 70%, 50%)`;
      })
      .attr('stroke-width', 2)
      .attr('stroke-opacity', 0.3);

    // 球体主体
    nodeGroup.append('circle')
      .attr('r', d => d.radius)
      .attr('fill', d => {
        const hue = (d.phase / (Math.PI * 2)) * 360;
        const sat = 70;
        const light = d.chi === 1 ? 55 : 40;
        return `hsl(${hue}, ${sat}%, ${light}%)`;
      })
      .attr('stroke', d => d.chi === 1 ? '#4CAF50' : '#f44336')
      .attr('stroke-width', d => selectedSid === d.sid ? 3 : 1.5)
      .attr('cursor', 'pointer')
      .on('click', (_event, d) => {
        onSelectSphere(selectedSid === d.sid ? null : d.sid);
      });

    // 球体标签
    nodeGroup.append('text')
      .text(d => d.sid.substring(0, 6))
      .attr('text-anchor', 'middle')
      .attr('dy', '0.35em')
      .attr('fill', '#fff')
      .attr('font-size', '9px')
      .attr('font-weight', 'bold')
      .attr('pointer-events', 'none');

    // 手性标记
    nodeGroup.append('text')
      .text(d => d.chi === 1 ? '+' : '−')
      .attr('text-anchor', 'middle')
      .attr('dy', '-1.2em')
      .attr('fill', d => d.chi === 1 ? '#4CAF50' : '#f44336')
      .attr('font-size', '14px')
      .attr('font-weight', 'bold')
      .attr('pointer-events', 'none');

    // 绘制端口小圆点
    const allPortMasks = [PORT.cn, PORT.cx, PORT.ce, PORT.cw, PORT.an, PORT.ax, PORT.ae, PORT.aw, PORT.obs, PORT.self];
    nodeGroup.each(function (d) {
      const node = d3.select(this);
      for (const pm of allPortMasks) {
        if ((d.ports & pm) !== 0) {
          const angle = PORT_ANGLES[pm] || 0;
          const px = Math.cos(angle) * PORT_DISTANCE;
          const py = Math.sin(angle) * PORT_DISTANCE;
          const direction = PORT_DIRECTION[pm];
          const chirality = PORT_CHIRALITY[pm];

          let fillColor = '#666';
          if (chirality === 'construct') fillColor = direction === 'in' ? '#81C784' : '#66BB6A';
          else if (chirality === 'annihilate') fillColor = direction === 'in' ? '#EF5350' : '#E57373';
          else fillColor = '#FFD54F';

          node.append('circle')
            .attr('class', 'port-dot')
            .attr('cx', px)
            .attr('cy', py)
            .attr('r', PORT_RADIUS)
            .attr('fill', fillColor)
            .attr('stroke', '#fff')
            .attr('stroke-width', 0.5)
            .attr('opacity', 0.8);
        }
      }
    });

    // 仿真 tick 更新
    simulation.on('tick', () => {
      linkGroup
        .attr('x1', d => (d.source as SimNode).x ?? 0)
        .attr('y1', d => (d.source as SimNode).y ?? 0)
        .attr('x2', d => (d.target as SimNode).x ?? 0)
        .attr('y2', d => (d.target as SimNode).y ?? 0);

      nodeGroup.attr('transform', d => `translate(${d.x ?? 0},${d.y ?? 0})`);

      // 更新超边区域
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const hyperAreas = g.selectAll('.hyperedge-area') as any;
      hyperAreas.each((_datum: unknown, i: number, nodes: Element[]) => {
        const el = d3.select(nodes[i]);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const hyperNodes = el.datum() as any as SimNode[];
        const points = hyperNodes.map((n: SimNode) => `${n.x},${n.y}`).join(' ');
        el.attr('points', points);
      });
    });

    // 点击空白区域取消选中
    svg.on('click', (event) => {
      if (event.target === svgRef.current) {
        onSelectSphere(null);
      }
    });

    return () => {
      simulation.stop();
    };
  }, [heap, selectedSid, onSelectSphere, newlyBornSpheres]);

  useEffect(() => {
    const cleanup = drawHeap();
    return () => {
      cleanup?.();
      simulationRef.current?.stop();
    };
  }, [drawHeap]);

  // 窗口大小变化时重绘
  useEffect(() => {
    const handleResize = () => drawHeap();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [drawHeap]);

  return (
    <div ref={containerRef} className="heap-canvas" style={{ width: '100%', height: '100%' }}>
      <svg ref={svgRef} />
    </div>
  );
};

export default HeapCanvas;
