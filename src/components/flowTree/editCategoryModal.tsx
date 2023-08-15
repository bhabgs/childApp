import { computed, defineComponent, ref, watch } from "vue";
import { useVModel } from "@vueuse/core";
import { message } from "ant-design-vue";
import * as api from "@/api/processCenter/formdataManager";
/**
 * 修改类别
 */
const EditCategoryModal = defineComponent({
  emits: ["update:visible", "refreshTree"],
  props: {
    visible: {
      type: Boolean,
      default: false,
    },
    record: {
      type: Object,
    },
    isEdit: {
      type: Boolean,
      default: false,
    },
  },
  setup(props, { emit }) {
    const isVisible = useVModel(props, "visible", emit);
    watch(
      () => props.visible,
      (nval) => {
        if (nval) {
          if (props.isEdit) {
            form.value.name = props.record?.name;
          }
        }
      }
    );
    const formRef = ref();

    const form = ref({
      name: "",
    });

    const handleSave = async () => {
      await formRef.value?.validate();
      let param: any = {
        name: form.value.name,
      };
      if (props.isEdit) {
        param.id = props.record?.id;
      } else {
        param.parentId = props.record?.id;
      }

      const resp = await api.categorySave(param);
      if (resp.message === "OK") {
        message.success("保存成功");
        emit("refreshTree", false);
      }
      handleCancel();
    };

    const handleCancel = () => {
      emit("update:visible", false);
      form.value.name = "";
    };

    return () => (
      <div class="editCategory-modal">
        <a-modal
          title={props.isEdit ? "修改类别" : "添加类别"}
          centered
          v-model={[isVisible.value, "visible"]}
          onOk={handleSave}
          onCancel={handleCancel}
        >
          <a-form model={form.value} ref={formRef.value}>
            <a-form-item
              label="类别名称"
              name="name"
              required
              message="请输入类别名称"
            >
              <a-input
                placeholder="请输入"
                v-model={[form.value.name, "value"]}
              ></a-input>
            </a-form-item>
          </a-form>
        </a-modal>
      </div>
    );
  },
});

export default EditCategoryModal;
