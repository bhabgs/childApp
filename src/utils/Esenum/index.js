export default class EsEunm {
  constructor(obj) {
    if (!obj) {
      return;
    }
    Object.keys(obj).forEach((key) => {
      let item = obj[key];
      this.addAll(key, item);
    });
    return this;
  }

  /**
   * 添加枚举
   * @param key
   * @param item
   */
  addAll(key, item) {
    this[key] = item;
  }

  /**
   * 获取到所有的枚举值列表
   * @return {Array} list集合
   */
  getItemList() {
    let optionList = [];
    for (const key in this) {
      let item = this[key];
      let option = {};
      Object.assign(option, item);
      option.key = key;
      optionList.push(option);
    }
    optionList.sort((a, b) => {
      let value1 = a["index"];
      let value2 = b["index"];
      return value1 - value2;
    });
    return optionList;
  }

  /**
   * 过滤掉不需要的值
   * @params {Array,String} val 需要过滤掉的枚举对象的name值
   * @return {Array} list集合
   */
  getFilterItemList(val = []) {
    let filterList = [];
    let valueArr = []; // 接受参数的整理
    if (Array.isArray(val)) {
      valueArr = val;
    } else {
      valueArr.push(val);
    }
    let optionList = this.getItemList(); // 得到的是list
    filterList = optionList.filter((item) => {
      if (valueArr.includes(item.name)) {
        return false;
      }
      return true;
    });
    return filterList;
  }

  /**
   * 根据name获取到index
   * @params {String} name 枚举的name值
   * @return {Number} name对应的index值
   */
  nameOfIndex(uname) {
    if (!uname) {
      return null;
    }
    let index = "";
    let optionList = this.getItemList();
    optionList.forEach((item) => {
      if (uname.toString() === item.name.toString()) {
        index = +item.index;
      }
    });
    return index;
  }

  /**
   * 根据index获取到name
   * @params {Number} index 枚举的index值
   * @return {String} index对应的name值
   */
  indexOfName(index) {
    if (index == undefined) {
      return null;
    }
    let uname = "";
    let optionList = this.getItemList();
    optionList.forEach((item) => {
      if (
        item.index !== undefined &&
        item.index !== null &&
        item.index == index
      ) {
        uname = item.name;
      }
    });
    return uname;
  }
}
