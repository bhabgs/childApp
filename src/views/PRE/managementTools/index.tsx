/**
 *  打点工具
 */
import {
  defineComponent,
  onMounted,
  onUnmounted,
  reactive,
  ref,
  nextTick,
} from "vue";
import CommonTree from "@/components/commonTree";
import api from "@/api/PRE";
import dayjs, { Dayjs } from "dayjs";
import { useModalVisible, useTableList } from "inl-ui/dist/hooks";
import {
  UnlockOutlined,
  LockOutlined,
  QuestionCircleOutlined,
} from "@ant-design/icons-vue";
import { message, Modal } from "ant-design-vue";
import { cloneDeep, values } from "lodash";
import { Chart } from "@antv/g2";
import chart from "./chart";
import { pointErrorEsenum } from "@/utils/Esenum/EsenumObj.js";

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
    width: 90,
  },
  {
    title: "值",
    dataIndex: "value",
    key: "value",
    ellipsis: true,
  },
  {
    title: "时间戳",
    dataIndex: "dateTime",
    key: "dateTime",
    ellipsis: true,
    width: 220,
  },
  // {
  //   title: "变化次数",
  //   dataIndex: "count",
  //   key: "count",
  //   ellipsis: true,
  //   width: 90,
  // },
  {
    title: "状态",
    dataIndex: "status",
    key: "status",
    width: 200,
    // ellipsis: true,
  },
  {
    title: "操作",
    dataIndex: "operation",
    key: "operation",
    // slots: { customRender: "operation" },
  },
];
const ManagementTools = defineComponent({
  name: "ManagementTools",
  setup(props, ctx) {
    const treeRef = ref();
    const currSelectNode = ref();
    const activeKey = ref("shift");
    const searchForm = ref<{
      pointCode: string;
      address: string;
      status?: string;
    }>({
      pointCode: "",
      address: "",
      status: "",
    });
    const stateList: any = ref([
      {
        label: "全部",
        value: "",
      },
      {
        label: "良好",
        value: "good",
      },
      {
        label: "故障",
        value: "bad",
      },
    ]);

    const handleNodeSelect = (node: any) => {
      currPage.value = 1;
      pageSize.value = 50;
      currSelectNode.value = node;
      refresh();
    };
    const pointCodeList = ref<string[]>([]);
    let timer: any = ref();
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
        let parma = {
          pageNum: currPage.value,
          pageSize: pageSize.value,
          preCode: currSelectNode.value.preCode,
          pduCode: currSelectNode.value.pduCode,
          ...searchForm.value,
        };
        if (!parma.status) delete parma.status;
        const res: any = await api.getPointTable(parma);
        pointCodeList.value = [];
        res.data.pointInfos.map((item: any) => {
          if (item.pointCode) pointCodeList.value.push(item.pointId);
        });
        return res;
      },
      "pointInfos",
      "totalCount",
      50
    );
    const getPointTablePolling = async () => {
      const parmas = {
        preCode: currSelectNode.value.preCode,
        pduCode: currSelectNode.value.pduCode,
        pointIdList: pointCodeList.value || [],
      };
      const { data } = await api.getPointTablePolling(parmas);
      Object.keys(data).map((key) => {
        tableList.value.map((item) => {
          if (item.pointId + "" === key) {
            item = Object.assign(item, data[key]);
            return item;
          }
        });
        if (issuedVisible.value)
          tableIssuedList.value.map((item) => {
            if (item.pointId + "" === key) {
              item = Object.assign(item, data[key]);
              return item;
            }
          });
      });
    };
    /* 刷新标签 */
    const refreshLabel = () => {};
    /* 锁定 解锁 */
    const lockFun = async (ids: string[], type: any) => {
      if (ids.length < 1) {
        message.warning("至少选择一条数据");
        return;
      }
      isLoading.value = true;
      try {
        const res: any = await api.getPointLock({
          pointCodeList: ids,
          lock: type,
        });
        if (res.code === "M0000") {
          message.success(type ? "锁定成功" : "解锁成功");
        } else {
          message.error(type ? "锁定失败" : "解锁失败");
        }
        refresh();
        state.selectedRowKeys = [];
        state.selectedRows = [];
      } catch (error) {}
    };
    /* 下发 */
    const checked = ref(false);
    const issuedVisible = ref(false);
    const issuedVisibleAgain = ref(false);
    const issuedModalSpinning = ref(false);
    const issuedVisibleAgainLoading = ref(false);
    const tableIssuedList: any = ref([]);
    const sendType: any = ref("");
    const distributionMethodList: any = ref<object[]>([]);
    const columnsIssued = ref([
      {
        title: "标签",
        dataIndex: "pointCode",
      },
      {
        title: "当前值",
        dataIndex: "value",
      },
      {
        title: "写入值",
        dataIndex: "writeCount",
      },
    ]);
    const formRef = ref();
    const issuedTime = ref();
    const formState = ref({ sendType: "" });
    const issuedFun = (val: string[]) => {
      if (val.length < 1) {
        message.warning("至少选择一条数据");
        return;
      }
      tableIssuedList.value = cloneDeep(val);
      issuedVisible.value = true;
    };
    const issuedSave = (ids: string[]) => {
      const issued = issuedTime.value || 0;
      if (dayjs().unix() - issued < 15 * 60) {
        issuedSaveFun();
        return;
      }
      checked.value = false;
      formRef.value.validateFields().then(async () => {
        issuedVisibleAgain.value = true;
      });
    };
    const issuedCancel = (ids: string[]) => {};
    const issuedList = async () => {
      const { data } = await api.getPointSendList();
      distributionMethodList.value = data;
      formState.value.sendType = data[0].code;
    };
    const issuedSaveFun = (ids?: string[]) => {
      issuedModalSpinning.value = true;
      issuedVisibleAgainLoading.value = true;
      formRef.value.validateFields().then(async () => {
        try {
          let num = 0;
          tableIssuedList.value.forEach((item) => {
            item.sendType = formState.value.sendType;
            item.value = item.writeMyValue;
            if (!item.writeMyValue) num = 1;
          });
          if (num) {
            message.warning("有写入值未填写"); //为空请输入写入值
            return;
          }
          const res = await api.getPointSend(tableIssuedList.value);
          // issuedVisible.value = false;
          issuedVisibleAgain.value = false;
          formState.value.sendType = distributionMethodList.value[0].code || "";
          state.selectedRowKeys = [];
          state.selectedRows = [];
          message.success("下发成功");
          refresh();
          // if (checked.value) issuedTime.value = dayjs().unix();
        } catch (error) {
          message.error("下发失败");
        } finally {
          issuedModalSpinning.value = false;
          issuedVisibleAgainLoading.value = false;
        }
      });
    };
    const changeFun = () => {
      if (checked.value) issuedTime.value = dayjs().unix();
    };
    /* 数据分析 */
    const dataAnalysisVisible = ref(false);
    const dataAnalysisList: any = ref([]);
    const timeData = reactive({
      times: [dayjs().startOf("day"), dayjs().endOf("day")], // 时间选择器存的值
      startTime: dayjs().startOf("day"), // 开始时间
      endTime: dayjs().endOf("day"), // 结束时间
    });
    const dataAnalysisTime: any = ref([]);
    const dataAnalysisTab: any = ref("1hour");
    const dataAnalysisSpinning: any = ref(false);
    const dataAnalysisTabList: any = ref([
      { name: "近1小时", value: "1hour" },
      { name: "近1天", value: "1day" },
      { name: "近3天", value: "3day" },
      { name: "近7天", value: "7day" },
    ]);
    let columnchart = ref<Chart>();
    const getDataAnalysisTime = (val: string) => {
      const num = val.substr(0, 1);
      const unit: any = val.substr(0 - val.length + 1);
      dataAnalysisTime.value = [
        dayjs().subtract(+num, unit).format("YYYY-MM-DD HH:mm:ss"),
        dayjs().format("YYYY-MM-DD HH:mm:ss"),
      ];
    };
    const dataAnalysis = () => {
      if (state.selectedRows.length < 1) {
        message.warning("至少选择一条数据");
        return;
      }
      dataAnalysisVisible.value = true;
      getDataAnalysisTime(dataAnalysisTab.value);
      nextTick(() => initPiechart());
    };
    const closeDataAnalysis = () => {
      if (columnchart.value && !columnchart.value.destroyed)
        columnchart.value.destroy();
    };
    const getParmas = () => {
      const begin = dayjs(dataAnalysisTime.value[0]).unix();
      const end = dayjs(dataAnalysisTime.value[1]).unix();
      const time = end - begin;
      /* //秒 SECOND("s","%ds"),1day //分钟 MINUTE("m","%dm"), //小时 HOUR("h","%dh"), //天 DAY("d","%dd"), ; */
      if (time <= 60 * 60) return { timeNum: 1, timeUnit: "SECOND" };
      else if (time > 60 * 60 && time <= 24 * 60 * 60)
        return { timeNum: 1, timeUnit: "MINUTE" };
      else if (time > 24 * 60 * 60 && time <= 3 * 24 * 60 * 60)
        return { timeNum: 30, timeUnit: "MINUTE" };
      else if (time > 3 * 24 * 60 * 60) return { timeNum: 1, timeUnit: "HOUR" };
    };

    const initPiechart = async () => {
      dataAnalysisSpinning.value = true;
      let chartData: any = [];
      const begin = Date.now();
      // console.log(Date.now(), "开始");
      try {
        let arr: { pointCode: any; valueType: any }[] = [];
        state.selectedRows.map((item) => {
          arr.push({ pointCode: item.pointCode, valueType: item.dataType });
        });
        const { data } = await api.getQueryHistoryData({
          pointCodeList: arr,
          startTime: dayjs(dataAnalysisTime.value[0]).valueOf(),
          endTime: dayjs(dataAnalysisTime.value[1]).valueOf(),
          downsample: {
            ...getParmas(),
            aggregator: "FIRST",
          },
        });
        data.map((item) => {
          item.pointHistoryValues.map((items) => {
            items.pointCode = items.prePointCode;
            items.dt = dayjs(items.dt).format("YYYY-MM-DD HH:mm:ss.SSS");
            if (typeof items.value === "boolean") {
              items.right = items.value ? 1 : 0;
              items.type = "square";
            } else {
              items.left = items.value;
              items.type = "hyphen";
            }
            chartData.push(items);
          });
        });
      } catch (error) {
      } finally {
        dataAnalysisSpinning.value = false;
        if (columnchart.value && !columnchart.value.destroyed)
          columnchart.value.destroy();
        columnchart.value = chart("ColumnChart", chartData);
        // console.log(Date.now(), (Date.now() - begin) / 1000, "图表渲染结束");
      }
    };
    const state = reactive<{
      selectedRowKeys: string[];
      selectedRows: any[];
      modalVisible: boolean;
    }>({
      selectedRowKeys: [],
      selectedRows: [],
      modalVisible: true,
    });
    const onSelectChange = (selectedRowKeys: string[], selectedRows: any[]) => {
      state.selectedRowKeys = selectedRowKeys;
      state.selectedRows = selectedRows;
    };
    const handleReset = () => {
      searchForm.value = {
        pointCode: "",
        address: "",
        status: "",
      };
      state.selectedRowKeys = [];
      state.selectedRows = [];
      refresh();
    };
    const getTreeData = async (keyword = "") => {
      try {
        const { data } = await api.getPointTree();
        data.forEach((item) => {
          // item.pduName = item.preCode;
          item.pduName = "通讯协议";
          item.pduId = "sys" + item.preCode;
          item.isSystem = true;
        });
        return data;
      } catch (error: any) {
        message.error(error?.message ? error?.message : "查询失败");
        return false;
      }
    };
    onMounted(() => {
      // refresh();
      // treeRef.value._refresh;
      issuedList();
      timer.value = setInterval(() => {
        getPointTablePolling();
      }, 1000);
    });
    onUnmounted(() => {
      clearInterval(timer.value);
      timer.value = null;
    });
    return () => (
      <div class="PREBox managementTools flex" id="managementTools">
        <div class="managementTools-left">
          <CommonTree
            ref={treeRef}
            dot
            dotName={"pduStatus"}
            fieldNames={{
              children: "pduInfoList",
              key: "pduId",
              title: "pduName",
            }}
            getData={getTreeData}
            onSelect={handleNodeSelect}
          />
        </div>
        <a-divider
          type="vertical"
          style={{ height: "100%", margin: "0 24px" }}
        ></a-divider>
        <div class="managementTools-right flex1 overAuto">
          <a-form
            class="table-query-form"
            layout="inline"
            model={searchForm.value}
          >
            <a-row>
              <a-col span={6}>
                <a-form-item name="pointCode" label="标签">
                  <a-input
                    v-model={[searchForm.value.pointCode, "value"]}
                    placeholder="请输入"
                  ></a-input>
                </a-form-item>
              </a-col>
              <a-col span={6}>
                <a-form-item name="address" label="地址">
                  <a-input
                    v-model={[searchForm.value.address, "value"]}
                    placeholder="请输入"
                  ></a-input>
                </a-form-item>
              </a-col>
              <a-col span={6}>
                <a-form-item
                  name="status"
                  label="状态"
                  label-col={{ span: 4 }}
                  wrapper-col={{ span: 20 }}
                >
                  <a-select
                    v-model={[searchForm.value.status, "value"]}
                    allowClear
                  >
                    {stateList.value.map((item: any) => (
                      <a-select-option value={item.value} key={item.value}>
                        {item.label}
                      </a-select-option>
                    ))}
                  </a-select>
                </a-form-item>
              </a-col>
              <a-col style={{ textAlign: "right" }} span={6}>
                <a-form-item>
                  <a-space>
                    <a-button
                      type="primary"
                      onClick={() => {
                        state.selectedRowKeys = [];
                        state.selectedRows = [];
                        refresh();
                      }}
                    >
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
                  <a-popconfirm
                    v-slots={{
                      title: () => (
                        <>
                          确认刷新标签？<p>请再次确保生产现场安全</p>
                        </>
                      ),
                    }}
                    placement="right"
                    onConfirm={() => {
                      refreshLabel;
                    }}
                  >
                    <a-button type="primary">刷新标签</a-button>
                  </a-popconfirm>
                  <a-button onClick={() => issuedFun(state.selectedRows)}>
                    批量下发
                  </a-button>
                  <a-button
                    onClick={() => lockFun(state.selectedRowKeys, true)}
                  >
                    批量锁定
                  </a-button>
                  <a-button
                    onClick={() => lockFun(state.selectedRowKeys, false)}
                  >
                    批量解锁
                  </a-button>
                  <a-button onClick={() => dataAnalysis()}>数据分析</a-button>
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
                      disabled: record.status !== 0,
                    }),
                  }}
                  row-class-name={(_record, index) =>
                    _record.status !== 0 ? "table-row-red" : null
                  }
                  class="PRETable"
                  rowKey="pointCode"
                  loading={isLoading.value}
                  v-slots={{
                    headerCell: ({ column, record }) => {
                      if (column.dataIndex === "operation") {
                        return (
                          <span>
                            <span class="mr6">操作</span>
                            <a-tooltip title="锁定后，不可编辑该标签信息">
                              <QuestionCircleOutlined />
                            </a-tooltip>
                          </span>
                        );
                      }
                    },
                    bodyCell: ({ column, record }) => {
                      if (column.dataIndex === "dateTime") {
                        return record.dateTime
                          ? dayjs(record.dateTime).format(
                              "YYYY-MM-DD HH:mm:ss.SSS"
                            )
                          : "--";
                      }
                      if (column.dataIndex === "status") {
                        // const errorMsg =
                        //   pointErrorEsenum.indexOfName(record.status) || "";
                        const errorMsg = record.msg;
                        return (
                          <>
                            <span
                              class={[
                                "dot",
                                record.status === 0 ? "dot-green" : "dot-red",
                              ]}
                            ></span>
                            <span
                              title={errorMsg}
                              class={[
                                "ml6",
                                record.status !== 0 ? "text-red" : "",
                              ]}
                            >
                              {/* {record.status ? "良好" : "异常"} */}
                              {record.status === 0
                                ? "良好"
                                : errorMsg?.length > 10
                                ? `${errorMsg.substr(0, 10)}...`
                                : errorMsg}
                            </span>
                          </>
                        );
                      }
                      if (column.dataIndex === "operation") {
                        return (
                          <a-space size={16}>
                            {record.writeEnable && record.status === 0 && (
                              <a onClick={() => issuedFun([record])}>下发</a>
                            )}
                            <a
                              onClick={() =>
                                lockFun([record.pointCode], !record.isLock)
                              }
                            >
                              {record.isLock ? "解除锁定" : "锁定"}
                            </a>
                          </a-space>
                        );
                      }
                    },
                  }}
                />
              ),
            }}
          ></inl-layout-table>
        </div>

        <a-modal
          title={"数据下发"}
          centered
          destroyOnClose
          maskClosable={false}
          keyboard={false}
          v-model={[issuedVisible.value, "visible"]}
          onOk={issuedSave}
          onCancel={issuedCancel}
          ok-text="下发"
          confirm-loading={issuedModalSpinning.value}
          v-slots={{
            footer: () => (
              <a-space>
                <a-button type="primary" onClick={issuedSave}>
                  下发
                </a-button>
              </a-space>
            ),
          }}
        >
          <a-spin spinning={issuedModalSpinning.value}>
            <a-table
              dataSource={tableIssuedList.value}
              columns={columnsIssued.value}
              class="PRETable"
              scroll={{ y: 300 }}
              pagination={false}
              v-slots={{
                bodyCell: ({ column, record }) => {
                  if (column.dataIndex === "writeCount") {
                    return record.writeEnable ? (
                      <a-input
                        v-model={[record.writeMyValue, "value"]}
                        placeholder="请输入"
                      ></a-input>
                    ) : (
                      "只读"
                    );
                  }
                },
              }}
            />
            <a-form class="mt16" ref={formRef} model={formState.value}>
              <a-form-item
                label="下发方式"
                name="sendType"
                rules={[{ required: true, message: "请选择下发方式" }]}
              >
                <a-select
                  v-model={[formState.value.sendType, "value"]}
                  allowClear
                  style="width: 200px"
                >
                  {distributionMethodList.value.map((item: any) => (
                    <a-select-option value={item.code} key={item.code}>
                      {item.name}
                    </a-select-option>
                  ))}
                </a-select>
              </a-form-item>
            </a-form>
          </a-spin>
        </a-modal>
        <a-modal
          title={"确认执行？"}
          centered
          destroyOnClose
          maskClosable={false}
          width="16%"
          wrapClassName="issuedAgain-modal"
          v-model={[issuedVisibleAgain.value, "visible"]}
          onOk={issuedSaveFun}
          onCancel={() => sessionStorage.setItem("issued", "0")}
          confirm-loading={issuedVisibleAgainLoading.value}
        >
          <p class="issuedAgainText">请确认安全后执行</p>
          <a-checkbox
            onChange={changeFun}
            disabled={issuedVisibleAgainLoading.value}
            v-model={[checked.value, "checked"]}
          >
            15分钟内不再弹出
          </a-checkbox>
        </a-modal>
        <a-modal
          title={"数据分析"}
          centered
          width="36%"
          footer={null}
          // destroyOnClose
          v-model={[dataAnalysisVisible.value, "visible"]}
          // onOk={issuedSaveFun}
          onCancel={closeDataAnalysis}
        >
          <a-spin spinning={dataAnalysisSpinning.value}>
            <a-tabs
              // type="card"
              v-model={[dataAnalysisTab.value, "activeKey"]}
              onChange={() => {
                getDataAnalysisTime(dataAnalysisTab.value);
                initPiechart();
              }}
            >
              {dataAnalysisTabList.value.map((item: any) => (
                <a-tab-pane key={item.value} tab={item.name}></a-tab-pane>
              ))}
            </a-tabs>
            <a-range-picker
              format={"YYYY-MM-DD HH:mm:ss"}
              valueFormat={"YYYY-MM-DD HH:mm:ss"}
              v-model={[dataAnalysisTime.value, "value"]}
              onChange={() => {
                dataAnalysisTab.value = "";
                initPiechart();
              }}
              show-time
            />
            <div class="columnChart" id={`ColumnChart`}></div>
          </a-spin>
        </a-modal>
      </div>
    );
  },
});

export default ManagementTools;
