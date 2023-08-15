import {
  defineComponent,
  ref,
  computed,
  watch,
} from 'vue';
import {
  filter,
  includes,
  map,
  groupBy,
  startsWith,
  difference,
  differenceBy,
  every,
  some,
  remove,
  find,
} from 'lodash';
import { SearchOutlined } from '@ant-design/icons-vue';
import { Proptype } from '@/api/topoThingProperty';

export default defineComponent({
  props: {
    /**
     * 属性列表
     */
    list: {
      type: Array as () => Proptype[],
      default: [],
    },
    /**
     * 当前图中选中的内容
     */
    checked: {
      type: Array as () => string[],
      default: [],
    },
  },
  emits: ['add', 'remove', 'check'],
  setup(props, { emit }) {
    // 搜索
    const searchText = ref('');

    // 计算搜索后的属性
    const filterProptypes = computed(() => {
      if (searchText.value) {
        return filter(props.list, ({ name }) => includes(name, searchText.value));
      }
      return props.list;
    });

    // 计算分组后的属性
    const proptypeList = computed(() => {
      return map(groupBy(filterProptypes.value, 'groupName'), (children, groupName) => ({
        id: `group_${groupName}`,
        name: groupName,
        displayLabel: groupName,
        groupName,
        children,
      }));
    });

    // 树展开的 Keys
    const expandedKeys = ref<string[]>([]);
    // 树勾选的 Keys
    const checkedKeys = ref<string[]>([]);
    // 选择全部属性的状态
    const checkAll = computed(() => {
      return every(filterProptypes.value, ({ id }) => includes(checkedKeys.value, id));
    });
    // 选择全部属性的半选择状态
    const indeterminate = computed(() => {
      return !checkAll.value && some(filterProptypes.value, ({ id }) => includes(checkedKeys.value, id));
    });
    // 勾选选择全部属性的回调
    const onCheckAll = () => {
      if (checkAll.value) {
        const toRemove: string[] = [];
        remove(checkedKeys.value, (id) => !!find(filterProptypes.value, (item) => {
          if (item.id === id) {
            toRemove.push(id);
            return true;
          }
          return false;
        }));
        emit('remove', toRemove);
      } else if (indeterminate.value) {
        const toAdd = filter(filterProptypes.value, ({ id }) => !includes(checkedKeys.value, id));
        emit('add', toAdd);
        checkedKeys.value.push(...map(toAdd, 'id'));
      } else {
        emit('add', [...filterProptypes.value]);
        checkedKeys.value.push(...map(filterProptypes.value, 'id'));
      }
      emit('check', checkedKeys.value);
    };
    // 勾选属性的回调
    const onCheck = (cks, { checked, node }) => {
      const oldChecked = [...checkedKeys.value];
      if (startsWith(node.id, 'group_')) {
        const { dataRef: { children } } = node;
        const operationKeys = map(children, 'id');
        if (checked) {
          const toAdd = difference(operationKeys, oldChecked);
          emit('add', differenceBy(children, map(oldChecked, (id) => ({ id })), 'id'));
          checkedKeys.value.push(...toAdd);
        } else {
          emit('remove', operationKeys);
          remove(checkedKeys.value, (id) => includes(operationKeys, id));
        }
      } else {
        const { id } = node;
        if (checked) {
          emit('add', [node]);
          checkedKeys.value.push(id);
        } else {
          emit('remove', [id]);
          remove(checkedKeys.value, (item) => item === id);
        }
      }
      emit('check', checkedKeys.value);
    };
    // 监听选中变化
    watch(() => props.list, () => {
      expandedKeys.value = map(proptypeList.value, 'id');
    }, { immediate: true });
    // 监听勾选变化
    watch(() => props.checked, (val) => {
      checkedKeys.value = [...val];
    }, { immediate: true });

    return () => (
      <>
        <a-input
          v-model={[searchText.value, 'value']}
          placeholder="搜索属性"
          allow-clear
          suffix={<SearchOutlined title="搜索" class="curp"></SearchOutlined>}
        ></a-input>
        <a-checkbox
          checked={checkAll.value}
          indeterminate={indeterminate.value}
          onChange={onCheckAll}
        >全选所有属性</a-checkbox>
        <a-tree
          class="topo-detail-operation-tree"
          v-model={[expandedKeys.value, 'expandedKeys']}
          field-names={{ key: 'id', title: 'displayLabel' }}
          tree-data={proptypeList.value}
          checked-keys={checkedKeys.value}
          checkable
          onCheck={onCheck}
        ></a-tree>
      </>
    );
  },
});
