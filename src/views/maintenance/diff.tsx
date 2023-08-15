import { defineComponent, ref } from "vue";
import * as api from "@/api/maintenance";
import { useRoute } from "vue-router";
import { TableColumnType, message } from "ant-design-vue";
import dayjs from "dayjs";

export default defineComponent({
  setup() {
    const route = useRoute();

    // 当前版本
    const currentVersion = ref("");

    // 查分包列表
    const diffList = ref<Array<any>>([]);
    // 获取数据源
    const getDeployInfo = async (hideMessage?: boolean) => {
      const res = await api.deploy({
        versionName: route.params.id as string,
        useCacheOnly: true,
        diffOnly: true,
      });
      diffList.value = res.data || [];

      if (diffList.value.length <= 0 && !hideMessage) {
        message.warn("当前版本没有可更新的组件");
      }
    };
    getDeployInfo();
    // 获取列
    const createColumns: () => TableColumnType[] = () => {
      return [
        {
          title: "序号",
          width: 100,
          customRender({ index }) {
            return index + 1;
          },
        },
        {
          title: "实例编码",
          dataIndex: "comCode",
          key: "comCode",
        },
        {
          title: "实例名称 ",
          dataIndex: "instName",
          key: "instName",
        },
        {
          title: "所在主机 ",
          dataIndex: "nodeHost",
          key: "nodeHost",
        },
        {
          title: "当前组件名 ",
          dataIndex: "oldBinName",
          key: "oldBinName",
        },
        {
          title: "新版组件名 ",
          dataIndex: "newBinName",
          key: "newBinName",
        },
        {
          title: "部署模式",
          dataIndex: "deployMode",
        },
      ];
    };

    // 需要更新的组件
    const needUpdate = ref<Array<any>>([]);

    // 获取当前版本
    const getCurrentVersion = async () => {
      const res = await api.getClusterInfo();
      currentVersion.value = res.data.versionName;
    };
    getCurrentVersion();
    // 一键更新
    const update = async () => {
      // if (needUpdate.value.length <= 0) return;
      // 如果当前有正在部署的任务，则不允许提交
      if (deployStatus.value.deploying) {
        message.error("当前有正在部署的任务，请稍后再试");
        return;
      }
      const res = await api.deploy(
        {
          versionName: route.params.id as string,
          useCacheOnly: true,
          diffOnly: false,
        },
        needUpdate.value || []
      );
      checkStatus();
      showDeployStatus.value = true;
      message.success("任务提交成功");
    };

    // 当前部署状态信息
    const deployStatus = ref({
      deploying: false,
      curStatus: "空闲",
      curInfo: "部署完成",
      prevDt: 1690946036509,
      prevInfo: "部署完成",
      curError: "",
      prevError: "",
    });

    // 是否显示部署状态
    const showDeployStatus = ref(false);

    // 查看当前部署状态
    const checkStatus = async () => {
      const res = await api.getDeployStatus();
      deployStatus.value = res.data;

      if (deployStatus.value.deploying) {
        setTimeout(() => {
          checkStatus();
        }, 1000);
      } else {
        getDeployInfo(true);
      }
    };

    checkStatus();
    return () => (
      <div class={["maintenance"]}>
        <a-modal
          v-model:visible={showDeployStatus.value}
          title={"更新状态"}
          width={430}
          v-slots={{
            footer() {
              return (
                <div>
                  <a-button
                    key="back"
                    onClick={() => {
                      showDeployStatus.value = false;
                    }}
                  >
                    关闭窗口
                  </a-button>
                  {deployStatus.value.deploying && (
                    <a-popconfirm
                      title="确认取消更新吗?"
                      ok-text="是"
                      cancel-text="否"
                      onConfirm={() => {
                        api.cancelDeploy();
                        showDeployStatus.value = false;
                      }}
                    >
                      <a-button key="back">取消更新</a-button>
                    </a-popconfirm>
                  )}
                </div>
              );
            },
          }}
        >
          <div class="deploy-status" style={{ lineHeight: "28px" }}>
            <div>
              <div>
                当前状态：
                {deployStatus.value.deploying ? (
                  <a-tag color="orange">部署中</a-tag>
                ) : (
                  <a-tag color="green">空闲</a-tag>
                )}
              </div>
              <div>
                更新信息：
                {!deployStatus.value.curInfo && (
                  <a-tag color="green">暂无更新信息</a-tag>
                )}
                <span
                  style={{
                    background: "#EFF2F6",
                    margin: "10px 0",
                  }}
                >
                  {deployStatus.value.curStatus ||
                  deployStatus.value.deploying ? (
                    <>
                      <a-tag color="green">{deployStatus.value.curInfo}</a-tag>
                      <a-progress percent={deployStatus.value.curStatus || 1} />
                    </>
                  ) : (
                    ""
                  )}
                </span>
              </div>

              <div>
                更新错误：
                {deployStatus.value.curError ? (
                  <a-alert message={deployStatus.value.curError} type="error" />
                ) : (
                  <a-tag color="green">无报错信息</a-tag>
                )}
              </div>
            </div>
            <div>
              <div>
                上次更新时间：
                {dayjs(deployStatus.value.prevDt).format("YYYY-MM-DD HH:mm:ss")}
              </div>
              <div>
                上次更新信息：
                <a-tag color="green">{deployStatus.value.prevInfo}</a-tag>
              </div>
              <div>
                上次更新错误：
                {deployStatus.value.prevError ? (
                  <a-alert
                    message={deployStatus.value.prevError}
                    type="error"
                  />
                ) : (
                  <a-tag color="green">无报错信息</a-tag>
                )}
              </div>
            </div>
          </div>
        </a-modal>
        <div class={"opt"}>
          <div>
            <span>当前版本：{currentVersion.value}</span>&nbsp;&nbsp;&nbsp;
            <span>目标版本：{route.params.id}</span>
          </div>
          <div>
            <span>当前状态：</span>
            <span>
              {deployStatus.value.deploying ? (
                deployStatus.value.curStatus
              ) : (
                <a-tag color="green">空闲</a-tag>
              )}
            </span>
            &nbsp;&nbsp;&nbsp;
            <a-button
              onClick={async () => {
                showDeployStatus.value = true;
              }}
            >
              状态详情
            </a-button>
          </div>
          <a-popconfirm
            title="确定要更新选中的组件吗?"
            ok-text="是"
            cancel-text="否"
            placement="bottom"
            onConfirm={() => {
              update();
            }}
          >
            <a-button type="primary">一键更新</a-button>
          </a-popconfirm>
        </div>
        <a-table
          rowKey={(record) => record}
          dataSource={diffList.value}
          columns={createColumns()}
          rowSelection={{
            onChange(e) {
              needUpdate.value = e;
            },
          }}
        ></a-table>
      </div>
    );
  },
});
