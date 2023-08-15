// 逻辑管理
import instance from "..";

/**
 * 分页获取逻辑列表
 */
export const getLogicByPage = (params: any) =>
  instance.get("/appCenter/v1/global/getScripts", { params });

/**
 * 根据id查询逻辑详情
 */
export const getLogicDetailById = (id: string) =>
  instance.get("/appCenter/v1/global/getScriptById", {
    params: { scriptId: id },
  });

/**
 * 用应用id查脚本列表
 * @param appId 应用id
 */
export const getLogicListByAppId = (appId: string) =>
  instance.get(`/appCenter/v1/global/getScriptByAppId/appId/${appId}`);

/**
 * 获取逻辑分类
 */
export const getScopeList = () =>
  instance.get("/appCenter/v1/global/getScopeItems");

/**
 * 新增逻辑
 */
export const insertLogic = (data: any) =>
  instance.post("/appCenter/v1/global/createScriptByApp", data);

/**
 * 更新逻辑
 */
export const updateLogic = (data: any) =>
  instance.post("/appCenter/v1/global/updateScriptById", data);

/**
 * 根据id删除逻辑
 */
export const deleteLogicById = (id: string) =>
  instance.get("/appCenter/v1/global/deleteScriptById", {
    params: { scriptId: id },
  });
