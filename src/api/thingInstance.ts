import instance from '.';

/* 物实例管理 */

/**
 * 获取物模型树
 */
export const findAllThingForTree = (thingType?: string) =>
  instance.get('/thing/v1/core/thing/findAllThingForTreeByTableName', {
    params: { thingType },
  });

/**
 * 获取物实例全部列表-分页
 */
export const indInstsAll = (data: any) =>
  instance.post('/thing/v1/adapter/thing/common/homeFindPage', data);

/**
 * 获取物实例列表-分页
 */
export const getInstanceList = (data: any) =>
  instance.post('/mtip/thing/v2/thingInst/findPage?functionCode=web', data);

/**
 * 根据thingCode获取物规格
 */
export const findByCode = (thingCode: string) =>
  instance.get(`/thing/v1/core/thing/findByCode/${thingCode}`);

/**
 * 根据thingCode查询属性
 */
export const findTypeProperties = (thingCode: string) =>
  instance.post(`thing/v1/core/thing/findTypeProperties/${thingCode}`);

/**
 * 查物实例详情
 */
export const findThingProperties = (id: string) =>
  instance.get(`/thing/v1/adapter/thing/common/findById/${id}`);

// 编辑
export const editThing = (data: any) =>
  instance.post(`/thing/v1/adapter/thing/common/modify`, data);

// prePointCode模糊搜索
export const prePointCodeByKeywords = (keyword: string) =>
  instance.get(
    `/thing/v1/adapter/thing/common/prePointCodeByKeywords/${keyword}`
  );

// 新增
export const addThing = (data: any) =>
  instance.post(`/thing/v1/adapter/thing/common/create`, data);

// 获取关系tab
// export const getTabs = (direction: string, thingCode: string) =>
//   instance.get(
//     `/thing/v1/core/relation/findGroupByDirection/${direction}/${thingCode}`
//   );

// 获取关系tab新
export const getTabs = (direction: string, thingCode: string) =>
  instance.get(
    `/thing/v1/core/relation/findGroupByDirection/${direction}/${thingCode}`
  );

// 新增关系
export const addRelation = (data: any) =>
  instance.post(`/thing/v1/adapter/thing/relation/create`, data);

// 删除关系
export const deleteRelation = (data: any) =>
  instance.post(`/thing/v1/adapter/thing/relation/delete`, data);

// 获取关系新
export const getRelationZ = (id: string, relaClass: string) =>
  instance.get(
    `/thing/v1/adapter/thing/relation/findZInstsByClass/${id}/${relaClass}`
  );
export const getRelationA = (id: string, relaClass: string) =>
  instance.get(
    `/thing/v1/adapter/thing/relation/findAInstsByClass/${id}/${relaClass}`
  );

// 获取关系
// export const getRelationZ = (id: string, thingCode: string) =>
//   instance.post(`/thing/v1/adapter/thing/relation/findZ`, {
//     zthingCode: thingCode,
//     instId: id,
//   });
// export const getRelationA = (id: string, thingCode: string) =>
//   instance.post(`/thing/v1/adapter/thing/relation/findA`, {
//     athingCode: thingCode,
//     instId: id,
//   });

// 根据条件查询物实例
export const findThingByParams = (data: any) =>
  instance.post(
    `/thing/v1/adapter/thing/common/simpleFindEntityAndThing`,
    data
  );

// 删除图片
export const removePicture = (data) => {
  return instance.post(`/thing/v1/adapter/thing/common/remove/picture`, data);
};

// 导入配点Excel
export const importExcel = (data, headers) =>
  instance.post(`/thing/v1/core/excelOpt/importExcel`, data, {
    headers,
    timeout: 60 * 1000,
  });

// 导出配点Excel
export const exportExcelTemplate = (data = {}) =>
  instance.post(`/thing/v1/core/excelOpt/exportExcelTemplate`, data, {
    responseType: 'blob',
    headers: {
      // "Content-Disposition": "attachment",
      // "Content-Type": "text/html;charset=UTF-8",
    },
    timeout: 60 * 1000,
  });

// 请求导出
export const requestExport = (data = {}) =>
  instance.post('/thing/v1/core/excelOpt/instance/requestExport', data);

// 轮询查下载内容状态
export const exportStatus = (requestId: string) =>
  instance.post(
    `/thing/v1/core/excelOpt/instance/exportStatus?requestId=${requestId}`
  );

// 下载物实例Excel
export const downloadThing = (requestId: string) =>
  instance.post(
    `/thing/v1/core/excelOpt/instance/download?requestId=${requestId}`,
    null,
    {
      responseType: 'blob',
      headers: {
        // "Content-Disposition": "attachment",
        // "Content-Type": "text/html;charset=UTF-8",
      },
      timeout: 30 * 1000,
    }
  );

