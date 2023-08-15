import "@/assets/style/components/selectOrgPeople.less";
import { defineComponent, ref, onMounted, watch } from "vue";
import { watchOnce } from "@vueuse/core";
import _ from "lodash";
import { fomatDepTree, toTreeCount } from "./format";
import { message } from "ant-design-vue";
import * as api from "@/api/workorderManage/workorderSkillGroup";

import {
  UserOutlined,
  ApartmentOutlined,
  RightOutlined,
} from "@ant-design/icons-vue";

/**
 * 选择人员组建 左侧为部门树结构 右侧为选中的人员
 */
const SelectOrgPeople = defineComponent({
  emits: ["refresh"],
  props: {
    defaultList: {
      type: Array,
      default: () => [],
    },
    skillGroupId: {
      type: String,
    },
  },
  setup(props, { emit }) {
    // 树结构数据
    const treeData = ref<any[]>([]);
    const keyword = ref("");
    const expandedKeys = ref<string[] | undefined>([]);
    const getTreeData = _.debounce(
      async (callback?: any) => {
        treeData.value = [];
        const { data } = await api.getDepPeopleTreeList(keyword.value);
        const res = fomatDepTree(data.departmentList);
        toTreeCount(res);

        treeData.value = res;
        if (typeof callback === "function") {
          callback();
        }
        if (keyword.value) {
          expandedKeys.value = undefined;
        } else if (treeData.value.length) {
          expandedKeys.value = [];
        }
      },
      300,
      { leading: true, trailing: true }
    );
    onMounted(getTreeData);

    const isModalShow = ref(false);

    const checkedList = ref<any[]>([]);

    const initialCheckedList = ref<any[]>([]);
    const initialCheckedKeys = ref<any[]>([]);

    // 监听传入value 回显
    watch(
      () => props.defaultList,
      (val) => {
        checkedList.value = _.cloneDeep(val);
        checkedKeys.value = val.map((item: any) => item.memberId);
        initialCheckedList.value = _.cloneDeep(val);
        initialCheckedKeys.value = _.cloneDeep(checkedKeys.value);
      }
    );

    const handleEdit = () => (isModalShow.value = true);

    // 选择了一个人员
    function checkPeopleOfDep(dep: any, checked: boolean) {
      if (dep.subList.length) {
        dep.subList.forEach((item: any) => {
          if (item.isDep) {
            checkPeopleOfDep(item, checked);
          } else {
            if (checked) {
              if (!checkedList.value.includes(item))
                checkedList.value.push(item);
            } else {
              handleRemove(item);
            }
          }
        });
      }
    }
    const checkedKeys = ref<string[]>([]);
    const handleCheck = (keys: string[], { checked, node }: any) => {
      checkedKeys.value = keys;
      const people = node.dataRef;
      if (!people.isDep) {
        // 处理选中或清除
        if (checked) {
          if (!checkedList.value.includes(people))
            checkedList.value.push(people);
        } else {
          handleRemove(people);
        }
      } else {
        // 如果选中的是部门 则递归选择部门下的所有人员
        checkPeopleOfDep(people, checked);
      }
    };

    // 移除一个人员
    const handleRemove = (people: any) => {
      // 从已选择人员中移除
      const idx = checkedList.value.findIndex(
        (item) => item.userId === people.userId
      );
      if (idx !== -1) checkedList.value.splice(idx, 1);
      // 从已选中key中移除
      const idx2 = checkedKeys.value.findIndex(
        (item) => item === people.userId
      );
      if (idx2 !== -1) checkedKeys.value.splice(idx2, 1);
      // 把对应部门从选中key中移除
      const depIdx = checkedKeys.value.findIndex((item) => {
        return item === `dep${people.depId}`;
      });
      if (depIdx !== -1) checkedKeys.value.splice(depIdx, 1);
    };

    // 清空
    const handleClear = () => {
      checkedKeys.value = [];
      checkedList.value = [];
    };

    // 保存
    const handleSave = async () => {
      const addedList = checkedKeys.value.filter(
        (item) => !initialCheckedKeys.value.includes(item)
      );
      const reqList = addedList.map((item) =>
        api.memberSave({ memberId: item, skillGroupId: props.skillGroupId })
      );
      await Promise.all(reqList);
      message.success("添加成功");
      initialCheckedList.value = _.cloneDeep(checkedList.value);
      initialCheckedKeys.value = _.cloneDeep(checkedKeys.value);
      isModalShow.value = false;
      emit("refresh");
    };

    // 重置选择
    const handleReset = () => {
      checkedList.value = _.cloneDeep(initialCheckedList.value);
      checkedKeys.value = _.cloneDeep(initialCheckedKeys.value);
      keyword.value = "";
      expandedKeys.value = [];
    };

    return {
      treeData,
      keyword,
      isModalShow,
      checkedList,
      checkedKeys,
      initialCheckedKeys,
      expandedKeys,
      handleEdit,
      handleRemove,
      handleCheck,
      handleClear,
      handleSave,
      handleReset,
      getTreeData,
    };
  },

  render() {
    return (
      <div class="check-people">
        <div class="edit-area">
          <div class="edit-button">
            <a-button type="primary" onClick={this.handleEdit}>
              添加成员
            </a-button>
          </div>
          {/* 人员列表 - 不展示 */}
          {/* <ul class="people-list">
            {this.checkedList.map((item) => (
              <li>{`${item.employeeName ?? ""}(${item.userName ?? ""})`}</li>
            ))}
          </ul> */}
        </div>

        {/* 选择的对话框 */}
        <a-modal
          wrapClassName="check-people-modal"
          title="选择人员"
          width={860}
          centered
          okText="保存"
          cancelButtonProps={{}}
          v-model={[this.isModalShow, "visible"]}
          onOk={this.handleSave}
          onCancel={this.handleReset}
        >
          <div class="select-area">
            {/* 左侧的树结构 */}
            <div class="left-tree">
              <a-input
                style={{ width: "220px", marginBottom: "16px" }}
                placeholder="请输入关键字"
                allowClear
                v-model={[this.keyword, "value"]}
                onInput={this.getTreeData}
              />
              {this.treeData.length ? (
                <a-tree
                  class="withoutIcon"
                  checkable
                  showLine
                  blockNode
                  fieldNames={{
                    key: "id",
                    title: "name",
                    children: "subList",
                  }}
                  v-models={[[this.expandedKeys, "expandedKeys"]]}
                  defaultExpandAll={!!this.keyword}
                  checkedKeys={this.checkedKeys}
                  treeData={this.treeData}
                  onCheck={this.handleCheck}
                >
                  {{
                    title: ({ dataRef }: any) => (
                      <div class="tree-title">
                        {dataRef.isDep ? (
                          <ApartmentOutlined />
                        ) : (
                          <UserOutlined />
                        )}
                        <div style={{ width: "100%", marginLeft: "8px" }}>
                          {dataRef.isDep ? (
                            <div class="dep-title">
                              <span>{dataRef.name}</span>
                              <span class="count">
                                <a-space>
                                  <span>{`${dataRef.count || 0}人`}</span>
                                  <RightOutlined title="查看" class="pointer" />
                                </a-space>
                              </span>
                            </div>
                          ) : (
                            `${dataRef.employeeName ?? ""}(${
                              dataRef.userName ?? ""
                            })`
                          )}
                        </div>
                      </div>
                    ),
                  }}
                </a-tree>
              ) : (
                <a-empty description="暂无数据"></a-empty>
              )}
            </div>
            <a-divider
              style={{ height: "100%", margin: "0 16px" }}
              type="vertical"
            />
            {/* 右侧展示已选择的列表 */}
            <div class="ckecked-list">
              <div class="checked">
                <span class="left">
                  <span class="title">已选人员</span>
                  <span class="text">
                    (已选择
                    <a-button class="num" type="link">
                      {this.checkedList.length}
                    </a-button>
                    人)
                  </span>
                </span>
                <a-button
                  type="link"
                  disabled={!this.checkedList.length}
                  onClick={this.handleClear}
                >
                  清空
                </a-button>
              </div>
              {this.checkedList.length > 0 ? (
                <div>
                  {this.checkedList.map((item) => (
                    <a-tag closable onClose={() => this.handleRemove(item)}>
                      {`${item.employeeName ?? ""}(${item.userName ?? ""})`}
                    </a-tag>
                  ))}
                </div>
              ) : (
                <a-empty description="请选择" />
              )}
            </div>
          </div>
        </a-modal>
      </div>
    );
  },
});

export default SelectOrgPeople;
