import { computed, defineComponent, onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import useTableList from "@/hooks/useTableList";
import { statusEnum } from "./config";
import { transformTime } from "@/utils/format";
import QueryFilter from "./queryFilter";
import { Modal, message } from "ant-design-vue";
import UpdateModal from "./updateModal";
import api from "@/api/report";
import { useModalVisible } from "inl-ui/dist/hooks";
import { useClipboard } from "@vueuse/core";

// 设计角色
const desinerRoles = ["RPT_DESIGN", "admin", "root"];
// 编辑角色
const editorRoles = ["RPT_DATA_EDIT", "admin", "root"];

const getUrl = (name: string, action = "preview", isEditor = false) =>
  `/ureport/${action}?_u=file:${encodeURI(name)}.ureport.xml&editor=${Number(
    isEditor
  )}`;

const columns = [
  {
    title: "序号",
    customRender({ index }) {
      return index + 1;
    },
  },
  {
    title: "名称",
    dataIndex: "name",
  },
  {
    title: "状态",
    dataIndex: "status",
    customRender({ text }) {
      return statusEnum.find((item) => item.value === text)?.label;
    },
  },
  {
    title: "创建人",
    dataIndex: "createUser",
  },
  {
    title: "创建时间",
    dataIndex: "createDt",
    width: 200,
    customRender({ text }) {
      return transformTime(text);
    },
  },
  {
    title: "修改人",
    dataIndex: "updateUser",
  },
  {
    title: "修改时间",
    dataIndex: "updateDt",
    customRender({ text }) {
      return transformTime(text);
    },
  },
  {
    title: "操作",
    key: "action",
    width: 280,
  },
];

/**
 * 报表管理
 */
const ReportManager = defineComponent({
  setup() {
    const router = useRouter();
    const { copy } = useClipboard({ legacy: true });

    const userRoleList = ref<any[]>([]);
    const getUserRoleList = async () => {
      const userinfo = JSON.parse(sessionStorage.getItem("userinfo") || "{}");
      const { data } = await api.getUserPermission(userinfo.userId);
      userRoleList.value = data;
    };
    onMounted(getUserRoleList);

    const isDesigner = computed(() =>
      userRoleList.value.some((role) => desinerRoles.includes(role.code))
    );
    const isEditor = computed(() =>
      userRoleList.value.some((role) => editorRoles.includes(role.code))
    );

    const { currPage, pageSize, pagination, refresh, tableList, isLoading } =
      useTableList(
        () =>
          api.getReportPage({
            name: form.value.name,
            pageNum: currPage.value,
            pageSize: pageSize.value,
          }),
        "list",
        "total"
      );

    const form = ref<any>({});
    const handleSearch = (params: any) => {
      form.value = params;
      currPage.value = 1;
      refresh();
    };

    const handleDelete = (row) => {
      Modal.confirm({
        title: "提示",
        content: `确定删除报表“${row.name}”吗？`,
        async onOk() {
          await api.reportmgmtDel(row.id);
          message.success("删除成功");
          refresh();
        },
      });
    };

    const handlePreview = (row, action: string) => {
      const routeName = action === "preview" ? "reportDetail" : "reportDesign";

      router.push({
        name: routeName,
        params: { id: row.id },
        query: {
          name: `${row.name} - 报表${action === "preview" ? "预览" : "设计"}`,
        },
      });
    };

    const handleCopy = (row) => {
      const url = `/mtip-developer-center/reportTable/detail/${row.id}`;
      copy(url).then(() => {
        message.success("复制成功");
      });
    };

    const [isUpdateVisible, handleUpdateClick, updateRecord] =
      useModalVisible();

    return () => (
      <div class="report-manager">
        <QueryFilter onSearch={handleSearch} />
        <inl-layout-table>
          {{
            opt: () => (
              <a-space>
                <a-button type="primary" onClick={() => handleUpdateClick({})}>
                  新建
                </a-button>
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
                            onClick={() => handleUpdateClick(record)}
                          >
                            编辑
                          </a-button>
                          {isDesigner.value && (
                            <a-button
                              type="link"
                              size="small"
                              onClick={() => handlePreview(record, "designer")}
                            >
                              设计
                            </a-button>
                          )}
                          <a-button
                            type="link"
                            size="small"
                            onClick={() => handlePreview(record, "preview")}
                          >
                            预览
                          </a-button>
                          <a-button
                            type="link"
                            size="small"
                            onClick={() => handleCopy(record)}
                          >
                            复制地址
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

        <UpdateModal
          record={updateRecord.value}
          v-model:visible={isUpdateVisible.value}
          onRefresh={refresh}
        />
      </div>
    );
  },
});

export default ReportManager;