// 导出全部Excel
export const exportPointExcelTemplate = (data = {}) =>
  instance.post(`/thing/v1/core/excelOpt/instance/exportExcelTemplate`, data, {
    responseType: 'blob',
    headers: {
      // "Content-Disposition": "attachment",
      // "Content-Type": "text/html;charset=UTF-8",
    },
    timeout: 60 * 1000,
  });

// 校验实例code是否重复
export const checkCode = (code) =>
  instance.post(`thing/v1/adapter/thing/common/checkCode`, { code });

// 校验两个物实例是否可以建立关系
export const checkCanSetRelation = (athingCode: string, zthingCode: string) =>
  instance.post('/thing/v1/adapter/thing/relation/findRelationByTwoThingCode', {
    athingCode,
    zthingCode,
  });

// 获取所有物实例和物实例之间的关系
export const getAllThingInstanceAndRelationship = (
  thingType: string,
  relaClass: string
) =>
  instance.post('/thing/v1/adapter/thing/relation/findInsRelation', null, {
    timeout: 0,
    params: { thingType, relaClass },
  });

// 输入数据类型 下拉
export const preDataType = () =>
  instance.get('/thing/v1/adapter/thing/common/preDataType');

//-------------------v2-----------------//

// 查物实例详情
export const getThingDetail = (params: any) =>
  instance.get(`mtip/thing/v2/thingInst/findById`, { params });
// 查物实例编辑
export const getThingEdit = (id?: string, thingCode?: string) => {
  const url = `/mtip/thing/v2/thingInst/findByIdModify?id=${id}&requestType=all&thingCode=${thingCode}&functionCode=web`;
  return instance.get(url);
};
// export const udpateThing = ()

// 新增实例获取相关信息
export const getThingPre = (thingCode: string) => {
  const url = `/mtip/thing/v2/thingInst/getThingAllProperties?requestType=all&thingCode=${thingCode}&functionCode=web`;
  return instance.get(url);
};

export const getInstanceByThingCode = (data: any) =>
  instance.post(
    '/thing/v1/adapter/thing/common/simpleFindEntityAndThing',
    data
  );

//【实例列表】-列表顶部查询条件
export const getQueryColumnByThingCode = (thingCode: string) => {
  const url = `/mtip/thing/v2/thingInst/getQueryColumns?thingCode=${thingCode}&functionCode=web`;
  return instance.get(url);
};

//【实例列表】-显示表头
export const getListPageTableColumnByThingCode = (thingCode: string) => {
  const url = `/mtip/thing/v2/thingInst/getListPageColumns?thingCode=${thingCode}&functionCode=web`;
  return instance.get(url);
};

// 导出Excel
export const exportData = (data = {}) =>
  instance.post(`/mtip/thing/v2/excel/thingInst/requestExport`, data);
export const downExportFile = (fileName: string) =>
  instance.post(
    `/mtip/thing/v2/excel/thingInst/download?requestId=${fileName}`,
    {},
    {
      responseType: 'blob',
      // headers: {
      //   'Content-Disposition': 'attachment',
      //   'Content-Type': 'text/html;charset=UTF-8',
      // },
      timeout: 60 * 1000,
    }
  );
export const getExportStatus = (fileName:string) =>
  instance.post(
    `/mtip/thing/v2/excel/thingInst/exportStatus?requestId=${fileName}`
  );
export const exportSelectedData = (thingCode: string, data = {}) =>
  instance.post(
    `/mtip/thing/v2/thingInst/exportSelectedData?thing_code=${thingCode}`,
    data,
    {
      responseType: 'blob',
      // headers: {
      //   'Content-Disposition': 'attachment',
      //   'Content-Type':
      //     'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      // },
      timeout: 60 * 1000,
    }
  );
//获得所有下拉框内容
export const getSelectOption = (thingCode: string, data: any) => {
  const url = `/mtip/thing/v2/thingInst/getSelectValues?thingCode=${thingCode}`;
  return instance.post(url, data);
};

// 删除
export const deleteThing = (data: any, thingCode: string) =>
  instance.delete(`/mtip/thing/v2/thingInst/remove?thingCode=${thingCode}`, {
    data,
  });

//批量读取动态属性值
export const getPropertiesValue = (data: any) => {
  const url = `/mtip/thing/v2/thingInst/reloadPropertiesValue`;
  return instance.post(url, data);
};
//下发PLC数据值
export const writePlcValue = (data: any) => {
  const url = `/mtip/thing/v2/thingInst/downloadPropertyValue`;
  return instance.post(url, data);
};
//报警投切
export const setAlarmValid = (data: any) => {
  const url = `/mtip/thing/v2/thingInst/setAlarmValid`;
  return instance.post(url, data);
};
//报警复位
export const resetAlarm = (data: any) => {
  const url = `/mtip/thing/v2/thingInst/resetAlarm`;
  return instance.post(url, data);
};
//新增实例
export const create = (data: any) => {
  const url = `/mtip/thing/v2/thingInst/create`;
  return instance.post(url, data);
};
//更新实例
export const modify = (data: any) => {
  const url = `/mtip/thing/v2/thingInst/modify`;
  return instance.post(url, data);
};

