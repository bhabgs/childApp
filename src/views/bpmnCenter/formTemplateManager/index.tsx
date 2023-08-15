import { defineComponent, onMounted, ref, reactive } from "vue";
import { message } from "ant-design-vue";
import { useTableList } from "inl-ui/dist/hooks";
import EditFormTemplate from "./EditFormTemplate";
import FlowTree from "@/components/flowTree";

import "@/assets/style/pages/bpmnCenter/FormTemplateManager/index.less";

import dayjs from "dayjs";
import * as api from "@/api/processCenter/formTemplateManager";

export default defineComponent({
  name: "FormTemplateManager",
  setup() {
    // 选中的分类
    const activeCategory = ref<any>();
    const handleCategorySelect = (data: any) => {
      activeCategory.value = data;
      refresh();
    };

    const formRef = ref();
    const searchFormState = ref({
      name: "",
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
      const resp = await api.templateList({
        argCategoryIdList:
          activeCategory.value && activeCategory.value[0] === "0"
            ? null
            : activeCategory.value,
        // argName: "",
        asDesc: false,
        pageNum: currPage.value,
        pageSize: pageSize.value,
      });

      return resp;
    };

    const tableConfig: any = reactive({
      columns: [
        {
          dataIndex: "id",
          title: "模板ID",
          width: 160,
        },
        {
          dataIndex: "name",
          title: "模板名称",
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
      ],
    });

    onMounted(() => {
      refresh();
    });

    const showEdit = ref(false);
    const currentTemplate = ref();

    const del = async (row) => {
      const resp: any = await api.templateDel(row.id);
      if (resp.message === "OK") {
        message.success("删除成功");
        refresh();
      }
    };

    return () => (
      <div class="FormTemplateManager">
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
                <a-form-item label="模板名称" name="name">
                  <a-input
                    v-model={[searchFormState.value.name, "value"]}
                    allowClear
                  />
                </a-form-item>
              </a-col>

              <a-col span={6} offset={12} style={{ textAlign: "right" }}>
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
                        currentTemplate.value = null;
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
                  columns={tableConfig.columns}
                  pagination={pagination}
                  loading={isLoading.value}
                  rowKey="id"
                  class="FormTemplateManagerTable"
                  v-slots={{
                    bodyCell: ({ column, record, index }: any) => {
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
                                currentTemplate.value = record;
                                showEdit.value = true;
                              }}
                            >
                              编辑
                            </a-button>

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

          <EditFormTemplate
            v-models={[[showEdit.value, "showEdit"]]}
            activeCategory={activeCategory.value && activeCategory.value[0]}
            currentTemplate={currentTemplate.value}
            onRefresh={refresh}
          />
        </div>
      </div>
    );
  },
});
