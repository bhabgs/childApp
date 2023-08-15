import dayjs from 'dayjs';
import {
  defineComponent,
  ref,
  onMounted,
  reactive,
  watch,
  computed,
  inject,
  createVNode,
} from 'vue';
import { useRouter } from 'vue-router';
import RenderSelect from './RenderSelect';
import PduForm from './pduForm';
import preHistory from './preHistory';
import { getListAtomicValue } from '../hooks/instance';
import preApi from '@/api/PRE';
import * as thingApi from '@/api/thingInstance';
import _ from 'lodash';
import { message, Modal } from 'ant-design-vue';
import { ExclamationCircleOutlined } from '@ant-design/icons-vue';
import IconLine from '@/assets/imgs/thingManager/icon-line.svg';
import IconCoal from '@/assets/imgs/thingManager/icon-analog.svg';
const propButtonText = {
  ACTION: '编辑下发',
  LOGIC: '逻辑计算',
  METRIC: '配属性点',
  PARAMETER: '编辑下发',
  SETTING: '编辑下发',
  ALARM: '编辑报警',
};
const requiredRule = {
  required: true,
  message: '不能为空',
  trigger: 'blur',
};

const rules = {
  prePDUCode: [],
  preAddress: [],
  prePDUCode2: [],
  preAddress2: [],
  logicRule: [],
  alarmId: [
    // {
    //   required: true,
    //   message: '不能为空',
    //   trigger: 'blur',
    // },
  ],
};

