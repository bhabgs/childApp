import {
  defineComponent,
  ref,
  shallowRef,
  onMounted,
  computed,
  watch,
} from "vue";
import {
  uniqueId,
  each,
  debounce,
  random,
  includes,
  merge,
  keyBy,
  size,
  toPairs,
  isUndefined,
} from "lodash";
import {
  Button,
  Dropdown,
  Menu,
  MenuItem,
} from 'ant-design-vue';
import { useFullscreen, useElementSize } from '@vueuse/core';
import { IconFont } from 'inl-ui/dist/components';
import {
  FullscreenOutlined,
  BorderOutlined,
  FontSizeOutlined,
} from "@ant-design/icons-vue";
import Konva from 'konva';
import {
  getThingChildPosition,
  setThingChildPosition,
  COALANIM,
  Animate,
  getLineInfo,
  StoreHouse,
  getLayer,
  setCustomAttrs,
  inleditor as Editor,
  type Theme,
  type DrawState as State,
} from '@/views/thingManager/flowChartConfiguration/ke';
import { BELT, Scraper } from '@/views/thingManager/flowChartConfiguration/ke/component';
import './index.less';
import pipeSvg from './pipe.svg';
import lineSvg from './line.svg';

import { commonComponent, storeHouseComponent } from './thingConfig';

export {
  type Editor,
  type Theme,
  type State,
};

export interface SelectedInterface {
  /**
   * 类型
   */
  type: 'thing' | 'shape' | 'thingText' | 'stage' | string;
  /**
   * 事件
   */
  event: {
    target: any,
    parent?: any,
  };
  /**
   * 数据
   */
  data?: {
    /**
     * 物实例 ID（iu）
     */
    iu?: string;
    /**
     * 属性 Code 数组
     */
    codes?: string[];
    /**
     * 属性 ID 数组
     */
    ids?: string[];
    /**
     * 属性
     */
    attrs?: any;
  };
}

type Selected = SelectedInterface | null;

