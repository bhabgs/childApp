import {
  defineComponent,
  ref,
  onMounted,
  reactive,
  watch,
  computed,
  nextTick,
} from 'vue';
import { QuestionCircleOutlined, PlusOutlined } from '@ant-design/icons-vue';
import preApi from '@/api/PRE';
import { getAllRule, createPointCode } from '@/api/thingInstance';
import { Empty } from 'ant-design-vue';
import { useRouter } from 'vue-router';
import _ from 'lodash';
export default defineComponent({
  name: 'SelectFormItem',
  props: {
    label: {
      type: String,
      required: false,
    },
    tip: {
      type: String,
      default:
        '当前协议数据单元中如没有该地址将会自动创建。Modbus协议的地址以0x、1x、3x、4x开头：01 Read Coils(0x);02 Read Discrete Inputs(1x);03 Read Holding Registers(4x);04 Read Input Registers (3x)',
    },
    name: {
      type: String,
      required: true,
    },
    watchVal: {
      type: String,
      default: '',
    },
    model: {
      type: Array,
      default: () => {},
    },
    linkUrl: {
      type: String,
      required: true,
    },
    //区别是address or 报警规则
    type: {
      type: String,
      default: 'address',
    },
  },
  emits: ['change', 'add'],
  components: {
    VNodes: (_, { attrs }) => {
      return attrs.vnodes;
    },
  },
  setup(props, { emit, expose }) {
    const router = useRouter();
    const state = reactive<{
      list: any[];
      searchValue: string;
      keyword: string;
    }>({
      list: [],
      searchValue: '',
      keyword: '',
    });
    const getAddrList = async (pduCode: string) => {
      if (!pduCode) return;
      const res = await preApi.getPointItemListByPduCode({
        pduCode,
        pageNum: 1,
        pageSize: 9999,
      });
      state.list = res.data.pointItems.map((el) => {
        return {
          ...el,
          label: el.exAddress + `(${el.pointDescription})`,
          value: el.pointCode,
        };
      });
    };
    const getAlarmRuleList = async () => {
      const res = await getAllRule({
        pageNum: 1,
        pageSize: 9999,
        keyword: state.keyword,
      });
      state.list = res.data.records.map((el) => {
        return {
          ...el,
          label: el.name,
          value: el.id,
        };
      });
    };
    const getList = async () => {
      if (props.type === 'alarmRule') {
        getAlarmRuleList();
      } else {
        getAddrList(props.watchVal);
      }
    };
    const onChange = (nVal: string, opt?: any) => {
      if (opt) {
        emit('change', opt);
      } else {
        const one = state.list.find((item) => {
          return item.value == nVal;
        });
        one && emit('change', one);
      }
    };
    const handlePopupScroll = (e) => {
      console.log(e);
    };
    watch(
      () => props.watchVal,
      (n) => {
        if (n) {
          getAddrList(n);
        } else {
          state.list = [];
        }
      }
    );
    watch(
      () => [props.model[props.name], state.list],
      (nVal) => {
        if (nVal[0] && nVal[1]) {
          onChange(nVal[0]);
        }
      }
    );
    onMounted(() => {
      getList();
    });

    return () => (
      <a-form-item
        name={props.name}
        v-slots={{
          label: () => {
            return (
              <a-space>
                {props.label}
                <a-tooltip
                  v-slots={{
                    title: () => props.tip,
                  }}
                >
                  <QuestionCircleOutlined />
                </a-tooltip>
              </a-space>
            );
          },
        }}
      >
        <a-space>
          <a-select
            v-model={[props.model[props.name], 'value']}
            allow-clear
            style={{ width: '250px' }}
            show-search
            options={state.list}
            optionFilterProp='label'
            onSearch={_.debounce((val: string) => {
              state.searchValue = val;
              state.keyword = val;
              getList();
            }, 500)}
            onChange={(value, option) => {
              onChange(value, option);
            }}
            onPopupScroll={handlePopupScroll}
            v-slots={{
              dropdownRender: ({ menuNode: menu }) => {
                return (
                  <div>
                    <v-nodes vnodes={menu} />
                    <div
                      class='align-c'
                      v-show={
                        state.searchValue.trim() &&
                        ((props.watchVal && props.type === 'address') ||
                          props.type === 'alarmRule')
                      }
                    >
                      <a-divider style='margin: 8px 0' />
                      <a-button
                        type='primary'
                        size='small'
                        onMousedown={(e) => e.preventDefault()}
                        onClick={() => {
                          emit('add', state.searchValue.trim(), async (val) => {
                            await getList();
                          });
                        }}
                      >
                        新增
                      </a-button>
                    </div>
                  </div>
                );
              },
              notFoundContent: () => {
                return (
                  <div class='align-c'>
                    <a-empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
                  </div>
                );
              },
            }}
          ></a-select>
          {props.model[props.name] && (
            <a-button
              type='link'
              onClick={() => {
                router.push(props.linkUrl);
              }}
            >
              编辑
            </a-button>
          )}
        </a-space>
      </a-form-item>
    );
  },
});
