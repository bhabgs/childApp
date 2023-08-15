import * as G2 from '@antv/g2';

class createInstance {
  constructor(opt) {}
}
const instance = new createInstance({
  baseURL: "/api/",
  timeout: 2000
});

// 把对象转换成url参数
const paramsToString = obj => {
  let arr = [];
  for (let objKey in obj) {
    arr.push(objKey + "=" + obj[objKey]);
  }
  return arr.join("&");
};
// 初始化请求头
const resetHeader = token => {
  const reqToken = token ?? sessionStorage.getItem("token");
  if (!reqToken) {
    throw new Error("没有token，不能获取");
  }
  const headers = {
    token: reqToken,
    "Content-Type": "application/json;charset=utf-8"
  };
  return headers;
};
// 过滤无用属性根据eventEnable
const filterDataByEventEnable = data => {
  for (let i of data.detailGroupList) {
    i.thingPropertyValueVoList = i.thingPropertyValueVoList.filter(item => item.eventEnable);
  }
  return data;
};
// 把数据转换成pointCode格式
const dataToPointCode = (data, pcs) => {
  const pointCodeRecord = {};
  for (let i in data) {
    pointCodeRecord[i] = {};
    if (!data[i]) continue;
    for (let j of data[i].detailGroupList) {
      for (let k of j.thingPropertyValueVoList) {
        if (pcs && pcs.length > 0) {
          if (pcs.includes(k.thingPropertyCode)) {
            pointCodeRecord[i][k.thingPropertyCode] = {
              pointCode: k.pointCode,
              value: k.value,
              unit: k.unit,
              groupName: j.groupName,
              thingPropertyId: k.thingPropertyId,
              thingPropertyInstId: k.thingPropertyInstId
            };
          }
        } else {
          pointCodeRecord[i][k.thingPropertyCode] = {
            pointCode: k.pointCode,
            value: k.value,
            unit: k.unit,
            groupName: j.groupName,
            thingPropertyId: k.thingPropertyId,
            thingPropertyInstId: k.thingPropertyInstId
          };
        }
      }
    }
  }
  return pointCodeRecord;
};
/**
 * @description 查询历史数据
 * @param params 请求参数
 */
var timeUnit;
(function (timeUnit) {})(timeUnit || (timeUnit = {}));
const getHistoryData = async params => {
  const resPromise = await fetch("/api/mtip/thing/v2/thingInst/queryHistoryData", {
    method: "POST",
    headers: resetHeader(undefined),
    body: JSON.stringify(params)
  });
  const res = await resPromise.json();
  return res.data;
};
/**
 * @description 创建设备实例详细信息查询任务
 * @param codes 设备实例code
 * @returns thingInstanceDetail 设备实例详细信息
 */
const createGetThingInstanceDetail = async (codes, params) => {
  const resPromise = await fetch("/api/mtip/thing/v2/thingInst/findByCodeList?" + paramsToString(params), {
    method: "POST",
    headers: resetHeader(params.token),
    body: JSON.stringify(codes)
  });
  const refhCodes = {};
  const res = await resPromise.json();
  if (!res.data) return refhCodes;
  for (let i of codes) {
    refhCodes[i] = null;
    for (let instance of res.data) {
      if (instance.thingInstEntity.code === i) {
        for (let n of instance.detailGroupList) {
          for (let m of n.thingPropertyValueVoList) {
            refhCodes[i] = !filterDataByEventEnable ? instance : filterDataByEventEnable(instance);
          }
        }
      }
    }
  }
  return refhCodes;
};
/**
 * @description 创建设备状态查询 任务
 * @param code 设备实例code
 */
const createGetThingInstanceStatus = async (code, params) => {
  const instanceDetail = await createGetThingInstanceDetail(code, params);
  return () => {
    const state = "DEVICE_STATE";
    for (let i in instanceDetail) {
      if (instanceDetail[i]) {
        for (let j of instanceDetail[i].detailGroupList) {
          for (let k of j.thingPropertyValueVoList) {
            if (k.thingPropertyCode === state) {
              console.log(k);
            }
          }
        }
      }
    }
  };
};
/**
 * @description  根据PC 过滤物实例属性信息
 * @param codes 设备实例code
 * @param pcs 设备实例属性code
 */
const createFilterThingInstanceDetailByPc = async (codes, pcs) => {};
/**
 * @description 创建历史数据查询任务
 * @param codes 设备实例code
 * @param pcs 设备实例属性code
 * @param startTime 开始时间
 * @param endTime 结束时间
 * @param interval 间隔时间
 * @param params 请求参数
 * @returns 历史数据
 */
const createGetHistoryData = async (codes, pcs, params) => {
  const data = await createGetThingInstanceDetail(codes, params);
  const instanceData = dataToPointCode(data, pcs);
  // 组装成无模型历史数据接口可用数据
  const requestPrePointVoList = [];
  for (let i in instanceData) {
    for (let j in instanceData[i]) {
      if (instanceData[i][j].pointCode) {
        requestPrePointVoList.push({
          pointCode: instanceData[i][j].pointCode,
          thingPropertyId: instanceData[i][j].thingPropertyId,
          thingPropertyInstId: instanceData[i][j].thingPropertyInstId
        });
      }
    }
  }
  return async (startTime, endTime, downsample) => {
    const historyData = await getHistoryData({
      requestPrePointVoList,
      startTime,
      endTime,
      downsample
    });
    // 根据
    for (let i of historyData) {
      for (let j in instanceData) {
        for (let k in instanceData[j]) {
          if (i.pointCode === instanceData[j][k].pointCode) {
            instanceData[j][k].historyDataList = i.historyDataList;
          }
        }
      }
    }
    return instanceData;
  };
};

var thing = /*#__PURE__*/Object.freeze({
    __proto__: null,
    createFilterThingInstanceDetailByPc: createFilterThingInstanceDetailByPc,
    createGetHistoryData: createGetHistoryData,
    createGetThingInstanceDetail: createGetThingInstanceDetail,
    createGetThingInstanceStatus: createGetThingInstanceStatus,
    dataToPointCode: dataToPointCode,
    filterDataByEventEnable: filterDataByEventEnable,
    getHistoryData: getHistoryData,
    resetHeader: resetHeader,
    get timeUnit () { return timeUnit; }
});

const clientUtils = {
  http: {
    createInstance,
    instance
  },
  G2,
  thing
};

export { clientUtils as default };
