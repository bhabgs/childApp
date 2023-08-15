import {
  defineComponent,
  ref,
  reactive,
  onMounted,
  PropType,
  watch,
  nextTick,
  computed,
} from "vue";
import { useClipboard } from "@vueuse/core";
import { useTableList } from "inl-ui/dist/hooks";
import { filter, iconObj } from "@/utils/filters";
import { message } from "ant-design-vue";
import { EllipsisOutlined } from "@ant-design/icons-vue";
import inlCard from "inl-card-linhuan-v2";
import cardDetail from "./cardDetail";
import api from "@/api/cardCenter";
import { async } from "@antv/x6/lib/registry/marker/async";

export interface Item {
  id?: string | number;
  cardName?: string;
  endpoint?: string;
  developer?: string;
  enabled?: boolean;
  createDt?: any;
  reference?: string;
  remark?: string;
  description?: string;
  length?: string;
  width?: string;
  size?: string;
  equipment?: string;
  pageDetail?: string;
  parameter?: string;
}

/**
 * 卡片仓库
 */
const CardWareHouse = defineComponent({
  name: "CardWareHouse",
  props: {},
  components: { cardDetail },
  setup(prop) {
    const formRef = ref();

    const showTableList = ref(false);
    const height = ref(0);
    const itemHeight = ref(0);

    const pattern = ref("list");
    const cardPagination = reactive({
      pageSize: 7,
      currPage: 1,
      total: 0,
    });
    const formState = reactive<{
      endpoint?: string; // 适用终端
      enabled?: boolean | null; // 启用状态
      developer?: string; // 开发者
    }>({
      enabled: null,
    });
    // 一键复制
    const copySouce = ref();
    const { copy: dispatchCopy } = useClipboard({ source: copySouce });

    const state = reactive({
      terminalList: [], // 适用终端
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
          name: "雷达图",
          code: "radar",
        },
        {
          name: "饼图",
          code: "pie",
        },
        {
          name: "其他图表",
          code: "other",
        },
      ],
    });
    const column = [
      // {
      //   title: "ID",
      //   dataIndex: "id",
      //   width: "13%",
      // },
      {
        title: "卡片名称",
        dataIndex: "cardName",
      },
      {
        title: "纵横比例(px)",
        dataIndex: "size",
      },
      {
        title: "适用终端",
        dataIndex: "endpoint",
      },
      {
        title: "标签描述",
        dataIndex: "description",
      },
      {
        title: "引用名称",
        dataIndex: "reference",
      },
      {
        title: "是否启用",
        dataIndex: "enabled",
      },
      {
        title: "开发者",
        dataIndex: "developer",
      },
      {
        title: "备注说明",
        dataIndex: "remark",
      },
      {
        title: "操作",
        dataIndex: "action",
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
        api.cardGetList({
          ...formState,
          pageNum:
            pattern.value === "list" ? currPage.value : cardPagination.currPage,
          pageSize:
            pattern.value === "list" ? pageSize.value : cardPagination.pageSize,
        }),
      "records",
      "total"
    );
    refresh();

    // 重置表单
    const handleReset = () => {
      formRef.value.resetFields();
      refresh();
    };
    const handleCopy = async (name: string) => {
      try {
        copySouce.value = name;
        dispatchCopy();
        message.success("复制成功");
      } catch (error) {
        message.error("复制失败");
      }
    };

    const submit = () => {
      refresh();
    };

    // 详情数据
    const data = ref<Item>({});

    // 详情弹窗
    const detailsVisible = ref(false);
    // 获取终端
    const getEnumList = async () => {
      const res = await api.getEnumList("EndpointEnum");
      state.terminalList = res.data;
    };
    const handleSave = async () => {
      const res = await api.cardSaveOrUpdate(data.value);
      if (res.data) {
        detailsVisible.value = false;
        message.success("保存成功");
        refresh();
      } else {
        message.error("请求失败");
      }
    };
    const handleDelete = async (id: number) => {
      const res = await api.cardDelete(id);
      if (res.status) message.success("删除成功");
      refresh();
    };
    const handleChange = async (id: number, enabled: boolean) => {
      const res = await api.cardAvailable(id, enabled);
      if (res) message.success("下发成功");
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
          form.title = "新增卡片";
        } else if (e === "edit") {
          form.title = "编辑卡片";
        } else {
          form.title = "卡片详情";
        }
      }
    );
    onMounted(async () => {
      getEnumList();
    });
    return () => (
      <div class="cardWareHouse">
        <div
          class="cardWareHouse_title"
          style="display: flex;justify-content: space-between;margin-bottom:20px"
        >
          <span id="copyMy" style="font-weight: 600;">
            所有卡片
            <span style={{ color: "#ccc", marginLeft: "10px" }}>
              v{inlCard.version}
            </span>
          </span>
          <a-radio-group
            v-model={[pattern.value, "value"]}
            size="small"
            onChange={async () => {
              await nextTick();
              await refresh();
              showTableList.value = true;
            }}
          >
            <a-radio-button value="card">
              <icon-font
                type={"icon-gongyituguanli_quanjucaozuo_wangge"}
                style={pattern.value === "card" ? "" : "color:#A5AABD"}
              ></icon-font>
            </a-radio-button>
            <a-radio-button value="list">
              <icon-font
                type={"icon-kaifazhezhongxin_caidanguanli"}
                style={pattern.value === "list" ? "" : "color:#A5AABD"}
              ></icon-font>
            </a-radio-button>
          </a-radio-group>
        </div>
        <a-form
          class="table-query-form"
          layout="inline"
          label-col={{ style: { width: "5em" } }}
          ref={formRef}
          model={formState}
          colon={false}
          onSubmit={submit}
        >
          <a-row>
            <a-col span={6}>
              <a-form-item name="endpoint" label="适用终端">
                <a-select
                  allowClear
                  placeholder="适用终端搜索"
                  v-model={[formState.endpoint, "value"]}
                >
                  {state.terminalList &&
                    state.terminalList.map((item: any) => (
                      <a-select-option value={item.code} key={item.code}>
                        {item.name}
                      </a-select-option>
                    ))}
                </a-select>
              </a-form-item>
            </a-col>
            <a-col span={6}>
              <a-form-item name="enabled" label="是否启用">
                <a-select
                  allowClear
                  placeholder=""
                  v-model={[formState.enabled, "value"]}
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
              <a-form-item name="developer" label="开发者">
                <a-input
                  v-model={[formState.developer, "value"]}
                  placeholder="开发者搜索"
                />
              </a-form-item>
            </a-col>
            <a-col span={6} style={{ textAlign: "right" }}>
              <a-space>
                <a-button type="primary" html-type="submit">
                  查询
                </a-button>
                <a-button onClick={handleReset}>重置</a-button>
              </a-space>
            </a-col>
          </a-row>
        </a-form>
        <div class="card flex">
          {pattern.value === "list" ? (
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
                    新增卡片
                  </a-button>
                ),
                content: () => (
                  <a-table
                    dataSource={tableList.value}
                    columns={column}
                    rowKey="id"
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
                        if (column.dataIndex === "size") {
                          return `${record.length ? record.length : "-"}*${
                            record.width ? record.width : "-"
                          }`;
                        }
                        if (column.dataIndex === "endpoint") {
                          return filter(
                            state.terminalList,
                            record.endpoint,
                            "code",
                            "name"
                          );
                        }
                        if (column.dataIndex === "description") {
                          return filter(
                            state.descriptionList,
                            record.description,
                            "code",
                            "name"
                          );
                        }
                        if (column.dataIndex === "reference") {
                          return (
                            <a-typography-paragraph
                              copyable
                              style={{ marginBottom: "0" }}
                            >
                              {record.reference}
                            </a-typography-paragraph>
                          );
                        }
                        if (column.dataIndex === "enabled") {
                          return (
                            <a-switch
                              v-model={[record.enabled, "checked"]}
                              onChange={() => {
                                handleChange(record.id, record.enabled);
                              }}
                            ></a-switch>
                          );
                        }

                        if (column.dataIndex === "action") {
                          return (
                            <a-space>
                              <a
                                onClick={() => {
                                  handleCopy(record.reference);
                                }}
                              >
                                复制引用名
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
          ) : null}
          {pattern.value === "card" ? (
            <div class="cardgrid" id="cardgridContent">
              <a-spin
                wrapperClassName="cardgrid-content-spin"
                spinning={!showTableList.value}
              >
                <div class="cardgrid-content">
                  <div class="cardgrid-item addCard">
                    <img
                      src="/micro-assets/platform-web/defaultCard.png"
                      alt=""
                    />
                    <a-button
                      type="primary"
                      onClick={() => {
                        form.type = "add";
                        data.value = {};
                        detailsVisible.value = true;
                      }}
                    >
                      新增卡片
                    </a-button>
                  </div>
                  {showTableList.value &&
                    tableList.value.map((item, index) => (
                      <div
                        class="cardgrid-item"
                        style={{ height: `${itemHeight.value - 40}px` }}
                      >
                        <div class="cardgrid-item-cardView">
                          <inl-card-box
                            componentName={item.reference}
                            titleName={item.cardName}
                            index={index}
                          ></inl-card-box>
                        </div>
                        <div class="cardgrid-item-info">
                          <div class="cardgrid-item-info-top">
                            <div class="cardgrid-item-info-top-cardName">
                              <span style={{ marginRight: "10px" }}>
                                {item.cardName}
                              </span>
                              <a-switch v-model={[item.enabled, "checked"]} />
                            </div>
                            <div class="cardgrid-item-info-top-size">
                              <span>{`${item.length ? item.length : "-"}*${
                                item.width ? item.width : "-"
                              }`}</span>
                            </div>
                          </div>
                          <div class="cardgrid-item-info-center">
                            <a-typography-paragraph copyable>
                              {item.reference}
                            </a-typography-paragraph>
                          </div>
                          <div class="cardgrid-item-info-bottom">
                            <div class="cardgrid-item-info-bottom-type">
                              <span>
                                <icon-font
                                  type={iconObj[item.endpoint]}
                                ></icon-font>
                                <span>
                                  {filter(
                                    state.terminalList,
                                    item.endpoint,
                                    "code",
                                    "name"
                                  )}
                                </span>
                              </span>
                              <span>
                                <icon-font
                                  type={iconObj[item.description || "other"]}
                                ></icon-font>
                                <span>
                                  {filter(
                                    state.descriptionList,
                                    item.description || "other",
                                    "code",
                                    "name"
                                  )}
                                </span>
                              </span>
                            </div>
                            <div class="cardgrid-item-info-bottom-developer">
                              <span>{item.developer}</span>
                              <div>
                                <a-popover
                                  placement="bottomLeft"
                                  v-slots={{
                                    content: () => (
                                      <div>
                                        <a-button
                                          type="link"
                                          block
                                          onClick={() => {
                                            form.type = "edit";
                                            data.value = item;
                                            detailsVisible.value = true;
                                          }}
                                        >
                                          修改卡片
                                        </a-button>
                                        <a-button
                                          type="link"
                                          block
                                          onClick={() => {
                                            handleDelete(item.id);
                                          }}
                                        >
                                          删除
                                        </a-button>
                                      </div>
                                    ),
                                  }}
                                >
                                  <a-button
                                    type="text"
                                    v-slots={{
                                      icon: () => <EllipsisOutlined />,
                                    }}
                                    class="cardgrid-item-info-bottom-developer-more"
                                  ></a-button>
                                </a-popover>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </a-spin>
              <div style={{ textAlign: "right" }} class="pagination">
                <a-pagination
                  pageSize={cardPagination.pageSize}
                  current={cardPagination.currPage}
                  pageSizeOptions={["7", "14", "35", "70"]}
                  showSizeChanger={true}
                  showQuickJumper={true}
                  showTotal={(total: number) => `共${total}条`}
                  total={total.value}
                  onChange={async (page, pageSize) => {
                    showTableList.value = false;
                    cardPagination.pageSize = pageSize;
                    cardPagination.currPage = page;
                    await refresh();
                    setTimeout(() => {
                      showTableList.value = true;
                    }, 300);
                  }}
                />
              </div>
            </div>
          ) : null}
        </div>
        <a-modal
          v-model={[detailsVisible.value, "visible"]}
          title={form.title}
          centered={true}
          footer={false}
          width={900}
          keyboard={false}
          maskClosable={false}
        >
          {detailsVisible.value ? (
            <cardDetail
              terminalList={state.terminalList}
              descriptionList={state.descriptionList}
              formData={data.value}
              disabled={form.type === "detail" ? true : false}
              onSave={(e) => {
                data.value = e;
                handleSave();
              }}
              onClose={() => {
                detailsVisible.value = false;
                data.value = {};
              }}
            ></cardDetail>
          ) : null}
        </a-modal>
      </div>
    );
  },
});
export default CardWareHouse;
