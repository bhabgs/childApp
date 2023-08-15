import { instance, createPath } from '.';

const path = createPath('/mtip/thing/v2/topoMap');

export type FunctionCode = 'process_connect' | 'device_connect' | string;

/**
 * 拓扑图
 */
export interface TopoMap {
  id: string;
  /**
   * 标题
   */
  title: string;
  /**
   * 主题
   */
  theme: 'dark' | 'light';
  /**
   * 缩略图
   */
  image: string;
  /**
   * 创建时间
   */
  createTime?: string;
  /**
   * 样式（拓扑图JSON数据）
   */
  style: any;
  /**
   * 类型
   */
  functionCode: FunctionCode;
  /**
   * 画布宽度
   */
  width: number;
  /**
   * 画布高度
   */
  height: number;
  /**
   * 生产回放
   */
  playBackEnable: boolean;
  /**
   * 设为主图
   */
  mainMapFlag: boolean;
}

/**
 * 物实例 ID（iu）
 */
type ThingInstanceId = string;
/**
 * 物模型名称（tc）
 */
type ThingCode = string;
/**
 * 物实例名称
 */
type ThingInstanceName = string;

/**
 * 物实例
 */
export interface Thing {
  /**
   * 物实例 ID（iu）
   */
  iu: ThingInstanceId;
  /**
   * 物实例名称
   */
  instanceName: ThingInstanceName;
  /**
   * 图片（默认）
   */
  imgPowerOff: string;
  /**
   * 图片（运行）
   */
  imgRun: string;
  /**
   * 图片（上电）
   */
  imgPowerOn: string;
  /**
   * 图片（异常）
   */
  imgAlarm: string;
  /**
   * 物模型名称
   */
  tc: ThingCode;
  children?: Thing[];
}

/**
 * 实体
 */
export interface EntityBase {
  /**
   * 主键
   */
  id?: string;
  /**
   * 拓扑图 ID
   */
  mapId: string;
  /**
   * 样式（暂不用）
   */
  style?: JSON;
  /**
   * 创建用户（暂不用）
   */
  createUser?: string;
  /**
   * 创建时间（暂不用）
   */
  createTime?: string;
  /**
   * 更新用户（暂不用）
   */
  updateUser?: string;
  /**
   * 更新时间（暂不用）
   */
  updateTime?: string;
  /**
   * 显示的属性列表
   */
  showPropertyList: string[] | null;
}

/**
 * 物实例实体
 */
export interface TopoNodeEntity extends EntityBase {
  /**
   * 类型【物：thing】
   */
   type: 'thing';
  /**
   * 连接物模型
   */
  thingCode: ThingCode;
  /**
   * 连接物 ID（iu）
   */
  thingInstanceId: ThingInstanceId;
  /**
   * 连接物名称
   */
  thingInstanceName: ThingInstanceName;
  /**
   * 是否弹出卡片
   */
  showCard: boolean;
  /**
   * PRE点地址
   */
  prePointCode?: string;
}

/**
 * 属性
 */
export interface Property {
  /**
   * 元素类型
   */
  elementType: 'node' | 'line';
  /**
   * 拓扑图 ID
   */
  mapId: string;
  /**
   * 报警规则 ID
   */
  columnType?: string;
  alarmRuleId?: string;
  /**
   * 物模型编码（tc）
   */
  thingCode: ThingCode;
  /**
   * 物实例ID（iu）
   */
  elementId: ThingInstanceId;
  /**
   * 属性类型
   */
  propertyType?: string;
  /**
   * 物属性 CODE
   */
  propertyCode?: string;
  /**
   * 物属性 ID
   */
  thingPropertyId: string;
  /**
   * 物属性实例 ID
   */
  thingPropertyInstanceId?: string;
  /**
   * PRE点地址
   */
  prePointCode?: string;
  /**
   * PRE反馈点
   */
  prePointCode2?: string;
  /**
   * 静态属性值
   */
  value?: string;
  /**
   * 静态属性显示值
   */
  displayValue?: string;
}

