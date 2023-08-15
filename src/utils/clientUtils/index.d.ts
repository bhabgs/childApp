import * as G2 from '@antv/g2';

declare class createInstance {
    constructor(opt: {
        baseURL?: string;
        timeout?: number;
        headers?: any;
    });
}

/**
 * pointCode 参数结构
 */
type historyDataList = {
    alarmFlag: boolean;
    formatValue: string;
    lastScanTIme: string;
    lastValue: number;
    originValue: number;
    prePointCode: string;
    saveTime: string;
    scanTIme: string;
    state: number;
};
type POINTCODE = {
    pointCode: string | null;
    value: string | null;
    unit: string | null;
    groupName: string | null;
    thingPropertyId?: string;
    thingPropertyInstId?: string;
    historyDataList?: Array<historyDataList>;
};
type detailGroupList = {
    /**
     * 设备详情组名称
     */
    groupName: string;
    /**
     * 设备详情组类型
     */
    groupType: string;
    /**
     * 设备详情组属性列表
     */
    thingPropertyValueVoList: Array<{
        alarmAvailable: Boolean;
        alarmId: string;
        colorTrans: string;
        colspan: number;
        displayType: string;
        displayValue: string;
        eventEnable: Boolean;
        /**
         * 属性label名称
         */
        label: string;
        /**
         * 属性长度
         */
        linkUrl: null;
        /**
         * 属性长度
         */
        listInfo: "";
        /**
         * 属性类型
         */
        listType: "";
        /**
         * 是否需要报警
         */
        needColorTrans: Boolean;
        /**
         * 是否需要跳转
         */
        needLink: Boolean;
        pointCode: null;
        pointCode2: null;
        /**
         * 属性类型
         */
        propertyType: string;
        /**
         * 刷新频率
         */
        refresh: null;
        /**
         * 关联属性code
         */
        relationThingCode: null;
        /**
         * 是否必填
         */
        selectRequest: Boolean;
        /**
         * 属性排序
         */
        sort: number;
        /**
         * 属性code
         */
        thingPropertyCode: string;
        /**
         * 属性id
         */
        thingPropertyId: string;
        /**
         * 属性实例id
         */
        thingPropertyInstId: null;
        /**
         * 属性名称
         */
        thingPropertyName: string;
        /**
         * 属性单位
         */
        unit: null;
        /**
         * 属性值
         */
        value: string | null;
    }>;
};
interface thingInstanceDetail {
    /**
     * 设备详情组
     */
    detailGroupList: Array<detailGroupList>;
    functionCode: "WEB";
    listPropertyList: any;
    /**
     * 物模型Code
     */
    thingCode: string;
    thingInstId: string;
    thingInstName: string;
    thingInstPhoto: string;
    thingName: string;
    /**
     * 设备实例
     */
    thingInstEntity: {
        catalogCode: string | null;
        code: string;
        createTime: string;
        createUser: string | null;
        id: string;
        name: string;
        photo: string;
        thingCode: string;
        updateTime: string;
        updateUser: string;
    };
}
interface RequestParams {
    token?: string;
    requestType: string | null;
    thingCode: string | null;
    functionCode: "web" | "topo";
}
declare const resetHeader: (token: string | undefined) => {
    token: string;
    "Content-Type": string;
};
declare const filterDataByEventEnable: (data: thingInstanceDetail) => thingInstanceDetail;
declare const dataToPointCode: (data: Record<string, thingInstanceDetail>, pcs?: Array<string>) => Record<string, Record<string, POINTCODE>>;
/**
 * @description 查询历史数据
 * @param params 请求参数
 */
declare enum timeUnit {
}
type requestPrePointVoList = {
    pointCode: string;
    thingPropertyId: string | null;
    thingPropertyInstId: string | null;
};
type Downsample = {
    timeNum: number;
    timeUnit: "SECOND" | "MINUTE" | "HOUR" | "DAY" | "WEEK" | "MONTH" | "YEAR";
    aggregator: "AVG" | "MIN" | "MAX" | "SUM" | "COUNT" | "FIRST" | "LAST" | "AVGALL";
};
interface getHistoryDataParams {
    requestPrePointVoList: Array<requestPrePointVoList>;
    startTime: string;
    endTime: string;
    downsample: Downsample;
}
declare const getHistoryData: (params: getHistoryDataParams) => Promise<Array<{
    historyDataList: Array<historyDataList>;
    instanceCode: null;
    pointCode: string;
    propertyCode: null;
    thingPropertyInstId: string;
}>>;
/**
 * @description 创建设备实例详细信息查询任务
 * @param codes 设备实例code
 * @returns thingInstanceDetail 设备实例详细信息
 */
declare const createGetThingInstanceDetail: (codes: Array<string>, params: RequestParams, filterDataByEventEnable?: boolean) => Promise<Record<string, thingInstanceDetail>>;
/**
 * @description 创建设备状态查询 任务
 * @param code 设备实例code
 */
declare const createGetThingInstanceStatus: (code: Array<string>, params: RequestParams) => Promise<() => void>;
/**
 * @description  根据PC 过滤物实例属性信息
 * @param codes 设备实例code
 * @param pcs 设备实例属性code
 */
declare const createFilterThingInstanceDetailByPc: (codes: Array<string>, pcs: Array<string>) => Promise<void>;
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
declare const createGetHistoryData: (codes: Array<string>, pcs: Array<string>, params: RequestParams) => Promise<(startTime: string, endTime: string, downsample: Downsample) => Promise<Record<string, Record<string, POINTCODE>>>>;

type thing_POINTCODE = POINTCODE;
type thing_RequestParams = RequestParams;
declare const thing_createFilterThingInstanceDetailByPc: typeof createFilterThingInstanceDetailByPc;
declare const thing_createGetHistoryData: typeof createGetHistoryData;
declare const thing_createGetThingInstanceDetail: typeof createGetThingInstanceDetail;
declare const thing_createGetThingInstanceStatus: typeof createGetThingInstanceStatus;
declare const thing_dataToPointCode: typeof dataToPointCode;
type thing_detailGroupList = detailGroupList;
declare const thing_filterDataByEventEnable: typeof filterDataByEventEnable;
declare const thing_getHistoryData: typeof getHistoryData;
declare const thing_resetHeader: typeof resetHeader;
type thing_thingInstanceDetail = thingInstanceDetail;
type thing_timeUnit = timeUnit;
declare const thing_timeUnit: typeof timeUnit;
declare namespace thing {
  export {
    thing_POINTCODE as POINTCODE,
    thing_RequestParams as RequestParams,
    thing_createFilterThingInstanceDetailByPc as createFilterThingInstanceDetailByPc,
    thing_createGetHistoryData as createGetHistoryData,
    thing_createGetThingInstanceDetail as createGetThingInstanceDetail,
    thing_createGetThingInstanceStatus as createGetThingInstanceStatus,
    thing_dataToPointCode as dataToPointCode,
    thing_detailGroupList as detailGroupList,
    thing_filterDataByEventEnable as filterDataByEventEnable,
    thing_getHistoryData as getHistoryData,
    thing_resetHeader as resetHeader,
    thing_thingInstanceDetail as thingInstanceDetail,
    thing_timeUnit as timeUnit,
  };
}

declare const clientUtils: {
    http: {
        createInstance: typeof createInstance;
        instance: createInstance;
    };
    G2: typeof G2;
    thing: typeof thing;
};

export { clientUtils as default };
