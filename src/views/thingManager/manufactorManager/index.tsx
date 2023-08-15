import {
  defineComponent,
  reactive,
  ref,
  onMounted,
  createVNode,
  watch,
  toRaw,
  PropType,
} from 'vue';
import '@/assets/style/pages/thingManager/factory.less';
import manufactoryApi from '@/api/factory';
import type { FormInstance, TreeProps } from 'ant-design-vue';
import { Rule } from 'ant-design-vue/lib/form/interface';
import dayjs from 'dayjs';

import {
  Tree,
  Input,
  Button,
  Row,
  Col,
  Form,
  FormItem,
  Switch,
  TimePicker,
  Dropdown,
  Modal,
  Empty,
  message,
} from 'ant-design-vue';
import {
  EditOutlined,
  DeleteOutlined,
  FileAddOutlined,
  ExclamationCircleOutlined,
  SearchOutlined,
  PlusCircleOutlined,
  QuestionCircleOutlined,
} from '@ant-design/icons-vue';
import useTreeSearch from '@/hooks/treeSearch';

interface InfoState {
  name: string;
  shortName: string;
  code: string;
  validEnable: boolean;
  remark: string;
  address?: string;
  linkPhone?: string;
  linkUser?: string;
  website?: string;
  id?: any;
  updateTime?: string;
  updateUser?: string;
  createUser?: string;
  createTime?: string;
}
const defaultInfoState: InfoState = {
  name: '',
  shortName: '',
  code: '',
  validEnable: true,
  address: '',
  linkPhone: '',
  linkUser: '',
  website: '',
  remark: '',
};
function infoPart() {
  const isEdit = ref<boolean>(false);
  const isNew = ref<boolean>(false);
  const formRef = ref<FormInstance>();
  const infoRef = reactive<{ infoState: InfoState }>({
    infoState: { ...defaultInfoState },
  });
  const rulesRef = reactive({
    name: [
      {
        required: true,
        message: '请输入名称',
      },
    ],
    shortName: [
      {
        required: true,
        message: '请输入简称',
      },
    ],
    code: [
      // {
      //   required: true,
      //   message: '请输入编码',
      // },
    ],
    validEnable: [
      {
        required: true,
        message: '请选择',
      },
    ],
    linkPhone: [
      {
        validator: async (_rule: Rule, value: string) => {
          const reg = /^[0-9\-]+$/;
          if (value && !reg.test(value)) {
            return Promise.reject('电话格式不正确');
          }
          return Promise.resolve();
        },
        trigger: ['blur'],
      },
    ],
  });

  return {
    infoRef,
    formRef,
    rulesRef,
    isEdit,
    isNew,
  };
}

