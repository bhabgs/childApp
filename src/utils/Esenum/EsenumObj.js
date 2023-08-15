import Esenum from "./index.js";

/*
 *  打点工具 错误提示信息
 */
export const pointErrorEsenum = new Esenum({
  ERR_CODE_OK: { name: "正常", index: 0 },
  /* # 故障会引起连接断开 */
  ERR_CODE_UNKNOWN: { index: -1, name: "系统未知错误" },
  ERR_CODE_FAULT: { name: "系统故障", index: -2 },
  ERR_CODE_FROM_FOREIGN: {
    name: "外部错误，与三方系统交互时，收到了第三方的错误",
    index: -3,
  },
  /* # 异常 */
  ERR_CODE_HANDLED_FAULT: {
    name: "-2故障已经被内部截获，并进行了一定处理，如重启pdu",
    index: -15,
  },
  ERR_CODE_EXCEPTION: { name: "系统异常", index: -16 },
  ERR_CODE_TAOS_REST_NOT_SUCC: { name: "rest访问tdengine接口失败", index: -12 },
  ERR_CODE_TAOS_REST_HTTP_NOT_200: {
    index: -13,
    name: "rest访问tdengine返回的不是http 200",
  },
  /* # 错误配置数据错误或数据异常，导致部分功能不正常 */
  POINT_ERR_CODE_TIMEOUT: { name: "与PLC、redis、mqtt通讯超时", index: -63 },
  POINT_ERR_CODE_WRONG_VALUE: {
    name: "指令的value是错误的值，例如 boolean类型的值，却收到：abc",
    index: -64,
  },
  POINT_ERR_CODE_ILLEGAL_TYPE: {
    name: "data_type配置错误，例如 modbus function_code=1的点，却配置为：204",
    index: -65,
  },
  POINT_ERR_CODE_ILLEGAL_JSON: {
    name: "指令不是正确的json，无法解析",
    index: -66,
  },
  POINT_ERR_CODE_POINT_NOT_EXIST: {
    name: "下发指令的point code或id，找不到对应的点",
    index: -67,
  },
  POINT_ERR_CODE_WRITE_TO_READ_ONLY: {
    name: "下发指令的点，write_enable不等于1",
    index: -68,
  },
  POINT_ERR_CODE_WRITE_BUT_EXPIRES: {
    name: "指令过期。指令的dt到执行时已经超过write_expires_time设置的毫秒数",
    index: -69,
  },
  POINT_ERR_CODE_INVALID_PDU_SENDER: {
    name: "在pdu重启时，可能存在短暂的时间空隙，无法向指定的pdu发送指令",
    index: -70,
  },
  POINT_ERR_CODE_NOT_SAME_PDU: { name: "批量指令不能跨多个pdu", index: -71 },
  POINT_ERR_CODE_WRONG_BYTE_INDEX: {
    name: "掩位点数据，例如：用整数模拟32个boolean值，点地址一般配为xxx.0或xxx.31。.后的数字代表的是位数-bit。配置错误，则报告此错误",
    index: -72,
  },
  POINT_ERR_CODE_ILLEGAL_ADDRESS: {
    name: "错误的点地址，例如modbus的点的地址应该配置为数字，但是却配置了：abc",
    index: -73,
  },
  POINT_ERR_CODE_ILLEGAL_FUNCTION_CODE: {
    name: "不合法的function_code",
    index: -74,
  },
  POINT_ERR_CODE_EMPTY_DATA: {
    name: "收到的数据只有报文格式，但没有报文内容",
    index: -75,
  },
  POINT_ERR_CODE_ILLEGAL_BYTE: { name: "接收到了非法的字节流", index: -76 },
  POINT_ERR_CODE_ILLEGAL_TAG: {
    name: "ab、s7、opcua读写数据是，PLC报告tag非法",
    index: -77,
  },
  POINT_ERR_CODE_TAG_EXCEPTION: {
    name: "ab、s7、opcua读写数据是，PLC报告tag错误",
    index: -78,
  },
  POINT_ERR_CODE_REDIS_SET_NOT_TRUE: {
    name: "向redis中set数据时，没有报错，但是收到的返回值不是true",
    index: -79,
  },
  POINT_ERR_CODE_NOT_ASCII_DIGIT_CHAR: {
    name: "单个ASCII码不是数字，部分通讯协议传输ASCII流，在必须解析为数字时，收到了不是数字的ASCII编码",
    index: -80,
  },
  POINT_ERR_CODE_ILLEGAL_ASCII_NUMBER: {
    name: "多个连续的ASCII码无法解析为数字",
    index: -81,
  },
  POINT_ERR_CODE_ILLEGAL_TCPPP_RESPONSE: {
    name: "简单私有协议通讯时，收到错误的应答",
    index: -82,
  },
  POINT_ERR_CODE_OPCUA_CLIENT_WRITE_EXCEPTION: {
    name: "向opcua server write指令时，opcua server的应答为错误应答",
    index: -83,
  },
});
