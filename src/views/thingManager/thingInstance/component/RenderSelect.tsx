import {
  defineComponent,
  ref,
  onMounted,
  reactive,
  watch,
  computed,
} from 'vue';
import instance from '@/api';
import { getSelectOption } from '@/api/thingInstance';
import _ from 'lodash';
interface SelectOption {
  value: string | number;
  key: string;
}

export default defineComponent({
  name: 'RenderSelect',
  props: {
    attrInfo: {
      type: Object,
      required: true,
    },
    value: {
      type: [String, Number, Array, Boolean],
      default: true,
    },
    apiParam: {
      type: [String, Number, Array<String | Number>],
      default: '',
    },
    isEdit: {
      type: Boolean,
      default: true,
    },
  },
  emits: ['change'],
  setup(props, { emit, expose }) {
    const state = reactive<{
      list: SelectOption[];
      value: any;
    }>({
      list: [],
      value: undefined,
    });
    const propDisplayType = computed(() => {
      return props.attrInfo?.displayType?.toUpperCase();
    });

    const getSelectList = async (ele: any) => {
      if (!ele.listInfo) {
        state.list = [];
        return;
      }
      const displayType = ele.displayType.toUpperCase();
      if (ele.listType === 'json') {
        const arr: SelectOption[] = [];
        const selectInfo = JSON.parse(ele.listInfo || '[]');
        for (const key in selectInfo) {
          arr.push({ value: key, ['key']: selectInfo[key] });
        }
        state.list = arr;
      } else if (ele.listType == 'request') {
        const { data } = await instance.get(ele.listInfo + props.apiParam);
        state.list = data;
      } else if (ele.listType == 'sql' || ele.listType == 'thing') {
        const data = {
          propertyId: ele.id || ele.thingPropertyId,
          propertyCode: ele.code || ele.thingPropertyCode,
          displayType: ele.displayType.toLowerCase(),
          listType: ele.listType,
          listInfo: ele.listInfo,
        };
        if (
          displayType === 'SELECT_ATOMIC' &&
          typeof props.apiParam === 'object'
        ) {
          props.apiParam.forEach((param: any) => {
            data.listInfo = data.listInfo.replace(/\${.*?\}/, param);
          });
        }
        const res = await getSelectOption(
          ele.thingCode || 'HEAVY_MEDIUM_VESSEL',
          data
        );
        if (displayType.indexOf('TREE') === -1) {
          res.data = res.data.map((el) => {
            return {
              key: el.value,
              value: el.key,
            };
          });
        }
        state.list = res.data;
      }
    };
    const handleChange = (val) => {
      emit('change', val);
    };
    const getSelectName = () => {
      // const item = state.list.find(
      //   (el: SelectOption) => el.value === state.value
      // );
      return props.attrInfo.displayValue || '--';
    };

    watch(
      () => props.apiParam,
      (n, o) => {
        //避免['12'] ！==['12]的情况，因为这个值每次都是返回一个新值
        if (
          n &&
          o &&
          typeof n === 'object' &&
          typeof o === 'object' &&
          _.isEqual(n, o)
        ) {
          return;
        }
        state.value = undefined;
        handleChange(state.value);
        if (
          (typeof n === 'string' && n) ||
          (n && typeof n === 'object' && n.length > 0)
        ) {
          getSelectList(props.attrInfo);
        } else {
          state.list = [];
        }
      },
      {
        immediate: false,
      }
    );
    watch(() => props.value, (n) => {
      state.value = n;
    })
    onMounted(() => {
      state.value = props.value;
      const apiParam = props.apiParam;
      //非级联可直接加载数据，级联要根据关联属性的值决定要不要加载
      if (
        propDisplayType.value !== 'SELECT_ATOMIC' ||
        (typeof apiParam === 'string' && apiParam) ||
        (apiParam && typeof apiParam === 'object' && apiParam.length > 0)
      ) {
        getSelectList(props.attrInfo);
      }
    });

    return () => (
      <>
        {props.isEdit ? (
          <>
            {propDisplayType.value === 'SELECT' ||
            propDisplayType.value === 'SELECT_ATOMIC' ? (
              <a-select
                v-model={[state.value, 'value']}
                onChange={handleChange}
                allow-clear
                style={{ width: '100%' }}
                optionFilterProp='key'
                show-search
                options={state.list}
                fieldNames={{ label: 'key', value: 'value' }}
              ></a-select>
            ) : (
              <a-tree-select
                v-model={[state.value, 'value']}
                show-search
                allow-clear
                tree-data={state.list}
                style={{ width: '100%' }}
                field-names={{
                  children: 'children',
                  label: 'value',
                  value: 'key',
                }}
                onChange={handleChange}
              ></a-tree-select>
            )}
          </>
        ) : (
          <span class='value'>{getSelectName()}</span>
        )}
      </>
    );
  },
});
