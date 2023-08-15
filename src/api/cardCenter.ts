import instance from ".";

const api = {
  /**
   * 查询字典
   */
  getEnumList: (enumName: string) => {
    return instance.get(`/cardcenter/v1/enum/${enumName}`);
  },
  /**
   * 获取卡片列表
   */
  cardGetList: async (data: any) => {
    return instance.post("/cardcenter/v1/card/list", data);
  },
  /**
   * 卡片保存或更新
   */
  cardSaveOrUpdate: (data: any) => {
    return instance.post("/cardcenter/v1/card/saveOrUpdate", data);
  },
  /**
   * 卡片删除
   */
  cardDelete: (cardId: any) => {
    return instance.post(`/cardcenter/v1/card/del/${cardId}`, {});
  },
  /**
   * 卡片启用禁用
   */
  cardAvailable: (cardId: any, enable: boolean) => {
    return instance.get(`/cardcenter/v1/card/available/${cardId}`, {
      params: { enable },
    });
  },
  /**
   * 获取页面列表
   */
  pageGetList: async (data: any) => {
    return instance.post("/cardcenter/v1/page/list", data);
  },
  /**
   * 页面保存或更新
   */
  pageSaveOrUpdate: async (data: any) => {
    return instance.post("cardcenter/v1/page/saveOrUpdate", data);
  },
  /**
   * 页面删除
   */
  pageDelete: async (pageId: any) => {
    return instance.post(`/cardcenter/v1/page/del/${pageId}`);
  },
  /**
   * 获取系统列表
   */
  systemGetList: async () => {
    return instance.get(`/cardcenter/v1/page/system/list`);
  },
};

export default api;
