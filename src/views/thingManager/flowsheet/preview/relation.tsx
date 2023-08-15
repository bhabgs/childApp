import {
  defineComponent,
  onMounted,
  ref,
  computed,
} from 'vue';
import { useRouter } from 'vue-router';
import { find, map } from 'lodash';
import type { TableColumnsType } from 'ant-design-vue';
import {
  findRelationEntitiesPage,
  getListPageColumns,
  type Props,
  type Entities,
} from '@/api/thingInst';
import Value from './value';

export default defineComponent({
  props: {
    thingInstData: {
      type: Object,
      default: null,
    },
    list: {
      type: Array as () => Props[],
      default: () => [],
    },
  },
  setup(props) {
    const router = useRouter();
    const open = ({ thingInstId, thingInstName, thingCode }) => {
      router.push({
        name: 'DetailOrEdit',
        params: { id: thingInstId },
        query: {
          name: `物实例 (${thingInstName})`,
          thingInfo: JSON.stringify({
            model: thingCode,
            isEdit: false,
          }),
        },
      });
    };
    const active = ref();
    const pageNum = ref(1);
    const total = ref(0);
    const pageSize = 5;
    const columns = ref<TableColumnsType>([]);
    // const columns: TableColumnsType = [
    //   { title: '设备名', dataIndex: 'thingInstName' },
    //   { title: '设备编号', dataIndex: 'thingInstCode' },
    //   { title: '操作', key: 'operation', width: 120, align: 'center' },
    // ];
    const tableData = ref<Entities[]>([]);
    const activeProperty = computed(() => {
      return find(props.list, { thingPropertyId: active.value });
    });
    const getRelationColumns = () => {
      if (activeProperty.value) {
        getListPageColumns({
          thingCode: activeProperty.value.relationThingCode,
          functionCode: 'web',
        }).then(({ data }) => {
          columns.value = map(data, ({ thingPropertyDisplayName, thingPropertyCode }) => ({
            title: thingPropertyDisplayName,
            key: thingPropertyCode,
          }));
          columns.value.push({
            title: '操作',
            key: 'operation',
            width: 120,
            align: 'center',
            fixed: 'right',
          });
        });
      }
    };
    const getRelationList = () => {
      if (activeProperty.value) {
        findRelationEntitiesPage({
          relaThingCode: activeProperty.value.relationThingCode,
          thingCode: props.thingInstData.thingCode,
          thingInstId: props.thingInstData.id,
          thingRelationId: activeProperty.value.value,
          thingInstCode: '',
          thingInstName: '',
          pageNum: pageNum.value,
          pageSize,
        }).then(({ data }) => {
          tableData.value = data.list;
          total.value = data.total;
        });
      }
    };
    const onChange = () => {
      pageNum.value = 1;
      getRelationList();
      getRelationColumns();
    };
    const onTableChange = ({ current }) => {
      pageNum.value = current;
      getRelationList();
    };
    onMounted(() => {
      if (props.list.length) {
        active.value = props.list[0].thingPropertyId;
        getRelationList();
        getRelationColumns();
      }
    });
    return () => (
      <div class="topo-preview-relation">
        {props.list.length === 1 ? (
          <div><strong>{props.list[0].label}</strong></div>
        ) : (
          <a-radio-group
            v-model:value={active.value}
            option-type="button"
            onChange={onChange}
          >
            {props.list.map((item) => (
              <a-radio-button value={item.thingPropertyId}>{item.label}</a-radio-button>
            ))}
          </a-radio-group>
        )}
        <a-table
          class="mt20"
          data-source={tableData.value}
          columns={columns.value}
          pagination={{
            current: pageNum.value,
            pageSize,
            total: total.value,
          }}
          onChange={onTableChange}
          v-slots={{
            bodyCell: ({ column: { key }, record }) => {
              if (key === 'operation') {
                return (
                  <a-button type="link" onClick={() => open(record)}>详情</a-button>
                );
              }
              const finded = find(record.listPropertyList, { thingPropertyCode: key });
              if (finded) {
                return (
                  <Value data={finded}></Value>
                );
              }
              return '';
            },
          }}
        ></a-table>
      </div>
    );
  },
});
