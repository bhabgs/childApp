import { defineComponent } from "vue";

/**
 * 场内概览
 */
const FactoryOverview = defineComponent({
  name: "factoryOverview",
  setup() {
    return () => <div class="factory-overview">厂内概览</div>;
  },
});

export default FactoryOverview;
