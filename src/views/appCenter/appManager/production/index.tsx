import { computed, defineComponent, onMounted, ref } from "vue";
import inlCard from "@/utils/inlCard";
import { useRoute } from "vue-router";
import * as api from "@/api/appCenter/appManager";

const Stage = inlCard.InlPageStage;
export default defineComponent({
  name: "appCenterAppManagerEditor",
  setup() {
    const route = useRoute();

    const pageInfo = ref<any>(null);
    // 获取当前id 下的数据
    const getPageDataById = async () => {
      const res = await api.getPageDetail(route.params.id as string);
      pageInfo.value = res.data;
    };

    const isPhonePreview = computed(() => {
      return (
        pageInfo.value?.clientType === "phone" &&
        route.name === "appProductionDetail"
      );
    });

    onMounted(() => {
      getPageDataById();
    });
    return () => (
      <div class="app-center-page-production">
        {pageInfo.value && (
          <div
            class={["stage-container", { "phone-view": isPhonePreview.value }]}
          >
            <Stage state="production" pageInfo={pageInfo.value} />
          </div>
        )}
      </div>
    );
  },
});
