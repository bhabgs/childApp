import instance from ".";

const api = {
  /**
   * 根据用户id获取用户权限树
   * @param userId 用户id
   */
  getMenuListByUserId() {
    return instance.get("/common/v1/menu/tree");
  },
  /**
   * 记录日志接口 (登录/登出)
   */
  insertLogRecord(data: any) {
    return instance.post("/common/v1/log/insert", data);
  },
  /**
   * 获取系统配置
   */
  getSysConfig() {
    return instance.get("/common/v1/sysconfig/getSysConfig?clientType=web");
  },
  /**
   * 获取图片
   */
  searchImage(imgType: number, editImg: number): Promise<any> {
    return instance.get(
      `/common/v1/sysconfig/searchImage?imgType=${imgType}&editImg=${editImg}&clientType=web`,
      {
        responseType: "blob",
        headers: {
          "Content-Disposition": "attachment",
          "Content-Type": "text/html;charset=UTF-8",
        },
      }
    );
  },
};

export default api;
