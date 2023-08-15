import { Rule } from 'ant-design-vue/lib/form/interface';
import * as thingApis from '@/api/thingInstance';
import instance from '@/api';
import _ from 'lodash';

export const codeRepeatValidator = async (
  _rule: Rule,
  value: string,
  basicForm?: any[]
) => {
  if (basicForm) {
    const thindCode = basicForm.find((basic: any) => basic.code === 'code');
    if (value === thindCode.instProperty.settingValue) {
      return Promise.resolve();
    }
  }
  const res = await thingApis.checkCode(value);
  if (res.data) {
    return Promise.resolve();
  } else {
    return Promise.reject();
  }
};

export const codeCharacterValidator = (_rule: Rule, value: string) => {
  if (value.match(/^[A-Za-z0-9_.\-#/]+?$/)) {
    return Promise.resolve();
  } else {
    return Promise.reject();
  }
};

export const codeCharacterValidator2 = (_rule: Rule, value: string) => {
  if (value.indexOf('__') < 0) {
    return Promise.resolve();
  } else {
    return Promise.reject();
  }
};

export const getInstanceBasic = (isNew: boolean, basicForm?: any) => {
  return [
    {
      displayLabel: '实例名称',
      code: 'name',
      display: true,
      displayType: 'text',
      rules: [{ required: true, message: '请输入名称' }],
    },
    {
      displayLabel: '实例编码',
      code: 'code',
      display: true,
      displayType: 'text',
      remark:
        '编码为空时，美腾工业物联平台会颁发唯一标识符作为编码。支持数字、大小写字母和_ - . / #',
      rules: [
        { required: true, message: '请输入编码', trigger: 'blur' },
        {
          validator: codeCharacterValidator,
          message: '支持数字、大小写字母和_ - . / #',
          trigger: 'blur',
        },
        {
          validator: codeCharacterValidator2,
          message: '不支持连续的__两个下划线',
          trigger: 'blur',
        },
        {
          validator: async (_rule: Rule, value: string) =>
            codeRepeatValidator(_rule, value, !isNew ? basicForm.value : null),
          message: '编码重复',
          trigger: 'blur',
        },
      ],
      readonly: false,
    },
  ];
};

export const getListAtomicValue = (ele: any, list: any[], codeKey = 'code') => {
  if (ele.displayType.toLocaleLowerCase() === 'select_atomic' && ele.listInfo) {
    const atomicValue = ele.listInfo.match(/(?<=\${).*?(?=\})/g) || [];
    const attrs = list.filter((el) => atomicValue.includes(el[codeKey]));
    if (attrs && attrs.length > 0) {
      return attrs
        ? attrs.filter((attr) => attr.value).map((attr) => attr.value)
        : '';
    } else {
      return '';
    }
  }
  return '';
};

export const getDisplayValue = (value: any, propInfo: any) => {
  const { listInfo, thingInstPropertyValidVo, displayType } = propInfo;
  if (listInfo) {
    const json = JSON.parse(listInfo);
    for (const key in json) {
      if (key == value) {
        return json[key];
      }
    }
  }
  if (
    displayType === 'NUMBER' &&
    value &&
    _.isNil(thingInstPropertyValidVo?.decimalPlace)
  ) {
    return Number(value).toFixed(thingInstPropertyValidVo?.decimalPlace);
  }
  return value;
};

const getPointCode = (el: any) => {
  if (el.displayType == 'alarm') {
    return el.pointCode2;
  } else {
    return el.pointCode2 || el.pointCode;
  }
};
//收集有pre的属性

export const collectPointCode = (list: any[]) => {
  const collectList: Array<{
    pointCode: string;
    thingPropertyId: string;
    value: any;
  }> = [];
  list.forEach((el) => {
    const pointCode = getPointCode(el);
    if (pointCode) {
      collectList.push({
        pointCode,
        value: el.value,
        thingPropertyId: el.thingPropertyId,
      });
    }
  });

  return collectList;
};

//收集有alarmId的属性
export const collectAlarmId = (
  list: any[],
  thingCode: string,
  thingInstId: string
) => {
  const alarmList: Array<{
    instanceUuid: string;
    propertyCode: string;
    thingCode: string;
    prePointCode: string;
    prePointCode2: string;
    ruleId: any;
  }> = [];
  list.forEach((el) => {
    if (el.alarmId) {
      alarmList.push({
        instanceUuid: thingInstId,
        propertyCode: el.thingPropertyCode,
        ruleId: el.alarmId,
        thingCode,
        prePointCode: el.pointCode,
        prePointCode2: el.pointCode2,
      });
    }
  });

  return alarmList;
};

//收集有logic的属性
export const collectLogicProp = (
  list: any[],
  thingCode: string,
  thingInstId: string,
  thingInstCode: string
) => {
  const logicList: Array<{
    thingInstCode: string;
    thingInstId: string;
    thingPropertyCode: string;
    thingCode: string;
  }> = [];
  list.forEach((el) => {
    if (el.propertyType === 'LOGIC' && el.displayType !== 'IFRAME') {
      logicList.push({
        thingInstCode,
        thingInstId,
        thingPropertyCode: el.thingPropertyCode,
        thingCode,
      });
    }
  });

  return logicList;
};

// 设置有pre的属性;
export const setPrePropsValue = (prop: any, propData: any[]) => {
  const pointCode = getPointCode(prop);
  if (pointCode) {
    const match = propData.find((item) => item.pointCode === pointCode);
    if (prop.displayType === 'ALARM') {
      //投切不读pre了
      // prop.alarmAvailable = value == 1 ? true : false;
    } else {
      prop.value = match.value;
      prop.displayValue = _.isNil(match.displayValue)
        ? getDisplayValue(match.value, prop)
        : match.displayValue;
    }
  }
  return prop;
};

// 设置有pre的属性;
export const setLogicPropsValue = (
  prop: any,
  propData: any[],
  thingInsId: string
) => {
  const matchOne = propData.find(
    (item) =>
      item.thingPropertyCode === prop.thingPropertyCode &&
      item.thingInstId === thingInsId
  );
  if (matchOne) {
    prop.value = matchOne.value;
    prop.displayValue = _.isNil(matchOne.displayValue)
      ? getDisplayValue(matchOne.value, prop)
      : matchOne.displayValue;
  }

  return prop;
};
// 设置有alarmId的属性;

export const setAlarmPropsValue = (prop: any, alarmData: any[]) => {
  if (prop.alarmId) {
    const alarm = alarmData.find((item) => item.ruleId === prop.alarmId);
    if (alarm) {
      prop.alarmAvailable = alarm.available;
      prop.manuReleasable = alarm.manuReleasable;
      // if (prop.canLink) {
      //   const alarmInstId = String(prop.alarmInstId);
      //   prop.linkUrl = prop.linkUrl.replace(alarmInstId, alarm.alarmId);
      // }
      if (alarm.alarmId) {
        prop.refresh = alarm.alarmTime;
        prop.value = alarm.alarmLevel;
        prop.displayValue = getDisplayValue(alarm.alarmLevel, prop);
        prop.alarmInstId = alarm.alarmId;
        prop.linkUrl = alarm.linkUrl;
      } else {
        prop.refresh = '';
        prop.value = alarm.alarmLevel || '0';
        prop.alarmInstId = null;
        prop.displayValue = getDisplayValue(prop.value, prop);
      }
    }
  }
  return prop;
};

// 设置动态属性值
export const setDynamicsPropsValue = (
  propList: any[],
  preData: any[],
  alarmData: any[],
  logicData: any[],
  thingInsId: string
) => {
  propList.forEach((prop: any) => {
    prop = setPrePropsValue(prop, preData);
    if (prop.displayType === 'ALARM') {
      prop = setAlarmPropsValue(prop, alarmData);
    }
    if (prop.propertyType === 'LOGIC') {
      prop = setLogicPropsValue(prop, logicData, thingInsId);
    }
  });
};

// 获取页面每个属性元素所占宽度
export const getPropEleStyleWidth = (cols: any, index: number) => {
  let colspan = cols || 1;
  colspan = colspan >= 1 && colspan <= 4 ? colspan : 1;
  if (colspan === 4 && index === 0) {
    colspan = 3;
  }
  return (colspan / (index === 0 ? 3 : 4)) * 100 + '%';
};

// 【物实例详情页面】过滤符合条件的属性
export const filterShowProp = (prop: any) => {
  const { propertyType, pointCode, alarmId } = prop;
  //动态属性配地址
  if (
    ['METRIC', 'ACTION', 'PARAMETER', 'SETTING'].includes(propertyType) &&
    pointCode
  )
    return true;
  // 报警属性配置报警规则
  if (propertyType === 'ALARM' && alarmId) return true;
  // 其他属性没有限制
  if (['PROPERTY', 'LOGIC', 'RELATION', 'ATTRIBUTE'].includes(propertyType))
    return true;
  return false;
};

// 判断是否是关系属性的分组
export const isRelationGroup = (thingList: any[]) => {
  return thingList?.some((item) => item.displayType === 'TABLE');
};
