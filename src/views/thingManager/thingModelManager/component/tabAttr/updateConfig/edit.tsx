import {
  defineComponent,
  computed,
  reactive,
  ref,
  watch,
  nextTick,
  onMounted,
} from 'vue';
import { message } from 'ant-design-vue';
import { validateFn } from './config';
import * as modelApis from '@/api/thingModel';
import { displayTypes } from './config';
import { cloneDeep } from 'lodash';
import { QuestionCircleOutlined } from '@ant-design/icons-vue';
import emitter from '@/utils/mitt';

const formDefault = {
  displayType: 'text', //显示样式
  regex: '', //正则表达
  defaultValue: '', //默认值
  required: false, //是否必填
  readonly: false, //是否只读
  step: undefined, //单步步长
  maxValue: undefined, //最大值
  minValue: undefined, //最小值
  decimalPlace: 2, //小数位数
  listType: '', //数据源    thing("thing", "物实例"),
  listInfo: undefined,
  isRadio: true, //是否支持多选
};

export default defineComponent({
  props: {
    formData: {
      type: Object,
      default: () => null,
    },
    property: {
      type: String,
      default: () => null,
    },
  },
  setup(props, { expose, emit }) {
    const formRef = ref();
    const state = reactive<{
      formModel: any;
      formRules: any;
      modelList: any[];
    }>({
      formModel: cloneDeep({
        ...formDefault,
        ...props.formData,
      }),
      formRules: {},
      modelList: [],
    });
    const displayTypeChange = (val) => {
      emitter.emit('displayTypeChange', val);
      state.formModel.defaultValue = undefined;
      if (
        val &&
        (val === 'switch' ||
          val.indexOf('select') ||
          val.indexOf('button_status') > -1)
      ) {
        state.formModel.listType = 'json';
        state.formModel.listInfo = '{}';
      } else {
        state.formModel.listType = '';
        state.formModel.listInfo = '';
      }
      if (val && val === 'alarm') {
        state.formModel.listType = 'json';
        state.formModel.listInfo =
          '{"NULL":"未配置或服务异常","0":"正常","1":"一级报警","2":"二级报警","3":"三级报警","4":"四级报警"}';
      }
    };

    const getDefaultValueJsx = (displayType = state.formModel.displayType) => {
      if (displayType === 'number') {
        return (
          <a-input-number
            v-model={[state.formModel.defaultValue, 'value']}
            style='width:100%'
          />
        );
      } else if (displayType === 'textarea') {
        return (
          <a-textarea
            v-model={[state.formModel.defaultValue, 'value']}
            rows={1}
          />
        );
      } else if (displayType === 'date' || displayType === 'datetime') {
        return (
          <a-date-picker
            v-model={[state.formModel.defaultValue, 'value']}
            style='width:100%'
            placeholder={
              displayType === 'date' ? '请选择日期' : '请选择日期时间'
            }
            showTime={displayType === 'datetime'}
          />
        );
      } else if (displayType === 'text') {
        return <a-input v-model={[state.formModel.defaultValue, 'value']} />;
      } else if (displayType === 'switch') {
        return <a-switch v-model={[state.formModel.defaultValue, 'checked']} />;
      }

      return null;
    };
    const getModelTree = () => {
      modelApis.listTree().then((res) => {
        state.modelList = res.data ? [res.data] : [];
      });
    };
    const getTooltip = (title: string) => {
      return (
        <a-tooltip title={title}>
          <QuestionCircleOutlined />
        </a-tooltip>
      );
    };

    expose({
      validateFn: validateFn(formRef, 'edit'),
      formData: [state.formModel, formDefault],
    });
    onMounted(() => {
      getModelTree();
    });
    watch(
      () => state.formModel,
      (n, o) => {
        emitter.emit('formDataChange');
      },
      {
        deep: true,
      }
    );
    return () => (
      <div class='attr_edit_config'>
        <a-form
          ref={formRef}
          model={state.formModel}
          rules={state.formRules}
          label-col={{ span: 8 }}
          wrapper-col={{ span: 15 }}
        >
          <a-row>
            <a-col span={12}>
              <a-form-item label='显示样式' name='displayType'>
                <a-select
                  v-model={[state.formModel.displayType, 'value']}
                  onChange={displayTypeChange}
                >
                  {displayTypes.map((opt) => {
                    return (
                      <a-select-option value={opt.value}>
                        {opt.label}
                      </a-select-option>
                    );
                  })}
                </a-select>
              </a-form-item>
            </a-col>
            {getDefaultValueJsx() && (
              <a-col span={12}>
                <a-form-item label='默认值' name='defaultValue'>
                  {getDefaultValueJsx()}
                </a-form-item>
              </a-col>
            )}
            {state.formModel.displayType === 'text' && (
              <a-col span={12}>
                <a-form-item label='校验用正则表达式' name='regex'>
                  <a-input v-model={[state.formModel.regex, 'value']} />
                </a-form-item>
              </a-col>
            )}
            {(state.formModel.displayType === 'number' ||
              state.formModel.displayType === 'button_parameter') && (
              <>
                <a-col span={12}>
                  <a-form-item label='单步步长' name='step'>
                    <a-input-number
                      style='width:100%'
                      v-model={[state.formModel.step, 'value']}
                    />
                  </a-form-item>
                </a-col>
                <a-col span={12}>
                  <a-form-item label='最大值' name='maxValue'>
                    <a-input-number
                      style='width:100%'
                      v-model={[state.formModel.maxValue, 'value']}
                    />
                  </a-form-item>
                </a-col>
                <a-col span={12}>
                  <a-form-item label='最小值' name='minValue'>
                    <a-input-number
                      style='width:100%'
                      v-model={[state.formModel.minValue, 'value']}
                    />
                  </a-form-item>
                </a-col>
              </>
            )}
            {(state.formModel.displayType === 'select' ||
              state.formModel.displayType === 'select_atomic' ||
              state.formModel.displayType === 'select_tree' ||
              state.formModel.displayType === 'switch') && (
              <>
                <a-col span={12}>
                  <a-form-item label='数据源类型' name='listType'>
                    <a-select
                      v-model={[state.formModel.listType, 'value']}
                      onChange={() => {
                        state.formModel.listInfo = undefined;
                      }}
                    >
                      <a-select-option
                        value='thing'
                        v-show={state.formModel.displayType === 'select'}
                      >
                        物实例
                      </a-select-option>
                      <a-select-option value='json'>json字典</a-select-option>
                      <a-select-option value='sql'>sql</a-select-option>
                      <a-select-option value='request'>request</a-select-option>
                    </a-select>
                  </a-form-item>
                </a-col>
                <a-col span={12} v-show={state.formModel.listType}>
                  {(state.formModel.listType === 'json' ||
                    state.formModel.listType === 'sql' ||
                    state.formModel.listType === 'request') && (
                    <a-form-item
                      name='listInfo'
                      v-slots={{
                        label: () => {
                          return state.formModel.listType === 'sql' ? (
                            <a-space>SQL</a-space>
                          ) : state.formModel.listType === 'request' ? (
                            <a-space>
                              RESTful API
                              {getTooltip(
                                '例如：/thingInst/search?thingCode=CAMERA'
                              )}
                            </a-space>
                          ) : (
                            <a-space>
                              JSON
                              {getTooltip('格式为{"1":"是","0":"否"}')}
                            </a-space>
                          );
                        },
                      }}
                    >
                      <a-input v-model={[state.formModel.listInfo, 'value']} />
                    </a-form-item>
                  )}

                  {state.formModel.listType === 'thing' && (
                    <a-form-item label='所属物模型' name='listInfo'>
                      <a-tree-select
                        v-model={[state.formModel.listInfo, 'value']}
                        dropdown-style={{
                          maxHeight: '400px',
                          overflow: 'auto',
                        }}
                        placeholder='请选择'
                        allow-clear
                        showSearch
                        treeDefaultExpandedKeys={[state.modelList[0].code]}
                        tree-data={state.modelList}
                        treeNodeFilterProp='name'
                        fieldNames={{
                          label: 'name',
                          value: 'code',
                          children: 'childTrees',
                        }}
                      ></a-tree-select>
                    </a-form-item>
                  )}
                </a-col>
                <a-col span={12}>
                  <a-form-item label='是否支持多选' name='isRadio'>
                    <a-radio-group v-model={[state.formModel.isRadio, 'value']}>
                      <a-radio value={false}>单选</a-radio>
                      <a-radio value={true}>多选</a-radio>
                    </a-radio-group>
                  </a-form-item>
                </a-col>
              </>
            )}
            <a-col span={12}>
              <a-form-item label='小数位数' name='decimalPlace'>
                <a-input-number
                  style='width:100%'
                  min={0}
                  v-model={[state.formModel.decimalPlace, 'value']}
                />
              </a-form-item>
            </a-col>
          </a-row>

          <a-row>
            <a-col span={12}>
              <a-form-item label='是否必填' name='required'>
                <a-radio-group v-model={[state.formModel.required, 'value']}>
                  <a-radio value={true}>必填</a-radio>
                  <a-radio value={false}>非必填</a-radio>
                </a-radio-group>
              </a-form-item>
            </a-col>
            <a-col span={12}>
              <a-form-item label='是否只读' name='readonly'>
                <a-radio-group v-model={[state.formModel.readonly, 'value']}>
                  <a-radio value={true}>只读</a-radio>
                  <a-radio value={false}>可编辑</a-radio>
                </a-radio-group>
              </a-form-item>
            </a-col>
            {!(
              state.formModel.displayType === 'select' ||
              state.formModel.displayType === 'select_atomic' ||
              state.formModel.displayType === 'select_tree'
            ) && (
              <a-col span={12}>
                <a-form-item
                  name='listInfo'
                  v-slots={{
                    label: () => {
                      return (
                        <a-space>
                          JSON
                          {getTooltip('格式为{"1":"是","0":"否"}')}
                        </a-space>
                      );
                    },
                  }}
                >
                  <a-input v-model={[state.formModel.listInfo, 'value']} />
                </a-form-item>
              </a-col>
            )}
          </a-row>
        </a-form>
      </div>
    );
  },
});
