import {
  defineComponent,
  nextTick,
  onMounted,
  onUnmounted,
  ref,
  watch,
} from "vue";
import { message } from "ant-design-vue";
import { useRoute, useRouter } from "vue-router";

import { useEvent } from "inl-ui/dist/hooks";

import "@/assets/style/pages/bpmnCenter/BpmnDesign/EditBpmnDesign.less";

export default defineComponent({
  name: "EditBpmnDesign",
  props: {
    currentRow: {
      type: Object,
      default: () => ({}),
    },
  },

  emits: ["close"],
  setup(props, context) {
    // 刷新列表页当前列表
    const refreshList = useEvent("bpmnDesign");

    const router = useRouter();
    const route = useRoute();

    const { name, activeCategory, processDefinitionId } = route.query;

    const isLoading = ref(false);

    onMounted(async () => {
      isLoading.value = true;
      // 监听子页面想父页面的传参
      window.addEventListener("message", eventHander);
      await nextTick();
      bpmnRef.value!.onload = () => (isLoading.value = false);
    });

    onUnmounted(() => {
      window.removeEventListener("message", eventHander);
    });

    const eventHander = (event) => {
      if (event.data?.type === "toParent") {
        //此处执行事件
        if (event.data?.state) {
          message.success("保存成功");

          cancelModal();
          refreshList();
        } else {
          message.error(event.data.message);
        }
      }
    };

    const cancelModal = () => {
      context.emit("close");
      router.push({ name: "bpmnDesign" });
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
      <div class="EditBpmnDesign flex">
        <div class="btnLine">
          <a-space>
            <a-button onClick={cancelModal}>取消</a-button>

            <a-button type="primary" onClick={fClick}>
              确定
            </a-button>
          </a-space>
        </div>

        <h2 class="titleLine">{name}</h2>

        <div class="pageContent flex1">
          <a-spin
            wrapperClassName="loading-contianer"
            delay={200}
            spinning={isLoading.value}
          >
            <iframe
              ref={bpmnRef}
              width="100%"
              height="100%"
              // src={`${bpmnURL.value}?token=${localStorage.getItem(
              src={`/mtip-bpmn/#/?token=${localStorage.getItem(
                "token"
              )}&processDefinitionId=${processDefinitionId}&categoryId=${activeCategory}&theme=${sessionStorage.getItem(
                "theme"
              )}`}
              frameborder="0"
            ></iframe>
          </a-spin>
        </div>
      </div>
    );
  },
});