/**
 * 拓扑图物实例
 */
export interface TopoNode {
  /**
   * 拓扑图物实例实体
   */
  topoNodeEntity: TopoNodeEntity;
  /**
   * 属性列表
   */
  topoElementPropertyEntityList: Property[];
}

/**
 * 拓扑图连线实体
 */
export interface TopoLineEntity extends EntityBase {
  /**
   * 类型【pipeline：管路 line：连线】
   */
  type: 'pipeline' | 'line' | 'processline';
  /**
   * 上游
   */
  aNodeId: ThingInstanceId;
  /**
   * 下游
   */
  zNodeId: ThingInstanceId;
  /**
   * 连接物模型
   */
  thingCode?: ThingCode;
  /**
   * 连接物 ID（iu）
   */
  thingInstanceId?: ThingInstanceId;
  /**
   * 连接物名称
   */
  thingInstanceName?: ThingInstanceName;
  /**
   * 是否弹出卡片
   */
  showCard?: boolean;
}

/**
 * 拓扑图连线
 */
export interface TopoLine {
  /**
   * 拓扑图连线实体
   */
  topoLineEntity: TopoLineEntity;
  /**
   * 属性列表
   */
  topoElementPropertyEntityList: Property[];
};

/**
 * 图片列表
 */
export interface Images {
  /**
   * 待机未上电
   */
  powerOffImage: string;
  /**
   * 正在运行
   */
  runImage: string;
  /**
   * 异常报警
   */
  alarmImage: string;
  /**
   * 上电就绪
   */
  powerOnImage: string;
}

/**
 * 拓扑图详情
 */
export interface Detail {
  /**
   * 转换关系
   */
  thingCodeAndStateImageMap?: Record<ThingCode, Images>,
  /**
   * 拓扑图基本信息
   */
  topoMapEntity: TopoMap;
  /**
   * 拓扑图物实例数组
   */
  topoNodeList: TopoNodeEntity[];
  /**
   * 拓扑图连线数组
   */
  topoLineList: TopoLineEntity[];
}

/**
 * 拓扑图列表接口（拓扑图列表查询）
 * @access http://192.168.5.66:3333/project/329/interface/api/11597
 */
export const getList = (fc: FunctionCode) => instance.get<TopoMap[]>(path`getList/${fc}`);

/**
 * 拓扑图查询接口（拓扑图单点查询）
 * @access http://192.168.5.66:3333/project/329/interface/api/11603
 */
export const findById = (id: string) => instance.get<Detail>(path`findById/${id}`);

/**
 * 新增拓扑图保存基础信息
 * @access http://192.168.5.66:3333/project/329/interface/api/11729
 * @return data ID {string}
 */
export const add = (data) => instance.post<string>(path`add`, data);

/**
 * 拓扑图删除
 * @access http://192.168.5.66:3333/project/329/interface/api/11621
 */
export const remove = (id: string) => instance.delete<boolean>(path`remove/${id}`);

/**
 * 拓扑图保存全部信息
 * @access http://192.168.5.66:3333/project/329/interface/api/11615
 */
export const saveAll = (data: Detail) => instance.post<boolean>(path`saveAll`, data);

/**
 * 获取物实例树
 * @access http://192.168.5.66:3333/project/329/interface/api/12179
 */
export const findTree = (functionCode: string, fuzzyQuery: string = '') => instance.post(path`findTree`, {
  functionCode,
  fuzzyQuery,
});

/**
 * 查询拓扑图事件属性集合列
 * @access http://192.168.5.66:3333/project/329/interface/api/12185
 */
export const findEventListByThingCode = (thingCode: string) => instance.post(path`findEventListByThingCode`, {}, {
  params: {
    thingCode,
  },
});

/**
 * 保存拓扑图弹窗属性勾选
 * @access http://192.168.5.66:3333/project/329/interface/api/12719
 */
export const saveEventListByThingCode = (list) => instance.post(path`saveEventListByThingCode`, list);
