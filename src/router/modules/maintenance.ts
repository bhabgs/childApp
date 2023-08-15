import { RouteRecordRaw } from "vue-router";
import maintenance from "@/views/maintenance";

import { getDetailContainer } from "inl-ui/dist/components";
import maintenanceDiff from "@/views/maintenance/diff";
// import pageConfiguration from "@/views/cardCenter/pageConfiguration";
// import pageConfig from "@/views/cardCenter/pageConfig";
// router.push({
//   name: "maintenanceDiff",
//   params: { version: app.id },
//   query: {
//     name: `应用详情 ${app.name}`,
//     isEdit: String(isEdit),
//   },
// });
/**
 * 卡片中心
 */
const moduleRoute: RouteRecordRaw = {
  path: "/maintenance",
  redirect: "/maintenance/updataManage",
  meta: { title: "运维平台" },
  children: [
    {
      path: "/maintenance/updataManage",
      component: maintenance,
      meta: { title: "更新管理" },
    },
    {
      path: "/maintenance/diff/:id",
      name: "maintenanceDiff",
      props: {
        class: "cardPage",
        name: "maintenanceDiff",
        cpn: maintenanceDiff,
        icon: "icon-kaifazhezhongxin_wumoxingguanli_kongjianguanli",
      },
      component: getDetailContainer(),
      meta: { title: "差分详情", hide: true },
    },
  ],
};

export default moduleRoute;