// 物实例上传图片
export const uploadCommon = (
  data: any,
  headers: any,
  thingCode: string,
  id?: string
) => {
  return instance.post(
    `/mtip/thing/v2/thingInst/uploadImage?thingCode=${thingCode}&id=${id}&abortPicture=''`,
    data,
    {
      headers,
      timeout: 30 * 1000,
    }
  );
};

// 关系list
export const findRelationList = (data: any) => {
  const url = `/mtip/thing/v2/thingInst/findRelationEntitiesPage?functionCode=web`;
  return instance.post(url, data);
};
///【实例编辑页】查找关系下所有实例
export const getRelationInstance = (data: any) => {
  const url = `/mtip/thing/v2/thingInst/getRelationByAInstance`;
  return instance.post(url, data);
};

///【实例编辑页】查找关系下所有实例
export const createRelation = (data: any) => {
  const url = `/mtip/thing/v2/thingInst/createRelationEntity`;
  return instance.post(url, data);
};

// 删除物模型关系
export const removeRelation = (data: any) => {
  const url = `/mtip/thing/v2/thingInst/removeRelationEntity`;
  return instance.delete(url, { data });
};

//获取报警规则列表：/api/alarmlite/v1/rule/getAllRule
export const getAllRule = (data: any) => {
  const url = `/alarmlite/v1/rule/getAllRule`;
  return instance.post(url, data);
};

//加载物实例属性信息
export const getThingPropertyInst = (data: any) => {
  const url = `/mtip/thing/v2/thingInst/getThingPropertyInstInfo`;
  return instance.post(url, data);
};

//保存物实例属性信息
export const saveThingPropertyInst = (data: any) => {
  const url = `/mtip/thing/v2/thingInst/saveThingPropertyInstInfo`;
  return instance.post(url, data);
};

//创建PRE_Point数据
export const createPointCode = (data: any) => {
  const url = `/mtip/thing/v2/thingInst/createPointByPointCode`;
  return instance.post(url, data);
};

export const createAlarmRule = (data: any) => {
  const url = '/mtip/thing/v2/thingInst/createAlarmRule';
  return instance.post(url, data);
};

// 物实例上传文件
export const uploadFile = (
  data: any,
  headers: any,
  thingCode: string,
  thingInstId?: string,
  thingPropertyId?: string
) => {
  return instance.post(
    `/mtip/thing/v2/thingInst/uploadThingInstFile?thingCode=${thingCode}&thingInstId=${thingInstId}&thingPropertyId=${thingPropertyId}`,
    data,
    {
      headers,
      timeout: 30 * 1000,
    }
  );
};
// 文件列表
export const getThingInstFiles = (data: any, params: any) =>
  instance.post(`/mtip/thing/v2/thingInst/getThingInstFiles`, data, { params });
// 文件下载
export const downloadThingInstFile = (id: string) =>
  instance.post(
    `/mtip/thing/v2/thingInst/downloadThingInstFile?thingInstFileId=${id}`,
    {},
    {
      responseType: 'blob',
      // headers: {
      //   'Content-Disposition': 'attachment',
      //   'Content-Type':
      //     'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      // },
      timeout: 60 * 1000,
    }
  );

// 批量导入模板
export const exportBlankTemplate = (data = {}) =>
  instance.post(`/mtip/thing/v2/excel/thingInst/exportBlankTemplate`, data, {
    responseType: 'blob',
    headers: {
      // "Content-Disposition": "attachment",
      // "Content-Type": "text/html;charset=UTF-8",
    },
    timeout: 60 * 1000,
  });

// 批量导入Excel
export const importPointExcel = (data, headers) =>
  instance.post(`/mtip/thing/v2/excel/thingInst/importExcel`, data, {
    headers,
    timeout: 180 * 1000,
  });
// 文件删除
export const removeThingInstFile = (id: string) =>
  instance.post(
    `/mtip/thing/v2/thingInst/removeThingInstFile?thingInstFileId=${id}`
  );

// 读取报警属性值
export const reloadAlarmsValue = (data: any[]) =>
  instance.post(`/mtip/thing/v2/thingInst/reloadAlarmsValue`, data);

// 读取报警属性值+logic
export const reloadLogicAndAlarm = (data: any) =>
  instance.post(`/mtip/thing/v2/thingInst/reloadLogicAndAlarm`, data);

// 查询点位历史数据接口
export const getPreHistoryData = (data: any) =>
  instance.post(`/mtip/thing/v2/thingInst/queryHistoryData`, data);
