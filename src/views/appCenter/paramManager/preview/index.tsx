import { defineComponent } from "vue";
import { ParamManagerV2 } from "inl-ui/dist/components";

const ParamPreview = defineComponent({
  props: {
    id: {
      type: String,
      required: true,
    },
  },
  setup(props, { emit }) {
    return () => (
      <div class="param-preview">
        <ParamManagerV2 rootId={props.id} hideEdit />
      </div>
    );
  },
});

export default ParamPreview;
