import instance from '.';
import { THING_ROOT } from '@/views/thingManager/thingInstance/data';

/* 物模型管理 */

/**
 * 获取父级物模型
 */
export const findParentThing = () =>
  instance.get('/mtip/thing/v2/thing/findParentThing');

/**
 * 获取物模型列表-分页
 */
export const list = (data: any) =>
  instance.post('/mtip/thing/v2/thing/findPage', data);

/**
 * 获取物模型tree--findTree
 */
export const listTree = (root_thing_code?: string) =>
  instance.get(
    `/mtip/thing/v2/thing/findTree?root_thing_code=${
      root_thing_code || THING_ROOT
    }`
  );

/**
 * 修改物模型tree排序
 */
export const modifyTreeSort = (data: any) =>
  instance.post('/mtip/thing/v2/thing/modifyTreeSort', data);

/**
 * 根据thingCode获取物规格
 */
export const findByCode = (thingCode: string) =>
  instance.get(`/mtip/thing/v2/thing/findByCode?code=${thingCode}`);
// 删除
export const deleteThing = (thingCodeList: string[]) =>
  instance.delete(`/mtip/thing/v2/thing/remove`, { data: { thingCodeList } });
// 新增物模型
export const createModel = (data: any) =>
  instance.post(`/mtip/thing/v2/thing/create`, data);
// 更新物模型
export const updateModel = (data: any) =>
  instance.post(`/mtip/thing/v2/thing/modify`, data);

// 校验物模型code是否重复
export const checkCode = (code) =>
  instance.get(`/mtip/thing/v2/thing/checkThingCodeUnused?thingCode=${code}`);

//获取物理表名
export const getTableNameList = () => {
  let url = `/mtip/thing/v2/thing/getPhysicalStorageTables`;
  return instance.get(url);
};

//获取所属类型
export const getThingTypeList = () => {
  let url = `/mtip/thing/v2/dictionary/getThingTypeList`;
  return instance.post(url);
};
//同步云端模型
export const synCloudModel = (data: string[]) => {
  let url = `/mtip/thing/v2/synchronization/client/synchronize`;
  return instance.post(url, data, {
    timeout: 1000 * 600,
  });
};
// }
//重新加载物模型缓存
export const reloadThingCache = () => {
  let url = `/mtip/thing/v2/thing/reloadThingCache`;
  return instance.get(url);
};

/**
 * 物属性
 */

//属性分组查询
export const thingGroupTypeList = () =>
  instance.post(`/mtip/thing/v2/dictionary/getThingGroupTypeList`);

//属性分组新增
export const addThingGroup = (name: string) =>
  instance.post(`/mtip/thing/v2/dictionary/addThingGroupType?name=${name}`);

//根据thingCode查询list
export const findPropByCode = (thingCode: string) =>
  instance.get(
    `/mtip/thing/v2/thing/findThingPropertiesByThingCode?thingCode=${thingCode}`
  );
//删除
export const removeAttr = (id: string) =>
  instance.delete(`/mtip/thing/v2/thing/removeThingPropertyById/${id}`);
//创建or更新
export const updateAttr = (data: any) =>
  instance.post(`/mtip/thing/v2/thing/createThingProperty`, data);

export const alarmList = (data: any) =>
  instance.post(`/mtip/thing/v2/thingStandardProperty/findPage`, data);

// 校验属性code是否重复
export const checkCodeAttr = (thingCode: string, code: string, id: string) => {
  const url = `/mtip/thing/v2/thing/checkThingPropertyCodeUnused?thingCode=${thingCode}&propertyCode=${code}&propertyId=${
    id || 0
  }`;
  return instance.get(url);
};

//获取数据库下拉列表
export const getDataBankList = (thingCode: string, propertyCode?: string) => {
  let url = `mtip/thing/v2/thing/getUnusedColumnByThingCodeAndPropertyCode?thingCode=${thingCode}&propertyCode=${propertyCode}`;
  return instance.get(url);
};
// 物属性详情
export const getAttrInfo = (id: string) =>
  instance.get(`/mtip/thing/v2/thing/findThingPropertyById?id=${id}`);
