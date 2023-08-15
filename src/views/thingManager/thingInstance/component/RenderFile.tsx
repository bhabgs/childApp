import {
  defineComponent,
  ref,
  onMounted,
  reactive,
  watch,
  computed,
  inject,
} from 'vue';
import _ from 'lodash';
import { customRequest } from '../util/upload';
import { message } from 'ant-design-vue';
import * as api from '@/api/thingInstance';
import { UploadOutlined } from '@ant-design/icons-vue';
import '@/assets/style/pages/thingManager/thingInstance/editThing.less';
import useTableList from '@/hooks/useTableList';
import { exportException } from '../util/upload';

const columnList = [
  {
    title: '文件名',
    dataIndex: 'name',
  },
  {
    title: '上传时间',
    dataIndex: 'createTime',
  },
  {
    title: '操作',
    dataIndex: 'action',
    width: '200px',
  },
];

export default defineComponent({
  name: 'RenderSelect',
  props: {
    attrInfo: {
      type: Object,
      required: true,
    },
    isEdit: {
      type: Boolean,
      default: true,
    },
    value: {
      type: String,
      default: '',
    },
  },
  emits: ['change'],
  setup(props, { emit, expose }) {
    const thingInsId = inject('thingInsId', '');
    const thingCode = inject('thingModel', '');
    const state = reactive<{
      value: any;
      selectedRowKeys: any[];
      selectedRows: any[];
    }>({
      value: undefined,
      selectedRowKeys: [],
      selectedRows: [],
    });
    const getList = async () => {
      const data = {
        pageNum: currPage.value,
        pageSize: pageSize.value,
      };
      const params = {
        thingCode: thingCode,
        thingInstId: thingInsId,
        thingPropertyId: props.attrInfo.thingPropertyId,
      };
      const res = await api.getThingInstFiles(data, params);
      return res;
    };
    const { isLoading, tableList, pagination, refresh, currPage, pageSize } =
      useTableList(getList, 'list', 'total');

    const beforeUpload = (file) => {
      let size = file.size / 1024 / 1024;
      if (size > 100) {
        message.error('文件不能大于10M');
        return false;
      }
    };
    const downFile = (id: string, name: string) => {
      api.downloadThingInstFile(id).then((res) => {
        message.success('下载成功');
        exportException(res, name);
      });
    };
    const deleteFile = (id: string) => {
      api.removeThingInstFile(id).then(() => {
        message.success('删除成功');
        tableList.value = [];
        refresh()
      });
    };
    const batchDownFile = () => {
      const promiseAll: any[] = [];
      state.selectedRows.forEach((row) => {
        promiseAll.push(downFile(row.id, row.name));
      });
      Promise.all(promiseAll).then(() => {
        message.success('下载成功');
        state.selectedRowKeys = [];
        state.selectedRows = [];
      });
    };
    onMounted(() => {
      refresh();
    });

    return () => (
      <div class='ins_prop_file'>
        <a-space size={16}>
          {props.isEdit && (
            <a-upload
              headers="'Content-Type': 'multipart/form-data'"
              // accept='image/*'
              showUploadList={false}
              beforeUpload={beforeUpload}
              customRequest={async (e) => {
                const { thingPropertyId } = props.attrInfo;
                const res = await customRequest(
                  e.file,
                  (fileData, headers) => {
                    return api.uploadFile(
                      fileData,
                      headers,
                      thingCode,
                      thingInsId,
                      thingPropertyId
                    );
                  },
                  false
                );
                refresh();
              }}
            >
              <a-button type='primary'>
                {/* <UploadOutlined /> */}
                上传文件
              </a-button>
            </a-upload>
          )}

          <a-button
            type='primary'
            disabled={state.selectedRowKeys.length === 0}
            onClick={batchDownFile}
          >
            下载文件
          </a-button>
        </a-space>
        <a-table
          class='mar-t-20'
          rowKey='id'
          columns={columnList}
          dataSource={tableList.value}
          loading={isLoading.value}
          pagination={pagination}
          row-selection={{
            selectedRowKeys: state.selectedRowKeys,
            onChange: (selectedRowKeys: string[], selectedRows) => {
              state.selectedRowKeys = selectedRowKeys;
              state.selectedRows = selectedRows;
            },
          }}
          v-slots={{
            bodyCell: ({ column, record }) => {
              if (column.dataIndex === 'action') {
                return (
                  <>
                    {props.isEdit && (
                      <a-popconfirm
                        title='确认删除?'
                        ok-text='确定'
                        cancel-text='取消'
                        onConfirm={() => {
                          deleteFile(record.id);
                        }}
                      >
                        <a-button type='link' size='small'>
                          删除
                        </a-button>
                      </a-popconfirm>
                    )}

                    <a-button
                      type='link'
                      size='small'
                      onClick={() => {
                        downFile(record.id, record.name);
                      }}
                    >
                      下载
                    </a-button>
                  </>
                );
              }
            },
          }}
        ></a-table>
      </div>
    );
  },
});
