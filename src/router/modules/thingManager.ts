import { RouteRecordRaw } from "vue-router";
import { getDetailContainer, getMenuDetail } from "inl-ui/dist/components";
import thingModelManager from "@/views/thingManager/thingModelManager";
import ThingModelManager from "@/views/thingManager/thingModelManager";
import ThingInstance from "@/views/thingManager/thingInstance";
import DetailOrEdit from "@/views/thingManager/thingInstance/component/DetailOrEdit";
import ProductionSystem from "@/views/thingManager/productionSystem";
import SpaceResources from "@/views/thingManager/spaceResources";
import ManufactoryManager from "@/views/thingManager/manufactorManager";
import EquipmentFlowsheet from "@/views/thingManager/flowsheet/equipmentFlowsheet";
import ProcessFlowsheet from "@/views/thingManager/flowsheet/processFlowsheet";
import FlowsheetPreview from "@/views/thingManager/flowsheet/preview";
import FlowsheetEdit from "@/views/thingManager/flowsheet/edit";

/**
 * 物管理
 */
const moduleRoute: RouteRecordRaw = {
  path: "/thingManager",
  redirect: "/thingManager/thingModelManager",
  meta: { title: "物管理" },
  children: [
    {
      path: "/thingManager/thingModelManager",
      meta: { title: "物模型管理" },
      children: [
        {
          path: "/thingManager/thingModelManager",
          name: "thingModel",
          component: thingModelManager,
          meta: { title: "物模型管理" },
        },
        {
          path: "/thingManager/thingModelManager/detail/:id",
          name: "thingModelDetail",
          props: {
            name: "thingModelDetail",
            cpn: ThingModelManager,
            icon: "icon-kaifazhezhongxin_wumoxingguanli_kongjianguanli",
          },
          component: getDetailContainer(),
          meta: { title: "物模型详情/编辑", hide: true },
        },
      ],
    },
    {
      path: "/thingManager/thingInstanceManager",
      redirect: "/thingManager/thingInstanceManager/thingInstanceAll",
      meta: { title: "实例管理" },
      children: [
        {
          path: "/thingManager/thingInstanceManager/thingInstanceAll",
          name: "thingInstanceAll",
          component: ThingInstance,
          meta: { title: "全部实例" },
        },
        {
          path: "/thingManager/thingInstanceManager/thingInstance/:id", //id === root_thing_code
          name: "thingInstance",
          props: {
            name: "thingInstance",
            cpn: ThingInstance,
            icon: "icon-kaifazhezhongxin_wumoxingguanli_kongjianguanli",
          },
          component: getMenuDetail(),
          meta: { title: "物实例管理", hide: true },
        },
        {
          path: "/thingManager/thingInstanceManager/thingInstDetail/:id",
          name: "DetailOrEdit",
          props: {
            name: "DetailOrEdit",
            cpn: DetailOrEdit,
            icon: "icon-kaifazhezhongxin_wumoxingguanli_kongjianguanli",
          },
          component: getDetailContainer(),
          meta: { title: "物实例详情", hide: true },
        },
        {
          path: "/thingManager/thingInstanceManager/productionSystem",
          component: ProductionSystem,
          meta: { title: "生产系统" },
        },
        {
          path: "/thingManager/thingInstanceManager/spaceResources",
          component: SpaceResources,
          meta: { title: "空间资源" },
        },
      ],
    },
    {
      path: "/thingManager/manufactorManager",
      component: ManufactoryManager,
      meta: { title: "厂家管理" },
    },
    {
      path: "/thingManager/equipmentFlowsheet",
      name: "equipmentFlowsheet",
      component: EquipmentFlowsheet,
      props: {
        key: "equipmentFlowsheet",
      },
      meta: { title: "设备流程图", type: "device_connect" },
    },
    {
      path: "/thingManager/processFlowsheet",
      name: "processFlowsheet",
      component: ProcessFlowsheet,
      props: {
        key: "processFlowsheet",
      },
      meta: { title: "工艺流程图", type: "process_connect" },
    },
    {
      path: "/thingManager/flowsheet/edit/:type/:id",
      name: "flowsheetEdit",
      props: {
        key: "flowsheetEdit",
        name: "flowsheetEdit",
        cpn: FlowsheetEdit,
        icon: "icon-kaifazhezhongxin_wumoxingguanli_kongjianguanli",
        class: "flowsheet-edit",
      },
      component: getDetailContainer(),
      meta: { title: "编辑流程图", hide: true, type: "edit" },
    },
    {
      path: "/thingManager/flowsheet/preview/:type/:id",
      name: "flowsheetPreview",
      props: {
        key: "flowsheetPreview",
        name: "flowsheetPreview",
        cpn: FlowsheetPreview,
        class: "flowsheet-preview",
      },
      component: getDetailContainer(),
      meta: { title: "预览流程图", hide: true },
    },
  ],
};

export default moduleRoute;