export default defineComponent({
  name: 'RenderThingProp',
  components: { RenderSelect, PduForm, preHistory },
  props: {
    attrInfo: {
      type: Object,
      required: true,
    },
    isEdit: {
      type: Boolean,
      default: false,
    },
    group: {
      type: Object,
      default: () => {},
    },
    pageType: {
      type: String,
      default: 'detail',
    },
  },
  emits: ['preChange', 'valueChange'],
  setup(props, { emit, expose }) {
    const preRef = ref();
    const thingInsId = inject('thingInsId', null);
    const thingModelCode = inject('thingModel', null);
    //区分当前实例是新增还是编辑
    const isNew = computed(() => {
      return !props.attrInfo.thingPropertyInstId;
    });
    //for-实时显示值
    const displayValueCpt = computed(() => {
      if (
        props.attrInfo.displayValue &&
        typeof props.attrInfo.displayValue === 'object'
      ) {
        return JSON.stringify(props.attrInfo.displayValue);
      }
      return _.isNil(props.attrInfo.displayValue)
        ? props.attrInfo.value
        : props.attrInfo.displayValue;
    });
    const displayValueDetail = computed(() => {
      let { displayType } = props.attrInfo;

      //后端加上了;
      if (!_.isNil(displayValueCpt.value) && displayValueCpt.value !== '') {
        if (displayType === 'DATE') {
          return dayjs(displayValueCpt.value).format('YYYY年MM月DD日');
        }
        if (displayType === 'DATETIME') {
          return dayjs(displayValueCpt.value).format('YYYY年MM月DD日 HH:mm:ss');
        }
        // if (displayType === 'BUTTON_PARAMETER' || displayType === 'NUMBER') {
        //   let decimalPlace =
        //     props.attrInfo.thingInstPropertyValidVo?.decimalPlace;
        //   if (!_.isNil(decimalPlace)) {
        //     return Number(displayValueCpt.value).toFixed(decimalPlace);
        //   }
        // }
      }
      return _.isNil(displayValueCpt.value) || displayValueCpt.value === ''
        ? '--'
        : displayValueCpt.value;
    });
    //超级链接
    const linkInfo = computed(() => {
      let { needLink } = props.attrInfo;
      let url = props.attrInfo.linkUrl;
      if (needLink === 2) {
        const token = sessionStorage.getItem('token');
        const theme = sessionStorage.getItem('theme');
        const userinfo = sessionStorage.getItem('userinfo');
        const userId = JSON.parse(userinfo || '{}')?.userId;
        url =
          url +
          `&appType=mtip-factory&token=${token}&userId=${userId}&theme=${theme}`;
      }
      return {
        canLink: Boolean(needLink) && url,
        url,
      };
    });
    const router = useRouter();
    const state = reactive<{
      plcValue: string;
      rules: any;
    }>({
      plcValue: '',
      rules: _.cloneDeep(rules),
    });
    const colorVal = computed(() => {
      if (!props.attrInfo) return '';
      let colorVal = '';
      if (props.attrInfo?.needColorTrans && props.attrInfo?.value) {
        const colorTrans = JSON.parse(props.attrInfo.colorTrans);
        colorVal = colorTrans[props.attrInfo.value];
      }
      return colorVal;
    });
    // 详情属性
    const showValue = () => {
      const propInfo = props.attrInfo;
      if (!propInfo) return '--';
      const { displayType, needLink } = props.attrInfo;
      const chartIconJsx = () => {
        return (
          ['METRIC', 'ACTION', 'PARAMETER'].includes(propInfo.propertyType) && (
            <div class='pointer' style='overflow:hidden' onClick={lookPreData}>
              <img src={IconLine} class='svg_color pointer' />
            </div>
          )
        );
      };
      const jsx = (
        <a-space>
          <span
            style={{ color: colorVal.value }}
            class={
              linkInfo.value.canLink && displayType !== 'ALARM'
                ? 'color_theme pointer'
                : ''
            }
            onClick={() => {
              if (linkInfo.value.canLink && displayType !== 'ALARM')
                router.push(linkInfo.value.url);
            }}
          >
            {displayValueDetail.value}
          </span>
          {propInfo.unit && <span>{propInfo.unit}</span>}
          {chartIconJsx()}
        </a-space>
      );
      const valueJsx = () => {
        switch (displayType) {
          case 'BUTTON_STATUS':
            const btnObj = JSON.parse(propInfo.listInfo || '{}');
            const key = Object.keys(btnObj)[0];
            if (key) {
              return (
                <a-space>
                  <a-button onClick={() => distribute(key)} size='small'>
                    {btnObj[key]}
                  </a-button>
                  {chartIconJsx()}
                </a-space>
              );
            }
            return <a-button size='small'>{propInfo.listInfo}</a-button>;

          case 'SWITCH':
            const listInfo = JSON.parse(propInfo.listInfo || '{}');
            const valueArr = Object.keys(listInfo);
            if (valueArr && valueArr.length === 2 && propInfo.value !== null) {
              return (
                <a-space>
                  <a-switch
                    checked={propInfo.value}
                    checked-children={listInfo[valueArr[1]]}
                    un-checked-children={listInfo[valueArr[0]]}
                    checkedValue={valueArr[1]}
                    unCheckedValue={valueArr[0]}
                    onChange={(e) => distribute(e)}
                  />
                  {chartIconJsx()}
                </a-space>
              );
            }
            return '--';
          case 'ALARM':
            return (
              <a-space>
                <span style={{ color: colorVal.value }}>●</span>
                {jsx}
                {propInfo.refresh && <span>{propInfo.refresh}</span>}
                {props.pageType === 'detail' && (
                  <>
                    <a-switch
                      checked={propInfo.alarmAvailable}
                      checked-children='投用'
                      un-checked-children='屏蔽'
                      onChange={(e) => {
                        initiateSecondConfirm('', () => setAlarmValid(e));
                      }}
                    />
                    {propInfo.alarmInstId && propInfo.manuReleasable && (
                      <a-button type='link' size='small' onClick={resetAlarm}>
                        复位
                      </a-button>
                    )}
                    {propInfo.alarmInstId && linkInfo.value.canLink && (
                      <a-button
                        type='link'
                        size='small'
                        onClick={() => {
                          router.push(linkInfo.value.url);
                        }}
                      >
                        详情
                      </a-button>
                    )}
                  </>
                )}
              </a-space>
            );
          case 'BUTTON_PARAMETER':
            return (
              <a-space>
                {jsx}

                {props.pageType === 'detail' && (
                  <>
                    <a-input-number
                      v-model:value={state.plcValue}
                      size='small'
                      style='width:100px'
                      max={
                        propInfo?.thingInstPropertyValidVo?.maxValue || Infinity
                      }
                      min={
                        propInfo?.thingInstPropertyValidVo?.minValue ||
                        -Infinity
                      }
                      step={propInfo?.thingInstPropertyValidVo?.step || 1}
                      precision={
                        propInfo?.thingInstPropertyValidVo?.decimalPlace || 0
                      }
                    />
                    <a-button
                      onClick={() =>
                        distribute(
                          state.plcValue,
                          props.attrInfo.pointCode,
                          true
                        )
                      }
                      size='small'
                    >
                      下发
                    </a-button>
                  </>
                )}
              </a-space>
            );
          case 'IFRAME':
            return (
              <a-space>
                <div
                  class='pointer'
                  onClick={() => (modalIframeState.visible = true)}
                >
                  <img src={IconCoal} class='pointer svg_color' />
                </div>
              </a-space>
            );
          default:
            return jsx;
        }
      };
      return <>{valueJsx()}</>;
    };
    //二次确认弹框
    const initiateSecondConfirm = (
      title: string,
      callback: Function,
      content = '请确认安全后执行'
    ) => {
      Modal.confirm({
        title: title || props.attrInfo.label,
        icon: createVNode(ExclamationCircleOutlined),
        content: '请确认安全后执行',
        okText: '确认',
        cancelText: '取消',
        onOk: () => {
          callback();
        },
      });
    };
    //参数下发
    const distribute = (
      value: any,
      pointCode = props.attrInfo.pointCode,
      secondConform = true
    ) => {
      const request = () => {
        const data = {
          value,
          pointCode,
          thingCode: thingModelCode,
          thingPropertyId: props.attrInfo.thingPropertyId,
        };
        thingApi.writePlcValue(data).then((res) => {
          if (res?.data) {
            message.success('下发成功');
          } else {
            message.error('下发失败');
          }
        });
      };
      if (secondConform) {
        initiateSecondConfirm('', request);
      } else {
        request();
      }
    };
    //报警复位
    const resetAlarm = () => {
      const data = {
        instanceUuid: props.attrInfo.thingPropertyInstId,
        propertyCode: props.attrInfo.thingPropertyCode,
        prePointCode: props.attrInfo.pointCode,
        ruleId: props.attrInfo.alarmId,
      };
      thingApi.resetAlarm(data).then((res) => {
        if (res.data) {
          message.success('复位成功');
        } else {
          message.error('复位失败');
        }
      });
    };
    //报警投用/屏蔽
    const setAlarmValid = (available: boolean) => {
      const data = {
        available,
        instanceUuid: props.attrInfo.thingPropertyInstId,
        propertyCode: props.attrInfo.thingPropertyCode,
        ruleId: props.attrInfo.alarmId,
        prePointCode2: props.attrInfo.pointCode2,
      };
      thingApi.setAlarmValid(data).then((res) => {
        if (res?.data) {
          props.attrInfo.alarmAvailable = available;
          message.success('设置成功');
        } else {
          message.error('设置失败');
        }
      });
    };
    //查看pre历史数据
    const lookPreData = () => {
      preRef.value.open(props.attrInfo);
    };
    const handleValueChange = () => {
      emit(
        'valueChange',
        props.attrInfo.thingPropertyCode,
        props.attrInfo.value
      );
    };
    //编辑属性
    const renderField = () => {
      const {
        propertyType,
        displayType,
        unit,
        refresh,
        thingInstPropertyValidVo = {},
      } = props.attrInfo;
      if (['PROPERTY', 'ATTRIBUTE'].includes(propertyType)) {
        switch (displayType) {
          case 'TEXT':
            return (
              <a-input
                class='flex1'
                placeholder='请输入'
                v-model:value={props.attrInfo.value}
                suffix={unit}
                onChange={handleValueChange}
              ></a-input>
            );
          case 'NUMBER':
            return (
              <a-input-number
                class='flex1'
                placeholder='请输入'
                v-model:value={props.attrInfo.value}
                addonAfter={unit}
                onChange={handleValueChange}
                max={thingInstPropertyValidVo?.maxValue || Infinity}
                min={thingInstPropertyValidVo?.minValue || -Infinity}
                step={thingInstPropertyValidVo?.step || 1}
                precision={thingInstPropertyValidVo?.decimalPlace || 0}
                style='width:100%'
              ></a-input-number>
            );
          case 'DATETIME':
            return (
              <a-date-picker
                class='flex1'
                valueFormat='YYYY-MM-DD HH:mm:ss'
                style='width:100%'
                v-model:value={props.attrInfo.value}
                showTime
                onChange={handleValueChange}
              ></a-date-picker>
            );
          case 'DATE':
            return (
              <a-date-picker
                class='flex1'
                valueFormat='YYYY-MM-DD'
                v-model:value={props.attrInfo.value}
                style='width:100%'
                onChange={handleValueChange}
              ></a-date-picker>
            );
          case 'TEXTAREA':
            return (
              <a-textarea
                class='flex1'
                rows={2}
                v-model:value={props.attrInfo.value}
                onChange={handleValueChange}
              ></a-textarea>
            );
          case 'SELECT':
            return (
              <RenderSelect
                value={props.attrInfo.value}
                attrInfo={props.attrInfo}
                apiParam=''
                onChange={(val) => {
                  props.attrInfo.value = val;
                  handleValueChange();
                }}
              />
            );
          case 'SELECT_ATOMIC':
            return (
              <RenderSelect
                value={props.attrInfo.value}
                attrInfo={props.attrInfo}
                apiParam={getListAtomicValue(
                  props.attrInfo,
                  props.group?.thingPropertyValueVoList || [],
                  'thingPropertyCode'
                )}
                onChange={(val) => {
                  props.attrInfo.value = val;
                  handleValueChange();
                }}
              />
            );
          case 'SELECT_TREE':
            return (
              <RenderSelect
                value={props.attrInfo.value}
                attrInfo={props.attrInfo}
                onChange={(val) => {
                  props.attrInfo.value = val;
                  handleValueChange();
                }}
              />
            );
          default:
            return (
              <a-space>
                <span
                  style={{ color: colorVal.value }}
                  class={props.attrInfo.needLink ? 'color_theme pointer' : ''}
                  onClick={() => {
                    if (linkInfo.value.canLink) router.push(linkInfo.value.url);
                  }}
                >
                  {!_.isNil(displayValueCpt.value)
                    ? displayValueCpt.value
                    : '--'}
                </span>
                {unit && <span>{unit}</span>}
              </a-space>
            );
        }
      }
      if (
        ['METRIC', 'ACTION', 'ALARM', 'LOGIC', 'PARAMETER', 'SETTING'].includes(
          propertyType
        )
      ) {
        return (
          <div class='value-container'>
            {displayType === 'ALARM' ? (
              <a-space>
                <span style={{ color: colorVal.value }}>
                  {!_.isNil(displayValueCpt.value)
                    ? '● ' + displayValueCpt.value
                    : '--'}
                </span>
                {refresh && <span>{refresh}</span>}
                <a-button
                  type='primary'
                  size='small'
                  ghost
                  onClick={() => handleConfig('编辑报警', 'ALARM')}
                >
                  编辑报警
                </a-button>
              </a-space>
            ) : (
              <a-space>
                <span class='value' style={{ color: colorVal.value }}>
                  {displayValueDetail.value}
                </span>
                {unit && <span class='unit'>{unit}</span>}
                <a-button
                  type='primary'
                  size='small'
                  ghost
                  onClick={() =>
                    handleConfig(propButtonText[propertyType], propertyType)
                  }
                >
                  {propButtonText[propertyType]}
                </a-button>
              </a-space>
            )}
          </div>
        );
      }
      return '未知';
    };

    //编辑pre弹框
    const formRef = ref();
    const modalState = reactive<{
      visible: boolean;
      title: string;
      type: string;
      formData: any;
      pduList: any[];
      addressList: any[];
    }>({
      visible: false,
      title: '',
      type: '',
      formData: _.cloneDeep(props.attrInfo),
      pduList: [],
      addressList: [],
    });
    const getPduList = async () => {
      const resPre = await preApi.getPreItems({ pduName: '' });
      modalState.pduList = resPre.data[0].pduItemList;
    };
    // 动态属性配置
    const handleConfig = (title: string, type: string) => {
      getThingPropertyInst();
      modalState.visible = true;
      modalState.title = title + '：' + props.attrInfo.label;
      modalState.type = type;
      if (type !== 'LOGIC') {
        getPduList();
      }
    };
    //code: 协议数据单元key值, name: 协议数据单元显示值, addressKey: 协议数据单元级联的地址的key
    const pduFormItem = (code: string, name: string, addressKey: string) => {
      return (
        <a-form-item label='协议数据单元' name={code}>
          <a-select
            v-model={[modalState.formData[code], 'value']}
            allow-clear
            onChange={(code, opt) => {
              if (opt) {
                modalState.formData[name] = opt.pduName;
                modalState.formData[addressKey] = opt.pduName;
                state.rules[addressKey] = [requiredRule];
              } else {
                state.rules[addressKey] = [];
                modalState.formData[name] = '';
                modalState.formData[addressKey] = '';
                formRef.value.clearValidate([addressKey]);
              }
            }}
            style={{ width: '250px' }}
          >
            {modalState.pduList.map((info: any) => {
              return (
                <a-select-option value={info.pduCode}>
                  {info.pduName}
                </a-select-option>
              );
            })}
          </a-select>
        </a-form-item>
      );
    };
    const titleJsx = (title: string) => {
      return (
        <div class='titleBox flex-center mar-b-20'>
          <div class='icon'></div>
          <div class='name'>{title}</div>
        </div>
      );
    };
    const handleModalOk = () => {
      formRef.value.validate().then(async () => {
        await saveThingPropertyInst();
        const _formData = _.cloneDeep({
          ...modalState.formData,
          prePDUAddress: modalState.formData.preAddress,
          prePDUAddress2: modalState.formData.preAddress2,
        });
        //数据回填到属性list里
        !isNew.value && delete _formData.mtipThingPropertyInstEntity;
        emit('preChange', {
          ...props.attrInfo,
          ..._formData,
        });

        handleModalCancel();
      });
    };
    const handleModalCancel = () => {
      state.rules = _.cloneDeep(rules);
      formRef.value.clearValidate();
      modalState.formData = {};
      modalState.visible = false;
    };

    //获取pre配置相关属性值
    const getThingPropertyInst = () => {
      const data = {
        thingPropertyInstId: props.attrInfo.thingPropertyInstId,
        thingPropertyId: props.attrInfo.thingPropertyId,
        thingInstId: thingInsId,
      };
      thingApi.getThingPropertyInst(data).then(({ data }) => {
        modalState.formData = data || {};
      });
    };
    //设置pre配置相关属性值
    const saveThingPropertyInst = () => {
      const data = {
        ...modalState.formData,
        thingPropertyInstId: props.attrInfo.thingPropertyInstId,
        thingPropertyId: props.attrInfo.thingPropertyId,
        thingInstId: thingInsId,
        thingCode: thingModelCode,
      };
      return new Promise((resolve) => {
        thingApi.saveThingPropertyInst(data).then((res) => {
          message.success('保存成功');
          modalState.formData.thingPropertyInstId =
            res.data.thingPropertyInstId;
          resolve(res.data);
        });
      });
    };
    //新增pre地址
    const createPointCode = (data: any, callback) => {
      thingApi
        .createPointCode({
          ...data,
          thingPropertyId: props.attrInfo.thingPropertyId,
          thingInstId: thingInsId,
          thingCode: thingModelCode,
          thingPropertyInstId: props.attrInfo.thingPropertyInstId,
        })
        .then((res) => {
          callback(res.data);
        });
    };

    // 创建报警规则
    const createAlarmRule = (data: any, callback) => {
      thingApi
        .createAlarmRule({
          ...data,
          thingPropertyId: props.attrInfo.thingPropertyId,
          thingInstId: thingInsId,
          thingCode: thingModelCode,
          thingPropertyInstId: props.attrInfo.thingPropertyInstId,
          thingPropertyCode: props.attrInfo.thingPropertyCode,
        })
        .then((res) => {
          callback(res.data);
        });
    };
    const getModalContainer = () => {
      const els = Array.from(document.querySelectorAll('.DetailOrEdit'));
      const el =
        els.find((el) => el.attributes?.isactive.value === 'true') ||
        document.body;

      return el;
    };
    const modalIframeState = reactive<{
      visible: boolean;
      title: string;
    }>({
      visible: false,
      title: 'xxxxx',
    });

    watch(
      () => props.attrInfo,
      (n) => {
        // console.log(n, 'props.attrInfo');
      },
      { deep: true }
    );
    onMounted(() => {
      //编辑实例时-保存验证用的
      if (props.isEdit) {
        handleValueChange();
      }
    });

    return () => (
      <>
        {props.isEdit ? (
          renderField()
        ) : (
          <span class='value'>{showValue()}</span>
        )}
        {/* pre弹框设置 */}
        <a-modal
          visible={modalState.visible}
          title={modalState.title}
          maskClosable={false}
          onCancel={handleModalCancel}
          onOk={handleModalOk}
          getContainer={() => getModalContainer()}
        >
          <a-form
            class='formBody flex1'
            labelCol={{
              style: { width: modalState.type === 'LOGIC' ? '6em' : '9em' },
            }}
            model={modalState.formData}
            rules={state.rules}
            ref={formRef}
          >
            {(modalState.type === 'ACTION' ||
              modalState.type === 'SETTING' ||
              modalState.type === 'METRIC' ||
              modalState.type === 'ALARM' ||
              modalState.type === 'PARAMETER') && (
              <>
                {(modalState.type === 'PARAMETER' ||
                  modalState.type === 'SETTING' ||
                  modalState.type === 'ACTION') &&
                  titleJsx('下发信号')}
                {modalState.type === 'ALARM' && titleJsx('报警属性')}
                {/* //pre地址 */}
                {pduFormItem('prePDUCode', 'prePDUName', 'preAddress')}
                <PduForm
                  name='preAddress'
                  model={modalState.formData}
                  label='地址'
                  watchVal={modalState.formData.prePDUCode}
                  onChange={(option) => {
                    modalState.formData.prePDUName = option.label;
                    //因为pre详情获取数据用的pointId
                    modalState.formData.prePDUId = option.pointId;
                  }}
                  onAdd={(preAddress: string, callback: Function) => {
                    createPointCode(
                      {
                        preAddress,
                        prePDUCode: modalState.formData.prePDUCode,
                      },
                      callback
                    );
                  }}
                  linkUrl={`/mtip-developer-center/PRE/deviceConnectionDta/${modalState.formData.prePDUId}?name=${modalState.formData.prePDUName}&type=edit`}
                />
              </>
            )}
            {(modalState.type === 'ALARM' ||
              modalState.type === 'ACTION' ||
              modalState.type === 'SETTING' ||
              modalState.type === 'PARAMETER') && (
              <>
                {(modalState.type === 'PARAMETER' ||
                  modalState.type === 'SETTING' ||
                  modalState.type === 'ACTION') &&
                  titleJsx('反馈信号')}
                {modalState.type === 'ALARM' && titleJsx('投用/屏蔽属性')}
                {pduFormItem('prePDUCode2', 'prePDUName2', 'preAddress2')}
                <PduForm
                  name='preAddress2'
                  model={modalState.formData}
                  label='地址'
                  watchVal={modalState.formData.prePDUCode2}
                  onChange={(option) => {
                    modalState.formData.prePDUName2 = option.label;
                    modalState.formData.prePDUId2 = option.pointId;
                  }}
                  onAdd={(preAddress: string, callback: Function) => {
                    createPointCode(
                      {
                        preAddress,
                        prePDUCode: modalState.formData.prePDUCode2,
                      },
                      callback
                    );
                  }}
                  linkUrl={`/mtip-developer-center/PRE/deviceConnectionDta/${modalState.formData.prePDUId2}?name=${modalState.formData.prePDUName2}&type=edit`}
                />
              </>
            )}
            {modalState.type === 'ALARM' && (
              <>
                {titleJsx('报警规则')}
                <PduForm
                  name='alarmId'
                  model={modalState.formData}
                  label='报警规则'
                  type='alarmRule'
                  tip='烽火报警中没有该规则将会自动创建'
                  onChange={(option) => {
                    modalState.formData.alarmName = option.label;
                  }}
                  onAdd={(alarmRuleName: string, callback: Function) => {
                    createAlarmRule(
                      {
                        alarmRuleName,
                      },
                      callback
                    );
                  }}
                  linkUrl={`/mtip-intelligent-centralized-control/alarmManager/alarmConfig/${modalState.formData.alarmId}?name=${modalState.formData.alarmName}`}
                />
              </>
            )}
            {modalState.type === 'LOGIC' && (
              <a-form-item
                label='计算规则'
                name='logicRule'
                style='margin-bottom:0'
              >
                <a-textarea
                  rows={5}
                  v-model={[modalState.formData.logicRule, 'value']}
                />
              </a-form-item>
            )}
          </a-form>
        </a-modal>
        {/* //历史数据分析 */}
        {['METRIC', 'ACTION', 'PARAMETER'].includes(
          props.attrInfo.propertyType
        ) && <preHistory ref={preRef} />}

        {/* 料流数据中间值 */}
        {props.attrInfo.displayType === 'IFRAME' && (
          <a-modal
            v-model:visible={modalIframeState.visible}
            title={props.attrInfo.label}
            getContainer={() => getModalContainer()}
            width='1200px'
            destroyOnClose
            footer={null}
          >
            <div class='mar-l--20'>
              <iframe
                src={props.attrInfo.value}
                frameborder='0'
                style='width:100%;height:70vh'
              ></iframe>
            </div>
          </a-modal>
        )}
      </>
    );
  },
});
