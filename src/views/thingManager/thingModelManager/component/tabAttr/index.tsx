import {
  computed,
  defineComponent,
  onMounted,
  reactive,
  ref,
  watch,
} from 'vue';
import * as modelApis from '@/api/thingModel';
import { message } from 'ant-design-vue';
import updateAttr from './update';
import attrSort from './attrSort';
import { propertyTypes } from './updateConfig/config';
import { cloneDeep } from 'lodash';

const propertyTypeObj = {
  attribute: '物实例属性',
  property: '基本信息',
  metric: '采集数据',
  logic: '逻辑计算',
  relation: '关系属性',
  action: '设备控制',
  parameter: '设备参数控制',
  alarm: '报警信息',
  setting: '设定参数',
};
const columns = [
  {
    title: '属性类型',
    dataIndex: 'propertyType',
    key: 'propertyType',
    slots: { customRender: 'propertyType' },
    width: '10%',
  },
  {
    title: '属性名称',
    dataIndex: 'name',
    width: '10%',
    key: 'name',
  },
  {
    title: '前端页面显示名',
    dataIndex: 'displayLabel',
    width: '10%',
    key: 'displayLabel',
  },
  {
    title: '属性编码',
    dataIndex: 'code',
    width: '10%',
    key: 'code',
  },
  {
    title: '数据类型',
    dataIndex: 'columnType',
    width: '10%',
    key: 'columnType',
  },
  {
    title: '单位',
    dataIndex: 'unit',
    width: '10%',
    key: 'unit',
  },
  {
    title: 'web端是否启用',
    dataIndex: 'enable',
    key: 'enable',
    width: '10%',
    slots: { customRender: 'enable' },
  },
  // {
  //   title: 'listDisplay',
  //   dataIndex: 'listDisplay',
  //   key: 'listDisplay',
  //   slots: { customRender: 'listDisplay' },
  //   width: '10%',
  // },
  {
    title: '操作',
    dataIndex: 'action',
    key: 'action',
    width: '20%',
    slots: { customRender: 'action' },
  },
];
export default defineComponent({
  props: {
    code: {
      type: String,
      required: true,
    },
  },
  components: { updateAttr, attrSort },
  setup(_props, _context) {
    const updateAttrRef = ref();
    const attrSortRef = ref();
    const getList = async () => {
      modelApis.findPropByCode(_props.code).then((res) => {
        state.tableData = res.data;
        state.tableDataAll = cloneDeep(res.data);
        attrSearch();
      });
    };
    //有无匹配的属性数据
    const hasFitAttr = computed(() => {
      let sum = 0;
      state.tableData.forEach((item) => {
        sum += item.properties?.length || 0;
      });
      return sum > 0;
    });
    const state = reactive<{
      tableData: any[];
      groupTypeList: any[];
      tableDataAll: any[];
      isLoading: boolean;
      tableQuery: any;
    }>({
      tableData: [],
      groupTypeList: [],
      tableDataAll: [],
      isLoading: false,
      tableQuery: {},
    });
    const copyRef = ref();
    const copyState = reactive<{
      visible: boolean;
      modelTree: any[];
      thingModel: any[];
      thingPropertyList: any[];
    }>({
      visible: false,
      modelTree: [],
      thingModel: [],
      thingPropertyList: [],
    });
    //删除属性
    const remove = (id: string) => {
      modelApis.removeAttr(id).then((res) => {
        message.success('删除成功');
        getList();
      });
    };
    // 获取属性分组
    const getThingGroupTypeList = () => {
      modelApis.thingGroupTypeList().then((res) => {
        state.groupTypeList = res.data;
      });
    };
    const openModal = (isAdd: boolean, useStandard: boolean, data?: any) => {
      updateAttrRef.value.open(isAdd, useStandard, _props.code, data);
    };
    //属性状态
    const getEnable = (row: any) => {
      return row.display;
    };
    //更新属性状态
    const updateEnable = (val: boolean, row: any) => {
      const data = {
        ...row,
        display: val,
      };
      modelApis.updateAttr(data).then(() => {
        message.success('更新成功');
        getList();
      });
    };
    // 根据查询条件查询属性
    const attrSearch = () => {
      const { groupType, propertyType, name, code } = state.tableQuery;
      let list = cloneDeep(state.tableDataAll);
      if (groupType) {
        list = list.filter((el) => el.groupName === groupType);
      }
      state.tableData = list.map((el) => {
        el.properties = el.properties.filter((prop) => {
          let flag: boolean = true;
          if (propertyType) flag = flag && prop.propertyType === propertyType;
          if (name) flag = flag && prop.name.indexOf(name) > -1;
          if (code) flag = flag && prop.code.indexOf(code) > -1;
          return flag;
        });
        return el;
      });
    };
    // reset属性列表
    const attrReset = () => {
      state.tableQuery = {};
      state.tableData = cloneDeep(state.tableDataAll);
    };

    //复制属性相关
    const openCopyAttr = () => {
      if (copyState.thingPropertyList.length === 0) {
        message.warn('请至少选择一个属性');
        return;
      }
      copyState.visible = true;
      if (copyState.modelTree?.length === 0) {
        getThingModelTreeData();
      }
    };
    const thingPropertyEntityCheckList = () => {
      copyState.thingPropertyList = [];
      state.tableData.forEach((item) => {
        const list = item.checkedProps || [];
        copyState.thingPropertyList = copyState.thingPropertyList.concat(list);
      });
    };
    const copyOk = () => {
      copyRef.value.validate().then(() => {
        const data = {
          thingCodeList: copyState.thingModel.map((el) => el.value),
          thingPropertyEntityList: copyState.thingPropertyList,
        };
        modelApis.copyThingProperty(data).then(() => {
          message.success('复制成功');
          copyCancel();
        });
      });
    };
    const copyCancel = () => {
      copyRef.value.clearValidate();
      copyState.visible = false;
      copyState.thingModel = [];
      copyState.thingPropertyList = [];
    };
    //获取物模型tree结构
    const getThingModelTreeData = () => {
      modelApis.listTree().then((res) => {
        copyState.modelTree = res.data ? [res.data] : [];
      });
    };

    onMounted(() => {
      getList();
      getThingGroupTypeList();
    });
    return () => (
      <div class='tab_attr'>
        <div>
          <a-form>
            <a-row gutter={24}>
              <a-col span={5}>
                <a-form-item label='查看分组'>
                  <a-select
                    v-model={[state.tableQuery.groupType, 'value']}
                    onChange={attrSearch}
                    allowClear
                  >
                    {state.groupTypeList.map((item) => {
                      return (
                        <a-select-option value={item.key}>
                          {item.key}
                        </a-select-option>
                      );
                    })}
                  </a-select>
                </a-form-item>
              </a-col>
              <a-col span={5}>
                <a-form-item label='属性类型'>
                  <a-select
                    v-model={[state.tableQuery.propertyType, 'value']}
                    allowClear
                    onChange={attrSearch}
                  >
                    {propertyTypes.map((item) => {
                      return (
                        <a-select-option value={item.key}>
                          {item.name}
                        </a-select-option>
                      );
                    })}
                  </a-select>
                </a-form-item>
              </a-col>
              <a-col span={5}>
                <a-form-item label='属性名称'>
                  <a-input
                    allowClear
                    v-model={[state.tableQuery.name, 'value']}
                    onPressEnter={attrSearch}
                  />
                </a-form-item>
              </a-col>
              <a-col span={5}>
                <a-form-item label='属性编码'>
                  <a-input
                    allowClear
                    v-model={[state.tableQuery.code, 'value']}
                    onPressEnter={attrSearch}
                  />
                </a-form-item>
              </a-col>
              <a-col span={4} class='align-r'>
                <a-space>
                  <a-button type='primary' onClick={attrSearch}>
                    查询
                  </a-button>
                  <a-button type='primary' ghost onClick={attrReset}>
                    重置
                  </a-button>
                </a-space>
              </a-col>
            </a-row>
          </a-form>
        </div>
        <a-space size={16}>
          <a-button type='primary' onClick={() => openModal(true, true)}>
            新增
          </a-button>
          <a-button type='primary' ghost onClick={openCopyAttr}>
            复制
          </a-button>
          <a-button
            type='primary'
            ghost
            onClick={() => attrSortRef.value.open()}
          >
            编辑排序
          </a-button>
        </a-space>
        {state.tableData.map((groupData) => {
          return (
            <div class='mar-t-20' v-show={groupData.properties?.length > 0}>
              <h4 class='bold f-15'>{groupData.groupName}</h4>
              <a-table
                rowKey='code'
                columns={columns}
                dataSource={groupData.properties}
                pagination={false}
                class='mar-t-10'
                row-selection={{
                  columnWidth: '4%',
                  getCheckboxProps: (record: any) => ({
                    disabled: record.propertyType === 'relation',
                    name: record.code,
                  }),
                  onChange: (
                    selectedRowKeys: string[],
                    selectedRows: any[]
                  ) => {
                    groupData.checkedProps = selectedRows;
                    thingPropertyEntityCheckList();
                  },
                }}
                v-slots={{
                  propertyType: (row: any) => {
                    return (
                      <span>
                        {propertyTypeObj[row.record.propertyType] || '--'}
                      </span>
                    );
                  },
                  enable: (row: any) => {
                    return (
                      <a-switch
                        data-id={row.record.id}
                        checked={getEnable(row.record)}
                        onChange={(e: boolean) => updateEnable(e, row.record)}
                      ></a-switch>
                    );
                  },
                  listDisplay: (row: any) => {
                    return <span>{row.record.listDisplay.toString()}</span>;
                  },
                  action: (row: any) => {
                    const code = row.record.code;
                    return code === 'ID' ||
                      code === 'NAME' ||
                      code === 'CODE' ||
                      code === 'THING_CODE' ? null : (
                      <a-space size={16}>
                        <a onClick={() => openModal(false, false, row.record)}>
                          编辑
                        </a>
                        {row.record.propertyType !== 'relation' && (
                          <a
                            onClick={() => {
                              copyState.thingPropertyList = [row.record];
                              openCopyAttr();
                            }}
                          >
                            复制
                          </a>
                        )}
                        <a-popconfirm
                          title='确认删除?'
                          ok-text='确定'
                          cancel-text='取消'
                          onConfirm={() => {
                            remove(row.record.id);
                          }}
                        >
                          <a class='pointer'>删除</a>
                        </a-popconfirm>
                      </a-space>
                    );
                  },
                }}
              ></a-table>
            </div>
          );
        })}
        {!hasFitAttr.value && (
          <div style='margin-top:60px'>
            <a-empty description='暂无相关数据' />
          </div>
        )}

        <updateAttr
          ref={updateAttrRef}
          onOk={() => {
            getList();
          }}
          onClose={() => {
            getThingGroupTypeList();
          }}
        />
        <attrSort
          ref={attrSortRef}
          onOk={getList}
          attrGroupList={state.groupTypeList}
          attrList={state.tableDataAll}
        />
        <a-modal
          visible={copyState.visible}
          title='复制属性'
          centered
          width='450px'
          onCancel={copyCancel}
          onOk={copyOk}
        >
          <a-form
            ref={copyRef}
            model={copyState}
            rules={{
              thingModel: [
                { required: true, message: '请选择物模型', trigger: 'blur' },
              ],
            }}
          >
            <a-form-item label='复制到物模型' name='thingModel'>
              <a-tree-select
                v-model={[copyState.thingModel, 'value']}
                tree-data={copyState.modelTree}
                tree-checkable
                allow-clear
                placeholder='请输入关键字进行选择'
                showSearch
                treeNodeFilterProp='name'
                treeCheckStrictly
                treeDefaultExpandedKeys={[copyState.modelTree[0]?.code]}
                fieldNames={{
                  label: 'name',
                  children: 'childTrees',
                  value: 'code',
                }}
              />
            </a-form-item>
          </a-form>
        </a-modal>
      </div>
    );
  },
});
