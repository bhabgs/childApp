import { defineComponent, ref, watch } from "vue";
import { message } from "ant-design-vue";

import * as api from "@/api/workorderManage/workorderSkillGroup";

export default defineComponent({
  props: {
    showEdit: {
      type: Boolean,
      default: false,
    },
    isEdit: {
      type: Boolean,
      default: false,
    },
    currentGroup: {
      type: Object,
      default: () => ({}),
    },
  },

  emits: ["update:showEdit", "refreshGroup"],
  setup(props, context) {
    const formRef = ref();
    const formState = ref<any>({
      id: null,
      name: null,
    });

    watch(
      () => props.showEdit,
      async (nVal) => {
        if (nVal) {
          if (props.isEdit) {
            formState.value.id = props.currentGroup.id;
            formState.value.name = props.currentGroup.name;
          }
        }
      }
    );

    const ok = async () => {
      await formRef.value.validate();

      const resp = await api.groupSave(formState.value);

      if (resp.message === "OK") {
        message.success("保存成功");
      }

      cancelModal();
      context.emit("refreshGroup");
    };

    const cancelModal = () => {
      context.emit("update:showEdit", false);
      formState.value.id = null;
      formState.value.name = null;
    };

    return () => (
      <div class="EditWorkorderSkillGroup">
        <a-modal
          wrapClassName="EditWorkorderSkillGroupModal"
          centered
          width={700}
          title={(props.isEdit ? "编辑" : "新增") + "工单技能组"}
          v-model={[props.showEdit, "visible"]}
          onCancel={cancelModal}
          onOk={ok}
        >
          <a-form
            class="dataform"
            labelCol={{ style: { width: "9em" } }}
            wrapper-col={{ span: 16 }}
            model={formState.value}
            ref={formRef}
          >
            <a-form-item
              label="工单技能组名称"
              name="name"
              rules={[{ required: true, message: "请输入" }]}
            >
              <a-input v-model={[formState.value.name, "value"]} allowClear />
            </a-form-item>
          </a-form>
        </a-modal>
      </div>
    );
  },
});
