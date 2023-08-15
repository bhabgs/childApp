import { defineComponent, ref } from "vue";
import { useVModel, whenever } from "@vueuse/core";
import * as api from "@/api/appCenter/logicManager";
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

    const scopeList = ref([]);
    const getScopeList = async () => {
      const { data } = await api.getScopeList();
      scopeList.value = data;
    };
    whenever(isVisible, () => {
      getScopeList();
    });

    const handleConfirm = async () => {
      await formRef.value.validate();
      await api.insertLogic(form.value);
      message.success("新增成功");
      isVisible.value = false;
      emit("refresh");
    };

    const onClose = () => {
      formRef.value.resetFields();
      form.value = {};
    };

    return () => (
      <div class="add-modal">
        <a-modal
          title="新建逻辑"
          centered
          afterClose={onClose}
          v-model:visible={isVisible.value}
          onOk={handleConfirm}
        >
          <a-form
            ref={formRef}
            model={form.value}
            labelCol={{ style: { width: "8em" } }}
          >
            <a-form-item label="逻辑名称" name="name" required>
              <a-input
                placeholder="请输入"
                v-model:value={form.value.name}
              ></a-input>
            </a-form-item>
            <a-form-item label="逻辑分类" name="scope" required>
              <a-select
                placeholder="请选择"
                fieldNames={{ label: "name", value: "code" }}
                options={scopeList.value}
                v-model:value={form.value.scope}
              ></a-select>
            </a-form-item>
            <a-form-item label="逻辑code" name="code" required>
              <a-input
                placeholder="请输入"
                v-model:value={form.value.code}
              ></a-input>
            </a-form-item>
            <a-form-item label="版本号" name="version" required>
              <a-input
                placeholder="请输入"
                v-model:value={form.value.version}
              ></a-input>
            </a-form-item>
            <a-form-item label="更新人">
              <a-input disabled></a-input>
            </a-form-item>
            <a-form-item label="更新时间">
              <a-input disabled></a-input>
            </a-form-item>
            <a-form-item label="备注说明" name="description">
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

export default AddModal;
