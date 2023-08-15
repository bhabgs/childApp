import { defineComponent, onMounted, ref } from "vue";
import { message } from "ant-design-vue";
import { useRoute, useRouter } from "vue-router";

import { useTableList } from "inl-ui/dist/hooks";
import FlowTree from "@/components/flowTree";
import dayjs from "dayjs";
import typeList, { getAllCategory } from "@/views/bpmnCenter/typeList";

import "@/assets/style/pages/bpmnCenter/BpmnDesign/index.less";

// import EditBpmnDesignModal from "./EditBpmnDesignModal";
import EditVersion from "./EditVersion";

import { useEvent } from "inl-ui/dist/hooks";

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
  },
  // {
  //   key: "defStandardFormItemCategory",
  //   title: "所属类别",
  // },
  {
    key: "flowVersion",
    title: "版本号",
  },
  {
    key: "enabled",
    title: "流程状态",
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
    width: 280,
  },
];

export default defineComponent({
  name: "BpmnDesign",
  setup() {
    const router = useRouter();

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

    const formRef = ref();
    const searchFormState = ref({
      name: "",
      enabled: null,
      updateDt: [],
    });

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
        argCategoryIdList:
          activeCategory.value && activeCategory.value[0] === "0"
            ? null
            : activeCategory.value,
        argEnabled: searchFormState.value.enabled,
        argName: `%${searchFormState.value.name}%`,
        // argDisplayType: searchFormState.value.type,
        // asDesc: false,
        pageNum: currPage.value,
        pageSize: pageSize.value,
      });

      return resp;
    };

    // 刷新列表页当前列表
    useEvent("bpmnDesign", refresh);

    onMounted(() => {
      refresh();
    });

    const currentRow = ref();
    const showEdit = ref(false);
    const showVersion = ref(false);

    const toEditPage = (activeCategory, name, id?) => {
      router.push({
        name: "editBpmnDesign",
        params: { id: id ? id : "add" },
        query: {
          name,
          activeCategory,
          processDefinitionId: id,
        },
      });
    };

    const del = async (row) => {
      const resp: any = await api.deployRemove(row.processDefinitionId);
      if (resp.message === "OK") {
        message.success("删除成功");
        refresh();
      }
    };

    const changeEnabled = async (row) => {
      const resp: any = await api.modifyEnabled(row);
      if (resp.message === "OK") {
        message.success("保存成功");
        refresh();
      }
    };

    const publishHandle = async (row) => {
      const resp: any = await api.deployProcess({
        processDefinitionKey: row.processDefinitionKey,
      });
      if (resp.message === "OK") {
        message.success("发布成功");
        refresh();
      }
    };

    return () => (
      <div class="BpmnDesign" id="BpmnDesign">
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
                <a-form-item label="流程名称" name="name">
                  <a-input
                    v-model={[searchFormState.value.name, "value"]}
                    allowClear
                  />
                </a-form-item>
              </a-col>

              <a-col span={6}>
                <a-form-item label="流程状态" name="enabled">
                  <a-select
                    placeholder="请选择"
                    allowClear
                    v-model={[searchFormState.value.enabled, "value"]}
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
                <a-form-item label="最后更新时间" name="updateDt">
                  <a-range-picker
                    v-model={[searchFormState.value.updateDt, "value"]}
                  />
                </a-form-item>
              </a-col>

              <a-col span={6} style={{ textAlign: "right" }}>
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
              </a-col>
            </a-row>
          </a-form>

          <inl-layout-table
            v-slots={{
              opt: () => (
                <a-button
                  type="primary"
                  onClick={() => {
                    if (activeCategory.value) {
                      if (activeCategory.value[0] === "0") {
                        message.error("请选择其他分类");
                      } else {
                        toEditPage(
                          activeCategory.value && activeCategory.value[0],
                          "新增流程设计"
                        );
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
                  columns={columns}
                  pagination={pagination}
                  loading={isLoading.value}
                  rowKey="id"
                  class="BpmnDesignTable"
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

                        return (
                          <div
                            class="tableBtn"
                            onClick={() => {
                              currentRow.value = record;
                              showVersion.value = true;
                            }}
                          >
                            {btnName}
                          </div>
                        );
                      }

                      // 流程状态
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
                            <div>
                              <a-button
                                type="link"
                                size="small"
                                onClick={() => {
                                  toEditPage(
                                    activeCategory.value &&
                                      activeCategory.value[0],
                                    `编辑流程设计 (${record.name})`,
                                    record.processDefinitionId
                                  );
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

                              <a-button
                                type="link"
                                size="small"
                                onClick={() => {}}
                                disabled
                              >
                                复制
                              </a-button>

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

          {/* <EditBpmnDesignModal
            v-models={[[showEdit.value, "showEdit"]]}
            activeCategory={activeCategory.value && activeCategory.value[0]}
            currentRow={currentRow.value}
            onRefresh={refresh}
          /> */}

          <EditVersion
            v-models={[[showVersion.value, "showVersion"]]}
            currentRow={currentRow.value}
            showEdit={showEdit.value}
            onToEdit={(version) => {
              showEdit.value = true;
            }}
            onRefresh={refresh}
          />
        </div>
      </div>
    );
  },
});
