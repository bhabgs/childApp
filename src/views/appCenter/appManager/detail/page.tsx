import { computed, defineComponent, ref, watch } from "vue";
import { useRouter } from "vue-router";
import { useClipboard } from "@vueuse/core";
import _ from "lodash";
import { SearchOutlined } from "@ant-design/icons-vue";
import ThumbnailItem from "@/components/thumbnail-item";
import { Modal, message } from "ant-design-vue";

/**
 * 页面编辑
 */
const Page = defineComponent({
  emits: ["add", "delete", "release"],
  props: {
    appId: {
      type: String,
      required: true,
    },
    list: {
      type: Array,
      default: () => [],
    },
    loading: Boolean,
    isEdit: Boolean,
    activeTab: String,
  },
  setup(props, { emit, expose }) {
    const router = useRouter();
    const { copy } = useClipboard({ legacy: true });
    const keyword = ref("");

    const filteredList = computed(() => {
      if (!keyword.value) return props.list;
      return props.list.filter((item: any) => {
        return (
          (item.name && item.name.indexOf(keyword.value) > -1) ||
          (item.fullname && item.fullname.indexOf(keyword.value) > -1)
        );
      });
    });

    const handleCopy = (item) => {
      const pcUrl = `/mtip-developer-center/appCenter/production/${item.id}`;
      const phoneUrl = `/mtip-h5-phone/#/subscribe/${item.id}`;
      const url = item.clientType === "phone" ? phoneUrl : pcUrl;
      copy(url).then(() => {
        message.success("复制成功");
      });
    };

    // 预览页面
    const handlePreview = (page) => {
      router.push({
        name: "appProductionDetail",
        params: { id: page.id },
        query: {
          name: `${page.name}`,
        },
      });
    };

    // 编辑页面
    const handleEdit = (page) => {
      router.push({
        name: "appManagerPageEdit",
        params: { id: page.id },
        query: {
          name: `${page.name}`,
          appId: props.appId,
        },
      });
    };

    return () => (
      <div class="page">
        <div class="operation">
          <a-button
            type="primary"
            disabled={!props.isEdit}
            onClick={() => emit("add")}
          >
            新增页面
          </a-button>
          <a-input
            style={{ width: "320px" }}
            placeholder="请输入"
            suffix={<SearchOutlined />}
            allowClear
            v-model:value={keyword.value}
          ></a-input>
        </div>
        {
          <a-spin spinning={props.loading}>
            <div class="page-list">
              {filteredList.value.length > 0 ? (
                <a-row gutter={[16, 16]}>
                  {filteredList.value.map((item: any) => (
                    <a-col span={6}>
                      <ThumbnailItem
                        key={item.id}
                        name={item.name}
                        hideTools={!props.isEdit}
                        release={item.status === 3}
                        onDelete={() => emit("delete", item)}
                        onRelease={() => emit("release", item)}
                        onEdit={() => handleEdit(item)}
                        onPreview={() => handlePreview(item)}
                        onCopy={() => handleCopy(item)}
                      />
                    </a-col>
                  ))}
                </a-row>
              ) : (
                <a-empty></a-empty>
              )}
            </div>
          </a-spin>
        }
      </div>
    );
  },
});

export default Page;