export default defineComponent({
  name: 'manufactorManager',
  setup(props) {
    const state = reactive<{
      rightInfoShow: boolean;
      nodeLevel: number;
    }>({
      rightInfoShow: false,
      nodeLevel: 0,
    });
    let insertParentId: string = '';
    let selectNodeData: any = null;
    const { infoRef, formRef, rulesRef, isEdit, isNew } = infoPart();
    const validateUnique = async (
      value: string,
      key: string,
      tip: string,
      type: string
    ) => {
      const res = await manufactoryApi.compareCondition(
        { [key]: value, id: isNew.value ? null : selectNodeData.id },
        type
      );
      if (res.data) return Promise.reject('该' + tip + '已存在');
    };
    const ruleName = {
      validator: async (_rule: any, value: string) => {
        if (value.trim() && state.nodeLevel == 1) {
          await validateUnique(
            value.trim(),
            'name',
            '名称',
            getNodeSort().apiSort
          );
        }
        return Promise.resolve();
      },
      trigger: 'blur',
    };
    const ruleCode = {
      validator: async (_rule: any, value: string) => {
        if (value.trim()) {
          await validateUnique(
            value.trim(),
            'code',
            '编码',
            getNodeSort().apiSort
          );
        }
        return Promise.resolve();
      },
      trigger: 'blur',
    };
    const ruleShortName = {
      validator: async (_rule: any, value: string) => {
        //只有厂家验证 简称 名称
        if (value.trim() && state.nodeLevel == 1) {
          await validateUnique(
            value.trim(),
            'shortName',
            '简称',
            getNodeSort().apiSort
          );
        }
        return Promise.resolve();
      },
      trigger: 'blur',
    };
    rulesRef.name.push(ruleName as any);
    rulesRef.shortName.push(ruleShortName as any);
    rulesRef.code.push(ruleCode as any);

    const transformTime = (
      time: number | string | Date,
      format = 'YYYY-MM-DD HH:mm:ss'
    ) => {
      return time ? dayjs(time).format(format) : '--';
    };
    const {
      tree,
      searchValue,
      expandedKeys,
      autoExpandParent,
      selectedKeyArr,
      fieldNames,
      generateKey,
      generateList,
      filter,
    } = useTreeSearch({
      title: 'shortName',
      children: 'list',
      name: 'name',
      key: 'key',
    });
    const treeLoading = ref(false);
    const getList = () => {
      treeLoading.value = true;
      manufactoryApi.getList().then((res) => {
        const data = generateKey('0', res.data);
        generateList(data);
        tree.data = data;
        tree.treeDataOrigin = data;
        if (searchValue.value.trim()) {
          tree.data = filter(data);
        }
        treeLoading.value = false;
      });
    };
    const getRowInfo = (
      key: string,
      label: string,
      editAble: boolean,
      isShow = true,
      time = false
    ) => {
      return isShow ? (
        <a-col lg={13} xl={9} md={13} offset={1}>
          {isEdit.value && editAble ? (
            <a-form-item label={label} name={key}>
              <a-input
                v-model={[infoRef.infoState[key], 'value']}
                disabled={!editAble}
                maxlength={50}
              />
            </a-form-item>
          ) : (
            <div class='flex-top form_row'>
              <span class='label' style='width:7em'>
                {label}：
              </span>
              <span>
                {time
                  ? transformTime(infoRef.infoState[key])
                  : infoRef.infoState[key]}
              </span>
            </div>
          )}
        </a-col>
      ) : (
        ''
      );
    };
    const getNodeSort = () => {
      let name = '';
      let apiSort = '';
      switch (Number(state.nodeLevel)) {
        case 1:
          name = '厂家';
          apiSort = 'factory';
          break;
        case 2:
          name = '品牌';
          apiSort = 'brand';
          break;
        case 3:
          name = '型号';
          apiSort = 'model';
          break;
        default:
          break;
      }
      return {
        name,
        apiSort,
      };
    };
    const addFactor = () => {
      isNew.value = true;
      isEdit.value = true;
      state.rightInfoShow = true;
      infoRef.infoState = { ...defaultInfoState };
      state.nodeLevel = 1;
      selectedKeyArr.value = [];
      insertParentId = '';
    };
    // 新建
    const create = (node: any) => {
      state.nodeLevel = node.level + 1;
      isEdit.value = true;
      isNew.value = true;
      infoRef.infoState = { ...defaultInfoState };
    };
    // 编辑
    const edit = (node: any) => {
      state.nodeLevel = node.level;
      isEdit.value = true;
      infoRef.infoState = { ...selectNodeData };
    };
    // 删除
    const remove = (node: any) => {
      const title = node.shortName || node.name;
      Modal.confirm({
        title: `确定要删除${title}吗？`,
        icon: createVNode(ExclamationCircleOutlined),
        content: '',
        onOk() {
          manufactoryApi.remove(node.id, getNodeSort().apiSort).then(() => {
            message.success('删除成功');
            state.rightInfoShow = false;
            selectNodeData = {};
            getList();
          });
        },
      });
    };

    const selectNode = async (
      selectedKeys: string[] | number[],
      { selected, node }: any
    ) => {
      if (selected) {
        state.nodeLevel = node.level;
        selectedKeyArr.value = selectedKeys;
        selectNodeData = {
          ...node.dataRef,
        };
        insertParentId = node.id;
        cancel();
        state.rightInfoShow = true;
      }
    };

    const expandNode = (keys: string[]) => {
      expandedKeys.value = keys;
      autoExpandParent.value = false;
    };
    const cancel = () => {
      isEdit.value = false;
      isNew.value = false;
      if (selectNodeData) {
        infoRef.infoState = { ...selectNodeData };
        state.nodeLevel = selectNodeData.level;
      } else {
        state.rightInfoShow = false;
      }
    };
    const submit = () => {
      formRef.value?.validate().then((res) => {
        const type: string = isNew.value ? 'insert' : 'update';
        const extra: any = {};
        if (!isNew.value) {
          extra.id = infoRef.infoState.id;
          extra.code = infoRef.infoState.code;
        } else {
          if (state.nodeLevel === 2) {
            extra.factoryId = insertParentId;
          } else if (state.nodeLevel === 3) {
            extra.brandId = insertParentId;
          }
        }
        manufactoryApi
          .update({ ...res, ...extra }, type, getNodeSort().apiSort)
          .then(async (resp) => {
            const resData = resp.data;
            selectNodeData = {
              ...selectNodeData,
              ...resData,
            };
            infoRef.infoState = { ...selectNodeData };
            getList();
            if (isNew.value) {
              selectedKeyArr.value = [];
            }
            isEdit.value = false;
            isNew.value = false;
          });
      });
    };
    watch(
      () => isEdit.value,
      (n) => {
        if (!n) {
          formRef.value?.resetFields();
        }
      }
    );
    onMounted(() => {
      getList();
    });
    return () => (
      <div class='manufactorManager flex'>
        <div class='tree_data flex'>
          <div class='top'>
            <a-input
              allowClear
              v-model={[searchValue.value, 'value']}
              placeholder='请输入名称进行搜索'
              v-slots={{
                suffix: () => {
                  return <SearchOutlined style='color: rgba(0, 0, 0, 0.45)' />;
                },
              }}
            />
            <div class='mar-tb-12'>
              <a-button type='link' onClick={addFactor} size='small'>
                <PlusCircleOutlined />
                新增厂家
              </a-button>
            </div>
          </div>

          <div class='tree_wrap flex1'>
            <a-spin
              wrapperClassName='h_100'
              tip='加载中...'
              spinning={treeLoading.value}
            >
              <a-tree
                show-line
                blockNode={true}
                tree-data={tree.data}
                field-names={fieldNames}
                onSelect={selectNode}
                onExpand={expandNode}
                selectedKeys={selectedKeyArr.value}
                expanded-keys={expandedKeys.value}
                auto-expand-parent={autoExpandParent.value}
                v-slots={{
                  title: ({ name, shortName, selected, dataRef }: any) => {
                    const title = shortName || name;
                    return (
                      <span class='tree-node-title'>
                        <a-tooltip
                          placement='topLeft'
                          v-slots={{
                            title: () => {
                              return <span>{title}</span>;
                            },
                          }}
                        >
                          <span
                            class={[
                              'node_title',
                              `node_title_${dataRef.level}`,
                              selected ? 'on' : '',
                            ]}
                          >
                            {title}
                          </span>
                        </a-tooltip>
                        {selected && (
                          <a-space class='f_r'>
                            <span>
                              <EditOutlined
                                title='编辑'
                                onClick={(e) => {
                                  e.stopPropagation();
                                  edit(dataRef);
                                }}
                              />
                            </span>
                            <span>
                              <DeleteOutlined
                                title='删除'
                                onClick={(e) => {
                                  e.stopPropagation();
                                  remove(dataRef);
                                }}
                              />
                            </span>
                            {dataRef.level !== 3 && (
                              <span>
                                <PlusCircleOutlined
                                  title='添加'
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    create(dataRef);
                                  }}
                                />
                              </span>
                            )}
                          </a-space>
                        )}
                      </span>
                    );
                  },
                }}
              ></a-tree>
            </a-spin>
          </div>
        </div>
        <div class='info_con'>
          {state.rightInfoShow ? (
            <div>
              <div class='flex-between  flex-center'>
                <h3 class='bold'>
                  {isNew.value ? '新增' : isEdit.value ? '编辑' : ''}
                  {getNodeSort().name}基本信息
                </h3>
                {isEdit.value ? (
                  <a-space>
                    <a-button key='save' type='primary' onClick={submit}>
                      保存
                    </a-button>
                    <a-button
                      key='cancle'
                      type='primary'
                      ghost
                      onClick={cancel}
                    >
                      取消
                    </a-button>
                  </a-space>
                ) : (
                  <a-button
                    type='primary'
                    onClick={() => {
                      isEdit.value = true;
                    }}
                  >
                    编辑
                  </a-button>
                )}
              </div>
              <div class='mar-t-20'>
                <a-form
                  ref={formRef}
                  rules={rulesRef}
                  model={infoRef.infoState}
                  name='basic'
                  class='label_form'
                  wrapper-col={{ span: 14 }}
                >
                  <a-Row>
                    {getRowInfo(
                      'shortName',
                      getNodeSort().name + '简称',
                      true,
                      state.nodeLevel !== 3
                    )}
                    {getRowInfo(
                      'name',
                      `${
                        state.nodeLevel === 3
                          ? '型号'
                          : getNodeSort().name + '名称'
                      }`,
                      true
                    )}
                    {getRowInfo('code', getNodeSort().name + '编码', true)}
                    <a-col lg={13} xl={9} md={13} offset={1}>
                      {isEdit.value ? (
                        <a-form-item label='是否生效' name='validEnable'>
                          <a-switch
                            v-model={[infoRef.infoState.validEnable, 'checked']}
                          />
                        </a-form-item>
                      ) : (
                        <div class='flex-top form_row'>
                          <span class='label' style='width:7em'>
                            是否生效：
                          </span>
                          <div>
                            {infoRef.infoState.validEnable ? (
                              <a-tag color='success'>生效</a-tag>
                            ) : (
                              <a-tag color='error'>未生效</a-tag>
                            )}
                          </div>
                        </div>
                      )}
                    </a-col>
                    {getRowInfo(
                      'website',
                      '公司官网',
                      true,
                      state.nodeLevel === 1
                    )}
                    {getRowInfo(
                      'address',
                      '联系地址',
                      true,
                      state.nodeLevel === 1
                    )}
                    {getRowInfo(
                      'linkUser',
                      '联系人',
                      true,
                      state.nodeLevel === 1
                    )}
                    {getRowInfo(
                      'linkPhone',
                      '联系电话',
                      true,
                      state.nodeLevel === 1
                    )}
                    {getRowInfo('createUser', '创建人', false, !isEdit.value)}
                    {getRowInfo('updateUser', '更新人', false, !isEdit.value)}
                    {getRowInfo(
                      'createTime',
                      '创建时间',
                      false,
                      !isEdit.value,
                      true
                    )}
                    {getRowInfo(
                      'updateTime',
                      '更新时间',
                      false,
                      !isEdit.value,
                      true
                    )}
                  </a-Row>
                  <a-row>
                    <a-col span={20} offset={1}>
                      <a-form-item
                        name='remark'
                        wrapper-col={{ span: 19 }}
                        v-slots={{
                          label: () => {
                            return (
                              <a-space>
                                <span>备注</span>
                                <a-tooltip title='注：备注最多可输入500字符'>
                                  <QuestionCircleOutlined />
                                </a-tooltip>
                              </a-space>
                            );
                          },
                        }}
                      >
                        <div>
                          {isEdit.value ? (
                            <a-textarea
                              maxlength={500}
                              v-model={[infoRef.infoState.remark, 'value']}
                            />
                          ) : (
                            <p class='mar-t-6'>
                              {infoRef.infoState.remark || '暂无'}
                            </p>
                          )}
                        </div>
                      </a-form-item>
                    </a-col>
                  </a-row>
                </a-form>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    );
  },
});
