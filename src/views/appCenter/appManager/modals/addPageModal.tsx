import { defineComponent, ref } from "vue";
import { useVModel, whenever } from "@vueuse/core";
import { clientTypeList } from "../config";
import _ from "lodash";

const clientTypeOption = clientTypeList.filter((item) => item.value);

/**
 * 添加页面弹窗
 */
const AddPageModal = defineComponent({
  emits: ["update:visible", "ok"],
  props: {
    visible: Boolean,
    defaultClient: String,
  },
  setup(props, { emit }) {
    const isVisible = useVModel(props, "visible", emit);

    const formRef = ref();
    const form = ref<any>({
      clientType: clientTypeOption[0].value,
    });

    whenever(isVisible, () => {
      form.value.clientType = props.defaultClient || clientTypeOption[0].value;
    });

    const handleConfirm = async () => {
      await formRef.value.validate();
      emit("ok", _.cloneDeep(form.value));
      isVisible.value = false;
    };

    const onClose = () => {
      formRef.value.resetFields();
    };

    return () => (
      <div class="add-page-modal">
        <a-modal
          title="新建页面"
          centered
          afterClose={onClose}
          v-model:visible={isVisible.value}
          onOk={handleConfirm}
        >
          <a-form
            ref={formRef}
            model={form.value}
            labelCol={{ style: { width: "6em" } }}
          >
            <a-form-item label="名称" required name="name">
              <a-input
                placeholder="请输入"
                v-model:value={form.value.name}
              ></a-input>
            </a-form-item>
            <a-form-item label="客户端" required name="clientType">
              <a-select
                placeholder="请选择"
                options={clientTypeOption}
                v-model:value={form.value.clientType}
              ></a-select>
            </a-form-item>
            <a-form-item label="详细描述" name="description">
              <a-textarea
                placeholder="请输入"
                rows={4}
                v-model:value={form.value.description}
              ></a-textarea>
            </a-form-item>
          </a-form>
        </a-modal>
      </div>
    );
  },
});

export default AddPageModal;
