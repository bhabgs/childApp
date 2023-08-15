import { RouteRecordRaw } from "vue-router";
import { getDetailContainer, getMenuDetail } from "inl-ui/dist/components";
import workorderCenter from "@/views/workorderManage/workorderCenter";
import workorderSkillGroup from "@/views/workorderManage/workorderSkillGroup";

/**
 * 工单管理
 */
const moduleRoute: RouteRecordRaw = {
  path: "/workorderManage",
  redirect: "/workorderManage/workorderCenter",
  meta: { title: "工单管理" },
  children: [
    {
      path: "/workorderManage/workorderCenter",
      component: workorderCenter,
      meta: { title: "工单中心" },
    },
    // {
    //   path: "/workorderManage/workorderLog",
    //   component: WorkorderLog,
    //   meta: { title: "历史工单查询" },
    // },
    {
      path: "/workorderManage/workorderSkillGroup",
      component: workorderSkillGroup,
      meta: { title: "工单技能组配置" },
    },
  ],
};

export default moduleRoute;
