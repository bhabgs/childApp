import {
  defineComponent,
  watch,
  ref,
  onMounted,
  onUnmounted,
  nextTick,
} from 'vue';
import { message } from 'ant-design-vue';

import dayjs from 'dayjs';
import { exportFun } from '../util/index';
import * as thingApis from '@/api/thingInstance';
import { exportException } from '../../thingInstance/util/upload';

export default defineComponent({
  props: {
    thingNode: Object,
    thingCode: {
      type: String,
      default: '',
    },
    selectedRowKeys: {
      type: Array<String>,
      default: () => [],
    },
  },

  setup(props, context) {
    // 下载项
    const downloadFileName = ref<string>('');
    const visible = ref<boolean>(false);

    let timer: any = null;

    // 查看导出状态
    const getXportStatus = async () => {
      // ERROR 失败, INVALID 无效, PENDING 等待中, PROCESSING 处理中, FINISH 结束
      const res: any = await thingApis.getExportStatus(downloadFileName.value);
      if (res.data === 'FINISH') {
        exceptionHandle();
      } else if (res.data === 'ERROR') {
        exceptionHandle();
        message.error('导出失败，请重新导出！');
      } else if (res.data === 'INVALID') {
        exceptionHandle();
      }
    };

    // 轮询
    const checkDownload = () => {
      timer = setInterval(async () => {
        getXportStatus();
      }, 3000);
    };

    const clear = () => {
      clearInterval(timer);
      timer = null;
    };
    const downFile = async () => {
      const resp: any = await thingApis.downExportFile(downloadFileName.value);
      message.success('下载成功');
      const fileNamePrefix = `物实例数据_${props.thingNode?.name}-`;
      exportException(
        resp,
        `${fileNamePrefix}${dayjs().format('YYYY_MM_DD_HHmm')}.xls`
      );
      visible.value = false;
    };

    //简单的导出
    const isDownIng = ref(false);
    const exportData = async (ids: String[] = []) => {
      clear();
      isDownIng.value = true;
      visible.value = true;
      const data = {
        thingCode: props.thingCode,
        ids,
      };
      thingApis
        .exportData(data)
        .then((res) => {
          downloadFileName.value = res.data;
          checkDownload();
        })
        .catch((err) => {
          exceptionHandle();
        });
    };
    const exceptionHandle = () => {
      isDownIng.value = false;
      clear();
    };
    const exportSelected = () => {
      exportData(props.selectedRowKeys);
    };
    onUnmounted(() => {
      clear();
    });

    return () => (
      <div>
        <a-space size={16}>
          <a-dropdown
            loading={isDownIng.value}
            v-slots={{
              overlay: () => {
                return (
                  <a-menu
                    onClick={(e: any) => {
                      if (e.key === 'part') exportSelected();
                    }}
                  >
                    <a-menu-item key='all'>
                      <a-popconfirm
                        title='导出全部物实例消耗资源较多，需要几分钟时间，请确认是否导出全部？'
                        ok-text='确定'
                        cancel-text='取消'
                        onConfirm={() => {
                          exportData();
                        }}
                      >
                        导出全部
                      </a-popconfirm>
                    </a-menu-item>
                    <a-menu-item
                      key='part'
                      disabled={props.selectedRowKeys.length === 0}
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
        </a-space>
        <a-modal
          v-model:visible={visible.value}
          title='导出'
          footer={null}
          maskClosable={false}
        >
          <div class='align-c'>
            {isDownIng.value ? (
              <div>
                <a-spin tip='正在导出中...'>
                  <div style='height:100px'></div>
                </a-spin>
              </div>
            ) : (
              <div>
                <a-result
                  status='success'
                  title=''
                  sub-title='文件生成成功'
                  class='export_result'
                  v-slots={{
                    extra: () => {
                      return (
                        <a-button type='link' onClick={downFile}>
                          点击下载
                        </a-button>
                      );
                    },
                  }}
                ></a-result>
              </div>
            )}
          </div>
        </a-modal>
      </div>
    );
  },
});
