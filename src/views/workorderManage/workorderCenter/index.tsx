import {
  defineComponent,
  onMounted,
  ref,
  reactive,
  watch,
  nextTick,
} from "vue";

import "@/assets/style/pages/workorderManage/workorderCenter/index.less";

import TodoList from "./TodoList";
import PoolTodoList from "./PoolTodoList";

export default defineComponent({
  name: "WorkorderCenter",
  setup(props, context) {
    const activeKey = ref("1");

    onMounted(() => {});

    return () => (
      <div class="WorkorderCenter flex">
        <a-tabs
          v-model={[activeKey.value, "activeKey"]}
          tabPosition="left"
          destroyInactiveTabPane
        >
          <a-tab-pane key="1" tab="我的待办工单">
            <TodoList />
          </a-tab-pane>
          <a-tab-pane key="2" tab="工单池">
            <PoolTodoList />
          </a-tab-pane>
          <a-tab-pane key="3" tab="我处理的工单" disabled></a-tab-pane>
          <a-tab-pane key="4" tab="已办结的工单" disabled></a-tab-pane>
          <a-tab-pane key="5" tab="我发起的工单" disabled></a-tab-pane>
        </a-tabs>
      </div>
    );
  },
});
