import { ref } from 'vue';
import {
  keyBy,
  values,
  concat,
  merge,
  each,
  map,
  uniq,
  size,
  find,
  isUndefined,
  remove,
  toPairs,
} from 'lodash';
import { lineOptions } from './lineOptions';
import { message } from 'ant-design-vue';
import type { Detail } from '@/api/topoMap';
import { findById } from '@/api/topoMap';
import { getTopoMapThingPropertyTemplate, type Proptype } from '@/api/topoThingProperty';
import { getPropertiesValueById } from '@/api/thingClient';
import { findByIdModify } from '@/api/thingInst';
import type { Theme } from '@/components/editor';

const version = 3;

export function useTopoMap() {
  const title = ref('');
  const theme = ref<Theme>('dark');
  const width = ref(1920);
  const height = ref(1080);
  const playBackEnable = ref(false);
  const mainMapFlag = ref(false);
  const thingMap = ref({});
  const instanceMap = ref({});
  const propertyList = ref<any[]>([]);

  const mergeThingMap = (data) => {
    const re = {};
    each(data, (thing, tc) => {
      re[tc] = {
        ...thing,
        thingPropertyEntityList: keyBy(thing.thingPropertyEntityList, 'id'),
      };
    });
    merge(thingMap.value, re);
  };

  const getTemplate = (tc: string, reset: boolean = false) => new Promise<Proptype[]>((resolve) => {
    if (!reset && thingMap.value[tc]) {
      resolve(values(thingMap.value[tc].thingPropertyEntityList));
    } else {
      getTopoMapThingPropertyTemplate([tc]).then(({ data }) => {
        mergeThingMap(data);
        resolve(values(thingMap.value[tc].thingPropertyEntityList));
      });
    }
  });

  const init = ({
    topoMapEntity,
    topoNodeList,
    topoLineList,
  }: Detail, pageType) => new Promise((resolve) => {
    thingMap.value = {};
    instanceMap.value = {};
    propertyList.value = [];
    const nodeTcs = uniq(map(topoNodeList, 'thingCode'));
    let lineTc;
    if (pageType === 'device_connect') {
      lineTc = 'PIPELINE';
    } else if (pageType === 'process_connect') {
      lineTc = 'FLOW';
    }
    const tcs = concat(nodeTcs, lineTc);
    getTopoMapThingPropertyTemplate(tcs).then(({ data }) => {
      mergeThingMap(data);
      each([...topoNodeList, ...topoLineList], ({
        thingInstanceId: thingInstId,
        showPropertyList,
        thingCode,
        showCard,
        thingInstanceName,
      }) => {
        if (thingCode && thingInstId) {
          const propertyMap = {};
          if (data[thingCode]) {
            const { animationTypeAndPropertyId } = data[thingCode];
            if (animationTypeAndPropertyId && size(animationTypeAndPropertyId)) {
              each(animationTypeAndPropertyId, (thingPropertyId, animationId) => {
                propertyMap[`node.${thingPropertyId}`] = {
                  thingCode,
                  thingInstId,
                  thingPropertyId,
                  animationId,
                };
                propertyList.value.push({
                  thingCode,
                  thingInstId,
                  thingPropertyId,
                });
              });
            }
          }
          each(showPropertyList, (thingPropertyId) => {
            propertyMap[thingPropertyId] = {
              thingCode,
              thingInstId,
              thingPropertyId,
            };
            if (!propertyMap[`node.${thingPropertyId}`]) {
              propertyList.value.push({
                thingCode,
                thingInstId,
                thingPropertyId,
              });
            }
          });
          instanceMap.value[thingInstId] = {
            thingInstId,
            thingCode,
            showCard,
            propertyMap,
            thingInstanceName,
          };
        }
      });
      if (topoMapEntity.style) {
        const { topoMapVersion } = topoMapEntity.style.attrs;
        const children: any[] = [];
        each(topoMapEntity.style.children, (layer) => {
          if (layer.attrs.name === 'thing') {
            const thingChildren: any[] = [];
            each(layer.children, (thingLayer) => {
              if (
                thingLayer.className === 'Group'
                && thingLayer.attrs.name === 'thingGroup'
                && thingLayer.attrs?.cdata?.thing?.iu
              ) {
                const { thing } = thingLayer.attrs.cdata;
                const { tc, iu } = thing;
                if (instanceMap.value[iu]) {
                  if (thingMap.value[tc]) {
                    const {
                      powerOffImage,
                      runImage,
                      alarmImage,
                      powerOnImage,
                    } = thingMap.value[tc];
                    if (powerOffImage) {
                      thing.img = powerOffImage;
                      thing.imgPowerOff = powerOffImage;
                    }
                    if (runImage) {
                      thing.imgRun = runImage;
                      thing.fullImg = runImage;
                    }
                    if (alarmImage) {
                      thing.imgAlarm = alarmImage;
                    }
                    if (powerOnImage) {
                      thing.imgPowerOn = powerOnImage;
                    }
                  }
                  thingChildren.push(thingLayer);
                }
              } else {
                thingChildren.push(thingLayer);
              }
            });
            children.push({
              ...layer,
              children: thingChildren,
            });
          } else if (layer.attrs.name === 'line') {
            const lineChildren: any[] = [];
            each(layer.children, (lineLayer) => {
              if (
                lineLayer.className === 'Group'
                && lineLayer.attrs.name === 'thingGroup'
                && lineLayer.attrs?.cdata?.thing?.iu
              ) {
                const { thing } = lineLayer.attrs.cdata;
                const { iu } = thing;
                if (instanceMap.value[iu]) {
                  lineChildren.push(lineLayer);
                }
              } else {
                lineChildren.push(lineLayer);
              }
            });
            if (isUndefined(topoMapVersion) || Number(topoMapVersion) < version) {
              each(lineChildren, (line) => {
                let lineLayer;
                if (line.className === 'Group') {
                  lineLayer = find(line.children, (child) => child.className === 'Arrow' && child.attrs.name !== 'border');
                } else if (line.className === 'Arrow') {
                  lineLayer = line;
                }
                if (lineLayer && lineLayer?.attrs?.cdata?.lineInfo) {
                  const { state, type } = lineLayer.attrs.cdata.lineInfo;
                  const lineOpt = lineOptions[state];
                  if (lineOpt) {
                    const { color, dotted } = lineOpt;
                    lineLayer.attrs.stroke = color;
                    lineLayer.attrs.fill = color;
                    lineLayer.attrs.pointerFill = color;
                    lineLayer.attrs.dash = dotted;
                  }
                  if (pageType === 'process_connect') {
                    let t;
                    if (type === 'Line') {
                      t = 'dottedLine';
                    } else if (type === 'rightAngleLine') {
                      t = 'rightAngleDottedLine';
                    }
                    lineLayer.attrs.cdata.lineInfo.type = t;
                    if (t && line.className === 'Group') {
                      remove(line.children as any[], (child) => child.className === 'Arrow' && child.attrs.name === 'border');
                    }
                  }
                }
              });
            }
            children.push({
              ...layer,
              children: lineChildren,
            });
          } else {
            children.push(layer);
          }
        });
        resolve({
          ...topoMapEntity.style,
          children,
        });
      } else {
        resolve(null);
      }
    });
  });

  const load = (topoMapId, topoMapType) => new Promise((resolve) => {
    findById(topoMapId).then(({ data }) => {
      if (data.topoMapEntity) {
        title.value = data.topoMapEntity.title || `未命名${topoMapType === 'device_connect' ? '设备' : '工艺'}流程图`;
        theme.value = data.topoMapEntity.theme || 'dark';
        width.value = data.topoMapEntity.width || 1920;
        height.value = data.topoMapEntity.height || 1080;
        playBackEnable.value = data.topoMapEntity.playBackEnable || false;
        mainMapFlag.value = data.topoMapEntity.mainMapFlag || false;
        init(data, topoMapType).then((style) => {
          resolve(style);
        });
      } else {
        message.error('读取数据有误，请稍后重试');
      }
    });
  });

  const getDetail = (thingCode, id) => new Promise<any>((resolve) => {
    findByIdModify({
      requestType: 'all',
      id,
      thingCode,
      functionCode: 'web',
    }).then(({ data }) => {
      const propMap = {};
      each(data.detailGroupList, ({ thingPropertyValueVoList }) => {
        each(thingPropertyValueVoList, (item) => {
          propMap[item.thingPropertyId] = item;
        });
      });
      resolve(propMap);
    });
  });

  const getValues = (propList) => new Promise<any[]>((resolve) => {
    getPropertiesValueById(propList).then(({ data }) => {
      resolve(data);
    });
  });

  const getTextInfo = (thingCode, thingInstId, list) => new Promise((resolve) => {
    getValues(map(list, ({ id }) => ({
      thingCode,
      thingInstId,
      thingPropertyId: id
    }))).then((values) => {
      const valueMap = keyBy(values, 'thingPropertyId');
      resolve(map(list, ({
        id,
        displayLabel,
        unit,
        code,
        displayType,
        listInfo,
        listType,
        style,
      }) => {
        let position;
        if (style && style.position) {
          ({ position } = style);
        }
        let showLabel = code !== 'CODE' && code !== 'NAME';
        if (style && !isUndefined(style.showLabel)) {
          ({ showLabel } = style);
        }
        let v = '--';
        if (valueMap[id]) {
          const { displayValue, value } = valueMap[id];
          v = displayValue ?? value ?? '--';
        }
        let listInfoJson = null;
        if (listType === 'json' && listInfo) {
          try {
            listInfoJson = JSON.parse(listInfo);
          } catch {
            console.warn(`${thingInstId} ${code} ${displayLabel} 值转换出错`)
          }
        }
        const info = {
          id,
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
          return {
            type: 'thingButtonGroup',
            position,
            info: {
              ...info,
              btns: [label]
            },
          };
        }
        if (
          displayType === 'switch'
          && listInfoJson
          && size(listInfoJson) === 2
        ) {
          const [
            [unCheckedValue, unCheckedLabel],
            [checkedValue, checkedLabel],
          ] = toPairs(listInfoJson);
          return {
            type: 'thingSwitchGroup',
            position,
            info: {
              ...info,
              switchOpt: {
                checkedLabel,
                checkedValue,
                unCheckedLabel,
                unCheckedValue,
              },
            },
          };
        }
        if (displayType === 'button_parameter') {
          return {
            type: 'thingInputGroup',
            position,
            info: {
              ...info,
              btns: ['下发'],
            },
          };
        }
        return {
          type: 'thingTextGroup',
          position,
          info,
        };
      }));
    });
  });

  return {
    title,
    theme,
    width,
    height,
    playBackEnable,
    mainMapFlag,
    thingMap,
    instanceMap,
    propertyList,
    init,
    load,
    getTemplate,
    getDetail,
    getValues,
    getTextInfo,
    version,
  };
}