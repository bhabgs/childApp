import "@/assets/style/pages/workorderManage/workorderSkillGroup/index.less";
import { defineComponent, ref, onMounted, watch } from "vue";
import { useTableList } from "inl-ui/dist/hooks";
import _ from "lodash";
import { message } from "ant-design-vue";

import EditWorkorderSkillGroup from "./EditWorkorderSkillGroup";
// import SelectOrgPeople from "@/components/selectOrgPeople";
import { PeopleSelect } from "inl-ui/dist/components";
import * as api from "@/api/workorderManage/workorderSkillGroup";

const columns = [
  // {
  //   dataIndex: "memberId",
  //   title: "id",
  // },
  {
    dataIndex: "account",
    title: "用户名",
  },
  {
    dataIndex: "name",
    title: "姓名",
    ellipsis: true,
  },
  {
    title: "操作",
    key: "operation",
    fixed: "right",
    width: 120,
  },
];

export default defineComponent({
  name: "WorkorderSkillGroup",
  setup(props, context) {
    const depPeopleList = ref<any[]>([]);
    const getDepPeopleList = async () => {
      const { data } = await api.getDepPeopleTreeList();
      depPeopleList.value = data.departmentList;
    };
    onMounted(getDepPeopleList);

    // table
    const { currPage, isLoading, refresh, tableList, pagination } =
      useTableList(() =>
        api.findMemberListByGroup({ argSkillGroupId: currentGroup.value.id })
      );

    // 添加用户
    const originUserList = ref<any>([]);
    watch(
      tableList,
      (val) => {
        originUserList.value = _.cloneDeep(val).map((item) => item.memberId);
      },
      { immediate: true, deep: true }
    );
    const handleAddPeople = async (val) => {
      const removed = _.difference<string>(originUserList.value, val)
        .map((item) => {
          const obj = tableList.value.find((ele) => ele.memberId === item);
          if (obj) {
            return obj.id;
          }
        })
        .filter(Boolean);
      const add = _.difference<string>(val, originUserList.value);
      const removeReq = removed.map((item) => api.delMember(item));
      const addReq = add.map((item) =>
        api.memberSave({
          memberId: item,
          skillGroupId: currentGroup.value.id,
        })
      );
      await Promise.all([...removeReq, ...addReq]);
      message.success("保存成功");
      currPage.value = 1;
      refresh();
    };

    const groupList = ref([]);
    const getGroupList = async () => {
      const resp = await api.findListByName({
        pageNum: 1,
        pageSize: 10000,
      });

      groupList.value = resp.data;
      if (
        !currentGroup.value ||
        !groupList.value.some((item: any) => item.id === currentGroup.value.id)
      ) {
        currentGroup.value = groupList.value[0];
      }
    };
    onMounted(getGroupList);

    const delGroup = async (group) => {
      try {
        await api.removeGroup(group.id);
        message.success("删除成功");
        getGroupList();
      } catch (e: any) {
        message.error(e.msg);
      }
    };

    const isEdit = ref(false);
    const showEdit = ref(false);
    const currentGroup = ref();

    watch(currentGroup, () => {
      currPage.value = 1;
      refresh();
    });

    const del = async (row) => {
      await api.delMember(row.id);
      message.success("删除成功");
      refresh();
    };

    return () => (
      <div class="WorkorderSkillGroup flex">
        <div class="left flex">
          <div class="top flex-center">
            <div class="title">工单技能组</div>
            <a-button
              type="primary"
              onClick={() => {
                isEdit.value = false;
                showEdit.value = true;
              }}
            >
              添加
            </a-button>
          </div>

          <div class="groupBox flex1">
            {groupList.value.map((group: any) => (
              <div
                class={[
                  "group flex-center",
                  currentGroup.value?.id === group.id && "current",
                ]}
                key={group.id}
                onClick={() => {
                  currentGroup.value = group;
                }}
              >
                <div class="name flex1" title={group.name}>
                  {group.name}
                </div>
                <div>
                  <a-button
                    type="link"
                    size="small"
                    onClick={() => {
                      currentGroup.value = group;
                      isEdit.value = true;
                      showEdit.value = true;
                    }}
                  >
                    编辑
                  </a-button>

                  <a-popconfirm
                    title="确认删除？"
                    onConfirm={() => {
                      delGroup(group);
                    }}
                  >
                    <a-button type="link" size="small">
                      删除
                    </a-button>
                  </a-popconfirm>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div class="right flex flex1">
          <div class="titleLine flex">
            <div class="titleBox flex-center">
              <div class="title">{currentGroup.value?.name}</div>
              <div>ID:{currentGroup.value?.id}</div>
            </div>
          </div>
          <inl-layout-table style={{ flex: "auto" }}>
            {{
              opt: () => (
                <PeopleSelect
                  list={depPeopleList.value}
                  value={originUserList.value}
                  onUpdate:value={handleAddPeople}
                />
              ),
              content: () => (
                <a-table
                  dataSource={tableList.value}
                  columns={columns}
                  // pagination={pagination}
                  loading={isLoading.value}
                  rowKey="id"
                  class="workorderSkillGroupTable"
                  v-slots={{
                    bodyCell: ({ column, record, index }: any) => {
                      // 操作
                      if (column.key === "operation") {
                        return (
                          <a-popconfirm
                            title="确认删除？"
                            onConfirm={() => {
                              del(record);
                            }}
                          >
                            <a-button type="link" size="small">
                              删除
                            </a-button>
                          </a-popconfirm>
                        );
                      }
                    },
                  }}
                ></a-table>
              ),
            }}
          </inl-layout-table>
          {/* <div class="title">成员：</div> */}
        </div>

        <EditWorkorderSkillGroup
          v-models={[[showEdit.value, "showEdit"]]}
          currentGroup={currentGroup.value}
          isEdit={isEdit.value}
          onRefreshGroup={getGroupList}
        />
      </div>
    );
  },
});
