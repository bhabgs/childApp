import {
  isNaN,
  isNumber,
  each,
  times,
} from 'lodash';

/**
 * 四舍五入
 * @param number 数字 {number}
 * @param fractionDigits 小数位数 {number}
 * @returns 四舍五入后的值 {number}
 */
export function round(number = 0, fractionDigits = 2) {
  const n = parseFloat(`${number}`) + 0.0000000001;
  const p = 10 ** fractionDigits;
  return Math.round(n * p) / p;
}

/**
 * 进位
 * @param number 数字 {number}
 * @param fractionDigits 小数位数 {number}
 * @returns 进位后的值 {number}
 */
export function ceil(number: number, fractionDigits = 2) {
  return Math.ceil(number * (10 ** fractionDigits)) / (10 ** fractionDigits);
}

/**
 * 去尾
 * @param number 数字 {number}
 * @param fractionDigits 小数位数 {number}
 * @returns 去尾后的值 {number}
 */
export function floor(number: number, fractionDigits = 2) {
  return Math.floor(number * (10 ** fractionDigits)) / (10 ** fractionDigits);
}

function calc(numA: number, numB: number) {
  const a = Number(numA);
  const b = Number(numB);
  if (!isNaN(a) && !isNaN(b)) {
    let ra: number;
    let rb: number;
    try {
      ra = a.toString().split('.')[1].length;
    } catch {
      ra = 0;
    }
    try {
      rb = b.toString().split('.')[1].length;
    } catch {
      rb = 0;
    }
    const r = 10 ** Math.max(ra, rb);
    return [a, b, r, ra, rb];
  }
  return [0, 0, 0, 0, 0];
}

/**
 * 乘法运算
 * @param a 被乘数 {number}
 * @param b 乘数 {number}
 * @returns 乘法运算后的结果 {number}
 */
export function multi(a: number, b: number) {
  const base = calc(a, b);
  if (base[2]) {
    return Number(base[0].toString().replace('.', '')) * Number(base[1].toString().replace('.', '')) / (10 ** (base[3] + base[4]));
  }
  return base[0] * base[1];
}

/**
 * 除法运算
 * @param a 被除数 {number}
 * @param b 除数 {number}
 * @returns 除法运算后的结果 {number}
 */
export function div(a: number, b: number) {
  if (b === 0) {
    return 0;
  }
  const base = calc(a, b);
  return Number(base[0].toString().replace('.', '')) / Number(base[1].toString().replace('.', '')) * (10 ** (base[4] - base[3]));
}

/**
 * 加法运算
 * @param a 被加数 {number}
 * @param b 加数 {number}
 * @returns 加法运算后的结果 {number}
 */
export function add(a: number, b: number) {
  const base = calc(a, b);
  if (base[3] === 0 && base[4] === 0) {
    return base[0] + base[1];
  }
  return div(multi(base[0], base[2]) + multi(base[1], base[2]), base[2]);
}

/**
 * 减法
 * @param a 被减数 {number}
 * @param b 减数 {number}
 * @returns 减法运算后的结果 {number}
 */
export function sub(a: number, b: number) {
  const base = calc(a, b);
  if (base[3] === 0 && base[4] === 0) {
    return base[0] - base[1];
  }
  return div(multi(base[0], base[2]) - multi(base[1], base[2]), base[2]);
}

interface LadderResult {
  /**
   * 结果 如 '2MB'
   */
  value: string;
  /**
   * 结果值 如 2
   */
  v: number;
  /**
   * 断点值 如 'MB'
   */
  u: string;
}

/**
 * 阶梯进制
 * @param value 数值 {number}
 * @param base 进制 {number}
 * @param breakpoint 断点 {string[]}
 * @param fractionDigits 小数位数 {number}
 * @returns value: 结果 {string}, v: 结果值 {number}, u: 断点值 {string}
 */
export function ladder(value: number, base: number, breakpoint: string[], fractionDigits = 2): LadderResult {
  if (isNumber(base) && breakpoint.length) {
    let reIndex = 0;
    each(times(breakpoint.length), (index) => {
      if (index < breakpoint.length - 1) {
        if (value < base ** (index + 1) && value >= (index ? base ** index : 0)) {
          reIndex = index;
          return false;
        }
        return true;
      }
      reIndex = index;
    });
    const v = round(reIndex ? div(value, base ** reIndex) : value, fractionDigits);
    const u = breakpoint[reIndex];
    return {
      value: `${v}${u}`,
      v,
      u,
    };
  }
  return {
    value: `${value}`,
    v: value,
    u: '',
  };
}
