import {
  defineComponent,
  ref,
  computed,
  nextTick,
} from 'vue';
import { FormOutlined } from '@ant-design/icons-vue';

export default defineComponent({
  props: {
    /**
     * 标题（v-model）
     */
    title: {
      type: String,
      default: '',
    },
  },
  emits: ['update:title'],
  setup(props, { emit }) {
    // 编辑状态
    const editing = ref(false);
    // 输入框
    const inputRef = ref();
    const titleValue = computed({
      get() {
        return props.title;
      },
      set(val) {
        emit('update:title', val);
      },
    });
    // 编辑
    const edit = () => {
      editing.value = true;
      nextTick(() => {
        inputRef.value.select();
      });
    };
    // 完成
    const done = () => {
      editing.value = false;
    };
    
    return () => (
      <div class="topo-detail-title">
        {editing.value ? (
          <a-input
            ref={inputRef}
            v-model={[titleValue.value, 'value']}
            size="small"
            max-length={20}
            onBlur={done}
            onPressEnter={done}
          ></a-input>
        ) : (
          <div class="topo-detail-title-result">
            <strong onDblclick={edit}>{titleValue.value}</strong>
            <FormOutlined
              title="编辑"
              class="icon"
              onClick={edit}
            ></FormOutlined>
          </div>
        )}
      </div>
    );
  },
});
