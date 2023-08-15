import instance from ".";

const api = {
  /**
   * 获取用户的角色
   * @param userId 用户id
   */
  getUserPermission: (userId: string) => {
    return instance.get(`/common/v1/user/searchRolesByUserId/${userId}`);
  },
  /**
   * 报表删除
   */
  reportmgmtDel: (id: string) => {
    return instance.get("/mtipUreport/v1/reportmgmt/deleteById", {
      params: { id },
    });
  },
  /**
   * 报表列表
   */
  reportmgmtList: (params: any) => {
    return instance.get("/mtipUreport/v1/reportmgmt/list", { params });
  },
  /**
   * 报表详情
   */
  reportDetailById: (id: string) => {
    return instance.get("/mtipUreport/v1/reportmgmt/getById", {
      params: { id },
    });
  },
  /**
   * 获取报表分页列表
   */
  getReportPage: (params: any) => {
    return instance.get("/mtipUreport/v1/reportmgmt/search", { params });
  },
  /**
   * 更新/保存报表
   */
  updateSaveReport: (data: any) => {
    return instance.post("/mtipUreport/v1/reportmgmt/save", data);
  },
};

export default api;
