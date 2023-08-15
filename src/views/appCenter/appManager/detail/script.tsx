import { defineComponent, nextTick, onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import { useSortable } from "@vueuse/integrations/useSortable";
import { useTableList } from "inl-ui/dist/hooks";
import { useEvent } from "inl-ui/dist/hooks";
import { asyncList, runList } from "../scriptDetail";
import { HolderOutlined } from "@ant-design/icons-vue";
import * as api from "@/api/appCenter/appManager";
import { Modal, message } from "ant-design-vue";

const columns = [
  {
    key: "handle",
    width: 50,
  },
  {
    title: "执行顺序",
    dataIndex: "sort",
    customRender({ text }) {
      return text + 1;
    },
    width: 100,
  },
  {
    title: "脚本名称",
    dataIndex: "name",
  },
  {
    title: "同异步执行",
    dataIndex: "syncExecute",
    width: 120,
    customRender({ text }) {
      return asyncList.find((item) => item.value === text)?.label;
    },
  },
  {
    title: "运行方式",
    dataIndex: "exclusiveThread",
    width: 120,
    customRender({ text }) {
      return runList.find((item) => item.value === text)?.label;
    },
  },
  {
    title: "超时时间(ms)",
    dataIndex: "timeout",
    width: 150,
    customRender({ text }) {
      if (text === -1) {
        return "";
      }
    },
  },
  {
    title: "描述",
    dataIndex: "description",
  },
  {
    key: "action",
    title: "操作",
    width: 180,
  },
];

/**
 * 应用脚本
 */
const Script = defineComponent({
  props: {
    appId: {
      type: String,
      required: true,
    },
  },
  setup(props, { emit }) {
    const router = useRouter();

    const list = ref([]);
    const tableRef = ref();
    onMounted(() => {
      tableRef.value = document.querySelector(".script .ant-table-tbody");
    });
    const { isLoading, tableList, refresh } = useTableList(() =>
      api.getAppScript(props.appId)
    );
    onMounted(refresh);

    useSortable(tableRef, tableList, {
      handle: ".handle",
      async onUpdate(e) {
        const { oldIndex, newIndex } = e;
        const sortScript = tableList.value[oldIndex];
        await api.sortAppScript({
          appId: props.appId,
          scriptId: sortScript.id,
          sort: newIndex,
        });
        message.success("排序成功");
        refresh();
      },
    });

    const handleAdd = () => {
      router.push({
        name: "scriptDetail",
        params: { id: "add" },
        query: {
          name: "添加脚本",
          appId: props.appId,
          isEdit: String(true),
        },
      });
    };

    const handleDetail = (row) => {
      router.push({
        name: "scriptDetail",
        params: { id: row.id },
        query: {
          name: `脚本详情 ${row.name}`,
          appId: props.appId,
          isEdit: String(false),
        },
      });
    };

    const handleDelete = (row) => {
      Modal.confirm({
        title: "提示",
        content: `确定删除脚本“${row.name}”吗？`,
        async onOk() {
          await api.deleteAppScript(row.id);
          message.success("删除成功");
          refresh();
        },
      });
    };

    useEvent("scriptDetailRefresh", refresh);

    return () => (
      <div class="script">
        <inl-layout-table>
          {{
            opt: () => (
              <a-button type="primary" onClick={handleAdd}>
                添加
              </a-button>
            ),
            content: () => (
              <a-table
                rowKey="id"
                loading={isLoading.value}
                columns={columns}
                pagination={false}
                dataSource={tableList.value}
                scroll={{ y: 520 }}
                v-slots={{
                  bodyCell: ({ column, record }) => {
                    if (column.key === "handle") {
                      return (
                        <span class="handle">
                          <HolderOutlined />
                        </span>
                      );
                    }
                    if (column.key === "action") {
                      return (
                        <>
                          <a-button
                            type="link"
                            size="small"
                            onClick={() => handleDetail(record)}
                          >
                            详情
                          </a-button>
                          <a-button
                            type="link"
                            size="small"
                            onClick={() => handleDelete(record)}
                          >
                            删除
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
      </div>
    );
  },
});

export default Script;
