import { defineComponent, ref, watch } from 'vue';
import { map } from 'lodash';
import Block from './block';

export default defineComponent({
  props: {
    editor: {
      type: Object,
      default: null,
    },
    selected: {
      type: Object,
      default: null,
    },
  },
  setup(props, { expose }) {
    const layouts = {
      thing: [
        { label: '横坐标', type: 'x' },
        { label: '纵坐标', type: 'y' },
        { label: '角度', type: 'rotation' },
        { label: '缩放比例', type: 'scale' },
      ],
      Image: [
        { label: '横坐标', type: 'x' },
        { label: '纵坐标', type: 'y' },
        { label: '角度', type: 'rotation' },
      ],
      Rect: [
        { label: '横坐标', type: 'x' },
        { label: '纵坐标', type: 'y' },
        { label: '宽度', type: 'width', min: 1 },
        { label: '高度', type: 'height', min: 1 },
        { label: '角度', type: 'rotation' },
        { label: '圆角', type: 'cornerRadius' },
      ],
    };
    const onchange = (type, val) => {
      props.selected.event.target.setAttr(type, val);
    };
    const thingScale = ref(100);
    const getThingScale = () => {
      const {
        componentName,
        scaleX,
        cdata,
      } = props.selected.event.target.attrs;
      let s;
      if (componentName === 'Scraper' || componentName === 'BELT') {
        s = cdata?.scale || 1;
      } else {
        s = Math.abs(scaleX);
      }
      if (s) {
        thingScale.value = s * 100;
      } else {
        thingScale.value = 100;
      }
    };
    const onThingScaleChange = (val) => {
      const { tc, iu } = props.selected.event.parent.attrs.cdata.thing;
      const v = val / 100;
      if (tc == 'SCRAPER' || tc === 'BELT') {
        props.editor.setComponentScale(iu, v);
      } else {
        const { scaleX, scaleY } = props.selected.event.target.attrs;
        const x = scaleX < 0 ? -v : v;
        const y = scaleY < 0 ? -v : v;
        props.selected.event.target.scale({
          x,
          y,
        });
      }
      getThingScale();
    };
    expose({
      getThingScale,
    });

    watch(() => props.selected, () => {
      getThingScale();
    }, { immediate: true });

    return () => layouts[props.selected.type] && (
      <Block title="布局">
        <a-form label-col={{ span: 8 }} wrapper-col={{ span: 16 }}>
          {map(layouts[props.selected.type], (item) => (
            <a-form-item label={item.label} class="flex">
              {item.type === 'scale' ? (
                <a-input-number
                  value={thingScale.value}
                  min={10}
                  precision={2}
                  addon-after="%"
                  onUpdate:value={(val) => onThingScaleChange(val)}
                ></a-input-number>
              ) : (
                <a-input-number
                  class="topo-detail-operation-input-number"
                  min={item.min}
                  precision={1}
                  value={props.selected.event.target.attrs[item.type] || 0}
                  onChange={(val) => onchange(item.type, val)}
                ></a-input-number>
              )}
            </a-form-item>
          ))}
        </a-form>
      </Block>
    );
  },
});
