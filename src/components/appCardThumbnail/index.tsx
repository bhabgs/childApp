import { defineComponent, ref } from "vue";
import { useClipboard } from "@vueuse/core";
import {
  CopyOutlined,
  EditOutlined,
  DeleteOutlined,
} from "@ant-design/icons-vue";
import { message } from "ant-design-vue";

/**
 * 卡片缩略
 */
const AppCardThumbnail = defineComponent({
  emits: ["edit", "delete"],
  props: {
    record: {
      type: Object,
      required: true,
    },
  },
  setup(props, { emit }) {
    const { copy } = useClipboard({ legacy: true });

    const handleCopy = () => {
      copy("productionTest_code").then(() => {
        message.success("复制成功");
      });
    };

    const deletePopOpen = ref(false);

    return () => (
      <div class="app-card-thumbnail">
        <div class="thumbnail">
          {props.record.thumbnail ? (
            <a-image src={props.record.thumbnail}></a-image>
          ) : (
            <a-empty
              style={{ marginTop: "16px" }}
              description="暂无缩略图"
            ></a-empty>
          )}
        </div>
        <div class="title">
          {props.record.available === 1 ? (
            <a-tag color="green">启用</a-tag>
          ) : (
            <a-tag>未启用</a-tag>
          )}
          {props.record.name}
        </div>
        <div class="bottom">
          <span class="code">
            {props.record.code}
            <CopyOutlined
              style={{ marginLeft: "4px", color: "var(--primary-color)" }}
              onClick={handleCopy}
            />
          </span>
          <div>
            <a-button type="text" size="small" onClick={() => emit("edit")}>
              <EditOutlined />
              编辑
            </a-button>
            <a-popconfirm
              title={`请确认要删除“”卡片？`}
              v-model:visible={deletePopOpen.value}
              onConfirm={() => emit("delete")}
            >
              <a-button type="text" size="small" danger={deletePopOpen.value}>
                <DeleteOutlined />
                删除
              </a-button>
            </a-popconfirm>
          </div>
        </div>
      </div>
    );
  },
});

export default AppCardThumbnail;
