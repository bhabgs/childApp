import { defineComponent, onMounted, ref } from "vue";
import { useEvent } from "inl-ui/dist/hooks";

import "@/assets/style/pages/cardCenter/EditPageConfig.less";

import { useRoute, useRouter } from "vue-router";

import { InlPageEditor } from "inl-app-manager/dist/index";
import "inl-app-manager/dist/iconfont.js";

export default defineComponent({
  name: "EditPageConfig",
  components: { InlPageEditor },
  setup(props, context) {
    const route = useRoute();
    const router = useRouter();
    const previewVisible = ref<boolean>(false);
    // 刷新列表
    const refreshList = useEvent("PageConfig");

    onMounted(() => {
      const { id } = route?.query;
    });

    const save = () => {
      context.emit("close");

      router.push({ name: "PageConfig" });
      refreshList();
    };
    const pageInfo = ref(null);

    return () => (
      <div class="EditPageConfig">
        {/* <a-button onClick={save}>保存</a-button> */}

        <inlPageEditor
          onSaveCallback={save}
          currentRecord={{}}
          onPreview={(pageData) => {
            pageInfo.value = pageData;
            console.log(pageInfo.value);

            previewVisible.value = !previewVisible.value;
          }}
        />
        <a-modal
          v-model={[previewVisible.value, "visible"]}
          destroyOnClose
          class="screen-model"
          width="100%"
        >
          {/* <productionComponent pageInfo={pageInfo.value} /> */}
        </a-modal>
      </div>
    );
  },
});
