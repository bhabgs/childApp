import { instance } from "..";

interface DefaultItem {
  style?: JSON;
  createUser?: string | null;
  createTime?: string | null;
  updateUser?: string | null;
  updateTime?: string | null;
}
type lineType = "topo" | "shape" | "thing" | "textarea";
type nodeType = "node" | "process" | "device" | "pipeline" | "logicline";
export interface topoNodeEntity extends DefaultItem {
  id: string;
  mapId: string;
  type: string;
  thingCode: string;
  thingInstanceId: string;
  thingInstanceName: string;
  showCard: boolean;
}
export interface topoElementPropertyEntity extends DefaultItem {
  id: string;
  elementType: string;
  elementId: string;
  thingCode: string;
  thingPropertyId: string;
}
export interface TopoNode {
  topoNodeEntity: topoNodeEntity;
  topoElementPropertyEntity: topoElementPropertyEntity | null;
}

export interface topoLineEntity extends DefaultItem {
  id: string;
  mapId: string;
  type: string;
  aNodeId: string;
  zNodeId: string;
  thingCode: string;
  thingInstanceId: string;
  thingInstanceName: string;
  flowThingCode: string;
}
export interface TopoLine extends DefaultItem {
  topoElementPropertyEntity: topoElementPropertyEntity;
  topoLineEntity: topoLineEntity;
}
// mapId: string;
//   type: lineType;
//   aNodeId?: string;
//   zNodeId?: string;
//   thingCode: string;
//   thingInstanceId: string;
//   thingInstanceName: string;
//   flowThingCode: string;
interface topoMap extends DefaultItem {
  id: string;
  functionCode: "process_connect" | "device_connect";
  title: string;
  image: string;
  cropId?: string;
  theme: "dark" | "light";
  figureDisplay?: boolean;
  legendDisplay?: boolean;
  balanceDisplay?: boolean;
  remark?: string;
  nodes?: Array<TopoNode>;
  lines?: Array<TopoLine>;
}

// 创建流程图
// export const createFlow = async (data: Omit<topoMap, "nodes" | "lines">) => {
//   const res = await instance.post(`/mtip/thing/v2/topoMap/add`, data);
//   return res;
// };
export const createFlow = () => instance.post('/mtip/thing/v2/topoMap/add', {});

// 保存更新流程图所有信息
export const saveFlow = async (data: {
  topoMapEntity: topoMap;
  topoLineList: Array<TopoLine>;
  topoNodeList: Array<TopoNode>;
}) => {
  const res = await instance.post(`/mtip/thing/v2/topoMap/saveAll`, data);
  return res;
};

// 删除流程图
export const flowRemoveById = async (id: string) => {
  const res = await instance.delete(`/mtip/thing/v2/topoMap/remove/${id}`);
  return res;
};
// 更新流程图
export const flowUpdateById = async (data: topoMap) => {
  const res = await instance.put(`/mtip/thing/v2/topoMap/updateById`, data);
  return res;
};
// 查询流程图
export const flowGetById = async (id: string) => {
  const res = await instance.get<{
    topoMapEntity: topoMap;
    topoLineList: Array<TopoLine>;
    topoNodeList: Array<TopoNode>;
  }>(`/mtip/thing/v2/topoMap/getOne/${id}`);
  return res;
};
// 获取所有流程图
export const getCreatedFlowListV2 = async () => {
  const res = await instance.get<Array<topoMap>>(
    `/mtip/thing/v2/topoMap/getList/device_connect`
  );
  return res;
};

// 获取所有工艺流程图
export const getCreatedProcessListV2 = async () => {
  const res = await instance.get<Array<topoMap>>(
    `/mtip/thing/v2/topoMap/getList/process_connect`
  );
  return res;
};

//
export const uploadChartImg = async (file: File) => {
  const res = await instance.post(
    `/mtip/thing/v2/thing/uploadImage`,
    {
      file,
    },
    {
      headers: {
        "content-type": "multipart/form-data",
      },
    }
  );
  return res;
};
