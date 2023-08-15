import {
  defineComponent,
  reactive,
  ref,
  watch,
  provide,
  onUnmounted,
} from 'vue';
import * as api from '@/api/thingInstance';
import {
  CaretDownOutlined,
  CaretRightOutlined,
  QuestionCircleOutlined,
  UploadOutlined,
  DeleteOutlined,
} from '@ant-design/icons-vue';
import RenderRelationTab from './RenderRelationTab';
import RenderThingProp from './RenderThingProp';
import '@/assets/style/pages/thingManager/thingInstance/thingDetail.less';
import { customRequest } from '../util/upload';
import { message } from 'ant-design-vue';
import { Rule } from 'ant-design-vue/lib/form/interface';
import _ from 'lodash';
import dayjs from 'dayjs';
import RenderFile from './RenderFile';
import {
  setDynamicsPropsValue,
  collectPointCode,
  collectAlarmId,
  collectLogicProp,
  getPropEleStyleWidth,
  isRelationGroup,
} from '../hooks/instance';
import useThingReloadValue from '../hooks/useReloadValues';
import thingDefault from '@/assets/imgs/thingManager/thing_default.png'

const EditThing2 = defineComponent({
  emits: ['changeEdit'],
  props: {
    thingId: {
      type: String,
      default: '',
    },
    thingModel: {
      type: String,
      default: '',
    },
    thingName: {
      type: String,
      default: '',
    },
  },
  setup(props, { emit }) {
    const thingModel = ref<string>(props.thingModel);
    const editData = ref<any>({});
    const isNew = ref<boolean>(false);
    const formData = ref<any>({});
    const editFormRef = ref();
    provide('thingInsId', props.thingId);
    provide('thingModel', thingModel.value);
    watch(
      () => props.thingId,
      async (nVal) => {
        if (props.thingId) {
          if (nVal === 'new') {
            isNew.value = true;
            const { data } = await api.getThingPre(props.thingModel);
            editData.value = filterData(data);
            thingModel.value = data.thingCode
          } else {
            isNew.value = false;
            const { data } = await api.getThingEdit(
              props.thingId,
              props.thingModel
            );
            editData.value = filterData(data);
          }
        }
      },
      { immediate: true }
    );
    const filterData = (data: any) => {
      propsPointCode.value = [];
      propsAlarmId.value = [];
      propsLogic.value = [];

      data.detailGroupList.forEach((group: any) => {
        group.thingPropertyValueVoList = group.thingPropertyValueVoList.filter(
          (el: any) =>
            (!el.thingInstPropertyValidVo?.readonly && isNew.value) ||
            !isNew.value ||
            true
        );
        propsPointCode.value.push(
          ...collectPointCode(group.thingPropertyValueVoList)
        );
        propsAlarmId.value.push(
          ...collectAlarmId(
            group.thingPropertyValueVoList,
            props.thingModel,
            data.thingInstId
          )
        );
        propsLogic.value.push(
          ...collectLogicProp(
            group.thingPropertyValueVoList,
            props.thingModel,
            data.thingInstId,
            data.thingInstCode
          )
        );
      });
      return data;
    };
    const beforeUpload = (file) => {
      let size = file.size / 1024 / 1024;
      if (size > 20) {
        message.error('文件不能大于2M');
        return false;
      }
    };
    const renderAttrItem = (
      ele: any,
      group: any,
      groupIndex: number,
      propIndex: number
    ) => {
      const width = getPropEleStyleWidth(ele?.colspan, groupIndex);
      const rules: any[] = [];
      const displayLabel = ele.label;
      if (
        isNew.value &&
        !_.isNil(ele?.thingInstPropertyValidVo?.defaultValue)
      ) {
        ele.value = ele.thingInstPropertyValidVo.defaultValue;
      }
      if (
        !ele.thingInstPropertyValidVo?.readonly &&
        ele.thingInstPropertyValidVo?.required
      ) {
        rules.push({
          required: true,
          message: '不能为空',
          trigger: 'blur',
        });
      }
      if (
        !ele.thingInstPropertyValidVo?.readonly &&
        ele.displayType === 'TEXT' &&
        ele.thingInstPropertyValidVo?.regex
      ) {
        rules.push({
          validator: (_rule: Rule, value: string) => {
            const reg = new RegExp(ele.thingInstPropertyValidVo?.regex);
            if (reg.test(value)) {
              return Promise.resolve();
            } else {
              return Promise.reject();
            }
          },
          message: '格式不正确',
          trigger: 'blur',
        });
      }
      return ele.displayType === 'FILE' ? (
        !isNew.value && <RenderFile attrInfo={ele} />
      ) : (
        <div
          class='flex element'
          style={`--width:${width}`}
          data-displayType={ele.displayType}
          data-propertyType={ele.propertyType}
          data-propertyId={ele.thingPropertyId}
          data-thingPropertyInstId={ele.thingPropertyInstId}
          data-value={ele.value}
          key={ele.thingPropertyId}
        >
          <a-form-item
            name={ele.thingPropertyCode}
            rules={rules}
            style={{ width: '100%' }}
            v-slots={{
              label: () => {
                if (ele.remark) {
                  return (
                    <a-space>
                      {displayLabel}
                      <a-tooltip
                        v-slots={{
                          title: () => ele.remark,
                        }}
                      >
                        <QuestionCircleOutlined />
                      </a-tooltip>
                    </a-space>
                  );
                } else {
                  return displayLabel;
                }
              },
            }}
          >
            <RenderThingProp
              //动态属性不考虑 readonly
              isEdit={
                !ele.thingInstPropertyValidVo?.readonly ||
                !['PROPERTY', 'ATTRIBUTE'].includes(ele.propertyType)
              }
              attrInfo={ele}
              group={group}
              onPreChange={(info: any) => {
                editData.value.detailGroupList[
                  groupIndex
                ].thingPropertyValueVoList[propIndex].thingPropertyInstId =
                  info?.thingPropertyInstId;
              }}
              onValueChange={(code: string, value: any) => {
                formData.value[code] = value;
              }}
            />
          </a-form-item>
        </div>
      );
    };
    const save = () => {
      //传参需要的字段值，避免传太多无用字段
      const fields = [
        'thingPropertyInstId',
        'thingPropertyId',
        'alarmId',
        'thingPropertyCode',
        'value',
        'prePDUCode',
        'prePDUCode2',
        'prePDUAddress',
        'prePDUAddress2',
        'diType',
        'logicRule',
      ];
      const httpReq = isNew.value ? api.create : api.modify;
      const data = _.cloneDeep(editData.value);
      data.propertyVoList = [];
      //将每个分组下的属性list 合并成一个大list
      data.detailGroupList.forEach((group: any) => {
        data.propertyVoList = data.propertyVoList.concat(
          group.thingPropertyValueVoList
        );
      });
      //过滤一下属性值的字段
      data.propertyVoList = data.propertyVoList.map((item) => {
        const obj = {};
        fields.forEach((key) => {
          if (item.thingPropertyCode === 'THING_CODE' && key === 'value') {
            obj[key] = props.thingModel;
          } else {
            obj[key] = _.isNil(item[key]) ? '' : item[key]; //以防后端收不到字段报错
          }
        });
        return obj;
      });
      delete data.detailGroupList;
      httpReq(data).then((res) => {
        const tip = isNew.value ? '新增' : '编辑';
        message.success(tip + '成功');
        emit('changeEdit', res.data);
      });
    };

    //动态pre点
    //报警属性alarmId点
    const { propsPointCode, propsAlarmId, propsLogic } = useThingReloadValue(
      (preData: any[], alarmData: any[], logicData: any[]) => {
        editData.value.detailGroupList?.forEach((ele: any) => {
          setDynamicsPropsValue(
            ele.thingPropertyValueVoList,
            preData,
            alarmData,
            logicData,
            props.thingId
          );
        });
      }
    );

    return () => (
      <div class='edit-thing'>
        <div class='header flex'>
          <div class='flex1'></div>
          <a-space size={16}>
            <a-button
              type='primary'
              onClick={() => {
                editFormRef.value.validate().then(() => {
                  save();
                });
              }}
            >
              保存
            </a-button>
            <a-button
              onClick={() => {
                emit('changeEdit');
              }}
            >
              取消
            </a-button>
          </a-space>
        </div>
        <a-form
          labelCol={{ style: { width: '12em' } }}
          labelWrap={true}
          model={formData.value}
          ref={editFormRef}
        >
          {(editData.value.detailGroupList ?? []).map((group, index) => (
            <div key={group.groupName} class='basic'>
              <div class='titleBox flex-center'>
                <div class='icon'></div>
                <div class='name'>{group.groupName}</div>
                <div
                  class='fold flex'
                  onClick={() => {
                    group.foldAll = !group.foldAll;
                  }}
                >
                  {group.foldAll ? '展开' : '折叠'}
                  {group.foldAll ? (
                    <CaretRightOutlined />
                  ) : (
                    <CaretDownOutlined />
                  )}
                </div>
              </div>
              {!group.foldAll && (
                <div class='contentBox'>
                  {isRelationGroup(group.thingPropertyValueVoList) ? (
                    !isNew.value && (
                      <RenderRelationTab
                        thingCode={props.thingModel}
                        thingInsId={props.thingId}
                        relationGroup={group.thingPropertyValueVoList}
                        isEdit
                      />
                    )
                  ) : (
                    <div class='formBody'>
                      {index === 0 && (
                        <div class='pic flex'>
                          <div class='div_pic flex-center'>
                            <a-image
                              src={editData.value.thingInstPhoto || ''}
                              width={'100%'}
                              previewMask={false}
                              fallback={thingDefault}
                              // fallback='data:image/png;base64,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'
                            />
                            <div class='hover_action'>
                              <a-space size={16}>
                                <a-upload
                                  headers="'Content-Type': 'multipart/form-data'"
                                  accept='image/*'
                                  showUploadList={false}
                                  beforeUpload={beforeUpload}
                                  customRequest={async (e) => {
                                    const res = await customRequest(
                                      e.file,
                                      (fileData, headers) => {
                                        api.uploadCommon(
                                          fileData,
                                          headers,
                                          props.thingModel,
                                          isNew.value ? '' : props.thingId
                                        );
                                      },
                                      false,
                                      editData.value.thingInstPhoto
                                    );
                                    editData.value.thingInstPhoto =
                                      res.data.url;
                                  }}
                                >
                                  <a-tooltip
                                    v-slots={{
                                      title: '上传',
                                    }}
                                  >
                                    <UploadOutlined class='icon' />
                                  </a-tooltip>
                                </a-upload>

                                {editData.value.thingInstPhoto && (
                                  <a-popconfirm
                                    title='确认删除？'
                                    onConfirm={async () => {
                                      // await thingApis.removePicture({
                                      //   id: editData.value?.thingInst?.id,
                                      //   photo: editData.value.thingInstPhoto,
                                      // });

                                      editData.value.thingInstPhoto = null;
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
                              支持图片格式：.PNG;.JPG;.JPEG;.SVG; 大小不超过20M;
                            </div>
                          </div>
                        </div>
                      )}

                      <div
                        class='flex_wrap'
                        style={{ width: index === 0 ? '75%' : '100%' }}
                      >
                        {group.thingPropertyValueVoList.map(
                          (ele: any, propIndex) => {
                            return (
                              <>
                                {renderAttrItem(ele, group, index, propIndex)}
                              </>
                            );
                          }
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </a-form>
      </div>
    );
  },
});

export default EditThing2;
