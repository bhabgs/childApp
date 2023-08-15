import { computed, defineComponent, ref } from "vue";
import { useVModel, whenever } from "@vueuse/core";
import _ from "lodash";
import { statusEnum } from "./config";
import api from "@/api/report";
import { message } from "ant-design-vue";

const UpdateModal = defineComponent({
  emits: ["update:visible", "refresh"],
  props: {
    visible: Boolean,
    record: Object,
  },
  setup(props, { emit }) {
    const isVisible = useVModel(props, "visible", emit);
    const isAdd = computed(() => _.isEmpty(props.record));

    const formRef = ref();
    const form = ref<any>({});
    whenever(isVisible, () => {
      if (!isAdd.value) {
        form.value = _.cloneDeep(props.record);
      }
    });

    const handleSave = async () => {
      await formRef.value.validate();
      await api.updateSaveReport(form.value);
      if (isAdd.value) {
        message.success("新增成功");
      } else {
        message.success("保存成功");
      }
      emit("refresh");
      isVisible.value = false;
    };

    const onClose = () => {
      formRef.value.resetFields();
      form.value = {};
    };

    return () => (
      <div class="update-modal">
        <a-modal
          title="报表"
          afterClose={onClose}
          v-model:visible={isVisible.value}
          onOk={handleSave}
        >
          <a-form
            ref={formRef}
            model={form.value}
            labelCol={{ style: { width: "8em" } }}
          >
            <a-form-item label="名称" name="name" required>
              <a-input
                style={{ width: "200px" }}
                placholder="请输入"
                v-model:value={form.value.name}
              ></a-input>
            </a-form-item>
            <a-form-item label="状态" name="status" required>
              <a-select
                style={{ width: "200px" }}
                placholder="请选择"
                options={statusEnum}
                v-model:value={form.value.status}
              ></a-select>
            </a-form-item>
          </a-form>
        </a-modal>
      </div>
    );
  },
});

export default UpdateModal;
