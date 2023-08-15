import { defineComponent } from 'vue';

export default defineComponent({
  props: {
    /**
     * 标题
     */
    title: {
      type: String,
      default: '',
    },
  },
  setup(props, { slots }) {
    return () => (
      <div class="topo-block">
        <div class="topo-block-title">{props.title}</div>
        <div class="topo-block-content">
          {slots.default && slots.default()}
        </div>
      </div>
    );
  },
});
