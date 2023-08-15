/*
 * @Abstract: 树结构工具
 * @Author: wang liang
 * @Date: 2022-04-18 09:12:12
 * @LastEditors: wang liang
 * @LastEditTime: 2022-04-26 16:06:15
 */

/**
 * 从树结构中筛选
 * @param treeData 树结构数据
 * @param id id
 * @param childProp 子列表属性名
 * @param idName 自定义id
 */
export function findById(
  treeData: any[],
  id: number,
  childProp = "subList",
  idName: string | "id"
) {
  const find = (dataList: any[]) => {
    let node;
    dataList.some((item) => {
      let flag = false;
      if (item[idName] === id) {
        flag = true;
        node = item;
      } else {
        const res = find(item[childProp]);
        if (res) {
          flag = true;
          node = res;
        }
      }
      return flag;
    });
    return node;
  };

  return find(treeData);
}

/**
 * 递归去除树结构中的 createDt/updateDt
 */
export function removeDateProp(treeData: any[]) {
  treeData.forEach((item: any) => {
    for (const key in item) {
      if (Array.isArray(item[key])) {
        removeDateProp(item[key]);
      }
      if (key === "updateDt" || key === "createDt") {
        delete item[key];
      }
    }
  });
}

/**
 * 查询父节点数据
 */
export function getParentById(
  list: any[],
  id: number,
  sub = "subList",
  idName: string | "id",
  obj?: any
) {
  let result: any;

  list.some((item) => {
    if (item[idName] === id) {
      result = obj;
      return true;
    }
    if (sub in item) {
      result = getParentById(item[sub], id, sub, item);
      if (result && Object.keys(result).length > 0) {
        return true;
      }
      return false;
    }
    return false;
  });

  return result;
}

export default "";
