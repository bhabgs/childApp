import {
  defineComponent,
  onUnmounted,
  reactive,
  ref,
  watch,
  provide,
} from 'vue';
import { CaretDownOutlined, CaretRightOutlined } from '@ant-design/icons-vue';
import '@/assets/style/pages/thingManager/thingInstance/thingDetail.less';
import * as thingApis from '@/api/thingInstance';
import RenderThingProp from './RenderThingProp';
import RenderRelationTab from './RenderRelationTab';
import RenderFile from './RenderFile';
import {
  setDynamicsPropsValue,
  collectAlarmId,
  collectLogicProp,
  collectPointCode,
  getPropEleStyleWidth,
  filterShowProp,
  isRelationGroup,
} from '../hooks/instance';
import useThingReloadValue from '../hooks/useReloadValues';
import thingDefault from '@/assets/imgs/thingManager/thing_default.png';

export default defineComponent({
  components: { RenderThingProp, RenderRelationTab },
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
  emits: ['changeEdit'],
  setup(props, context) {
    const thingModel = ref<string>(props.thingModel);
    const detailGroupList: any = ref([]);
    const detailInfo: any = ref([]);
    provide('thingInsId', props.thingId);
    provide('thingModel', thingModel.value);
    //动态pre点
    //报警属性alarmId点
    const { propsPointCode, propsAlarmId, propsLogic } = useThingReloadValue(
      (preData: any[], alarmData: any[], logicData: any[]) => {
        detailGroupList.value.forEach((ele: any) => {
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
    watch(
      () => props.thingId,
      async (nVal: string) => {
        if (props.thingId) {
          const param = {
            requestType: 'all',
            id: nVal,
            thingCode: props.thingModel,
            functionCode: 'web',
          };
          const resp: any = await thingApis.getThingDetail(param);
          detailGroupList.value = resp.data.detailGroupList.filter((group) => {
            group.thingPropertyValueVoList =
              group.thingPropertyValueVoList.filter((prop) =>
                filterShowProp(prop)
              );
            return group.thingPropertyValueVoList.length > 0;
          });

          detailInfo.value = resp.data;
          //收集前清空一下
          propsPointCode.value = [];
          propsAlarmId.value = [];
          detailGroupList.value.forEach((item) => {
            propsPointCode.value.push(
              ...collectPointCode(item.thingPropertyValueVoList)
            );
            propsAlarmId.value.push(
              ...collectAlarmId(
                item.thingPropertyValueVoList,
                props.thingModel,
                resp.data.thingInstId
              )
            );
            propsLogic.value.push(
              ...collectLogicProp(
                item.thingPropertyValueVoList,
                props.thingModel,
                resp.data.thingInstId,
                resp.data.thingInstCode
              )
            );
          });
        }
      },
      {
        immediate: true,
      }
    );
    const folds = reactive({
      basic: false,
      dynamic: false,
      logic: true,
      action: true,
      alarm: true,
    });

    return () => (
      <div class='thingDetail'>
        <div class='header flex'>
          <div class='flex1'></div>

          <a-space size={16}>
            <a-button
              type='primary'
              onClick={() => {
                context.emit('changeEdit');
              }}
            >
              编辑
            </a-button>
          </a-space>
        </div>

        {detailGroupList.value.map((item: any, index: number) => (
          <div class='basic' key={item.groupName}>
            <div
              class='titleBox flex-center'
              style={folds.basic ? 'margin-bottom:34px' : ''}
            >
              <div class='icon'></div>
              <div class='name'>{item.groupName}</div>
              <div
                class='fold flex'
                onClick={() => {
                  item.foldAll = !item.foldAll;
                }}
              >
                {item.foldAll ? '展开' : '折叠'}
                {item.foldAll ? <CaretRightOutlined /> : <CaretDownOutlined />}
              </div>
            </div>

            {!item.foldAll && (
              <div class='contentBox'>
                {isRelationGroup(item.thingPropertyValueVoList) ? (
                  <RenderRelationTab
                    thingCode={props.thingModel}
                    thingInsId={props.thingId}
                    relationGroup={item.thingPropertyValueVoList}
                  />
                ) : (
                  <a-form class='formBody flex1'>
                    {index === 0 && (
                      <div class='pic flex'>
                        <div class='div_pic flex-center'>
                          <a-image
                            src={detailInfo.value.thingInstPhoto}
                            width={'100%'}
                            fallback={thingDefault}
                            previewMask={false}
                            // fallback='data:image/png;base64,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'
                          />
                        </div>
                      </div>
                    )}
                    <div
                      class='flex_wrap'
                      style={{ width: index === 0 ? '75%' : '100%' }}
                    >
                      {item.thingPropertyValueVoList.map((ele: any) => {
                        const width = getPropEleStyleWidth(ele?.colspan, index);
                        return ele.displayType === 'FILE' ? (
                          <RenderFile attrInfo={ele} isEdit={false} />
                        ) : (
                          <div
                            class='element flex-center'
                            style={`--width:${width}`}
                            data-displayType={ele.displayType}
                            data-propertyType={ele.propertyType}
                            data-propertyId={ele.thingPropertyId}
                            data-value={ele.value}
                            data-thingPropertyInstId={ele.thingPropertyInstId}
                            key={ele.thingPropertyId}
                          >
                            <div class='label'>{ele.label}：</div>

                            <div class='valueBox flex-center flex1'>
                              <RenderThingProp attrInfo={ele} />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </a-form>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    );
  },
});
