import {
  defineComponent,
  onMounted,
  ref,
  reactive,
  computed,
  watch,
} from "vue";
import { message } from "ant-design-vue";
import { InfoCircleOutlined } from "@ant-design/icons-vue";
import { useTableList } from "inl-ui/dist/hooks";
import EditFormdata from "./EditFormdata";
import FlowTree from "@/components/flowTree";

import dayjs from "dayjs";
import typeList, { getAllCategory } from "@/views/bpmnCenter/typeList";

import * as api from "@/api/processCenter/formdataManager";

import "@/assets/style/pages/bpmnCenter/FormdataManager/FormdataManager.less";

const columns = [
  // {
  //   dataIndex: "id",
  //   title: "字段ID",
  //   width: 160,
  // },
  {
    dataIndex: "name",
    title: "展示名称",
  },
  {
    dataIndex: "code",
    title: "字段编码",
  },
  {
    key: "defStandardFormItemCategory",
    // dataIndex: ["defStandardFormItemCategory", "name"],
    title: "所属类别",
  },
  {
    key: "displayType",
    title: "字段类型",
  },
  {
    key: "enabled",
    title: "字段状态",
  },
  {
    key: "updateDt",
    title: "更新时间",
    width: 160,
  },
];

export default defineComponent({
  name: "FormdataManager",
  props: {
    isComp: {
      type: Boolean,
      default: false,
    },
    clearSelect: {
      type: Boolean,
      default: false,
    },
  },
  emits: ["changeSelect"],
  setup(props, context) {
    // 选中的分类
    const activeCategory = ref<any>();
    const handleCategorySelect = (data: any) => {
      activeCategory.value = data;
      refresh();
    };

    const stateList = [
      { label: "启用", value: true },
      { label: "停用", value: false },
    ];

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
      const resp = await api.findPageByCategoryAndName({
        argCategoryIdList:
          activeCategory.value && activeCategory.value[0] === "0"
            ? null
            : activeCategory.value,
        argEnabled: searchFormState.value.state,
        // argName: searchFormState.value.name,
        argDisplayType: searchFormState.value.type,
        asDesc: false,
        pageNum: currPage.value,
        pageSize: pageSize.value,
      });

      return resp;
    };

    onMounted(() => {
      refresh();
    });

    const formRef = ref();
    const searchFormState = ref({
      name: "",
      code: null,
      state: null,
      type: null,
    });

    const cptColumns = computed(() =>
      props.isComp
        ? columns
        : [
            ...columns,
            {
              title: "操作",
              key: "operation",
              fixed: "right",
              width: 200,
            },
          ]
    );

    const showEdit = ref(false);
    const currentRow = ref();

    const state = reactive<{
      selectedRowKeys: string[];
      selectedRows: any[];
    }>({
      selectedRowKeys: [],
      selectedRows: [],
    });

    watch(
      () => props.clearSelect,
      (nval) => {
        if (nval) {
          state.selectedRowKeys = [];
          state.selectedRows = [];
        }
      }
    );

    const onSelectChange = (selectedRowKeys: string[], selectedRows: any[]) => {
      state.selectedRowKeys = selectedRowKeys;
      state.selectedRows = selectedRows;

      context.emit("changeSelect", state.selectedRows);
    };

    const del = async (row) => {
      const resp: any = await api.formItemRemove(row.id);
      if (resp.message === "OK") {
        message.success("删除成功");
        refresh();
      }
    };

    const changeEnabled = async (row) => {
      const resp: any = await api.standardFormItemSave(row);
      if (resp.message === "OK") {
        message.success("保存成功");
        refresh();
      }
    };

    return () => (
      <div class="FormdataManager">
        <FlowTree onNodeSelect={handleCategorySelect} />

        <div class="right">
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
                <a-form-item label="展示名称" name="name">
                  <a-input
                    placeholder="请输入"
                    v-model={[searchFormState.value.name, "value"]}
                    class="item"
                    allowClear
                  />
                </a-form-item>
              </a-col>

              <a-col span={6}>
                <a-form-item label="字段编码" name="code">
                  <a-input
                    placeholder="请输入"
                    v-model={[searchFormState.value.code, "value"]}
                    class="item"
                    allowClear
                  />
                </a-form-item>
              </a-col>

              <a-col span={6}>
                <a-form-item label="字段状态" name="state">
                  <a-select
                    placeholder="请选择"
                    allowClear
                    v-model={[searchFormState.value.state, "value"]}
                    class="item"
                  >
                    {stateList.map((option) => {
                      return (
                        <a-select-option value={option.value}>
                          {option.label}
                        </a-select-option>
                      );
                    })}
                  </a-select>
                </a-form-item>
              </a-col>

              <a-col span={6}>
                <a-form-item label="字段类型" name="type">
                  <a-select
                    v-model={[searchFormState.value.type, "value"]}
                    allowClear
                    class="item"
                  >
                    {typeList.map((option) => {
                      return (
                        <a-select-option value={option.value}>
                          {option.label}
                        </a-select-option>
                      );
                    })}
                  </a-select>
                </a-form-item>
              </a-col>

              <a-col span={6} offset={18}>
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
              opt: () =>
                !props.isComp && (
                  <a-button
                    type="primary"
                    onClick={() => {
                      if (activeCategory.value) {
                        if (activeCategory.value[0] === "0") {
                          message.error("请选择其他分类");
                        } else {
                          currentRow.value = null;
                          showEdit.value = true;
                        }
                      } else {
                        message.error("请先选择分类");
                      }
                    }}
                  >
                    新建
                  </a-button>
                ),
              content: () => (
                <a-table
                  dataSource={tableList.value}
                  columns={cptColumns.value}
                  pagination={pagination}
                  loading={isLoading.value}
                  rowKey="id"
                  class="FormdataManagerTable"
                  row-selection={
                    props.isComp
                      ? {
                          selectedRowKeys: state.selectedRowKeys,
                          onChange: onSelectChange,
                        }
                      : null
                  }
                  v-slots={{
                    bodyCell: ({ column, record, index }: any) => {
                      // 所属类别
                      if (
                        column.key === "defStandardFormItemCategory" &&
                        record.defStandardFormItemCategory
                      ) {
                        const title = getAllCategory(
                          record.defStandardFormItemCategory
                        );

                        return (
                          <a-tooltip
                            v-slots={{
                              title: () => {
                                return title.join(" > ");
                              },
                            }}
                          >
                            {record.defStandardFormItemCategory.name}
                            {/* <InfoCircleOutlined /> */}
                          </a-tooltip>
                        );
                      }

                      // 字段类型
                      if (column.key === "displayType") {
                        return typeList.find(
                          (type) => type.value === record.displayType
                        )?.label;
                      }

                      // 字段状态
                      if (column.key === "enabled") {
                        return stateList.find(
                          (state) => state.value === record.enabled
                        )?.label;
                      }

                      if (column.key === "updateDt") {
                        return dayjs(record.updateDt).format(
                          "YYYY-MM-DD HH:mm:ss"
                        );
                      }

                      // 操作
                      if (column.key === "operation") {
                        return (
                          <div class="operation flex">
                            <a-button
                              type="link"
                              size="small"
                              onClick={() => {
                                currentRow.value = record;
                                showEdit.value = true;
                              }}
                            >
                              编辑
                            </a-button>

                            {record.enabled === true ? (
                              <a-button
                                type="link"
                                size="small"
                                onClick={() => {
                                  record.enabled = false;
                                  changeEnabled(record);
                                }}
                              >
                                停用
                              </a-button>
                            ) : (
                              <a-button
                                type="link"
                                size="small"
                                onClick={() => {
                                  record.enabled = true;
                                  changeEnabled(record);
                                }}
                              >
                                启用
                              </a-button>
                            )}

                            <a-popconfirm
                              title="确认删除？"
                              onConfirm={() => {
                                del(record);
                              }}
                            >
                              <a-button type="link" size="small">
                                删除
                              </a-button>
                            </a-popconfirm>
                          </div>
                        );
                      }
                    },
                  }}
                ></a-table>
              ),
            }}
          ></inl-layout-table>

          <EditFormdata
            v-models={[[showEdit.value, "showEdit"]]}
            activeCategory={activeCategory.value && activeCategory.value[0]}
            currentRow={currentRow.value}
            onRefresh={refresh}
          />
        </div>
      </div>
    );
  },
});
