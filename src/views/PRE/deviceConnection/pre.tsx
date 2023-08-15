import {
  defineComponent,
  onMounted,
  reactive,
  ref,
  nextTick,
  watch,
} from "vue";
import CommonTree from "@/components/commonTree";
import api from "@/api/PRE";
import { useModalVisible, useTableList } from "inl-ui/dist/hooks";
import { message, Modal } from "ant-design-vue";

const columns = [
  {
    title: "协议数据单元名称",
    dataIndex: "pduName",
    ellipsis: true,
  },
  {
    title: "协议数据单元编码",
    dataIndex: "pduCode",
    ellipsis: true,
  },
  {
    title: "协议类型",
    dataIndex: "protocolType",
    ellipsis: true,
  },
  {
    title: "连接",
    dataIndex: "url",
    ellipsis: true,
  },
  {
    title: "扫描周期(毫秒)",
    dataIndex: "scanRate",
    ellipsis: true,
  },
  {
    title: "状态",
    dataIndex: "status",
    ellipsis: true,
    width: 100,
  },
];

export default defineComponent({
  props: {
    treeInfo: {
      type: Object,
      default: () => {},
    },
  },
  setup(props, { emit }) {
    let form: any = reactive({
      name: null,
      remark: null,
      fileUrl: null,
    });
    // table
    const { currPage, isLoading, refresh, tableList, pageSize, pagination } =
      useTableList(
        () =>
          api.getPreItemByPreCode({
            // preCode: props.treeInfo.preName,
            pageNum: currPage.value,
            pageSize: pageSize.value,
          }),
        "pduItemList",
        "total"
      );

    const handleReset = () => {
      refresh();
    };
    const restart = async () => {
      try {
        await api.restartPre();
        message.success(`重启成功`);
      } catch (error) {
        message.error("重启失败");
      }
    };
    watch(
      () => props.treeInfo,
      (e) => {
        if (e) {
          form = e;
          refresh();
        }
      },
      {
        immediate: true,
      }
    );
    onMounted(() => {
      refresh();
    });
    return () => (
      <div class="deviceConnection-right flex1 overAuto">
        <div class="title flex-center">
          {/* <div class="icon"></div> */}
          <div class="name">PRE（协议路由）</div>
        </div>
        <a-form class="deviceConnection-form word-break-all" layout="inline">
          <a-row style="width: 100%">
            <a-col span={22}>
              <a-row>
                <a-col span={8}>
                  <a-form-item name="" label="名称">
                    {form.pduName}
                  </a-form-item>
                </a-col>
                <a-col span={8}>
                  <a-form-item name="" label="备注">
                    {form.comment}
                  </a-form-item>
                </a-col>
              </a-row>
              <a-row>
                <a-col span={8}>
                  <a-form-item name="pointCode" label="重启">
                    <a-popconfirm
                      v-slots={{
                        title: () => (
                          <>
                            确认重启？<p>请再次确保生产现场安全</p>
                          </>
                        ),
                      }}
                      placement="right"
                      onConfirm={() => {
                        restart();
                      }}
                    >
                      <a-button type="primary">重启</a-button>
                    </a-popconfirm>
                  </a-form-item>
                </a-col>
              </a-row>
            </a-col>
          </a-row>
        </a-form>
        <div class="title flex-center">
          {/* <div class="icon"></div> */}
          <div class="name">PDU（协议数据单元）</div>
        </div>
        <inl-layout-table
          v-slots={{
            content: () => (
              <a-table
                dataSource={tableList.value}
                columns={columns}
                pagination={pagination}
                class="PRETable"
                loading={isLoading.value}
                v-slots={{
                  bodyCell: ({ column, record }) => {
                    if (column.dataIndex === "status") {
                      return <span>{record.available ? "启用" : "停用"}</span>;
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
