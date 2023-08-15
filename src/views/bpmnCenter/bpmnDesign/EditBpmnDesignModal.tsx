import {
  defineComponent,
  nextTick,
  onMounted,
  onUnmounted,
  ref,
  watch,
} from "vue";
import { message } from "ant-design-vue";

import "@/assets/style/pages/bpmnCenter/BpmnDesign/EditBpmnDesignModal.less";

export default defineComponent({
  props: {
    showEdit: {
      type: Boolean,
      default: false,
    },
    activeCategory: {
      type: String,
      default: "",
    },
    currentRow: {
      type: Object,
      default: () => ({}),
    },
  },

  emits: ["update:showEdit", "refresh"],
  setup(props, context) {
    const isLoading = ref(false);

    watch(
      () => props.showEdit,
      async (nVal) => {
        if (nVal) {
          isLoading.value = true;
          // 监听子页面想父页面的传参
          window.addEventListener("message", eventHander);
          await nextTick();
          bpmnRef.value!.onload = () => (isLoading.value = false);
        } else {
          window.removeEventListener("message", eventHander);
        }
      }
    );

    const eventHander = (event) => {
      if (event.data?.type === "toParent") {
        //此处执行事件
        if (event.data?.state) {
          message.success("保存成功");

          cancelModal();
          context.emit("refresh");
        } else {
          message.error(event.data.message);
        }
      }
    };

    const cancelModal = () => {
      context.emit("update:showEdit", false);
    };

    const bpmnURL = ref();
    const getBpmnURL = async () => {
      const url = new URL("/config.json", import.meta.url);
      bpmnURL.value = (await (await fetch(url.href)).json()).bpmnURL;
    };
    onMounted(getBpmnURL);

    const bpmnRef = ref();

    // 父页面向子页面传参
    const fClick = () => {
      let data = {
        save: true,
      };
      bpmnRef.value.contentWindow.postMessage(data, "*");
    };

    return () => (
      <div class="EditBpmnDesign">
        <a-modal
          title={(props.currentRow ? "编辑" : "新增") + "流程设计"}
          v-model={[props.showEdit, "visible"]}
          wrapClassName="EditBpmnDesignModal"
          maskStyle={{ position: "absolute" }}
          getContainer={() => document.getElementById("BpmnDesign")}
          onCancel={cancelModal}
          zIndex={2000}
          v-slots={{
            footer: () => (
              <div class="modal_footer">
                <a-button onClick={cancelModal}>取消</a-button>

                <a-button type="primary" onClick={fClick}>
                  确定
                </a-button>
              </div>
            ),
          }}
        >
          <a-spin
            wrapperClassName="loading-contianer"
            delay={200}
            spinning={isLoading.value}
          >
            <div class="pageContent">
              {props.showEdit && (
                <iframe
                  ref={bpmnRef}
                  width="100%"
                  height="100%"
                  // src={`${bpmnURL.value}?token=${localStorage.getItem(
                  src={`/mtip-bpmn/#/?token=${localStorage.getItem(
                    "token"
                  )}&processDefinitionId=${
                    props.currentRow?.processDefinitionId
                  }&categoryId=${
                    props.activeCategory
                  }&theme=${sessionStorage.getItem("theme")}`}
                  frameborder="0"
                ></iframe>
              )}
            </div>
          </a-spin>
        </a-modal>
      </div>
    );
  },
});
