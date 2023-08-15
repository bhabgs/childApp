import { defineComponent, onMounted, ref, reactive, watch } from "vue";
import { message } from "ant-design-vue";
import { useTableList } from "inl-ui/dist/hooks";

import dayjs from "dayjs";

import * as api from "@/api/workorderManage/workorderCenter";

const columns = [
  // {
  //   dataIndex: "id",
  //   title: "工单ID",
  //   width: 160,
  // },
  {
    dataIndex: "processName",
    title: "工单分类",
    ellipsis: true,
  },
  {
    dataIndex: "processTitle",
    title: "工单名称",
    ellipsis: true,
  },
  {
    dataIndex: "initiatorName",
    title: "发起人",
  },
  {
    dataIndex: "userTaskStatus",
    title: "状态",
  },
  {
    dataIndex: "justNowLastAssigneeName",
    title: "最后执行人",
  },
  {
    key: "justNowLastDt",
    title: "最后执行时间",
    width: 200,
  },
  {
    title: "操作",
    key: "operation",
    fixed: "right",
    width: 220,
  },
];

export default defineComponent({
  props: {
    apiName: {
      type: String,
      default: "",
    },
    showSelect: {
      type: Boolean,
      default: false,
    },
  },

  emits: ["changeSelect"],
  setup(props, context) {
    const {
      slots: { btnLine, tableBtns },
    } = context;

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
      // const resp = await api["toDoTaskList"]({
      const resp = await api[props.apiName]({
        processDefinitionKey: searchFormState.value.processDefinitionKey,
        startDt: null,
        endDt: null,
        pageNum: currPage.value,
        pageSize: pageSize.value,
      });

      return resp;
    };

    context.expose({
      refresh,
    });

    onMounted(() => {
      refresh();
      getWorkorderTypeList();
    });

    const formRef = ref();
    const searchFormState = ref({
      processDefinitionKey: null,
      updateDt: [],
    });

    const state = reactive<{
      selectedRowKeys: string[];
      selectedRows: any[];
    }>({
      selectedRowKeys: [],
      selectedRows: [],
    });

    // 工单分类
    const workorderTypeList = ref<any>([]);
    // 获取工单分类
    const getWorkorderTypeList = async () => {
      const resp: any = await api.findDistinctDefinitionKey();
      const obj = resp.data;
      workorderTypeList.value = [];
      for (let key in obj) {
        workorderTypeList.value.push({ key: key, name: obj[key] });
      }
    };

    const onSelectChange = (selectedRowKeys: string[], selectedRows: any[]) => {
      state.selectedRowKeys = selectedRowKeys;
      state.selectedRows = selectedRows;

      context.emit("changeSelect", state.selectedRows);
    };

    watch(
      () => props.showSelect,
      (nval) => {
        if (!nval) {
          state.selectedRowKeys = [];
          state.selectedRows = [];
        }
      }
    );

    return () => (
      <div class="WorkorderTable">
        <a-form
          class="table-query-form"
          // labelCol={{ style: { width: "9em" } }}
          wrapperCol={{ span: 16 }}
          model={searchFormState.value}
          ref={formRef}
          onSubmit={refresh}
        >
          <a-row>
            <a-col span={6}>
              <a-form-item label="工单分类" name="processDefinitionKey">
                <a-select
                  v-model={[
                    searchFormState.value.processDefinitionKey,
                    "value",
                  ]}
                  dropdownMatchSelectWidth={false}
                  allowClear
                  placeholder="请选择"
                >
                  {workorderTypeList.value.map((option: any) => {
                    return (
                      <a-select-option value={option.key}>
                        {option.name}
                      </a-select-option>
                    );
                  })}
                </a-select>
              </a-form-item>
            </a-col>

            <a-col span={6}>
              <a-form-item label="最后更新时间" name="updateDt">
                <a-range-picker
                  v-model={[searchFormState.value.updateDt, "value"]}
                />
              </a-form-item>
            </a-col>

            <a-col span={6} offset={6}>
              <a-form-item
                style={{ flex: 1, textAlign: "right", justifyContent: "end" }}
              >
                <a-space size={16}>
                  <a-button type="primary" html-type="submit">
                    查询
                  </a-button>

                  <a-button
                    onClick={() => {
                      formRef.value.resetFields();
                      refresh();
                    }}
                  >
                    重置
                  </a-button>
                </a-space>
              </a-form-item>
            </a-col>
          </a-row>
        </a-form>

        <inl-layout-table
          v-slots={{
            opt: () => btnLine?.(),
            content: () => (
              <a-table
                dataSource={tableList.value}
                columns={columns}
                pagination={pagination}
                loading={isLoading.value}
                rowKey="id"
                class="WorkorderCenterTable"
                row-selection={
                  props.showSelect
                    ? {
                        selectedRowKeys: state.selectedRowKeys,
                        onChange: onSelectChange,
                      }
                    : null
                }
                v-slots={{
                  bodyCell: ({ column, record, index }: any) => {
                    if (column.key === "justNowLastDt") {
                      return dayjs(record.justNowLastDt).format(
                        "YYYY-MM-DD HH:mm:ss"
                      );
                    }

                    // 操作
                    if (column.key === "operation") {
                      return tableBtns?.(record);
                    }
                  },
                }}
              ></a-table>
            ),
          }}
        ></inl-layout-table>
      </div>
    );
  },
});
