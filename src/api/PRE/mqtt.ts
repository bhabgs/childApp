import { instance } from "..";

/**
 * 获取mqtt配置
 */
export const getMqttConfig = () =>
  instance.get("/premgmt/v1/pre/opcua/getMqttItem");

/**
 * 保存mqtt配置
 */
export const saveMqttConfirm = (data: any) =>
  instance.post("/premgmt/v1/pre/opcua/saveMqttItem", data);

/**
 * 测试连接
 */
export const checkLinkage = () =>
  instance.post("/premgmt/v1/pre/opcua/checkMqttItem");
