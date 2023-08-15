import { useVModel, whenever } from "@vueuse/core";
import { defineComponent, ref } from "vue";
import Form from "./form";
import * as api from "@/api/cardCenter/cardManager";
import { message } from "ant-design-vue";

const AddModal = defineComponent({
  emits: ["update:visible", "refresh"],
  props: {
    visible: Boolean,
  },
  setup(props, { emit }) {
    const isVisible = useVModel(props, "visible", emit);
    const formRef = ref();
    const form = ref<any>({});

    whenever(isVisible, () => {
      form.value.available = true;
      form.value.clientType = "pc";
    });

    const handleSave = async () => {
      await formRef.value.validate();
      const data = { ...form.value };
      data.title = data.name;
      data.available = Number(data.available);
      await api.updateSaveCard(data);
      message.success("保存成功");
      isVisible.value = false;
      emit("refresh");
    };

    const onClose = () => {
      formRef.value.clear();
      form.value = {};
    };

    return () => (
      <div class="add-modal">
        <a-modal
          title="新建卡片"
          centered
          afterClose={onClose}
          onOk={handleSave}
          v-model:visible={isVisible.value}
        >
          <Form ref={formRef} column={1} v-model:value={form.value} />
        </a-modal>
      </div>
    );
  },
});

export default AddModal;
