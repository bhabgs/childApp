import { defineComponent, ref } from "vue";
import TagTable from "./tagTable";
import api from "@/api/PRE";
import { useRoute } from "vue-router";
import { createUserRolues } from "../addUser";
import { message } from "ant-design-vue";

const UserDetail = defineComponent({
  setup() {
    const isEdit = ref(false);
    const formRef = ref();
    const { params } = useRoute();
    const keyStyleDict = ref<Array<any>>([]);
    const form = ref<any>({
      anonymousAble: true,
      clientPassword: "testpass",
      clientUsername: "testuser1",
      endpointDescription: "",
      id: 2,
      nameSpace: 2,
      opcuaUrl: "opc.tcp://192.168.5.82:62541/testuser1",
    });

    // 查询用户信息
    const getForm = async () => {
      const res = await api.getOpcuaUser(params.id);
      form.value = res.data;
    };

    // 获取加密方式
    const getKeyStyle = async () => {
      const res = await api.getPolicyItems();
      keyStyleDict.value = res.data;
    };

    const handleSave = async () => {
      await formRef.value.validate();
      message.success("保存成功");
      handleCancel();
    };

    const handleCancel = () => {
      isEdit.value = false;
      api.createOpcuaUser(form.value);
      getForm();
    };
    getKeyStyle();
    getForm();
    return () => (
      <div class="user-detail">
        <div class="operation" style={{ textAlign: "right" }}>
          {isEdit.value ? (
            <a-space>
              <a-button key="save" type="primary" onClick={handleSave}>
                保存
              </a-button>
              <a-button
                key="cancel"
                onClick={() => {
                  isEdit.value = false;
                }}
              >
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
        <h3 class="block-title foreignTitle">用户信息</h3>
        <a-form
          ref={formRef}
          model={form.value}
          rolues={createUserRolues}
          labelCol={{ style: { width: "9em" } }}
        >
          <a-row>
            <a-col span={6}>
              <a-form-item label="用户名" name="clientUsername" required>
                <a-input
                  style={{ width: "200px" }}
                  placeholder="请输入"
                  disabled={!isEdit.value}
                  v-model:value={form.value.clientUsername}
                ></a-input>
              </a-form-item>
            </a-col>
            <a-col span={6}>
              <a-form-item label="密码" name="clientPassword" required>
                <a-input-password
                  style={{ width: "200px" }}
                  placeholder="请输入"
                  v-model:value={form.value.clientPassword}
                  disabled={!isEdit.value}
                ></a-input-password>
              </a-form-item>
            </a-col>
            <a-col span={6}>
              <a-form-item label="加密方式">
                <a-select
                  style={{ width: "200px" }}
                  placeholder="请选择"
                  disabled={!isEdit.value}
                  v-model:value={form.value.endpointDescriptionCode}
                >
                  {keyStyleDict.value.map((item) => (
                    <a-select-option value={item.code}>
                      {item.description}
                    </a-select-option>
                  ))}
                </a-select>
              </a-form-item>
            </a-col>
            <a-col span={6}>
              <a-form-item label="命名空间" name="nameSpace">
                <a-input-number
                  style={{ width: "200px" }}
                  placeholder="请输入"
                  disabled
                  v-model:value={form.value.nameSpace}
                ></a-input-number>
              </a-form-item>
            </a-col>
            <a-col span={6}>
              <a-form-item label="允许匿名登录" name="anonymousAble">
                <a-switch
                  disabled={!isEdit.value}
                  v-model:checked={form.value.anonymousAble}
                ></a-switch>
              </a-form-item>
            </a-col>
          </a-row>
        </a-form>
        <h3 class="clock-title foreignTitle">可访问标签</h3>
        <TagTable />
      </div>
    );
  },
});

export default UserDetail;
