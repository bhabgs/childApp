import { defineComponent, onMounted, PropType } from "vue";
import { PlusOutlined } from "@ant-design/icons-vue";
import cardItem from "./cardItem";

export default defineComponent({
  name: "FlowList",
  emits: ["create", "delete", "edit", "preview", "replay"],
  props: {
    withCreate: {
      type: Boolean,
      default: false,
    },
    list: {
      type: Array as PropType<any[]>,
      default: () => [],
    },
  },
  components: { cardItem },
  setup(props, { emit }) {
    onMounted(() => {});
    return () => (
      <div class="flowList">
        {props.withCreate && (
          <div
            key="create"
            class="create list-item"
            onClick={() => emit("create")}
          >
            <PlusOutlined class="fontColor" />
            <div class="fontColor">新建工艺流程图</div>
          </div>
        )}
        {!props.withCreate && !props.list.length ? (
          <a-empty style={{ width: "100%" }} />
        ) : (
          <>
            {props.list.map((item) => (
              <cardItem
                bg={item.background}
                key={item.id}
                item={item}
                onDelete={() => emit("delete", item)}
                onEdit={() => emit("edit", item)}
                onPreview={() => emit("preview", item)}
                onReplay={() => emit("replay", item)}
              />
            ))}
          </>
        )}
      </div>
    );
  },
});
