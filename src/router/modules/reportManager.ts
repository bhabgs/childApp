import { RouteRecordRaw } from "vue-router";
import { getDetailContainer, getMenuDetail } from "inl-ui/dist/components";
import reportIframe from "@/views/report/preview";
import reportDesign from "@/views/report/design";
import report from "@/views/report";

/**
 * 报表管理
 */
const moduleRoute: RouteRecordRaw = {
  path: "/reportTable",
  redirect: "/reportTable/report",
  meta: { title: "报表管理" },
  children: [
    {
      name: "report",
      path: "/reportTable/report",
      component: report,
      meta: { title: "报表管理" },
    },
    {
      path: "/reportTable/detail/:id",
      name: "reportDetail",
      props: {
        name: "reportDetail",
        cpn: reportIframe,
        icon: "icon-kaifazhezhongxin_wumoxingguanli_kongjianguanli",
        class: "report-detail",
      },
      component: getDetailContainer(),
      meta: { title: "报表详情", hide: true },
    },
    {
      path: "/reportTable/design/:id",
      name: "reportDesign",
      props: {
        name: "reportDesign",
        cpn: reportDesign,
        icon: "icon-kaifazhezhongxin_wumoxingguanli_kongjianguanli",
        class: "report-detail",
      },
      component: getDetailContainer(),
      meta: { title: "报表设计", hide: true },
    },
  ],
};

export default moduleRoute;
