/**
 * 代码编码 url编码 => base64
 * @param code 代码字符串
 */
export function encodeCode(code: string) {
  if (!code) return;
  return btoa(encodeURIComponent(code));
}

/**
 * 代码解码 base64解码 => url解码
 * @param encodedCode 编码后的代码字符串
 */
export function decodeCode(encodedCode: string) {
  if (!encodedCode) return;
  return decodeURIComponent(atob(encodedCode));
}
