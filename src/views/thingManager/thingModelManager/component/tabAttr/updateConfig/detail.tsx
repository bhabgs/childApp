import {
  defineComponent,
  computed,
  reactive,
  ref,
  watch,
  nextTick,
  onMounted,
  onBeforeUnmount,
} from 'vue';
import { message } from 'ant-design-vue';
import * as modelApis from '@/api/thingModel';
import { valueConvertFormulaTypeEnums } from './config';
import { colorPicker } from '@/components/colorPicker';
import {
  QuestionCircleOutlined,
  PlusCircleOutlined,
  MinusCircleOutlined,
} from '@ant-design/icons-vue';
import { cloneDeep } from 'lodash';
import { validateFn } from './config';
import { addThingGroup } from '@/api/thingModel';
import { Empty } from 'ant-design-vue';
import emitter from '@/utils/mitt';
const detailPageConvertList = [
  {
    inputValue: 'NULL',
    color: '#9095A2',
  },
  {
    inputValue: '0',
    color: '#22CC83',
  },
  {
    inputValue: '1',
    color: '#EA5858',
  },
  {
    inputValue: '2',
    color: '#FF9214',
  },
  {
    inputValue: '3',
    color: '#FFC414',
  },
  {
    inputValue: '4',
    color: '#3E7EFF',
  },
];

