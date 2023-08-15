import { instance, createPath } from '.';

const path = createPath('/mtip/thing/v2/thingInst');

export interface AlarmDTO {
  alarmId: string;
  alarmLevel: string;
  alarmName: string;
  alarmTime: string;
  avaiable: boolean;
  linkUrl: string;
  ruleId: string;
  thingInstId: string;
  thingPropertyCode: string;
}

export interface Props {
  label: string;
  unit: string;
  value: string;
  displayType: string;
  displayValue: string;
  propertyType: string;
  listInfo: string;
  pointCode: string;
  pointCode2: string;
  thingPropertyId: string;
  thingPropertyCode: string;
  relationThingCode: string;
  listType: string;
  alarmDTO: AlarmDTO;
}

export interface Group {
  groupName: string;
  thingPropertyValueVoList: Props[];
}
interface DialogDetail {
  detailGroupList: Group[];
  thingInstId: string;
  thingCode: string;
}

interface Property {
  thingPropertyCode: string;
  value: string;
}

export interface Entities {
  thingInstName: string;
  thingInstCode: string;
  listPropertyList: Property[];
}

/**
 * 批量读取动态属性值
 * @access http://192.168.5.66:3333/project/329/interface/api/12419
 */
export const reloadPropertiesValue = (data) => instance.post(path`reloadPropertiesValue`, data);

/**
 * 
 * @param data 批量读取报警属性值
 * @access http://192.168.5.66:3333/project/329/interface/api/14633
 */
export const reloadAlarmsValue = (data) => instance.post(path`reloadAlarmsValue`, data);

export const reloadLogicAndAlarm = (data) => instance.post(path`reloadLogicAndAlarm`, data);

 /**
  * 查询物实例通过ID，获取全部原始数据值
  * @access http://192.168.5.66:3333/project/329/interface/api/12371
  */
export const findById = (params) => instance.get<DialogDetail>(path`findById`, { params });

export const findByIdModify = (params) => instance.get<DialogDetail>(path`findByIdModify`, { params });

export const modify = (data) => instance.post(path`modify`, data);

export const downloadPropertyValue = (thingPropertyId, pointCode, value) => instance.post(path`downloadPropertyValue`, {
  thingPropertyId,
  pointCode,
  value,
});

export const getListPageColumns = (params) => instance.get(path`getListPageColumns`, {
  params,
});

/**
 * 关系属性列查询
 */
export const findRelationEntitiesPage = (data) => instance.post<{
  list: Entities[];
  total: number;
}>(path`findRelationEntitiesPage`, data, {
  params: {
    functionCode: 'web',
  },
});

export const getSelectValues = (thingCode, data) => instance.post(path`getSelectValues`, data, {
  params: {
    thingCode,
  },
});

export const getThingAllProperties = (thingCode) => instance.get(path`getThingAllProperties`, {
  params: {
    functionCode: 'web',
    requestType: 'all',
    thingCode,
  },
});

export const getThingInstFiles = (params, pager) => instance.post(path`getThingInstFiles`, pager, { params });

export const downloadThingInstFile = (thingInstFileId) => instance.post(path`downloadThingInstFile`, {}, {
  responseType: 'blob',
  timeout: 60 * 1000,
  params: {
    thingInstFileId,
  },
});

export const findPage = (functionCode, data) => instance.post(path`findPage`, data, {
  params: {
    functionCode,
  },
});

export const create = (data) => instance.post(path`create`, data);

export const setAlarmValid = (data) => instance.post(path`setAlarmValid`, data);

export const resetAlarm = (data) => instance.post(path`resetAlarm`, data);

export const queryHistoryData = (data) => instance.post(path`queryHistoryData`, data);

export const getThingPropertyInstInfo = (data) => instance.post(path`getThingPropertyInstInfo`, data);

export const saveThingPropertyInstInfo = (data) => instance.post(path`saveThingPropertyInstInfo`, data);