export default defineComponent({
  name: "FlowchatPreview",
  props: {
    /**
     * 类型
     */
    type: {
      type: String,
      default: 'device_connect',
    },
    /**
     * 主题
     */
    theme: {
      type: String as () => Theme,
      default: 'dark',
    },
    /**
     * 预览状态
     */
    preview: {
      type: Boolean,
      default: false,
    },
    /**
     * 是否显示全屏按钮
     */
    showFullscreenButton: {
      type: Boolean,
      default: false,
    },
    fullscreenContainer: {
      default: null,
    },
    /**
     * 选中内容（v-model 只读）
     */
    selected: {
      type: Object as () => Selected,
      default: null,
    },
    /**
     * 是否显示工具栏
     */
    showTools: {
      type: Boolean,
      default: false,
    },
    lineAnimateSpeed: {
      type: Number,
      default: 20,
    },
  },
  emits: [
    'drop',
    'update:selected',
    'select',
    'thingChange',
    'lineCreated',
    'transform',
  ],
  setup(props, { emit, expose, slots }) {
    let init = false;
    const contentRef = ref();
    const fc = props.fullscreenContainer || contentRef.value;
    const { isFullscreen, toggle } = useFullscreen(fc, {
      autoExit: true,
    });
    const { width, height } = useElementSize(contentRef);
    const debounceSizeChange = debounce(() => {
      if (init && editor.value) {
        editor.value.render({
          width: width.value,
          height: height.value,
        });
      }
    }, 300);
    watch(() => width.value, (val, oldVal) => {
      if (val !== oldVal) {
        debounceSizeChange();
      }
    });
    watch(() => height.value, (val, oldVal) => {
      if (val !== oldVal) {
        debounceSizeChange();
      }
    });

    const editorId: string = `mt_editor_${uniqueId()}`;
    const editor = shallowRef<Editor>();

    const selectedRef = computed({
      get() {
        return props.selected;
      },
      set(val) {
        emit("update:selected", val);
        emit("select", val);
      },
    });

    const bindSelect = () => {
      if (editor.value) {
        editor.value.onselect((type, event, data) => {
          selectedRef.value = {
            type,
            event,
            data,
          };
        });
      }
    };

    const fit = () => {
      if (editor.value) {
        editor.value.toFit();
      }
    };

    const state = ref('default');

    const setDrawState = (value: State = 'default') => {
      if (editor.value) {
        editor.value.setDrawState(value);
        state.value = value;
      }
    };

    onMounted(() => {
      editor.value = new Editor({
        id: editorId,
        scale: props.preview ? 'hide' : 'show',
        isPreview: props.preview,
        onDropCb(thingInfo, p) {
          if (editor.value) {
            setDrawState();
            const stage = editor.value.getStage();
            const { tc, iu } = thingInfo;
            if (tc === 'BELT') {
              editor.value.componentArr.push(new BELT(stage, { thingInfo, p }));
            } else if (tc === 'SCRAPER') {
              editor.value.componentArr.push(new Scraper(stage, { thingInfo, p }));
            } else if (includes(storeHouseComponent, tc)) {
              editor.value.getComponent<StoreHouse>('StoreHouse').add(thingInfo, p);
            }
            const group = findGroup(iu);
            emit("drop", {
              thingInfo,
              p,
              group,
            });
            emit('thingChange', getThings());
          }
        },
        onRemoveCb() {
          selectedRef.value = null;
          emit('thingChange', getThings());
        },
        onCreateLineCb(lineId) {
          if (editor.value) {
            const stage = editor.value.getStage();
            const arrows = stage.find(`#${lineId}`);
            if (arrows && arrows.length) {
              emit('lineCreated', arrows[0]);
            }
          }
        },
        onTransform() {
          emit('transform');
        },
      });
    });

    const loadJson = (data) => new Promise((resolve) => {
      editor.value?.loadJson(data, () => {
        init = true;
        bindSelect();
        resolve(true);
        emit('thingChange', getThings());
        editor.value?.onDrawStateChange((value) => {
          if (value === 'default') {
            state.value = 'default';
          }
          return {};
        });
        editor.value?.changeTheme(props.theme);
      });
    });

    const getChildrens = (id) => {
      if (editor.value) {
        return getThingChildPosition(editor.value.getStage(), id);
      }
      return [];
    };

    const changeElementsPosition = (type) => {
      if (editor.value) {
        editor.value.changeElementsPosition(type);
      }
    };

    const setChildrens = (id, list) => {
      setTimeout(() => {
        if (editor.value && list.length) {
          setThingChildPosition(
            editor.value,
            id,
            editor.value.getTheme(),
            list,
          );
        }
      }, 300);
    };

    const setAttrs = (group, data) => {
      const mergeData = merge({ ...group.attrs.cdata.thing }, data);
      setCustomAttrs(group, {
        thing: mergeData,
      });
    };

    const toJson = (source) => editor.value?.toJson(source);

    const createThingText = (iu, type) => editor.value?.createThingText(iu, type);

    const createLineText = (iu, id) => editor.value?.createLineText(iu, id);

    const removeText = (iu, list) => editor.value?.removeText(iu, list);

    const updateLineOption = (selected, value, option) => {
      editor.value?.updateLineOption(selected, value, option);
    }

    const getThings = () => editor.value!.getAllIus();

    const getNodesAndEdges = () => {
      if (editor.value) {
        const nodes = getLayer(editor.value.getStage(), 'thing').getChildren();
        const edges = getLayer(editor.value.getStage(), 'line').getChildren();
        return { nodes, edges };
      }
      return {
        nodes: [],
        edges: [],
      };
    };

    const setTextValue = (iu, id, value) => editor.value?.setVal(iu, id, value);

    const setTextValues = (list) => {
      each(list, ({
        thingInstId,
        thingPropertyId,
        value,
        displayValue,
      }) => {
        if (thingInstId && thingPropertyId) {
          const v = displayValue ?? value ?? '--';
          setTextValue(thingInstId, thingPropertyId, v);
        }
      });
    };

    const isTextGroup = (group) => (
      group?.attrs?.name === 'thingDefTextGroup'
      || group?.attrs?.name === 'thingTextGroup'
      || group?.attrs?.name === 'thingInputGroup'
      || group?.attrs?.name === 'thingSwitchGroup'
      || group?.attrs?.name === 'thingButtonGroup'
    );

    const resetValues = (thingMap) => {
      const { nodes, edges } = getNodesAndEdges();
      const toResetProperty: any[] = [];
      each([...nodes, ...edges], (layer) => {
        if (layer.attrs.name === 'thingGroup' && layer.attrs?.cdata?.thing?.iu) {
          const {
            children,
            attrs: { cdata: { thing: { tc, iu } } },
          } = layer;
          if (thingMap[tc]) {
            const {
              animationTypeAndPropertyId,
              thingPropertyEntityList,
              powerOffImage,
            } = thingMap[tc];
            each(children, (propGroup) => {
              if (isTextGroup(propGroup)) {
                const { attrs: { name, cdata: { propertyId, thingTextInfo } } } = propGroup;
                if (thingPropertyEntityList && thingPropertyEntityList[propertyId]) {
                  const {
                    displayLabel,
                    unit,
                    code,
                  } = thingMap[tc].thingPropertyEntityList[propertyId];
                  let showLabel;
                  if (!isUndefined(thingTextInfo.showLabel)) {
                    ({ showLabel } = thingTextInfo);
                  } else {
                    showLabel = name !== 'thingDefTextGroup';
                  }
                  toResetProperty.push({
                    iu,
                    propertyId,
                    type: 'thingTextGroup',
                    info: {
                      id: propertyId,
                      label: displayLabel,
                      v: '--',
                      unit,
                      code,
                      showLabel,
                    },
                  });
                }
              }
            });
            setTimeout(() => {
              if (animationTypeAndPropertyId && size(animationTypeAndPropertyId)) {
                each(animationTypeAndPropertyId, (thingPropertyId, animationId) => {
                  if (animationId === '1' && powerOffImage) {
                    setNodeState(tc, iu, 0, powerOffImage);
                  } else if (animationId === '2') {
                    setNodeLevel(iu, 0);
                  }
                });
              }
            }, 100);
          }
        }
      });
      editor.value?.resetTexts(toResetProperty);
    };

    const resetTexts = (values, thingMap) => {
      const valueMap = keyBy(values, ({ thingInstId, thingPropertyId }) => `${thingInstId}.${thingPropertyId}`);
      const { nodes, edges } = getNodesAndEdges();
      const toResetProperty: any[] = [];
      each([...nodes, ...edges], (layer) => {
        if (layer.attrs.name === 'thingGroup' && layer.attrs?.cdata?.thing?.iu) {
          const {
            children,
            attrs: { cdata: { thing: { tc, iu } } },
          } = layer;
          if (thingMap[tc]) {
            each(children, (propGroup) => {
              if (isTextGroup(propGroup)) {
                const { attrs: { name, cdata: { propertyId, thingTextInfo } } } = propGroup;
                if (thingMap[tc] && thingMap[tc].thingPropertyEntityList
                  [propertyId]) {
                  const {
                    displayLabel,
                    unit,
                    code,
                    displayType,
                    listInfo,
                    listType,
                  } = thingMap[tc].thingPropertyEntityList[propertyId];
                  let v = '--';
                  if (valueMap[`${iu}.${propertyId}`]) {
                    const { displayValue, value } = valueMap[`${iu}.${propertyId}`];
                    v = displayValue ?? value ?? '--';
                  }
                  let listInfoJson = null;
                  if (listType === 'json' && listInfo) {
                    try {
                      listInfoJson = JSON.parse(listInfo);
                    } catch {
                      console.warn(`${iu} ${code} ${displayLabel} 值转换出错`);
                    }
                  }
                  let showLabel;
                  if (!isUndefined(thingTextInfo.showLabel)) {
                    ({ showLabel } = thingTextInfo);
                  } else {
                    showLabel = name !== 'thingDefTextGroup';
                  }
                  const info = {
                    id: propertyId,
                    label: displayLabel,
                    v,
                    unit,
                    code,
                    showLabel,
                  };
                  if (
                    displayType === 'button_status'
                    && listInfoJson
                    && size(listInfoJson) === 1
                  ) {
                    const [[, label]] = toPairs(listInfoJson);
                    toResetProperty.push({
                      iu,
                      propertyId,
                      type: 'thingButtonGroup',
                      info: {
                        ...info,
                        btns: [label],
                      },
                    });
                  } else if (
                    // false &&
                    displayType === 'switch'
                    && listInfoJson
                    && size(listInfoJson) === 2
                  ) {
                    const [
                      [unCheckedValue, unCheckedLabel],
                      [checkedValue, checkedLabel],
                    ] = toPairs(listInfoJson);
                    toResetProperty.push({
                      iu,
                      propertyId,
                      type: 'thingSwitchGroup',
                      info: {
                        ...info,
                        switchOpt: {
                          checkedLabel,
                          checkedValue,
                          unCheckedLabel,
                          unCheckedValue,
                        },
                      },
                    });
                  } else if (displayType === 'button_parameter') {
                    toResetProperty.push({
                      iu,
                      propertyId,
                      type: 'thingInputGroup',
                      info: {
                        ...info,
                        btns: ['下发'],
                      },
                    });
                  } else {
                    toResetProperty.push({
                      iu,
                      propertyId,
                      type: 'thingTextGroup',
                      info,
                    });
                  }
                } else {
                  propGroup.destroy();
                }
              }
            });
          }
        }
      });
      editor.value?.resetTexts(toResetProperty);
    };

    let animate = true;
    const beltAnimates = {};
    const setNodeState = async (tc, iu, state, img) => {
      if (editor.value && !includes(storeHouseComponent, tc)) {
        await editor.value.setThingState(iu, state, img);
        if (tc === 'BELT') {
          if (Number(state) === 1) {
            if (!beltAnimates[iu] && animate) {
              beltAnimates[iu] = new COALANIM({
                stage: editor.value.getStage(),
                uuid: iu,
                imgUrl: `/micro-assets/edit/coal${random(1, 4)}.png`,
                autoPlay: true,
              });
            }
          } else if (beltAnimates[iu]) {
            beltAnimates[iu].destroy();
            beltAnimates[iu] = null;
          }
        }
      }
    };

    const setNodeLevel = (iu, val)  => {
      const c = editor.value?.getComponent<any>('StoreHouse');
      c.setLevel(iu, val);
    };

    const lineAnimates = {};

    const setLineState = (line, state) => {
      const key = line.id();
      if (state) {
        if (!lineAnimates[key] && animate) {
          const animateType = getLineInfo(line).animateType || 'default';
          lineAnimates[key] = new Animate({
            line,
            ie: editor.value as Editor,
            direction: 'obey',
            animateType,
            speed: props.lineAnimateSpeed,
          });
          lineAnimates[key].start();
        }
      } else if (lineAnimates[key]) {
        lineAnimates[key].destroy();
        lineAnimates[key] = null;
      }
    };

    const stopAnimate = () => {
      animate = false;
      each(beltAnimates, (a: any, key) => {
        if (a) {
          a.destroy();
          beltAnimates[key] = null;
        }
      });
      each(lineAnimates, (a: any, key) => {
        if (a) {
          a.destroy();
          lineAnimates[key] = null;
        }
      });
    };
    const startAnimate = () => {
      setTimeout(() => {
        animate = true;
      }, 200);
    };

    const resetLineAnimate = () => {
      each(lineAnimates, (a: any, key) => {
        a.destroy();
        lineAnimates[key] = null;
      });
    };

    const dragIn = (event, data) => {
      if (includes([...commonComponent, ...storeHouseComponent], data.tc)) {
        event.dataTransfer.setData('customComponent', data.tc);
      }
      event.dataTransfer.setData('thing', JSON.stringify({ thing: data }));
    };

    const getPopupContainer = (triggerNode) => triggerNode;

    const setField = (width, height) => {
      if (editor.value) {
        editor.value.setField(editor.value.getStage(), height, width);
      }
    };

    const findGroup = (id) => {
      if (editor.value) {
        const stage = editor.value.getStage();
        return stage.findOne(`#${id}`);
      }
      return null;
    };

    const removeById = (id: string) => {
      if (editor.value && findGroup(id)) {
        editor.value.removeNode(findGroup(id) as Konva.Group);
      }
    };

    const createLineGroup = (line, data) => editor.value?.createLineGroup(line, data);

    const setComponentScale = (iu, val) => {
      editor.value?.setComponentScale(iu, val);
    };

    const changeLabel = (iu, propertyId, val) => editor.value?.changeLabel(iu, propertyId, val);

    watch(() => props.theme, (val) => {
      if (editor.value && init) {
        editor.value.changeTheme(val);
      }
    });

    expose({
      editor,
      loadJson,
      getChildrens,
      setChildrens,
      setAttrs,
      toJson,
      fit,
      createThingText,
      createLineText,
      removeText,
      updateLineOption,
      setDrawState,
      changeElementsPosition,
      getNodesAndEdges,
      getThings,
      setTextValue,
      setTextValues,
      resetValues,
      resetTexts,
      setNodeState,
      setNodeLevel,
      setLineState,
      dragIn,
      setField,
      findGroup,
      removeById,
      createLineGroup,
      setComponentScale,
      stopAnimate,
      startAnimate,
      resetLineAnimate,
      changeLabel,
    });

    return () => (
      <div class="mt-editor">
        {(props.showTools || slots.title || slots.extra) && (
          <div class="mt-editor-header">
            {slots.title && (
              <div class="mt-editor-title">
                {slots.title()}
              </div>
            )}
            {props.showTools && (
              <div class="mt-editor-tools">
                <div
                  class={['mt-editor-tools-item', {
                    'mt-editor-tools-active': state.value === 'Rect',
                  }]}
                  onClick={() => setDrawState('Rect')}
                >
                  <BorderOutlined class="mt-editor-tools-icon"></BorderOutlined>
                  <span>矩形</span>
                </div>
                <div
                  class={(['mt-editor-tools-item', {
                    'mt-editor-tools-active': state.value === 'Text',
                  }])}
                  onClick={() => setDrawState('Text')}
                >
                  <FontSizeOutlined class="mt-editor-tools-icon"></FontSizeOutlined>
                  <span>文字</span>
                </div>
                {props.type === 'device_connect' && (
                  <>
                    <Dropdown
                      get-popup-container={getPopupContainer}
                      v-slots={{
                        overlay: () => (
                          <Menu class="mt-editor-tools-menu" onClick={(e) => setDrawState(e.key as State)}>
                            <MenuItem key="Line" class={['mt-editor-tools-item', {
                              'mt-editor-tools-active': state.value === 'Line',
                            }]}>
                              <IconFont type="icon-zhixian" class="mt-editor-tools-icon"></IconFont>
                              <span>直线</span>
                            </MenuItem>
                            <MenuItem key="rightAngleLine" class={['mt-editor-tools-item', {
                              'mt-editor-tools-active': state.value === 'rightAngleLine',
                            }]}>
                              <IconFont type="icon-zhexian" class="mt-editor-tools-icon"></IconFont>
                              <span>折线</span>
                            </MenuItem>
                            {/* <MenuItem key="Three" class={['mt-editor-tools-item', {
                              'mt-editor-tools-active': state.value === 'Three',
                            }]}>
                              <img src="/micro-assets/edit/three.svg" alt="三通" class="mt-editor-tools-icon" />
                              <span>三通</span>
                            </MenuItem>
                            <MenuItem key="Four" class={['mt-editor-tools-item', {
                              'mt-editor-tools-active': state.value === 'Four',
                            }]}>
                              <img src="/micro-assets/edit/four.svg" alt="四通" class="mt-editor-tools-icon" />
                              <span>四通</span>
                            </MenuItem> */}
                          </Menu>
                        ),
                      }}
                    >
                      <div class="mt-editor-tools-item">
                        <img src={pipeSvg} alt="管道" class="mt-editor-tools-icon" />
                        <span>管道</span>
                      </div>
                    </Dropdown>
                    <Dropdown
                      get-popup-container={getPopupContainer}
                      v-slots={{
                        overlay: () => (
                          <Menu class="mt-editor-tools-menu" onClick={(e) => setDrawState(e.key as State)}>
                            <MenuItem key="dottedLine" class={['mt-editor-tools-item', {
                              'mt-editor-tools-active': state.value === 'dottedLine',
                            }]}>
                              <IconFont
                                type="icon-icon_yewulei_wulianpingtai_kaifazhezhongxin_wumoxingguanli_gongyituguanli_quanjucaozuo_zhixianxuxian"
                                class="mt-editor-tools-icon"
                              ></IconFont>
                              <span>直线</span>
                            </MenuItem>
                            <MenuItem key="rightAngleDottedLine" class={['mt-editor-tools-item', {
                              'mt-editor-tools-active': state.value === 'rightAngleDottedLine',
                            }]}>
                              <IconFont
                                type="icon-icon_yewulei_wulianpingtai_kaifazhezhongxin_wumoxingguanli_gongyituguanli_quanjucaozuo_zhexianxuxian"
                                class="mt-editor-tools-icon"
                              ></IconFont>
                              <span>折线</span>
                            </MenuItem>
                          </Menu>
                        ),
                      }}
                    >
                      <div class="mt-editor-tools-item">
                        <img src={lineSvg} alt="连线" class="mt-editor-tools-icon" />
                        <span>连线</span>
                      </div>
                    </Dropdown>
                  </>
                )}
                {props.type === 'process_connect' && (
                  <Dropdown
                    get-popup-container={getPopupContainer}
                    v-slots={{
                      overlay: () => (
                        <Menu class="mt-editor-tools-menu" onClick={(e) => setDrawState(e.key as State)}>
                          <MenuItem key="dottedLine" class={['mt-editor-tools-item', {
                            'mt-editor-tools-active': state.value === 'dottedLine',
                          }]}>
                            <IconFont type="icon-zhixian" class="mt-editor-tools-icon"></IconFont>
                            <span>直线</span>
                          </MenuItem>
                          <MenuItem key="rightAngleDottedLine" class={['mt-editor-tools-item', {
                            'mt-editor-tools-active': state.value === 'rightAngleDottedLine',
                          }]}>
                            <IconFont type="icon-zhexian" class="mt-editor-tools-icon"></IconFont>
                            <span>折线</span>
                          </MenuItem>
                        </Menu>
                      ),
                    }}
                  >
                    <div class="mt-editor-tools-item">
                      <img src={pipeSvg} alt="料流" class="mt-editor-tools-icon" />
                      <span>料流</span>
                    </div>
                  </Dropdown>
                )}
              </div>
            )}
            {slots.extra && (
              <div class="mt-editor-extra">
                {slots.extra()}
              </div>
            )}
          </div>
        )}
        <div ref={contentRef} class="mt-editor-content">
          {props.showFullscreenButton && (
            <Button
              type="primary"
              class="mt-editor-fullscreen"
              onClick={toggle}
            >
              <FullscreenOutlined></FullscreenOutlined>
              {isFullscreen.value ? '退出全屏' : '全屏'}
            </Button>
          )}
          <div class="mt-editor-main" id={editorId}></div>
        </div>
      </div>
    );
  },
});
