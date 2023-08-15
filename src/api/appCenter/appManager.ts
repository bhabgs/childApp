import instance from "..";

/**
 * 获取分组列表
 */
export const getGroupList = () => instance.get("/appCenter/v1/getAllAppGroup");

/**
 * 新增分组
 */
export const insertGroup = (data: any) =>
  instance.post("/appCenter/v1/addAppGroup", data);

// export const deleteGroupById = (id: string) => instance.

/**
 * 查询所有app列表
 */
export const getAllAppList = (params: any = {}) =>
  instance.post("/appCenter/v1/getAllApp", {
    page: 1,
    limit: 999,
    ...params,
  });

// export const deleteAppById = (id: string | number) => instance.post.

/**
 * 获取应用详情/页面配置
 */
export const getAppDetail = (data: any) =>
  instance.post("/appCenter/v1/findByCurrentPage", data);

/**
 * 获取应用中未发布的页面列表
 * @param id 应用id
 */
export const getUnreleasePageByAppId = (id: string) =>
  instance.get(`/appCenter/v1/findUnpublishedPageByApp/${id}`);

/**
 * 添加应用
 */
export const insertApp = (data: any) =>
  instance.post("/appCenter/v1/addApp", data);

/**
 * 保存应用
 */
export const saveAppConf = (data: any) =>
  instance.post("/appCenter/v1/appSave", data);

/**
 * 发布应用
 * @param appId 应用id
 */
export const releaseApp = (appId) =>
  instance.get(`/appCenter/v1/addRelease/${appId}`);

/**
 * 启动停止重启应用
 */
export const excuteAppAction = (appId: string, state: number) =>
  instance.get("/appCenter/v1/editAppStatus", { params: { appId, state } });

/**
 * 查询应用的脚本列表
 * @param appId 应用id
 */
export const getAppScript = (appId: string) =>
  instance.get("/appCenter/v1/getScriptByApp", { params: { appId } });

/**
 * 通过脚本id获取详情
 * @param scriptId 脚本id
 */
export const getScriptById = (scriptId: string) =>
  instance.get("/appCenter/v1/getScriptById", { params: { scriptId } });

/**
 * 新增应用脚本
 */
export const insertAppScript = (data: any) =>
  instance.post("/appCenter/v1/createScriptByApp", data);

/**
 * 更新脚本
 */
export const updateAppScript = (data: any) =>
  instance.post("/appCenter/v1/updateScriptById", data);

/**
 * 脚本排序
 */
export const sortAppScript = (params: any) =>
  instance.get("/appCenter/v1/sortScript", { params });

/**
 * 删除脚本
 * @param scriptId 脚本id
 */
export const deleteAppScript = (scriptId: string) =>
  instance.get("/appCenter/v1/deleteScriptById", { params: { scriptId } });

/**
 * 执行脚本
 */
export const excuteScript = (data: any) =>
  instance.post("/appCenter/v1/executeScript", data, {
    headers: { noAlert: true },
  });

/**
 * 发布页面
 */
export const releasePage = (pageId: string) =>
  instance.post(`/appCenter/v1/pageRelease/${pageId}`);

// 添加应用页面
export const addAppPage = (data: any) =>
  instance.post("/appCenter/v1/addPage", data);

// 获取页面详细信息
export const getPageDetail = (id: string) =>
  instance.post(`/appCenter/v1/getInstByPageId/${id}`);
// 保存appcener page
export const savePage = async (params) => {
  const res = await instance.post("/appCenter/v1/savePage", params);
};

// 删除页面
export const deletePage = async (ids: Array<string>) => {
  const res = await instance.post(`/appCenter/v1/deleteAppPage`, ids);
};

// 删除应用
export const deleteApp = async (ids: Array<string>) => {
  const res = await instance.post(`/appCenter/v1/deleteApp`, ids);
};
