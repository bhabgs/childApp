import { defineComponent, ref, reactive, onMounted, watch } from "vue";
import useClipboard from "vue-clipboard3";
import { useTableList } from "inl-ui/dist/hooks";
import dayjs, { Dayjs } from "dayjs";
import { message } from "ant-design-vue";
import { filter } from "@/utils/filters";

import PageDetail from "./pageDetail";
import EditPage from "./editPage";
import api from "@/api/cardCenter";

export interface Item {
  id?: string | number;
  pageName?: string;
  endpoint?: string;
  updateUser?: string;
  updateDt?: Dayjs | number | string;
  enabled?: boolean;
  createDt?: any;
  reference?: string;
  remark?: string;
  tags?: string;
  length?: string;
  width?: string;
  size?: string;
  equipment?: string;
  pageDetail?: string;
  parameter?: string;
}

/**
 * 页面配置
 */
const PageConfiguration = defineComponent({
  name: "PageConfiguration",
  props: {},
  setup(prop) {
    const formRef = ref();
    // 一键复制
    const { toClipboard } = useClipboard();
    const formState = reactive<{
      system?: string; // 所属系统
      endpoint?: string; // 所属终端
      enable?: string | null; // 是否生效
      keyword?: string; // 模糊查询
      startTime?: string; // 开始时间
      endTime?: string; // 结束时间
      time?: Array<Dayjs>;
    }>({
      endpoint: "",
      enable: null,
    });

    const state = reactive({
      terminalList: [], // 适用终端
      systemTypeList: [], // 系统
      enabledList: [
        { name: "全部", code: null },
        { name: "是", code: true },
        { name: "否", code: false },
      ],
      developerList: [],
      descriptionList: [
        {
          name: "折线图",
          code: "line",
        },
        {
          name: "面积图",
          code: "area",
        },
        {
          name: "柱状图",
          code: "column",
        },
        {
          name: "条形图",
          code: "bar",
        },
        {
          name: "饼图",
          code: "pie",
        },
      ],
    });
    const column = [
      {
        title: "页面名称",
        dataIndex: "pageName",
        width: "10rem",
      },
      // {
      //   title: "所属应用",
      //   dataIndex: "app",
      // },
      // {
      //   title: "纵横比例(px)",
      //   dataIndex: "size",
      // },
      {
        title: "适用终端",
        dataIndex: "endpoint",
        width: "6em",
      },
      // {
      //   title: "标签描述",
      //   dataIndex: "tags",
      //   width: "6em",
      // },
      {
        title: "是否启用",
        dataIndex: "enabled",
        width: "6em",
      },
      {
        title: "卡片个数",
        dataIndex: "cardCount",
        width: "6em",
      },
      {
        title: "引用地址",
        dataIndex: "reference",
        width: "10em",
      },
      // {
      //   title: "开发者",
      //   dataIndex: "createUser",
      //   width: "15em",
      // },
      // {
      //   title: "开发时间",
      //   dataIndex: "createDt",
      // },
      {
        title: "最后修改时间",
        dataIndex: "updateDt",
        width: "10em",
      },
      {
        title: "备注",
        dataIndex: "remark",
        width: "15em",
        ellipsis: true,
      },
      {
        title: "操作",
        dataIndex: "action",
        width: "20em",
      },
    ];

    // table
    const {
      currPage,
      isLoading,
      refresh,
      tableList,
      handlePageChange,
      total,
      pageSize,
      hanldePageSizeChange,
    } = useTableList(
      () =>
        api.pageGetList({
          ...formState,
          pageNum: currPage.value,
          pageSize: pageSize.value,
        }),
      "records",
      "total"
    );
    refresh();

    // 重置表单
    const handleReset = () => {
      formRef.value.resetFields();
      formState.startTime = "";
      formState.endTime = "";
      formState.time = undefined;
      refresh();
    };
    const handleCopy = async (name: string) => {
      try {
        await toClipboard(`/transparent-management/#/screen/${name}`);
        message.success("复制成功");
      } catch (error) {
        if (name) {
          message.error("复制失败");
        } else {
          message.error("没有引用地址");
        }
      }
    };

    const visible = ref(false);
    const cancel = () => {
      visible.value = false;
    };

    const submit = () => {
      if (formState.time && formState.time.length > 0) {
        formState.startTime = `${dayjs(formState.time[0]).format(
          "YYYY-MM-DDTHH:mm:ss.SSS+00:00"
        )}`;
        formState.endTime = `${dayjs(formState.time[1]).format(
          "YYYY-MM-DDTHH:mm:ss.SSS+00:00"
        )}`;
      }
      refresh();
    };

    // 详情数据
    const data = ref({});

    // 详情弹窗
    const detailsVisible = ref(false);
    // 编辑页面弹窗
    const editPageVisible = ref(false);
    // 获取系统
    const getSystemList = async () => {
      const res = await api.systemGetList();
      state.systemTypeList = res.data;
    };
    // 获取终端
    const getEnumList = async () => {
      const res = await api.getEnumList("EndpointEnum");
      state.terminalList = res.data;
    };
    const handleSave = async () => {
      const res = await api.pageSaveOrUpdate(data.value);
      if (res.data) {
        detailsVisible.value = false;
        editPageVisible.value = false;
        message.success("保存成功");
        refresh();
      } else {
        message.error("请求失败");
      }
    };
    const handleDelete = async (id: number) => {
      const res = await api.pageDelete(id);
      if (res.data) {
        message.success("删除成功");
        refresh();
      } else {
        message.success("删除失败");
      }
    };
    const form = reactive({
      type: "",
      title: "",
      id: "",
    });
    watch(
      () => form.type,
      (e) => {
        if (e == "add") {
          form.title = "新增页面";
        } else if (e === "edit") {
          form.title = "修改页面";
        } else {
          form.title = "页面详情";
        }
      }
    );
    onMounted(async () => {
      getEnumList();
      getSystemList();
    });
    return () => (
      <div class="pageConfiguration flex">
        <a-form
          class="table-query-form"
          layout="inline"
          labelCol={{ style: { width: "5em" } }}
          ref={formRef}
          model={formState}
          colon={false}
          onSubmit={submit}
        >
          <a-row>
            <a-col span={6}>
              <a-form-item
                name="system"
                label="所属系统"
                label-col={{ span: 4 }}
                wrapper-col={{ span: 20 }}
              >
                <a-select
                  v-model={[formState.system, "value"]}
                  allowClear
                  style="width: 70%"
                  // onChange={onSystemChange}
                >
                  {state.systemTypeList &&
                    state.systemTypeList.map((item: any) => (
                      <a-select-option value={item.id} key={item.id}>
                        {item.headName}
                      </a-select-option>
                    ))}
                </a-select>
              </a-form-item>
            </a-col>
            <a-col span={6}>
              <a-form-item name="endpoint" label="所属终端">
                <a-select
                  v-model={[formState.endpoint, "value"]}
                  allowClear
                  style={{ width: "70%" }}
                >
                  <a-select-option value="">全部</a-select-option>
                  {state.terminalList &&
                    state.terminalList.map((item: any) => (
                      <a-select-option value={item.code} key={item.code}>
                        {item.name}
                      </a-select-option>
                    ))}
                </a-select>
              </a-form-item>
            </a-col>
            <a-col span={12}>
              <a-form-item label="时间段" name="time">
                <a-range-picker
                  style={{ width: "100%" }}
                  v-model={[formState.time, "value"]}
                  allowClear
                />
              </a-form-item>
            </a-col>
            <a-col span={6}>
              <a-form-item name="enable" label="是否生效">
                <a-select
                  v-model={[formState.enable, "value"]}
                  allowClear
                  style={{ width: "70%" }}
                >
                  {state.enabledList.map((item: any) => (
                    <a-select-option value={item.code} key={item.code}>
                      {item.name}
                    </a-select-option>
                  ))}
                </a-select>
              </a-form-item>
            </a-col>

            <a-col span={6}>
              <a-form-item name="keyword" label=" ">
                <a-input
                  v-model={[formState.keyword, "value"]}
                  placeholder="页面名称模糊查询"
                  v-slots={{
                    suffix: () => <search-outlined />,
                  }}
                  style={{ width: "70%" }}
                ></a-input>
              </a-form-item>
            </a-col>
            <a-col style={{ textAlign: "right" }} span={6} offset={6}>
              <a-form-item>
                <a-space>
                  <a-button type="primary" html-type="submit">
                    查询
                  </a-button>
                  <a-button onClick={handleReset}>重置</a-button>
                </a-space>
              </a-form-item>
            </a-col>
          </a-row>
        </a-form>

        <inl-layout-table
          v-slots={{
            opt: () => (
              <a-button
                type="primary"
                onClick={() => {
                  form.type = "add";
                  data.value = {};
                  detailsVisible.value = true;
                }}
              >
                新增页面
              </a-button>
            ),
            content: () => (
              <a-table
                dataSource={tableList.value}
                columns={column}
                pagination={{
                  pageSize: pageSize.value,
                  current: currPage.value,
                  showSizeChanger: true,
                  showQuickJumper: true,
                  showTotal: (total: number) => `共${total}条`,
                  total: total.value,
                  "onUpdate:current": handlePageChange,
                  "onUpdate:pageSize": hanldePageSizeChange,
                }}
                loading={isLoading.value}
                v-slots={{
                  bodyCell: ({ column, record }) => {
                    if (column.dataIndex === "enabled") {
                      return record.enabled ? "是" : "否";
                    }
                    if (column.dataIndex === "endpoint") {
                      return filter(
                        state.terminalList,
                        record.endpoint,
                        "code",
                        "name"
                      );
                    }
                    if (column.dataIndex === "tags") {
                      return filter(
                        state.descriptionList,
                        record.tags,
                        "code",
                        "name"
                      );
                    }
                    if (column.dataIndex === "cardCount") {
                      const pageDetail = JSON.parse(record.pageDetail || "{}");
                      return pageDetail.child ? pageDetail.child.length : 0;
                    }
                    if (column.dataIndex === "createDt") {
                      return record.createDt
                        ? dayjs(record.createDt).format("YYYY-MM-DD")
                        : "--";
                    }
                    if (column.dataIndex === "updateDt") {
                      return record.updateDt
                        ? dayjs(record.updateDt).format("YYYY-MM-DD")
                        : "--";
                    }
                    if (column.dataIndex === "action") {
                      return (
                        <a-space>
                          <a
                            onClick={() => {
                              handleCopy(record.reference);
                            }}
                          >
                            复制引用地址
                          </a>
                          <a
                            onClick={() => {
                              data.value = record;
                              editPageVisible.value = true;
                            }}
                          >
                            编辑页面
                          </a>
                          <a
                            onClick={() => {
                              form.type = "detail";
                              data.value = record;
                              detailsVisible.value = true;
                            }}
                          >
                            详情
                          </a>
                          <a
                            onClick={() => {
                              form.type = "edit";
                              data.value = record;
                              detailsVisible.value = true;
                            }}
                          >
                            修改
                          </a>
                          <a-popconfirm
                            title="确认删除？"
                            onConfirm={() => {
                              handleDelete(record.id);
                            }}
                          >
                            <a>删除</a>
                          </a-popconfirm>
                        </a-space>
                      );
                    }
                  },
                }}
              />
            ),
          }}
        ></inl-layout-table>

        <a-modal
          v-model={[detailsVisible.value, "visible"]}
          title={form.title}
          centered={true}
          footer={false}
          width={500}
          keyboard={false}
          maskClosable={false}
        >
          {detailsVisible.value && (
            <PageDetail
              terminalList={state.terminalList}
              formData={data.value}
              descriptionList={state.descriptionList}
              disabled={form.type === "detail" ? true : false}
              onSave={(e) => {
                data.value = e;
                handleSave();
                // detailsVisible.value = false;
              }}
              onClose={() => {
                detailsVisible.value = false;
                data.value = {};
                // http();
              }}
            />
          )}
        </a-modal>
        <a-modal
          v-model={[editPageVisible.value, "visible"]}
          title="编辑页面"
          centered={true}
          footer={false}
          width={1100}
          keyboard={false}
          maskClosable={false}
          onCancel={() => {
            data.value = {};
            editPageVisible.value = false;
          }}
        >
          {editPageVisible.value && (
            <EditPage
              // terminalList={state.terminalList}
              formData={data.value}
              onSubmitLayout={(e) => {
                data.value = e;
                handleSave();
              }}
            />
          )}
        </a-modal>
      </div>
    );
  },
});
export default PageConfiguration;
