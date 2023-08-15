import { defineComponent, reactive, ref } from "vue";
import api from "@/api/PRE";
import {} from "@ant-design/icons-vue";
import { Rule } from "ant-design-vue/lib/form";
import _ from "lodash";

// 验证字符串不大于16位,不包含中文，必须以英文开通
const validateUsername = (rule, value) => {
  if (!value) {
    return Promise.reject("请输入用户名");
  }
  if (value.length > 16) {
    return Promise.reject("用户名长度不能超过16位");
  }
  if (!/^[a-zA-Z][a-zA-Z0-9_]*$/.test(value)) {
    return Promise.reject("用户名必须以英文开头，只能包含英文、数字、下划线");
  }
  return Promise.resolve();
};

// 校验规则
export const createUserRolues: Record<string, Rule[]> = {
  clientUsername: [
    {
      required: true,
      message: "用户名错误",
      trigger: "change",
      validator: validateUsername,
    },
  ],
  clientPassword: [
    { required: true, message: "请输入密码", trigger: "change" },
  ],
  nameSpace: [{ required: true, message: "请输入命名空间", trigger: "change" }],
};

export default defineComponent({
  name: "opcua-adduser",
  setup(props, ctx) {
    // TODO: This is the data that will be sent to the server.
    // 加密方式字典
    const keyStyleDict = ref<Array<any>>([]);
    const reqData = reactive({
      clientUsername: "",
      clientPassword: "",
      endpointDescriptionCode: "",
      nameSpace: "",
      anonymousAble: false,
    });

    // 获取加密方式
    const getKeyStyle = async () => {
      const res = await api.getPolicyItems();

      if (res.data) {
        reqData.endpointDescriptionCode = res.data[0].code;
      }

      keyStyleDict.value = res.data;
    };
    getKeyStyle();

    const form = ref<any>(null);

    ctx.expose({
      reqData,
      async save() {
        const rd = _.cloneDeep(reqData);
        // create 用户
        await api.createOpcuaUser(rd);
      },
      form,
    });
    return () => (
      <div class="foreign-opcua-adduser">
        <a-form
          labelCol={{ style: { width: "8em" }, sm: { span: 8 } }}
          labelAlign="right"
          model={reqData}
          rules={createUserRolues}
          ref={form}
        >
          <a-row>
            <a-col span={12}>
              <a-form-item label="用户名" required name="clientUsername">
                <a-input vModel={[reqData.clientUsername, "value"]} />
              </a-form-item>
            </a-col>
            <a-col span={12}>
              <a-form-item label="密码" required name="clientPassword">
                <a-input vModel={[reqData.clientPassword, "value"]} />
              </a-form-item>
            </a-col>
            <a-col span={12}>
              <a-form-item label="加密方式">
                <a-select v-model={[reqData.endpointDescriptionCode, "value"]}>
                  {keyStyleDict.value.map((item) => (
                    <a-select-option value={item.code}>
                      {item.description}
                    </a-select-option>
                  ))}
                </a-select>
              </a-form-item>
            </a-col>
            {/* <a-col span={12}>
              <a-form-item label="命名空间" name="nameSpace" required>
                <a-input-number
                  style={{ width: "100%" }}
                  controls={false}
                  vModel={[reqData.nameSpace, "value"]}
                />
              </a-form-item>
            </a-col> */}
            <a-col span={12}>
              <a-form-item label="允许匿名登录">
                <a-switch v-model={[reqData.anonymousAble, "checked"]} />
              </a-form-item>
            </a-col>
          </a-row>
        </a-form>
      </div>
    );
  },
});
