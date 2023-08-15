import {
  computed,
  defineComponent,
  onMounted,
  reactive,
  ref,
  watch,
} from "vue";
import { useRoute, useRouter } from "vue-router";
import { useEvent } from "inl-ui/dist/hooks";
import { decodeCode, encodeCode } from "@/utils/encode";
import CodeWithResult from "./codeWithResult";
import * as api from "@/api/appCenter/logicManager";
import { excuteScript } from "@/api/appCenter/appManager";
import { message } from "ant-design-vue";

export const executeList = [
  { label: "异步执行", value: 0 },
  { label: "同步执行", value: 1 },
];

export const threadList = [
  { label: "单线程", value: 1 },
  { label: "线程池", value: 0 },
];

/**
 * 逻辑管理详情
 */
const LogicDetail = defineComponent({
  props: {
    id: {
      type: String,
      required: true,
    },
  },
  setup(props, { emit }) {
    const router = useRouter();
    const route = useRoute();
    const isEdit = ref(false);
    watch(
      () => route.query.isEdit,
      (val) => (isEdit.value = val === "true"),
      { immediate: true }
    );
    const isAdd = computed(() => props.id === "add");
    const hideAction = !!route.query.noAction;
    const refresh = useEvent("logicManagerRefresh");

    const formRef = ref();
    const form = ref<any>({});
    const activeTab = ref("basic");
    const runDisabled = computed(
      () => !["script", "timeoutScript"].includes(activeTab.value)
    );

    const getForm = async () => {
      if (!isAdd.value) {
        const { data } = await api.getLogicDetailById(props.id);
        form.value = data;
        if (form.value.timeout === -1) {
          form.value.timeout = null;
        }
        form.value.script = decodeCode(form.value.script || "");
        form.value.timeoutScript = decodeCode(form.value.timeoutScript || "");
      }
    };
    onMounted(getForm);

    const scopeList = ref([]);
    const getScopeList = async () => {
      const { data } = await api.getScopeList();
      scopeList.value = data;
    };
    onMounted(getScopeList);

    // 运行
    const executeResult = reactive<any>({
      script: {},
      timeoutScript: {},
    });
    const handleRun = async () => {
      if (runDisabled.value) return;
      const scriptText = form.value[activeTab.value];
      const encoded = encodeCode(scriptText);
      executeResult[activeTab.value] = {};
      try {
        await excuteScript({
          script: encoded,
          timeout: -1,
          timeoutScript: null,
          appId: null,
        });
        executeResult[activeTab.value].success = true;
      } catch (e: any) {
        executeResult[activeTab.value].success = false;
        executeResult[activeTab.value].result = e.data;
      }
    };

    const handleSave = async () => {
      try {
        await formRef.value.validate();
        if (!form.value.script) {
          throw new Error();
        }
      } catch (e) {
        message.error("表单填写有误，请检查");
        return;
      }
      const data = Object.assign({}, form.value);
      data.script = encodeCode(data.script);
      data.timeoutScript = encodeCode(data.timeoutScript);
      if (data.timeout == null) {
        data.timeout = -1;
      }
      if (isAdd.value) {
        await api.insertLogic(data);
      } else {
        await api.updateLogic(data);
      }
      message.success("保存成功");
      refresh();
      handleCancel();
    };

    const handleCancel = () => {
      if (isAdd.value) {
        router.push({ name: "logicManager" });
        emit("close");
      } else {
        formRef.value.resetFields();
        isEdit.value = false;
        getForm();
      }
    };

    return () => {
      const editBtns = isEdit.value ? (
        <a-space>
          <a-button type="primary" onClick={handleSave}>
            保存
          </a-button>
          <a-button onClick={handleCancel}>取消</a-button>
        </a-space>
      ) : (
        <a-button type="primary" onClick={() => (isEdit.value = true)}>
          编辑
        </a-button>
      );
      const disabled = !isEdit.value;

      return (
        <div class="logic-detail">
          <a-form
            ref={formRef}
            model={form.value}
            labelCol={{ style: { width: "9em" } }}
          >
            <a-tabs
              v-model:activeKey={activeTab.value}
              v-slots={{
                rightExtra: () =>
                  !hideAction && (
                    <a-space>
                      {editBtns}
                      <a-button
                        type="primary"
                        disabled={runDisabled.value}
                        onClick={handleRun}
                      >
                        运行
                      </a-button>
                    </a-space>
                  ),
              }}
            >
              <a-tab-pane key="basic" tab="基本信息" forceRender></a-tab-pane>
              <a-tab-pane key="script" forceRender tab="代码详情"></a-tab-pane>
              <a-tab-pane
                key="timeoutScript"
                forceRender
                tab="超时代码"
              ></a-tab-pane>
            </a-tabs>
            <a-row class={["tab-pane", { hide: activeTab.value !== "basic" }]}>
              <a-col span={6}>
                <a-form-item label="代码片段名称" required name="name">
                  <a-input
                    style={{ width: "200px" }}
                    placeholder="请输入"
                    disabled={disabled}
                    v-model:value={form.value.name}
                  ></a-input>
                </a-form-item>
              </a-col>
              <a-col span={6}>
                <a-form-item label="逻辑分类" required name="scope">
                  <a-select
                    style={{ width: "200px" }}
                    placeholder="请选择"
                    fieldNames={{ label: "name", value: "code" }}
                    options={scopeList.value}
                    disabled={disabled}
                    v-model:value={form.value.scope}
                  ></a-select>
                </a-form-item>
              </a-col>
              <a-col span={6}>
                <a-form-item label="代码code" required name="code">
                  <a-input
                    style={{ width: "200px" }}
                    placeholder="请输入"
                    disabled={disabled}
                    v-model:value={form.value.code}
                  ></a-input>
                </a-form-item>
              </a-col>
              <a-col span={6}>
                <a-form-item label="执行方式" required name="syncExecute">
                  <a-select
                    style={{ width: "200px" }}
                    placeholder="请选择"
                    disabled={disabled}
                    options={executeList}
                    v-model:value={form.value.syncExecute}
                  ></a-select>
                </a-form-item>
              </a-col>
              <a-col span={6}>
                <a-form-item label="运行方式" required name="exclusiveThread">
                  <a-select
                    style={{ width: "200px" }}
                    placeholder="请选择"
                    disabled={disabled}
                    options={threadList}
                    v-model:value={form.value.exclusiveThread}
                  ></a-select>
                </a-form-item>
              </a-col>
              <a-col span={6}>
                <a-form-item label="超时时间(ms)" name="timeout">
                  <a-input-number
                    style={{ width: "200px" }}
                    controls={false}
                    min={0}
                    precision={0}
                    placeholder="请输入"
                    disabled={disabled}
                    v-model:value={form.value.timeout}
                  ></a-input-number>
                </a-form-item>
              </a-col>
              <a-col span={6}>
                <a-form-item label="详细描述" name="description">
                  <a-input
                    style={{ width: "200px" }}
                    placeholder="十个字以内"
                    disabled={disabled}
                    v-model:value={form.value.description}
                  ></a-input>
                </a-form-item>
              </a-col>
              {/* <a-col span={6}>
                    <a-form-item label="创建人">
                      <a-input
                        style={{ width: "200px" }}
                        placeholder="请输入"
                        disabled
                        value={form.value.createUser}
                      ></a-input>
                    </a-form-item>
                  </a-col> */}
              <a-col span={6}>
                <a-form-item label="更新时间">
                  <a-input
                    style={{ width: "200px" }}
                    placeholder="请输入"
                    disabled
                    value={form.value.updateDate}
                  ></a-input>
                </a-form-item>
              </a-col>
            </a-row>
            <a-form-item
              class={["tab-pane", { hide: activeTab.value !== "script" }]}
              name="script"
              rules={{ required: true, message: "请填写脚本" }}
            >
              <CodeWithResult
                v-model:value={form.value.script}
                result={executeResult.script}
                disabled={disabled}
              />
            </a-form-item>
            <a-form-item
              class={[
                "tab-pane",
                { hide: activeTab.value !== "timeoutScript" },
              ]}
              name="timeoutScript"
            >
              <CodeWithResult
                v-model:value={form.value.timeoutScript}
                result={executeResult.timeoutScript}
                disabled={disabled}
              />
            </a-form-item>
          </a-form>
        </div>
      );
    };
  },
});

export default LogicDetail;
