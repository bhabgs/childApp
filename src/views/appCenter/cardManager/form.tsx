import { PropType, defineComponent, onMounted, ref } from "vue";
import { useSessionStorage, useVModel } from "@vueuse/core";
import * as api from "@/api/cardCenter/cardManager";

export const terminalList = [
  { label: "PC端", value: "pc" },
  { label: "PAD端", value: "pad" },
  { label: "手机端", value: "phone" },
];

export const availiableList = [
  { label: "启用", value: 1 },
  { label: "未启用", value: 0 },
];

const Form = defineComponent({
  props: {
    value: Object as PropType<any>,
    column: {
      type: Number,
      default: 1,
    },
    disabled: {
      type: Boolean,
      default: false,
    },
  },
  setup(props, { emit, expose }) {
    const formModel = useVModel(props, "value", emit);
    const formRef = ref();
    const userinfo = useSessionStorage<any>("userinfo", {});

    // 角色列表
    const roleList = ref([]);
    const getRoleList = async () => {
      const { data } = await api.getRoleSelect();
      roleList.value = data.map((item) => ({
        value: item.roleId,
        label: item.roleName,
      }));
    };
    onMounted(getRoleList);

    const validate = async () => {
      return formRef.value.validate();
    };

    const clear = async () => {
      return formRef.value.resetFields();
    };

    expose({
      validate,
      clear,
    });

    return () => {
      const span = 24 / props.column;
      const itemStyle = {};

      return (
        <a-form
          class="form"
          ref={formRef}
          model={formModel.value}
          labelCol={{ style: { width: "7em" } }}
          wrapperCol={{ span: 14 }}
        >
          <a-row>
            <a-col span={span}>
              <a-form-item label="卡片名称" name="name" required>
                <a-input
                  style={itemStyle}
                  placeholder="请输入"
                  disabled={props.disabled}
                  v-model:value={formModel.value.name}
                ></a-input>
              </a-form-item>
            </a-col>
            <a-col span={span}>
              <a-form-item label="横纵尺寸(px)" name="width">
                <a-space>
                  <a-input-number
                    style={{ width: "89px" }}
                    placeholder="请输入"
                    controls={false}
                    precision={0}
                    min={0}
                    disabled={props.disabled}
                    v-model:value={formModel.value.width}
                  ></a-input-number>
                  <span>*</span>
                  <a-form-item-rest>
                    <a-input-number
                      style={{ width: "89px" }}
                      placeholder="请输入"
                      controls={false}
                      precision={0}
                      min={0}
                      disabled={props.disabled}
                      v-model:value={formModel.value.height}
                    ></a-input-number>
                  </a-form-item-rest>
                </a-space>
              </a-form-item>
            </a-col>
            <a-col span={span}>
              <a-form-item label="适用终端" name="clientType">
                <a-select
                  style={itemStyle}
                  placeholder="请选择"
                  disabled={props.disabled}
                  options={terminalList}
                  v-model:value={formModel.value.clientType}
                ></a-select>
              </a-form-item>
            </a-col>
            <a-col span={span}>
              <a-form-item label="卡片编码" name="code" required>
                <a-input
                  style={itemStyle}
                  placeholder="请输入"
                  disabled={props.disabled}
                  v-model:value={formModel.value.code}
                ></a-input>
              </a-form-item>
            </a-col>
            <a-col span={span}>
              <a-form-item label="卡片描述" name="description">
                <a-input
                  style={itemStyle}
                  placeholder="请输入"
                  disabled={props.disabled}
                  v-model:value={formModel.value.description}
                ></a-input>
              </a-form-item>
            </a-col>
            <a-col span={span}>
              <a-form-item label="卡片权限" name="roleId">
                <a-select
                  style={itemStyle}
                  placeholder="请选择"
                  disabled={props.disabled}
                  options={roleList.value}
                  v-model:value={formModel.value.roleId}
                ></a-select>
              </a-form-item>
            </a-col>
            <a-col span={span}>
              <a-form-item label="是否启用" name="available">
                <a-switch
                  disabled={props.disabled}
                  v-model:checked={formModel.value.available}
                ></a-switch>
              </a-form-item>
            </a-col>
            <a-col span={span}>
              <a-form-item label="开发者" name="createUser">
                <a-input
                  style={itemStyle}
                  disabled
                  value={
                    formModel.value.createUser ||
                    userinfo.value.employeeName ||
                    userinfo.value.userName
                  }
                ></a-input>
              </a-form-item>
            </a-col>
            <a-col span={span * 2 > 24 ? span : span * 2}>
              <a-form-item label="备注说明" name="remark">
                <a-textarea
                  style={itemStyle}
                  placeholder="请输入"
                  rows={3}
                  disabled={props.disabled}
                  v-model:value={formModel.value.remark}
                ></a-textarea>
              </a-form-item>
            </a-col>
          </a-row>
        </a-form>
      );
    };
  },
});

export default Form;
