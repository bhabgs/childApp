import { defineComponent, onMounted, ref } from "vue";
import { useClipboard } from "@vueuse/core";
import {
  QuestionCircleOutlined,
  ExclamationCircleFilled,
} from "@ant-design/icons-vue";
import { message } from "ant-design-vue";
import * as api from "@/api/PRE/mqtt";

/**
 * 对外服务 - MQTT
 */
export default defineComponent({
  name: "mqtt",
  setup() {
    const isEdit = ref(false);
    const formRef = ref();
    const form = ref<any>({
      gatewayDescription: "",
      gatewayVersion: 2,
      mqttControlTopic: "",
      mqttEventTopic: "-1",
      mqttIp: "192.168.9.191",
      mqttPassword: "zg88982",
      mqttPort: "1883",
      mqttReportTopic: "-1",
      mqttResponseTopic: "",
      mqttUrl: "tcp://192.168.9.191:1883?user=kaifa&password=zg88982",
      mqttUser: "kaifa",
    });
    const { copy } = useClipboard({
      source: () => form.value.mqttUrl,
      legacy: true,
    });

    const getForm = async () => {
      const { data } = await api.getMqttConfig();
      form.value = data;
    };
    onMounted(getForm);

    const handleCopy = () => {
      copy();
      message.success("复制成功");
    };

    const handleTest = async () => {
      await api.checkLinkage();
      message.success("测试通过");
    };

    const handleSave = async () => {
      await formRef.value.validate();
      await api.saveMqttConfirm(form.value);
      message.success("保存成功");
      isEdit.value = false;
      getForm();
    };

    const handleCancel = () => {
      isEdit.value = false;
      getForm();
    };

    return () => (
      <div class="mqtt-config">
        <div class="operation" style={{ textAlign: "right" }}>
          {isEdit.value ? (
            <a-space>
              <a-button key="save" type="primary" onClick={handleSave}>
                保存
              </a-button>
              <a-button key="cancel" onClick={handleCancel}>
                取消
              </a-button>
            </a-space>
          ) : (
            <a-button
              key="edit"
              type="primary"
              onClick={() => (isEdit.value = true)}
            >
              编辑
            </a-button>
          )}
        </div>
        <a-form
          ref={formRef}
          model={form.value}
          labelCol={{ style: { width: "8em" } }}
        >
          <div class="block">
            <h3 class="foreignTitle title">基本配置</h3>
            <div class="content">
              <a-row>
                <a-col span={6}>
                  <a-form-item label="地址" name="mqttIp" required>
                    <a-input
                      style={{ width: "200px" }}
                      placeholder="请输入"
                      disabled={!isEdit.value}
                      v-model:value={form.value.mqttIp}
                    ></a-input>
                  </a-form-item>
                </a-col>
                <a-col span={6}>
                  <a-form-item label="端口" name="mqttPort" required>
                    <a-input-number
                      style={{ width: "200px" }}
                      placeholder="请输入"
                      controls={false}
                      min={0}
                      max={65535}
                      disabled={!isEdit.value}
                      v-model:value={form.value.mqttPort}
                    ></a-input-number>
                  </a-form-item>
                </a-col>
                <a-col span={6}>
                  <a-form-item label="用户名" name="mqttUser" required>
                    <a-input
                      style={{ width: "200px" }}
                      placeholder="请输入"
                      disabled={!isEdit.value}
                      v-model:value={form.value.mqttUser}
                    ></a-input>
                  </a-form-item>
                </a-col>
                <a-col span={6}>
                  <a-form-item label="密码" name="mqttPassword" required>
                    <a-input
                      style={{ width: "200px" }}
                      placeholder="请输入"
                      disabled={!isEdit.value}
                      v-model:value={form.value.mqttPassword}
                    ></a-input>
                  </a-form-item>
                </a-col>
              </a-row>
              <div class="link" style={{ paddingLeft: "5em" }}>
                <ExclamationCircleFilled
                  style={{ marginRight: "12px", color: "var(--primary-color)" }}
                />
                访问路径为
                <span style={{ marginLeft: "10px" }}>
                  tcp://mt_pre:mt_pre@192.168.10.21:1883
                </span>
                <a-button type="link" onClick={handleCopy}>
                  复制
                </a-button>
                <a-button ghost type="primary" onClick={handleTest}>
                  连接测试
                </a-button>
              </div>
            </div>
          </div>
          <div class="block">
            <h3 class="foreignTitle title">通道配置</h3>
            <div class="content">
              <a-row style={{ width: "50%" }}>
                <a-col span={12}>
                  <a-form-item
                    name="mqttReportTopic"
                    v-slots={{
                      label: () => (
                        <a-space size={4}>
                          数据上报
                          <a-tooltip title="标签的数据变化">
                            <QuestionCircleOutlined />
                          </a-tooltip>
                        </a-space>
                      ),
                    }}
                  >
                    <a-input
                      style={{ width: "200px" }}
                      placeholder="请输入"
                      disabled={!isEdit.value}
                      v-model:value={form.value.mqttReportTopic}
                    ></a-input>
                  </a-form-item>
                </a-col>
                <a-col span={12}>
                  <a-form-item
                    name="mqttEventTopic"
                    v-slots={{
                      label: () => (
                        <a-space size={4}>
                          事件上报
                          <a-tooltip title="断线、连接">
                            <QuestionCircleOutlined />
                          </a-tooltip>
                        </a-space>
                      ),
                    }}
                  >
                    <a-input
                      style={{ width: "200px" }}
                      placeholder="请输入"
                      disabled={!isEdit.value}
                      v-model:value={form.value.mqttEventTopic}
                    ></a-input>
                  </a-form-item>
                </a-col>
                <a-col span={12}>
                  <a-form-item
                    name="mqttControlTopic"
                    v-slots={{
                      label: () => (
                        <a-space size={4}>
                          下发控制
                          <a-tooltip title="写入数据、重启pdu、刷新等">
                            <QuestionCircleOutlined />
                          </a-tooltip>
                        </a-space>
                      ),
                    }}
                  >
                    <a-input
                      style={{ width: "200px" }}
                      placeholder="请输入"
                      disabled={!isEdit.value}
                      v-model:value={form.value.mqttControlTopic}
                    ></a-input>
                  </a-form-item>
                </a-col>
                <a-col span={12}>
                  <a-form-item
                    name="mqttResponseTopic"
                    v-slots={{
                      label: () => (
                        <a-space size={4}>
                          下发应答
                          <a-tooltip title="说明已经收到控制指令，并且执行完成">
                            <QuestionCircleOutlined />
                          </a-tooltip>
                        </a-space>
                      ),
                    }}
                  >
                    <a-input
                      style={{ width: "200px" }}
                      placeholder="请输入"
                      disabled={!isEdit.value}
                      v-model:value={form.value.mqttResponseTopic}
                    ></a-input>
                  </a-form-item>
                </a-col>
              </a-row>
            </div>
          </div>
          <div class="block">
            <h3 class="title">服务信息</h3>
            <div class="content">
              <a-col span={24}>
                <a-form-item style={{ marginBottom: "4px" }} label="版本">
                  {form.value.gatewayVersion}
                </a-form-item>
              </a-col>
              <a-col span={24}>
                <a-form-item label="描述">
                  {form.value.gatewayDescription}
                </a-form-item>
              </a-col>
            </div>
          </div>
        </a-form>
      </div>
    );
  },
});
