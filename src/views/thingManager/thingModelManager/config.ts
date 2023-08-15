import { Rule } from 'ant-design-vue/lib/form/interface';
import { checkCode, checkCodeAttr } from '@/api/thingModel';

interface optionI {
  value: string;
  lable: string;
}
export const thingTypeName = (list: any[], key?: string) => {
  if (key) {
    const one = list.find((el) => el.value == key);
    return one ? one.key : '--';
  }
  return '--';
};

export const formModelUpdateRules = {
  name: [
    { required: true, message: '请输入模型名称', trigger: 'blur' },
    {
      validator: (_rule: Rule, value: string) => {
        if (value && value.length > 128) {
          return Promise.reject();
        }
        return Promise.resolve();
      },
      message: '模型名称不能超过128个字符',
      trigger: 'blur',
    },
  ],
  code: [
    { required: true, message: '请输入模型编码', trigger: 'blur' },
    {
      validator: async (_rule: Rule, value: string) => {
        const reg = /^[0-9A-Z_.\-]+$/;
        if (value && value.length > 32) {
          return Promise.reject('模型编码不能超过32个字符');
        }
        if (value && !reg.test(value)) {
          return Promise.reject('支持输入数字、大写英文字母和_ - .');
        }
        if (value && value.indexOf('__') > -1) {
          return Promise.reject('不支持连续的__两个下划线');
        }
        return Promise.resolve();
      },
      trigger: ['change', 'blur'],
    },
    {
      validator: async (_rule: Rule, value: string) => {
        if (value) {
          const res = await checkCode(encodeURIComponent(value));
          if (!res.data) {
            return Promise.reject('编码不能重复');
          }
        }
        return Promise.resolve();
      },
      trigger: 'blur',
    },
  ],
  tableName: [
    { required: true, message: '请输入存储物理表名', trigger: 'blur' },
  ],
  thingType: [{ required: true, message: '请选择所属类型', trigger: 'blur' }],
  catalogCode: [{ required: true, message: '请选择所属类目', trigger: 'blur' }],
  industryCode: [
    { required: true, message: '请选择所属行业', trigger: 'blur' },
  ],
};
export const formAttrUpdateRules = (thingCode: string, id: string) => {
  return {
    name: [
      { required: true, message: '请输入属性名称', trigger: 'blur' },
      {
        validator: (_rule: Rule, value: string) => {
          if (value && value.length > 32) {
            return Promise.reject();
          }
          return Promise.resolve();
        },
        message: '属性名称不能超过32个字符',
        trigger: 'blur',
      },
    ],
    code: [
      { required: true, message: '请输入属性编码', trigger: 'blur' },
      {
        validator: async (_rule: Rule, value: string) => {
          const reg = /^[0-9A-Za-z_]+$/;
          const reg1 = /[a-z]/;
          if (value && value.length > 32) {
            return Promise.reject('属性编码不能超过32个字符');
          }
          if (value && !reg.test(value)) {
            return Promise.reject('支持输入数字、大写英文字母和_');
          }
          if (value && value.indexOf('__') > -1) {
            return Promise.reject('不支持连续的__两个下划线');
          }
          if (value && reg1.test(value)) {
            return Promise.reject(
              '不建议使用小写字母，不符合业务规范，但不影响保存'
            );
          }
          return Promise.resolve();
        },
        trigger: ['change', 'blur'],
      },
      {
        validator: async (_rule: Rule, value: string) => {
          if (value) {
            const res = await checkCodeAttr(thingCode, value, id);
            if (!res.data) {
              return Promise.reject('属性编码不能重复');
            }
          }
          return Promise.resolve();
        },
        trigger: 'blur',
      },
    ],
    propertyType: [
      { required: true, message: '请选择属性类型', trigger: 'blur' },
    ],

    displayLabel: [
      { required: true, message: '请输入前端界面显示名称', trigger: 'blur' },
      {
        validator: (_rule: Rule, value: string) => {
          if (value && value.length > 128) {
            return Promise.reject();
          }
          return Promise.resolve();
        },
        message: '前端界面显示名称不能超过128个字符',
        trigger: 'blur',
      },
    ],
    columnName: { required: true, message: '请选择存储字段', trigger: 'blur' },
  };
};
