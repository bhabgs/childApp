import { defineComponent, onMounted } from "vue";
import { useRouter } from "vue-router";
import useTableList from "@/hooks/useTableList";
import { getLogicListByAppId } from "@/api/appCenter/logicManager";
import { transformTime } from "@/utils/format";

const columns = [
  { title: "逻辑名称", dataIndex: "name" },
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
  { title: "详细描述", dataIndex: "description" },
  { title: "操作", key: "action", width: 100 },
];

/**
 * 全局脚本
 */
const ScriptGlobal = defineComponent({
  props: {
    appId: {
      type: String,
      required: true,
    },
  },
  setup(props) {
    const router = useRouter();

    const { isLoading, tableList, refresh } = useTableList(() =>
      getLogicListByAppId(props.appId)
    );
    onMounted(refresh);

    const handleDetail = (row) => {
      router.push({
        name: "logicDetail",
        params: { id: row.id },
        query: {
          name: `逻辑详情 ${row.name}`,
          isEdit: String(false),
          noAction: 1,
        },
      });
    };

    return () => (
      <div class="script-global">
        <inl-layout-table>
          {{
            content: () => (
              <a-table
                loading={isLoading.value}
                pagination={false}
                columns={columns}
                dataSource={tableList.value}
                scroll={{ y: 520 }}
              >
                {{
                  bodyCell: ({ column, record }) => {
                    if (column.key === "action") {
                      return (
                        <a-button
                          type="link"
                          size="small"
                          onClick={() => handleDetail(record)}
                        >
                          详情
                        </a-button>
                      );
                    }
                  },
                }}
              </a-table>
            ),
          }}
        </inl-layout-table>
      </div>
    );
  },
});

export default ScriptGlobal;
