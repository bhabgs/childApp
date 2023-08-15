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

const industryApi = {
  async getList(data: any) {
    const res = await instance.post(`/mtip/thing/v2/industry/findPage`, data);
    return res;
  },
  async update(data: any, type: string) {
    const res = await instance.post(`/mtip/thing/v2/industry/${type}`, data);
    return res;
  },
  async remove(oid: string) {
    const res = await instance.delete(`/mtip/thing/v2/industry/remove/${oid}`);
    return res;
  },
  async info(oid: string) {
    const res = await instance.get(`/mtip/thing/v2/industry/findById/${oid}`);
    return res;
  },
  async compareCondition(data: any) {
    const param = formatParams(data);
    const res = await instance.post(`/mtip/thing/v2/industry/verify?${param}`);
    return res;
  },
  async getSystemIndustry() {
    const res = await instance.post(
      `/mtip/thing/v2/industry/getCurrentSystemIndustry`
    );
    return res;
  },
};

export default industryApi;
