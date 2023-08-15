import { instance } from ".";

const flowChartApi = {
  // 获取所有流程图
  async getCreatedFlowList() {
    const res = await instance.get(`thing/v1/adapter/thing/inst/queryTopoMap`);
    return res;
  },
  // 删除
  async deleteFlowById(id: string) {
    const res = await instance.get(
      `/thing/v1/adapter/thing/inst/deleteTopoMap/${id}`
    );
    return res;
  },
  // 获取物实例列表
  async getThingList() {
    const res = await instance.get(
      `/thing/v1/adapter/thing/inst/topoInstsSimp`
    );
    return res;
  },
  // 获取物实例属性
  async getPropertyListByInstanceId(id: string) {
    const res = await instance.get(
      `/thing/v1/adapter/thing/inst/topoProperty/${id}`
    );
    return res;
  },
  // 获取单个的流程图
  async getSingleCreatedFlowList(id: any) {
    const res = await instance.get(
      `/thing/v1/adapter/thing/inst/querySelectTopoMap/${id}`
    );
    return res;
  },
  // 保存流程图
  async saveFlow(data: any) {
    const corpId = sessionStorage.getItem("corpId") ?? "1234";
    const res = await instance.post(
      "/thing/v1/adapter/thing/inst/saveTopoMap",
      {
        corpId,
        ...data,
      }
    );
    return res;
  },
  // 获取拓扑图实例上下游
  async getRelationTopoMap(data: any) {
    const res = await instance.post(
      "/thing/v1/adapter/thing/inst/relationTopoMap",
      data
    );
    return res;
  },
  // 获取单个设备信息
  async getThingByIds(ids: any) {
    const res = await instance.post(
      `/thing/v1/adapter/thing/common/findByIds?ids=${ids}`
    );
    return res;
  },
  // 获取设备历史数据
  async getFindTopoByIds(ids: string, startTime: string, endTime: string) {
    const res = await instance.post(
      `/thing/v1/adapter/thing/inst/findTopoByIds?ids=${ids}&startTime=${startTime}&endTime=${endTime}`
    );
    return res;
  },
  // 获取单个设备视频
  async findZInstsByClass(aId: string, relaClass: string) {
    const res = await instance.get(
      `/thing/v1/adapter/thing/relation/findZInstsByClass/${aId}/${relaClass}`
    );
    return res;
  },
  // 保存设备关系
  async saveTopoRelation(data: any) {
    const res = await instance.post(
      `/thing/v1/adapter/thing/inst/saveAllTopoRelation`,
      data
    );
    return res;
  },
  // 存单个模型的属性
  async saveTopoThingProperty(data: any) {
    const res = await instance.post(
      `/thing/v1/adapter/thing/inst/saveTopoThingProperty`,
      data
    );
    return res;
  },
  // 查单个模型的属性
  async getTopoThingProperty(tc) {
    const res = await instance.get(
      `/thing/v1/adapter/thing/inst/topoThingProperty?code=${tc}`
    );
    return res;
  },
  // 存单个模型事件
  async saveTopoThingEvent(data) {
    const res = await instance.post(
      `/thing/v1/adapter/thing/inst/saveTopoThingEvent`,
      data
    );
    return res;
  },
  // 查单个模型事件
  async getTopoThingEvent(tc) {
    const res = await instance.get(
      `/thing/v1/adapter/thing/inst/topoThingEvent?code=${tc}`
    );
    return res;
  },
  // 存单个实例事件
  async saveTopoThingEventInst(data) {
    const res = await instance.post(
      `/thing/v1/adapter/thing/inst/saveTopoThingEventInst`,
      data
    );
    return res;
  },
  // 查单个实例事件
  async getTopoThingEventInst(instanceId) {
    const res = await instance.get(
      `/thing/v1/adapter/thing/inst/topoThingEventInst/${instanceId}`
    );
    return res;
  },
  async getEquipmentTree(keyword: string) {
    const res = await instance.post(
      `/thing/v1/adapter/thing/common/deviceFlow/findTree`,
      { fuzzyQuery: keyword }
    );
    return res;
  },
  // 获取预览设备数据
  async getDataList(data: Array<{ [key: string]: string }>) {
    const res = await instance.post(`/thing/v1/metric/data/getDataList`, data);
    return res;
  },
};

export default flowChartApi;
