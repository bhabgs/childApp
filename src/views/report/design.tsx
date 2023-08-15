import { computed, defineComponent, onMounted, ref } from "vue";
import { useRoute } from "vue-router";
import api from "@/api/report";

// 编辑角色
const designRoles = ["RPT_DESIGN", "admin", "root"];

export default defineComponent({
  props: {
    id: {
      type: String,
      required: true,
    },
  },
  setup(props, ctx) {
    const reportDetail = ref();
    const getDetail = async () => {
      const { data: detailData } = await api.reportDetailById(props.id);
      reportDetail.value = detailData;
    };
    onMounted(getDetail);

    const url = computed(() => {
      return `/ureport/designer?_u=file:${encodeURI(
        reportDetail.value?.name
      )}.ureport.xml`;
    });

    return () =>
      reportDetail.value && (
        <iframe
          src={url.value}
          frameborder="0"
          width="100%"
          height="100%"
        ></iframe>
      );
  },
});
