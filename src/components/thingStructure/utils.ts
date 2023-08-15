import _ from "lodash";

/**
 * 通过关系表 组合物实例的组织架构
 */
export function generateInstanceTree({ InstMapList, relationMap }) {
  const copyInstanceList = [...InstMapList];
  const res: any[] = [];
  const allChildIds = _.flatten(Object.values(relationMap));

  const getThingList = (idList: string[]) => {
    return idList.map((item) => {
      const thing = copyInstanceList.find((ele) => ele.thingInst.id === item);
      return thing;
    });
  };

  for (const instance of copyInstanceList) {
    const childIds = relationMap[instance.thingInst.id];
    // if (instance.thingInst.id === "433941521758457856") continue;
    if (childIds) {
      instance.child = getThingList(childIds);
      if (!allChildIds.includes(instance.thingInst.id)) {
        res.push(instance);
      }
    } else if (!allChildIds.includes(instance.thingInst.id)) {
      res.push(instance);
    }
  }

  return res;
}
