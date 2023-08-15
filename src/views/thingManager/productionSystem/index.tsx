import { defineComponent } from "vue";
import ThingStructure from "@/components/thingStructure";

/**
 * 生产系统
 */
const ProductionSystem = defineComponent({
  name: "ProductionSystem",
  setup() {
    return () => (
      <ThingStructure type="system_mt" relaClass="SYSTEM_MT_SYSTEM_MT" />
    );
  },
});

export default ProductionSystem;
