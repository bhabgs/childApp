import { defineComponent } from "vue";
import ThingStructure from "@/components/thingStructure";

/**
 * 空间资源
 */
const SpaceResources = defineComponent({
  name: "SpaceResources",
  setup(props, context) {
    return () => <ThingStructure type="space" relaClass="SPACE_SPACE" />;
  },
});

export default SpaceResources;