const formDefault = {
  groupName: undefined,
  colspan: 1, //跨列显示
  // redirectType: 'NONE',
  canLink: 0,
  linkUrl: '', //链接地址
  converted: false, //显示转换
  detailPageConvertDTOS: [],
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
  },
  components: { colorPicker },
  setup(props, { expose, emit }) {
    const formRef = ref();
    const groupModalRef = ref();
    const state = reactive<{
      formModel: any;
      formRules: any;
    }>({
      formModel: cloneDeep({
        ...formDefault,
        ...props.formData,
      }),
      formRules: {},
    });
    const groupModal = reactive<{
      title: string;
      groupTypeList: any[];
    }>({
      title: '',
      groupTypeList: [],
    });
    const addConvert = () => {
      state.formModel.detailPageConvertDTOS.push({
        color: '#333333',
      });
    };
    const delConvert = (index: number) => {
      state.formModel.detailPageConvertDTOS.splice(index, 1);
    };
    const getTooltip = (title: string) => {
      return (
        <a-tooltip title={title}>
          <QuestionCircleOutlined />
        </a-tooltip>
      );
    };
    const convertChange = (e) => {
      if (!e) {
        state.formModel.detailPageConvertDTOS = [];
      } else if (state.formModel.detailPageConvertDTOS.length === 0) {
        addConvert();
      }
    };
    expose({
      validateFn: validateFn(formRef, 'detail'),
      formData: [state.formModel, formDefault],
    });
    onMounted(() => {
      getThingGroupTypeList();
      emitter.on('displayTypeChange', (displayType) => {
        if (displayType === 'alarm') {
          state.formModel.converted = true;
          state.formModel.detailPageConvertDTOS = cloneDeep(
            detailPageConvertList
          );
          state.formModel.colspan = 2;
          state.formModel.canLink = 1;
          state.formModel.linkUrl =
            '/mtip-intelligent-centralized-control/alarmManager/alarmLog/${' +
            state.formModel.code +
            '.alarmInstId}?name=报警详情';
        } else {
          state.formModel.converted = false;
          state.formModel.detailPageConvertDTOS = [];
          state.formModel.colspan = 1;
          state.formModel.canLink = 0;
          state.formModel.linkUrl = '';
        }
      });
    });
    onBeforeUnmount(() => {
      state.formModel = {};
    });

    // 获取属性分组
    const getThingGroupTypeList = () => {
      modelApis.thingGroupTypeList().then((res) => {
        groupModal.groupTypeList = res.data;
      });
    };

    const addGroup = () => {
      addThingGroup(groupModal.title).then(() => {
        message.success('添加成功');
        getThingGroupTypeList();
      });
    };
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
      <div class=''>
        <a-form
          ref={formRef}
          model={state.formModel}
          rules={state.formRules}
          label-col={{ span: 8 }}
          wrapper-col={{ span: 15 }}
        >
          <a-row>
            <a-col span={12}>
              <a-form-item label='查看分组' name='groupName'>
                <div class='flex-center'>
                  <a-select
                    v-model={[state.formModel.groupName, 'value']}
                    onSearch={(val: string) => {
                      groupModal.title = val;
                    }}
                    showSearch
                    v-slots={{
                      notFoundContent: () => {
                        return (
                          <div class='align-c'>
                            <a-empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
                            <a-button
                              v-show={groupModal.title.trim()}
                              onClick={addGroup}
                              size='small'
                              type='primary'
                            >
                              新增
                            </a-button>
                          </div>
                        );
                      },
                    }}
                  >
                    {groupModal.groupTypeList.map((item) => {
                      return (
                        <a-select-option value={item.key}>
                          {item.key}
                        </a-select-option>
                      );
                    })}
                  </a-select>
                  {/* <PlusCircleOutlined
                    onClick={() => {
                      groupModal.visible = true;
                    }}
                    class='color_theme'
                    style={{ fontSize: '18px', marginLeft: '10px' }}
                  /> */}
                </div>
              </a-form-item>
            </a-col>
            <a-col span={12}>
              <a-form-item
                name='colspan'
                v-slots={{
                  label: () => {
                    return (
                      <a-space>
                        跨列展示
                        {getTooltip('详情页为N行4列，可设置为1~4列')}
                      </a-space>
                    );
                  },
                }}
              >
                <a-input-number
                  v-model={[state.formModel.colspan, 'value']}
                  min={1}
                  max={4}
                  addon-after='列'
                  style='width:100%'
                />
              </a-form-item>
            </a-col>
            <a-col span={12}>
              <a-form-item label='是否为超级链接' name='canLink'>
                <a-select
                  v-model={[state.formModel.canLink, 'value']}
                  onChange={(val) => {
                    if (val === 0) {
                      state.formModel.linkUrl = '';
                    }
                  }}
                >
                  <a-select-option value={0}>无</a-select-option>
                  <a-select-option value={1}>打开新页签</a-select-option>
                  <a-select-option value={2}>打开iframe</a-select-option>
                </a-select>
              </a-form-item>
            </a-col>
            {state.formModel.canLink > 0 && (
              <>
                <a-col span={12}>
                  <a-form-item
                    name='linkUrl'
                    v-slots={{
                      label: () => {
                        return (
                          <a-space>
                            链接地址
                            {getTooltip(
                              '物实例无需配置，若需要打开其他业务模块则需要配置，例如：打开视频监控模块，请输入以下内容/vms/search?code=${code}'
                            )}
                          </a-space>
                        );
                      },
                    }}
                  >
                    <a-input v-model={[state.formModel.linkUrl, 'value']} />
                  </a-form-item>
                </a-col>
              </>
            )}
          </a-row>
          <a-row>
            <a-col span={24}>
              <a-form-item
                label='显示转换'
                name='converted'
                label-col={{ span: 4 }}
              >
                <a-switch
                  v-model={[state.formModel.converted, 'checked']}
                  onChange={convertChange}
                />
              </a-form-item>
            </a-col>
          </a-row>
          {state.formModel.converted && (
            <a-row>
              <a-col span={18} offset={4}>
                {state.formModel.detailPageConvertDTOS.map(
                  (item: any, index: number) => {
                    return (
                      <div key={index}>
                        <a-space>
                          <span>值 = </span>
                          <a-input v-model={[item.inputValue, 'value']} />
                        </a-space>
                        <a-space class='mar-l-20'>
                          {/* <span>显示</span>
                          <a-input
                            placeholder='未设置文字时显示原值'
                            v-model={[item.convertShowValue, 'value']}
                          /> */}
                          <span>颜色</span>
                          <colorPicker v-model={item.color} />
                          <a-space class='mar-l-20'>
                            {index ===
                              state.formModel.detailPageConvertDTOS.length -
                                1 && (
                              <PlusCircleOutlined
                                onClick={addConvert}
                                class='color_theme'
                                style={{ fontSize: '18px' }}
                              />
                            )}
                            <MinusCircleOutlined
                              v-show={
                                index > 0 ||
                                state.formModel.detailPageConvertDTOS.length > 1
                              }
                              onClick={() => delConvert(index)}
                              class='color_theme'
                              style={{ fontSize: '18px' }}
                            />
                          </a-space>
                        </a-space>
                      </div>
                    );
                  }
                )}
              </a-col>
            </a-row>
          )}
        </a-form>
      </div>
    );
  },
});
