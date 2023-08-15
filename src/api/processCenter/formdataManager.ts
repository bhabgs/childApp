import instance from "..";

// 分类树
/**
 * 获取类别树结构数据
 * 根据条件查询 标准表单项分类定义表 记录
 */
export const getCategoryTree = (data?: any) =>
  instance.post(
    "/nworkflow/v1/base/defStandardFormItemCategory/findTreeByCorp",
    data
  );

/**
 * 删除类别树节点
 * 删除 标准表单项分类定义表 记录
 */
export const categoryRemove = (oid: string) =>
  instance.delete(
    `/nworkflow/v1/base/defStandardFormItemCategory/remove/${oid}`
  );

/**
 * 类别更新
 * 保存（创建或更新） 标准表单项分类定义表 记录
 */
export const categorySave = (data?: any) =>
  instance.post("/nworkflow/v1/base/defStandardFormItemCategory/save", data);

// 表单字段管理
/**
 * 字段类型 查要求
 * 根据条件查询 标准表单项显示类型与要求条目关系表 记录
 */
export const findListByDisplayType = (data?: any) =>
  instance.post(
    "/nworkflow/v1/base/refStandardDisplayTypeAndOption/findListByDisplayType",
    data
  );

/**
 * 所有字段类型的要求
 * 查询 标准表单项显示类型与要求条目关系表 记录
 */
export const findAllList = (data?: any) =>
  instance.post(
    "/nworkflow/v1/base/refStandardDisplayTypeAndOption/findAll",
    data
  );

/**
 * 表单字段列表
 * 根据条件查询 标准表单项定义表 记录
 */
export const findPageByCategoryAndName = (data?: any) =>
  instance.post(
    "/nworkflow/v1/base/defStandardFormItem/findPageByCategoryAndName",
    data
  );

/**
 * 获取 标准表单项定义表 记录
 */
export const findById = (oid: string) =>
  instance.get(`/nworkflow/v1/base/defStandardFormItem/findById/${oid}`);

/**
 * 表单字段删除
 * 删除 标准表单项定义表 记录
 */
export const formItemRemove = (oid: string) =>
  instance.delete(`/nworkflow/v1/base/defStandardFormItem/remove/${oid}`);

/**
 * 保存表单字段
 * 保存（创建或更新） 标准表单项定义表 记录
 */
export const standardFormItemSave = (data?: any) =>
  instance.post("/nworkflow/v1/base/defStandardFormItem/save", data);
