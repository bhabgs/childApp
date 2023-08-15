import { instance } from "..";
import { EquipmentInfo } from "./equipment";

// 设置点击设备是否弹窗 #9
interface showCard {
  thingInstanceId: string;
  visable: boolean;
}
export const setClickEquipmentIsDialog = async (data: showCard) => {
  const res = await instance.post(
    `/mtip/thing/v2/topoMap/setClickEquipmentIsDialog`,
    data
  );
  return res;
};

// 物实例属性查询接口（含标记是否拓扑显示） #10
type thingProptypeId = string;
interface ThingInstancePropertyItem {
  id: thingProptypeId;
  unit: string;
  value: string;
}
export const getThingInstanceProperty = async (id: string) => {
  const res = await instance.get<Array<ThingInstancePropertyItem>>(
    `/mtip/thing/v2/thingInstance/getThingInstanceProperty/${id}`
  );
  return res;
};

// 物实例属性保存接口（含标记是否拓扑显示） #11
export const saveThingInstanceProperty = async (
  data: Array<thingProptypeId>
) => {
  const res = await instance.post(
    `/mtip/thing/v2/thingInstance/saveThingInstanceProperty`,
    data
  );
  return res;
};

// 物模型属性保存接口（含标记是否拓扑显示） #12
export const saveThingModelProperty = async (data: Array<thingProptypeId>) => {
  const res = await instance.post(
    `/mtip/thing/v2/thingInstance/saveThingModelProperty`,
    data
  );
  return res;
};

// 物模型属性查询接口（含标记是否拓扑显示） #13
export const getThingModelProperty = async (id: string) => {
  const res = await instance.get<Array<ThingInstancePropertyItem>>(
    `/mtip/thing/v2/thingInstance/getThingModelProperty/${id}`
  );
  return res;
};

// 通过批量的属性实例ID查询属性值（状态点和属性值）     #14
export const getPropertyValueByPropertyIds = async (
  data: Array<thingProptypeId>
) => {
  const res = await instance.post<Array<ThingInstancePropertyItem>>(
    `/mtip/thing/v2/thingInstance/getPropertyValueByPropertyIds`,
    data
  );
  return res;
};

// 通过物实例ID查询全部拓扑弹出物实例属性（弹出页使用） #15
export const getThingInstancePropertyByThingId = async (id: string) => {
  const res = await instance.get<EquipmentInfo>(
    `/mtip/thing/v2/thingInstance/getThingInstancePropertyByThingId/${id}`
  );
  return res;
};

// 实在不确定用哪个，我先写下边

export const getModelProperty = (id) => instance.get(`/mtip/thing/v2/topoElementProperty/getTopoMapElementProptype/${id}`);
