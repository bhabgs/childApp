import { defineComponent, onMounted, ref, watch } from "vue";
import { useEvent, useModalVisible } from "inl-ui/dist/hooks";
import { ALL_GROUP } from "../config";

import * as api from "@/api/appCenter/appManager";
import AddGroupModal from "../modals/addGroupModal";
import { Modal, message } from "ant-design-vue";
import { CloseOutlined, SearchOutlined } from "@ant-design/icons-vue";
import ThumbnailItem from "@/components/thumbnail-item";

/**
 * 卡片视图
 */
const CardView = defineComponent({
  emits: ["add", "detail", "edit", "delete", "release"],
  setup(props, { emit, slots }) {
    const activeTab = ref(ALL_GROUP);

    const groupList = ref<any[]>([]);
    const getGroup = async () => {
      const { data } = await api.getGroupList();
      groupList.value = [{ id: ALL_GROUP, groupName: "全部" }].concat(data);
    };
    onMounted(getGroup);
    const handleDelete = (group) => {
      if (group.id === ALL_GROUP || !group.id) return;
      Modal.confirm({
        title: "提示",
        content: `确认删除分组“${group.groupName}”吗？`,
        async onOk() {
          console.log("删除");
        },
      });
    };
    const [isAddGroupShow, handleAddGroupClick] = useModalVisible();

    const isLoading = ref(false);
    const appList = ref<any[]>([]);
    const keyword = ref("");
    const getAppList = async () => {
      isLoading.value = true;
      try {
        const { data } = await api.getAllAppList({
          groupId: activeTab.value !== ALL_GROUP ? activeTab.value : undefined,
          keyword: keyword.value,
        });
        appList.value = data.list;
      } finally {
        isLoading.value = false;
      }
    };
    useEvent("appManagerRefresh", getAppList);
    watch(() => activeTab.value, getAppList, { immediate: true });

    const handleAction = async (app, state) => {
      await api.excuteAppAction(app.id, state);
      message.success("执行成功");
      getAppList();
    };

    return () => {
      const toggleSlot = slots.toggle?.();

      return (
        <div class="card-view">
          <a-tabs
            v-model:activeKey={activeTab.value}
            v-slots={{
              rightExtra: () => (
                <a-button type="primary" onClick={handleAddGroupClick}>
                  添加分组
                </a-button>
              ),
            }}
          >
            {groupList.value.map((item, index) => (
              <a-tab-pane
                key={item.id}
                v-slots={{
                  tab: () => (
                    <span
                      class={["tab-name", item.id !== ALL_GROUP && "has-close"]}
                    >
                      {item.groupName}
                      {/* {item.count !== undefined && `(${item.count})`} */}
                      {item.id !== ALL_GROUP && (
                        <span
                          class="btn-close"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(item);
                          }}
                        >
                          <CloseOutlined />
                        </span>
                      )}
                    </span>
                  ),
                }}
              >
                <div class="app-content">
                  <div class="operator">
                    <a-space>
                      <a-button type="primary" onClick={() => emit("add")}>
                        添加应用
                      </a-button>
                      {/* <a-button>批量删除</a-button> */}
                    </a-space>
                    <a-input
                      style={{ width: "320px" }}
                      placeholder="输入关键词搜索应用"
                      suffix={<SearchOutlined />}
                      allowClear
                      v-model:value={keyword.value}
                    ></a-input>
                  </div>
                  <a-spin spinning={isLoading.value}>
                    <div class="app-list">
                      {appList.value.length > 0 ? (
                        <a-row gutter={[16, 16]}>
                          {appList.value.map((item) => (
                            <a-col key={item.id} span={6}>
                              <ThumbnailItem
                                name={item.fullname}
                                release={item.status === "production"}
                                showActions
                                onDelete={() =>
                                  emit("delete", item, getAppList)
                                }
                                onRelease={() =>
                                  emit("release", item, getAppList)
                                }
                                onEdit={() => () => emit("detail", item)}
                                onAction={(key) => handleAction(item, key)}
                              />
                            </a-col>
                          ))}
                        </a-row>
                      ) : (
                        <a-empty></a-empty>
                      )}
                    </div>
                  </a-spin>
                </div>
              </a-tab-pane>
            ))}
          </a-tabs>

          <AddGroupModal
            v-model:visible={isAddGroupShow.value}
            onRefresh={getGroup}
          />
        </div>
      );
    };
  },
});

export default CardView;
