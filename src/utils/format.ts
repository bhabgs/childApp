import dayjs from "dayjs";

/**
 * 秒 -> 分
 * @param s 秒
 */
export function secordToMinute(s: number | null) {
  if (s === null || s === undefined) return null;
  return {
    minute: Math.floor(s / 60),
    second: s % 60,
  };
}

/**
 * 转换部门、人员 树结构
 * @param treeData 源数据
 */
export function fomatDepTree(treeData: any) {
  treeData.subList = treeData.departmentList;
  const res = [treeData];

  function formatSubList(list: any[]) {
    list.forEach((dep: any) => {
      dep.id = `dep${dep.id}`;
      dep.isDep = true;
      dep.subList = dep.subList ?? [];
      if (dep.subList.length) {
        formatSubList(dep.subList);
      }
      if (dep.userSummaryList) {
        dep.subList.push(
          ...dep.userSummaryList.map((emp: any) => {
            emp.id = emp.userId;
            emp.name = emp.userName;

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
 * 转换部门、人员 树结构
 * @param treeData 源数据
 */
export function fomatDepPeopleTree(res: any, label?: string, value?: string) {
  function formatSubList(list: any[]) {
    return list.map((item) => ({
      [`${value ? value : "value"}`]: `dep${item.id}`,
      [`${label ? label : "label"}`]: item.name,
      children:
        item.subList.length > 0
          ? formatSubList(item.subList)
          : formatemployeeSummaryList(item.userSummaryList),
    }));
  }
  function formatemployeeSummaryList(list: any[]) {
    return list.map((item) => ({
      [`${value ? value : "value"}`]: item.userId,
      [`${label ? label : "label"}`]: `${item.employeeName ?? ""}(${
        item.userName ?? ""
      })`,
    }));
  }
  return formatSubList(res);
}
export function fomatEmployeeIdTree(res: any, label?: string, value?: string) {
  function formatSubList(list: any[]) {
    return list.map((item) => ({
      [`${value ? value : "value"}`]: `dep${item.id}`,
      [`${label ? label : "label"}`]: item.name,
      children:
        item.subList.length > 0
          ? [
              ...formatSubList(item.subList),
              ...formatemployeeSummaryList(item.employeeSummaryList),
            ]
          : formatemployeeSummaryList(item.employeeSummaryList),
    }));
  }
  function formatemployeeSummaryList(list: any[]) {
    return list.map((item) => ({
      disableCheckbox: !item.userIds ? true : false,
      [`${value ? value : "value"}`]: item.userIds,
      [`${label ? label : "label"}`]: `${item.employeeName ?? ""}`,
    }));
  }
  return formatSubList(res);
}

export const getEnByZn = (val: string) => {
  val = val
    .replace(/ /g, "")
    .replace(/‘/g, '"')
    .replace(/“/g, '"')
    .replace(/：/g, ":")
    .replace(/「/g, "{")
    .replace(/」/g, "}");
  return val;
};

export const transformTime = (
  time?: number | string | Date,
  format = "YYYY-MM-DD HH:mm:ss"
) => {
  return time ? dayjs(time).format(format) : "--";
};
export default {};
