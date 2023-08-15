import { defineComponent, computed, reactive, ref, watch, nextTick } from 'vue';
import { message } from 'ant-design-vue';
import * as modelApis from '@/api/thingModel';
import '@/assets/style/pages/thingManager/thingModelManager/thingModel.less';
import { formAttrUpdateRules } from '../../config';
import dayjs from 'dayjs';

const displayType = [
  {
    label: '文本text',
    value: 'text',
    range: ['property', 'logic', 'metric'],
  },
  {
    label: '文本域textarea',
    value: 'textarea',
    range: ['property'],
  },
  {
    label: '数字number',
    value: 'number',
    range: ['property'],
  },
  {
    label: '日期date',
    value: 'date',
    range: ['property'],
  },
  {
    label: '日期时间datetime',
    value: 'datetime',
    range: ['property'],
  },
  {
    label: '下拉框select',
    value: 'select',
    range: ['property', 'logic'],
  },
  {
    label: '枚举信号点signal',
    value: 'signal',
    range: ['property', 'logic', 'metric'],
  },
  {
    label: '开关switch',
    value: 'switch',
    range: ['property', 'logic'],
  },
];
const signalListShow = {
  alarm: [
    {
      text: '一级报警，数据：1',
      color: 'red',
    },
    {
      text: '二级报警，数据：2',
      color: 'orange',
    },
    {
      text: '三级报警，数据：3',
      color: 'yellow',
    },
    {
      text: '四级报警，数据：4',
      color: 'blue',
    },
    {
      text: '无报警，数据：null',
      color: 'green',
    },
    {
      text: '未配置报警规',
      color: '',
    },
  ],
  device_state: [
    {
      text: '正常，数据：0',
      color: 'green',
    },
    {
      text: '故障，数据：1',
      color: 'red',
    },
    {
      text: '上电，数据：2',
      color: 'blue',
    },
    {
      text: '待机，数据：4',
      color: 'gray',
    },
    {
      text: '无，数据：nul',
      color: '',
    },
  ],
  system_state: [
    {
      text: '运行，数据：0',
      color: 'green',
    },
    {
      text: '故障，数据：1',
      color: 'red',
    },
    {
      text: '未运行，数据：2',
      color: 'blue',
    },
    {
      text: '无，数据：nul',
      color: '',
    },
  ],
};
const formDefault = {
  remark: '',
  propertyType: 'property',
  useStandard: true,
  queryDisplay: false,
  listDisplay: false,
  readonly: false,
  required: false,
  display: true,
  padDiplay: true,
  mobileDisplay: true,
  colspan: 1,
  displayType: 'text',
  columnType: '',
  id: undefined,
  code: undefined,
};
export default defineComponent({
  setup(props, { expose, emit }) {
    const formRef = ref();
    const state = reactive<{
      formModel: any;
      formRules: any;
      title: string;
      visible: boolean;
      isAdd: boolean;
      alarmShow: boolean;
      keyword: string;
      alarmList: any[];
      tableList: any[];
      dataBankList: any[];
    }>({
      formModel: {},
      formRules: {},
      title: '',
      visible: false,
      isAdd: false,
      alarmShow: false,
      keyword: '',
      alarmList: [],
      tableList: [],
      dataBankList: [],
    });

    const displayTypeOptions = computed(() => {
      return displayType.filter((opt) => {
        return opt.range.indexOf(state.formModel.propertyType) > -1;
      });
    });

    const signalShow = computed(() => {
      if (state.formModel.listInfo) {
        return signalListShow[state.formModel.listInfo];
      }
      return [];
    });
    const updateHttp = () => {
      modelApis.updateAttr(state.formModel).then(() => {
        message.success('更新成功');
        emit('ok');
        close();
      });
    };
    const update = async () => {
      formRef.value
        .validate()
        .then(() => {
          updateHttp();
        })
        .catch(({ errorFields }) => {
          if (errorFields && errorFields.length === 1) {
            const err = errorFields[0];
            if (
              err.name.includes('code') &&
              err.errors.includes(
                '不建议使用小写字母，不符合业务规范，但不影响保存'
              )
            ) {
              updateHttp();
            }
          }
        });
    };

    const open = (
      isAdd,
      useStandard,
      thingCode,
      data = formDefault,
      tableList
    ) => {
      state.title = isAdd ? '新增' : '编辑';
      state.isAdd = isAdd;
      state.tableList = tableList;
      state.formModel = { ...state.formModel, ...data, useStandard, thingCode };
      state.formRules = formAttrUpdateRules(thingCode, data.id || '');
      const { defaultValue, displayType } = state.formModel;
      if (displayType && displayType.indexOf('date') > -1 && defaultValue) {
        state.formModel.defaultValue = dayjs(state.formModel.defaultValue);
      }
      getDataBankList(thingCode, data?.code);
      state.visible = true;
      if (isAdd) {
        getAlarm();
      }
      if (useStandard) {
        state.alarmShow = true;
      }
    };
    const close = () => {
      state.visible = false;
      state.formModel = {};
      state.alarmShow = false;
      state.keyword = '';
      if (formRef.value) {
        formRef.value.clearValidate();
      }
    };
    const getAlarm = () => {
      const data = {
        pageNum: 1,
        pageSize: 999,
        keyword: state.keyword,
      };
      modelApis.alarmList(data).then((res) => {
        state.alarmList = res.data.list;
      });
    };
    const getDataBankList = (thingCode: string, propertycode?: string) => {
      modelApis.getDataBankList(thingCode, propertycode).then((res) => {
        state.dataBankList = res.data;
      });
    };
    const handleConfig = (row: any) => {
      state.formModel.code = row.code;
      state.formModel.name = row.name;
      state.alarmShow = false;
    };
    const dataTypeChange = (val) => {
      if (val) {
        const one = state.dataBankList.find((el) => el.COLUMN_NAME === val);
        state.formModel.columnType = one.DATA_TYPE;
      } else {
        state.formModel.columnType = '';
      }
    };
    const columnTypeChange = (value) => {
      if (value === 'double') {
        state.formModel.decimalPlace = 2;
      } else {
        state.formModel.decimalPlace = null;
      }
    };
    const displayTypeChange = (val) => {
      if (val) {
        state.formModel.defaultValue = undefined;
        if (val === 'switch') {
          state.formModel.defaultValue = false;
        }
      }
    };

    const footerContext = () => {
      return (
        <a-space>
          <a-button type='primary' ghost onClick={close}>
            取消
          </a-button>
          {state.isAdd && state.formModel.useStandard && !state.alarmShow && (
            <a-button
              type='primary'
              ghost
              onClick={() => {
                state.alarmShow = true;
              }}
            >
              重新选择
            </a-button>
          )}
          {!state.alarmShow && (
            <a-button type='primary' onClick={update}>
              确定
            </a-button>
          )}
        </a-space>
      );
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
        return <a-textarea v-model={[state.formModel.defaultValue, 'value']} />;
      } else if (displayType === 'date' || displayType === 'datetime') {
        return (
          <a-date-picker
            v-model={[state.formModel.defaultValue, 'value']}
            style='width:100%'
            showTime={displayType === 'datetime'}
          />
        );
      } else if (displayType === 'text' || displayType === 'signal') {
        return <a-input v-model={[state.formModel.defaultValue, 'value']} />;
      } else if (displayType === 'switch') {
        return <a-switch v-model={[state.formModel.defaultValue, 'checked']} />;
      }

      return null;
    };
    //属性名称change
    const handleNameBlur = (e: any) => {
      if (!state.formModel.displayLabel) {
        state.formModel.displayLabel = e.target.value;
      }
    };
    const getSortTip = () => {
      let range = '';
      switch (state.formModel.propertyType) {
        case 'property':
          range = '100~199';
          break;
        case 'metric':
          range = '200~299';
          break;
        case 'logic':
          range = '300~399';
          break;

        default:
          break;
      }
      return range ? `建议在${range}范围内` : '';
    };
    watch(
      () => state.formModel.propertyType,
      (n, o) => {
        if (o) {
          state.formModel.displayType = 'text';
        }
        if (n !== 'property') {
          state.formModel.listDisplay = false;
          state.formModel.queryDisplay = false;
          state.formModel.readonly = false;
          state.formModel.required = false;
          state.formModel.columnName = undefined;
          if (state.isAdd) {
            state.formModel.columnType = 'string';
          }
        } else {
          if (state.isAdd) {
            state.formModel.columnType = '';
          }
        }

        formRef.value && formRef.value.clearValidate();
      }
    );

    expose({ open });
    return () => (
      <div class=''>
        <a-modal
          visible={state.visible}
          title={state.title}
          width='550px'
          centered
          onCancel={close}
          onOk={update}
          footer={footerContext()}
          destroyOnClose
        >
          <div class='update_attr_con'>
            {state.alarmShow ? (
              <div class='alarm_list'>
                <a-input-search
                  v-model={[state.keyword, 'value']}
                  placeholder='请输入搜素内容'
                  allowClear
                  onSearch={getAlarm}
                />
                <div class='mar-t-20'>
                  {state.alarmList.map((item) => {
                    return (
                      <div class='alarm_card' key={item.code}>
                        <div class='flex-lr-c'>
                          <div>
                            <p>{item.name}</p>
                            <p>{item.code}</p>
                          </div>
                          <a onClick={() => handleConfig(item)}>
                            选择并继续配置
                          </a>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <a-form
                ref={formRef}
                model={state.formModel}
                rules={state.formRules}
                label-col={{ span: 8 }}
                wrapper-col={{ span: 15 }}
              >
                <a-form-item label='属性类型' name='propertyType'>
                  <a-radio-group
                    disabled={!state.isAdd}
                    v-model={[state.formModel.propertyType, 'value']}
                  >
                    <a-radio value='property'>静态属性</a-radio>
                    <a-radio value='metric'>动态属性</a-radio>
                    <a-radio value='logic'>逻辑属性</a-radio>
                    {/* <a-radio value="alarm">报警属性</a-radio>
                    <a-radio value="action">动作属性</a-radio> */}
                  </a-radio-group>
                </a-form-item>
                <a-form-item label='属性编码' name='code'>
                  <a-input
                    v-model={[state.formModel.code, 'value']}
                    disabled={state.formModel.useStandard || !state.isAdd}
                    placeholder='支持数字、大写字母和_'
                  />
                </a-form-item>
                <a-form-item label='属性名称' name='name'>
                  <a-input
                    v-model={[state.formModel.name, 'value']}
                    disabled={state.formModel.useStandard}
                    onBlur={handleNameBlur}
                  />
                </a-form-item>
                {state.formModel.propertyType === 'property' && (
                  <a-form-item label='数据库字段名' name='columnName'>
                    <a-select
                      v-model={[state.formModel.columnName, 'value']}
                      onChange={dataTypeChange}
                      disabled={
                        !state.isAdd &&
                        state.formModel.propertyType === 'property'
                      }
                    >
                      {state.dataBankList.map((el) => {
                        return (
                          <a-select-option
                            value={el.COLUMN_NAME}
                            key={el.COLUMN_NAME}
                          >
                            {el.COLUMN_NAME}
                          </a-select-option>
                        );
                      })}
                    </a-select>
                  </a-form-item>
                )}
                <a-form-item label='字段类型' name='columnType'>
                  <a-select
                    v-model={[state.formModel.columnType, 'value']}
                    disabled={state.formModel.propertyType === 'property'}
                    onChange={columnTypeChange}
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
                {state.formModel.propertyType === 'logic' && (
                  <a-form-item label='默认计算公式' name='defaultRule'>
                    <a-input v-model={[state.formModel.defaultRule, 'value']} />
                  </a-form-item>
                )}
                <a-form-item label='单位' name='unit'>
                  <a-input v-model={[state.formModel.unit, 'value']} />
                </a-form-item>
                <a-form-item label='是否显示' name=''>
                  <a-checkbox v-model={[state.formModel.display, 'checked']}>
                    Web端
                  </a-checkbox>
                  <a-checkbox v-model={[state.formModel.padDiplay, 'checked']}>
                    Pad端
                  </a-checkbox>
                  <a-checkbox
                    v-model={[state.formModel.mobileDisplay, 'checked']}
                  >
                    手机端
                  </a-checkbox>
                </a-form-item>
                <a-form-item label='前端界面显示名' name='displayLabel'>
                  <a-input v-model={[state.formModel.displayLabel, 'value']} />
                </a-form-item>
                <a-form-item label='显示样式' name='displayType'>
                  <a-select
                    v-model={[state.formModel.displayType, 'value']}
                    onChange={displayTypeChange}
                  >
                    {displayTypeOptions.value.map((opt) => {
                      return (
                        <a-select-option value={opt.value}>
                          {opt.label}
                        </a-select-option>
                      );
                    })}
                  </a-select>
                </a-form-item>
                {getDefaultValueJsx() && (
                  <a-form-item label='默认值' name='defaultValue'>
                    {getDefaultValueJsx()}
                  </a-form-item>
                )}
                {state.formModel.displayType === 'number' && (
                  <>
                    <a-form-item label='单步步长' name='step'>
                      <a-input-number
                        style='width:100%'
                        v-model={[state.formModel.step, 'value']}
                      />
                    </a-form-item>
                    <a-form-item label='最大值' name='maxValue'>
                      <a-input-number
                        style='width:100%'
                        v-model={[state.formModel.maxValue, 'value']}
                      />
                    </a-form-item>
                    <a-form-item label='最小值' name='minValue'>
                      <a-input-number
                        style='width:100%'
                        v-model={[state.formModel.minValue, 'value']}
                      />
                    </a-form-item>
                  </>
                )}
                {state.formModel.displayType === 'select' && (
                  <>
                    <a-form-item label='下拉框数据类型' name='listType'>
                      <a-select v-model={[state.formModel.listType, 'value']}>
                        <a-select-option value='json'>json</a-select-option>
                        <a-select-option value='sql'>sql</a-select-option>
                        <a-select-option value='request'>
                          request
                        </a-select-option>
                      </a-select>
                    </a-form-item>
                    <a-form-item label='下拉框数据值' name='listInfo'>
                      <a-input v-model={[state.formModel.listInfo, 'value']} />
                    </a-form-item>
                  </>
                )}
                {state.formModel.displayType === 'signal' && (
                  <>
                    <a-form-item label='样式示例' name='listInfo'>
                      <a-radio-group
                        v-model={[state.formModel.listInfo, 'value']}
                      >
                        {/* 李尧说存alarm、device_state、system_state */}
                        <a-radio value='alarm'>报警信号</a-radio>
                        <a-radio value='device_state'>设备状态</a-radio>
                        <a-radio value='system_state'>生产状态</a-radio>
                      </a-radio-group>
                    </a-form-item>
                    {state.formModel.listInfo && (
                      <a-row class='signal_style'>
                        <a-col offset={8}>
                          {signalShow.value.map((el) => {
                            return (
                              <div>
                                <a-space>
                                  <div
                                    class={el.color + ' circle_signal'}
                                  ></div>
                                  <span>{el.text}</span>
                                </a-space>
                              </div>
                            );
                          })}
                        </a-col>
                      </a-row>
                    )}
                  </>
                )}
                {(state.formModel.propertyType === 'metric' ||
                  state.formModel.propertyType === 'logic') &&
                  state.formModel.columnType === 'double' && (
                    <a-form-item label='小数位数' name='decimalPlace'>
                      <a-input-number
                        style='width:100%'
                        min={0}
                        v-model={[state.formModel.decimalPlace, 'value']}
                      />
                    </a-form-item>
                  )}
                {(state.formModel.displayType === 'text' ||
                  state.formModel.displayType === 'textarea') && (
                  <a-form-item label='校验用正则表达式' name='regex'>
                    <a-input v-model={[state.formModel.regex, 'value']} />
                  </a-form-item>
                )}
                <a-form-item label='跨列展示' name='colspan'>
                  <a-input-number
                    v-model={[state.formModel.colspan, 'value']}
                    addon-after='列'
                    style='width:100%'
                  />
                </a-form-item>
                {state.formModel.propertyType === 'property' && (
                  <div>
                    {/* <a-form-item label="是否只读" name="readonly">
                      <a-radio-group
                        v-model={[state.formModel.readonly, "value"]}
                      >
                        <a-radio value={true}>只读</a-radio>
                        <a-radio value={false}>可编辑</a-radio>
                      </a-radio-group>
                    </a-form-item> */}
                    <a-form-item label='是否必填' name='required'>
                      <a-radio-group
                        v-model={[state.formModel.required, 'value']}
                      >
                        <a-radio value={true}>必填</a-radio>
                        <a-radio value={false}>非必填</a-radio>
                      </a-radio-group>
                    </a-form-item>
                    <a-form-item label='属性在PC端是否可查询' name=''>
                      <a-switch
                        v-model={[state.formModel.queryDisplay, 'checked']}
                      ></a-switch>
                    </a-form-item>
                    <a-form-item label='属性是否在列表显示' name='listDisplay'>
                      <a-switch
                        v-model={[state.formModel.listDisplay, 'checked']}
                      ></a-switch>
                    </a-form-item>
                  </div>
                )}
                <a-form-item label='显示排序' name='sort'>
                  <a-input-number
                    min={0}
                    v-model={[state.formModel.sort, 'value']}
                    style='width:100%'
                    placeholder={getSortTip()}
                  />
                </a-form-item>
                <a-form-item label='属性是否为超级链接' name='canLink'>
                  <a-space>
                    <a-switch
                      v-model={[state.formModel.canLink, 'checked']}
                    ></a-switch>
                    {state.formModel.canLink && (
                      <a-input v-model={[state.formModel.linkUrl, 'value']} />
                    )}
                  </a-space>
                </a-form-item>
                <a-form-item label='备注' name='remark'>
                  <a-textarea v-model={[state.formModel.remark, 'value']} />
                </a-form-item>
              </a-form>
            )}
          </div>
        </a-modal>
      </div>
    );
  },
});
