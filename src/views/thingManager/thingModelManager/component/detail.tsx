import { defineComponent, onMounted, reactive, ref, nextTick } from 'vue';
import * as ModelApis from '@/api/thingModel';
import {
  CaretUpOutlined,
  CaretRightOutlined,
  PlusOutlined,
  EditOutlined,
  CloseCircleFilled,
  DeleteOutlined,
  UploadOutlined,
} from '@ant-design/icons-vue';
import { message, Modal } from 'ant-design-vue';
import { thingTypeName } from '../config';
import tabAttr from './tabAttr';
import updateModal from './update';
import tabRelation from './tabRelation';
import '@/assets/style/pages/thingManager/thingModelManager/thingModelDetail.less';
import thingDefault from '@/assets/imgs/thingManager/thing_default.png';

const iconObj = [
  {
    title: '2D图标',
    list: [
      {
        name: '运行时状态(绿)',
        key: 'img2dRun',
      },
      {
        name: '故障时状态(红)',
        key: 'img2dAlarm',
      },
      {
        name: '上电时状态(蓝)',
        key: 'img2dPoweron',
      },
      {
        name: '掉电时状态(灰)',
        key: 'img2dPoweroff',
      },
    ],
  },
  {
    title: '2.5D图标',
    list: [
      {
        name: '运行时状态(绿)',
        key: 'img25dRun',
      },
      {
        name: '故障时状态(红)',
        key: 'img25dAlarm',
      },
      {
        name: '上电时状态(蓝)',
        key: 'img25dPoweron',
      },
      {
        name: '掉电时状态(灰)',
        key: 'img25dPoweroff',
      },
    ],
  },
];

