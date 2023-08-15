import { defineComponent, reactive, ref } from "vue";
import _ from "lodash";
import {
  QuestionCircleOutlined,
  ExclamationCircleFilled,
} from "@ant-design/icons-vue";
import AddUser from "./addUser";
import api from "@/api/PRE";
import { useRouter } from "vue-router";
import { useClipboard } from "@vueuse/core";
import { Modal, message } from "ant-design-vue";

export default defineComponent({
  name: "opcua",
  setup() {
    const router = useRouter();

    // table colomns
    const columns = [
      {
        title: "用户名",
        align: "center",
        width: "150px",
        dataIndex: "clientUsername",
      },
      {
        title: "允许匿名登录",
        align: "center",
        dataIndex: "anonymousAble",
        customRender({ text }) {
          return text === true ? "是" : "否";
        },
      },
      { title: "加密方式", align: "center", dataIndex: "endpointDescription" },
      { title: "访问路径", align: "center", dataIndex: "opcuaUrl" },
      { title: "命名空间", align: "center", dataIndex: "nameSpace" },
      {
        title: "操作",
        align: "center",
        width: "400px",
        customRender({ record }) {
          return (
            <>
              <a-button type="link" onClick={() => testUrl(record.opcuaUrl)}>
                测试连接
              </a-button>
              {/* <a-button type="link">详情</a-button> */}
              <a-button
                type="link"
                onClick={() => {
                  router.push({
                    name: "preForignServerOpcUaDetail",
                    params: { id: record.id },
                    query: {
                      name: "OPC UA:" + record.clientUsername,
                    },
                  });
                }}
              >
                编辑
              </a-button>
              <a-button type="link" onClick={() => deleteUser(record)}>
                删除
              </a-button>
            </>
          );
        },
      },
    ];
    const dataSource = ref<Array<any>>([]);

    // TODO: This is the data that will be sent to the server.
    const reqData = reactive({
      opcuaIp: "",
      opcuaPort: 0,
      opcuaUrl: "",
      maxConnNum: 0,
      outCacheTime: 0,
      minOutSessionTime: 0,
      maxOutSessionTime: 0,
      id: "",
    });

    const { copy } = useClipboard({
      source: () => reqData.opcuaUrl,
      legacy: true,
    });

    // page editor state
    const EditorStage = ref<boolean>(false);

    // 查询opcua的基础配置
    const getOpcuaSetting = async () => {
      const res = await api.getOpcuaSetting();
      const { data } = res;
      reqData.opcuaIp = data.opcuaIp;
      reqData.opcuaPort = data.opcuaPort;
      reqData.opcuaUrl = data.opcuaUrl;
      reqData.maxConnNum = data.maxConnNum;
      reqData.outCacheTime = data.outCacheTime;
      reqData.minOutSessionTime = data.minOutSessionTime;
      reqData.maxOutSessionTime = data.maxOutSessionTime;
      reqData.id = data.id;
    };
    getOpcuaSetting();
    // 保存
    const save = async () => {
      const resdata = _.cloneDeep(reqData);
      try {
        await api.saveOpcuaSetting(resdata);
        message.success("保存成功");
      } catch {}
      getOpcuaSetting();
    };

    // 重启
    const handleRestart = async () => {
      await api.restartOpauaServer();
      message.success("操作成功");
    };

    // test url
    const testUrl = async (url: string) => {
      await api.opcuaConnTest(url);
      message.success(`${url}: 测试成功`);
    };

    // 删除用户
    const deleteUser = (row) => {
      Modal.confirm({
        title: "提示",
        content: `确定删除用户“${row.clientUsername}”吗？`,
        async onOk() {
          await api.deleteOpcuaUser(row.id);
          message.success("删除成功");
          getUserList();
        },
      });
    };

    // 查询用户列表
    const isLoading = ref(false);
    const getUserList = async () => {
      isLoading.value = true;
      try {
        const res = await api.getOpcuaUsers();
        dataSource.value = res.data;
      } finally {
        isLoading.value = false;
      }
    };
    getUserList();
    const addUserData = ref();
    // page editor state
    const visible = ref<boolean>(false);
    return () => (
      <div class="foreign-opcua">
        <div class="opt">
          <a-button
            type="primary"
            onClick={async () => {
              if (EditorStage.value) {
                await save();
              }
              EditorStage.value = !EditorStage.value;
            }}
          >
            {EditorStage.value ? `保存` : "编辑"}
          </a-button>
          {EditorStage.value ? (
            <a-button
              onClick={() => {
                EditorStage.value = !EditorStage.value;
              }}
            >
              取消
            </a-button>
          ) : null}
        </div>
        <div class="foreignTitle baseConfig">基本配置</div>
        <a-form
          labelCol={{ style: { width: "8em" }, sm: { span: 8 } }}
          //   class={[EditorStage.value ? "" : "disabled"]}
          wrapperCol={{
            style: { width: "16em", marginBottom: "1em" },
            sm: { span: 16 },
          }}
          labelAlign="right"
          layout="inline"
          model={reqData}
        >
          <a-form-item label="地址" required>
            <a-input
              vModel={[reqData.opcuaIp, "value"]}
              disabled={!EditorStage.value}
            />
          </a-form-item>
          <a-form-item label="端口" required>
            <a-input-number
              style={{ width: "100%" }}
              controls={false}
              vModel={[reqData.opcuaPort, "value"]}
              disabled={!EditorStage.value}
            />
          </a-form-item>
          <a-form-item
            vSlots={{
              label() {
                return (
                  <a-space size={4}>
                    最大连接数
                    <a-tooltip title="最多允许多少个客户端连接">
                      <QuestionCircleOutlined />
                    </a-tooltip>
                  </a-space>
                );
              },
            }}
          >
            <a-input-number
              style={{ width: "100%" }}
              controls={false}
              vModel={[reqData.maxConnNum, "value"]}
              disabled={!EditorStage.value}
            />
          </a-form-item>
          <a-form-item label="标签缓存超时">
            <a-input-number
              vSlots={{
                addonAfter() {
                  return "ms";
                },
              }}
              disabled={!EditorStage.value}
              vModel={[reqData.outCacheTime, "value"]}
            />
          </a-form-item>

          <a-form-item label="最小会话超时">
            <a-input-number
              vSlots={{
                addonAfter() {
                  return "ms";
                },
              }}
              disabled={!EditorStage.value}
              vModel={[reqData.minOutSessionTime, "value"]}
            />
          </a-form-item>
          <a-form-item label="最大会话超时">
            <a-input-number
              vSlots={{
                addonAfter() {
                  return "ms";
                },
              }}
              disabled={!EditorStage.value}
              vModel={[reqData.maxOutSessionTime, "value"]}
            />
          </a-form-item>
        </a-form>
        <div style={{ paddingLeft: "5em" }}>
          <ExclamationCircleFilled style={{ color: "var(--primary-color)" }} />{" "}
          访问路径为 {reqData.opcuaUrl}
          <a-button
            type="link"
            onClick={() => {
              copy();
              message.success("复制成功");
            }}
          >
            复制
          </a-button>
          <a-button
            ghost
            type="primary"
            onClick={() => {
              testUrl(reqData.opcuaUrl);
            }}
          >
            测试连接
          </a-button>
        </div>

        <div class="foreignTitle userMage">服务配置</div>
        <a-form labelCol={{ style: { width: "8em" } }}>
          <a-form-item
            v-slots={{
              label: () => (
                <a-space size={4}>
                  重启服务
                  <a-tooltip title="添加用户信息及编辑用户标签权限，需要重启opcua server服务">
                    <QuestionCircleOutlined />
                  </a-tooltip>
                </a-space>
              ),
            }}
          >
            <a-button onClick={handleRestart}>重启</a-button>
          </a-form-item>
        </a-form>

        <div class="foreignTitle userMage">用户管理</div>
        <inl-layout-table
          vSlots={{
            opt() {
              return (
                <a-button
                  type="primary"
                  onClick={() => {
                    visible.value = true;
                  }}
                >
                  新增用户
                </a-button>
              );
            },
            content() {
              return (
                <a-table
                  loading={isLoading.value}
                  pagination={{
                    showQuickJumper: true,
                    showSizeChanger: true,
                    showTotal: (total: number) => `共 ${total} 条`,
                  }}
                  dataSource={dataSource.value}
                  columns={columns}
                ></a-table>
              );
            },
          }}
        />

        <a-modal
          v-model={[visible.value, "visible"]}
          width={800}
          title="新增用户"
          destroyOnClose
          onOk={() => {
            addUserData.value.form.validateFields().then(async (res) => {
              visible.value = false;
              await addUserData.value.save();
              message.success("添加成功");
              getUserList();
            });
          }}
        >
          <AddUser ref={addUserData} />
        </a-modal>
      </div>
    );
  },
});
