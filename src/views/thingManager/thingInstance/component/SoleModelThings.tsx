import {
  defineComponent,
  ref,
  reactive,
  watch,
  onMounted,
  computed,
  onUnmounted,
} from 'vue';
import { message } from 'ant-design-vue';
import { DownOutlined, UpOutlined } from '@ant-design/icons-vue';
import ExportThing from './ExportThing';
import BatchImport from './BatchImport';
import PointModal from './PointModal';
import RenderSelect from './RenderSelect';
import RenderThingProp from './RenderThingProp';

import '@/assets/style/pages/thingManager/thingInstance/thingTable.less';
import router from '@/router';
import { operationOpts } from '../data';
import dayjs from 'dayjs';
import _ from 'lodash';

import * as thingApis from '@/api/thingInstance';
import {
  setDynamicsPropsValue,
  collectAlarmId,
  collectPointCode,
  getListAtomicValue,
  collectLogicProp,
} from '../hooks/instance';
import useThingReloadValue from '../hooks/useReloadValues';
import useInstanceList from '../hooks/useInstanceList';

export const reorder = (arr: any[]) => {
  arr.sort((a, b) => {
    return a.sort - b.sort;
  });
  const list = arr.filter((n) => n.sort === null);
  const newList = arr.filter((n) => n.sort !== null);
  return _.uniqWith([...newList, ...list], _.isEqual);
};

