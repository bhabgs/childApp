export const generateFormRule = (rules: paramConfig[]) => {
  const rulesObj: any = {};

  rules.forEach((el) => {
    if (el.required !== false) {
      const msgPre =
        el.msg || el.type === 'time' || el.type === 'select'
          ? '请选择'
          : '请输入';
      rulesObj[el.key] = [
        {
          required: true,
          message: `${msgPre}${el.label}`,
        },
      ];
    }
    if (el.extraRules) {
      el.extraRules.forEach((rule) => {
        if (!rulesObj[el.key]) {
          rulesObj[el.key] = [];
        }
        rulesObj[el.key].push({
          validator: rule.validator,
          trigger: rule.trigger,
        });
      });
    }
  });
  return rulesObj;
};

const datatype = (data: any): string => {
  const { toString } = Object.prototype;
  const typeMap: any = {
    '[object Boolean]': 'boolean',
    '[object String]': 'string',
    '[object Number]': 'number',
    '[object Array]': 'array',
    '[object Undefined]': 'undefined',
    '[object Null]': 'null',
    '[object Function]': 'function',
    '[object Object]': 'object',
    '[object RegExp]': 'regExp',
    '[object Date]': 'date',
    '[object Set]': 'set',
    '[object Map]': 'map',
    '[object HTMLDivElement]': 'html',
  };

  return typeMap[toString.call(data)];
};
export const deepclone = (data: any): any => {
  const type = datatype(data);
  let copy: any;
  if (type === 'array') {
    copy = [];
    data.forEach((item: any) => {
      copy.push(deepclone(item));
    });
  } else if (type === 'object') {
    copy = {};
    for (const key in data) {
      if (Object.prototype.hasOwnProperty.call(data, key)) {
        copy[key] = deepclone(data[key]);
      }
    }
  } else if (type === 'set') {
    copy = new Set();
    data.forEach((item: any) => {
      copy.add(deepclone(item));
    });
  } else if (type === 'map') {
    copy = new Map();

    for (const key in data) {
      copy.set(key, deepclone(data[key]));
    }
  } else {
    copy = data;
  }

  return copy;
};
