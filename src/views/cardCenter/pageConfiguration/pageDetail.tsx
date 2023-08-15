/**
 * 页面新增/修改/详情
 */
import {
  defineComponent,
  onMounted,
  PropType,
  ref,
  watch,
  reactive,
} from "vue";
import dayjs from "dayjs";
import { Item } from "../pageConfiguration";
import { getEnByZn } from "@/utils/format";

export interface selectedItem {
  name: string;
  code: any;
}
const props = {
  formData: {
    type: Object as PropType<Item>,
    required: true,
  },
  disabled: {
    type: Boolean,
    default: false,
  },
  terminalList: {
    type: Array as PropType<Array<selectedItem>>,
  },
  descriptionList: {
    type: Array as PropType<Array<selectedItem>>,
    default: [],
  },
};

const rules = {
  pageName: [{ required: true, message: "请输入页面名称", trigger: "blur" }],
  endpoint: [{ required: true, message: "请选择适用终端", trigger: "change" }],
};

export default defineComponent({
  name: "PageDetail",
  props,
  emits: ["close", "save"],
  setup(_props, _context) {
    const formRef = ref();
    const loading = ref(false);
    const lastModification = reactive({
      name: "",
      time: dayjs(),
    });
    // 表单数据
    const formState = ref<Item>({
      pageName: "",
      endpoint: "",
      enabled: true,
      reference: "",
      remark: "",
      tags: "",
      parameter: "",
    });

    // 提交
    const submit = () => {
      formRef.value.validateFields().then(async () => {
        loading.value = true;
        _context.emit("save", formState.value);
      });
    };

    watch(
      () => _props.formData,
      (e) => {
        if (e && e.id) {
          for (const key in e) {
            formState.value[key] = e[key];
          }
        }
      },
      {
        immediate: true,
        deep: true,
      }
    );
    onMounted(() => {
      formRef.value.resetFields();
      const userinfo = JSON.parse(sessionStorage.getItem("userinfo") || "");
      lastModification.name = userinfo.userName;
      if (!formState.value.id) {
        formState.value.updateUser = JSON.parse(
          sessionStorage.getItem("userinfo") || ""
        ).userName;
      }
    });
    return () => (
      <a-form
        ref={formRef}
        model={formState.value}
        labelCol={{ style: { width: "9em" } }}
        rules={rules}
      >
        <a-form-item label="页面名称" name="pageName" colon={false}>
          <a-input
            v-model={[formState.value.pageName, "value"]}
            placeholder="请输入页面名称"
            disabled={_props.disabled}
          />
        </a-form-item>
        <a-form-item label="适用终端" name="endpoint" colon={false}>
          <a-select
            v-model={[formState.value.endpoint, "value"]}
            placeholder="请选择适用终端"
            disabled={_props.disabled}
          >
            {_props.terminalList?.map((item) => (
              <a-select-option value={item.code}>{item.name}</a-select-option>
            ))}
          </a-select>
        </a-form-item>
        <a-form-item label="是否启用" colon={false}>
          <a-switch
            disabled={_props.disabled}
            v-model={[formState.value.enabled, "checked"]}
          ></a-switch>
        </a-form-item>
        {/* <a-form-item label="标签描述">
          <a-select
            v-model={[formState.value.tags, "value"]}
            placeholder="请选择标签描述"
            disabled={_props.disabled}
          >
            {_props.descriptionList?.map((item) => (
              <a-select-option value={item.code}>{item.name}</a-select-option>
            ))}
          </a-select>
        </a-form-item> */}
        <a-form-item label="最后修改人" colon={false}>
          <a-input v-model={[lastModification.name, "value"]} disabled />
        </a-form-item>
        <a-form-item label="最后修改时间" colon={false}>
          <a-date-picker
            v-model={[lastModification.time, "value"]}
            show-time
            disabled
            style={{ width: "100%" }}
          />
        </a-form-item>
        <a-form-item label="引用名称" colon={false}>
          <a-input
            v-model={[formState.value.reference, "value"]}
            disabled={_props.disabled}
            placeholder="请输入引用名称"
          />
        </a-form-item>
        <a-form-item label="页面参数" colon={false}>
          <a-textarea
            v-model={[formState.value.parameter, "value"]}
            disabled={_props.disabled}
            onChange={(e) => {
              formState.value.parameter = getEnByZn(e.target.value);
            }}
            rows={4}
          />
        </a-form-item>
        <a-form-item label="备注说明" colon={false}>
          <a-textarea
            placeholder="灰、水、硫、发热量，三种煤"
            v-model={[formState.value.remark, "value"]}
            disabled={_props.disabled}
            rows={4}
            maxlength={100}
          />
        </a-form-item>
        <a-form-item label colon={false}></a-form-item>
        {_props.disabled ? null : (
          <a-form-item
            label
            colon={false}
            style={{ textAlign: "right", marginBottom: "0" }}
          >
            <a-button
              style={{ marginRight: "20px" }}
              onClick={() => {
                _context.emit("close");
              }}
            >
              取消
            </a-button>
            <a-button type="primary" loading={loading.value} onClick={submit}>
              保存
            </a-button>
          </a-form-item>
        )}
      </a-form>
    );
  },
});
