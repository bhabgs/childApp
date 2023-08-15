import { instance, createPath } from '.';

const path = createPath('/mtip/thing/v2/topoThingProperty');

type ThingPropertyId = string;

export interface Style {
  info: {
    v: string;
    code: string;
  };
  type: string;
}

export interface Proptype {
  id: ThingPropertyId;
  code: string;
  displayLabel: string;
  displayType: string;
  /**
   * 分组名
   */
  groupName: string;
  /**
   * 名称
   */
  name: string;
  thingCode: string;
  /**
   * 是否勾选
   */
  eventEnable: boolean;
  /**
   * 单位
   */
  unit: string;
  /**
   * 样式
   */
  style: Style;
}

export interface Property {
  /**
   * 物模型编码（tc）
   */
  thingCode: string;
  /**
   * 物属性ID
   */
  thingPropertyId: ThingPropertyId;
  /**
   * 是否选中
   */
  chooseState: boolean;
  /**
   * 样式
   */
  style: any;
}

/**
 * 获取拓扑图元素属性配置到通用配置
 * @access http://192.168.5.66:3333/project/329/interface/api/12773
 * @param id 物实例iu {string}
 */
 export const getTopoMapThingPropertyTemplate = (tcs: string[]) => instance.post<Proptype[]>(path`getTopoMapThingPropertyTemplate`, tcs);

 /**
  * 保存拓扑图元素属性配置到通用配置
  * @access http://192.168.5.66:3333/project/329/interface/api/12767
  */
 export const saveTopoMapThingPropertyTemplate = (data: Property[]) => instance.post(path`saveTopoMapThingPropertyTemplate`, data);
 