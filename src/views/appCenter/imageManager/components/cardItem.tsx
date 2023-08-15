import { computed, defineComponent, ref } from "vue";
import { useClipboard, useMouseInElement } from "@vueuse/core";
import { CopyOutlined, DeleteOutlined } from "@ant-design/icons-vue";
import { message } from "ant-design-vue";

const CardItem = defineComponent({
  emits: ["click", "delete"],
  props: {
    record: {
      type: Object,
      required: true,
    },
    selected: Boolean,
  },
  setup(props, { emit }) {
    const thumbnailRef = ref();
    const { copy } = useClipboard({ legacy: true });

    const { isOutside } = useMouseInElement(thumbnailRef);
    const operateShow = computed(() => !isOutside.value);

    const handleCopy = (e) => {
      e.stopPropagation();
      copy(props.record.url).then(() => {
        message.success("复制成功");
      });
    };

    const handleDownload = (e: MouseEvent) => {
      e.stopPropagation();
      const aEl = document.createElement("a");
      aEl.href = props.record.url;
      aEl.target = "_BLANK";
      aEl.download = props.record.name;
      aEl.click();
    };

    const handlPreview = (e) => {
      e.stopPropagation();
      const previewMask = thumbnailRef.value.querySelector(".ant-image");
      if (previewMask) {
        const clickEvent = new MouseEvent("click", {
          view: window,
          // 不允许冒泡
          bubbles: false,
          cancelable: true,
        });
        previewMask.dispatchEvent(clickEvent);
      }
    };

    return () => (
      <div
        class={["card-item", { selected: props.selected }]}
        onClick={() => emit("click")}
      >
        <div class="thumbnail" ref={thumbnailRef}>
          <a-image src={props.record.url}></a-image>
          <div class="operation" v-show={operateShow.value}>
            <a-space class="tools">
              <div
                class="item"
                onClick={(e) => {
                  e.stopPropagation();
                  emit("delete");
                }}
              >
                <DeleteOutlined />
              </div>
            </a-space>
            <a-space>
              <a-button type="primary" onClick={handleDownload}>
                下载
              </a-button>
              <a-button onClick={handlPreview}>预览</a-button>
            </a-space>
          </div>
        </div>
        <div class="content">
          <div class="title">{props.record.name}</div>
          <div class="description">{props.record.description || "暂无"}</div>
          <div class="bottom">
            <span class="copy" onClick={handleCopy}>
              <CopyOutlined />
              复制图片路径
            </span>
            <div class="size">
              {props.record.width}*{props.record.height}
            </div>
          </div>
        </div>
      </div>
    );
  },
});

export default CardItem;
