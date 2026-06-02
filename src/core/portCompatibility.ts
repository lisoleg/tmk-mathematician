/**
 * PCT — 端口兼容匹配定理 (Port Compatibility Theorem)
 * 四条件校验：方向互补、手性相容、相位可锁、阶守恒
 */

import type { JinlingSphere, PCTResult } from '../types/tmk';
import { PORT, PORT_DIRECTION, PORT_CHIRALITY, N8_CORE } from '../types/tmk';

/**
 * 获取球体的出端口列表
 * @param sphere 金灵球
 * @returns 出端口掩码列表
 */
function getOutPorts(sphere: JinlingSphere): number[] {
  const corePorts = [PORT.cn, PORT.cx, PORT.ce, PORT.cw, PORT.an, PORT.ax, PORT.ae, PORT.aw];
  return corePorts.filter(p => (sphere.ports & p) !== 0 && PORT_DIRECTION[p] === 'out');
}

/**
 * 获取球体的入端口列表
 * @param sphere 金灵球
 * @returns 入端口掩码列表
 */
function getInPorts(sphere: JinlingSphere): number[] {
  const corePorts = [PORT.cn, PORT.cx, PORT.ce, PORT.cw, PORT.an, PORT.ax, PORT.ae, PORT.aw];
  return corePorts.filter(p => (sphere.ports & p) !== 0 && PORT_DIRECTION[p] === 'in');
}

/**
 * 条件1：方向互补校验
 * 出端口 ↔ 入端口
 * @param src 源球
 * @param tgt 目标球
 * @returns 是否满足方向互补
 */
function checkDirectionComplement(src: JinlingSphere, tgt: JinlingSphere): boolean {
  const srcOut = getOutPorts(src);
  const tgtIn = getInPorts(tgt);
  // 至少有一对出→入方向互补
  return srcOut.length > 0 && tgtIn.length > 0;
}

/**
 * 条件2：手性相容校验
 * 构造(χ=+1) 查 cx/cn/ce/cw；消解(χ=-1) 查 an/ae/aw
 * @param src 源球
 * @param tgt 目标球
 * @returns 是否手性相容
 */
function checkChiralityCompatibility(src: JinlingSphere, tgt: JinlingSphere): boolean {
  // 源球的出端口手性必须与目标球的入端口手性相容
  const srcOutPorts = getOutPorts(src);
  const tgtInPorts = getInPorts(tgt);

  for (const sp of srcOutPorts) {
    const srcChirality = PORT_CHIRALITY[sp];
    for (const tp of tgtInPorts) {
      const tgtChirality = PORT_CHIRALITY[tp];
      // 同手性相容，或元端口与任何相容
      if (srcChirality === tgtChirality || srcChirality === 'meta' || tgtChirality === 'meta') {
        return true;
      }
    }
  }
  return false;
}

/**
 * 条件3：相位可锁校验
 * θ_u + θ_v ≡ θ_tgt (mod 2π·关系对称性阶)
 * 简化实现：检查相位差是否在容差范围内
 * @param src 源球
 * @param tgt 目标球
 * @param symmetryOrder 关系对称性阶（默认 1）
 * @returns 是否相位可锁
 */
function checkPhaseLockable(src: JinlingSphere, tgt: JinlingSphere, symmetryOrder: number = 1): boolean {
  const phaseSum = src.phase + tgt.phase;
  const phaseMod = ((phaseSum % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);
  const tgtPhaseMod = ((tgt.phase % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);

  // 容差：2π / (symmetryOrder * 10)
  const tolerance = (2 * Math.PI) / (symmetryOrder * 10);
  const diff = Math.abs(phaseMod - tgtPhaseMod);

  // 考虑环绕
  return diff < tolerance || (2 * Math.PI - diff) < tolerance;
}

/**
 * 条件4：阶守恒校验
 * Clifford grade 半群下投影守恒
 * 简化实现：检查 mod 值的质因数分解是否守恒
 * @param src 源球
 * @param tgt 目标球
 * @returns 是否阶守恒
 */
function checkGradeConservation(src: JinlingSphere, tgt: JinlingSphere): boolean {
  // 简化：检查 mod 值之积的奇偶性与 chi 乘积一致
  const productChi = src.chi * tgt.chi;
  const modProduct = src.mod * tgt.mod;
  // 偶数 mod → 偶数 grade，奇数 mod → 奇数 grade
  const srcGrade = src.mod % 2;
  const tgtGrade = tgt.mod % 2;
  const sumGrade = (srcGrade + tgtGrade) % 2;

  // 构造(χ=+1) → 偶数阶守恒，消解(χ=-1) → 奇数阶允许
  if (productChi === 1) {
    return sumGrade === 0;
  } else {
    return true; // 消解连接总是阶守恒
  }
}

/**
 * PCT 端口兼容性完整校验
 * @param src 源球
 * @param tgt 目标球
 * @param symmetryOrder 关系对称性阶
 * @returns 校验结果
 */
export function checkPCT(src: JinlingSphere, tgt: JinlingSphere, symmetryOrder: number = 1): PCTResult {
  const directionOk = checkDirectionComplement(src, tgt);
  const chiralityOk = checkChiralityCompatibility(src, tgt);
  const phaseOk = checkPhaseLockable(src, tgt, symmetryOrder);
  const gradeOk = checkGradeConservation(src, tgt);

  const compatible = directionOk && chiralityOk && phaseOk && gradeOk;

  const details: string[] = [];
  if (!directionOk) details.push('方向不互补：出端口与入端口不匹配');
  if (!chiralityOk) details.push('手性不相容：端口手性类型冲突');
  if (!phaseOk) details.push(`相位不可锁：θ_src + θ_tgt 与 θ_tgt (mod 2π·${symmetryOrder}) 不一致`);
  if (!gradeOk) details.push('阶不守恒：Clifford grade 投影违反守恒律');
  if (compatible) details.push('四条件全部满足，端口兼容');

  return { directionOk, chiralityOk, phaseOk, gradeOk, compatible, details };
}

/**
 * 检查两个球体是否端口兼容（快捷方法）
 * @param src 源球
 * @param tgt 目标球
 * @returns 是否兼容
 */
export function isPortCompatible(src: JinlingSphere, tgt: JinlingSphere): boolean {
  return checkPCT(src, tgt).compatible;
}

/**
 * 获取端口兼容性评分（0-4，满足的条件数）
 * @param src 源球
 * @param tgt 目标球
 * @returns 评分
 */
export function pctScore(src: JinlingSphere, tgt: JinlingSphere): number {
  const result = checkPCT(src, tgt);
  let score = 0;
  if (result.directionOk) score++;
  if (result.chiralityOk) score++;
  if (result.phaseOk) score++;
  if (result.gradeOk) score++;
  return score;
}
