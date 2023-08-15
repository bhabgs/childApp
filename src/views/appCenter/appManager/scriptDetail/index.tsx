import {
  computed,
  defineComponent,
  nextTick,
  onMounted,
  ref,
  watch,
} from "vue";
import { useRoute, useRouter } from "vue-router";
import { useEvent } from "inl-ui/dist/hooks";
import { encodeCode, decodeCode } from "@/utils/encode";
import CodeEditor from "@/components/codeEditor";
import * as api from "@/api/appCenter/appManager";
import { message } from "ant-design-vue";

export const asyncList = [
  { label: "异步", value: 0 },
  { label: "同步", value: 1 },
];

export const runList = [
  { label: "线程池运行", value: 0 },
  { label: "单线程运行", value: 1 },
];

/**
 * 应用脚本详情
 */
const ScriptDetail = defineComponent({
  emits: ["close"],
  props: {
    id: {
      type: String,
      required: true,
    },
  },
  setup(props, { emit }) {
    const router = useRouter();
    const route = useRoute();
    const appId = route.query.appId;
    const isEdit = ref(false);
    watch(
      () => route.query.isEdit,
      (val) => (isEdit.value = val === "true"),
      { immediate: true }
    );
    const isAdd = computed(() => props.id === "add");
    const refresh = useEvent("scriptDetailRefresh");

    const formRef = ref();
    const form = ref<any>({});

    const getForm = async () => {
      if (!isAdd.value) {
        const { data } = await api.getScriptById(props.id);
        form.value = data;
        if (form.value.timeout === -1) form.value.timeout = null;
        form.value.script = decodeCode(form.value.script);
        form.value.timeoutScript = decodeCode(form.value.timeoutScript);
      }
    };
    onMounted(getForm);

    const resultVisible = ref(false);
    const resultRef = ref();
    const errorInfo = ref<any>();
    const isDebugLoading = ref(false);
    const handleDebug = async () => {
      isDebugLoading.value = true;
      const timeout = form.value.timeout == undefined ? -1 : form.value.timeout;
      try {
        const { data } = await api.excuteScript({
          appId,
          script: encodeCode(form.value.script),
          timeout,
          timeoutScript: encodeCode(form.value.timeoutScript),
        });
        message.success("调试成功");
        resultVisible.value = false;
      } catch (e: any) {
        message.error("执行异常");
        resultVisible.value = true;
        errorInfo.value = e.data;
        nextTick(() => {
          resultRef.value?.scrollIntoView({ behavior: "smooth" });
        });
      } finally {
        isDebugLoading.value = false;
      }
    };
    const debugResultFooter = (
      <a-button type="primary" onClick={() => (resultVisible.value = false)}>
        确定
      </a-button>
    );

    const handleSave = async () => {
      await formRef.value.validate();
      const data = { ...form.value };
      if (data.timeout == undefined) data.timeout = -1;
      data.script = encodeCode(data.script);
      data.timeoutScript = encodeCode(data.timeoutScript);
      data.appId = appId;
      if (isAdd.value) {
        await api.insertAppScript(data);
      } else {
        await api.updateAppScript(data);
      }
      message.success("保存成功");
      refresh?.();
      handleCancel();
    };

    const handleCancel = () => {
      if (isAdd.value) {
        router.back();
        emit("close");
      } else {
        isEdit.value = false;
        getForm();
      }
    };

    const debugBtn = () => (
      <a-button
        style={{ marginBottom: "16px" }}
        loading={isDebugLoading.value}
        disabled={!form.value.script}
        onClick={handleDebug}
      >
        点击调试
      </a-button>
    );

    return () => (
      <div class="script-detail">
        <div
          class="operation"
          style={{ textAlign: "right", marginBottom: "16px" }}
        >
          {isEdit.value ? (
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
          )}
        </div>
        <a-form
          ref={formRef}
          model={form.value}
          labelCol={{ style: { width: "8em" } }}
        >
          <a-row>
            <a-col span={6}>
              <a-form-item label="脚本名称" required name="name">
                <a-input
                  style={{ width: "220px" }}
                  placeholder="请输入"
                  disabled={!isEdit.value}
                  v-model:value={form.value.name}
                ></a-input>
              </a-form-item>
            </a-col>
            <a-col span={6}>
              <a-form-item label="脚本ID" name="id">
                <a-input
                  style={{ width: "220px" }}
                  placeholder="系统自动生成"
                  disabled
                  v-model:value={form.value.id}
                ></a-input>
              </a-form-item>
            </a-col>
            <a-col span={6}>
              <a-form-item label="同异步执行" required name="syncExecute">
                <a-select
                  style={{ width: "220px" }}
                  placeholder="请选择"
                  options={asyncList}
                  disabled={!isEdit.value}
                  v-model:value={form.value.syncExecute}
                ></a-select>
              </a-form-item>
            </a-col>
            <a-col span={6}>
              <a-form-item label="运行方式" required name="exclusiveThread">
                <a-select
                  style={{ width: "220px" }}
                  placeholder="请选择"
                  options={runList}
                  disabled={!isEdit.value}
                  v-model:value={form.value.exclusiveThread}
                ></a-select>
              </a-form-item>
            </a-col>
            <a-col span={6}>
              <a-form-item label="超时时间" name="timeout">
                <a-input-number
                  style={{ width: "220px" }}
                  controls={false}
                  addonAfter="毫秒"
                  placeholder="默认不限制超时时间"
                  disabled={!isEdit.value}
                  v-model:value={form.value.timeout}
                ></a-input-number>
              </a-form-item>
            </a-col>
            <a-col span={12}>
              <a-form-item label="备注" name="description">
                <a-textarea
                  // style={{ width: "500px" }}
                  placeholder="请输入"
                  disabled={!isEdit.value}
                  v-model:value={form.value.description}
                ></a-textarea>
              </a-form-item>
            </a-col>
          </a-row>
          <a-tabs>
            <a-tab-pane tab="脚本详情" key="base">
              {debugBtn()}
              <a-form-item name="script" required>
                <CodeEditor
                  readonly={!isEdit.value}
                  v-model:value={form.value.script}
                />
              </a-form-item>
            </a-tab-pane>
            <a-tab-pane tab="超时脚本" key="timeout">
              {debugBtn()}
              <a-form-item name="timeoutScript">
                <CodeEditor
                  placeholder="填写超时时间后，超时处理脚本才会生效"
                  readonly={!isEdit.value}
                  language="groovy"
                  height={500}
                  v-model:value={form.value.timeoutScript}
                />
              </a-form-item>
            </a-tab-pane>
          </a-tabs>
        </a-form>

        {resultVisible.value && (
          <div
            ref={resultRef}
            class="error-container"
            style={{ maxHeight: "300px", overflow: "auto" }}
          >
            <div class="message">{errorInfo.value?.localizedMessage}</div>
            <ul>
              {(errorInfo.value?.stackTrace ?? []).map((item) => (
                <li style={{ color: "#f00", listStyle: "none" }}>
                  {item.className}:{item.lineNumber}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* <a-modal
          title="调试结果"
          footer={debugResultFooter}
          v-model:visible={resultVisible.value}
        >
          我是调试结果
        </a-modal> */}
      </div>
    );
  },
});

export default ScriptDetail;
