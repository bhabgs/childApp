import { defineComponent, ref } from "vue";
import { useMouseInElement } from "@vueuse/core";
import {
  EditOutlined,
  SendOutlined,
  DeleteOutlined,
  EllipsisOutlined,
} from "@ant-design/icons-vue";

export const appActions = [
  { name: "启动", key: 1 },
  { name: "停止", key: 2 },
  { name: "重启", key: 3 },
];

/**
 * 列表项 带缩略图、编辑和预览
 */
const ThumbnailItem = defineComponent({
  emits: ["edit", "preview", "delete", "release", "copy", "action"],
  props: {
    name: String,
    thumbnail: String,
    release: {
      type: Boolean,
      default: false,
    },
    hideTools: {
      type: Boolean,
      default: false,
    },
    hideCopy: {
      type: Boolean,
      default: false,
    },
    editText: {
      type: String,
      default: "编辑",
    },
    previewText: {
      type: String,
      default: "预览",
    },
    showActions: Boolean,
  },
  setup(props, { emit }) {
    const thumbnailRef = ref();
    const { isOutside } = useMouseInElement(thumbnailRef);

    const handleActionClick = ({ key }) => {
      emit("action", key);
    };

    return () => (
      <div class="thumbnail-item">
        <div class="thumbnail-container" ref={thumbnailRef}>
          {props.thumbnail ? (
            <img src={props.thumbnail} alt="" />
          ) : (
            <a-empty description="暂无缩略图"></a-empty>
          )}
          {!isOutside.value && (
            <div class="modal">
              <a-space>
                <a-button type="primary" onClick={() => emit("edit")}>
                  {props.editText}
                </a-button>
                <a-button onClick={() => emit("preview")}>
                  {props.previewText}
                </a-button>
                {!props.hideCopy && (
                  <a-button type="primary" onClick={() => emit("copy")}>
                    复制地址
                  </a-button>
                )}
              </a-space>
              {!props.hideTools && (
                <a-space class="tool">
                  {props.showActions && (
                    <a-dropdown
                      v-slots={{
                        overlay: () => (
                          <a-menu
                            style={{ width: "80px", textAlign: "center" }}
                            onClick={handleActionClick}
                          >
                            {appActions.map((action) => (
                              <a-menu-item key={action.key}>
                                {action.name}
                              </a-menu-item>
                            ))}
                          </a-menu>
                        ),
                      }}
                    >
                      <div class="tool-item">
                        <EllipsisOutlined />
                      </div>
                    </a-dropdown>
                  )}
                  <div class="tool-item" onClick={() => emit("release")}>
                    <SendOutlined />
                  </div>
                  <div class="tool-item" onClick={() => emit("delete")}>
                    <DeleteOutlined />
                  </div>
                </a-space>
              )}
            </div>
          )}
        </div>
        <div class="name-container">
          {props.release ? (
            <a-tag color="green">已发布</a-tag>
          ) : (
            <a-tag>
              <EditOutlined />
              暂存
            </a-tag>
          )}
          <span class="name">{props.name}</span>
        </div>
      </div>
    );
  },
});

export default ThumbnailItem;
