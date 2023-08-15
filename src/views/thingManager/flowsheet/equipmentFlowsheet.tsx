import { defineComponent } from "vue";
import Index from "./index";

export default defineComponent({
  setup() {
    return () => <Index type="device_connect"></Index>;
  },
});
