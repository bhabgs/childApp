/**
 * 转换部门、人员 树结构
 * @param treeData 源数据
 */
export function fomatDepTree(treeData: any[]) {
  // treeData.subList = treeData.departmentList;
  const res = treeData;

  function formatSubList(list: any[]) {
    list.forEach((dep: any) => {
      dep.id = `dep${dep.id}`;
      dep.isDep = true;
      dep.subList = dep.subList ?? [];
      if (dep.subList.length) {
        formatSubList(dep.subList);
      }
      if (dep.userSummaryList) {
        dep.subList.unshift(
          ...dep.userSummaryList.map((emp: any) => {
            emp.id = emp.userId;
            emp.name = emp.employeeName;
            return emp;
          })
        );
      }
    });
  }

  formatSubList(res);

  return res;
}

/**
 * 计算部门人数
 */
export const toTreeCount = (data) => {
  const digui = (data, arr) => {
    data.forEach((item) => {
      if (item.isDep) {
        item.count = toTreeCount(
          item.subList.filter((item) => !item.isDep)
        ).count;
        digui(item.subList, arr);
      } else {
        if (item.status === 1 || item.status == null) arr.push(item.id);
      }
    });
    return { count: [...new Set(arr)].length, data };
  };
  return digui(data, []);
};
