import {
  defineComponent,
  ref,
  onMounted,
  onUnmounted,
} from 'vue';
import { LeftOutlined, RightOutlined } from '@ant-design/icons-vue';
import { useIntervalFn } from '@vueuse/core';
import dayjs from 'dayjs';

export default defineComponent({
  props: {
    list: {
      type: Array,
      default: [],
    },
  },
  setup(props) {
    const index = ref(0);
    const prev = () => {
      if (index.value === 0) {
        index.value === props.list.length - 1;
      } else {
        index.value -= 1;
      }
    };
    const next = () => {
      if (index.value === props.list.length - 1) {
        index.value = 0;
      } else {
        index.value += 1;
      }
    };
    const to = (i) => {
      index.value = i;
    };
    const { pause, resume } = useIntervalFn(() => {
      next();
    }, 15000);
    onMounted(() => {
      index.value = 0;
    });
    return () => props.list.length > 0 && (
      <div class="topo-preview-camera" onMouseenter={pause} onMouseleave={resume}>
        {props.list.length >= 1 && (
          <ul class="topo-preview-dots">
            {props.list.map((item, i) => (
              <li
                class={{ 'is-active': i === index.value }}
                onClick={() => to(i)}
              ></li>
            ))}
          </ul>
        )}
        <inl-video-box-v2
          camera={props.list[index.value]}
          btns={["fill", "look", "stream", "direction", "fullScreen"]}
        ></inl-video-box-v2>
      </div>
    );
  },
});
