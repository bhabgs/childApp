import { computed, defineComponent, reactive, ref, toRaw, watch } from 'vue';
import { FormItem, Switch, Select, Input, InputNumber } from 'ant-design-vue';
import { deepclone, generateFormRule } from './util';

export interface paramConfig {
  key: string;
  label: string;
  type?: string;
  isSlot?: boolean;
  msg?: string;
  required?: boolean;
  disabled?: boolean;
  selectOptions?: {
    label: string;
    value: any;
  }[];
  showTimeFormat?: string;
  infoKey?: string;
  extraRules?: any[];
}
const defaultSpan = {
  xxl: 6,
  xl: 8,
  lg: 12,
  md: 24,
  sm: 24,
  xs: 24,
};
import dayjs, { Dayjs } from 'dayjs';
// props
const props = {
  formRef: {
    type: Object,
    default: () => null,
  },
  model: {
    type: Object,
    required: true,
  },
  paramList: {
    type: Array,
    default: () => [],
  },
  name: {
    type: String,
    default: 'form',
  },
  labelCol: {
    type: Object,
    default: () => {
      return {
        span: 8,
      };
    },
  },
  wrapperCol: {
    type: Object,
    default: () => {
      return {
        span: 14,
      };
    },
  },
  colSpan: {
    type: Object,
    default: () => defaultSpan,
  },
  edit: {
    type: Boolean,
    default: true,
  },
};

export default defineComponent({
  props,
  setup(props, { slots }) {
    const { paramList, labelCol, wrapperCol } = props;
    const formRef = props.formRef;
    const model = deepclone(props.model);
    const formModel = ref(model);
    const rulesRef = reactive(generateFormRule(paramList));
    const colSpan = { ...defaultSpan, ...props.colSpan };
    const generateFormItem = (item) => {
      if (!props.edit) {
        const itemVal = formModel.value[item.key];
        if (item.type == 'select') {
          let value = item.selectOptions.find(
            (el) => el.value == itemVal
          )?.label;
          return <span>{value || '--'}</span>;
        }
        return (
          <span>
            {item.infoKey ? formModel.value[item.infoKey] : itemVal || '--'}
          </span>
        );
      }
      if (item.isSlot === true) {
        return (
          <div>
            {slots['slot_' + item.key]
              ? slots['slot_' + item.key](formModel)
              : null}
          </div>
        );
      }
      if (item.type === 'select') {
        return (
          <a-select
            v-model={[formModel.value[item.key], 'value']}
            disabled={item.disabled}
            allowClear
          >
            {item.selectOptions.map((option) => {
              return (
                <a-select-option value={option.value}>
                  {option.label}
                </a-select-option>
              );
            })}
          </a-select>
        );
      } else if (item.type == 'time') {
        if (
          formModel.value[item.key] &&
          typeof formModel.value[item.key] !== 'object'
        ) {
          formModel.value[item.key] = dayjs(formModel.value[item.key]);
        }
        return item.showTimeFormat ? (
          <a-date-picker
            allowClear
            disabled={item.disabled}
            style={{ width: '100%' }}
            v-model={[formModel.value[item.key], 'value']}
            show-time={{ format: `${item.showTimeFormat}` }}
            format={'YYYY-MM-DD ' + item.showTimeFormat}
          />
        ) : (
          <a-date-picker
            allowClear
            disabled={item.disabled}
            style={{ width: '100%' }}
            v-model={[formModel.value[item.key], 'value']}
          />
        );
      } else if (item.type === 'number') {
        return (
          <a-input-number
            disabled={item.disabled}
            v-model={[formModel.value[item.key], 'value']}
          />
        );
      } else if (item.type === 'textarea') {
        return (
          <a-textarea
            disabled={item.disabled}
            v-model={[formModel.value[item.key], 'value']}
          />
        );
      } else {
        return (
          <a-input
            allowClear
            disabled={item.disabled}
            v-model={[formModel.value[item.key], 'value']}
          />
        );
      }
    };
    watch(
      () => props.model,
      (nVal) => {
        if (nVal) {
          formModel.value = { ...formModel.value, ...nVal };
        }
      },
      { deep: true, immediate: true }
    );
    return () => (
      <div>
        <a-form
          ref={formRef}
          name='form'
          model={formModel.value}
          label-col={labelCol}
          wrapper-col={wrapperCol}
          rules={rulesRef}
        >
          <a-row gutter={20}>
            {paramList.map((item: paramConfig) => {
              return (
                <a-col {...colSpan}>
                  {props.edit ? (
                    <a-form-item label={item.label} name={item.key}>
                      {generateFormItem(item)}
                    </a-form-item>
                  ) : (
                    <div class='form_row flex-top'>
                      <span
                        class='label'
                        style={{ width: (labelCol.span / 24) * 100 + '%' }}
                      >
                        {item.label}：
                      </span>
                      <div
                        style={{ width: (wrapperCol.span / 24) * 100 + '%' }}
                      >
                        {generateFormItem(item)}
                      </div>
                    </div>
                  )}
                </a-col>
              );
            })}
          </a-row>
        </a-form>
      </div>
    );
  },
});
