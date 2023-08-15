import { instance } from ".";

const VideoApi = {
  // 获取所有流程图
  async getVideoSelect() {
    const res = await instance.get(`/vms/v1/cameraGroupType/findAll`);
    return res;
  },
  async getVideoTree(params: { uuid: any; cameraName: any }) {
    const res = await instance.get(`/vms/v1/cameraGroup/tree`, {
      params: { groupTypeUuid: params.uuid, cameraName: params.cameraName },
    });
    return res;
  },
};

export default VideoApi;