export default defineComponent({
  name: 'SoleModelThings',
  components: {
    ExportThing,
    BatchImport,
    PointModal,
    RenderSelect,
    RenderThingProp,
  },
  props: {
    nodeType: {
      type: String,
      default: '',
    },
    thingCode: {
      type: String,
      default: '',
    },
    rootThingCode: {
      type: String,
      default: '',
    },
    thingNode: {
      type: Object,
      default: () => ({}),
    },
  },
  setup(props, context) {
    const canAdd = computed(() => {
      return !(props.nodeType === 'view');
    });
    const queryFormRef = ref();
    const thingCode = computed(() => props.thingCode);
    const {
      isAllQueryOpts,
      queryOpts,
      queryOptLen,
      getQueryColumn,
      getListPageTableColumn,
      handleTableChange,
      isLoading,
      columns,
      tableList,
      pagination,
      refresh,
      currPage,
      handlePageChange,
      reset,
    } = useInstanceList(thingCode, (data) => {
      propsPointCode.value = [];
      propsAlarmId.value = [];
      data.list.forEach((ele: any) => {
        propsPointCode.value.push(...collectPointCode(ele.listPropertyList));
        propsAlarmId.value.push(
          ...collectAlarmId(
            ele.listPropertyList,
            ele.thingCode,
            ele.thingInstId
          )
        );
        propsLogic.value.push(
          ...collectLogicProp(
            ele.listPropertyList,
            ele.thingCode,
            ele.thingInstId,
            ele.thingInstCode
          )
        );
      });
    });
    context.expose({
      refresh,
    });

    //刷新表单动态值
    //动态pre点
    //报警属性alarmId点
    const { propsPointCode, propsAlarmId, propsLogic } = useThingReloadValue(
      (preData: any[], alarmData: any[], logicData: any[]) => {
        tableList.value.forEach((ele: any) => {
          setDynamicsPropsValue(
            ele.listPropertyList,
            preData,
            alarmData,
            logicData,
            ele.thingInstId
          );
        });
      }
    );
    const state = reactive<{
      selectedRowKeys: string[];
      selectedRows: any[];
    }>({
      selectedRowKeys: [],
      selectedRows: [],
    });
    // 勾选项
    const onSelectChange = (selectedRowKeys: string[], selectedRows: any[]) => {
      state.selectedRowKeys = selectedRowKeys;
      state.selectedRows = selectedRows;
    };

    const toCreate = async (row?: any) => {
      router.push({
        name: 'DetailOrEdit',
        params: { id: 'new' },
        query: {
          name: `新增物实例`,
          thingInfo: JSON.stringify({
            model: props.thingCode,
            rootThingCode: props.rootThingCode,
            isEdit: true,
          }),
        },
      });
    };

    const deleteThing = async (instanceIdList: string[]) => {
      const res: any = await thingApis.deleteThing(
        instanceIdList,
        props.thingCode
      );
      if ((res.code = 'M0000')) {
        message.success('删除成功');
      }
      state.selectedRowKeys = [];
      state.selectedRows = [];
      refresh();
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
    // 渲染表格单元格内容
    const showTableCellValue = (dataIndex: string, ele: any) => {
      const propInfo = ele.listPropertyList.find(
        (el: any) => el.thingPropertyCode === dataIndex
      );
      return <RenderThingProp attrInfo={propInfo} />;
    };

    // 批量导入
    const showBatchImport = ref(false);

    watch(
      () => props.thingCode,
      (nVal) => {
        if (nVal) {
          state.selectedRowKeys = [];
          state.selectedRows = [];
          currPage.value = 1;
          refresh();
          getQueryColumn(nVal);
          getListPageTableColumn(nVal);
        }
      },
      { immediate: true }
    );
    return () => (
      <div class='SoleModelThings'>
        <a-form
          ref={queryFormRef}
          labelCol={{ style: { width: '9em' } }}
          wrapperCol={{ span: 16 }}
          onSubmit={refresh}
        >
          <a-row>
            {queryOpts.value.slice(0, queryOptLen.value).map((item: any) => {
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
                <a-button type='primary' html-type='submit'>
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

        <inl-layout-table
          v-slots={{
            opt: () => (
              <a-space size={16}>
                <a-button
                  type='primary'
                  class='min-btn-width'
                  onClick={() => toCreate()}
                  disabled={!props.thingCode || !canAdd.value}
                >
                  新增
                </a-button>

                <a-button
                  type='primary'
                  ghost
                  class='min-btn-width'
                  onClick={() => {
                    showBatchImport.value = true;
                  }}
                >
                  导入
                </a-button>

                {/* 导出全部 & 导出选中 */}
                <ExportThing
                  thingNode={props.thingNode}
                  thingCode={props.thingCode}
                  selectedRowKeys={state.selectedRowKeys}
                />

                <a-popconfirm
                  title='确认删除?'
                  ok-text='确定'
                  cancel-text='取消'
                  onConfirm={() => {
                    deleteThing(state.selectedRowKeys);
                  }}
                >
                  <a-button
                    type='danger'
                    disabled={state.selectedRowKeys.length == 0}
                  >
                    删除选中
                  </a-button>
                </a-popconfirm>
              </a-space>
            ),
            content: () => (
              <a-table
                rowKey='thingInstId'
                columns={columns.value}
                dataSource={tableList.value}
                loading={isLoading.value}
                pagination={pagination}
                row-selection={{
                  selectedRowKeys: state.selectedRowKeys,
                  onChange: onSelectChange,
                }}
                onChange={handleTableChange}
                v-slots={{
                  bodyCell: ({ column, record }) => {
                    if (column.dataIndex === 'action') {
                      return (
                        <>
                          <a-button
                            type='link'
                            size='small'
                            data-thingInstId={record.thingInstId}
                            data-thingCode={record.thingCode}
                            onClick={() => {
                              // 新页签打开
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

                          <a-button
                            type='link'
                            size='small'
                            onClick={() => {
                              // 新页签打开
                              router.push({
                                name: 'DetailOrEdit',
                                params: { id: record.thingInstId },
                                query: {
                                  name: `物实例 (${record.thingInstName})`,
                                  thingInfo: JSON.stringify({
                                    model: record.thingCode,
                                    isEdit: true,
                                  }),
                                },
                              });
                            }}
                          >
                            编辑
                          </a-button>

                          <a-popconfirm
                            title='确认删除?'
                            ok-text='确定'
                            cancel-text='取消'
                            onConfirm={() => {
                              deleteThing([record.thingInstId]);
                            }}
                          >
                            <a-button type='link' size='small'>
                              删除
                            </a-button>
                          </a-popconfirm>
                        </>
                      );
                    } else {
                      return (
                        <>{showTableCellValue(column.dataIndex, record)}</>
                      );
                    }
                  },
                }}
              ></a-table>
            ),
          }}
        ></inl-layout-table>

        {/* 批量导入 */}
        <BatchImport v-models={[[showBatchImport.value, 'showBatchImport']]} />
      </div>
    );
  },
});
