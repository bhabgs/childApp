// 参数管理
import instance from "..";

/**
 * 根据应用id获取参数组的树
 * @param appId 应用id
 */
export const getParamTreeByAppId = (appId: string) =>
  instance.get("/common/v1/param/group/getTreeByAppId", { params: { appId } });

/**
 * 添加参数组
 */
export const insetParamGroup = (data: any) =>
  instance.post("/common/v1/param/group/add", data);

/**
 * 更新参数组
 */
export const updateParamGroup = (data) =>
  instance.post("/common/v1/param/group/update", data);

/**
 * 删除参数组
 * @param groupId 参数组id
 */
export const deleteParamGroup = (groupId: number) =>
  instance.post("/common/v1/param/group/delete", [groupId]);

/**
 * 导入参数
 */
export const importParam = (data: FormData) =>
  instance.post("/common/v1/param/import", data, {
    headers: { "content-type": "multipart/form-data" },
  });

/**
 * 导出全部参数
 */
export const exportAllParam = (params: any) =>
  instance.post(
    "/common/v1/param/export",
    {},
    { params, responseType: "blob" }
  );

/**
 * 获取参数组的参数定义列表
 */
export const getParamListByGroupId = (data: any) =>
  instance.post("/common/v1/param/group/getGroupInfo", data);

/**
 * 获取参数组特定类型的参数定义列表
 */
export const getParamListByGroupIdAndType = (data: any) =>
  instance.post("/common/v1/param/define/list", data);

/**
 * 添加参数定义
 */
export const insetParamDef = (data: any) =>
  instance.post("/common/v1/param/define/add", data);

/**
 * 更新参数定义
 */
export const updateParamDef = (data: any) =>
  instance.post("/common/v1/param/define/update", data);

/**
 * 删除参数
 * @param defId 参数定义id
 */
export const deleteParamDef = (defId: string) =>
  instance.post("/common/v1/param/define/delete", [defId]);
