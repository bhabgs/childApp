import { defineComponent, computed } from "vue";
import { useClipboard } from "@vueuse/core";
import { message } from "ant-design-vue";
import dayjs from "dayjs";
import { thtmeInfo } from "@/views/thingManager/flowChartConfiguration/ke";
import * as topoMapAPI from "@/api/topoMap";
import emptyImage from './empty.png';

export default defineComponent({
  props: {
    type: {
      type: String,
      default: 'device_connect',
    },
    data: {
      type: Object as () => topoMapAPI.TopoMap,
      default: null,
    },
  },
  emits: ["delete", "edit", "preview", "replay"],
  setup(props, { emit }) {
    const { copy } = useClipboard({ legacy: true });

    // 复制
    const copyUrl: () => void = () => {
      copy(`/mtip-developer-center/preview/${props.type}/${props.data.id}`)
        .then(() => {
          message.success("复制成功");
        })
        .catch(() => {
          message.error("复制失败");
        });
    };

    // 背景色
    const background = computed<string | undefined>(() => {
      if (props.data.theme) {
        return thtmeInfo[props.data.theme]?.background;
      }
      return undefined;
    });

    return () => (
      <div class="topo-list-item">
        <div
          class="topo-list-banner"
          style={{ backgroundColor: background.value }}
        >
          <img src={props.data.image || emptyImage} alt={props.data.title} />
          <div class="topo-list-btns">
            <a-space>
              <a-button type="primary" onClick={() => emit("edit")}>
                编辑
              </a-button>
              <a-button type="primary" onClick={() => emit("preview")}>
                预览
              </a-button>
              <a-popconfirm
                title="确定删除此流程图？"
                onConfirm={() => emit("delete")}
              >
                <a-button type="primary" danger>
                  删除
                </a-button>
              </a-popconfirm>
            </a-space>
          </div>
        </div>
        <div class="topo-list-info">
          <div class="topo-list-name" title={props.data.title}>
            {props.data.title}
          </div>
          <div class="topo-list-bottom">
            <div class="topo-list-time">
              {props.data.createTime &&
                dayjs(props.data.createTime).format("YYYY年M月D日")}
            </div>
            <div class="topo-list-copy" onClick={copyUrl}>
              复制引用地址
            </div>
          </div>
        </div>
      </div>
    );
  },
});
