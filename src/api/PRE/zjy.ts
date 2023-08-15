import instance from "..";

const api = {
  /**
   * 用户权限树- 以树状结构返回菜单项
   */
  getMenuTreeList: (params: any) => {
    return instance.get("/common/v1/menu/all", { params });
  },
  /* 打点工具 */
  /**
   * 打点工具树
   */
  getPointTree: () => {
    return instance.get("/premgmt/v1/tools/pdu/status");
  },
  /**
   * 打点工具页面列表 查询point状态
   */
  getPointTable: async (data: any) => {
    return instance.post("/premgmt/v1/tools/point/info", data);
  },
  /**
   * 打点工具页面列表 轮询查询point状态
   */
  getPointTablePolling: async (data: any) => {
    return instance.post("/premgmt/v1/tools/point/value", data);
  },
  /**
   * 锁定和解锁
   */
  getPointLock: async (data: any) => {
    return instance.post("/premgmt/v1/tools/point/lock", data);
  },
  /**
   * 下发
   */
  getPointSend: async (data: any) => {
    return instance.post("/premgmt/v1/tools/point/send/batch", data);
  },
  /**
   * 下发枚举
   */
  getPointSendList: async () => {
    return instance.get("/premgmt/v1/tools/enum/sendType");
  },
  /**
   * 数据分析
   */
  getQueryHistoryData: async (data: any) => {
    return instance.post("/premgmt/v1/point/queryHistoryData", data);
  },
  /* 打点工具end */
  /* 设备连接 */

  /**
   * 设备连接-查询推送方式,数据类型，输出数据类型，数据格式
   */
  getPointDataType: async () => {
    return instance.get("/premgmt/v1/pre/equipConn/getPointDataType");
  },
  /**
   * 设备连接-查询设备，协议，连接，扫描类型
   */
  getPduLinkerType: async () => {
    return instance.get("/premgmt/v1/pre/equipConn/getPduLinkerType");
  },
  /**
   * 设备连接-通过设备类型查询对应协议类型
   */
  getProtocolTypeByDevice: async (deviceId: string) => {
    return instance.get("/premgmt/v1/pre/equipConn/getProtocolTypeByDevice", {
      params: { deviceId },
    });
  },
  /**
   * 设备连接-通过设备和协议类型查询地址信息
   */
  getUrlItem: async (data) => {
    return instance.get("/premgmt/v1/pre/equipConn/getUrlItem", {
      params: data,
    });
  },
  /**
   * 设备连接-查询单个属性点信息
   */
  getPointItemById: async (pointId: string | string[]) => {
    return instance.get("/premgmt/v1/pre/equipConn/getPointItemById", {
      params: { pointId },
    });
  },
  /**
   * 设备连接-重启PRE服务
   */
  restartPre: async () => {
    return instance.get("/premgmt/v1/pre/equipConn/restartPre");
  },
  /**
   * 设备连接-启用停用刷新重连PDU
   */
  editPduConn: async (data: any) => {
    /* pduConnState	1,启用PDU，2停用PDU，3，刷新重连PDU */
    return instance.get("/premgmt/v1/pre/equipConn/editPduConn", {
      params: data,
    });
  },
  /**
   * 设备连接-查询协议数据单元详情
   */
  getPduLinkerDescById: async (pduId: string | number) => {
    return instance.get("/premgmt/v1/pre/equipConn/getPduLinkerDescById", {
      params: { pduId },
    });
  },

  /**
   * 设备连接-查询pre树结构
   */
  getPreItems: async (data: any) => {
    return instance.get("/premgmt/v1/pre/equipConn/getPreItems", {
      params: data,
    });
  },
  /**
   * 设备连接-导出pdu、point信息
   */
  exportPduItems: async () => {
    return instance.get("/premgmt/v1/pre/equipConn/exportPduItems", {
      responseType: "blob",
    });
  },
  /**
   * 下载导入模版
   */
  downloadTemplate: async () => {
    return instance.get("/premgmt/v1/pre/equipConn/exportModel", {
      responseType: "blob",
    });
  },
  /**
   * 批量导出pdu、point信息
   */
  batchImportPduItems: async (data: any) => {
    return instance.post("/premgmt/v1/pre/equipConn/importPduItems", data, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },
  /**
   * 设备连接-查询pre协议路由和pdu协议数据单元 树结构
   */
  getPreItem: async (data: any) => {
    return instance.get("/premgmt/v1/pre/equipConn/getPreItem", {
      params: data,
    });
  },
  /**
   * 设备连接-设备连接-查询pre协议路由和pdu协议数据单元
   */
  getPreItemByPreCode: async (data: any) => {
    return instance.get("/premgmt/v1/pre/equipConn/getPreItemByPreCode", {
      params: data,
    });
  },
  /**
   * 设备连接-新增协议单元数据
   */
  createPduLinkerByPre: async (data: any) => {
    return instance.post(
      "/premgmt/v1/pre/equipConn/createPduLinkerByPre",
      data
    );
  },
  /**
   * 设备连接-编辑协议单元数据
   */
  editPduItem: async (data: any) => {
    return instance.post("/premgmt/v1/pre/equipConn/editPduItem", data);
  },
  /**
   * 设备连接-删除协议单元数据
   */
  deletePduLinker: async (pduId: any) => {
    return instance.get("/premgmt/v1/pre/equipConn/deletePduLinker", {
      params: { pduId },
    });
  },
  /**
   * 设备连接-协议单元连接测试
   */
  checkPduConn: async (pduId: string) => {
    return instance.get("/premgmt/v1/pre/equipConn/checkPduConn", {
      params: { pduId },
    });
  },
  /**
   * 设备连接-查询属性点信息
   */
  getPointItemListByPduCode: async (data: any) => {
    return instance.post(
      "/premgmt/v1/pre/equipConn/getPointItemListByPduCode",
      data
    );
  },
  /**
   * 设备连接-新增属性点信息
   */
  createPointByPduCode: async (data: any) => {
    return instance.post(
      "/premgmt/v1/pre/equipConn/createPointByPduCode",
      data
    );
  },
  /**
   * 设备连接-编辑属性点信息
   */
  updatePoint: async (data: any) => {
    return instance.post("/premgmt/v1/pre/equipConn/updatePoint", data);
  },
  /**
   * 设备连接-删除属性点信息
   */
  deletePointByList: async (data: any) => {
    return instance.get("/premgmt/v1/pre/equipConn/deletePointByList", {
      params: data,
    });
  },

  /* 设备连接end */
  /**
   * 获取页面列表 查询point状态
   */
  getTable: async (data: any) => {
    return instance.post("/thing/v1/core/thing/findAllPageInIndustry", data);
    return instance.post("/point/status", data);
  },
  /**
   * 获取卡片列表
   */
  cardGetList: async (data: any) => {
    return instance.post("/cardcenter/v1/card/list", data);
  },
};

export default api;
