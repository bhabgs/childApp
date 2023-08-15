import { defineComponent, ref } from "vue";
import { useVModel } from "@vueuse/core";
import { message } from "ant-design-vue";
import * as api from "@/api/appCenter/appManager";

const AddGroupModal = defineComponent({
  emits: ["update:visible", "refresh"],
  props: {
    visible: Boolean,
  },
  setup(props, { emit }) {
    const isVisible = useVModel(props, "visible", emit);
    const formRef = ref();
    const form = ref({ groupName: "" });

    const handleSave = async () => {
      await formRef.value.validate();
      await api.insertGroup(form.value);
      message.success("添加成功");
      isVisible.value = false;
      emit("refresh");
    };

    const onClose = () => {
      formRef.value.resetFields();
    };

    return () => (
      <div class="add-group-modal">
        <a-modal
          title="添加分组"
          afterClose={onClose}
          v-model:visible={isVisible.value}
          onOk={handleSave}
        >
          <a-form ref={formRef} model={form.value}>
            <a-form-item label="分组名称" name="groupName" required>
              <a-input
                placeholder="请输入"
                v-model:value={form.value.groupName}
              ></a-input>
            </a-form-item>
          </a-form>
        </a-modal>
      </div>
    );
  },
});

export default AddGroupModal;
