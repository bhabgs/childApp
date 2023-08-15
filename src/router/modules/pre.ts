import { RouteRecordRaw } from "vue-router";
import { getDetailContainer, getMenuDetail } from "inl-ui/dist/components";
import DeviceConnectionDta from "@/views/PRE/deviceConnection/detail";
import deviceConnection from "@/views/PRE/deviceConnection";
import managementTools from "@/views/PRE/managementTools";
import systemConfiguration from "@/views/PRE/systemConfiguration";
import preForignServerMqtt from "@/views/PRE/foreignServer/mqtt";
import preForignServerOpcUa from "@/views/PRE/foreignServer/opcUa";
import preForignServerOpcUaDetail from "@/views/PRE/foreignServer/opcUa/detail";

/**
 * PRE管理
 */
const moduleRoute: RouteRecordRaw = {
  path: "/PRE",
  redirect: "/PRE/cardWarehouse",
  meta: { title: "PRE" },
  children: [
    {
      path: "/PRE/deviceConnection",
      component: deviceConnection,
      meta: { title: "设备连接" },
    },
    {
      name: "deviceConnectionDta",
      path: "/PRE/deviceConnectionDta/:id",
      props: {
        name: "deviceConnectionDta",
        cpn: DeviceConnectionDta,
      },
      component: getDetailContainer(),
      meta: { title: "设备连接详情", hide: true },
    },
    {
      path: "/PRE/managementTools",
      component: managementTools,
      meta: { title: "打点工具" },
    },
    {
      path: "/PRE/systemConfiguration",
      component: systemConfiguration,
      meta: { title: "系统配置" },
    },
    {
      path: "/PRE/foreignServer",
      meta: { title: "对外服务" },
      children: [
        {
          path: "/PRE/foreignServer/mqttServer",
          component: preForignServerMqtt,
          meta: { title: "MQTT" },
        },
        {
          path: "/PRE/foreignServer/opcUaServer",
          meta: { title: "OPC-UA" },
          component: preForignServerOpcUa,
        },
        {
          path: "/PRE/foreignServer/opcUaServer/:id",
          meta: { title: "OPC-UA-DETAIL", hide: true },
          name: "preForignServerOpcUaDetail",
          props: {
            name: "preForignServerOpcUaDetail",
            cpn: preForignServerOpcUaDetail,
          },
          component: getDetailContainer(),
        },
      ],
    },
  ],
};

export default moduleRoute;
