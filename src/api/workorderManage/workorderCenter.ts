// 工单中心
import instance from "..";

/**
 * 查询全部分类
 * 查询(按processDefinitionKey合并)的流程定义
 */
export const findDistinctDefinitionKey = () =>
  instance.get(`/nworkflow/v1/deploy/findDistinctDefinitionKey/`);

/**
 * 登录用户待办任务列表
 */
export const toDoTaskList = (data?: any) =>
  instance.post("/nworkflow/v1/process/toDoTaskList", data);

/**
 * 工单池用户待办任务列表
 */
export const poolsToDoTaskList = (data?: any) =>
  instance.post("/nworkflow/v1/process/pools/toDoTaskList", data);

/**
 * 创建工单的保存
 * 启动流程
 */
export const startFlow = (data?: any) =>
  instance.post("/nworkflow/v1/process/startFlow", data);

/**
 * 查询工单当前节点的详情
 */
export const filterTaskById = (
  processDefinitionId: string,
  taskDefinitionKey: string
) =>
  instance.get(
    `/nworkflow/v1/deploy/filterTaskById/${processDefinitionId}/${taskDefinitionKey}`
  );

/**
 * 提交/完成任务
 */
export const completeTask = (data?: any) =>
  instance.post("/nworkflow/v1/process/completeTask", data);
