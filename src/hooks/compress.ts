import pako from "pako";

//（1）解压缩
export const uncompress = (b64Data: string) => {
  let strData = window.atob(b64Data);
  let charData = strData.split("").map(function (x) {
    return x.charCodeAt(0);
  });
  let binData = new Uint8Array(charData);
  let data = pako.inflate(binData);
  strData = Utf8ArrayToStr(data);
  return strData;
};
//（2）fix解压中文乱码
const Utf8ArrayToStr = (array: any) => {
  let out, i, len, c;
  let char2, char3;
  out = "";
  len = array.length;
  i = 0;
  while (i < len) {
    c = array[i++];
    switch (c >> 4) {
      case 0:
      case 1:
      case 2:
      case 3:
      case 4:
      case 5:
      case 6:
      case 7:
        out += String.fromCharCode(c);
        break;
      case 12:
      case 13:
        char2 = array[i++];
        out += String.fromCharCode(((c & 0x1f) << 6) | (char2 & 0x3f));
        break;
      case 14:
        char2 = array[i++];
        char3 = array[i++];
        out += String.fromCharCode(
          ((c & 0x0f) << 12) | ((char2 & 0x3f) << 6) | ((char3 & 0x3f) << 0)
        );
        break;
    }
  }
  return out;
};
// （3）压缩
export const compress = (json: any) => {
  const binaryString = pako.gzip(encodeURIComponent(json), { to: "string" });
  return window.btoa(binaryString);
};
