/**
 * 简化哈希函数 — 替代 blake3
 * 用于生成金灵球的 i_int 字段
 * 采用 FNV-1a 变体，输出 32 位无符号整数
 */

/** FNV-1a 偏移基数 */
const FNV_OFFSET = 2166136261;
/** FNV-1a 质数 */
const FNV_PRIME = 16777619;
/** 模数 p（大素数） */
const PRIME_P = 2147483647;

/**
 * 计算字符串的 FNV-1a 哈希值
 * @param str 输入字符串
 * @returns 哈希值 ∈ ℤ_p
 */
export function fnv1aHash(str: string): number {
  let hash = FNV_OFFSET;
  for (let i = 0; i < str.length; i++) {
    hash ^= str.charCodeAt(i);
    // 使用数学运算避免位运算溢出问题
    hash = (hash * FNV_PRIME) >>> 0;
  }
  return hash % PRIME_P;
}

/**
 * 生成球体类型指纹哈希
 * 模拟 blake3(S‑expr(type_fingerprint))
 * @param typeFingerprint 类型的 S-expr 字符串
 * @returns 哈希值 ∈ ℤ_p
 */
export function blake3Simplified(typeFingerprint: string): number {
  // 二次哈希增强随机性
  const h1 = fnv1aHash(typeFingerprint);
  const h2 = fnv1aHash(typeFingerprint + '::tmk-salt');
  return ((h1 ^ (h2 << 1)) >>> 0) % PRIME_P;
}

/**
 * 生成唯一球体 ID
 * @returns 格式为 "S-{timestamp}-{random}" 的字符串
 */
export function generateSid(): string {
  const ts = Date.now().toString(36);
  const rand = Math.random().toString(36).substring(2, 8);
  return `S-${ts}-${rand}`;
}
