import instance from "..";

interface SystemAndEquipmentTreeItem {
  children: Array<SystemAndEquipmentTreeItem>;
  ic: string;
  img: string;
  instanceName: string;
  iu: string;
  parentInstanceId: string;
  sort: number;
  tc: string;
  thingType: string;
}
// 查询系统及设备树（生产系统、IT系统）
export const getSystemAndEquipmentTree = async () => {
  const res = await instance.get<Array<SystemAndEquipmentTreeItem>>(
    `/mtip/thing/v2/thingInstance/getSystemAndEquipmentTree`
  );
  return res;
};

// 设备的详细信息
export interface EquipmentInfo {}
// 获取设备的详细信息
export const getEquipmentDetail = async (id: string) => {
  const res = await instance.get<EquipmentInfo>(
    `/mtip/thing/v2/thingInstance/getById/${id}`
  );
  return res;
};

interface EquipmentProperty {}
// 查询拓扑图元素属性 #5
export const getTopoMapElementProptype = async (id: string) => {
  const res = await instance.get<EquipmentProperty>(
    `/mtip/thing/v2/topoMap/getTopoMapElementProptype/${id}`
  );
  return res;
};

// 保存拓扑图元素属性配置 #6
export const saveTopoMapElementConfig = async (data: EquipmentProperty) => {
  const res = await instance.post(
    `/mtip/thing/v2/topoMap/saveTopoMapElementConfig`,
    data
  );
  return res;
};
// 保存拓扑图元素属性配置到通用配置 #7

export const saveTopoMapElementConfigToCommon = (data) => instance.post('/mtip/thing/v2/topoElementProperty/saveTopoMapElementConfigToCommon', data);

// 读取拓扑图元素属通用配置 #8
export const getTopoMapElementProptypeTemplate = (id) => instance.get(`/mtip/thing/v2/topoElementProperty/getTopoMapElementProptypeTemplate/${id}`);