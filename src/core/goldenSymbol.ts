/**
 * goldenSymbol.ts — 金符学 3D 复广数（GoldenSymbol）及阴龙积运算
 * 基于太一万有理论《白皮书》附录 H 定义
 *
 * 𝒢_val = a + b·i + c·j
 *   a: 流贯幅值（EML 模）
 *   b: 波性振荡相位 θ_wave，i²=-1
 *   c: 关系相位耦合 θ_rel，j²=-1，i 与 j 对易
 */

import type { JinlingSphere } from '../types/tmk';

/** 金符 3D 复广数 */
export interface GoldenSymbol {
  /** 流贯幅值分量（实轴） */
  a: number;
  /** 波性振荡分量（i 轴，i²=-1） */
  b: number;
  /** 关系相位分量（j 轴，j²=-1，j 与 i 对易） */
  c: number;
}

/**
 * 将金灵球转换为 GoldenSymbol
 * a = mod·cos(phase), b = mod·sin(phase), c = 0（初始 c=0，由相互作用积累）
 */
export function sphereToGolden(sphere: JinlingSphere): GoldenSymbol {
  return {
    a: sphere.mod * Math.cos(sphere.phase),
    b: sphere.mod * Math.sin(sphere.phase),
    c: 0,
  };
}

/**
 * 阴龙积 ⊙（白皮书 App H 定义 H.2.4）
 *
 * (𝒢₁ ⊙ 𝒢₂).a = a₁a₂ - b₁b₂ - c₁c₂
 * (𝒢₁ ⊙ 𝒢₂).b = a₁b₂ + b₁a₂
 * (𝒢₁ ⊙ 𝒢₂).c = a₁c₂ + c₁a₂ + λ·(b₁b₂ - c₁c₂)
 *
 * @param g1 左操作数
 * @param g2 右操作数
 * @param lambda 耦合调谐系数（默认 1.0）
 */
export function yinLongProduct(g1: GoldenSymbol, g2: GoldenSymbol, lambda: number = 1.0): GoldenSymbol {
  return {
    a: g1.a * g2.a - g1.b * g2.b - g1.c * g2.c,
    b: g1.a * g2.b + g1.b * g2.a,
    c: g1.a * g2.c + g1.c * g2.a + lambda * (g1.b * g2.b - g1.c * g2.c),
  };
}

/**
 * 计算 GoldenSymbol 的模²
 * |𝒢|² = a² + b² + c²
 */
export function goldenNormSq(g: GoldenSymbol): number {
  return g.a * g.a + g.b * g.b + g.c * g.c;
}

/**
 * 计算 GoldenSymbol 的模
 * |𝒢| = √(a² + b² + c²)
 */
export function goldenNorm(g: GoldenSymbol): number {
  return Math.sqrt(goldenNormSq(g));
}

/**
 * GoldenSymbol 共轭
 * 𝒢̄ = a - b·i + c·j（j 项不变，只反转 i 项）
 */
export function goldenConjugate(g: GoldenSymbol): GoldenSymbol {
  return {
    a: g.a,
    b: -g.b,
    c: g.c,
  };
}

/**
 * GoldenSymbol 加法
 * (𝒢₁ + 𝒢₂) = (a₁+a₂, b₁+b₂, c₁+c₂)
 */
export function goldenAdd(g1: GoldenSymbol, g2: GoldenSymbol): GoldenSymbol {
  return {
    a: g1.a + g2.a,
    b: g1.b + g2.b,
    c: g1.c + g2.c,
  };
}

/**
 * 从 GoldenSymbol 反推球体参数 mod 和 phase
 * mod = √(a² + b²)（忽略 c 的相位贡献，映射到 EML 模）
 * phase = atan2(b, a)
 */
export function goldenToSphereParams(g: GoldenSymbol): { mod: number; phase: number } {
  const mod = Math.sqrt(g.a * g.a + g.b * g.b + g.c * g.c);
  const phase = Math.atan2(g.b, g.a);
  return { mod, phase };
}

/**
 * 创建零 GoldenSymbol（乘法单位元的加法零元）
 */
export function goldenZero(): GoldenSymbol {
  return { a: 0, b: 0, c: 0 };
}

/**
 * 创建单位 GoldenSymbol（乘法单位元）
 */
export function goldenOne(): GoldenSymbol {
  return { a: 1, b: 0, c: 0 };
}

/**
 * GoldenSymbol 标量乘法
 */
export function goldenScale(g: GoldenSymbol, s: number): GoldenSymbol {
  return { a: g.a * s, b: g.b * s, c: g.c * s };
}

/**
 * 格式化 GoldenSymbol 为可读字符串
 */
export function goldenToString(g: GoldenSymbol, precision: number = 4): string {
  const fmt = (n: number) => n.toFixed(precision);
  const bSign = g.b >= 0 ? '+' : '';
  const cSign = g.c >= 0 ? '+' : '';
  return `${fmt(g.a)}${bSign}${fmt(g.b)}·i${cSign}${fmt(g.c)}·j`;
}
