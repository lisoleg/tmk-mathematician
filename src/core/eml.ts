/**
 * EML 函数 — 太一万有理论的指数-对数混合函数
 * EML: z = exp(x) - log(y)
 * 基于太一万有理论，EML 函数统一了加法与乘法运算
 */

/**
 * 计算 EML 函数值
 * z = exp(x) - log(y)
 * @param x 指数参数
 * @param y 对数参数（必须 > 0）
 * @returns EML 计算结果
 * @throws 当 y <= 0 时抛出错误
 */
export function eml(x: number, y: number): number {
  if (y <= 0) {
    throw new Error(`EML: 对数参数 y 必须 > 0，收到 y=${y}`);
  }
  return Math.exp(x) - Math.log(y);
}

/**
 * 通过 EML 实现加法
 * a + b ≈ eml(eml(a, 1), eml(b, 1))
 * 当 a, b 较小时近似精度较高
 * @param a 第一个加数
 * @param b 第二个加数
 * @returns EML 加法结果
 */
export function emlAdd(a: number, b: number): number {
  return eml(eml(a, 1), eml(b, 1));
}

/**
 * 通过 EML 实现乘法
 * a · b = exp(ln a + ln b)
 * 这是 EML 的特殊情况（对数子情况）
 * @param a 第一个乘数（必须 > 0）
 * @param b 第二个乘数（必须 > 0）
 * @returns EML 乘法结果
 */
export function emlMul(a: number, b: number): number {
  if (a <= 0 || b <= 0) {
    throw new Error(`EML 乘法: 参数必须 > 0，收到 a=${a}, b=${b}`);
  }
  return Math.exp(Math.log(a) + Math.log(b));
}

/**
 * EML 数的极坐标表示
 * z = m ⊗ e^{iθ}
 * 其中 ⊗ 为 EML 乘法运算
 */
export interface EMLNumber {
  /** 模 m */
  m: number;
  /** 相位 θ ∈ [0, 2π) */
  theta: number;
}

/**
 * 将 EML 数转换为笛卡尔坐标
 * z = m·cos(θ) + i·m·sin(θ)
 * @param emlNum EML 数
 * @returns [实部, 虚部]
 */
export function emlToCartesian(emlNum: EMLNumber): [number, number] {
  return [emlNum.m * Math.cos(emlNum.theta), emlNum.m * Math.sin(emlNum.theta)];
}

/**
 * 两个 EML 数相乘（极坐标运算）
 * z₁ · z₂ = (m₁·m₂) ⊗ e^{i(θ₁+θ₂)}
 * @param a 第一个 EML 数
 * @param b 第二个 EML 数
 * @returns 乘积 EML 数
 */
export function emlMultiply(a: EMLNumber, b: EMLNumber): EMLNumber {
  return {
    m: emlMul(a.m, b.m),
    theta: a.theta + b.theta,
  };
}

/**
 * 两个 EML 数相加
 * 先转换为笛卡尔坐标，相加后转回极坐标
 * @param a 第一个 EML 数
 * @param b 第二个 EML 数
 * @returns 和 EML 数
 */
export function emlAddPolar(a: EMLNumber, b: EMLNumber): EMLNumber {
  const [ar, ai] = emlToCartesian(a);
  const [br, bi] = emlToCartesian(b);
  const sr = ar + br;
  const si = ai + bi;
  return {
    m: Math.sqrt(sr * sr + si * si),
    theta: Math.atan2(si, sr) < 0 ? Math.atan2(si, sr) + 2 * Math.PI : Math.atan2(si, sr),
  };
}

/**
 * 计算经典运算与 EML 运算的对比
 * @param x 参数 x
 * @param y 参数 y
 * @returns 对比结果
 */
export function emlComparison(x: number, y: number): {
  emlResult: number;
  addition: number;
  emlAddResult: number;
  addError: number;
  multiplication: number;
  emlMulResult: number;
  mulError: number;
} {
  const emlResult = eml(x, y);
  const addition = x + y;
  const emlAddResult = emlAdd(x, y);
  const addError = Math.abs(addition - emlAddResult);
  const multiplication = x * y;
  const emlMulResult = (x > 0 && y > 0) ? emlMul(x, y) : NaN;
  const mulError = (x > 0 && y > 0) ? Math.abs(multiplication - emlMulResult) : NaN;

  return { emlResult, addition, emlAddResult, addError, multiplication, emlMulResult, mulError };
}
