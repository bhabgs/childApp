import { RouteRecordRaw } from "vue-router";
import { getDetailContainer, getMenuDetail } from "inl-ui/dist/components";
import bpmnDesign from "@/views/bpmnCenter/bpmnDesign";
import FlowsheetPreview from "@/views/thingManager/flowsheet/preview";
import formdataManager from "@/views/bpmnCenter/formdataManager";
import formTemplateManager from "@/views/bpmnCenter/formTemplateManager";
import EditBpmnDesign from "@/views/bpmnCenter/bpmnDesign/EditBpmnDesign";

/**
 * 工作流
 */
const moduleRoute: RouteRecordRaw = {
  path: "/bpmnCenter",
  redirect: "/bpmnCenter/bpmnDesign",
  meta: { title: "流程中心" },
  children: [
    {
      name: "bpmnDesign",
      path: "/bpmnCenter/bpmnDesign",
      component: bpmnDesign,
      meta: { title: "流程设计" },
    },
    {
      path: "/bpmnCenter/bpmnDesign/editBpmnDesign/:id",
      name: "editBpmnDesign",
      props: {
        name: "editBpmnDesign",
        cpn: EditBpmnDesign,
        icon: "icon-kaifazhezhongxin_wumoxingguanli_kongjianguanli",
      },
      component: getDetailContainer(),
      meta: { title: "流程详情", hide: true },
    },
    {
      path: "/bpmnCenter/formDataManager",
      component: formdataManager,
      meta: { title: "表单字段管理" },
    },
    {
      path: "/bpmnCenter/formTemplateManager",
      component: formTemplateManager,
      meta: { title: "表单模板管理" },
    },
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
  ],
};

export default moduleRoute;
