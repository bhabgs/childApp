import { defineComponent, ref } from "vue";
import { useSessionStorage, useVModel } from "@vueuse/core";
import * as api from "@/api/appCenter/appManager";
import { message } from "ant-design-vue";

/**
 * 添加应用
 */
const AddAppModal = defineComponent({
  emits: ["update:visible", "refresh"],
  props: {
    visible: Boolean,
  },
  setup(props, { emit }) {
    const isVisible = useVModel(props, "visible", emit);
    const userinfo = useSessionStorage<any>("userinfo", {});
    const formRef = ref();
    const form = ref<any>({});

    const handleConfirm = async () => {
      await formRef.value.validate();
      await api.insertApp(form.value);
      message.success("添加成功");
      isVisible.value = false;
      emit("refresh");
    };

    const onClose = () => {
      formRef.value.resetFields();
      form.value = {};
    };

    return () => (
      <div class="add-app-modal">
        <a-modal
          title="新建应用"
          centered
          afterClose={onClose}
          onOk={handleConfirm}
          v-model:visible={isVisible.value}
        >
          <a-form
            ref={formRef}
            model={form.value}
            labelCol={{ style: { width: "6em" } }}
          >
            <a-form-item label="应用名称" name="fullname" required>
              <a-input
                placeholder="请输入"
                v-model:value={form.value.fullname}
              ></a-input>
            </a-form-item>
            <a-form-item label="名称缩写" name="name" required>
              <a-input
                placeholder="请输入"
                v-model:value={form.value.name}
              ></a-input>
            </a-form-item>
            <a-form-item label="版本号" name="version" required>
              <a-input
                placeholder="请输入"
                v-model:value={form.value.version}
              ></a-input>
            </a-form-item>
            <a-form-item label="创建人">
              <a-input
                placeholder="请输入"
                disabled
                value={userinfo.value.employeeName || userinfo.value.userName}
              ></a-input>
            </a-form-item>
            <a-form-item label="发布时间">
              <a-input disabled></a-input>
            </a-form-item>
            <a-form-item label="发布状态">
              <a-input disabled></a-input>
            </a-form-item>
            <a-form-item label="详细描述" name="description">
              <a-textarea
                placeholder="请输入"
                rows={3}
                v-model:value={form.value.description}
              ></a-textarea>
            </a-form-item>
          </a-form>
        </a-modal>
      </div>
    );
  },
});

export default AddAppModal;
