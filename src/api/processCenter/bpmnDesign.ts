// 流程设计
import instance from "..";

/**
 * 获取类别树结构数据
 * 根据条件查询 流程发布定义表 记录
 */
export const findPageByCondition = (data?: any) =>
  instance.post("/nworkflow/v1/deploy/findPageByCondition", data);

/**
 * 保存（创建或更新） 流程发布定义表 记录
 */
export const deploySave = (data?: any) =>
  instance.post("/nworkflow/v1/deploy/save", data);

/**
 * 调整流程的启用，停用情况
 */
export const modifyEnabled = (data?: any) =>
  instance.post("/nworkflow/v1/deploy/modifyEnabled", data);

/**
 * 发布
 * 部署流程
 */
export const deployProcess = (data?: any) =>
  instance.post("/nworkflow/v1/deploy/deployProcess", data);

/**
 * 调整已发布流程的使用中情况
 */
export const modifyBeingUsed = (data?: any) =>
  instance.post("/nworkflow/v1/deploy/modifyBeingUsed", data);

/**
 * 获取 流程发布定义表 记录
 */
export const findById = (processDefinitionId: string) =>
  instance.get(`/nworkflow/v1/deploy/findById/${processDefinitionId}`);

/**
 * 流程删除
 * 删除 流程发布定义表 记录
 */
export const deployRemove = (oid: string) =>
  instance.delete(`/nworkflow/v1/deploy/remove/${oid}`);
