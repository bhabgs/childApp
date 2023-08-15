// 工单技能组
import instance from "..";

/**
 * 根据条件查询 流程技能组定义表 记录
 */
export const findListByName = (data?: any) =>
  instance.post(
    "/workflowable/v1/permission/defFlowSkillGroup/findListByName",
    data
  );

/**
 * 删除 流程技能组定义表 记录
 */
export const removeGroup = (oid: string) =>
  instance.delete(
    `/workflowable/v1/permission/defFlowSkillGroup/remove/${oid}`,
    { headers: { noAlert: true } }
  );

/**
 * 保存（创建或更新） 流程技能组定义表 记录
 */
export const groupSave = (data?: any) =>
  instance.post("/workflowable/v1/permission/defFlowSkillGroup/save", data);

/**
 * 获取 流程技能组成员定义表 记录
 */
export const findMemberById = (oid: string) =>
  instance.get(
    `/workflowable/v1/permission/defFlowSkillGroupMember/findById/${oid}`
  );

/**
 * 查询工单技能组人员
 * 保存（创建或更新） 流程技能组定义表 记录
 */
export const findMemberListByGroup = (data?: any) =>
  instance.post(
    "/workflowable/v1/permission/defFlowSkillGroupMember/findListByGroup",
    data
  );

/**
 * 获取组织部门树结构 带人
 */
export const getDepPeopleTreeList = (keyword?: string) =>
  instance.get("/common/v1/department/all/tree/org/user", {
    params: { keyword },
  });

/**
 * 查询工单技能组人员
 * 保存（创建或更新） 流程技能组定义表 记录
 */
export const memberSave = (data?: any) =>
  instance.post(
    "/workflowable/v1/permission/defFlowSkillGroupMember/save",
    data
  );

/**
 * 删除成员
 * 删除 流程技能组定义表 记录
 */
export const delMember = (oid: string) =>
  instance.delete(
    `/workflowable/v1/permission/defFlowSkillGroupMember/remove/${oid}`
  );
