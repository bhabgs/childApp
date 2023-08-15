import {
  defineComponent,
  computed,
  reactive,
  ref,
  watch,
  nextTick,
  Transition,
  onMounted,
} from 'vue';
import { message } from 'ant-design-vue';
import * as modelApis from '@/api/thingModel';
import '@/assets/style/pages/thingManager/thingModelManager/thingModel.less';
import { formAttrUpdateRules } from '../../config';
import edit from './updateConfig/edit';
import detail from './updateConfig/detail';
import storage from './updateConfig/storage';
import advanced from './updateConfig/advanced';
import { propertyTypes } from './updateConfig/config';
import dayjs from 'dayjs';
import {
  CaretRightOutlined,
  CaretDownFilled,
  QuestionCircleOutlined,
} from '@ant-design/icons-vue';
import emitter from '@/utils/mitt';
import _ from 'lodash';

const formDefault = {
  remark: '',
  propertyType: 'property',
  useStandard: true,
  readonly: false,
  required: false,
  display: true,
  padDisplay: true,
  mobileDisplay: true,
  eventEnable: true,
  id: undefined,
  code: undefined,
  groupType: undefined,
  columnType: 'string',
};

export default defineComponent({
  components: { edit, detail, storage, advanced },
  setup(props, { expose, emit }) {
    const formRef = ref();
    const editFormRef = ref();
    const detailFormRef = ref();
    // const storageFormRef = ref();
    const advancedFormRef = ref();
    const state = reactive<{
      formModel: any;
      formRules: any;
      title: string;
      visible: boolean;
      isAdd: boolean;
      alarmShow: boolean;
      keyword: string;
      attrStandardList: any[];
      attrStandardLoading: boolean;
      pageNum: number;
      foldObj: {
        [key: string]: boolean;
      };
      fieldListToProperty: any[];
      relationList: any[];
    }>({
      formModel: {},
      formRules: {},
      title: '',
      visible: false,
      isAdd: false,
      alarmShow: false,
      keyword: '',
      pageNum: 1,
      attrStandardList: [],
      attrStandardLoading: false,
      foldObj: {
        basic: true,
        edit: true,
        detail: true,
        storage: true,
        advanced: true,
      },
      fieldListToProperty: [],
      relationList: [],
    });
    //
    const getRelationList = (thingCode: string) => {
      modelApis.getThingPropertyRelationList(thingCode).then((res) => {
        state.relationList = res.data;
      });
    };
    //获取数据库字段名只针对静态属性
    const getDataBankList = (thingCode: string, propertyCode?: string) => {
      modelApis.getDataBankList(thingCode, propertyCode).then((res) => {
        state.fieldListToProperty = res.data;
      });
    };
    const getFormData = (formData: any[]) => {
      const [formVal, formDefault] = formData;
      const obj = {};
      Object.keys(formDefault).forEach((key: string) => {
        obj[key] = formVal[key];
      });
      return obj;
    };

    // 保存
    const updateHttp = () => {
      const editFormData: any = getFormData(editFormRef.value.formData);
      const detailFormData: any = getFormData(detailFormRef.value.formData);
      const advancedFormData: any = getFormData(advancedFormRef.value.formData);
      const { converted, detailPageConvertDTOS } = detailFormData;

      const signalInfo = {};
      if (converted) {
        detailPageConvertDTOS.forEach((item) => {
          signalInfo[item.inputValue] = item.color;
        });
      }
      const data = {
        ...state.formModel,
        ...editFormData,
        ...detailFormData,
        // ...storageFormData,
        ...advancedFormData,
        signalInfo,
      };
      modelApis.updateAttr(data).then(() => {
        message.success('更新成功');
        emit('ok');
        close();
      });
    };
    const update = async () => {
      const allValidate = [
        formRef.value.validate(),
        editFormRef.value.validateFn(),
        detailFormRef.value.validateFn(),
        // storageFormRef.value.validateFn(),
        advancedFormRef.value.validateFn(),
      ];
      Promise.all(allValidate)
        .then((res) => {
          updateHttp();
        })
        .catch(({ errorFields, module }) => {
          state.foldObj[module] = true;
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

    const open = async (
      isAdd: boolean,
      useStandard: boolean,
      thingCode: string,
      data?: any
    ) => {
      state.title = isAdd ? '新增' : '编辑';
      state.isAdd = isAdd;
      state.formRules = formAttrUpdateRules(thingCode, data?.id || '');
      const attrInfo = data || {};
      console.log(attrInfo, 'attrInfo');
      getDataBankList(thingCode, attrInfo.code);
      getRelationList(thingCode);
      state.formModel = {
        ...formDefault,
        ...attrInfo,
        useStandard,
        thingCode,
      };
      if (isAdd) {
        getAlarm();
      } else {
        state.formModel.useStandard = attrInfo.useStandard;
        const { defaultValue, displayType, signalInfo } = state.formModel;
        //日期类型转换一下值
        if (displayType && displayType.indexOf('date') > -1 && defaultValue) {
          state.formModel.defaultValue = dayjs(state.formModel.defaultValue);
        }
        // 转换显示色值 数据格式
        if (signalInfo) {
          state.formModel.detailPageConvertDTOS = [];
          const signalInfoObj = JSON.parse(signalInfo);
          Object.keys(signalInfoObj).forEach((key) => {
            state.formModel.detailPageConvertDTOS.push({
              inputValue: key,
              color: signalInfoObj[key],
            });
          });
          state.formModel.converted =
            state.formModel.detailPageConvertDTOS.length > 0;
        }
      }
      if (useStandard) {
        state.alarmShow = true;
      }
      state.visible = true;
    };
    const close = () => {
      state.visible = false;
      state.formModel = {};
      state.alarmShow = false;
      state.keyword = '';
      state.pageNum = 1;
      Object.keys(state.foldObj).forEach((key) => {
        state.foldObj[key] = true;
      });
      if (formRef.value) {
        formRef.value.clearValidate();
      }
      emit('close');
    };
    let total = 0;
    // 获取标准属性
    const getAlarm = () => {
      if (state.pageNum > 1 && state.pageNum > total) {
        return;
      }
      if (state.pageNum === 1) {
        state.attrStandardList = [];
      }
      const data = {
        pageNum: state.pageNum,
        pageSize: 20,
        keyword: state.keyword,
      };
      state.attrStandardLoading = true;
      modelApis.alarmList(data).then((res) => {
        state.attrStandardLoading = false;
        state.attrStandardList = state.attrStandardList.concat(res.data.list);
        total = res.data.pages;
      });
    };
    //标准属性配置
    const handleConfig = (row: any) => {
      state.formModel.code = row.code;
      state.formModel.name = row.name;
      state.formModel.displayLabel = row.name;
      state.alarmShow = false;
    };
    const footerContext = () => {
      return (
        <a-space>
          {state.isAdd && state.alarmShow && (
            <a-button
              type='primary'
              ghost
              onClick={() => {
                state.formModel.useStandard = false;
                state.alarmShow = false;
              }}
            >
              自定义属性
            </a-button>
          )}
          <a-button type='primary' ghost onClick={close}>
            取消
          </a-button>
          {state.isAdd && !state.alarmShow && (
            <a-button
              type='primary'
              ghost
              onClick={() => {
                state.alarmShow = true;
                state.formModel.useStandard = true;
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
    //属性名称change
    const handleNameBlur = (e: any) => {
      if (!state.formModel.displayLabel) {
        state.formModel.displayLabel = e.target.value;
      }
    };
    const getTooltip = (title: string) => {
      return (
        <a-tooltip title={title}>
          <QuestionCircleOutlined />
        </a-tooltip>
      );
    };
    const getFoldJsx = (boo: boolean, type: string) => {
      return (
        <div class='fold' onClick={() => handleFold(boo, type)}>
          <span>{boo ? '收起' : '展开'}</span>
          {boo ? <CaretDownFilled /> : <CaretRightOutlined />}
        </div>
      );
    };
    const handleFold = (fold: boolean, type: string) => {
      state.foldObj[type] = !fold;
    };
    watch(
      () => state.formModel.propertyType,
      (n, o) => {}
    );
    watch(
      () => state.formModel,
      (n, o) => {
        emitter.emit('formDataChange');
      },
      {
        deep: true,
      }
    );
    onMounted(() => {});
    expose({ open });
    return () => (
      <div class=''>
        <a-modal
          visible={state.visible}
          title={state.title}
          width={state.alarmShow ? '600px' : '950px'}
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
                  onSearch={() => {
                    state.pageNum = 1;
                    getAlarm();
                  }}
                  onChange={() => {
                    _.debounce(() => {
                      state.pageNum = 1;
                      getAlarm();
                    }, 500)();
                  }}
                />
                <div class='align-c attr_standard_list'>
                  <a-list
                    data-source={state.attrStandardList}
                    loading={state.attrStandardLoading}
                    v-slots={{
                      renderItem: ({ item }: any) => {
                        return (
                          <a-list-item>
                            <div class='flex-lr-c alarm_card'>
                              <div>
                                <p>
                                  {item.name}【{item.code}】
                                </p>
                              </div>
                              <a onClick={() => handleConfig(item)}>
                                选择并继续配置
                              </a>
                            </div>
                          </a-list-item>
                        );
                      },
                      loadMore: () => {
                        return (
                          <>
                            <a-button
                              v-show={
                                !state.attrStandardLoading &&
                                state.pageNum < total
                              }
                              class='more_btn'
                              onClick={() => {
                                state.pageNum++;
                                getAlarm();
                              }}
                            >
                              加载更多
                            </a-button>
                            <p
                              class='color-9 mar-t-20'
                              v-show={
                                state.pageNum >= total && state.pageNum > 1
                              }
                            >
                              没有更多了
                            </p>
                          </>
                        );
                      },
                    }}
                  ></a-list>
                </div>
              </div>
            ) : (
              <div>
                <div class='attr_sort_title'>
                  <p>基础信息</p>
                  {getFoldJsx(state.foldObj.basic, 'basic')}
                </div>
                {/* //基础信息 */}
                <Transition name='fade'>
                  <a-form
                    ref={formRef}
                    model={state.formModel}
                    rules={state.formRules}
                    label-col={{ span: 8 }}
                    wrapper-col={{ span: 15 }}
                    v-show={state.foldObj.basic}
                  >
                    <a-row>
                      <a-col span={12}>
                        <a-form-item label='属性名称' name='name'>
                          <a-input
                            v-model={[state.formModel.name, 'value']}
                            disabled={state.formModel.useStandard}
                            onBlur={handleNameBlur}
                          />
                        </a-form-item>
                      </a-col>
                      <a-col span={12}>
                        <a-form-item
                          name='code'
                          v-slots={{
                            label: () => {
                              return (
                                <a-space>
                                  属性编码
                                  {getTooltip(
                                    '支持数字、大小写字母和_；不建议使用小写字母，不符合业务规范，但不影响保存'
                                  )}
                                </a-space>
                              );
                            },
                          }}
                        >
                          <a-input
                            v-model={[state.formModel.code, 'value']}
                            disabled={
                              state.formModel.useStandard || !state.isAdd
                            }
                            placeholder='支持数字、大小写字母和_'
                          />
                        </a-form-item>
                      </a-col>
                      <a-col span={24}>
                        <a-form-item
                          label='属性类型'
                          name='propertyType'
                          label-col={{ span: 4 }}
                          wrapper-col={{ span: 20 }}
                        >
                          <a-radio-group
                            disabled={!state.isAdd}
                            v-model={[state.formModel.propertyType, 'value']}
                          >
                            {propertyTypes.map((item: any) => {
                              return (
                                <a-radio value={item.key} key={item.key}>
                                  {item.name}
                                  {getTooltip(item.tip)}
                                </a-radio>
                              );
                            })}
                          </a-radio-group>
                        </a-form-item>
                      </a-col>

                      <a-col span={12}>
                        <a-form-item label='前端界面显示名' name='displayLabel'>
                          <a-input
                            v-model={[state.formModel.displayLabel, 'value']}
                          />
                        </a-form-item>
                      </a-col>
                      <a-col span={12}>
                        <a-form-item label='单位' name='unit'>
                          <a-input v-model={[state.formModel.unit, 'value']} />
                        </a-form-item>
                      </a-col>
                      {(state.formModel.propertyType === 'action' ||
                        state.formModel.propertyType === 'logic') && (
                        <a-col span={12}>
                          <a-form-item label='默认计算公式' name='defaultRule'>
                            <a-input
                              v-model={[state.formModel.defaultRule, 'value']}
                            />
                          </a-form-item>
                        </a-col>
                      )}

                      {(state.formModel.propertyType === 'action' ||
                        state.formModel.propertyType === 'logic' ||
                        state.formModel.propertyType === 'metric') && (
                        <a-col span={12}>
                          <a-form-item label='字段类型' name='columnType'>
                            <a-select
                              v-model={[state.formModel.columnType, 'value']}
                            >
                              <a-select-option value='string'>
                                string(字符串)
                              </a-select-option>
                              <a-select-option value='boolean'>
                                boolean(布尔型)
                              </a-select-option>
                              <a-select-option value='long'>
                                long(整数)
                              </a-select-option>
                              <a-select-option value='double'>
                                double(小数)
                              </a-select-option>
                            </a-select>
                          </a-form-item>
                        </a-col>
                      )}

                      {state.formModel.propertyType === 'property' && (
                        <a-col span={12}>
                          <a-form-item label='存储字段' name='columnName'>
                            <a-select
                              allowClear
                              show-search
                              v-model={[state.formModel.columnName, 'value']}
                              placeholder='请输入关键字进行选择'
                              optionFilterProp='key'
                              fieldNames={{ label: 'key', value: 'key' }}
                              options={state.fieldListToProperty}
                              onChange={(value: string, opt: any) => {
                                if (opt) { 
                                  state.formModel.columnType = opt.value;
                                } else {
                                  state.formModel.columnType = 'string';
                                }
                              }}
                            ></a-select>
                          </a-form-item>
                        </a-col>
                      )}
                      {state.formModel.propertyType === 'relation' && (
                        <a-col span={12}>
                          <a-form-item label='关系' name='relationId'>
                            <a-select
                              allowClear
                              show-search
                              v-model={[state.formModel.relationId, 'value']}
                              placeholder='请输入关键字进行选择'
                              optionFilterProp='key'
                              fieldNames={{ label: 'key' }}
                              options={state.relationList}
                            ></a-select>
                          </a-form-item>
                        </a-col>
                      )}
                      <a-col span={24}>
                        <a-form-item label='是否显示' label-col={{ span: 4 }}>
                          <a-checkbox
                            v-model={[state.formModel.display, 'checked']}
                          >
                            Web端
                          </a-checkbox>
                          <a-checkbox
                            v-model={[state.formModel.padDisplay, 'checked']}
                          >
                            Pad端
                          </a-checkbox>
                          <a-checkbox
                            v-model={[state.formModel.mobileDisplay, 'checked']}
                          >
                            手机端
                          </a-checkbox>
                          <a-checkbox
                            v-model={[state.formModel.eventEnable, 'checked']}
                          >
                            设备流程图弹窗
                          </a-checkbox>
                        </a-form-item>
                      </a-col>
                    </a-row>
                  </a-form>
                </Transition>

                <div class='attr_sort_title'>
                  <p>编辑页配置</p>
                  {getFoldJsx(state.foldObj.edit, 'edit')}
                </div>

                {/* 编辑页配置 */}
                <Transition name='fade'>
                  <edit
                    v-show={state.foldObj.edit}
                    ref={editFormRef}
                    formData={state.formModel}
                    property={state.formModel.propertyType}
                  />
                </Transition>

                <div class='attr_sort_title'>
                  <p>详情页配置</p>
                  {getFoldJsx(state.foldObj.detail, 'detail')}
                </div>
                <Transition name='fade'>
                  <detail
                    v-show={state.foldObj.detail}
                    ref={detailFormRef}
                    formData={state.formModel}
                    property={state.formModel.propertyType}
                  />
                </Transition>

                {/* <div class='attr_sort_title'>
                  <p>存储配置</p>
                  {getFoldJsx(state.foldObj.storage, 'storage')}
                </div>
                <Transition name='fade'>
                  <storage
                    v-show={state.foldObj.storage}
                    // ref={storageFormRef}
                    formData={state.formModel}
                    property={state.formModel.propertyType}
                    thingCode={state.formModel.thingCode}
                    attrCode={state.formModel.code}
                  />
                </Transition> */}

                <div class='attr_sort_title'>
                  <p>高级配置</p>
                  {getFoldJsx(state.foldObj.advanced, 'advanced')}
                </div>
                <Transition name='fade'>
                  <advanced
                    v-show={state.foldObj.advanced}
                    ref={advancedFormRef}
                    formData={state.formModel}
                    property={state.formModel.propertyType}
                  />
                </Transition>

                <a-form label-col={{ span: 4 }} wrapper-col={{ span: 19 }}>
                  <a-row>
                    <a-col span={24}>
                      <a-form-item label='备注' name='remark'>
                        <a-textarea v-model={[state.formModel.remark, 'value']} />
                      </a-form-item>
                    </a-col>
                  </a-row>
                </a-form>
              </div>
            )}
          </div>
        </a-modal>
      </div>
    );
  },
});
