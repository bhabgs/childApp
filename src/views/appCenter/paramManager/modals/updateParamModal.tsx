import { VNode, computed, defineComponent, ref } from "vue";
import { useVModel, whenever } from "@vueuse/core";
import _ from "lodash";
import { QuestionCircleOutlined } from "@ant-design/icons-vue";
import * as api from "@/api/appCenter/paramManager";
import { message } from "ant-design-vue";

export const typeList = [
  {
    label: "文本text",
    value: "text",
  },
  {
    label: "整数",
    value: "int",
  },
  {
    label: "浮点数",
    value: "float",
  },
  {
    label: "开关switch",
    value: "boolean",
  },
  {
    label: "单选下拉框select-single",
    value: "select-single",
  },
  {
    label: "多选下拉框select-multi",
    value: "select-multi",
  },
  {
    label: "阈值compare",
    value: "compare",
  },
];

export const statusList = [
  { label: "启用", value: 1 },
  { label: "禁用", value: 0 },
];

export const whetherList = [
  { label: "是", value: 1 },
  { label: "否", value: 0 },
];

export const sourceList = [
  { label: "sql", value: "sql" },
  { label: "restful", value: "restful" },
  { label: "json", value: "json" },
];

/**
 * 更新参数
 */
const UpdateParamModal = defineComponent({
  emits: ["update:visible", "refresh"],
  props: {
    visible: Boolean,
    isPreview: Boolean,
    record: Object,
    group: Object,
  },
  setup(props, { emit }) {
    const isVisible = useVModel(props, "visible", emit);
    const isAdd = computed(() => _.isEmpty(props.record));

    const formRef = ref();
    const form = ref<any>({});

    const singleSelect = ref([]);

    whenever(isVisible, async () => {
      if (!isAdd.value) {
        form.value = _.cloneDeep(props.record);
      }
      const { data } = await api.getParamListByGroupIdAndType({
        groupId: props.group!.id,
        type: "select-single",
      });
      singleSelect.value = data.map((item) => ({
        label: item.name,
        value: item.id,
      }));
    });

    const selectHelp = computed(() => {
      const source = form.value.listDataType;
      if (source === "json") {
        return '{"1": "是", "0": "否"}';
      }
      if (source === "sql") {
        return "select value as select_valur,code as select_key from mtip_app_param_dict";
      }
      if (source === "restful") {
        return "请输入链接地址";
      }
    });

    const handleSave = async () => {
      await formRef.value.validate();
      const data = { ...form.value };
      if (isAdd.value) {
        data.groupId = props.group!.id;
        await api.insetParamDef(data);
      } else {
        await api.updateParamDef(data);
      }
      message.success("保存成功");
      emit("refresh");
      isVisible.value = false;
    };

    const onClose = () => {
      formRef.value.resetFields();
      form.value = {};
    };

    return () => {
      const disabled = props.isPreview;

      const textForm = (
        <>
          <a-col span={12}>
            <a-form-item label="限制长度" required name="limitLength">
              <a-input-number
                style={{ width: "200px" }}
                placeholder="请输入"
                addonAfter="字符"
                controls={false}
                disabled={props.isPreview}
                v-model:value={form.value.limitLength}
              ></a-input-number>
            </a-form-item>
          </a-col>
          <a-col span={12}>
            <a-form-item label="默认值" name="defaultValue">
              <a-input
                style={{ width: "200px" }}
                placeholder="请输入"
                disabled={props.isPreview}
                v-model:value={form.value.defaultValue}
              ></a-input>
            </a-form-item>
          </a-col>
          <a-col span={12}>
            <a-form-item
              label="正则表达式"
              name="regularExpression"
              rules={{ type: "regexp", message: "请输入正确的正则表达式" }}
            >
              <a-input
                style={{ width: "200px" }}
                placeholder="请输入"
                disabled={props.isPreview}
                v-model:value={form.value.regularExpression}
              ></a-input>
            </a-form-item>
          </a-col>
        </>
      );
      const numberForm = (
        <>
          <a-col span={12}>
            <a-form-item label="单位" name="unit">
              <a-input
                style={{ width: "200px" }}
                placeholder="请输入"
                disabled={disabled}
                v-model:value={form.value.unit}
              ></a-input>
            </a-form-item>
          </a-col>
          <a-col span={12}>
            <a-form-item label="默认值" name="defaultValue">
              <a-input-number
                style={{ width: "200px" }}
                placeholder="请输入"
                controls={false}
                disabled={disabled}
                v-model:value={form.value.defaultValue}
              ></a-input-number>
            </a-form-item>
          </a-col>
          <a-col span={12}>
            <a-form-item label="最小值" name="minValue">
              <a-input-number
                style={{ width: "200px" }}
                placeholder="请输入"
                controls={false}
                disabled={disabled}
                v-model:value={form.value.minValue}
              ></a-input-number>
            </a-form-item>
          </a-col>
          <a-col span={12}>
            <a-form-item label="最大值" name="maxValue">
              <a-input-number
                style={{ width: "200px" }}
                placeholder="请输入"
                controls={false}
                disabled={disabled}
                v-model:value={form.value.maxValue}
              ></a-input-number>
            </a-form-item>
          </a-col>
          {form.value.type === "float" && (
            <a-col span={12}>
              <a-form-item label="保留小数位" name="decimalNum">
                <a-input-number
                  style={{ width: "200px" }}
                  placeholder="请输入整数"
                  controls={false}
                  precision={0}
                  disabled={disabled}
                  v-model:value={form.value.decimalNum}
                ></a-input-number>
              </a-form-item>
            </a-col>
          )}
        </>
      );
      const switchForm = (
        <a-col span={12}>
          <a-form-item label="默认值" name="defaultValue">
            <a-select
              style={{ width: "200px" }}
              placeholder="请选择"
              disabled={disabled}
              v-model:value={form.value.defaultValue}
            >
              <a-select-option value={1}>开</a-select-option>
              <a-select-option value={0}>关</a-select-option>
            </a-select>
          </a-form-item>
        </a-col>
      );
      const selectForm = (
        <>
          <a-col span={12}>
            <a-form-item label="选项来源" name="listDataType">
              <a-select
                style={{ width: "200px" }}
                placeholder="请选择"
                disabled={disabled}
                options={sourceList}
                v-model:value={form.value.listDataType}
              ></a-select>
            </a-form-item>
          </a-col>
          <a-col span={6}>
            <a-form-item label="选项值" name="listDataValue">
              <a-space>
                <a-input
                  style={{ width: "200px" }}
                  placeholder="请输入"
                  disabled={disabled}
                  v-model:value={form.value.listDataValue}
                ></a-input>
                <a-tooltip title={selectHelp.value}>
                  <QuestionCircleOutlined />
                </a-tooltip>
              </a-space>
            </a-form-item>
          </a-col>
        </>
      );
      const compareForm = (
        <>
          <a-col span={12}>
            <a-form-item label="组合参数">
              <a-select
                style={{ width: "200px" }}
                placeholder="请选择"
                disabled={disabled}
                options={singleSelect.value}
                v-model:value={form.value.compareId}
              ></a-select>
            </a-form-item>
          </a-col>
          <a-col span={12}>
            <a-form-item label="默认值" name="defaultValue">
              <a-input
                style={{ width: "200px" }}
                placeholder="请输入"
                disabled={disabled}
                v-model:value={form.value.defaultValue}
              ></a-input>
            </a-form-item>
          </a-col>
        </>
      );

      let typeForm: VNode | null = null;
      const { type } = form.value;
      if (type === "text") typeForm = textForm;
      else if (type === "int" || type === "float") typeForm = numberForm;
      else if (type === "boolean") typeForm = switchForm;
      else if (type === "select-single" || type === "select-multi")
        typeForm = selectForm;
      else if (type === "compare") typeForm = compareForm;

      return (
        <div class="update-param-modal">
          <a-modal
            title="参数管理"
            width={750}
            centered
            footer={props.isPreview ? null : undefined}
            afterClose={onClose}
            v-model:visible={isVisible.value}
            onOk={handleSave}
          >
            <a-form
              ref={formRef}
              model={form.value}
              labelCol={{ style: { width: "6em" } }}
            >
              <a-row>
                <a-col span={12}>
                  <a-form-item label="名称" required name="name">
                    <a-input
                      style={{ width: "200px" }}
                      placeholder="请输入"
                      disabled={disabled}
                      v-model:value={form.value.name}
                    ></a-input>
                  </a-form-item>
                </a-col>
                <a-col span={12}>
                  <a-form-item label="参数组">
                    <a-input
                      style={{ width: "200px" }}
                      disabled
                      value={props.group?.name}
                    ></a-input>
                  </a-form-item>
                </a-col>
                <a-col span={12}>
                  <a-form-item
                    label="编码"
                    name="code"
                    rules={{
                      regex: /^[a-zA-Z0-9_]+$/,
                      message: "请输入正确的编码",
                    }}
                  >
                    <a-input
                      style={{ width: "200px" }}
                      placeholder="支持数字、字母和下划线"
                      disabled={disabled}
                      v-model:value={form.value.code}
                    ></a-input>
                  </a-form-item>
                </a-col>
                <a-col span={12}>
                  <a-form-item label="状态" required name="valid">
                    <a-select
                      style={{ width: "200px" }}
                      placeholder="请选择"
                      disabled={disabled}
                      options={statusList}
                      v-model:value={form.value.valid}
                    ></a-select>
                  </a-form-item>
                </a-col>
                <a-col span={12}>
                  <a-form-item label="是否可写" required name="writeable">
                    <a-select
                      style={{ width: "200px" }}
                      placeholder="请选择"
                      disabled={disabled}
                      options={whetherList}
                      v-model:value={form.value.writeable}
                    ></a-select>
                  </a-form-item>
                </a-col>
                <a-col span={12}>
                  <a-form-item label="是否必填" required name="required">
                    <a-select
                      style={{ width: "200px" }}
                      placeholder="请选择"
                      disabled={disabled}
                      options={whetherList}
                      v-model:value={form.value.required}
                    ></a-select>
                  </a-form-item>
                </a-col>
                <a-col span={12}>
                  <a-form-item label="是否显示" required name="showed">
                    <a-select
                      style={{ width: "200px" }}
                      placeholder="请选择"
                      disabled={disabled}
                      options={whetherList}
                      v-model:value={form.value.showed}
                    ></a-select>
                  </a-form-item>
                </a-col>
                <a-col span={12}>
                  <a-form-item label="类型" required name="type">
                    <a-select
                      style={{ width: "200px" }}
                      placeholder="请选择"
                      disabled={disabled}
                      options={typeList}
                      v-model:value={form.value.type}
                    ></a-select>
                  </a-form-item>
                </a-col>
                {typeForm}
                <a-col span={12}>
                  <a-form-item label="备注" name="remark">
                    <a-input
                      style={{ width: "200px" }}
                      placeholder="请输入"
                      disabled={disabled}
                      v-model:value={form.value.remark}
                    ></a-input>
                  </a-form-item>
                </a-col>
              </a-row>
            </a-form>
          </a-modal>
        </div>
      );
    };
  },
});

export default UpdateParamModal;
