const typeList = [
  { label: "单行文本框", value: "input_box" },
  { label: "多行文本域", value: "textarea" },
  { label: "时间点", value: "time" },
  { label: "时间段", value: "timearea" },
  { label: "单选框", value: "radio_box" },
  { label: "复选框", value: "check_box" },
  { label: "下拉选择", value: "select_box" },
  { label: "附件选择", value: "attachment_box" },
  { label: "设备", value: "device" },
  { label: "成员/组织", value: "memberorganization" },
  { label: "标签", value: "lab_box" },
  // 链接:link_box
];

/**
 * 获取所有类别数组
 * @param obj
 * @returns
 */
export const getAllCategory = (obj) => {
  let arrRes: any = [];

  const rev = (data) => {
    arrRes.unshift(data?.name);
    if (
      "defStandardFormItemCategory" in data &&
      data.defStandardFormItemCategory
    ) {
      rev(data.defStandardFormItemCategory);
    }
  };

  rev(obj);
  return arrRes;
};

export default typeList;
