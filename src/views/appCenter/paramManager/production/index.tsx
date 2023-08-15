import { defineComponent } from "vue";
import { ParamManagerV2 } from "inl-ui/dist/components";

/**
 * 参数管理 - 应用页
 */
const ParamProduction = defineComponent({
  props: {
    id: {
      type: String,
      required: true,
    },
  },
  setup(props) {
    return () => (
      <div class="param-production">
        <ParamManagerV2 rootId={props.id} />
      </div>
    );
  },
});

export default ParamProduction;
