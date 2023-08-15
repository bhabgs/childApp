import { defineComponent, onMounted, reactive, ref, provide } from 'vue';
import useTableList from '@/hooks/useTableList';
import * as modelApis from '@/api/thingModel';
import { message } from 'ant-design-vue';
import detailPage from './component/detail';
import updateModal from './component/update';
import modelSortModal from './component/modelTree';
import { thingTypeName } from './config';
import { useRoute } from 'vue-router';
import router from '@/router';
import dayjs from 'dayjs';
import { microAppUtils } from 'inl-ui/dist/utils';
import { exportException } from '../thingInstance/util/upload';
const mainAppName = microAppUtils.getMainAppName() || 'mtip-factory';
import { THING_ROOT } from '@/views/thingManager/thingInstance/data';
import emitter from '@/utils/mitt';

const columns = [
  {
    title: '物模型名称',
    dataIndex: 'name',
    key: 'name',
    sorter: true,
  },
  {
    title: '物模型编码',
    dataIndex: 'code',
    key: 'code',
    sorter: true,
  },
  {
    title: '所属类型',
    dataIndex: 'thingType',
    key: 'thingType',
    sorter: true,
    slots: { customRender: 'thingType' },
  },
  {
    title: '所属类目',
    dataIndex: 'catalogName',
    key: 'catalogName',
    sorter: true,
  },
  {
    title: '更新人',
    dataIndex: 'updateUser',
    sorter: true,
    key: 'updateUser',
  },
  {
    title: '更新时间',
    dataIndex: 'updateTime',
    sorter: true,
    key: 'updateTime',
  },
  {
    title: '启用状态',
    dataIndex: 'validEnable',
    key: 'validEnable',
    slots: { customRender: 'validEnable' },
  },
  {
    title: '操作',
    dataIndex: 'action',
    key: 'action',
    slots: { customRender: 'action' },
  },
];
export default defineComponent({
  name: 'thingModelManager',
  components: { detailPage, updateModal, modelSortModal },
  setup(_props, _context) {
    const route = useRoute();
    const page = ref('list');
    const updateModalRef = ref();
    const modelSortRef = ref();
    // table
    const queryFormRef = ref();
    const formQuery: any = ref({});
    const getList = async () => {
      const res: any = await modelApis.list({
        ...formQuery.value,
        pageNum: currPage.value,
        pageSize: pageSize.value,
      });
      return res;
    };
    const state = reactive<{
      selectedRowKeys: string[];
      selectedRows: any[];
      modalVisible: boolean;
      industryList: any[];
      synList: string[];
      thingTypeList: any[];
      synBtnLoading: boolean;
      mtipMode: string;
      categoryList: any[];
    }>({
      selectedRowKeys: [],
      selectedRows: [],
      modalVisible: false,
      industryList: [],
      synList: ['thing', 'factory', 'catalog'],
      thingTypeList: [],
      synBtnLoading: false,
      mtipMode: '',
      categoryList:[],
    });
    const onSelectChange = (selectedRowKeys: string[], selectedRows: any[]) => {
      state.selectedRowKeys = selectedRowKeys;
      state.selectedRows = selectedRows;
    };
    const { isLoading, tableList, pagination, refresh, currPage, pageSize } =
      useTableList(getList, 'list', 'total');
    const reset = () => {
      formQuery.value = {};
      if (mainAppName === 'mtip-cloud') {
        formQuery.value.industryCode = state.industryList[0]?.code;
      }
      refresh();
    };
    const pageData = reactive({
      infoData: {},
      thingCode: '',
    });
    // 弹框
    const toDetail = async (code: string, row?: any) => {
      try {
        pageData.thingCode = code;
        await getModelInfo(code);
        page.value = 'detail';
      } catch (error) {
        page.value = 'detail';
        pageData.infoData = row.record;
      }
    };
    const getModelInfo = async (code: string) => {
      const res: any = await modelApis.findByCode(code);
      pageData.infoData = res.data;
    };
    const deleteThing = async (codes: string[]) => {
      const res: any = await modelApis.deleteThing(codes);
      refresh();
      if ((res.code = 'M0000')) {
        message.success('删除成功');
      }
    };
    const exportFun = async () => {
      const hide = message.info({
        duration: 0,
        content: '正在导出，请稍后',
      });
      const res: any = await modelApis.exportExcelTemplate();
      exportException(
        res,
        '物模型数据_' + dayjs().format('YYYY_MM_DD_HHmm') + '.xls'
      );

      setTimeout(() => {
        hide();
      }, 200);
    };
    const exportPartFun = async () => {
      const hide = message.info({
        duration: 0,
        content: '正在导出，请稍后',
      });
      const res: any = await modelApis.exportExcelTemplate();
      exportException(
        res,
        '物模型数据_' + dayjs().format('YYYY_MM_DD_HHmm') + '.xls'
      );

      setTimeout(() => {
        hide();
      }, 200);
    };
    // const exportException = (res: any, filename: string) => {
    //   let reader = new FileReader();
    //   reader.readAsText(res, 'utf-8');
    //   reader.onload = (e) => {
    //     try {
    //       const result = JSON.parse(reader.result as string);
    //       if (result.code && result.code === 'M5001') {
    //         message.error(result.message);
    //       }
    //       if (result.code && result.code === 'M4003') {
    //         router.push('/login');
    //       }
    //     } catch (error) {
    //       createDownAction(res, filename);
    //     }
    //   };
    // };
    const reloadCache = () => {
      modelApis.reloadThingCache().then(() => {
        message.success('已启用调整并更新缓存');
      });
    };
    const openModal = () => {
      updateModalRef.value.open(true, {
        industryCode: formQuery.value.industryCode,
      });
    };
    const getIndList = () => {
      modelApis.industryList({ pageNum: 1, pageSize: 999 }).then((res) => {
        state.industryList = res.data.list.filter((el) => el.validEnable);
        if (state.industryList.length > 0) {
          formQuery.value.industryCode = state.industryList[0].code;
          refresh();
        }
      });
    };
    const getThingType = () => {
      modelApis.getThingTypeList().then((res) => {
        state.thingTypeList = res.data;
      });
    };
    const handleTableChange = (pagination, filters, sorter) => {
      const orderEnum = {
        ascend: 'asc',
        descend: 'desc',
      };
      if (!sorter.order) {
        formQuery.value.thingQueryOrderVo = {};
      } else {
        formQuery.value.thingQueryOrderVo = {
          thingColumn: sorter.field,
          orderEnum: orderEnum[sorter.order],
        };
      }

      refresh();
    };
    const cancelSyn = () => {
      state.modalVisible = false;
      state.synList = ['thing', 'factory', 'catalog'];
    };
    const handleSyn = () => {
      if (state.synList?.length > 0) {
        state.synBtnLoading = true;
        modelApis
          .synCloudModel(state.synList)
          .then(() => {
            reset();
            message.success('拉取成功');
            cancelSyn();
          })
          .finally(() => {
            state.synBtnLoading = false;
          });
      } else {
        message.warn('请至少选择一项');
      }
    };
    const getMtipMode = () => {
      modelApis.getMtipMode().then((res) => {
        state.mtipMode = res.data;
      });
    };
    onMounted(() => {
      getMtipMode();
      refresh();
      getThingType();
      const { id } = route?.params;
      if (id) {
        toDetail(id as string, {});
      }
      if (mainAppName === 'mtip-cloud') {
        getIndList();
      }
    });
    return () => (
      <div class='thingModelBox'>
        {/* 拉取模型 */}
        <a-modal
          title='拉取模型'
          visible={state.modalVisible}
          width='400px'
          confirmLoading={state.synBtnLoading}
          okText={state.synBtnLoading ? '拉取中...' : '确定'}
          onCancel={cancelSyn}
          onOk={handleSyn}
        >
          <div>
            <a-alert
              type='info'
              show-icon
              message='拉取云端数据时，请保持网络连接'
            />
            <div class='mar-t-20 mar-l-10'>
              <a-checkbox-group v-model={[state.synList, 'value']}>
                <a-space direction='vertical'>
                  <a-checkbox value='thing'>物模型</a-checkbox>
                  <a-checkbox value='catalog'>类目</a-checkbox>
                  <a-checkbox value='factory'>厂家、品牌、型号</a-checkbox>
                  <a-checkbox value='image'>图标</a-checkbox>
                </a-space>
              </a-checkbox-group>
            </div>
          </div>
        </a-modal>
        {/* 详情page */}
        {page.value === 'detail' ? (
          <detailPage
            data={pageData.infoData}
            thingTypeList={state.thingTypeList}
            onBackList={() => {
              refresh();
              page.value = 'list';
            }}
            onRefreshDetail={(code: string) => {
              getModelInfo(code);
            }}
          />
        ) : (
          ''
        )}
        <modelSortModal ref={modelSortRef} onOk={refresh} />
        <updateModal
          ref={updateModalRef}
          thingTypeList={state.thingTypeList}
          onOk={(info: any) => {
            refresh();
            router.push({
              name: 'thingModelDetail',
              params: { id: info.code },
              query: {
                name: `物模型(${info.name})`,
              },
            });
          }}
        />
        <div
          class='thingModel'
          style={page.value !== 'list' ? 'display:none' : ''}
        >
          <div class='table_wrap flex'>
            <div class='option'>
              <a-form
                ref={queryFormRef}
                model={formQuery.value}
                labelCol={{ style: 'width:7em' }}
                class='table-query-form'
              >
                <a-row gutter={24}>
                  {mainAppName === 'mtip-cloud' && (
                    <a-col span={6}>
                      <a-form-item label='行业'>
                        <div class='flex-lr-c'>
                          <a-select
                            v-model={[formQuery.value.industryCode, 'value']}
                            onChange={refresh}
                          >
                            {state.industryList.map((item) => {
                              return (
                                <a-select-option value={item.code}>
                                  {item.name}
                                </a-select-option>
                              );
                            })}
                          </a-select>
                        </div>
                      </a-form-item>
                    </a-col>
                  )}

                  <a-col span={6}>
                    <a-form-item name='thingName' label='物模型名称'>
                      <div class='flex'>
                        <a-input
                          v-model={[formQuery.value.thingName, 'value']}
                          onPressEnter={refresh}
                          allowClear
                        />
                      </div>
                    </a-form-item>
                  </a-col>
                  <a-col span={6}>
                    <a-form-item name='thingCode' label='物模型编码'>
                      <div class='flex'>
                        <a-input
                          v-model={[formQuery.value.thingCode, 'value']}
                          onPressEnter={refresh}
                          allowClear
                        />
                      </div>
                    </a-form-item>
                  </a-col>
                  <a-col span={6}>
                    <a-form-item label='所属类型'>
                      <div class='flex'>
                        <a-select
                          v-model={[formQuery.value.thingType, 'value']}
                          onChange={refresh}
                          allowClear
                        >
                          {state.thingTypeList.map((item) => {
                            return (
                              <a-select-option value={item.value}>
                                {item.key}
                              </a-select-option>
                            );
                          })}
                        </a-select>
                      </div>
                    </a-form-item>
                  </a-col>
                  <a-col span={6}>
                    <a-form-item label='所属类目'>
                      <div class='flex'>
                        <a-input
                          v-model={[formQuery.value.catalog, 'value']}
                          onPressEnter={refresh}
                          allowClear
                        ></a-input>
                        {/* <a-tree-select
                          v-model={[formQuery.value.catalog, 'value']}
                          dropdown-style={{
                            maxHeight: '400px',
                            overflow: 'auto',
                          }}
                          placeholder='请选择'
                          allow-clear
                          showSearch
                          tree-data={state.categoryList}
                          treeNodeFilterProp='name'
                          fieldNames={{
                            children: 'catalogList',
                            label: 'name',
                            value: 'code',
                          }}
                        ></a-tree-select> */}
                      </div>
                    </a-form-item>
                  </a-col>
                  <a-col span={6}>
                    <a-form-item label='状态'>
                      <div class='flex'>
                        <a-select
                          v-model={[formQuery.value.enable, 'value']}
                          onChange={refresh}
                          allowClear
                        >
                          <a-select-option value={true}>启用</a-select-option>
                          <a-select-option value={false}>停用</a-select-option>
                        </a-select>
                      </div>
                    </a-form-item>
                  </a-col>
                  <a-col
                    offset={mainAppName === 'mtip-cloud' ? 6 : 12}
                    span={6}
                    class='align-r'
                  >
                    <a-space size={16}>
                      <a-button type='primary' onClick={refresh}>
                        查询
                      </a-button>
                      <a-button onClick={reset}>重置</a-button>
                    </a-space>
                  </a-col>
                </a-row>
              </a-form>
            </div>
            <a-space size={16}>
              <a-button
                type='primary'
                class='min-btn-width'
                onClick={() => openModal()}
              >
                新增
              </a-button>

              <a-popconfirm
                title='确认删除?'
                ok-text='确定'
                cancel-text='取消'
                onConfirm={() => {
                  deleteThing(state.selectedRowKeys);
                }}
              >
                <a-button
                  type='primary'
                  class='min-btn-width'
                  disabled={state.selectedRowKeys.length === 0}
                  onClick={() => {}}
                  ghost
                >
                  删除
                </a-button>
              </a-popconfirm>
              <a-dropdown
                v-slots={{
                  overlay: () => {
                    return (
                      <a-menu
                        onClick={(e: any) => {
                          if (e.key === 'all') exportFun();
                          if (e.key === 'part') exportPartFun();
                        }}
                      >
                        <a-menu-item key='all'>导出全部</a-menu-item>
                        <a-menu-item
                          key='part'
                          disabled={state.selectedRowKeys.length === 0}
                        >
                          导出选中
                        </a-menu-item>
                      </a-menu>
                    );
                  },
                }}
              >
                <a-button type='primary' ghost class='min-btn-width'>
                  导出
                </a-button>
              </a-dropdown>
              <a-button
                type='primary'
                ghost
                onClick={() => {
                  modelSortRef.value.open();
                }}
              >
                编辑排序
              </a-button>
              {mainAppName === 'mtip-factory' &&
                state.mtipMode === 'mtip-factory' && (
                  <a-button
                    type='primary'
                    onClick={() => (state.modalVisible = true)}
                    ghost
                  >
                    拉取模型
                  </a-button>
                )}
              <a-popconfirm
                title='启用调整后将会更新程序缓存，是否继续操作？'
                ok-text='确定'
                cancel-text='取消'
                onConfirm={reloadCache}
              >
                <a-button type='primary' class='min-btn-width' ghost>
                  启用调整
                </a-button>
              </a-popconfirm>
            </a-space>

            <div class='mar-t-20' style='overflow: auto;'>
              <a-table
                rowKey='code'
                columns={columns}
                dataSource={tableList.value}
                loading={isLoading.value}
                pagination={pagination}
                row-selection={{
                  selectedRowKeys: state.selectedRowKeys,
                  onChange: onSelectChange,
                }}
                onChange={handleTableChange}
                v-slots={{
                  thingType: (row: any) => {
                    return (
                      <span>
                        {thingTypeName(
                          state.thingTypeList,
                          row.record.thingType
                        )}
                      </span>
                    );
                  },
                  validEnable: (row: any) => {
                    return (
                      <a-tag color={row.record.validEnable ? 'green' : 'red'}>
                        {row.record.validEnable ? '启用' : '停用'}
                      </a-tag>
                    );
                  },
                  action: (row: any) => {
                    return (
                      <a-space>
                        {mainAppName === 'mtip-factory' && (
                          <a
                            onClick={async () => {
                              router.push({
                                name: 'thingInstance',
                                params: {
                                  id: THING_ROOT,
                                },
                                query: {
                                  code: row.record.code,
                                },
                              });
                            }}
                          >
                            管理实例
                          </a>
                        )}
                        <a
                          data-id={row.record.id}
                          onClick={() => {
                            router.push({
                              name: 'thingModelDetail',
                              params: { id: row.record.code },
                              query: {
                                name: `物模型(${row.record.name})`,
                              },
                            });
                          }}
                        >
                          详情
                        </a>
                        <a-popconfirm
                          title='确认删除?'
                          ok-text='确定'
                          cancel-text='取消'
                          onConfirm={() => {
                            deleteThing([row.record.code]);
                          }}
                        >
                          <a-button size='small' type='link'>
                            删除
                          </a-button>
                        </a-popconfirm>
                      </a-space>
                    );
                  },
                }}
              ></a-table>
            </div>
          </div>
        </div>
      </div>
    );
  },
});
