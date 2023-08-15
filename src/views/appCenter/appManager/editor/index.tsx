import { defineComponent, onMounted, ref } from "vue";
import inlCard from "@/utils/inlCard";
import { useRoute } from "vue-router";
import * as api from "@/api/appCenter/appManager";
import { message } from "ant-design-vue";

const CardEditor = inlCard.InlPageEditor;
const Stage = inlCard.InlPageStage;
export default defineComponent({
  name: "appCenterAppManagerEditor",
  setup() {
    const route = useRoute();
    const appId = route.query.appId as string;

    const pageInfo = ref(null);
    // 获取当前id 下的数据
    const getPageDataById = async () => {
      const res = await api.getPageDetail(route.params.id as string);
      pageInfo.value = res.data;
    };

    // 弹窗状态
    const visible = ref(false);

    onMounted(() => {
      getPageDataById();
    });

    const handleSave = async (e: any) => {
      await api.savePage(e.pageData);
      message.success("保存成功");
    };

    return () => (
      <div class="app-center-app-manager-editor">
        {pageInfo.value && (
          <CardEditor
            appId={appId}
            onSaveCallback={handleSave}
            onPreview={(e) => {
              pageInfo.value = e;
              visible.value = true;
            }}
            pageInfo={pageInfo.value}
          />
        )}
        <a-modal
          footer={null}
          v-model:visible={visible.value}
          destroyOnClose={true}
          wrap-class-name="full-modal-page-preview"
          onOk={() => {}}
        >
          {pageInfo.value && (
            <Stage state="preview" pageInfo={pageInfo.value!} />
          )}
        </a-modal>
      </div>
    );
  },
});
