import { defineComponent, ref, watch } from "vue";
import { message } from "ant-design-vue";
import { useTableList } from "inl-ui/dist/hooks";

import dayjs from "dayjs";
import "@/assets/style/pages/bpmnCenter/BpmnDesign/EditVersion.less";

import * as api from "@/api/processCenter/bpmnDesign";

const columns = [
  // {
  //   dataIndex: "id",
  //   title: "字段ID",
  //   width: 160,
  // },
  {
    dataIndex: "name",
    title: "流程名称",
    ellipsis: true,
    width: 200,
  },
  {
    key: "flowVersion",
    title: "版本号",
  },
  {
    dataIndex: "deployDescription",
    title: "备注",
    ellipsis: true,
    width: 200,
  },
  {
    key: "updateDt",
    title: "更新时间",
    width: 160,
  },
  {
    title: "操作",
    key: "operation",
    fixed: "right",
    width: 200,
  },
];

export default defineComponent({
  props: {
    showVersion: {
      type: Boolean,
      default: false,
    },
    currentRow: {
      type: Object,
      default: () => ({}),
    },
    showEdit: {
      type: Boolean,
      default: false,
    },
  },

  emits: ["update:showVersion", "refresh", "toEdit"],
  setup(props, context) {
    // table
    const {
      currPage,
      isLoading,
      refresh,
      tableList,
      handlePageChange,
      total,
      hanldePageSizeChange,
      pageSize,
      pagination,
    } = useTableList(() => getList(), "list", "total");

    const getList = async () => {
      const resp = await api.findPageByCondition({
        argProcessDefinitionKey: props.currentRow.processDefinitionKey,
        pageNum: currPage.value,
        pageSize: pageSize.value,
      });

      return resp;
    };

    watch(
      () => props.showVersion,
      async (nVal) => {
        if (nVal) {
          refresh();
        }
      }
    );

    const currentRecord = ref();
    const showEdit = ref(false);

    const cancelModal = () => {
      context.emit("update:showVersion", false);
    };

    const publishHandle = async (row) => {
      const resp: any = await api.deployProcess({
        processDefinitionKey: row.processDefinitionKey,
      });
      if (resp.message === "OK") {
        message.success("发布成功");
        refresh();

        context.emit("refresh");
      }
    };

    const useCurrentHandle = async (row) => {
      const resp: any = await api.modifyBeingUsed({
        processDefinitionId: row.processDefinitionId,
        processDefinitionKey: row.processDefinitionKey,
        beingUsed: true,
        enabled: true,
      });
      if (resp.message === "OK") {
        message.success("成功");
        refresh();

        context.emit("refresh");
      }
    };

    return () => (
      <div class="EditVersion">
        <a-modal
          wrapClassName="EditVersionModal"
          centered
          width={950}
          mask={!props.showEdit}
          title="编辑版本"
          v-model={[props.showVersion, "visible"]}
          onCancel={cancelModal}
          footer={null}
        >
          <a-table
            dataSource={tableList.value}
            columns={columns}
            pagination={pagination}
            loading={isLoading.value}
            rowKey="id"
            class="EditVersionTable"
            v-slots={{
              bodyCell: ({ column, record, index }: any) => {
                // 版本号
                if (column.key === "flowVersion") {
                  let btnName;
                  if (record.flowVersion === -1) {
                    btnName = "无（草稿）";
                  } else if (record.flowVersion && record.beingUsed) {
                    btnName = `V${record.flowVersion}（当前版本）`;
                  } else {
                    btnName = `V${record.flowVersion}`;
                  }
                  return btnName;
                }

                if (column.key === "updateDt") {
                  return dayjs(record.updateDt).format("YYYY-MM-DD HH:mm:ss");
                }

                // 操作
                if (column.key === "operation") {
                  return (
                    <div class="operation flex">
                      <a-button
                        type="link"
                        size="small"
                        onClick={() => {
                          currentRecord.value = record;
                          showEdit.value = true;
                          context.emit("toEdit", "version");
                        }}
                      >
                        编辑
                      </a-button>

                      {record.flowVersion !== -1 && !record.beingUsed && (
                        <a-button
                          type="link"
                          size="small"
                          onClick={() => {
                            useCurrentHandle(record);
                          }}
                        >
                          使用该版本
                        </a-button>
                      )}

                      {record.flowVersion === -1 && (
                        <a-button
                          type="link"
                          size="small"
                          onClick={() => {
                            publishHandle(record);
                          }}
                        >
                          发布
                        </a-button>
                      )}
                    </div>
                  );
                }
              },
            }}
          ></a-table>
        </a-modal>
      </div>
    );
  },
});