export default defineComponent({
  props: {
    data: {
      type: Object,
      default: () => {},
    },
    thingTypeList: {
      type: Array,
      default: [],
    },
  },
  components: { tabAttr, tabRelation, updateModal },
  setup(props, { expose, emit }) {
    const headers = {
      'Content-Type': 'multipart/form-data',
    };
    const updateModalRef = ref();
    const state = reactive({
      formData: {
        name: null,
        code: null,
        fileUrl: null,
      },
      tabType: 1, //1物属性2物图片3物关系
      isEdit: false, //基本信息编辑
    });
    //上传图片
    const customRequest = async (options: any) => {
      const { file, onSuccess, onError } = options;
      const fileData = new FormData();
      fileData.append('file', file as any);
      return new Promise((resolve) => {
        ModelApis.uploadCommon(fileData, headers).then((res: any) => {
          if (res.code === 'M0000') {
            message.success('上传成功');
            onSuccess('response', file);
            resolve(res.data);
          } else {
            message.error('上传失败');
            onError('error', file);
          }
        });
      });
    };
    //更新物图片icon
    const uploadIcon = async (e: any, iconKey: string) => {
      const data: any = await customRequest(e);
      if (data) {
        updateModelPic(iconKey, data);
      }
    };
    const updateModelPicConfirm = (key: string, val: any) => {
      Modal.confirm({
        title: '温馨提示',
        content: '确定要删除此图片吗？',
        onOk: () => {
          updateModelPic(key, val);
        },
      });
    };
    //更新物模型封面
    const updateModelPic = (key: string, val: any) => {
      const data = {
        ...props.data,
        [key]: val,
      };
      ModelApis.updateModel(data).then(() => {
        emit('refreshDetail', props.data.code);
      });
    };
    const editModel = () => {
      updateModalRef.value.open(false, props.data);
    };
    return () => (
      <div class='editModel'>
        <div class='basic'>
          <div class='flex-lr-c top_header'>
            <div class='flex-center title'>
              <b class='line bg_theme'></b>
              <span class='name'>基本信息</span>
            </div>
            {state.isEdit ? (
              <a-space size={16}>
                <a-button
                  type='primary'
                  onClick={() => {
                    updateModalRef.value.update();
                  }}
                >
                  保存
                </a-button>
                <a-button
                  onClick={() => {
                    state.isEdit = false;
                  }}
                >
                  取消
                </a-button>
              </a-space>
            ) : (
              <a-button
                type='primary'
                onClick={() => {
                  state.isEdit = true;
                  nextTick(editModel);
                }}
              >
                编辑
              </a-button>
            )}
          </div>
          <div class='flex content mar-t-20'>
            {state.isEdit ? (
              <div class='flex3'>
                <updateModal
                  ref={updateModalRef}
                  thingTypeList={props.thingTypeList}
                  onOk={(info: any) => {
                    emit('refreshDetail', info.code);
                    state.isEdit = false;
                  }}
                />
              </div>
            ) : (
              <div class='flex3 grid'>
                <div class='flex element'>
                  <span>物模型名称：</span>
                  <span class='value'>{props.data.name}</span>
                </div>
                <div class='flex element'>
                  <span>物模型编码：</span>
                  <span class='value'>{props.data.code}</span>
                </div>
                <div class='flex element'>
                  <span>所属类型：</span>
                  <span class='value'>
                    {thingTypeName(props.thingTypeList, props.data.thingType)}
                  </span>
                </div>
                <div class='flex element'>
                  <span>所属行业：</span>
                  <span class='value'>{props.data.industryName}</span>
                </div>
                <div class='flex element'>
                  <span>所属类目：</span>
                  <span class='value'>{props.data.catalogName}</span>
                </div>
                <div class='flex element'>
                  <span>存储物理表：</span>
                  <span class='value'>{props.data.tableName}</span>
                </div>
                <div class='flex element'>
                  <span>状态：</span>
                  {props.data.validEnable ? (
                    <a-tag color='green'>启用</a-tag>
                  ) : (
                    <a-tag color='red'>停用</a-tag>
                  )}
                </div>
                <div class='flex element'>
                  <span>最近更新人：</span>
                  <span class='value'>{props.data.updateUser}</span>
                  <p></p>
                </div>
                <div class='flex element'>
                  <span>最近更新时间：</span>
                  <span class='value'>{props.data.updateTime}</span>
                </div>
                <div class='flex element'>
                  <span>创建人：</span>
                  <span class='value'>{props.data.createUser}</span>
                </div>
                <div class='flex element'>
                  <span>创建时间：</span>
                  <span class='value'>{props.data.createTime}</span>
                </div>
              </div>
            )}
            <div class='flex1 pic'>
              <div class='div_pic'>
                <a-image
                  src={props.data.photo || ''}
                  preview={false}
                  fallback={thingDefault}
                  // fallback='data:image/png;base64,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'
                />
                <div class='hover_action'>
                  <a-space size={16}>
                    <a-upload
                      headers={headers}
                      accept='image/*'
                      showUploadList={false}
                      customRequest={(e) => uploadIcon(e, 'photo')}
                    >
                      <a-tooltip
                        v-slots={{
                          title: '上传',
                        }}
                      >
                        <UploadOutlined class='icon' />
                      </a-tooltip>
                    </a-upload>

                    {props.data.photo && (
                      <a-popconfirm
                        title='确认删除？'
                        onConfirm={() => {
                          updateModelPic('photo', '');
                        }}
                      >
                        <a-tooltip
                          v-slots={{
                            title: '删除',
                          }}
                        >
                          <DeleteOutlined class='icon' />
                        </a-tooltip>
                      </a-popconfirm>
                    )}
                  </a-space>
                </div>
                <div class='tip_pic'>
                  支持图片格式：.PNG;.JPG;.JPEG;.SVG; 大小不超过2M;
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class='tab_wrap'>
          <a-tabs v-model={[state.tabType, 'activeKey']}>
            <a-tab-pane key={1} tab='物属性'>
              <tabAttr code={props.data.code} />
            </a-tab-pane>
            <a-tab-pane key={2} tab='物图片' force-render>
              {iconObj.map((item) => {
                return (
                  <div key={item.title} class='mar-b-20'>
                    <h4>{item.title}</h4>
                    <div>
                      <a-space size={15}>
                        {item.list.map((icon) => {
                          return (
                            <div>
                              {props.data[icon.key] ? (
                                <div class='icon_img'>
                                  <img
                                    src={props.data[icon.key]}
                                    alt='avatar'
                                  />
                                  <CloseCircleFilled
                                    class='icon_close'
                                    onClick={() => {
                                      updateModelPicConfirm(icon.key, '');
                                    }}
                                  />
                                </div>
                              ) : (
                                <a-upload
                                  name='avatar'
                                  list-type='picture-card'
                                  class='avatar-uploader'
                                  accept='image/*'
                                  headers={headers}
                                  showUploadList={false}
                                  customRequest={(e) => uploadIcon(e, icon.key)}
                                >
                                  <div>
                                    <PlusOutlined />
                                    <div class='ant-upload-text'>
                                      上传图标
                                      <br />
                                      {icon.name}
                                    </div>
                                  </div>
                                </a-upload>
                              )}
                            </div>
                          );
                        })}
                      </a-space>
                    </div>
                  </div>
                );
              })}
            </a-tab-pane>
            <a-tab-pane key={3} tab='物关系'>
              <tabRelation code={props.data.code} />
            </a-tab-pane>
          </a-tabs>
        </div>
      </div>
    );
  },
});
