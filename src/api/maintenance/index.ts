import instance from "..";

export interface ClusterInstInfo {
  atHost: string;
  binName: string;
  deployDt: Date["getTime"];
  instCode: string;
  instName: string;
  runStatus: string;
}
export const getClusterInfo = async () => {
  return await instance.get<{
    versionName: string;
    comInstList: Array<ClusterInstInfo>;
  }>("/rdopm/v1/clusterInfo");
};

/**
 * @description 获取更新包列表
 * @param params
 * @returns
 */
export const deploy = async (
  params: {
    versionName: string;
    useCacheOnly: boolean;
    diffOnly: boolean;
  },
  body?: any
) => {
  // 把参数拼接到url上
  const url = `/rdopm/v1/deploy?versionName=${params.versionName}&useCacheOnly=${params.useCacheOnly}&diffOnly=${params.diffOnly}`;
  return await instance.post(url, body);
};

export const getVersions = async () => {
  return await instance.get("/rdopm/v1/deploy/availablePacks");
};

// 部署状态
export const getDeployStatus = async () => {
  return await instance.get(`/rdopm/v1/deploy/status`);
};

// 查看版本详情
export const getVersionDetail = async (versionName: string) => {
  return await instance.get(
    `/rdopm/v1/deploy/versionReleaseNotes?versionName=${versionName}`
  );
};

// 取消更新
export const cancelDeploy = async () => {
  return await instance.post(`/rdopm/v1/deploy/cancel`);
};
