import { defineComponent, ref } from "vue";
import FormdataManager from "@/views/bpmnCenter/formdataManager";

export default defineComponent({
  props: {
    showList: {
      type: Boolean,
      default: false,
    },
  },

  emits: ["update:showList", "addTemplateItemList"],
  setup(props, context) {
    const selectedRows = ref([]);

    const ok = () => {
      context.emit("addTemplateItemList", selectedRows.value);
      cancelModal();
    };

    const cancelModal = () => {
      context.emit("update:showList", false);
    };

    return () => (
      <div class="EditFormTemplate">
        <a-modal
          title={"表单列表"}
          width={1300}
          v-model={[props.showList, "visible"]}
          wrapClassName="EditFormTemplateModal"
          onCancel={cancelModal}
          v-slots={{
            footer: () => (
              <div class="modal_footer">
                <a-button onClick={cancelModal}>取消</a-button>

                <a-button type="primary" onClick={ok}>
                  确定
                </a-button>
              </div>
            ),
          }}
        >
          <div class="pageContent">
            <FormdataManager
              isComp={true}
              clearSelect={!props.showList}
              onChangeSelect={(rows) => {
                selectedRows.value = rows;
              }}
            />
          </div>
        </a-modal>
      </div>
    );
  },
});
