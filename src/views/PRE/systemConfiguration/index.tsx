/**
 *  系统配置
 */
import { defineComponent, reactive, ref } from "vue";
import api from "@/api/PRE";

const SystemConfiguration = defineComponent({
  name: "SystemConfiguration",
  setup(props, ctx) {
    return () => (
      <div class="energyBox systemconfiguration" id="systemconfiguration"></div>
    );
  },
});

export default SystemConfiguration;
