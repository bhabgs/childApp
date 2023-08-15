import { defineComponent } from 'vue';
import Index from './index';

export default defineComponent({
  setup() {
    return () => <Index type="process_connect"></Index>;
  },
});
