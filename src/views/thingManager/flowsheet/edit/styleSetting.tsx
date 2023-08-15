import {
  defineComponent,
  ref,
  watch,
  computed,
} from 'vue';
import {
  map,
  find,
  isUndefined,
  values,
} from 'lodash';
import { getLineInfo, getLineWidth, setLineWidth } from '@/views/thingManager/flowChartConfiguration/ke';
import ColorPicker from "./colorPicker";
import Block from './block';
import { lineOptions } from '../lineOptions';

export default defineComponent({
  props: {
    type: {
      type: String,
      default: 'device_connect',
    },
    /**
     * 图中选中的内容
     */
    selected: {
      type: Object,
      default: null,
    },
    /**
     * 主题
     */
    theme: {
      type: String,
      default: 'dark',
    },
    /**
     * 编辑器实例
     */
    editor: {
      type: Object,
      default: null,
    },
  },
  setup(props, { expose }) {
    interface Option {
      /**
       * 标签
       */
      label: string;
      /**
       * 值
       */
      value: string;
      /**
       * 颜色
       */
      color?: string;
      /**
       * 类型
       */
      type?: string;
      /**
       * dotted
       */
      dotted?: number[];
    };
    const colorMapping: Option[] = values(lineOptions);
    const lineAnimation: Option[] = [{
      label: '水珠流动',
      value: 'default',
      type: 'ani',
    }];
    const styles = computed(() => {
      if (props.selected.type === 'Arrow' || props.selected.type === 'line') {
        const re = [
          { label: '线宽', type: 'lineWidth', key: 'lineWidth' },
          { label: '线条颜色', type: 'lineColor', key: 'lineColor', option: colorMapping },
        ];
        if (props.type === 'device_connect') {
          re.push({ label: '动画效果', type: 'animateType', key: 'animateType', option: lineAnimation });
        }
        return re;
      }
      if (props.selected.type === 'Text') {
        return [
          { label: '文本颜色', type: 'color', key: 'fill' },
          { label: '字号', type: 'number', key: 'fontSize' },
          { label: '文本', type: 'text', key: 'text' },
        ];
      }
      if (props.selected.type === 'Rect') {
        return [
          { label: '填充颜色', type: 'color', key: 'fill' },
          { label: '边框颜色', type: 'color', key: 'stroke' },
          { label: '边框宽度', type: 'number', key: 'strokeWidth' },
        ];
      }
      return null;
    });
    const update = (key, val) => {
      props.selected.event.target.setAttr(key, val);
    };
    const isShowLabel = ref(false);
    const getShowLabel = () => {
      if (props.selected.type === 'thingText') {
        const {
          event: {
            parent: {
              attrs: {
                name,
                cdata: {
                  thingTextInfo: {
                    showLabel
                  },
                },
              },
            },
          },
        } = props.selected;
        if (!isUndefined(showLabel)) {
          isShowLabel.value = showLabel
        } else {
          isShowLabel.value = name !== 'thingDefTextGroup'
        }
      }
    };
    const toggleShowLabel = () => {
      const {
        data: { iu },
        event: {
          parent: {
            attrs: {
              cdata: {
                propertyId,
              },
            },
          },
        },
      } = props.selected;
      const val = !isShowLabel.value;
      props.editor.changeLabel(iu, propertyId, val);
      isShowLabel.value = val;
    };
    const textScale = ref(100);
    const getTextScale = () => {
      let s;
      if (props.selected.event.parent.attrs.name === 'thingDefTextGroup') {
        s = props.selected.event.target.attrs.scaleX;
      } else {
        s = props.selected.event.parent.attrs.scaleX;
      }
      if (s) {
        textScale.value = s * 100;
      } else {
        textScale.value = 100;
      }
    };
    const onTextScaleChange = (val) => {
      const v = val / 100;
      let group;
      if (props.selected.event.parent.attrs.name === 'thingDefTextGroup') {
        group = props.selected.event.target;
      } else {
        group = props.selected.event.parent;
      }
      if (group) {
        group.scale({
          x: v,
          y: v,
        });
      }
      getTextScale();
    };
    watch(() => props.selected, () => {
      getShowLabel();
      getTextScale();
    }, { immediate: true });
    const getItemValue = (key) => {
      return props.selected.event.target.attrs[key];
    };
    const line = computed(() => {
      const { type, event: { parent } } = props.selected;
      if (type === 'line') {
        const finded = find(parent.children, (child) => child.name() === 'line');
        if (finded) {
          return finded;
        }
        return null;
      }
      return null;
    });
    const getAnimateType = (item) => {
      let value = 'default';
      if (line.value) {
        value = getLineInfo(line.value)['animateType'] || value;
      }
      return find(item.option, { value }).label;
    };
    const getLineWidthValue = () => {
      return getLineWidth(line.value);
    };
    const handleChangeLineWidth = (val) => {
      setLineWidth(line.value, val);
    };
    const getLineColor = (item) => {
      let value = 'CLEAN_COAL';
      if (line.value) {
        value = line.value?.attrs?.cdata?.lineInfo?.state || value;
      }
      return find(item.option, { value }).label;
    };
    const handleChangeLineColor = (val, { color, dotted }) => {
      props.editor.updateLineOption(line.value, val, {
        color,
        dotted,
      });
    };
    const renderContent = (item) => {
      if (item.type === 'lineWidth') {
        return (
          <a-input-number
            class="wf"
            min={1}
            value={getLineWidthValue()}
            onChange={handleChangeLineWidth}
          ></a-input-number>
        );
      }
      if (item.type === 'lineColor') {
        return (
          <a-select
            options={item.option}
            value={getLineColor(item)}
            onChange={handleChangeLineColor}
            v-slots={{
              option: (e) => (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                }}>
                  {item.key === 'stroke' && (
                    <div style={{
                      width: '10px',
                      height: '10px',
                      marginRight: '8px',
                      backgroundColor: e.color,
                    }}></div>
                  )}
                  <div>{e.label}</div>
                </div>
              ),
            }}
          ></a-select>
        );
      }
      if (item.type === 'animateType') {
        return (
          <a-select
            options={item.option}
            value={getAnimateType(item)}
            v-slots={{
              option: (e) => (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                }}>{e.label}</div>
              ),
            }}
          ></a-select>
        );
      }
      if (item.type === 'color') {
        return (
          <ColorPicker
            style="font-size: 12px;"
            color={getItemValue(item.key)}
            onUpdate={(val) => update(item.key, val)}
          ></ColorPicker>
        );
      }
      if (item.type === 'number') {
        return (
          <a-input-number
            class="wf"
            min={0}
            value={getItemValue(item.key)}
            onUpdate:value={(val) => update(item.key, val)}
          ></a-input-number>
        );
      }
      if (item.type === 'text') {
        return (
          <a-input
            value={getItemValue(item.key)}
            onUpdate:value={(val) => update(item.key, val)}
          ></a-input>
        );
      }
    };

    expose({
      getTextScale,
    });

    return () => (styles.value || props.selected.type === 'thingText') && (
      <Block title="外观和文本">
        <a-form label-col={{ style: { width: '70px' } }}>
          {map(styles.value, (item) => (
            <a-form-item label={item.label} class="flex">
              {renderContent(item)}
            </a-form-item>
          ))}
        </a-form>
        {props.selected.type === 'thingText' && (
          <a-form>
            <a-form-item label="是否显示属性名">
              <a-switch
                checked-children="是"
                un-checked-children="否"
                checked={isShowLabel.value}
                onUpdate:checked={() => toggleShowLabel()}
              ></a-switch>
            </a-form-item>
            <a-form-item label="缩放比例">
              <a-input-number
                value={textScale.value}
                min={0.01}
                precision={2}
                addon-after="%"
                onUpdate:value={(val) => onTextScaleChange(val)}
              ></a-input-number>
            </a-form-item>
          </a-form>
        )}
      </Block>
    );
  },
});
