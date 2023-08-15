import {
  defineComponent,
  reactive,
  ref,
  onMounted,
  createVNode,
  watch,
  toRaw,
} from 'vue';

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
  Menu,
  MenuItem,
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
  HolderOutlined,
} from '@ant-design/icons-vue';
import '@/assets/style/pages/thingManager/category.less';
import useTreeSearch from '@/hooks/treeSearch';
import { transformTime } from '@/utils/format';
import { enChar, zhChar } from '@/utils/validate';
import CategoryApi from '@/api/category';
import IndustryApi from '@/api/industry';
import type { FormInstance } from 'ant-design-vue';

export interface CategoryItem {
  name: string;
  code: string;
  enabled: boolean;
  catalogDescription?: string;
  [propName: string]: any;
}

let selectNodeData: any = null;
const defaultInfoState: CategoryItem = {
  name: '',
  code: '',
  enabled: true,
  catalogDescription: '',
};
function infoPart() {
  const isEdit = ref<boolean>(false);
  const isNew = ref<boolean>(false);
  const formRef = ref<FormInstance>();
  const formModel = ref<CategoryItem>(defaultInfoState);
  const validateUnique = async (value: string, key: string, tip: string) => {
    const res = await CategoryApi.compareCondition({
      [key]: value,
      catalogId: isNew.value ? null : selectNodeData.id,
    });
    if (res.data) return Promise.reject('该' + tip + '已存在');
  };
  const formRule = reactive({
    name: [
      {
        required: true,
        message: '请输入名称',
      },
      {
        validator: async (_rule: any, value: string) => {
          if (value.trim()) {
            await validateUnique(value.trim(), 'name', '名称');
          }
          return Promise.resolve();
        },
        trigger: 'blur',
      },
    ],
    code: [
      // {
      //   required: true,
      //   message: '请输入编码',
      // },
      {
        validator: async (_rule: any, value: string) => {
          if (value.trim()) {
            const firstChar = value.slice(0, 1);
            if (!enChar.test(firstChar)) {
              return Promise.reject('首字符应为英文字符');
            }
            if (zhChar.test(value)) {
              return Promise.reject('编码不得含有中文字符');
            }
            await validateUnique(value.trim(), 'code', '编码');
            return Promise.resolve();
          }
          return Promise.reject('请输入编码');
        },
        trigger: 'blur',
      },
    ],
    enabled: [
      {
        required: true,
        message: '请选择',
      },
    ],
  });
  return {
    formRef,
    isEdit,
    isNew,
    formModel,
    formRule,
  };
}
export default defineComponent({
  name: 'categoryManager',
  setup() {
    const state = reactive<{
      industryList: any[];
      rightInfoShow: boolean;
      industryCode: string;
    }>({
      industryList: [],
      rightInfoShow: false,
      industryCode: '',
    });
    const { formRef, isEdit, isNew, formModel, formRule } = infoPart();
    const {
      tree,
      searchValue,
      expandedKeys,
      autoExpandParent,
      selectedKeyArr,
      fieldNames,
      generateKey,
      generateList,
      searchFn,
      filter,
    } = useTreeSearch({
      title: 'name',
      children: 'catalogList',
      key: 'key',
    });
    const treeLoading = ref(false);
    const getList = async (industryCode = state.industryCode) => {
      treeLoading.value = true;
      return CategoryApi.getTreeList(industryCode).then((res) => {
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
    const cancel = (data?: any) => {
      isEdit.value = false;
      isNew.value = false;
      formRef.value?.resetFields();
      if (data) {
        formModel.value = { ...data };
      } else {
        state.rightInfoShow = false;
      }
    };

    // 新建
    const create = (isRoot = false) => {
      if (isRoot) {
        selectNodeData = null;
      }
      isEdit.value = true;
      isNew.value = true;
      formModel.value = { ...defaultInfoState };
    };
    // 编辑
    const edit = (node: any) => {
      isEdit.value = true;

      formModel.value = { ...selectNodeData };
    };
    // 删除
    const remove = (node: any) => {
      Modal.confirm({
        title: `确定要删除${node.name}吗？`,
        icon: createVNode(ExclamationCircleOutlined),
        content: '',
        onOk() {
          CategoryApi.remove(node.id).then(() => {
            message.success('删除成功');
            selectedKeyArr.value = [];
            cancel();
            getList();
          });
        },
      });
    };
    // 选中树节点
    const selectNode = async (
      selectedKeys: string[],
      { selected, node }: any
    ) => {
      if (selected) {
        selectedKeyArr.value = selectedKeys;
        selectNodeData = {
          ...node.dataRef,
        };
        cancel(selectNodeData);
        state.rightInfoShow = true;
      }
    };
    const expandNode = (keys: string[]) => {
      expandedKeys.value = keys;
      autoExpandParent.value = false;
    };
    const findDataById = (id: string, list?: any[]) => {
      list = list || [];
      for (let i = 0; i < list.length; i++) {
        const el = list[i];
        if (el.id === id) {
          return el;
        }
        if (el.catalogList && el.catalogList.length > 0) {
          const result: any = findDataById(id, el.catalogList);
          if (result) {
            return result;
          }
        }
      }
      return null;
    };
    const submit = () => {
      formRef.value?.validate().then((data) => {
        const extra: any = {
          industryCode: state.industryCode,
        };
        if (isNew.value) {
          extra.parentCode = selectNodeData?.code || 'root_catalog';
        } else {
          extra.id = formModel.value.id;
        }
        const httpReq = isNew.value ? CategoryApi.add : CategoryApi.modify;
        httpReq({ ...data, ...extra }).then(async (res) => {
          await getList();
          const resData = res.data;
          formModel.value = {
            ...formModel.value,
            ...resData
          };
          selectNodeData = { ...formModel.value };
          //定位到树的位置
          if (isNew.value) {
            const updateData = findDataById(resData.id, tree.data);
            selectedKeyArr.value = [updateData.key];
            const parentKey = updateData.key.split('-');
            if (parentKey.length > 2) {
              const parentKeyStr = parentKey.slice(0, -1).join('-');
              if (
                !expandedKeys.value ||
                expandedKeys.value.indexOf(parentKeyStr) === -1
              ) {
                expandedKeys.value.push(parentKeyStr);
                autoExpandParent.value = false;
              }
            }
          }

          isEdit.value = false;
          isNew.value = false;
        });
      });
    };
    const getSwitchVal = (val: boolean) => {
      return val ? (
        <a-tag color='success'>生效</a-tag>
      ) : (
        <a-tag color='error'>未生效</a-tag>
      );
    };
    const getRowInfo = (
      key: string,
      label: string,
      editAble: boolean,
      elType?: string,
      isShow = true
    ) => {
      return (
        isShow && (
          <a-col lg={13} xl={9} md={13} offset={1}>
            {isEdit.value && editAble ? (
              <a-form-item label={label} name={key}>
                {elType === 'switch' ? (
                  <a-switch v-model={[formModel.value[key], 'checked']} />
                ) : (
                  <a-input
                    v-model={[formModel.value[key], 'value']}
                    maxlength={50}
                  />
                )}
              </a-form-item>
            ) : (
              <div class='flex-top form_row'>
                <span class='label' style='width:7em'>
                  {label}：
                </span>
                <span>
                  {elType === 'time'
                    ? transformTime(formModel.value[key])
                    : elType === 'switch'
                    ? getSwitchVal(formModel.value[key])
                    : formModel.value[key]}
                </span>
              </div>
            )}
          </a-col>
        )
      );
    };
    const getInlList = () => {
      IndustryApi.getList({ pageNum: 1, pageSize: 999 }).then((res) => {
        state.industryList = res.data.list.filter((el: any) => el.validEnable);
        if (state.industryList.length > 0) {
          state.industryCode = state.industryList[0].code;
          getList();
        }
      });
    };
    const inlChange = (code: string) => {
      getList(code);
      cancel();
      selectedKeyArr.value = [];
    };
    onMounted(() => {
      getInlList();
    });

    return () => (
      <div class='manage_wrap flex'>
        <div class='tree_data flex'>
          <div class='top'>
            <div class='flex-center'>
              <span>行业：</span>
              <a-select
                v-model={[state.industryCode, 'value']}
                onChange={inlChange}
                class='flex1'
              >
                {state.industryList.map((item) => {
                  return (
                    <a-select-option value={item.code} key={item.code}>
                      {item.name}
                    </a-select-option>
                  );
                })}
              </a-select>
            </div>
            <div class='mar-t-12'>
              <a-button
                onClick={() => {
                  state.rightInfoShow = true;
                  create(true);
                }}
                type='link'
                size='small'
              >
                <PlusCircleOutlined />
                新增类目
              </a-button>
            </div>
            <a-input
              allowClear
              v-model={[searchValue.value, 'value']}
              class='mar-tb-12'
              placeholder='请输入内容'
              v-slots={{
                suffix: () => {
                  return <SearchOutlined style='color: rgba(0, 0, 0, 0.45)' />;
                },
              }}
            />
          </div>

          <div class='cate_tree_wrap flex1'>
            {!treeLoading.value && tree.data?.length === 0 ? (
              <a-empty image-style={{ height: '56px', marginTop: '50%' }} />
            ) : (
              <a-spin
                wrapperClassName='h_100'
                tip='加载中...'
                spinning={treeLoading.value}
                delay={300}
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
                    title: ({ name, selected, dataRef }: any) => {
                      return (
                        <span class='tree-node-title'>
                          <a-tooltip
                            placement='topLeft'
                            v-slots={{
                              title: () => {
                                return <span>{name}</span>;
                              },
                            }}
                          >
                            <span
                              class={['node_title_style', selected ? 'on' : '']}
                            >
                              {name}
                            </span>
                          </a-tooltip>
                          {selected && (
                            <a-space class='f_r'>
                              <span>
                                <EditOutlined
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    edit(dataRef);
                                  }}
                                />
                              </span>
                              <span>
                                <DeleteOutlined
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    remove(dataRef);
                                  }}
                                />
                              </span>
                              <span>
                                <PlusCircleOutlined
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    create();
                                  }}
                                />
                              </span>
                              {/* <span>
                            <HolderOutlined
                              onClick={(e) => {
                                e.stopPropagation();
                              }}
                            />
                          </span> */}
                            </a-space>
                          )}
                        </span>
                      );
                    },
                  }}
                ></a-tree>
              </a-spin>
            )}
          </div>
        </div>
        <div class='info_con'>
          {state.rightInfoShow ? (
            <div>
              <div class='flex-between flex-center'>
                <h3 class='bold'>基本信息</h3>
                {isEdit.value ? (
                  <a-space>
                    <a-button
                      type='primary'
                      ghost
                      onClick={() => {
                        cancel(selectNodeData);
                      }}
                    >
                      取消
                    </a-button>
                    <a-button type='primary' onClick={submit}>
                      完成
                    </a-button>
                  </a-space>
                ) : (
                  <a-button
                    type='primary'
                    onClick={() => (isEdit.value = true)}
                  >
                    编辑
                  </a-button>
                )}
              </div>
              <div class='mar-t-24'>
                <a-form
                  ref={formRef}
                  rules={formRule}
                  model={formModel.value}
                  name='basic'
                  class='label_form'
                  wrapper-col={{ span: 14 }}
                >
                  <a-row>
                    {getRowInfo('name', '类目名称', true)}
                    {getRowInfo('code', '类目编码', true)}
                    {getRowInfo('enabled', '是否生效', true, 'switch')}
                    {getRowInfo(
                      'createUser',
                      '创建人',
                      !isEdit.value,
                      'input',
                      !isEdit.value
                    )}
                    {getRowInfo(
                      'updateUser',
                      '更新人',
                      !isEdit.value,
                      'input',
                      !isEdit.value
                    )}
                    {getRowInfo(
                      'createDt',
                      '创建时间',
                      !isEdit.value,
                      'time',
                      !isEdit.value
                    )}
                    {getRowInfo(
                      'updateDt',
                      '更新时间',
                      !isEdit.value,
                      'time',
                      !isEdit.value
                    )}
                  </a-row>
                  <a-row>
                    <a-col span={20} offset={1}>
                      <a-form-item
                        label='备注'
                        name='catalogDescription'
                        wrapper-col={{ span: 19 }}
                      >
                        {isEdit.value ? (
                          <a-textarea
                            v-model={[
                              formModel.value.catalogDescription,
                              'value',
                            ]}
                          />
                        ) : (
                          <span>{formModel.value.catalogDescription}</span>
                        )}
                      </a-form-item>
                    </a-col>
                  </a-row>
                </a-form>
              </div>
            </div>
          ) : null}
          {/* <a-empty description='暂无信息' /> */}
        </div>
      </div>
    );
  },
});
