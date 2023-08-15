import { defineComponent, watch, ref } from "vue";
import { message } from "ant-design-vue";

import * as bpmnDesignApi from "@/api/processCenter/bpmnDesign";
import * as api from "@/api/workorderManage/workorderCenter";

export default defineComponent({
  props: {
    showAdd: {
      type: Boolean,
      default: false,
    },
  },

  emits: ["update:showAdd", "refresh"],
  setup(props, context) {
    const formRef = ref();
    const formState = ref<any>({
      processDefinitionId: null,
    });

    const formListRef = ref();
    const deployObj = ref<any>();

    watch(
      () => props.showAdd,
      async (nVal) => {
        if (nVal) {
          getDesignList();
        }
      }
    );

    const designList = ref([]);
    const getDesignList = async () => {
      const resp = await bpmnDesignApi.findPageByCondition({
        argCategoryIdList: null,
        pageNum: 1,
        pageSize: 10000,
      });

      designList.value = resp.data.list;
    };

    const ok = async () => {
      const param = {
        processDefinitionId: deployObj.value.processDefinitionId,
        mtForms: {},
      };

      deployObj.value.defForm.defFormItemList.forEach((item) => {
        param.mtForms[`var_${item.itemId}`] = item.defStandardFormItem.value;
      });

      const resp = await api.startFlow(param);
      if (resp.message === "OK") {
        message.success("保存成功");
        context.emit("refresh");
      }

      cancelModal();
    };

    const cancelModal = () => {
      context.emit("update:showAdd", false);
      deployObj.value = null;
      formState.value.processDefinitionId = null;
    };

    const changeDesign = async () => {
      if (formState.value.processDefinitionId) {
        const resp: any = await bpmnDesignApi.findById(
          formState.value.processDefinitionId
        );
        deployObj.value = resp?.data;
      } else {
        deployObj.value = null;
      }
    };

    return () => (
      <div class="AddWorkorder">
        <a-modal
          wrapClassName="AddWorkorderModal"
          centered
          width={700}
          title="新增工单"
          v-model={[props.showAdd, "visible"]}
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
              label="工单分类"
              name="processDefinitionId"
              rules={[{ required: true, message: "请选择" }]}
            >
              <a-select
                v-model={[formState.value.processDefinitionId, "value"]}
                show-search
                dropdownMatchSelectWidth={false}
                allowClear
                placeholder="请选择"
                onChange={changeDesign}
              >
                {designList.value.map((option: any) => {
                  return (
                    <a-select-option value={option.processDefinitionId}>
                      {option.name}-
                      {option.flowVersion === -1
                        ? "无（草稿）"
                        : `V${option.flowVersion}`}
                    </a-select-option>
                  );
                })}
              </a-select>
            </a-form-item>
          </a-form>

          <a-form
            class="dataListform"
            labelCol={{ style: { width: "9em" } }}
            wrapper-col={{ span: 16 }}
            model={deployObj.value?.defForm?.defFormItemList}
            ref={formListRef}
          >
            {deployObj.value?.defForm?.defFormItemList.map((item, index) => (
              <a-form-item
                key={index}
                label={item.defStandardFormItem.name}
                name={index}
              >
                {item.defStandardFormItem.displayType === "input_box" && (
                  <a-input
                    v-model={[item.defStandardFormItem.value, "value"]}
                    placeholder="请输入"
                    allowClear
                  />
                )}

                {item.defStandardFormItem.displayType === "textarea" && (
                  <a-textarea
                    v-model={[item.defStandardFormItem.value, "value"]}
                    placeholder="请输入"
                    rows={4}
                  />
                )}
              </a-form-item>
            ))}
          </a-form>
        </a-modal>
      </div>
    );
  },
});
