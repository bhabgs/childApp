import { microAppUtils } from "inl-ui/dist/utils";
import { getMenuDetail } from "inl-ui/dist/components";
import factoryOverview from "@/views/factoryOverview";
import industryManager from "@/views/industryManager";
import categoryManager from "@/views/categoryManager";
import FlowsheetPreview from "@/views/thingManager/flowsheet/preview";

/* 模块路由 */
import moduleThingManager from "./modules/thingManager";
import modulePre from "./modules/pre";
import moduleAppCenter from "./modules/appCenter";
import moduleCardCenter from "./modules/cardCenter";
import moduleReportManager from "./modules/reportManager";
import moduleWorkOrder from "./modules/workOrder";
import moduleMaintenance from "./modules/maintenance";

const routes = microAppUtils.transformRoutes(import.meta.env.VITE_APP_NAME, [
  {
    path: "/factoryOverview",
    component: factoryOverview,
    meta: { title: "厂内概览" },
  },
  {
    path: "/industryManager",
    component: industryManager,
    meta: { title: "行业管理" },
  },
  {
    path: "/categoryManager",
    component: categoryManager,
    meta: { title: "类目管理" },
  },
  moduleThingManager,
  modulePre,
  moduleAppCenter,
  moduleCardCenter,
  moduleReportManager,
  moduleWorkOrder,
  moduleMaintenance,
  {
    path: "/preview/:type/:id",
    name: "preview",
    props: {
      cpn: FlowsheetPreview,
      class: "flowsheet-preview",
    },
    component: getMenuDetail(),
    meta: { title: "预览流程图", hide: true },
  },
]);

export default routes;
