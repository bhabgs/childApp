import { defineComponent, ref, reactive, onMounted, watch } from "vue";
import useClipboard from "vue-clipboard3";
import dayjs, { Dayjs } from "dayjs";
import { message } from "ant-design-vue";
import { filter } from "@/utils/filters";
import router from "@/router";

import { useTableList, useEvent, useModalVisible } from "inl-ui/dist/hooks";

import "@/assets/style/pages/cardCenter/pageConfig.less";

import cardCenterV2Api from "@/api/cardCenterV2";

/**
 * 页面配置
 */
export default defineComponent({
  name: "PageConfig",
  props: {},
  setup(prop) {
    const formRef = ref();
    // 一键复制
    const { toClipboard } = useClipboard();

    const formState = reactive<{
      pageName?: string | null; // 页面名称
      theme?: string | null; // 主题
      terminal?: string | null; // 平台
      version?: string | null; // 卡片版本
    }>({
      pageName: null,
      theme: null,
      terminal: null,
      version: null,
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
      {
        title: "主题",
        dataIndex: "theme",
      },
      {
        title: "平台",
        dataIndex: "terminal",
        width: "6em",
      },
      {
        title: "卡片版本",
        dataIndex: "version",
      },
      {
        title: "布局方式",
        dataIndex: "layout",
      },
      {
        title: "数据状态",
        dataIndex: "dataState",
      },
      {
        title: "最后修改时间",
        dataIndex: "updateDt",
        width: "10em",
      },
      {
        title: "操作",
        dataIndex: "action",
        width: "28em",
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
        cardCenterV2Api.pageList({
          ...formState,
          pageNum: currPage.value,
          pageSize: pageSize.value,
        }),
      "records",
      "total"
    );

    useEvent("PageConfig", refresh);

    // 重置表单
    const handleReset = () => {
      formRef.value.resetFields();

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
      refresh();
    };

    // 详情数据
    const data = ref({});

    const handleDelete = async (id: number) => {
      const res = await cardCenterV2Api.pageDelete(id);
      if (res.data) {
        message.success("删除成功");
        refresh();
      } else {
        message.success("删除失败");
      }
    };

    onMounted(async () => {
      refresh();
    });

    const toEditPage = (id?, row?) => {
      // 新页签打开
      router.push({
        name: "EditPageConfig",
        params: { id: id || dayjs().valueOf() },
        query: {
          name: id ? `编辑配置 (${row?.pageName})` : "新增配置",
          id: id,
        },
      });
    };

    return () => (
      <div class="pageConfig flex">
        <a-form
          class="table-query-form"
          labelCol={{ style: { width: "5em" } }}
          ref={formRef}
          model={formState}
          onSubmit={submit}
        >
          <a-row>
            <a-col span={6}>
              <a-form-item name="pageName" label="页面名称">
                <a-input
                  v-model={[formState.pageName, "value"]}
                  placeholder="请输入"
                  style={{ width: "70%" }}
                  allowClear
                ></a-input>
              </a-form-item>
            </a-col>

            <a-col span={6}>
              <a-form-item name="theme" label="主题">
                <a-select
                  v-model={[formState.theme, "value"]}
                  // options={themeList}
                  allowClear
                  style={{ width: "70%" }}
                ></a-select>
              </a-form-item>
            </a-col>
            <a-col span={6}>
              <a-form-item name="terminal" label="平台">
                <a-select
                  v-model={[formState.terminal, "value"]}
                  allowClear
                  style={{ width: "70%" }}
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
              <a-form-item name="version" label="卡片版本">
                <a-select
                  v-model={[formState.version, "value"]}
                  allowClear
                  style={{ width: "70%" }}
                >
                  {/* {state.terminalList &&
                    state.terminalList.map((item: any) => (
                      <a-select-option value={item.code} key={item.code}>
                        {item.name}
                      </a-select-option>
                    ))} */}
                </a-select>
              </a-form-item>
            </a-col>

            <a-col style={{ textAlign: "right" }} span={6} offset={18}>
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
                  toEditPage();
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
                        <>
                          <a-button
                            type="link"
                            size="small"
                            onClick={() => {
                              toEditPage(record.id, record);
                            }}
                          >
                            编辑
                          </a-button>

                          <a-popconfirm
                            title="确认删除？"
                            onConfirm={() => {
                              handleDelete(record.id);
                            }}
                          >
                            <a-button type="link" size="small">
                              删除
                            </a-button>
                          </a-popconfirm>

                          <a-button type="link" size="small" onClick={() => {}}>
                            预览
                          </a-button>

                          <a-button type="link" size="small" onClick={() => {}}>
                            复制模板
                          </a-button>

                          <a-button
                            type="link"
                            size="small"
                            onClick={() => {
                              handleCopy(record.reference);
                            }}
                          >
                            复制引用地址
                          </a-button>
                        </>
                      );
                    }
                  },
                }}
              />
            ),
          }}
        ></inl-layout-table>
      </div>
    );
  },
});
