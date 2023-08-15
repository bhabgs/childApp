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
//type--接口类型；sort 厂家 品牌 型号
const findUrl = (sort: string, type: string) => {
  if (type === 'insert') {
    if (sort === 'factory') {
      return '/mtip/thing/v2/factory/create';
    } else if (sort === 'brand') {
      return '/mtip/thing/v2/brand/create';
    } else if (sort === 'model') {
      return '/mtip/thing/v2/model/create';
    }
  } else if (type === 'update') {
    if (sort === 'factory') {
      return '/mtip/thing/v2/factory/modify';
    } else if (sort === 'brand') {
      return '/mtip/thing/v2/brand/modify';
    } else if (sort === 'model') {
      return '/mtip/thing/v2/model/modify';
    }
  } else if (type === 'del') {
    if (sort === 'factory') {
      return '/mtip/thing/v2/factory/removeById/';
    } else if (sort === 'brand') {
      return '/mtip/thing/v2/brand/remove/';
    } else if (sort === 'model') {
      return '/mtip/thing/v2/model/remove/';
    }
  } else if (type === 'compare') {
    if (sort === 'factory') {
      return '/mtip/thing/v2/factory/verify';
    } else if (sort === 'brand') {
      return '/mtip/thing/v2/brand/verify';
    } else if (sort === 'model') {
      return '/mtip/thing/v2/model/verify';
    }
  }
  return '';
};

const api = {
  /**
   * 厂家树
   */
  getList: () => {
    return instance.get('/mtip/thing/v2/factory/findAll');
  },
  /**
   * 详情
   */
  findOne: (id: string) => {
    return instance.get(`${'/mtip/thing/v2/factory/findById'}?id=${id}`);
  },

  /**
   * 更新
   */
  update: (data: any, type: string, sort: string) => {
    const url = findUrl(sort, type);
    return instance.post(`${url}`, data);
  },
  /**
   * 删除
   */
  remove: (id: string, sort: string) => {
    const url = findUrl(sort, 'del');
    return instance.delete(`${url}${id}`);
  },

  /**
   * 名字 code 唯一性
   */

  compareCondition: (data: any, type: string) => {
    const param = formatParams(data);
    const url = findUrl(type, 'compare');
    return instance.post(`${url}?${param}`);
  },

  /**
   * 获取用户信息
   */

  getUserInfo:(userId: string) => {
    return instance.get(`/common/v1//user/detail?userId=${userId}`);
  },
};

export default api;
