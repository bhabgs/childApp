import _ from "lodash";

/**
 * 转换拖拽结束后的数据
 */
export const transformDragData = (
  info: any,
  treeData: any[],
  { key = "key", children = "children" } = {}
) => {
  const dropKey = info.node[key];
  const dragKey = info.dragNode[key];
  const dropPos = info.node.pos.split("-");
  const dropPosition = info.dropPosition - Number(dropPos[dropPos.length - 1]);
  const loop = (data: any, key: string | number, callback: any) => {
    data.forEach((item: any, index: number) => {
      if (item[key] === key) {
        return callback(item, index, data);
      }
      if (item[children]) {
        return loop(item[children], key, callback);
      }
    });
  };
  const data = _.cloneDeep(treeData);

  // Find dragObject
  let dragObj: any;
  loop(data, dragKey, (item: any, index: number, arr: any[]) => {
    arr.splice(index, 1);
    dragObj = item;
  });
  if (!info.dropToGap) {
    // Drop on the content
    loop(data, dropKey, (item: any) => {
      item[children] = item[children] || [];
      /// where to insert 示例添加到头部，可以是随意位置
      item[children].unshift(dragObj);
    });
  } else if (
    (info.node[children] || []).length > 0 && // Has children
    info.node.expanded && // Is expanded
    dropPosition === 1 // On the bottom gap
  ) {
    loop(data, dropKey, (item: any) => {
      item[children] = item[children] || [];
      // where to insert 示例添加到头部，可以是随意位置
      item[children].unshift(dragObj);
    });
  } else {
    let ar: any[] = [];
    let i = 0;
    loop(data, dropKey, (_item: any, index: number, arr: any[]) => {
      ar = arr;
      i = index;
    });
    if (dropPosition === -1) {
      ar.splice(i, 0, dragObj);
    } else {
      ar.splice(i + 1, 0, dragObj);
    }
  }
  // treeData.value = data;

  /* ----- 转换数据 ----- */

  // 递归设置sort字段
  const setSort = (node: any, index: number) => {
    node.sort = index + 1;
    if (node[children]?.length) {
      node[children].forEach((sub: any, ind: number) => {
        setSort(sub, ind);
      });
    }
  };

  return data.map((item, index) => {
    setSort(item, index);
    return item;
  });
};
