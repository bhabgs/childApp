import { defineComponent, onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import { useClipboard } from "@vueuse/core";
import useTableList from "@/hooks/useTableList";
import * as api from "@/api/appCenter/appManager";
import { message } from "ant-design-vue";

const columns = [
  { title: "参数名称", dataIndex: "fullname" },
  { title: "被调应用", dataIndex: "fullname" },
  { title: "更新时间", dataIndex: "" },
  { title: "更新人", dataIndex: "" },
  { title: "详细描述", dataIndex: "description" },
  { title: "操作", key: "action", width: 220 },
];

/**
 * 参数管理
 */
const ParamManager = defineComponent({
  setup() {
    const router = useRouter();
    const { copy } = useClipboard({ legacy: true });
    const keyword = ref("");

    const { tableList, isLoading, refresh } = useTableList(
      () => api.getAllAppList({}),
      "list",
      "totalCount"
    );
    onMounted(refresh);

    const handleDetail = (item) => {
      router.push({
        name: "paramDetail",
        params: { id: item.id },
        query: {
          name: `参数编辑 ${item.fullname}`,
        },
      });
    };

    const handlePreview = (item) => {
      router.push({
        name: "paramPreview",
        params: { id: item.id },
        query: {
          name: `参数预览 ${item.fullname}`,
        },
      });
    };

    const handleCopy = (item) => {
      const url = `/mtip-developer-center/appCenter/paramProduction/${item.id}`;
      copy(url).then(() => {
        message.success("复制成功");
      });
    };

    return () => (
      <div class="param-manager">
        <inl-layout-table>
          {{
            opt: () => <a-button type="primary">新增</a-button>,
            search: () => (
              <a-space>
                <a-input
                  placeholder="请输入关键字"
                  allowClear
                  v-model:value={keyword.value}
                ></a-input>
                <a-button type="primary">查询</a-button>
              </a-space>
            ),
            content: () => (
              <a-table
                loading={isLoading.value}
                pagination={false}
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
                            onClick={() => handlePreview(record)}
                          >
                            预览
                          </a-button>
                          <a-button
                            type="link"
                            size="small"
                            onClick={() => handleDetail(record)}
                          >
                            修改
                          </a-button>
                          <a-button type="link" size="small">
                            删除
                          </a-button>
                          <a-button
                            type="link"
                            size="small"
                            onClick={() => handleCopy(record)}
                          >
                            复制
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
        {/* {tableList.value.length > 0 ? (
          <a-row gutter={[16, 16]}>
            {tableList.value.map((item: any) => (
              <a-col span={6}>
                <ThumbnailItem
                  key={item.id}
                  editText="编辑参数"
                  previewText="预览参数"
                  hideTools
                  name={item.fullname}
                  release={item.status === "production"}
                  onEdit={() => handleDetail(item)}
                  onPreview={() => handlePreview(item)}
                  onCopy={() => handleCopy(item)}
                />
              </a-col>
            ))}
          </a-row>
        ) : (
          <a-empty></a-empty>
        )} */}
      </div>
    );
  },
});

export default ParamManager;
