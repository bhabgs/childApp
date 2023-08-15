import instance from "..";

/* bpmnCenter */

// 表单模板
/**
 * 表单模板列表
 * 获根据条件查询 表单模板定义表 记录
 * {
	"argCategoryIdList":["0", "1612633287030296578"],
	"argName":"%单模板%",
	"asDesc":false,
	"pageNum":1,
	"pageSize":10
}
 */
export const templateList = (data: any) =>
  instance.post(
    "/nworkflow/v1/base/defFormTemplate/findPageByCategoryAndName",
    data
  );

/**
 * 保存表单模板字段
 * 保存（创建或更新） 表单模板定义表 记录
 */
export const defFormTemplateSave = (data: any) =>
  instance.post("/nworkflow/v1/base/defFormTemplate/save", data);

/**
 * 删除 表单模板定义表 记录
 */
export const templateDel = (oid: string) =>
  instance.delete(`/nworkflow/v1/base/defFormTemplate/remove/${oid}`);

/**
 * 获取 表单模板定义表 记录
 */
export const templateFindById = (oid: string) =>
  instance.get(`/nworkflow/v1/base/defFormTemplate/findById/${oid}`);
