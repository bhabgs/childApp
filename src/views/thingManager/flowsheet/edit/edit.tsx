import {
  defineComponent,
  ref,
  computed,
  watch,
} from 'vue';
import {
  each,
  map,
  find,
  replace,
  groupBy,
} from 'lodash';
import { message } from 'ant-design-vue';
import { findByIdModify, modify } from '@/api/thingInst';
import EditItem from './editItem';
import Value from '../preview/value';
import EditConfig from './editConfig';
import Block from './block';

export default defineComponent({
  props: {
    selected: {
      type: Object,
      default: null,
    },
  },
  emits: ['update'],
  setup(props, { emit }) {
    const propertyList = ref<any[]>([]);
    const propList = computed(() => {
      return groupBy(map(propertyList.value, (item, index) => {
        let sql = '';
        if ((item.listType === 'sql' || item.listType === 'thing') && item.listInfo) {
          sql = item.listInfo;
          if (item.displayType === 'SELECT_ATOMIC') {
            let validSql = true;
            sql = replace(item.listInfo, /\$\{(.+?)\}/g, (str, thingPropertyCode) => {
              const finded = find(propertyList.value, { thingPropertyCode });
              if (finded && finded.value) {
                return finded.value;
              }
              validSql = false;
              return '';
            });
            if (!validSql) {
              sql = '';
            }
          }
        }
        return {
          ...item,
          sql,
          index,
        };
      }), 'groupName');
    });
    const thing = computed(() => {
      if (props.selected.type === 'thing' || props.selected.type === 'line') {
        return {
          iu: props.selected.data.iu,
          tc: props.selected.event.parent.attrs.cdata.thing.tc,
        };
      }
      return {
        iu: '',
        tc: '',
      };
    });
    const getPropertyData = () => {
      if (thing.value) {
        findByIdModify({
          requestType: 'all',
          id: thing.value.iu,
          thingCode: thing.value.tc,
          functionCode: 'web',
        }).then(({ data }) => {
          const ps: any[] = [];
          each(data.detailGroupList, ({ groupName, thingPropertyValueVoList }) => {
            each(thingPropertyValueVoList, (item) => {
              if (item.propertyType === 'PROPERTY' || item.propertyType === 'LOGIC') {
                ps.push({
                  ...item,
                  groupName,
                });
              }
            });
          });
          propertyList.value = ps;
        });
      }
    };
    watch(() => thing.value, (val) => {
      if (val && val.iu) {
        getPropertyData();
      }
    }, { immediate: true });
    const save = () => {
      if (thing.value) {
        modify({
          thingInstId: thing.value.iu,
          thingCode: thing.value.tc,
          propertyVoList: propertyList.value,
        }).then(() => {
          message.success('保存成功');
          emit('update', thing.value);
        });
      }
    };
    const editConfigRef = ref();
    const onConfig = (item) => {
      editConfigRef.value.open(thing.value.iu, item);
    };
    return () => (
      <>
        <div class="topo-detail-operation-form">
          {map(propList.value, (ps, groupName) => (
            <Block title={groupName}>
              <a-form label-col={{ span: 8 }}>
                {map(ps, (item) => (
                  <a-form-item label={item.label}>
                    {item.thingInstPropertyValidVo.readonly ? (
                      <Value data={item}></Value>
                    ) : (
                      <EditItem
                        v-model={propertyList.value[item.index].value}
                        data={item}
                        thingCode={thing.value?.tc}
                        onConfig={onConfig}
                      ></EditItem>
                    )}
                  </a-form-item>
                ))}
              </a-form>
            </Block>
          ))}
        </div>
        <div class="tac">
          <a-button type="primary" onClick={save}>保存</a-button>
        </div>
        <EditConfig
          ref={editConfigRef}
          thingCode={thing.value.tc}
        ></EditConfig>
      </>
    );
  },
});
