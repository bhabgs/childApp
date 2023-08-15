import { defineComponent } from "vue";

export default defineComponent({
  setup() {
    return () => (
      <div class="process-map">
        <div class="process-left"></div>
        <div class="process-center"></div>
        <div class="process-right"></div>
      </div>
    );
  },
});
