import { each } from 'lodash';

export function getMapStyle (data) {
  console.log(data);
  const instanceMap = {};
  each(data.topoNodeList, ({
    topoNodeEntity: { thingInstanceId },
    responseThingInstEntityVo: { detailGroupList }
  }) => {
    const propsMap = {};
    each(detailGroupList, ({ thingPropertyValueVoList }) => {
      each(thingPropertyValueVoList, (prop) => {
        propsMap[prop.thingPropertyId] = prop;
      });
    });
    console.log(propsMap);
    instanceMap[thingInstanceId] = propsMap;
  });
  each(data.topoNodeList, () => {});
  if (data.topoMapEntity.style) {
    const children: any[] = [];
    each(data.topoMapEntity.style.children, (layer) => {
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
            if (instanceMap[iu]) {
              if (data.thingCodeAndStateImageMap[tc]) {
                const {
                  powerOffImage,
                  runImage,
                  alarmImage,
                  powerOnImage,
                } = data.thingCodeAndStateImageMap[tc];
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
              const thingLayerChildren: any[] = [];
              each(thingLayer.children, (propLayer) => {
                const { attrs: { cdata, name }, children, className } = propLayer;
                if (
                  className === 'Group'
                  && (
                    name === 'thingDefTextGroup'
                    || name === 'thingTextGroup'
                  )
                ) {
                  console.log(instanceMap, iu, cdata.propertyId);
                  const prop = instanceMap[iu][cdata.propertyId];
                  console.log(prop);
                  if (prop) {
                    cdata.thingTextInfo.code = prop.thingPropertyCode;
                    cdata.thingTextInfo.label = prop.label;
                    cdata.thingTextInfo.unit = prop.unit;
                    cdata.thingTextInfo.v = prop.displayValue;
                    each(children, ({ attrs, className }) => {
                      if (className === 'Text') {
                        if (attrs.name === 'val') {
                          attrs.text = prop.displayValue;
                        } else if (attrs.name === 'label') {
                          attrs.text = `${prop.label}：`;
                        } else if (attrs.name === 'unit') {
                          attrs.text = prop.unit;
                        }
                      }
                    });
                    thingLayerChildren.push(propLayer);
                  }
                } else {
                  thingLayerChildren.push(propLayer);
                }
              });
              thingLayer.children = thingLayerChildren;
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
      } else {
        children.push(layer);
      }
    });
    return {
      ...data.topoMapEntity.style,
      children,
    };
  }
  return null;
};
