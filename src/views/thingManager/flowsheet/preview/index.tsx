import {
  defineComponent,
  ref,
  onMounted,
  onUnmounted,
  watch,
  computed,
  nextTick,
} from 'vue';
import { useRouter } from 'vue-router';
import {
  debounce,
  each,
  map,
  isNaN,
  findIndex,
  toPairs,
  find,
  trim,
  isNull,
  some,
  filter,
  keyBy,
  concat,
  size,
} from 'lodash';
import dayjs from 'dayjs';
import { Modal, message } from 'ant-design-vue';
import { CaretRightOutlined, PauseCircleFilled, CloseOutlined } from '@ant-design/icons-vue';
import { useElementSize, useTimeoutFn } from '@vueuse/core';
import { div, sub, round } from '@/utils/math';
import Editor from '@/components/editor';
import * as thingInstAPI from '@/api/thingInst';
import { getIuPcNameList } from '@/api/thingClient';
import Dialog from './dialog';
import clientUtils from '@/utils/clientUtils';
import { useTopoMap } from '../useTopoMap';

export default defineComponent({
  props: {
    isActive: {
      type: Boolean,
      default: false,
    },
  },
  setup(props) {
    const router = useRouter();
    const { params: { id: pageId, type: pageType } } = router.currentRoute.value;
    const editorRef = ref();
    const {
      theme,
      width,
      height,
      playBackEnable,
      thingMap,
      instanceMap,
      propertyList,
      load,
      getValues,
    } = useTopoMap();
    const stateImageMap = {
      null: 'powerOffImage',
      0: 'powerOffImage',
      1: 'runImage',
      2: 'alarmImage',
      3: 'powerOnImage',
    };
    const lineMap: Record<string, {
      aNodeId: string;
      zNodeId: string;
      line: any;
    }> = {};
    const setTopoMapRelation = () => {
      const { nodes, edges } = editorRef.value.getNodesAndEdges();
      const nodeImageMap = {};
      const getLineId = (nodeId) => {
        if (nodeImageMap[nodeId]) {
          return nodeImageMap[nodeId];
        }
        return nodeId;
      };
      each(nodes, ({ attrs, children }) => {
        if (attrs.name === 'thingGroup') {
          const { iu } = attrs.cdata.thing;
          const finded = find(children, (c) => c.attrs.name === 'thingImage');
          if (finded) {
            nodeImageMap[finded.attrs.id] = iu;
          }
        }
      });
      each(edges, (edge) => {
        let line;
        if (edge.className === 'Arrow') {
          line = edge;
        } else if (edge?.attrs?.name === 'thingGroup') {
          line = find(edge.children, (child) => child.name() === 'line');
        }
        if (line) {
          const { attrs: { cdata: { lineInfo: { from, to } } } } = line;
          const aNodeId = getLineId(from);
          const zNodeId = getLineId(to);
          lineMap[line.attrs.id] = {
            line,
            aNodeId,
            zNodeId,
          };
        }
      });
    };
    const getThingState = (id, type) => {
      const inst = instanceMap.value[id];
      if (inst) {
        const { thingCode, state } = inst;
        if (thingCode === 'THREE-WAY' || thingCode === 'FOUR-WAY') {
          if (type === 'start') {
            return some(filter(lineMap, ['zNodeId', id]), (line) => getThingState(line.aNodeId, 'start'));
          }
          return some(filter(lineMap, ['aNodeId', id]), ({ zNodeId }) => getThingState(zNodeId, 'start'));
        }
        return !!state;
      }
      return false;
    };
    const refreshLineState = () => {
      each(lineMap, ({ line, aNodeId, zNodeId }) => {
        const state = getThingState(aNodeId, 'start') || getThingState(zNodeId, 'end');
        editorRef.value.setLineState(line, state);
      });
    };
    let dialogPropertyList: any[] = [];
    const dialogValues = ref({});
    const onDialogOpen = ({ thingInstId, list }) => {
      console.log(list);
      dialogPropertyList = [];
      dialogValues.value = {};
      const inst = instanceMap.value[thingInstId];
      if (inst) {
        const { thingCode } = inst;
        if (played.value) {
          each(list, (thingPropertyId) => {
            if (!inst.propertyMap[thingPropertyId] && !inst.propertyMap[`node.${thingPropertyId}`]) {
              dialogPropertyList.push({
                thingCode,
                thingInstId,
                thingPropertyId,
              });
            }
            dialogValues.value[`${thingInstId}.${thingPropertyId}`] = {
              value: null,
              displayValue: null,
              alarmDTO: null,
            };
          });
        } else {
          getValues(map(list, (thingPropertyId) => ({
            thingCode,
            thingInstId,
            thingPropertyId,
          }))).then((values) => {
            each(list, (thingPropertyId) => {
              if (!inst.propertyMap[thingPropertyId] && !inst.propertyMap[`node.${thingPropertyId}`]) {
                dialogPropertyList.push({
                  thingCode,
                  thingInstId,
                  thingPropertyId,
                });
              }
            });
            dialogValues.value = keyBy(values, (value) => `${thingInstId}.${value.thingPropertyId}`);
          });
        }
      }
    };
    const onDialogClose = () => {
      dialogPropertyList = [];
      dialogValues.value = {};
    };
    const getPropertyValues = () => new Promise((resolve) => {
      getValues(concat(propertyList.value, dialogPropertyList)).then((values) => {
        if (props.isActive && getStateContinue) {
          let needRefreshLineState = false;
          each(values, ({
            thingCode,
            thingInstId,
            thingPropertyId,
            value,
            displayValue,
            alarmDTO,
          }) => {
            const inst = instanceMap.value[thingInstId];
            if (inst) {
              const { propertyMap } = inst;
              const key = `${thingInstId}.${thingPropertyId}`;
              if (dialogValues.value[key]) {
                dialogValues.value[key] = {
                  value,
                  displayValue,
                  alarmDTO,
                };
              }
              const nodeProperty = propertyMap[`node.${thingPropertyId}`];
              const thing = thingMap.value[thingCode];
              if (nodeProperty) {
                const { animationId } = nodeProperty;
                if (animationId === '1') {
                  editorRef.value.setNodeState(
                    thingCode,
                    thingInstId,
                    value,
                    thing[stateImageMap[value]],
                  );
                  instanceMap.value[thingInstId].state = Number(value) > 0;
                  needRefreshLineState = true;
                } else if (animationId === '2') {
                  let level = Number(value);
                  if (isNaN(level)) {
                    level = 0;
                  } else if (level < 0) {
                    level = 0;
                  } else if (level > 100) {
                    level = 100;
                  }
                  editorRef.value.setNodeLevel(thingInstId, level);
                }
              }
              const property = propertyMap[thingPropertyId];
              if (property) {
                editorRef.value.setTextValue(thingInstId, thingPropertyId, displayValue ?? value ?? '--');
              }
            }
          });
          if (needRefreshLineState) {
            refreshLineState();
          }
        }
      }).finally(() => {
        resolve(true);
      });
    });
    let getStateContinue = true;
    const { start: startGetPropertiesValue, stop: stopGetPropertiesValue } = useTimeoutFn(() => {
      getPropertyValues().then(() => {
        if (getStateContinue) {
          startGetPropertiesValue();
        }
      });
    }, 3000, { immediate: false });
    const startGetState = () => {
      getStateContinue = true;
      if (propertyList.value.length) {
        getPropertyValues().then(() => {
          startGetPropertiesValue();
        });
      }
    };
    const stopGetState = () => {
      getStateContinue = false;
      stopGetPropertiesValue();
    };
    const dialogRef = ref();
    const getPointCode = (instanceId, propertyId) => new Promise((resolve) => {
      getIuPcNameList([{
        instanceId,
        propertyId,
      }]).then(({ data }) => {
        if (data && data.length) {
          const [{ prePointCode }] = data;
          if (prePointCode) {
            resolve(prePointCode);
          } else {
            message.error('下发信号未配置');
          }
        }
      });
    });
    const getProperty = (instanceId, propertyId) => {
      const { thingCode } = instanceMap.value[instanceId];
      const { thingPropertyEntityList } = thingMap.value[thingCode];
      const { listInfo } = thingPropertyEntityList[propertyId];
      const listInfoJson = JSON.parse(listInfo);
      return {
        ...thingPropertyEntityList[propertyId],
        listInfo: listInfoJson,
      };
    };
    const down = ({title, pointCode, propertyId, value}) => {
      Modal.confirm({
        title,
        content: '请确认安全后执行',
        onOk() {
          thingInstAPI.downloadPropertyValue(propertyId, pointCode, value).then(({ data }) => {
            if (data) {
              message.success('下发成功');
            } else {
              message.error('下发失败');
            }
          });
        },
      });
    };
    const onSelect = (selected) => {
      console.log(selected);
      if (
        (
          selected.type === 'thing'
          || selected.type === 'line'
        )
        && selected.data.iu
      ) {
        const inst = instanceMap.value[selected.data.iu];
        if (inst) {
          const {
            showCard,
            thingInstId,
            thingInstanceName,
            thingCode,
          } = inst;
          if (showCard) {
            dialogRef.value.open({
              id: thingInstId,
              thingCode,
              title: thingInstanceName,
            });
          }
        }
      } else if (selected.type === 'thingText') {
        const {
          data: { iu },
          event: {
            parent: {
              attrs: {
                name: parentName,
                cdata: {
                  propertyId,
                  thingTextInfo: {
                    label,
                    v,
                  },
                },
              },
              children,
            },
            target: {
              attrs: {
                name,
              },
            },
          },
        } = selected;
        if (name === 'btn') {
          if (parentName === 'thingButtonGroup') {
            getPointCode(iu, propertyId).then((pointCode) => {
              const { listInfo } = getProperty(iu, propertyId);
              const [[value]] = toPairs(listInfo);
              down({
                title: label,
                pointCode,
                propertyId,
                value,
              });
            });
          } else if (parentName === 'thingInputGroup') {
            getPointCode(iu, propertyId).then((pointCode) => {
              const { minValue, maxValue } = getProperty(iu, propertyId);
              const finded = find(children, (layer) => layer.attrs.name === 'input');
              if (finded) {
                const value = trim(finded.attrs.text);
                if (value) {
                  const v = Number(value);
                  if (!isNull(minValue) && v < minValue) {
                    message.error('输入的值低于最小值限制');
                  } else if (!isNull(maxValue) && v > maxValue) {
                    message.error('输入的值高于最大值限制');
                  } else {
                    down({
                      title: label,
                      pointCode,
                      propertyId,
                      value: v,
                    });
                  }
                } else {
                  message.error('请先输入下发值')
                }
              } else {
                message.error('没有获取到下发值');
              }
            });
          }
        } else if (parentName === 'thingSwitchGroup' && name !== 'label') {
          getPointCode(iu, propertyId).then((pointCode) => {
            const { listInfo } = getProperty(iu, propertyId);
            const [[unCheckedValue], [checkedValue, checkedLabel]] = toPairs(listInfo);
            const value = (v === checkedLabel || v === checkedValue) ? unCheckedValue : checkedValue;
            down({
              title: label,
              pointCode,
              propertyId,
              value,
            });
          });
        }
      }
    };
    const fit = () => {
      editorRef.value.fit();
    };
    onMounted(() => {
      load(pageId, pageType).then((style) => {
        editorRef.value.loadJson(style).then(() => {
          fit();
          setTopoMapRelation();
          getValues(propertyList.value).then((values) => {
            editorRef.value.resetTexts(values, thingMap.value);
            startGetState();
          });
        });
      });
    });
    onUnmounted(() => {
      stopGetState();
    });
    watch(() => props.isActive, (val) => {
      if (val) {
        nextTick(() => {
          startAnimate();
          startGetState();
        });
      } else {
        stopAnimate();
        stopGetState();
      }
    });
    const previewRef = ref();
    const { width: previewWidth, height: previewHeight } = useElementSize(previewRef);
    const innerSize = computed(() => {
      if (previewWidth.value && previewHeight.value) {
        const pw = width.value / previewWidth.value;
        const ph = height.value / previewHeight.value;
        if (pw > ph) {
          return {
            width: `${round(previewWidth.value, 0)}px`,
            height: `${round(previewWidth.value * height.value / width.value, 0)}px`,
          };
        }
        return {
          width: `${round(previewHeight.value * width.value / height.value, 0)}px`,
          height: `${round(previewHeight.value, 0)}px`,
        };
      }
      return undefined;
    });
    const debounceToFit = debounce(() => {
      if (props.isActive) {
        fit();
      }
    }, 300);
    watch(() => innerSize.value, debounceToFit);
    // 生产回放显示
    const showPlayback = ref(false);
    // 生产回放时间范围
    const timeRange = ref();
    // 当前时间轴
    const now = ref(0);
    // 最大秒数
    const max = ref(0);
    // 倍速
    const speed = ref(1);
    // 播放状态
    const playing = ref(false);
    // 是否播放过
    const played = ref(false);
    // 停止回放
    const stopPlayback = () => {
      played.value = false;
      playing.value = false;
      historyData = [];
      historyMap = {};
      requestPrePointVoList = [];
      stop();
      startAnimate();
      startGetState();
    };
    // 时间范围变化回调
    const onTimeChange = (datas) => {
      console.log(datas);
      stopPlayback();
      if (datas) {
        const [start, end] = datas;
        timeRange.value = [start, end];
        max.value = div(sub(dayjs(end).valueOf(), dayjs(start).valueOf()), 1000);
      } else {
        max.value = 0;
      }
      now.value = 0;
      speed.value = 1;
    };
    // 初始化生产回放
    const initPlayback = () => {
      stopPlayback();
      timeRange.value = [
        dayjs().subtract(30, 'minute').format('YYYY-MM-DD HH:mm:ss'),
        dayjs().format('YYYY-MM-DD HH:mm:ss'),
      ];
      now.value = 0;
      max.value = 30 * 60;
      speed.value = 1;
    };
    const playback = () => {
      if (showPlayback.value) {
        stopPlayback();
        showPlayback.value = false;
      } else {
        initPlayback();
        showPlayback.value = true;
      }
    };
    const showTime = (val) => {
      const second = val % 60;
      const minute = parseInt(`${val / 60 % 60}`, 10);
      const hour = parseInt(`${val / 60 / 60}`, 10);
      return (hour ? `${hour}:` : '') + (minute < 10 ? `0${minute}` : minute) + ':' + (second < 10 ? `0${second}` : second);
    };

    const tooltipVisible = computed(() => {
      if (timeRange.value) {
        return undefined;
      }
      return false;
    });

    const tipFormatter = (n) => {
      if (timeRange.value) {
        const [start] = timeRange.value;
        return dayjs(start).add(n, 'second').format('YYYY-MM-DD HH:mm:ss');
      }
      return null;
    };

    let historyMap = {};
    let requestPrePointVoList: any[] = [];

    const setHistoryMap = (instanceId, thingPropertyId, pointCode) => {
      const key = `${thingPropertyId}.${pointCode}`;
      const value = {
        instanceId,
        thingPropertyId,
        pointCode,
      };
      if (historyMap[key]) {
        historyMap[key].push(value);
      } else {
        requestPrePointVoList.push({
          thingPropertyId,
          pointCode,
        });
        historyMap[key] = [value];
      }
    };

    let historyData: Record<string, any>[] = [];

    const loadHistoryData = (startTime, endTime) => new Promise<any[]>((resolve, reject) => {
      console.log(dialogPropertyList);
      clientUtils.thing.getHistoryData({
        requestPrePointVoList,
        startTime: `${startTime}`,
        endTime: `${endTime}`,
        downsample: {
          timeNum: 1,
          timeUnit: 'SECOND',
          aggregator: 'INTERP',
        },
      }).then((data) => {
        resolve(data);
      }).catch(() => {
        reject();
      });
    });
    const getHistoryData = (n) => new Promise<Record<string, any>>((resolve, reject) => {
      if (historyData[n]) {
        resolve(historyData[n]);
      } else {
        const startStamp = dayjs(timeRange.value[0]).valueOf();
        const endStamp = dayjs(timeRange.value[1]).valueOf();
        const startTime = startStamp + n * 1000;
        let endTime = startTime + 10 * 1000;
        let en = n + 9;
        if (endTime >= endStamp) {
          endTime = endStamp + 1000;
          en = (endStamp - startStamp) / 1000 - 1;
        }
        if (historyData[en]) {
          const index = findIndex(historyData, (item) => !!item, n);
          endTime = startStamp + index * 1000;
        }
        loadHistoryData(startTime, endTime).then((data) => {
          each(data, ({ propertyId, pointCode, historyDataList }) => {
            if (historyDataList && historyDataList.length) {
              each(historyDataList, ({ saveTime, formatValue }) => {
                const stamp = dayjs(saveTime).valueOf();
                const key = `${propertyId}.${pointCode}`;
                let index = (stamp - dayjs(timeRange.value[0]).valueOf()) / 1000;
                if (historyData[index]) {
                  historyData[index][key] = formatValue;
                } else {
                  historyData[index] = {
                    [key]: formatValue,
                  };
                }
              });
            }
          });
          resolve(historyData[n]);
        }).catch(() => {
          reject();
        });
      }
    });
    const { start: startPlayback, stop } = useTimeoutFn(() => {
      getHistoryData(now.value).then((data) => {
        each(data, (value, key) => {
          console.log(value, key);
          if (historyMap[key] && historyMap[key].length) {
            each(historyMap[key], ({ instanceId, thingPropertyId }) => {
              editorRef.value.setTextValue(instanceId, thingPropertyId, value);
            });
          }
        });
        const [start, end] = timeRange.value;
        const span = (dayjs(end).valueOf() - dayjs(start).valueOf()) / 1000;
        if (now.value === span) {
          stopPlayback();
        } else {
          now.value += 1;
          startPlayback();
        }
      }).catch(() => {
        stopPlayback();
      });
    }, 1000, { immediate: false });
    const pausePlay = () => {
      stop();
      playing.value = false;
    };
    const startPlay = () => {
      if (size(historyMap)) {
        startPlayback();
        playing.value = true;
      } else if (timeRange.value) {
        const [start, end] = timeRange.value;
        const dif = sub(dayjs(end).valueOf(), dayjs(start).valueOf());
        if (dif > 0 && dif <= 8 * 60 * 60 * 1000) {
          stopAnimate();
          stopGetState();
          editorRef.value.resetValues(thingMap.value);
          played.value = true;
          playing.value = true;
          historyData = [];
          historyMap = {};
          requestPrePointVoList = [];
          getIuPcNameList(map(propertyList.value, ({ thingInstId, thingPropertyId }) => ({
            instanceId: thingInstId,
            propertyId: thingPropertyId,
          }))).then(({ data }) => {
            each(data, ({
              prePointCode,
              prePointCode2,
              propertyId,
              instanceId,
            }) => {
              const pointCode = prePointCode2 || prePointCode;
              if (pointCode) {
                setHistoryMap(instanceId, propertyId, pointCode);
              }
            });
            startPlayback();
          });
        } else {
          Modal.error({
            title: '错误',
            content: '时间范围不能超过8小时且起始时间不能相同',
          });
        }
      } else {
        Modal.error({
          title: '错误',
          content: '请选择时间范围',
        });
      }
    };
    const startAnimate = () => {
      editorRef.value.startAnimate();
    };
    const stopAnimate = () => {
      editorRef.value.stopAnimate();
    };
    const testVisible = ref(false);
    const test = () => {
      testVisible.value = true;
    };
    const test1 = () => {
      startAnimate();
    };
    const test2 = () => {
      stopAnimate();
    };
    const test3 = () => {
      startGetState();
    };
    const test4 = () => {
      stopGetState();
    };

    const lineAnimateSpeed = ref(20);
    const setLineAnimateSpeed = () => {
      editorRef.value.resetLineAnimate();
    };
    
    return () => (
      <div class="topo-preview-warp">
        {playBackEnable.value && (
          <div class="topo-preview-header">
            <a-button type="link" class="topo-preview-header-btn" onClick={playback}>
              <icon-font type="icon-tiaodujilu"></icon-font>
              生产回放
            </a-button>
          </div>
        )}
        <div ref={previewRef} class={['topo-preview', `topo-preview-${theme.value}`]}>
          <div class="test" onDblclick={test}></div>
          <a-modal title="测试" v-model:visible={testVisible.value} footer={false}>
            <a-button onClick={test1}>开启动画</a-button>
            <a-button onClick={test2}>关闭动画</a-button>
            <a-button onClick={test3}>开启轮询</a-button>
            <a-button onClick={test4}>关闭轮询</a-button>
            <br />
            <a-form>
              <a-form-item label="线动画速度">
                <a-input-number v-model:value={lineAnimateSpeed.value}></a-input-number>
                <a-button onClick={setLineAnimateSpeed}>确定</a-button>
                <strong>注：值越大，线动画速度越慢，点击确定后生效</strong>
              </a-form-item>
            </a-form>
          </a-modal>
          <div class="topo-preview-inner" style={innerSize.value}>
            <Editor
              ref={editorRef}
              preview
              theme={theme.value}
              line-animate-speed={lineAnimateSpeed.value}
              fullscreen-container={previewRef}
              onSelect={onSelect}
            ></Editor>
          </div>
          <Dialog
            ref={dialogRef}
            parent={previewRef.value}
            theme={theme.value}
            values={dialogValues.value}
            onOpen={onDialogOpen}
            onClose={onDialogClose}
          ></Dialog>
        </div>
        {showPlayback.value && (
          <div class="topo-preview-footer">
            <a-form layout="inline">
              <a-form-item label="时间范围">
                <a-range-picker
                  v-model:value={timeRange.value}
                  value-format="YYYY-MM-DD HH:mm:ss"
                  show-time
                  onChange={onTimeChange}
                ></a-range-picker>
              </a-form-item>
            </a-form>
            <div class="topo-preview-player">
              {playing.value ? (
                <PauseCircleFilled class="icon" onClick={pausePlay}></PauseCircleFilled>
              ) : (
                <CaretRightOutlined class="icon" onClick={startPlay}></CaretRightOutlined>
              )}
              <span class="now">{showTime(now.value)}</span>
              <a-slider
                class="slider"
                v-model:value={now.value}
                max={max.value}
                tip-formatter={tipFormatter}
                tooltip-visible={tooltipVisible.value}
              ></a-slider>
              <span class="total">{showTime(max.value)}</span>
              <a-select class="select" v-model:value={speed.value}>
                <a-select-option value={1}>1X</a-select-option>
                <a-select-option value={5}>5X</a-select-option>
                <a-select-option value={10}>10X</a-select-option>
              </a-select>
            </div>
            <CloseOutlined class="icon" onClick={playback}></CloseOutlined>
          </div>
        )}
      </div>
    );
  },
});
