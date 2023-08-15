import instance from "..";
import a from "./zjy";
import { getMqttConfig, checkLinkage, saveMqttConfirm } from "./mqtt";

const api = {
  ...a,
  getMqttConfig,
  checkLinkage,
  saveMqttConfirm,
  // opcua 连接测试
  opcuaConnTest: async (data) => {
    return instance.post("/premgmt/v1/pre/opcua/checkOpcuaSetting", data);
  },
  // 保存OPCUA基本配置信息
  saveOpcuaSetting: async (data) => {
    return instance.post("/premgmt/v1/pre/opcua/saveOpcuaSetting", data);
  },
  // 重启opcua服务
  restartOpauaServer: async () => {
    return instance.get("/premgmt/v1/pre/opcua/restartOpcuaServer");
  },
  // 新增编辑外部服务用户
  createOpcuaUser: async (data) => {
    return instance.post("/premgmt/v1/pre/opcua/createOpcuaUser", data);
  },
  // 删除外部服务用户
  deleteOpcuaUser: async (data) => {
    return instance.get("/premgmt/v1/pre/opcua/deleteOpcuaUser", {
      params: {
        id: data,
      },
    });
  },
  // 查询外部服务用户
  getOpcuaUsers: async () => {
    return instance.get("/premgmt/v1/pre/opcua/getOpcuaUsers");
  },
  // 查询当前用户可管理标签 模糊查询
  getCodeByUser: async (data) => {
    return instance.post("/premgmt/v1/pre/opcua/getCodeByUser", data);
  },
  //新增标签页面 查询pre树
  getPreTreeByUser: async (uid: string | Array<string>, pointCode: string) => {
    return instance.get("/premgmt/v1/pre/opcua/getPreTreeByUser", {
      params: {
        pointCode: pointCode || "",
        id: uid || 2,
      },
    });
  },
  // 新增标签
  createCodeWithUser: async (
    pointCodeList: Array<string>,
    opcuaUid: string | Array<string>
  ) => {
    return instance.post(
      "/premgmt/v1/pre/opcua/createCodeWithUser",
      {
        pointCodeList,
        id: opcuaUid,
      },
      { timeout: 0 }
    );
  },
  // 删除标签
  deleteCodeWithUser: async (
    pointCodeList: Array<string>,
    opcuaUid: string | Array<string>
  ) => {
    return instance.post("/premgmt/v1/pre/opcua/deleteCodeWithUser", {
      pointCodeList: pointCodeList,
      id: opcuaUid,
    });
  },
  // 查询加密方式
  getPolicyItems: async () => {
    return instance.get("/premgmt/v1/pre/opcua/getPolicyItems");
  },
  // 查询OPCUA基本配置信息
  getOpcuaSetting: async () => {
    return instance.get("/premgmt/v1/pre/opcua/getOpcuaSetting");
  },

  // 获取指定外部服务用户
  getOpcuaUser: async (data) => {
    return instance.get("/premgmt/v1/pre/opcua/getOpcuaUser", {
      params: { id: data },
    });
  },
  // 编辑用户读写权限
  editUserAccess: async (a, b, c) => {
    return instance.get("/premgmt/v1/pre/opcua/editUserAccess", {
      params: {
        id: a,
        access: c,
        pointCodeList: b,
      },
    });
  },
};

export default api;
