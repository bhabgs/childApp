import { instance } from '.';

const formatParams = (obj = {}) => {
  let params = '';
  Object.keys(obj).forEach((key) => {
    const value: any = obj[key];
    if (value !== null && value !== undefined) {
      params += `${key}=${value}&`;
    }
  });
  return params.slice(0, params.length - 1);
};

const CategoryApi = {
  async getTreeList(industryCode: string) {
    const res = await instance.post(
      `mtip/thing/v2/catalog/findByIndustryCode?code=root_catalog&industryCode=${industryCode}`
    );
    return res;
  },
  async add(data: any) {
    const res = await instance.post(`mtip/thing/v2/catalog/create`, data);
    return res;
  },
  async remove(code: string) {
    const res = await instance.delete(`mtip/thing/v2/catalog/remove/${code}`);
    return res;
  },
  async detail(id: string) {
    const res = await instance.get(`mtip/thing/v2/catalog/findById/${id}`);
    return res;
  },
  async modify(data: any) {
    const res = await instance.post(`mtip/thing/v2/catalog/modify`, data);
    return res;
  },
  async compareCondition(data: any) {
    const param = formatParams(data);
    const res = await instance.post(`mtip/thing/v2/catalog/verify?${param}`);
    return res;
  },
  async getUserInfo(userId: string) {
    const res = await instance.get(`common/v1/user/detail?userId=${userId}`);
    return res;
  },
};

export default CategoryApi;
