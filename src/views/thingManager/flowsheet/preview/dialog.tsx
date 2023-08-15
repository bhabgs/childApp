import { defineComponent, ref } from 'vue';
import {
  each,
  truncate,
  some,
  cloneDeep,
} from 'lodash';
import {
  findById,
  findRelationEntitiesPage,
  type Group,
} from '@/api/thingInst';
import Value from './value';
import CameraList from './cameraList';
import Relation from './relation';
import Files from './files';

export default defineComponent({
  props: ['parent', 'theme', 'values'],
  emits: ['open', 'close', 'change'],
  setup(props, { emit, expose }) {
    const visible = ref(false);
    const dialogData = ref<{
      title: string;
      id: string;
      thingCode: string;
    }>({
      title: '',
      id: '',
      thingCode: '',
    });
    const tabList = ref<Group[]>([]);
    const activeKey = ref<string>('');
    const cameraList = ref<string[]>([]);
    const setCamera = (cameraData) => {
      findRelationEntitiesPage({
        ...cameraData,
        thingInstCode: '',
        thingInstName: '',
        pageNum: 1,
        pageSize: 100,
      }).then(({ data }) => {
        const list: string[] = [];
        each(data.list, (item) => {
          each(item.listPropertyList, (i) => {
            if (i.thingPropertyCode === 'CODE') {
              list.push(i.value);
            }
          });
        });
        cameraList.value = list;
      });
    };
    const open = (pageData) => {
      dialogData.value = pageData;
      findById({
        requestType: 'all',
        id: pageData.id,
        thingCode: pageData.thingCode,
        functionCode: 'topo',
      }).then(({ data }) => {
        visible.value = true;
        if (data.detailGroupList && data.detailGroupList.length) {
          tabList.value = cloneDeep(data.detailGroupList);
          activeKey.value = data.detailGroupList[0].groupName;
          const list: string[] = [];
          each(data.detailGroupList, ({ thingPropertyValueVoList }, groupIndex) => {
            each(thingPropertyValueVoList, ({
              thingPropertyCode,
              relationThingCode,
              thingPropertyId,
              value,
            }, propIndex) => {
              if (thingPropertyCode === 'CAMERA') {
                tabList.value[groupIndex].thingPropertyValueVoList.splice(propIndex, 1);
                if (tabList.value[groupIndex].thingPropertyValueVoList.length === 0) {
                  tabList.value.splice(groupIndex, 1);
                }
                setCamera({
                  relaThingCode: relationThingCode,
                  thingCode: pageData.thingCode,
                  thingInstId: pageData.id,
                  thingRelationId: value,
                });
              } else {
                list.push(thingPropertyId);
              }
            });
          });
          emit('open', {
            thingInstId: pageData.id,
            list,
          });
        }
      });
    };
    const onClosed = () => {
      emit('close');
      tabList.value = [];
      activeKey.value = '';
      cameraList.value = [];
    };
    expose({
      open,
    });

    const renderTabPane = (group) => {
      if (group.thingPropertyValueVoList && group.thingPropertyValueVoList.length) {
        if (some(group.thingPropertyValueVoList, ({ displayType }) => displayType === 'TABLE')) {
          return (
            <Relation
              thingInstData={dialogData.value}
              list={group.thingPropertyValueVoList}
            ></Relation>
          );
        }
        if (some(group.thingPropertyValueVoList, ({ displayType }) => displayType === 'FILE')) {
          return (
            <Files
              thingInstData={dialogData.value}
              thingPropertyId={group.thingPropertyValueVoList[0].thingPropertyId}
            ></Files>
          );
        }
        return (
          <div class="topo-preview-dialog-props">
            {group.thingPropertyValueVoList.map((item) => (
              <div class="topo-preview-dialog-line">
                <span class="topo-preview-dialog-label topo-preview-dialog-alarm-label">
                  <span title={item.label}>{item.label}</span>
                  ：
                </span>
                <Value
                  data={item}
                  value={props.values[`${dialogData.value.id}.${item.thingPropertyId}`]}
                  instanceId={dialogData.value.id}
                  onChange={() => emit('change')}
                ></Value>
              </div>
            ))}
          </div>
        );
      }
      return (
        <a-empty description="暂无数据"></a-empty>
      );
    };

    return () => (
      <a-modal
        class={['topo-preview-modal', `topo-preview-modal-${props.theme}`]}
        v-model={[visible.value, 'visible']}
        title={dialogData.value.title}
        centered
        width="100%"
        mask={false}
        mask-closable={false}
        wrap-class-name="topo-preview-modal-wrap"
        footer={null}
        get-container={() => { return props.parent; }}
        after-close={onClosed}
      >
        <div class={['topo-preview-dialog', {
          'topo-preview-dialog-camera': cameraList.value.length > 0
        }]}>
          {tabList.value.length ? (
            <a-tabs v-model:activeKey={activeKey.value} class="topo-preview-tabs">
              {tabList.value.map((group) => (
                <a-tab-pane key={group.groupName} tab={group.groupName}>
                  {renderTabPane(group)}
                </a-tab-pane>
              ))}
            </a-tabs>
          ) : (
            <a-empty class="topo-preview-dialog-empty"></a-empty>
          )}
          {cameraList.value.length > 0 && (
            <CameraList list={cameraList.value}></CameraList>
          )}
        </div>
      </a-modal>
    );
  },
});
