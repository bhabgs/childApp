import { RouteRecordRaw } from "vue-router";
import { getDetailContainer, getMenuDetail } from "inl-ui/dist/components";
import AppManager from "@/views/appCenter/appManager";
import AppDetail from "@/views/appCenter/appManager/detail";
import PageDetailProduction from "@/views/appCenter/appManager/production";
import ScriptDetail from "@/views/appCenter/appManager/scriptDetail";
import ParamManager from "@/views/appCenter/paramManager";
import ParamDetail from "@/views/appCenter/paramManager/detail";
import ParamPreview from "@/views/appCenter/paramManager/preview";
import ParamProduction from "@/views/appCenter/paramManager/production";
import LogicManager from "@/views/appCenter/logicManager";
import LogicDetail from "@/views/appCenter/logicManager/detail";
import ImageManager from "@/views/appCenter/imageManager";
import AppDetailEdit from "@/views/appCenter/appManager/editor";
import CardManager from "@/views/appCenter/cardManager";
import CardDetail from "@/views/appCenter/cardManager/detail";

/**
 * 应用中心
 */
const moduleRoute: RouteRecordRaw = {
  path: "/appCenter",
  redirect: "/appCenter/appManager",
  meta: { title: "应用中心" },
  children: [
    {
      name: "appManager",
      path: "/appCenter/appManager",
      component: AppManager,
      meta: { title: "应用管理" },
    },
    {
      name: "appProductionDetail",
      path: "/appCenter/productionDetail/:id",
      props: {
        name: "appProductionDetail",
        class: "appProductionDetail",
        fill: true,
        cpn: PageDetailProduction,
      },
      component: getDetailContainer(),
      meta: { title: "应用页", hide: true },
    },
    {
      name: "appManagerPageEdit",
      path: "/cardCenter/editor/:id",
      props: {
        name: "appManagerPageEdit",
        fill: true,
        cpn: AppDetailEdit,
      },
      component: getDetailContainer(),
      meta: { title: "编辑页面", hide: true },
    },
    {
      name: "appProduction",
      path: "/appCenter/production/:id",
      props: {
        name: "appProduction",
        fill: true,
        cpn: PageDetailProduction,
      },
      component: getMenuDetail(),
      meta: { title: "应用页", hide: true },
    },
    {
      name: "appDetail",
      path: "/appCenter/appManager/detail/:id",
      props: {
        name: "appDetail",
        cpn: AppDetail,
        fill: true,
      },
      component: getDetailContainer(),
      meta: { title: "应用详情", hide: true },
    },
    {
      name: "scriptDetail",
      path: "/appCenter/appManager/scriptDetail/:id",
      props: {
        name: "scriptDetail",
        cpn: ScriptDetail,
      },
      component: getDetailContainer(),
      meta: { title: "脚本详情", hide: true },
    },
    {
      name: "paramManager",
      path: "/appCenter/paramManager",
      component: ParamManager,
      meta: { title: "参数管理" },
    },
    {
      name: "paramDetail",
      path: "/appCenter/paramDetail/:id",
      props: {
        name: "paramDetail",
        cpn: ParamDetail,
        fill: true,
      },
      component: getDetailContainer(),
      meta: { title: "参数详情", hide: true },
    },
    {
      name: "paramPreview",
      path: "/appCenter/paramPreview/:id",
      props: {
        name: "paramPreview",
        cpn: ParamPreview,
        fill: true,
      },
      component: getDetailContainer(),
      meta: { title: "参数预览", hide: true },
    },
    {
      name: "paramProduction",
      path: "/appCenter/paramProduction/:id",
      props: {
        name: "paramProduction",
        cpn: ParamProduction,
        fill: true,
      },
      component: getDetailContainer(),
      meta: { title: "参数页面", hide: true },
    },
    {
      name: "logicManager",
      path: "/appCenter/logicManager",
      component: LogicManager,
      meta: { title: "逻辑管理" },
    },
    {
      name: "logicDetail",
      path: "/appCenter/logicDetail/:id",
      props: {
        name: "logicDetail",
        cpn: LogicDetail,
        fill: true,
      },
      component: getDetailContainer(),
      meta: { title: "逻辑详情", hide: true },
    },
    {
      name: "imageManager",
      path: "/appCenter/imageManager",
      component: ImageManager,
      meta: { title: "图片管理" },
    },
    {
      path: "/card-center/cardManager",
      component: CardManager,
      meta: { title: "卡片中心" },
    },
    {
      name: "cardManagerDetail",
      path: "/card-center/cardManager/detail/:id",
      props: {
        name: "cardManagerDetail",
        cpn: CardDetail,
        fill: true,
      },
      component: getDetailContainer(),
      meta: { title: "卡片详情", hide: true },
    },
  ],
};

export default moduleRoute;
