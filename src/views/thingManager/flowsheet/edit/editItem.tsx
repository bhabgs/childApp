import {
  defineComponent,
  computed,
  ref,
  watch,
} from 'vue';
import { toLower } from 'lodash';
import { getSelectValues } from '@/api/thingInst';

export default defineComponent({
  props: {
    modelValue: {
      type: [String, Number],
      default: '',
    },
    data: {
      type: Object,
      default: null,
    },
    thingCode: {
      type: String,
      default: '',
    },
  },
  emits: ['update:modelValue', 'config'],
  setup(props, { emit }) {
    const v = computed({
      get() {
        return props.modelValue;
      },
      set(val) {
        emit('update:modelValue', val);
      },
    });
    const selectList = ref<any[]>([]);
    watch(() => props.data.sql, (val, oldVal) => {
      if (oldVal) {
        v.value = '';
      }
      const {
        displayType,
        listType,
        thingPropertyCode,
        thingPropertyId,
      } = props.data;
      if (val) {
        getSelectValues(props.thingCode, {
          displayType: toLower(displayType),
          listType: listType,
          listInfo: val,
          propertyCode: thingPropertyCode,
          propertyId: thingPropertyId,
        }).then(({ data }) => {
          selectList.value = data;
        });
      } else {
        selectList.value = [];
      }
    }, { immediate: true });
    const config = () => {
      emit('config', props.data);
    };
    const renderItem = () => {
      if (props.data) {
        if (props.data.propertyType === 'LOGIC' && props.data.thingPropertyInstId) {
          return (
            <a-button
              type="primary"
              ghost
              onClick={config}
            >逻辑计算</a-button>
          );
        }
        if (props.data.displayType === 'TEXT') {
          return (
            <a-input
              v-model:value={v.value}
              placeholder="请输入"
              suffix={props.data.unit}
            ></a-input>
          );
        }
        if (props.data.displayType === 'TEXTAREA') {
          return (
            <a-textarea
              v-model:value={v.value}
              placeholder="请输入"
              rows={1}
            ></a-textarea>
          );
        }
        if (props.data.displayType === 'NUMBER') {
          let precision;
          let max;
          let min;
          let step;
          if (props.data.thingInstPropertyValidVo) {
            ({
              decimalPlace: precision,
              maxValue: max,
              minValue: min,
              step,
            } = props.data.thingInstPropertyValidVo);
          }
          return (
            <a-input-number
              v-model:value={v.value}
              placeholder="请输入"
              addon-after={props.data.unit}
              precision={precision}
              max={max}
              min={min}
              step={step || 1}
            ></a-input-number>
          );
        }
        if (props.data.displayType === 'DATE') {
          return (
            <a-date-picker
              v-model:value={v.value}
              value-format="YYYY-MM-DD"
            ></a-date-picker>
          );
        }
        if (props.data.displayType === 'DATETIME') {
          return (
            <a-date-picker
              v-model:value={v.value}
              show-time
              value-format="YYYY-MM-DD"
            ></a-date-picker>
          );
        }
        if (props.data.displayType === 'SELECT' || props.data.displayType === 'SELECT_ATOMIC') {
          return (
            <a-select
              v-model:value={v.value}
              allow-clear
            >
              {selectList.value.map(({ key, value }) => (
                <a-select-option value={key}>{value}</a-select-option>
              ))}
            </a-select>
          );
        }
        if (props.data.displayType === 'SELECT_TREE') {
          return (
            <a-tree-select
              v-model:value={v.value}
              show-search
              allow-clear
              tree-data={selectList.value}
              field-names={{
                label: 'value',
                value: 'key',
              }}
            ></a-tree-select>
          );
        }
      }
      return '';
    };
    return () => renderItem();
  },
});
