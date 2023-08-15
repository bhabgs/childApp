import { computed, defineComponent, onMounted, ref } from "vue";
import { useRoute } from "vue-router";
import api from "@/api/report";

// 编辑角色
const editorRoles = ["RPT_DATA_EDIT", "admin", "root"];

export default defineComponent({
  props: {
    id: {
      type: String,
      required: true,
    },
  },
  setup(props, ctx) {
    const route = useRoute();

    const reportDetail = ref();
    const userRoleList = ref([]);
    const getDetail = async () => {
      const userinfo = JSON.parse(sessionStorage.getItem("userinfo") || "{}");
      const { data } = await api.getUserPermission(userinfo.userId);
      userRoleList.value = data;

      const { data: detailData } = await api.reportDetailById(props.id);
      reportDetail.value = detailData;
    };
    onMounted(getDetail);

    const url = computed(() => {
      const isEditor = userRoleList.value.some((role: any) =>
        editorRoles.includes(role.code)
      );
      const query: any = { ...route.query };
      const search = new URLSearchParams();
      search.append(
        "_u",
        `file:${encodeURI(reportDetail.value?.name)}.ureport.xml`
      );
      search.append("editor", String(Number(isEditor)));
      for (const key in query) {
        search.append(key, query[key]);
      }
      const searchString = search.toString();

      return `/ureport/preview?${searchString}`;
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
