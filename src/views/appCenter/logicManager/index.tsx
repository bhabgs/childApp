import { defineComponent, ref } from "vue";
import { useRouter } from "vue-router";
import { useClipboard } from "@vueuse/core";
import { useEvent, useModalVisible, useTableList } from "inl-ui/dist/hooks";
import { transformTime } from "@/utils/format";
import QueryFilter from "./queryFilter";
import AddModal from "./addModal";
import { Modal, message } from "ant-design-vue";
import * as api from "@/api/appCenter/logicManager";

const columns = [
  { title: "逻辑名称", dataIndex: "name" },
  { title: "逻辑分类", dataIndex: "scopeString" },
  { title: "逻辑code", dataIndex: "code" },
  { title: "版本号", dataIndex: "version" },
  {
    title: "更新时间",
    dataIndex: "updateDate",
    customRender({ text }) {
      if (text) {
        return transformTime(text);
      }
      return "";
    },
  },
  // { title: "更新人", dataIndex: "updateUser" },
  { title: "详细描述", dataIndex: "description" },
  { key: "action", title: "操作", width: 300 },
];

/**
 * 逻辑管理
 */
const LogicManager = defineComponent({
  setup() {
    const router = useRouter();
    const { copy } = useClipboard({ legacy: true });

    const { currPage, pageSize, pagination, isLoading, tableList, refresh } =
      useTableList(
        () =>
          api.getLogicByPage({
            pageNum: currPage.value,
            pageSize: pageSize.value,
            scope: form.value.scope ?? "",
            name: form.value.name,
          }),
        "data",
        "total"
      );

    const form = ref<any>({});
    const handleSearch = (f) => {
      form.value = f;
      currPage.value = 1;
      refresh();
    };

    const handleDetial = (row, isEdit) => {
      router.push({
        name: "logicDetail",
        params: { id: row.id },
        query: {
          name: `逻辑详情 ${row.name}`,
          isEdit: String(isEdit),
        },
      });
    };

    const handleDelete = (row) => {
      Modal.confirm({
        title: "提示",
        content: `确定删除逻辑“${row.name}”吗？`,
        async onOk() {
          await api.deleteLogicById(row.id);
          message.success("删除成功");
        },
      });
    };

    const handleCopy = (row) => {
      copy(row.code).then(() => {
        message.success("复制成功");
      });
    };

    const [isAddVisible, handleAddClick] = useModalVisible();

    useEvent("logicManagerRefresh", refresh);

    return () => (
      <div class="logic-manager">
        <QueryFilter onSearch={handleSearch} />
        <inl-layout-table>
          {{
            opt: () => (
              <a-space>
                <a-button type="primary" onClick={handleAddClick}>
                  新增
                </a-button>
                <a-button>云端下载</a-button>
              </a-space>
            ),
            content: () => (
              <a-table
                loading={isLoading.value}
                pagination={pagination}
                columns={columns}
                dataSource={tableList.value}
                v-slots={{
                  bodyCell: ({ column, record }) => {
                    if (column.key === "action") {
                      return (
                        <>
                          <a-button
                            type="link"
                            size="small"
                            onClick={() => handleDetial(record, false)}
                          >
                            详情
                          </a-button>
                          <a-button
                            type="link"
                            size="small"
                            onClick={() => handleDetial(record, true)}
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
                          <a-button
                            type="link"
                            size="small"
                            onClick={() => handleCopy(record)}
                          >
                            复制code
                          </a-button>
                        </>
                      );
                    }
                  },
                }}
              ></a-table>
            ),
          }}
        </inl-layout-table>

        <AddModal v-model:visible={isAddVisible.value} onRefresh={refresh} />
      </div>
    );
  },
});

export default LogicManager;
