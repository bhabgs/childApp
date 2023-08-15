import {
  defineComponent,
  ref,
  onMounted,
  onUnmounted,
  watch,
} from 'vue';
import { useRouter } from 'vue-router';
import { message } from 'ant-design-vue';
import { LoadingOutlined } from '@ant-design/icons-vue';
import { useFullscreen } from '@vueuse/core';
import {
  each,
  map,
  filter,
  trim,
  groupBy,
  find,
  debounce,
  keyBy,
} from 'lodash';
import Tree from './tree';
import Title from './title';
import Operation, { OperationExpose } from './operation';
import Editor from '@/components/editor';
import * as topoMapAPI from '@/api/topoMap';
import * as thingAPI from '@/api/thing';
import type { Proptype } from '@/api/topoThingProperty';
import { base64toFile } from '@/utils';
import CreateInstance from './createInstance';
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
    const { id: pageId, type: pageType } = router.currentRoute.value.params;
    // 标题
    
    // 画图工具Ref
    const editorRef = ref();
    // 是否展示左侧
    const showLeft = ref(true);
    // 是否展示右侧
    const showRight = ref(true);
    // Loading
    const loading = ref(false);
    // 右侧操作区域组件
    const operation = ref<OperationExpose>();

    // 页面Ref，为全屏用
    const pageRef = ref();
    // 全屏控制
    const { isFullscreen, toggle } = useFullscreen(pageRef, {
      autoExit: true,
    });

    const {
      title,
      theme,
      width,
      height,
      playBackEnable,
      mainMapFlag,
      thingMap,
      propertyList,
      getTemplate,
      load,
      getValues,
      getTextInfo,
      version,
    } = useTopoMap();

    const setChildrens = (thingCode, thingInstId) => {
      getTemplate(thingCode).then((propList) => {
        if (propList && propList.length) {
          const list = filter(propList, (item) => item.eventEnable && item.style);
          getTextInfo(thingCode, thingInstId, list).then((infos) => {
            editorRef.value.setChildrens(thingInstId, infos);
          });
        }
      });
    };

    const createInstanceRef = ref();
    const createInstance = (data, group) => {
      createInstanceRef.value.open(data, group);
    };
    const onInstChange = ({
      group,
      thingCode,
      thingInstId,
      thingInstCode,
      instanceName,
      source,
    }) => {
      if (source === 'thing') {
        group.attrs.id = thingInstId;
        const data = {
          tc: thingCode,
          ic: thingInstCode,
          iu: thingInstId,
          instanceName,
        };
        editorRef.value.setAttrs(group, data);
        setChildrens(thingCode, thingInstId);
      }
    };

    // 拖入画图工具的回调，拖入后获取属性模板，初始化物实例的子属性显示
    const onDrop = ({ thingInfo, group }) => {
      if (thingInfo.source === 'instance') {
        setChildrens(thingInfo.tc, thingInfo.iu);
      } else if (thingInfo.source === 'thing') {
        createInstance(thingInfo, group);
      }
      if (operation.value) {
        operation.value.getEventsTemplate(thingInfo.tc);
      }
    };

    // 画图工具选中的内容
    const selected = ref();
    // 画图工具选中回调
    const onSelect = (val) => {
      console.log(val);
      if (
        operation.value
        && val
        && (
          val.type === 'thing'
          || val.type === 'line'
        )
        && val.data.iu
      ) {
        const thingCode = val.event.parent.attrs.cdata.thing.tc;
        getTemplate(thingCode);
        operation.value.getEventsTemplate(thingCode);
      }
    };
    // 记录图上存在的物实例
    const allIus = ref<string[]>([]);
    // 画图工具物实例变更回调
    const onThingChange = (ius: string[]) => {
      allIus.value = ius;
    };

    // 画布元素尺寸变化的回调
    const onTransform = debounce(() => {
      if (operation.value) {
        operation.value.getScale();
      }
    }, 500);

    // 连线的回调，目前只在工艺流程图中创建线的实例
    const onLineCreated = (line) => {
      const lineType = line.attrs.cdata.lineInfo.type;
      if (lineType === 'Line' || lineType === 'rightAngleLine') {
        const { from, to } = line.attrs.cdata.lineInfo;
        const fromImg = editorRef.value.findGroup(from);
        const fromAttrs = fromImg.parent.attrs;
        const fromName = fromAttrs.name === 'thingGroup' ? fromAttrs.cdata.thing.instanceName : '未命名';
        const toImg = editorRef.value.findGroup(to);
        const toAttrs = toImg.parent.attrs;
        const toName = toAttrs.name === 'thingGroup' ? toAttrs.cdata.thing.instanceName : '未命名';
        let tc;
        if (pageType === 'device_connect') {
          tc = 'PIPELINE';
        } else if (pageType === 'process_connect') {
          tc = 'FLOW';
        }
        createInstanceRef.value.createInstance(tc, `${fromName} -> ${toName}`).then(({
          thingCode,
          thingInstId,
          thingInstCode,
          thingInstName,
        }) => {
          const data = {
            tc: thingCode,
            ic: thingInstCode,
            iu: thingInstId,
            instanceName: thingInstName,
            showCard: true,
          };
          editorRef.value.createLineGroup(line, data);
          setChildrens(thingCode, thingInstId);
        });
      }
    };

    // 保存整张图
    const save = (source = '') => new Promise((resolve) => {
      const { image, mapJson, res } = editorRef.value.toJson(source);
      // 画图工具判断如果存在选中状态或在连线状态 res 返回 false
      if (res !== false && !loading.value) {
        // 开启Loading
        loading.value = true;
        // 生成图片
        const file = base64toFile(image, 'chartImg');
        // 上传图片
        thingAPI.uploadImage(file).then(({ data: image }) => {
          // 从画图工具获取节点和连线
          const { nodes, edges } = editorRef.value.getNodesAndEdges();
          // 记录图工具生成的 ID 和物实例 iu 的关系
          const nodeImageMap: Record<string, string> = {};
          // 获取LineID，将图中的 ID 转为 iu
          const getLineId = (nodeId) => {
            if (nodeId) {
              if (nodeImageMap[nodeId]) {
                return nodeImageMap[nodeId];
              }
              return nodeId;
            }
            return null;
          };
          const topoNodeList: topoMapAPI.TopoNodeEntity[] = [];
          const mapId = pageId as string;
          each(nodes, ({ attrs, children }) => {
            // 如果是物实例
            if (attrs.name === 'thingGroup') {
              const {
                iu,
                tc,
                instanceName,
                showCard,
              } = attrs.cdata.thing;
              const groups = groupBy(children, (c) => c.attrs.name === 'thingImage' ? 'image' : 'property');
              if (groups.image) {
                nodeImageMap[groups.image[0].attrs.id] = iu;
              }
              topoNodeList.push({
                type: 'thing',
                mapId,
                thingCode: tc,
                thingInstanceId: iu,
                thingInstanceName: instanceName,
                showCard,
                showPropertyList: map(groups.property, (p) => p.attrs.cdata.propertyId),
              });
            }
          });
          let errMsg = '';
          const topoLineList: topoMapAPI.TopoLineEntity[] = [];
          each(edges, (edge) => {
            let line;
            let inst;
            if (edge?.attrs?.name === 'thingGroup') {
              line = find(edge.children, (child) => child.name() === 'line');
              if (edge?.attrs?.cdata?.thing?.iu) {
                inst = edge;
              }
            }
            if (line) {
              const { attrs: { cdata: { lineInfo: { from, to } } } } = line;
              const aNodeId = getLineId(from);
              const zNodeId = getLineId(to);
              if (aNodeId && zNodeId) {
                if (inst) {
                  const {
                    iu,
                    tc,
                    instanceName,
                    showCard,
                  } = inst.attrs.cdata.thing;
                  const showPropertyList: string[] = [];
                  each(inst.children, (child) => {
                    if (child.attrs.name === 'thingDefTextGroup' || child.attrs.name === 'thingTextGroup') {
                      showPropertyList.push(child.attrs.cdata.propertyId);
                    }
                  });
                  topoLineList.push({
                    mapId,
                    type: tc === 'FLOW' ? 'processline' : 'pipeline',
                    aNodeId,
                    zNodeId,
                    thingCode: tc,
                    thingInstanceId: iu,
                    thingInstanceName: instanceName,
                    showCard,
                    showPropertyList: showPropertyList,
                  });
                } else {
                  topoLineList.push({
                    mapId,
                    type: 'line',
                    aNodeId,
                    zNodeId,
                    showPropertyList: null,
                  });
                }
              } else {
                errMsg = `${line.attrs.id} ${!aNodeId ? '起点' : ''} ${!zNodeId ? '终点' : ''} 数据异常，请调整连线重试`;
                return false;
              }
            }
          });
          if (errMsg) {
            message.error(errMsg);
            loading.value = false;
          } else {
            const style = JSON.parse(mapJson);
            style.attrs.topoMapVersion = version;
            topoMapAPI.saveAll({
              topoMapEntity: {
                id: pageId as string,
                functionCode: pageType as string,
                title: trim(title.value) || `未命名${pageType === 'device_connect' ? '设备' : '工艺'}流程图`,
                image,
                theme: theme.value,
                style,
                width: width.value,
                height: height.value,
                playBackEnable: playBackEnable.value,
                mainMapFlag: mainMapFlag.value,
              },
              topoNodeList,
              topoLineList,
            }).then((res) => {
              if (res.data === true) {
                if (source !== 'preview') {
                  if (source === 'auto') {
                    message.success('已自动保存');
                  } else {
                    message.success('保存成功');
                  }
                }
                resolve(true);
              }
            }).catch(() => {
              message.error('保存失败，请重试');
            }).finally(() => {
              loading.value = false;
            });
          }
        }).catch(() => {
          message.error('缩略图保存失败，请重试');
          loading.value = false;
        });
      }
    });

    // 预览
    const preview = () => {
      // 先保存再预览
      save('preview').then(() => {
        router.push({
          name: 'flowsheetPreview',
          params: { type: pageType, id: pageId },
          query: { name: `预览_${title.value}` },
        });
      });
    };

    const onInstanceUpdate = () => {
      const {
        data: { ids, iu },
        event: { parent: { attrs: { cdata: { thing: { tc } } } } },
      } = selected.value;
      getValues(map(ids, (thingPropertyId) => ({
        thingCode: tc,
        thingInstId: iu,
        thingPropertyId,
      }))).then((data) => {
        editorRef.value.setTextValues(data);
      });
    };

    const onTemplateUpdate = (tc) => {
      getTemplate(tc, true);
    };

    onMounted(() => {
      load(pageId, pageType).then((style) => {
        editorRef.value.loadJson(style).then(() => {
          getValues(propertyList.value).then((values) => {
            editorRef.value.resetTexts(values, thingMap.value);
          });
        });
      });
    });

    // 自动保存
    let autoSaveTimer: NodeJS.Timeout | null = null;
    const stopAutoSave = () => {
      if (autoSaveTimer) {
        clearInterval(autoSaveTimer);
        autoSaveTimer = null;
      }
    };
    const startAutoSave = () => {
      // stopAutoSave();
      // autoSaveTimer = setInterval(() => {
      //   save('auto');
      // }, 60000);
    };
    onMounted(() => {
      startAutoSave();
    });
    onUnmounted(() => {
      stopAutoSave();
    });
    watch(() => props.isActive, (val) => {
      if (val) {
        startAutoSave();
      } else {
        stopAutoSave();
      }
    });

    return () => (
      <div ref={pageRef} class="topo-detail-page">
        {pageType === 'device_connect' && (
          <Tree
            v-show={showLeft.value}
            class="topo-detail-left"
            type={pageType}
            source="instance"
            editor={editorRef.value}
            nodes={allIus.value}
          ></Tree>
        )}
        {pageType === 'process_connect' && (
          <a-tabs v-show={showLeft.value} class="topo-detail-left topo-detail-tree">
            <a-tab-pane key="thing" tab="工艺作业">
              <Tree
                type={pageType}
                source="thing"
                editor={editorRef.value}
                nodes={allIus.value}
              ></Tree>
            </a-tab-pane>
            <a-tab-pane key="instance" tab="煤种">
              <Tree
                type={pageType}
                source="instance"
                editor={editorRef.value}
                nodes={allIus.value}
              ></Tree>
            </a-tab-pane>
          </a-tabs>
        )}
        <div class="topo-detail-center">
          <Editor
            ref={editorRef}
            v-model={[selected.value, 'selected']}
            theme={theme.value}
            show-tools
            type={pageType as string}
            onDrop={onDrop}
            onSelect={onSelect}
            onTransform={onTransform}
            onThingChange={onThingChange}
            onLineCreated={onLineCreated}
            v-slots={{
              title: () => <Title v-model={[title.value, 'title']} class="topo-detail-title-wrap"></Title>,
              extra: () => (
                <a-space>
                  <a-tooltip placement="bottom" title="保存" get-popup-container={(n) => n}>
                    <div
                      class="topo-detail-tools-item"
                      onClick={() => save()}
                    >
                      <a-spin
                        size="small"
                        spinning={loading.value}
                        v-slots={{
                          indicator: () => <LoadingOutlined class="fz14" spin></LoadingOutlined>
                        }}
                      >
                        <icon-font type="icon-gongyituguanli_quanjucaozuo_baocun"></icon-font>
                      </a-spin>
                    </div>
                  </a-tooltip>
                  <a-tooltip
                    placement="bottom"
                    title={showLeft.value ? '收起左侧' : '展开左侧'}
                    get-popup-container={(n) => n}
                  >
                    <div
                      class="topo-detail-tools-item"
                      onClick={() => { showLeft.value = !showLeft.value }}
                    >
                      <icon-font type="icon-gongyituguanli_quanjucaozuo_shouqizuoce"></icon-font>
                    </div>
                  </a-tooltip>
                  <a-tooltip
                    placement="bottom"
                    title={showRight.value ? '收起右侧' : '展开右侧'}
                    get-popup-container={(n) => n}
                  >
                    <div
                      class="topo-detail-tools-item"
                      onClick={() => { showRight.value = !showRight.value }}
                    >
                      <icon-font type="icon-gongyituguanli_quanjucaozuo_shouqiyouce"></icon-font>
                    </div>
                  </a-tooltip>
                  <a-tooltip placement="bottom" title="适应画布" get-popup-container={(n) => n}>
                    <div
                      class="topo-detail-tools-item"
                      onClick={() => { editorRef.value.fit() }}
                    >
                    <icon-font type="icon-gongyituguanli_quanjucaozuo_shiyinghuabu"></icon-font>
                    </div>
                  </a-tooltip>
                  <a-tooltip placement="bottom" title="预览" get-popup-container={(n) => n}>
                    <div
                      class="topo-detail-tools-item"
                      onClick={preview}
                    >
                      <icon-font type="icon-gongyituguanli_quanjucaozuo_yulan"></icon-font>
                    </div>
                  </a-tooltip>
                  <a-tooltip
                    placement="bottom"
                    title={isFullscreen.value ? '退出全屏' : '全屏'}
                    get-popup-container={(n) => n}
                  >
                    <div
                      class="topo-detail-tools-item"
                      onClick={toggle}
                    >
                      <icon-font type={
                        isFullscreen.value
                          ? 'icon-gongyituguanli_quanjucaozuo_tuichuquanping'
                          : 'icon-gongyituguanli_quanjucaozuo_quanping'
                      }></icon-font>
                    </div>
                  </a-tooltip>
                </a-space>
              ),
            }}
          ></Editor>
        </div>
        <Operation
          ref={operation}
          v-show={showRight.value}
          class="topo-detail-right"
          type={pageType as string}
          v-model:theme={theme.value}
          v-model:width={width.value}
          v-model:height={height.value}
          v-model:playBackEnable={playBackEnable.value}
          v-model:mainMapFlag={mainMapFlag.value}
          editor={editorRef.value}
          selected={selected.value}
          thing-map={thingMap.value}
          onInstanceUpdate={onInstanceUpdate}
          onTemplateUpdate={onTemplateUpdate}
        ></Operation>
        <CreateInstance ref={createInstanceRef} onChange={onInstChange}></CreateInstance>
      </div>
    );
  },
});
