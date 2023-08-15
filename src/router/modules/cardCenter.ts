import { RouteRecordRaw } from "vue-router";
import { getDetailContainer, getMenuDetail } from "inl-ui/dist/components";
import EditPageConfig from "@/views/cardCenter/pageConfig/EditPageConfig";
import cardWarehouse from "@/views/cardCenter/cardWarehouse";
import pageConfiguration from "@/views/cardCenter/pageConfiguration";
import pageConfig from "@/views/cardCenter/pageConfig";

/**
 * 卡片中心
 */
const moduleRoute: RouteRecordRaw = {
  path: "/cardCenter",
  redirect: "/cardCenter/cardWarehouse",
  meta: { title: "卡片中心" },
  children: [
    {
      path: "/cardCenter/cardWarehouse",
      component: cardWarehouse,
      meta: { title: "卡片仓库" },
    },
    {
      path: "/cardCenter/pageConfiguration",
      component: pageConfiguration,
      meta: { title: "页面配置" },
    },
    {
      path: "/cardCenter/pageConfig",
      name: "PageConfig",
      component: pageConfig,
      meta: { title: "页面配置" },
    },
    {
      path: "/cardCenter/editPageConfig/:id",
      name: "EditPageConfig",
      props: {
        class: "cardPage",
        name: "EditPageConfig",
        cpn: EditPageConfig,
        icon: "icon-kaifazhezhongxin_wumoxingguanli_kongjianguanli",
      },
      component: getDetailContainer(),
      meta: { title: "页面配置详情", hide: true },
    },
  ],
};

export default moduleRoute;