// 物属性排序
export const sortAttr = (data: any) =>
  instance.post(`/mtip/thing/v2/thing/sortThingPropertyGroupList`, data);
// 物属性复制
export const copyThingProperty = (data: any) =>
  instance.post(`/mtip/thing/v2/thing/copyThingProperty2OtherThing`, data);

// 【物属性】关系属性-关系
export const getThingPropertyRelationList = (thingCode: string) =>
  instance.get(
    `/mtip/thing/v2/thing/getThingPropertyRelationIdList?thingCode=${thingCode}`
  );

/**
 * 物关系
 */
export const findRelationByCode = (athingCode: string) =>
  instance.get(
    `/mtip/thing/v2/thing/findThingRelationsByThingCode?thingCode=${athingCode}`
  );
//删除
export const removeRela = (id: string) =>
  instance.delete(`/mtip/thing/v2/thing/removeThingRelationById?id=${id}`);
// 更新
export const updateRela = (data: any) =>
  instance.post(`/mtip/thing/v2/thing/modifyThingRelation`, data);
// 创建;
export const createRela = (data: any) =>
  instance.post(`/mtip/thing/v2/thing/createThingRelation`, data);
//获取类目数据
export const categoryList = (industryCode: string) =>
  instance.post(
    `/mtip/thing/v2/catalog/findByIndustryCode?code=root_catalog&industryCode=${industryCode}`
  );

// 获取行业list
export const industryList = (data: any) =>
  instance.post(`/mtip/thing/v2/industry/findPage`, data);

//获取z模型
export const zthingList = (type: string, thingCode?: string) => {
  let url = '';
  switch (type) {
    case 'extends':
      url =
        '/mtip/thing/v2/thing/getThingListForExtendByThingCode?thingCode=' +
        thingCode;
      break;
    case 'contain':
      url =
        '/mtip/thing/v2/thing/getThingNameCodeListForContainByThingCode?thingCode=' +
        thingCode;
      break;
    case 'relation':
      url =
        '/mtip/thing/v2/thing/getThingNameCodeListForAssociatedByThingCode?thingCode=' +
        thingCode;
      break;
    default:
      break;
  }
  return instance.get(url);
};

// 获取属性列名
export const thingNameList = (code) =>
  instance.get(
    `/mtip/thing/v2/thing/getEndsWithIdPropertiesByTableName/${code}`
  );

export const thingNameListByTable = (table: string) =>
  instance.get(
    `/mtip/thing/v2/thing/getEndsWithIdPropertiesByTableName?tableName=${table}`
  );
// 查所有关系表
export const relaTable = () =>
  instance.get(`/mtip/thing/v2/thing/getTablesForRelation`);
// 获取业务关系
export const relaByDic = (type: string) =>
  instance.get(
    `/mtip/thing/v2/thing/getRelationNameByRelationType?relationType=${type}`
  );

export const findRelaByClass = (code: string) =>
  instance.get(`/mtip/thing/v2/thing/getRelationByRelaClass?relaClass=${code}`);
// 上传图片
export const uploadCommon = (data, headers) =>
  instance.post(`/mtip/thing/v2/thing/uploadImage`, data, {
    headers,
  });
// 导入
export const importExcel = (data) =>
  instance.post(`/thing/v1/core/excelOpt/thing/importExcel`, data, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    timeout: 1000 * 360,
  });
// 导出全部
export const exportExcelTemplate = () =>
  instance.post(
    `/thing/v1/core/excelOpt/thing/exportExcelTemplate`,
    {},
    {
      responseType: 'blob',
      headers: {
        'Content-Disposition': 'attachment',
        'Content-Type': 'text/html;charset=UTF-8',
      },
      timeout: 1000 * 30,
    }
  );
// 下载模板
export const downExcelTemplate = () =>
  instance.post(
    `/thing/v1/core/excelOpt/thing/exportNullExcelTemplate`,
    {},
    {
      responseType: 'blob',
      headers: {
        'Content-Disposition': 'attachment',
        'Content-Type': 'text/html;charset=UTF-8',
      },
    }
  );

// 物模型】查询当前系统属于何种版本平台
export const getMtipMode = () =>
  instance.get(`/mtip/thing/v2/thing/getMtipMode`);

export default '';
