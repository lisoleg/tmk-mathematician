/**
 * 金灵球类 — JinlingSphere 的工厂与操作方法
 */

import type { JinlingSphere } from '../types/tmk';
import { PORT, N8_CORE } from '../types/tmk';
import { blake3Simplified, generateSid } from '../utils/hash';

/**
 * 创建一个新的金灵球
 * @param params 可选参数覆盖
 * @returns 新的金灵球实例
 */
export function createSphere(params: Partial<JinlingSphere> = {}): JinlingSphere {
  const sid = params.sid || generateSid();
  const chi = params.chi ?? (Math.random() > 0.5 ? 1 : -1);
  const ports = params.ports ?? defaultPorts(chi);
  const mod = params.mod ?? Math.floor(Math.random() * 100) + 1;
  const phase = params.phase ?? Math.random() * Math.PI * 2;

  // i_int 由类型指纹计算
  const fingerprint = `sphere:${chi}:${ports}:${mod}`;
  const i_int = params.i_int ?? blake3Simplified(fingerprint);

  return { sid, i_int, ports, chi, mod, phase };
}

/**
 * 根据手性生成默认端口
 * @param chi 手性：+1 构造 / -1 消解
 * @returns 默认端口掩码
 */
function defaultPorts(chi: number): number {
  if (chi === 1) {
    // 构造球：默认开启构造端口 + 观察
    return PORT.cn | PORT.cx | PORT.ce | PORT.cw | PORT.obs;
  } else {
    // 消解球：默认开启消解端口 + 观察
    return PORT.an | PORT.ax | PORT.ae | PORT.aw | PORT.obs;
  }
}

/**
 * 检查球体是否具有指定端口
 * @param sphere 金灵球
 * @param portMask 端口掩码
 * @returns 是否拥有该端口
 */
export function hasPort(sphere: JinlingSphere, portMask: number): boolean {
  return (sphere.ports & portMask) !== 0;
}

/**
 * 切换球体的指定端口
 * @param sphere 金灵球
 * @param portMask 端口掩码
 * @returns 新的金灵球（不可变更新）
 */
export function togglePort(sphere: JinlingSphere, portMask: number): JinlingSphere {
  const newPorts = sphere.ports ^ portMask;
  return { ...sphere, ports: newPorts };
}

/**
 * 获取球体所有激活的端口列表
 * @param sphere 金灵球
 * @returns 激活的端口掩码列表
 */
export function getActivePorts(sphere: JinlingSphere): number[] {
  const allPorts = [PORT.cn, PORT.cx, PORT.ce, PORT.cw, PORT.an, PORT.ax, PORT.ae, PORT.aw, PORT.obs, PORT.self];
  return allPorts.filter(p => (sphere.ports & p) !== 0);
}

/**
 * 获取球体的 EML 数值表示
 * z = m ⊗ e^{iθ}
 * @param sphere 金灵球
 * @returns [实部, 虚部]
 */
export function emlValue(sphere: JinlingSphere): [number, number] {
  const re = sphere.mod * Math.cos(sphere.phase);
  const im = sphere.mod * Math.sin(sphere.phase);
  return [re, im];
}

/**
 * 获取球体的 EML 字符串表示
 * @param sphere 金灵球
 * @returns 格式化字符串
 */
export function emlString(sphere: JinlingSphere): string {
  const [re, im] = emlValue(sphere);
  return `${sphere.mod}⊗e^{i${sphere.phase.toFixed(2)}} = ${re.toFixed(2)} + ${im.toFixed(2)}i`;
}

/**
 * 获取球体的颜色（基于手性和相位）
 * @param sphere 金灵球
 * @returns HSL 颜色字符串
 */
export function sphereColor(sphere: JinlingSphere): string {
  const hue = (sphere.phase / (Math.PI * 2)) * 360;
  const saturation = 70;
  const lightness = sphere.chi === 1 ? 55 : 45;
  return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
}

/**
 * 获取球体的边框颜色（基于手性）
 * @param sphere 金灵球
 * @returns 颜色字符串
 */
export function sphereBorderColor(sphere: JinlingSphere): string {
  return sphere.chi === 1 ? '#4CAF50' : '#f44336';
}
