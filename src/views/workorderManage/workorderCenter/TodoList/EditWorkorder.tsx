import { defineComponent, ref, watch } from "vue";
import { message } from "ant-design-vue";

import * as api from "@/api/workorderManage/workorderCenter";

const btnProperty = {
  pass: "通过",
  rebut: "驳回",
  reject: "拒绝",
  assign: "转派",
  cc: "抄送",
};

const applicability = {
  0: "隐藏",
  1: "只读",
  2: "可编辑",
};

const terminalType = {
  0: "PC端",
  1: "手机端",
};

export default defineComponent({
  props: {
    showEdit: {
      type: Boolean,
      default: false,
    },
    currentRow: {
      type: Object,
      default: () => ({}),
    },
  },

  emits: ["update:showEdit", "refresh"],
  setup(props, context) {
    const formRef = ref();
    const deployObj = ref<any>();

    const btnList = ref<any>([]);
    const formList = ref<any>([]);

    watch(
      () => props.showEdit,
      async (nVal) => {
        if (nVal) {
          if (props.currentRow) {
            const resp = await api.filterTaskById(
              props.currentRow.processDefinitionId,
              props.currentRow.taskDefinitionKey
            );

            deployObj.value = resp?.data;
            // console.info("deployObj", deployObj.value);

            btnList.value = (
              Object.values(deployObj.value?.defFlowTaskMap)[0] as any
            )?.defFlowTaskButtonItemConfigList.reverse();

            formList.value = (
              Object.values(deployObj.value?.defFlowTaskMap)[0] as any
            )?.defFlowTaskFormItemConfigList
              .filter(
                (form) => form.terminalType === 0 // pc端
              )
              .map((item) => {
                const formObj = deployObj.value?.defForm.defFormItemList.find(
                  (formBase) => formBase.itemId === item.formItemId
                );
                item.formObj = formObj;

                return item;
              });
          } else {
            deployObj.value = null;
          }
        }
      }
    );

    const ok = async (btnType: string) => {
      const param = {
        taskId: props.currentRow?.taskId,
        mtForms: {},
        mtButtons: {
          var_buttons: btnType,
        },
      };

      formList.value.forEach((item) => {
        param.mtForms[`var_${item.formObj.defStandardFormItem.id}`] =
          item.formObj.defStandardFormItem.value;
      });

      const resp: any = await api.completeTask(param);
      if (resp.message === "OK") {
        message.success("保存成功");
      }

      cancelModal();
      context.emit("refresh");
    };

    const cancelModal = () => {
      context.emit("update:showEdit", false);

      deployObj.value = null;
      btnList.value = [];
      formList.value = [];
    };

    return () => (
      <div class="EditFormdata">
        <a-modal
          wrapClassName="EditFormdataModal"
          centered
          width={700}
          title={props.currentRow.userTaskStatus}
          v-model={[props.showEdit, "visible"]}
          onCancel={cancelModal}
          v-slots={{
            footer: () => (
              <div class="modal_footer">
                <a-button onClick={cancelModal}>取消</a-button>

                {btnList.value.map((btnItem, index) => {
                  let btn;
                  if (btnItem.buttonValue === "pass") {
                    btn = (
                      <a-button
                        type="primary"
                        onClick={() => {
                          ok(btnItem.buttonValue);
                        }}
                      >
                        通过
                      </a-button>
                    );
                  } else if (btnItem.buttonValue === "rebut") {
                    btn = (
                      <a-button
                        type="primary"
                        onClick={() => {
                          ok(btnItem.buttonValue);
                        }}
                      >
                        驳回
                      </a-button>
                    );
                  } else if (btnItem.buttonValue === "reject") {
                    btn = (
                      <a-button
                        type="primary"
                        onClick={() => {
                          ok(btnItem.buttonValue);
                        }}
                      >
                        拒绝
                      </a-button>
                    );
                  } else if (btnItem.buttonValue === "assign") {
                    btn = (
                      <a-button
                        type="primary"
                        onClick={() => {
                          ok(btnItem.buttonValue);
                        }}
                      >
                        转派
                      </a-button>
                    );
                  }

                  return btn;
                })}
              </div>
            ),
          }}
        >
          <a-form
            class="dataform"
            labelCol={{ style: { width: "9em" } }}
            wrapper-col={{ span: 16 }}
            model={deployObj.value?.defForm?.defFormItemList}
            ref={formRef}
          >
            {formList.value.map((item, index) => {
              return (
                (item.applicability === 1 || item.applicability === 2) &&
                item.formObj && (
                  <a-form-item
                    key={index}
                    label={item.formObj.defStandardFormItem.name}
                    name={index}
                  >
                    {item.formObj.defStandardFormItem.displayType ===
                      "input_box" && (
                      <a-input
                        v-model={[
                          item.formObj.defStandardFormItem.value,
                          "value",
                        ]}
                        disabled={item.applicability === 1 ? true : false}
                        placeholder="请输入"
                        allowClear
                      />
                    )}

                    {item.formObj.defStandardFormItem.displayType ===
                      "textarea" && (
                      <a-textarea
                        v-model={[
                          item.formObj.defStandardFormItem.value,
                          "value",
                        ]}
                        disabled={item.applicability === 1 ? true : false}
                        placeholder="请输入"
                        rows={4}
                      />
                    )}
                  </a-form-item>
                )
              );
            })}
          </a-form>
        </a-modal>
      </div>
    );
  },
});
