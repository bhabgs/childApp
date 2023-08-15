import { computed, defineComponent, ref } from "vue";
import QueryFilter from "./components/queryFilter";
import { AppstoreOutlined, UnorderedListOutlined } from "@ant-design/icons-vue";
import List from "./views/list";
import Card from "./views/card";
import UploadModal from "./components/uploadModal";
import { Modal, message } from "ant-design-vue";
import * as api from "@/api/appCenter/imageManager";

/**
 * 图片管理
 */
const ImageManager = defineComponent({
  name: "ImageManager",
  setup() {
    const viewType = ref("list");
    const listRef = ref();
    const cardRef = ref();
    const viewRef = computed<any>(() =>
      viewType.value === "card" ? cardRef : listRef
    );

    const form = ref<any>({});
    const handleSearch = (val) => {
      form.value = { ...val };
    };

    const deleteDisabled = computed(() => {
      if (!viewRef.value?.value) return true;
      if (viewRef.value.value.selectKeys.length <= 0) {
        return true;
      }
      return false;
    });

    const handleDelete = () => {
      const { selectKeys, refresh } = viewRef.value.value;
      if (selectKeys.length <= 0) {
        message.warn("请选择图片");
        return;
      }
      Modal.confirm({
        title: "提示",
        content: `确定删除选中的图片吗？`,
        async onOk() {
          await api.deleteImage(selectKeys);
          message.success("删除成功");
          refresh();
          viewRef.value.value.selectKeys = [];
        },
      });
    };

    const handleRefresh = () => {
      viewRef.value.value.refresh();
    };

    return () => (
      <div class="image-manager">
        <QueryFilter onSearch={handleSearch} />
        <inl-layout-table>
          {{
            opt: () => (
              <a-space>
                <UploadModal onRefresh={handleRefresh} />
                <a-button
                  disabled={deleteDisabled.value}
                  onClick={handleDelete}
                >
                  批量删除
                </a-button>
              </a-space>
            ),
            search: () => (
              <a-radio-group
                size="small"
                button-style="solid"
                v-model:value={viewType.value}
              >
                <a-radio-button value="list">
                  <UnorderedListOutlined />
                </a-radio-button>
                <a-radio-button value="card">
                  <AppstoreOutlined />
                </a-radio-button>
              </a-radio-group>
            ),
            content: () => {
              if (viewType.value === "card") {
                return <Card ref={cardRef} query={form.value} />;
              } else {
                return <List ref={listRef} query={form.value} />;
              }
            },
          }}
        </inl-layout-table>
      </div>
    );
  },
});

export default ImageManager;
