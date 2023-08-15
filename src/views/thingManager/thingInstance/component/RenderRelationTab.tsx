import {
  defineComponent,
  ref,
  onMounted,
  reactive,
  watch,
  computed,
} from 'vue';
import * as thingApis from '@/api/thingInstance';
import { reorder } from './SoleModelThings';
import useTableList from '../hooks/useTableList';
import RenderSelect from './RenderSelect';
import RenderThingProp from './RenderThingProp';
import _ from 'lodash';
import { message } from 'ant-design-vue';
import { useRouter } from 'vue-router';
import useInstanceList from '../hooks/useInstanceList';
import { operationOpts } from '../data';
import { DownOutlined, UpOutlined } from '@ant-design/icons-vue';
import { getListAtomicValue } from '../hooks/instance';

export default defineComponent({
  name: 'RenderRelationTab',
  props: {
    relationGroup: {
      type: Array<any>,
      required: true,
    },
    isEdit: {
      type: Boolean,
      default: false,
    },
    thingCode: {
      type: String,
      required: true,
    },
    thingInsId: {
      type: String,
      required: true,
    },
  },
  emits: ['change'],
  components: { RenderThingProp },
  setup(props, { emit, expose }) {
    const router = useRouter();
    const queryList = ref<{
      thingInstCode?: string;
      thingInstName?: string;
    }>({
      thingInstCode: '',
      thingInstName: '',
    });
    const currentProp: any = ref({});
    const state = reactive<{
      activeKey: string;
      selectedRowKeys: string[];
      selectedRows: any[];
    }>({
      activeKey: '',
      selectedRowKeys: [],
      selectedRows: [],
    });
    const thingCode = computed(() => props.thingCode);

    const { getListPageTableColumn, columnData } = useInstanceList(
      thingCode,
      undefined,
      false
    );

    const getList = async () => {
      const res: any = await thingApis.findRelationList({
        ...queryList.value,
        relaThingCode: currentProp.value.relationThingCode, // findById 的 relationThingCode
        thingRelationId: currentProp.value.value, // findById 的 value
        thingCode: props.thingCode, // 本实体的thingCode
        thingInstId: props.thingInsId, // 本实体的物实例ID
        pageNum: currPage.value,
        pageSize: pageSize.value,
      });
      const resObj: any = {
        columnData: [],
        data: [],
        totalNum: res.data?.total,
      };

      resObj.columnData = reorder(columnData.value);
      resObj.columnData.push({
        title: '操作',
        dataIndex: 'action',
        key: 'action',
      });

      if (res.data) {
        resObj.data = res.data.list.map((ele: any) => {
          ele.listPropertyList.forEach((prop: any) => {
            ele[prop.thingPropertyCode] = prop.value;
          });
          return ele;
        });
      } else {
        resObj.data = [];
      }

      return resObj;
    };

    const {
      isLoading,
      columns,
      tableList,
      pagination,
      refresh,
      currPage,
      pageSize,
    } = useTableList(getList, 'list', 'total');
    const deleteRelation = (rows: any[]) => {
      const data = rows.map((row) => {
        return {
          thingCode: props.thingCode,
          thingInstId: props.thingInsId,
          relationId: currentProp.value.value,
          relaThingCode: currentProp.value.relationThingCode,
          relaThingInstId: row.thingInstId,
        };
      });
      thingApis.removeRelation(data).then((res) => {
        message.success('删除成功');
        refresh();
        state.selectedRowKeys = [];
        state.selectedRows = [];
      });
    };
    const showTableCellValue = (dataIndex: string, ele: any) => {
      const propInfo = ele.listPropertyList.find(
        (el: any) => el.thingPropertyCode === dataIndex
      );
      return <RenderThingProp attrInfo={propInfo} />;
    };

    // 渲染实例查询项
    const renderQueryItem = (ele: any) => {
      const displayType = ele.displayType;
      if (displayType === 'number') {
        return (
          <a-input-number
            class='searchVal'
            allowClear={true}
            v-model={[ele.value, 'value']}
            min={ele.minValue}
            max={ele.maxValue}
            step={ele.step}
            decimalPlace={ele.decimalPlace}
            style={{ width: '100%' }}
            onPressEnter={refresh}
          ></a-input-number>
        );
      } else if (
        displayType === 'select' ||
        displayType === 'select_atomic' ||
        displayType === 'select_tree'
      ) {
        return (
          <RenderSelect
            value={ele.value}
            attrInfo={ele}
            apiParam={getListAtomicValue(ele, queryOpts.value)}
            onChange={(val) => {
              ele.value = val;
              refresh();
            }}
          />
        );
      } else if (displayType === 'date' || displayType === 'datetime') {
        return (
          <a-range-picker
            v-model={[ele.value, 'value']}
            style='width:100%'
            showTime={displayType === 'datetime'}
            onChange={refresh}
          />
        );
      }
      return (
        <a-input
          class='searchVal'
          allowClear={true}
          onPressEnter={refresh}
          v-model={[ele.value, 'value']}
        ></a-input>
      );
    };
    const thingCodeForTable = computed(
      () => currentProp.value?.relationThingCode
    );
    const {
      isAllQueryOpts,
      queryOpts,
      queryOptLen,
      getQueryColumn,
      handleTableChange: handleTableChangeModal,
      getListPageTableColumn: getListPageTableColumnModal,
      isLoading: isLoadingModal,
      tableList: tableListModal,
      pagination: paginationModal,
      refresh: refreshModal,
      currPage: currPageModal,
      columnData: columnDataModal,
      reset,
    } = useInstanceList(thingCodeForTable, (data) => {
      data.list.forEach((ele: any) => {
        ele.listPropertyList.forEach((prop: any) => {
          ele[prop.thingPropertyCode] = prop.value;
        });
      });
    });
    const modalState = reactive<{
      visible: boolean;
      selectedRowKeys: any[];
      selectedRows: any[];
      relaThingInstId: string;
      relaNode: any;
    }>({
      visible: false,
      selectedRows: [],
      selectedRowKeys: [],
      relaThingInstId: '',
      relaNode: {},
    });
    // 添加关系
    const addRelation = async () => {
      const data = modalState.selectedRows.map((item) => {
        return {
          thingCode: props.thingCode,
          thingInstId: props.thingInsId,
          relationId: currentProp.value.value,
          relaThingCode: currentProp.value.relationThingCode,
          relaThingInstId: item.thingInstId,
        };
      });
      thingApis.createRelation(data).then(() => {
        refresh();
        modalState.visible = false;
        handleModalClose();
        message.success('添加成功');
      });
    };
    //获取弹框新增关系列表
    const getRelationInstance = () => {
      getQueryColumn(currentProp.value.relationThingCode);
      getListPageTableColumnModal(currentProp.value.relationThingCode);
      currPageModal.value = 1;
      refreshModal();
      modalState.visible = true;
    };
    const handleModalClose = () => {
      modalState.visible = false;
      modalState.selectedRowKeys = [];
      modalState.selectedRows = [];
    };
    onMounted(() => {
      if (props.relationGroup.length > 0) {
        currentProp.value = props.relationGroup[0];
        state.activeKey = currentProp.value.relationThingCode;
        refresh();
      }
    });
    watch(
      () => state.activeKey,
      (n) => {
        currPage.value = 1;
        refresh();
        const prop = props.relationGroup.find(
          (el) => el.relationThingCode === n
        );
        currentProp.value = prop;
        getListPageTableColumn(prop.relationThingCode);
      }
    );

    return () => (
      <div style='width:100%'>
        <a-tabs v-model:activeKey={state.activeKey}>
          {props.relationGroup.map((item: any) => {
            return (
              <a-tab-pane
                key={item.relationThingCode}
                tab={item.label}
              ></a-tab-pane>
            );
          })}
        </a-tabs>
        <div>
          <a-form
            labelCol={{ style: { width: '6em' } }}
            wrapperCol={{ span: 16 }}
            onSubmit={refreshModal}
          >
            <a-row>
              <a-col span={6}>
                <a-form-item label='实例名称'>
                  <a-input
                    allowClear={true}
                    v-model={[queryList.value.thingInstName, 'value']}
                  ></a-input>
                </a-form-item>
              </a-col>
              <a-col span={6}>
                <a-form-item label='实例编码'>
                  <a-input
                    allowClear={true}
                    v-model={[queryList.value.thingInstCode, 'value']}
                  ></a-input>
                </a-form-item>
              </a-col>
              <a-col span={12} class='align-r'>
                <a-space size={16}>
                  <a-button type='primary' html-type='submit'>
                    查询
                  </a-button>
                  <a-button
                    onClick={() => {
                      queryList.value = {
                        thingInstCode: '',
                        thingInstName: '',
                      };
                      refresh();
                    }}
                  >
                    重置
                  </a-button>
                </a-space>
              </a-col>
            </a-row>
          </a-form>
          {props.isEdit && (
            <div class='mar-b-20'>
              <a-space>
                <a-button
                  type='primary'
                  onClick={() => {
                    getRelationInstance();
                  }}
                >
                  新增
                </a-button>
                <a-popconfirm
                  title='确认删除?'
                  ok-text='确定'
                  cancel-text='取消'
                  onConfirm={() => {
                    deleteRelation(state.selectedRows);
                  }}
                >
                  <a-button
                    type='primary'
                    ghost
                    disabled={state.selectedRowKeys.length === 0}
                  >
                    删除
                  </a-button>
                </a-popconfirm>
              </a-space>
            </div>
          )}
          <a-table
            rowKey='thingInstId'
            columns={columns.value}
            dataSource={tableList.value}
            loading={isLoading.value}
            pagination={pagination}
            row-selection={{
              selectedRowKeys: state.selectedRowKeys,
              onChange: (selectedRowKeys: string[], selectedRows: any[]) => {
                state.selectedRowKeys = selectedRowKeys;
                state.selectedRows = selectedRows;
              },
            }}
            v-slots={{
              bodyCell: ({ column, record }) => {
                if (column.dataIndex === 'action') {
                  return (
                    <>
                      <a-popconfirm
                        title='确认删除?'
                        ok-text='确定'
                        cancel-text='取消'
                        onConfirm={() => {
                          deleteRelation([record]);
                        }}
                      >
                        <a-button
                          v-show={props.isEdit}
                          type='link'
                          size='small'
                        >
                          删除
                        </a-button>
                      </a-popconfirm>
                      <a-button
                        type='link'
                        size='small'
                        onClick={() => {
                          router.push({
                            name: 'DetailOrEdit',
                            params: { id: record.thingInstId },
                            query: {
                              name: `物实例 (${record.thingInstName})`,
                              thingInfo: JSON.stringify({
                                model: record.thingCode,
                                isEdit: false,
                              }),
                            },
                          });
                        }}
                      >
                        详情
                      </a-button>
                    </>
                  );
                } else {
                  return <>{showTableCellValue(column.dataIndex, record)}</>;
                }
              },
            }}
          ></a-table>
          <a-modal
            visible={modalState.visible}
            title='新增'
            onCancel={() => {
              handleModalClose();
            }}
            width='1200px'
            onOk={addRelation}
          >
            <div class='SoleModelThings'>
              <a-form labelCol={{ style: { width: '9em' } }}>
                <a-row>
                  {queryOpts.value
                    .slice(0, queryOptLen.value)
                    .map((item: any) => {
                      return (
                        <a-col
                          key={item.id}
                          span={
                            item.displayType === 'date' ||
                            item.displayType === 'datetime'
                              ? 12
                              : 6
                          }
                        >
                          <a-form-item label={item.displayLabel || item.name}>
                            <div class='flex'>
                              <a-select
                                class='searchSelect'
                                v-model={[item.operation, 'value']}
                                v-show={item.displayType.indexOf('date') === -1}
                              >
                                {operationOpts.map((item) => {
                                  return (
                                    <a-select-option value={item.value}>
                                      {item.name}
                                    </a-select-option>
                                  );
                                })}
                              </a-select>
                              {renderQueryItem(item)}
                            </div>
                          </a-form-item>
                        </a-col>
                      );
                    })}
                  <a-col flex={1} class='align-r'>
                    <a-space size={16}>
                      <a-button type='primary' onClick={refresh}>
                        查询
                      </a-button>
                      <a-button onClick={reset}>重置</a-button>
                      {queryOpts.value.length > 4 && (
                        <a-space
                          size={5}
                          onClick={() =>
                            (isAllQueryOpts.value = !isAllQueryOpts.value)
                          }
                        >
                          <a>{isAllQueryOpts.value ? '收起' : '展开'}</a>
                          {isAllQueryOpts.value ? (
                            <UpOutlined class='color_theme' />
                          ) : (
                            <DownOutlined class='color_theme' />
                          )}
                        </a-space>
                      )}
                    </a-space>
                  </a-col>
                </a-row>
              </a-form>
              <a-table
                rowKey='thingInstId'
                columns={columnDataModal.value}
                dataSource={tableListModal.value}
                loading={isLoadingModal.value}
                pagination={paginationModal}
                row-selection={{
                  selectedRowKeys: modalState.selectedRowKeys,
                  getCheckboxProps: (record: any) => ({
                    disabled:
                      tableList.value.findIndex(
                        (el) => el.thingInstId === record.thingInstId
                      ) > -1,
                    name: record.name,
                  }),
                  onChange: (
                    selectedRowKeys: string[],
                    selectedRows: any[]
                  ) => {
                    modalState.selectedRowKeys = selectedRowKeys;
                    modalState.selectedRows = selectedRows;
                  },
                }}
                onChange={handleTableChangeModal}
                v-slots={{
                  bodyCell: ({ column, record }) => {
                    if (column.dataIndex === 'action') {
                      return <></>;
                    } else {
                      return (
                        <>{showTableCellValue(column.dataIndex, record)}</>
                      );
                    }
                  },
                }}
              ></a-table>
            </div>
          </a-modal>
        </div>
      </div>
    );
  },
});
