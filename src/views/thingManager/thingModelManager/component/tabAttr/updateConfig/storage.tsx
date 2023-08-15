import {
  defineComponent,
  computed,
  reactive,
  ref,
  watch,
  nextTick,
  onMounted,
} from 'vue';
import * as modelApis from '@/api/thingModel';
import { Rule } from 'ant-design-vue/lib/form/interface';
import { cloneDeep } from 'lodash';
import { validateFn } from './config';

const formDefault = {
  persistType: 'NONE', //NONE("NONE", "无关联"), MANY_ONE("MANY_ONE", "多对一"),MANY_MANY("MANY_MANY", "多对多");
  tableName: '', //表名
  columnName: '', //自身标记列
  targetFieldName: '', //目标标记列
  column_type: 'string',
};
const rules = {
  column_type: [{ required: true, message: '请选择', trigger: 'blur' }],
  columnName: [{ required: true, message: '请选择', trigger: 'blur' }],
  targetFieldName: [{ required: true, message: '请选择', trigger: 'blur' }],
  tableName: [{ required: true, message: '请选择', trigger: 'blur' }],
};
export default defineComponent({
  props: {
    formData: {
      type: Object,
      default: () => null,
    },
    property: {
      type: String,
      default: '',
    },
    thingCode: {
      type: String,
      required: true,
    },
    attrCode: {
      type: String,
      required: true,
    },
  },
  setup(props, { expose, emit }) {
    const formRef = ref();
    const state = reactive<{
      formModel: any;
      formRules: any;
      tableList: any[];
      fieldList: any[];
      fieldListToProperty: any[];
    }>({
      formModel: cloneDeep({
        ...formDefault,
        ...props.formData,
      }),
      formRules: rules,
      tableList: [],
      fieldList: [],
      fieldListToProperty: [],
    });
    const fieldList = computed(() => {
      const list =
        props.property === 'property'
          ? state.fieldListToProperty
          : state.fieldList;
      return list.map((el) => {
        return {
          name: el.name,
          value: el.name,
          column_type: el.value,
        };
      });
    });

    const getTableList = () => {
      modelApis.relaTable().then((res) => {
        state.tableList = res.data;
        if (state.formModel.tableName) getFieldList(state.formModel.tableName);
      });
    };
    //数据库变化监听
    const tableChange = (options) => {
      state.formModel.columnName = undefined;
      state.formModel.targetFieldName = undefined;
      state.formModel.column_type = '';
      if (options) {
        getFieldList(options.name);
      } else {
        state.fieldList = [];
      }
    };
    //获取数据库字段名/标识自己和对方字段/
    const getFieldList = (id: string) => {
      modelApis.thingNameListByTable(id).then((res) => {
        state.fieldList = res.data;
      });
    };
    //获取数据库字段名只针对静态属性
    const getDataBankList = (thingCode: string, propertyCode?: string) => {
      modelApis.getDataBankList(thingCode, propertyCode).then((res) => {
        state.fieldListToProperty = res.data;
      });
    };
    //字段名修改设置字段类型
    const fieldNameChange = (value?: string) => {
      if (value) {
        state.formModel.column_type = fieldList.value.find(
          (el) => el.name === value
        )?.column_type;
      } else {
        state.formModel.column_type = '';
      }
    };
    // 监听存储方式变化
    const persistTypeChange = () => {
      state.formModel.tableName = undefined;
      state.formModel.columnName = undefined;
      state.formModel.targetFieldName = undefined;
      state.fieldList = [];
    };

    expose({
      validateFn: validateFn(formRef, 'storage'),
      formData: [state.formModel, formDefault],
    });
    onMounted(() => {
      getTableList();
      getDataBankList(props.thingCode, props.attrCode);
    });
    watch(
      () => props.property,
      (value) => {
        if (value !== 'relation') {
          state.formModel.persistType = 'NONE';
        }
        state.fieldList = [];
      }
    );
    return () => (
      <div class=''>
        <a-form
          ref={formRef}
          model={state.formModel}
          rules={state.formRules}
          label-col={{ span: 8 }}
          wrapper-col={{ span: 15 }}
          maskClosable={false}
        >
          <a-row>
            <a-col span={12}>
              <a-form-item label='存储方式' name='persistType'>
                <a-select
                  v-model={[state.formModel.persistType, 'value']}
                  onChange={persistTypeChange}
                >
                  <a-select-option value='NONE'>无</a-select-option>
                  {props.property === 'relation' && (
                    <>
                      <a-select-option value='MANY_ONE'>
                        多对一表
                      </a-select-option>
                      <a-select-option value='MANY_MANY'>
                        多对多关联表
                      </a-select-option>
                    </>
                  )}
                </a-select>
              </a-form-item>
            </a-col>
            {state.formModel.persistType !== 'NONE' && (
              <a-col span={12}>
                <a-form-item
                  label={
                    state.formModel.persistType === 'MANY_MANY'
                      ? '多对多关联表'
                      : '数据库表名'
                  }
                  name='tableName'
                >
                  <a-select
                    allowClear
                    show-search
                    v-model={[state.formModel.tableName, 'value']}
                    placeholder='请输入关键字进行选择'
                    optionFilterProp='name'
                    fieldNames={{ label: 'name', value: 'value' }}
                    options={state.tableList}
                    onChange={(value, option) => tableChange(option)}
                  />
                </a-form-item>
              </a-col>
            )}
            {((props.property === 'relation' &&
              state.formModel.persistType !== 'NONE') ||
              props.property === 'property') && (
              <a-col span={12}>
                <a-form-item
                  label={
                    state.formModel.persistType === 'MANY_MANY'
                      ? '标识自己的字段'
                      : '数据库字段名'
                  }
                  name='columnName'
                >
                  <a-select
                    allowClear
                    show-search
                    v-model={[state.formModel.columnName, 'value']}
                    placeholder='请输入关键字进行选择'
                    optionFilterProp='name'
                    fieldNames={{ label: 'name' }}
                    options={fieldList.value}
                    onChange={(value: string) => fieldNameChange(value)}
                  ></a-select>
                </a-form-item>
              </a-col>
            )}
            {state.formModel.persistType === 'MANY_MANY' ? (
              <a-col span={12}>
                <a-form-item label='标识对方的字段' name='targetFieldName'>
                  <a-select
                    allowClear
                    show-search
                    v-model={[state.formModel.targetFieldName, 'value']}
                    placeholder='请输入关键字进行选择'
                    optionFilterProp='label'
                    fieldNames={{ label: 'name', value: 'value' }}
                    options={fieldList.value}
                  />
                </a-form-item>
              </a-col>
            ) : (
              <a-col span={12}>
                <a-form-item label='字段类型' name='column_type'>
                  <a-select
                    v-model={[state.formModel.column_type, 'value']}
                    disabled={
                      props.property === 'relation' ||
                      props.property === 'property'
                    }
                  >
                    <a-select-option value='string'>
                      string(字符串)
                    </a-select-option>
                    <a-select-option value='boolean'>
                      boolean(布尔型)
                    </a-select-option>
                    <a-select-option value='long'>long(整数)</a-select-option>
                    <a-select-option value='double'>
                      double(小数)
                    </a-select-option>
                  </a-select>
                </a-form-item>
              </a-col>
            )}
          </a-row>
        </a-form>
      </div>
    );
  },
});
