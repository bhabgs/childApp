import { computed, defineComponent, onMounted, ref, watchEffect } from "vue";
import { message } from "ant-design-vue";
import useClipboard from "vue-clipboard3";
import dayjs from "dayjs";
import { defineConfig, loadEnv } from "vite";

/**
 * 流程图卡片 item
 */
const CardItem = defineComponent({
  emits: ["delete", "edit", "preview", "replay"],
  props: {
    item: {
      type: Object,
      default: () => {},
    },
    mousePosition: {
      type: Object,
      required: true,
    },
  },
  setup(props, { emit }) {
    const bannerRef = ref<HTMLDivElement>();
    const { toClipboard } = useClipboard();
    // 鼠标移入流程图图片 展示操作
    const isOperationShow = computed(() => {
      if (!bannerRef.value) return false;
      const { left, right, top, bottom } =
        bannerRef.value.getBoundingClientRect();
      return (
        props.mousePosition.x > left &&
        props.mousePosition.x < right &&
        props.mousePosition.y > top &&
        props.mousePosition.y < bottom
      );
    });

    const isPopComfirmShow = ref(false);
    watchEffect(() => {
      if (!isOperationShow.value) {
        isPopComfirmShow.value = false;
      }
    });
    const handleCopy = async () => {
      // const str = `/mtip-developer-center/thingManager/flowChartConfiguration/preview/${props.item.id}`;
      const str = `/mtip-developer-center/#/preview/${props.item.id}`;
      try {
        await toClipboard(str);
        message.success("复制成功");
      } catch (error) {
        if (str) {
          message.error("复制失败");
        } else {
          message.error("没有引用地址");
        }
      }
    };

    return () => (
      <div key={props.item.id} class="list-item card">
        <div
          class="card-banner"
          ref={bannerRef}
          style={`background:${props.item.background}`}
        >
          <img src={props.item.image} alt="" />
          {/* 操作 */}
          <div class="operation-layer" v-show={isOperationShow.value}>
            <a-space direction="vertical">
              <a-space>
                <a-button type="primary" onClick={() => emit("edit")}>
                  编辑
                </a-button>
                <a-button type="primary" onClick={() => emit("preview")}>
                  预览
                </a-button>
                <a-popconfirm
                  title="确定删除此流程图"
                  v-model={[isPopComfirmShow.value, "visible"]}
                  onConfirm={() => emit("delete")}
                >
                  <a-button type="primary" danger>
                    删除
                  </a-button>
                </a-popconfirm>
                {/* <a-button type="primary" onClick={() => emit("replay")}>
                  生产回放
                </a-button> */}
              </a-space>
              <div class="delete"></div>
            </a-space>
          </div>
        </div>
        <div class="card-info">
          <div class="card-name" title={props.item.title}>
            {props.item.title}
          </div>
          <div class="card-time">
            {/* style='padding-top:5px' */}
            <div class="btn">
              {props.item.createDt &&
                dayjs(props.item.createDt).format("YYYY年M月D日")}
            </div>
            <div class="fontColor pointer" onClick={handleCopy}>
              复制引用地址
            </div>
          </div>
        </div>
      </div>
    );
  },
});

export default CardItem;
