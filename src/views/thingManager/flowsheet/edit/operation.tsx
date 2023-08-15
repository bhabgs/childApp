import {
  defineComponent,
  ref,
  computed,
  watch,
} from 'vue';
import { message } from 'ant-design-vue';
import { QuestionCircleOutlined } from '@ant-design/icons-vue';
import {
  map,
  find,
  filter,
  includes,
  values,
} from 'lodash';
import LayoutSetting from './layoutSetting';
import LayoutOptions from './layoutOptions';
import StyleSetting from './styleSetting';
import OperationTree from './operationTree';
import Edit from './edit';
import type { Theme } from '@/components/editor';
import { findEventListByThingCode, saveEventListByThingCode } from '@/api/topoMap';
import { saveTopoMapThingPropertyTemplate } from '@/api/topoThingProperty';
import Block from './block';
import { useTopoMap } from '../useTopoMap';

export interface OperationExpose {
  /**
   * 获取事件模板
   */
  getEventsTemplate: (string) => Promise<any>;
  /**
   * 设置缩放比例
   */
  getScale: () => void;
}

export default defineComponent({
  props: {
    type: {
      type: String,
      default: 'device_connect',
    },
    /**
     * 主题（v-model）
     */
    theme: {
      type: String as () => Theme,
      default: 'dark',
    },
    /**
     * 画布宽度（v-model）
     */
    width: {
      type: Number,
      default: 1920,
    },
    /**
     * 画布高度（v-model）
     */
    height: {
      type: Number,
      default: 1080,
    },
    /**
     * 编辑器实例
     */
    editor: {
      type: Object,
      default: null,
    },
    /**
     * 图中选中的内容
     */
    selected: {
      type: Object,
      default: null,
    },
    /**
     * 生产回放（v-model）
     */
    playBackEnable: {
      type: Boolean,
      default: false,
    },
    /**
     * 设为主图（v-model）
     */
    mainMapFlag: {
      type: Boolean,
      default: false,
    },
    thingMap: {
      type: Object,
      default: () => ({}),
    },
  },
  emits: [
    'update:theme',
    'update:width',
    'update:height',
    'update:playBackEnable',
    'update:mainMapFlag',
    'instanceUpdate',
    'templateUpdate',
  ],
  setup(props, { emit, expose }) {
    // 当前 Tab 激活
    const active = ref('style');

    const themeComputed = computed({
      get() {
        return props.theme;
      },
      set(val) {
        emit('update:theme', val);
      },
    });

    const changeSize = ({ width, height }) => {
      props.editor.setField(width, height);
    };

    const widthComputed = computed({
      get() {
        return props.width;
      },
      set(width) {
        emit('update:width', width);
        changeSize({
          width,
          height: props.height,
        });
      },
    });

    const heightComputed = computed({
      get() {
        return props.height;
      },
      set(height) {
        emit('update:height', height);
        changeSize({
          width: props.width,
          height,
        });
      },
    });

    const playBackEnableComputed = computed({
      get() {
        return props.playBackEnable;
      },
      set(val) {
        emit('update:playBackEnable', val);
      },
    });

    const mainMapFlagComputed = computed({
      get() {
        return props.mainMapFlag;
      },
      set(val) {
        emit('update:mainMapFlag', val);
      },
    });

    const { getTextInfo } = useTopoMap();

    // 计算当前选中的物实例的属性模板
    const proptypeData = computed(() => {
      const {
        data: { iu },
        type,
        event: { parent: { attrs: { cdata: { thing: { tc } } } } },
      } = props.selected;
      if ((type === 'thing' || type === 'line') && iu) {
        if (props.thingMap[tc]) {
          return values(props.thingMap[tc].thingPropertyEntityList);
        }
        return [];
      }
      return [];
    });

    // 勾选了某些属性
    const onProptypeAdd = (list) => {
      const {
        data: { iu },
        event: { parent: { attrs: { cdata: { thing: { tc } } } } },
        type,
      } = props.selected;
      const { batchAddText } = props.editor.createThingText(iu, type);
      if (batchAddText) {
        getTextInfo(tc, iu, list).then((infos) => {
          console.log(infos);
          batchAddText(infos);
        });
      }
    };

    // 取消勾选了某些属性
    const onProptypeRemove = (list) => {
      const { data: { iu } } = props.selected;
      props.editor.removeText(iu, list);
    };

    // 保存属性模板（更新按钮）
    const saveProptypes = () => {
      const {
        event: {
          parent: { attrs: { cdata: { thing: { tc } } } },
          parent,
        },
      } = props.selected;
      const proptypeList = props.editor.getChildrens(parent.id());
      saveTopoMapThingPropertyTemplate(map(proptypeData.value, ({ id, thingCode }) => {
        const finded = find(proptypeList, ['info.id', id]);
        if (finded) {
          const { info, position } = finded;
          return {
            thingCode,
            thingPropertyId: id,
            style: {
              position,
              showLabel: info.showLabel,
            },
            chooseState: true,
          };
        }
        return {
          thingCode,
          thingPropertyId: id,
          style: null,
          chooseState: false,
        };
      })).then(() => {
        message.success('保存成功');
        emit('templateUpdate', tc);
      });
    };

    const onShowCardChange = (check) => {
      props.editor.setAttrs(props.selected.event.parent, { showCard: check });
    };
    const eventsData = ref<any[]>([]);
    const eventsChecked = ref<string[]>([]);
    const getEventsTemplate = (tc: string) => new Promise((resolve) => {
      findEventListByThingCode(tc).then(({ data }) => {
        eventsData.value = data;
        eventsChecked.value = map(filter(data, 'eventEnable'), 'id');
      });
    });
    const onEventsCheck = (checkedKeys) => {
      eventsChecked.value = checkedKeys;
    };
    const saveEvents = () => {
      saveEventListByThingCode(map(eventsData.value, (item) => ({
        ...item,
        eventEnable: includes(eventsChecked.value, item.id),
      }))).then(() => {
        message.success('保存成功');
      });
    };

    const validSelect = computed(() => (
      props.selected
      && (
        props.selected.type === 'thing'
        || props.selected.type === 'line'
      )
      && props.selected.data.iu
    ));

    watch(() => validSelect.value, (valid) => {
      if (!valid) {
        active.value = 'style';
      }
    });

    const onInstanceUpdate = (thing) => {
      emit('instanceUpdate', thing);
    };

    const styleSetting = ref();
    const layoutOptions = ref();

    const getScale = () => {
      if (styleSetting.value) {
        styleSetting.value.getTextScale();
      }
      if (layoutOptions.value) {
        layoutOptions.value.getThingScale();
      }
    };

    expose({
      getEventsTemplate,
      getScale,
    });

    return () => (!props.selected || props.selected.type === 'stage' || props.selected.data?.attrs?.name === 'field') ? (
      <a-tabs active-key="map" class="topo-detail-operation-tabs" centered>
        <a-tab-pane key="map" tab="流程图设置">
          <div class="topo-detail-operation">
            <Block title="画布">
              <a-form>
                <a-form-item label="画布主题">
                  <a-select v-model:value={themeComputed.value}>
                    <a-select-option value="light">
                      <div class="topo-detail-theme-option">
                        <i style={{ backgroundColor: '#EDF5FC' }}></i>
                        <span>浅色主题</span>
                      </div>
                    </a-select-option>
                    <a-select-option value="dark">
                      <div class="topo-detail-theme-option">
                        <i style={{ backgroundColor: '#000F37' }}></i>
                        <span>深色主题</span>
                      </div>
                    </a-select-option>
                  </a-select>
                </a-form-item>
                <a-form-item label="画布宽度">
                  <a-input-number
                    class="topo-detail-operation-input-number"
                    v-model:value={widthComputed.value}
                  ></a-input-number>
                </a-form-item>
                <a-form-item label="画布高度">
                  <a-input-number
                    class="topo-detail-operation-input-number"
                    v-model:value={heightComputed.value}
                  ></a-input-number>
                </a-form-item>
              </a-form>
            </Block>
            <Block title="功能">
              <a-form>
                <a-form-item label="生产回放">
                  <a-switch v-model:checked={playBackEnableComputed.value}></a-switch>
                </a-form-item>
                <a-form-item label="设为主图">
                  <a-switch v-model:checked={mainMapFlagComputed.value}></a-switch>
                </a-form-item>
              </a-form>
            </Block>
          </div>
        </a-tab-pane>
      </a-tabs>
    ) : (
      <a-tabs v-model={[active.value, 'activeKey']} class="topo-detail-operation-tabs" centered>
        <a-tab-pane key="style" tab="样式">
          <div class="topo-detail-operation">
            {/* 对齐与排列 */}
            {(props.selected.type !== 'Arrow' && props.selected.type !== 'line') && (
              <LayoutSetting
                selected={props.selected}
                onClick={(type) => { props.editor.changeElementsPosition(type) }}
              ></LayoutSetting>
            )}
            <LayoutOptions
              ref={layoutOptions}
              editor={props.editor}
              selected={props.selected}
            ></LayoutOptions>
            <StyleSetting
              ref={styleSetting}
              type={props.type}
              selected={props.selected}
              theme={themeComputed.value}
              editor={props.editor}
            ></StyleSetting>
          </div>
        </a-tab-pane>
        {validSelect.value && (
          <>
            <a-tab-pane key="display" tab="显示">
              <div class="topo-detail-operation topo-detail-proptype">
                <OperationTree
                  list={proptypeData.value}
                  checked={props.selected.data.ids}
                  onAdd={onProptypeAdd}
                  onRemove={onProptypeRemove}
                ></OperationTree>
                <div class="tac">
                  <a-button type="primary" onClick={saveProptypes}>
                    <span>保存为默认配置</span>
                    <a-tooltip
                      title="保存为该物模型的标准显示样式，拖入画布中的同模型组件均以此排列方式显示"
                      get-popup-container={(n) => n}
                    >
                      <QuestionCircleOutlined></QuestionCircleOutlined>
                    </a-tooltip>
                  </a-button>
                </div>
              </div>
            </a-tab-pane>
            <a-tab-pane key="event" tab="事件">
              <div class="topo-detail-operation topo-detail-proptype">
                <a-form>
                  <a-form-item label="是否响应点击事件" style="margin-bottom: 0;">
                    <a-switch
                      checked={props.selected.event.parent.attrs.cdata.thing.showCard}
                      checked-children="是"
                      un-checked-children="否"
                      onChange={onShowCardChange}
                    ></a-switch>
                  </a-form-item>
                </a-form>
                <OperationTree
                  list={eventsData.value}
                  checked={eventsChecked.value}
                  onCheck={onEventsCheck}
                ></OperationTree>
                <div class="tac">
                  <a-button type="primary" onClick={saveEvents}>
                    <span>保存为默认配置</span>
                    <a-tooltip
                      title="保存为该物模型的标准弹窗样式，预览画面弹窗中的属性均为此数量显示"
                      get-popup-container={(n) => n}
                    >
                      <QuestionCircleOutlined></QuestionCircleOutlined>
                    </a-tooltip>
                  </a-button>
                </div>
              </div>
            </a-tab-pane>
            <a-tab-pane key="attribute" tab="属性">
              <div class="topo-detail-operation topo-detail-proptype">
                <Edit selected={props.selected} onUpdate={onInstanceUpdate}></Edit>
              </div>
            </a-tab-pane>
          </>
        )}
      </a-tabs>
    );
  },
});
