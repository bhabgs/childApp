import { defineComponent, onMounted, ref } from "vue";
import { useEvent, useModalVisible, useTableList } from "inl-ui/dist/hooks";
import * as api from "@/api/appCenter/appManager";
import { SearchOutlined } from "@ant-design/icons-vue";
import AddAppModal from "../modals/addAppModal";

const columns = [
  {
    title: "序号",
    customRender({ index }) {
      return String(index + 1).padStart(4, "0");
    },
  },
  { title: "应用名称", dataIndex: "fullname" },
  { title: "名称缩写", dataIndex: "name" },
  { title: "版本号", dataIndex: "version" },
  // { title: "更新人", dataIndex: "updateUser" },
  {
    title: "应用名称",
    dataIndex: "status",
    customRender({ text }) {
      return text === "production" ? (
        <a-tag color="green">已发布</a-tag>
      ) : (
        <a-tag>未发布</a-tag>
      );
    },
  },
  { title: "发布时间", dataIndex: "productionTime" },
  { title: "详细描述", dataIndex: "description" },
  { title: "操作", key: "action", width: 240 },
];

/**
 * 表格视图
 */
const TableView = defineComponent({
  emits: ["detail", "edit", "add", "toggleView", "delete", "release"],
  setup(props, { emit, slots }) {
    const form = ref<any>({});
    const { isLoading, tableList, refresh } = useTableList(async () => {
      const { data } = await api.getAllAppList({
        status: form.value.status,
        key: form.value.keyword,
      });
      return { data: data.list };
    });
    onMounted(refresh);

    const handleDelete = (row) => {
      emit("delete", row, refresh);
    };
    const handleRelease = (row) => {
      emit("release", row, refresh);
    };
    const [isAddVisible, handleAddClick] = useModalVisible();
    useEvent("appManagerRefresh", refresh);

    return () => {
      const toggleSlot = slots.toggle?.();

      return (
        <div class="table-view">
          <a-form style={{ marginBottom: "24px" }} layout="inline">
            <a-form-item label="发布状态">
              <a-select
                style={{ width: "200px" }}
                placeholder="请选择"
                v-model:value={form.value.status}
              ></a-select>
            </a-form-item>
            <a-form-item style={{ marginLeft: "auto" }}>
              <a-input
                placeholder="输入卡片关键词"
                suffix={<SearchOutlined />}
                allowClear
                v-model:value={form.value.keyword}
                onPressEnter={refresh}
              ></a-input>
            </a-form-item>
            <a-button type="primary" onClick={refresh}>
              查询
            </a-button>
          </a-form>
          <inl-layout-table>
            {{
              opt: () => (
                <a-space>
                  <a-button type="primary" onClick={handleAddClick}>
                    新增应用
                  </a-button>
                  <a-button>云端上传</a-button>
                </a-space>
              ),
              // search: () => toggleSlot,
              content: () => (
                <a-table
                  loading={isLoading.value}
                  pagination={false}
                  columns={columns}
                  scroll={{ y: 600 }}
                  dataSource={tableList.value}
                  v-slots={{
                    bodyCell: ({ column, record }) => {
                      if (column.key === "action") {
                        return (
                          <>
                            <a-button
                              type="link"
                              size="small"
                              onClick={() => emit("detail", record)}
                            >
                              详情
                            </a-button>
                            <a-button
                              type="link"
                              size="small"
                              onClick={() => emit("edit", record)}
                            >
                              修改
                            </a-button>
                            <a-button
                              type="link"
                              size="small"
                              onClick={() => handleDelete(record)}
                            >
                              删除
                            </a-button>
                            {record.status !== "production" && (
                              <a-button
                                type="link"
                                size="small"
                                onClick={() => handleRelease(record)}
                              >
                                发布
                              </a-button>
                            )}
                          </>
                        );
                      }
                    },
                  }}
                ></a-table>
              ),
            }}
          </inl-layout-table>

          <AddAppModal
            onRefresh={refresh}
            v-model:visible={isAddVisible.value}
          />
        </div>
      );
    };
  },
});

export default TableView;
