import { computed, defineComponent, ref } from "vue";
import { useRoute } from "vue-router";
import _ from "lodash";

import { QuestionCircleOutlined } from "@ant-design/icons-vue";
import QueryFilter from "./queryFilter";
import useTableList from "@/hooks/useTableList";
import AddTag from "./addTag";
import api from "@/api/PRE";
import { Modal, message } from "ant-design-vue";

const columns = [
  {
    title: "协议数据单元",
    dataIndex: "pduCode",
  },
  {
    title: "标签",
    dataIndex: "pointCode",
  },
  {
    title: "地址",
    dataIndex: "address",
  },
  {
    title: "描述",
    dataIndex: "pointDescription",
  },
  {
    title: "数据类型",
    width: 120,
    dataIndex: "dataType",
  },
  {
    title: "读写类型",
    width: 100,
    dataIndex: "writeEnableString",
  },
  {
    title: "用户权限",
    width: 100,
    dataIndex: "userAccessLevelString",
  },
  {
    key: "action",
    title: "操作",
    width: 240,
    customHeaderCell(column) {
      column.title = (
        <a-space size={4}>
          操作
          <a-tooltip title="仅可读写的标签可开启写权限">
            <QuestionCircleOutlined />
          </a-tooltip>
        </a-space>
      );
    },
  },
];

/**
 * 标签表格
 */
const TagTable = defineComponent({
  setup() {
    const form = ref<any>({});

    const addTageRef = ref<any>();

    const { params } = useRoute();

    const visible = ref(false);
    const { isLoading, tableList, refresh } = useTableList(() =>
      api.getCodeByUser(form.value)
    );
    const handleSearch = (params: any) => {
      form.value = params;
      refresh();
    };

    const handleDelete = (row) => {
      Modal.confirm({
        title: "提示",
        content: `确认删除标签“${row.pointCode}”吗？`,
        async onOk() {
          await handleBatchDelete([row.pointCode]);
        },
      });
    };

    const selectKeys = ref<string[]>([]);
    const handleSelectChange = (keys: string[]) => {
      selectKeys.value = keys;
    };

    // 批量删除
    const handleBatchDelete = async (values) => {
      try {
        await api.deleteCodeWithUser(values, params.id);
        message.success("删除成功");
        selectKeys.value = [];
      } catch (error) {}
      refresh();
    };

    // 批量关闭/开启写权限
    const handleBatchClose = async (pointCodes, userAccessLevelString) => {
      try {
        await api.editUserAccess(
          params.id,
          pointCodes.join(","),
          userAccessLevelString
        );
        message.success("操作成功");
        refresh();
      } catch (error) {}
    };

    // 是否可以批量操作
    const isBatch = () => {
      return !(selectKeys.value.length > 0);
    };

    const addLoading = ref(false);
    const handleAddTag = async () => {
      addLoading.value = true;
      try {
        await addTageRef.value.save();
        message.success("新增成功");
        refresh();
        visible.value = false;
      } finally {
        addLoading.value = false;
      }
    };

    return () => (
      <div class="tag-table">
        <QueryFilter onSearch={handleSearch} />
        <inl-layout-table>
          {{
            opt: () => (
              <a-space>
                <a-button
                  type="primary"
                  onClick={() => {
                    visible.value = true;
                  }}
                >
                  新增标签
                </a-button>
                <a-button
                  disabled={isBatch()}
                  onClick={() => {
                    Modal.confirm({
                      title: "提示",
                      content: `确定删除选中的${selectKeys.value.length}个标签吗？`,
                      onOk() {
                        handleBatchDelete(selectKeys.value);
                      },
                    });
                  }}
                >
                  批量删除
                </a-button>
                <a-button
                  onClick={() => {
                    handleBatchClose(selectKeys.value, 1);
                  }}
                  disabled={isBatch()}
                >
                  批量开启写权限
                </a-button>
                <a-button
                  onClick={() => {
                    handleBatchClose(selectKeys.value, 0);
                  }}
                  disabled={isBatch()}
                >
                  批量关闭写权限
                </a-button>
              </a-space>
            ),
            content: () => (
              <a-table
                loading={isLoading.value}
                pagination={{
                  showQuickJumper: true,
                  showSizeChanger: true,
                  showTotal: (total: number) => `共 ${total} 条`,
                }}
                rowSelection={{
                  preserveSelectedRowKeys: true,
                  selectedRowKeys: selectKeys.value,
                  onChange: handleSelectChange,
                }}
                rowKey="pointCode"
                columns={columns}
                dataSource={tableList.value}
                v-slots={{
                  bodyCell: ({ column, record }) => {
                    const txt =
                      record.userAccessLevel === 0
                        ? "开启写权限"
                        : "关闭写权限";

                    if (column.key === "action") {
                      return (
                        <a-space>
                          <a-button
                            disabled={!record.writeEnableString}
                            type="link"
                            onClick={() => {
                              handleBatchClose(
                                [record.pointCode],
                                record.userAccessLevel === 1 ? 0 : 1
                              );
                            }}
                          >
                            {txt}
                          </a-button>
                          <a-button type="link">详情</a-button>
                          <a-button
                            type="link"
                            onClick={() => handleDelete(record)}
                          >
                            删除
                          </a-button>
                        </a-space>
                      );
                    }
                  },
                }}
              ></a-table>
            ),
          }}
        </inl-layout-table>
        <a-modal
          bodyStyle={{ height: "500px", overFlow: "auto" }}
          destroyOnClose
          okButtonProps={{ loading: addLoading.value }}
          v-model:visible={visible.value}
          title="添加标签"
          onOk={handleAddTag}
          width={1100}
          maxHeight={800}
        >
          <AddTag ref={addTageRef} />
        </a-modal>
      </div>
    );
  },
});

export default TagTable;
