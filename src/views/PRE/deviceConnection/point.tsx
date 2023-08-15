import {
  defineComponent,
  onMounted,
  reactive,
  ref,
  watch,
  nextTick,
} from "vue";
import CommonTree from "@/components/commonTree";
import api from "@/api/PRE";
import { useModalVisible, useTableList, useEvent } from "inl-ui/dist/hooks";
import {
  CaretDownOutlined,
  CaretRightOutlined,
  UnlockOutlined,
  LockOutlined,
  QuestionCircleOutlined,
} from "@ant-design/icons-vue";
import { message, Modal } from "ant-design-vue";
import TableModal from "./tableModal";
import TreeModal from "./treeModal";
import { useRouter } from "vue-router";

const columns = [
  {
    title: "标签",
    dataIndex: "pointCode",
    key: "pointCode",
    ellipsis: true,
  },
  {
    title: "地址",
    dataIndex: "address",
    key: "address",
    ellipsis: true,
  },
  {
    title: "描述",
    dataIndex: "pointDescription",
    key: "pointDescription",
    ellipsis: true,
  },
  {
    title: "数据类型",
    dataIndex: "dataType",
    key: "dataType",
    ellipsis: true,
  },
  {
    title: "输出数据类型",
    dataIndex: "outputType",
    key: "outputType",
    ellipsis: true,
  },
  {
    title: "状态",
    dataIndex: "state",
    key: "state",
  },
  {
    title: "操作",
    dataIndex: "operation",
    key: "operation",
  },
];
const point = defineComponent({
  name: "point",
  props: {
    treeInfo: {
      type: Object,
      default: () => {},
    },
  },
  setup(props, { emit, expose }) {
    const router = useRouter();
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
    } = useTableList(
      async () => {
        const { data } = await api.getPointItemListByPduCode({
          pduCode: props.treeInfo?.pduCode || "",
          ...searchForm.value,
          pageNum: currPage.value,
          pageSize: pageSize.value,
        });
        if (!data) return { data: { pointItems: [], total: 0 } };
        return { data };
      },
      "pointItems",
      "total"
    );
    useEvent("point", refresh);
    const state = reactive<{
      selectedRowKeys: string[];
      selectedRows: any[];
      modalVisible: boolean;
    }>({
      selectedRowKeys: [],
      selectedRows: [],
      modalVisible: true,
    });
    const searchForm = ref({
      pointCode: "",
      pointAddress: "",
      available: null,
    });
    const availableList = ref([
      {
        id: null,
        name: "全部",
      },
      {
        id: 1,
        name: "启用",
      },
      {
        id: 0,
        name: "停用",
      },
    ]);
    const onSelectChange = (selectedRowKeys: string[], selectedRows: any[]) => {
      state.selectedRowKeys = selectedRowKeys;
      // state.selectedRows = selectedRows;
    };
    // const visibleTable = ref(false);
    const tableOperation = (type: string, data?: any) => {
      router.push({
        name: "deviceConnectionDta",
        params: { id: data?.pointId || "null" },
        query: { name: data?.pointCode, type: type },
      });
    };
    const del = async (ids: string[], available: number) => {
      try {
        await api.deletePointByList({ pointIdList: ids.toString(), available });
        message.success(`${available ? "启用" : "停用"}成功`);
        refresh();
        state.selectedRowKeys = [];
      } catch (error: any) {
        message.error(
          error?.message ? error.message : `${available ? "启用" : "停用"}失败`
        );
      }
    };

    const handleReset = () => {
      currPage.value = 1;
      searchForm.value = {
        pointCode: "",
        pointAddress: "",
        available: null,
      };
      state.selectedRowKeys = [];
      // state.selectedRows = [];
      refresh();
      getDetail();
    };

    /* 协议数据单元 */
    const formList = ref<
      {
        key: string;
        value: string;
        name: string;
        span?: number | string;
      }[]
    >([
      {
        key: "pduName",
        value: "",
        name: "名称",
        span: 8,
      },
      {
        key: "pduCode",
        value: "",
        name: "编码",
      },
      {
        key: "protocolType",
        value: "",
        name: "协议类型",
      },
      {
        key: "url",
        value: "",
        name: "连接地址",
      },
      {
        key: "stationId",
        value: "",
        name: "站号",
      },
      {
        key: "addressOffset",
        value: "",
        name: "地址偏移",
      },
      {
        key: "linkType",
        value: "",
        name: "连接类型",
      },
      {
        key: "connectTimeout",
        value: "",
        name: "连接超时时间(毫秒)",
      },
      {
        key: "retryInterval",
        value: "",
        name: "连接重试间隔(毫秒)",
      },
      {
        key: "available",
        value: "",
        name: "状态",
      },
      {
        key: "comment",
        value: "",
        name: "备注",
      },
      {
        key: "",
        value: "",
        name: "",
      },
      {
        key: "",
        value: "",
        name: "刷新重连",
      },
    ]);
    const pointAvailable = ref(false);
    /* 属性点 */
    const refreshFun = async () => {
      try {
        /* pduConnState	1,启用PDU，2停用PDU，3，刷新重连PDU */
        await api.editPduConn({
          pduConnState: 3,
          pduId: props.treeInfo.pduId,
        });
        message.success(`刷新重连成功`);
      } catch (error: any) {
        message.error(error?.message ? error.message : "刷新重连失败");
      }
    };
    const treeEdit = async () => {};

    // 编辑表格弹窗
    const [visibleTable, tableOperationAdd] = useModalVisible();
    const getDetail = async () => {
      try {
        const { data } = await api.getPduLinkerDescById(
          props.treeInfo?.pduId || ""
        );
        formList.value.map((item) => {
          Object.keys(data).map((key) => {
            if (item.key === key) item.value = data[key];
          });
        });
        pointAvailable.value = !!data.available
      } catch (error: any) {
        message.error(error?.message ? error.message : "程序异常");
      }
    };
    onMounted(() => {});
    expose({
      _refresh: handleReset,
      // _treeOperation: treeOperation,
    });
    return () => (
      <div class="deviceConnection-right flex1 overAuto">
        <div class="title flex-center">
          {/* <div class="icon"></div> */}
          <div class="name">协议数据单元</div>
        </div>
        <a-form class="deviceConnection-form word-break-all" layout="inline">
          <a-row style="width: 100%">
            {formList.value.map((item: any) => {
              return (
                <>
                  {item.name !== "状态" && item.name !== "刷新重连" && (
                    <a-col span={8}>
                      <a-form-item label={item.name}>{item.value}</a-form-item>
                    </a-col>
                  )}
                  {item.name === "状态" && (
                    <a-col span={8}>
                      <a-form-item name="pointCode" label="状态">
                        {item.value ? (
                          <a-tag color="success">启用</a-tag>
                        ) : (
                          <a-tag color="error">停用</a-tag>
                        )}
                      </a-form-item>
                    </a-col>
                  )}
                  {item.name === "刷新重连" && pointAvailable.value && (
                    <a-col span={8}>
                      <a-form-item name="pointCode" label="刷新重连">
                        <a-popconfirm
                          v-slots={{
                            title: () => (
                              <>
                                确认刷新重连？<p>请再次确保生产现场安全</p>
                              </>
                            ),
                          }}
                          placement="right"
                          onConfirm={() => {
                            refreshFun();
                          }}
                        >
                          <a-button type="primary">刷新重连</a-button>
                        </a-popconfirm>
                      </a-form-item>
                    </a-col>
                  )}
                </>
              );
            })}
          </a-row>
        </a-form>
        <div class="title flex-center" style="margin-bottom: 18px;">
          {/* <div class="icon"></div> */}
          <div class="name">属性点</div>
        </div>
        <a-form
          class="table-query-form"
          modal={searchForm.value}
          layout="inline"
        >
          <a-row>
            <a-col span={6}>
              <a-form-item name="" label="标签">
                <a-input
                  v-model={[searchForm.value.pointCode, "value"]}
                  placeholder="请输入"
                ></a-input>
              </a-form-item>
            </a-col>
            <a-col span={6}>
              <a-form-item name="" label="地址">
                <a-input
                  v-model={[searchForm.value.pointAddress, "value"]}
                  placeholder="请输入"
                ></a-input>
              </a-form-item>
            </a-col>
            <a-col span={6}>
              <a-form-item name="" label="标签状态">
                <a-select
                  show-search
                  allowClear
                  v-model={[searchForm.value.available, "value"]}
                  placeholder="请选择标签状态"
                >
                  {(availableList.value || []).map((item: any) => (
                    <a-select-option key={item.id}>{item.name}</a-select-option>
                  ))}
                </a-select>
              </a-form-item>
            </a-col>
            <a-col style={{ textAlign: "right" }} span={6}>
              <a-form-item>
                <a-space>
                  <a-button type="primary" onClick={refresh}>
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
              <a-space>
                <a-button type="primary" onClick={() => tableOperationAdd()}>
                  添加
                </a-button>

                {/* <a-popconfirm
                  title="确认停用？"
                  onConfirm={() => {
                    del(state.selectedRowKeys, 0);
                  }}
                  disabled={state.selectedRowKeys.length < 1}
                >
                  <a-button disabled={state.selectedRowKeys.length < 1}>
                    批量停用
                  </a-button>
                </a-popconfirm> */}
              </a-space>
            ),
            content: () => (
              <a-table
                dataSource={tableList.value}
                columns={columns}
                pagination={pagination}
                row-selection={{
                  selectedRowKeys: state.selectedRowKeys,
                  onChange: onSelectChange,
                  getCheckboxProps: (record) => ({
                    disabled: record.lock === 1,
                  }),
                }}
                class="PRETable"
                rowKey="pointId"
                loading={isLoading.value}
                v-slots={{
                  headerCell: ({ title, column }) => {
                    if (
                      column.dataIndex === "operation" ||
                      column.dataIndex === "state"
                    ) {
                      return (
                        <span>
                          <span class="mr6">{title}</span>
                          <a-tooltip title="不可编辑的标签已被锁定，如需修改，请先前往打点工具解锁">
                            <QuestionCircleOutlined />
                          </a-tooltip>
                        </span>
                      );
                    }
                  },
                  bodyCell: ({ column, record }) => {
                    if (column.dataIndex === "state") {
                      return (
                        <a-switch
                          disabled={record.lock === 1}
                          checked-children="启用"
                          un-checked-children="停用"
                          onChange={() => {
                            del([record.pointId], !record.available ? 0 : 1);
                          }}
                          v-model={[record.available, "checked"]}
                        />
                      );
                    }
                    if (column.dataIndex === "pointCode") {
                      return (
                        <>
                          {record.lock !== 1 ? (
                            <UnlockOutlined />
                          ) : (
                            <LockOutlined />
                          )}
                          <span
                            style="margin-left: 5px;"
                            title={record.pointCode}
                          >
                            {record.pointCode}
                          </span>
                        </>
                      );
                    }
                    if (column.dataIndex === "operation") {
                      return (
                        <a-space size={16}>
                          <a onClick={() => tableOperation("detail", record)}>
                            详情
                          </a>
                          {record.lock !== 1 && (
                            <>
                              <a onClick={() => tableOperation("edit", record)}>
                                编辑
                              </a>
                              {/* <a-popconfirm
                                title="确认删除？"
                                onConfirm={() => {
                                  del([record.pointId]);
                                }}
                              >
                                <a>删除</a>
                              </a-popconfirm> */}
                            </>
                          )}
                        </a-space>
                      );
                    }
                  },
                }}
              />
            ),
          }}
        ></inl-layout-table>
        <TableModal
          v-model={[visibleTable.value, "visible"]}
          onRefresh={() => refresh()}
          treeInfo={props.treeInfo}
        />
      </div>
    );
  },
});

export default point;
