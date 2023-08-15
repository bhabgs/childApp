import { defineComponent, onMounted, reactive, ref } from 'vue';
import {
  updateModel,
  createModel,
  categoryList,
  industryList,
  findParentThing,
  getTableNameList,
} from '@/api/thingModel';
import industryApi from '@/api/industry';
import { message } from 'ant-design-vue';
import { formModelUpdateRules } from '../config';
import { microAppUtils } from 'inl-ui/dist/utils';
const mainAppName = microAppUtils.getMainAppName() || 'mtip-factory';
const isMainAppCloud = mainAppName === 'mtip-cloud';
import { THING_ROOT } from '@/views/thingManager/thingInstance/data';

const formDefault = {
  name: '',
  code: '',
  parentCode: '',
  tableName: '',
  catalogCode: null,
  industryCode: null,
  thingType: null,
  validEnable: true,
  sort: undefined,
  remark: '',
};
export default defineComponent({
  props: {
    thingTypeList: {
      type: Array,
      default: [],
    },
  },
  setup(props, { expose, emit }) {
    const queryFormRef = ref();
    const state = reactive<{
      formModel: any;
      title: string;
      visible: boolean;
      isAdd: boolean;
      categoryList: any[];
      industryList: any[];
      modelList: any[];
      tableNameList: any[];
    }>({
      formModel: {},
      title: '',
      visible: false,
      isAdd: false,
      categoryList: [],
      industryList: [],
      modelList: [],
      tableNameList: [],
    });
    let timer: any = null;
    const debounce = (fn: () => void, delay = 500) => {
      if (timer) {
        clearTimeout(timer);
      }
      timer = setTimeout(() => {
        fn();
      }, delay);
    };
    const update = () => {
      queryFormRef.value.validate().then(() => {
        const httpReq = state.isAdd ? createModel : updateModel;
        if (!state.formModel.parentCode) {
          state.formModel.parentCode = THING_ROOT;
        }
        httpReq(state.formModel).then(() => {
          message.success(state.isAdd ? '创建成功' : '保存成功');
          state.visible = false;
          emit('ok', state.formModel);
        });
      });
    };

    const getCategoryList = (code: string) => {
      categoryList(code).then((res) => {
        state.categoryList = res.data;
      });
    };
    const getIndList = () => {
      industryList({ pageNum: 1, pageSize: 999 }).then((res) => {
        state.industryList = res.data.list.filter((el) => el.validEnable);
      });
    };
    const fetchModelList = () => {
      findParentThing().then((res) => {
        state.modelList = res.data;
      });
    };
    const industryChange = (code: string) => {
      getCategoryList(code);
      state.formModel.catalogCode = '';
    };

    const open = (isAdd, data = formDefault) => {
      state.isAdd = isAdd;
      state.title = isAdd ? '新增物模型' : '编辑物模型';
      const oldData = isAdd ? formDefault : state.formModel;
      state.formModel = { ...oldData, ...data };
      getIndList();
      getTableNameData();
      if (isAdd) {
        fetchModelList();
      }
      if (data.industryCode) {
        getCategoryList(data.industryCode);
      } else {
        getSystemIndustry();
      }
      state.visible = true;
    };
    const close = () => {
      state.visible = false;
      queryFormRef.value.clearValidate();
      state.formModel = {};
    };

    //获取物理表名
    const getTableNameData = () => {
      getTableNameList().then((res) => {
        state.tableNameList = res.data.map((el) => {
          el.value = el.value + `[${el.key}]`;
          return el;
        });
      });
    };
    //获取默认行业
    const getSystemIndustry = () => {
      industryApi.getSystemIndustry().then(({ data }) => {
        if (data?.value !== 'unknown') {
          state.formModel.industryCode = data.value;
          getCategoryList(data.value);
        }
      });
    };
    expose({ open, update });
    return () => (
      <div class='updateThingModel' v-show={state.visible}>
        {/* 新增是弹框，编辑是不是弹框 */}
        {state.isAdd ? (
          <a-modal
            visible={state.visible}
            title={state.title}
            width='560px'
            onCancel={close}
            onOk={update}
            centered
          >
            <a-form
              ref={queryFormRef}
              model={state.formModel}
              rules={formModelUpdateRules}
              label-col={{ span: 6 }}
              wrapper-col={{ span: 17 }}
            >
              <a-form-item label='模型名称' name='name'>
                <a-input v-model={[state.formModel.name, 'value']} allowClear />
              </a-form-item>
              <a-form-item label='模型编码' name={state.isAdd ? 'code' : ''}>
                <a-input
                  v-model={[state.formModel.code, 'value']}
                  disabled={!state.isAdd}
                  placeholder='支持数字、大写英文字母和_ - .'
                  allowClear
                />
              </a-form-item>
              <a-form-item label='所属类型' name='thingType'>
                <a-select
                  v-model={[state.formModel.thingType, 'value']}
                  allowClear
                  placeholder='请选择'
                >
                  {props.thingTypeList.map((item: any) => {
                    return (
                      <a-select-option value={item.value}>
                        {item.key}
                      </a-select-option>
                    );
                  })}
                </a-select>
              </a-form-item>
              <a-form-item label='所属父级名称' name='parentCode'>
                <a-select
                  allowClear
                  show-search
                  v-model={[state.formModel.parentCode, 'value']}
                  placeholder='请输入关键字进行选择'
                  optionFilterProp='key'
                  fieldNames={{ label: 'key' }}
                  options={state.modelList}
                />
              </a-form-item>
              <a-form-item
                label={isMainAppCloud ? '所属类目' : '所属行业及类目'}
                name={isMainAppCloud ? 'catalogCode' : 'catalogCode'}
              >
                <div class='flex-lr-c'>
                  {!isMainAppCloud && (
                    <a-select
                      style='width:35%'
                      allowClear
                      v-model={[state.formModel.industryCode, 'value']}
                      placeholder='请选择'
                      onChange={industryChange}
                    >
                      {state.industryList.map((item) => {
                        return (
                          <a-select-option value={item.code}>
                            {item.name}
                          </a-select-option>
                        );
                      })}
                    </a-select>
                  )}
                  <a-tree-select
                    style={isMainAppCloud ? '' : 'width:63%'}
                    v-model={[state.formModel.catalogCode, 'value']}
                    dropdown-style={{ maxHeight: '400px', overflow: 'auto' }}
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
                  ></a-tree-select>
                </div>
              </a-form-item>
              <a-form-item label='存储物理表名' name='tableName'>
                <a-select
                  allowClear
                  show-search
                  v-model={[state.formModel.tableName, 'value']}
                  placeholder='请输入关键字进行选择'
                  optionFilterProp='value'
                  fieldNames={{ label: 'value', value: 'key' }}
                  options={state.tableNameList}
                />
              </a-form-item>
              <a-form-item label='是否启用' name='validEnable'>
                <a-switch
                  v-model={[state.formModel.validEnable, 'checked']}
                  allowClear
                />
              </a-form-item>
              <a-form-item label='描述' name='remark'>
                <a-textarea v-model={[state.formModel.remark, 'value']} />
              </a-form-item>
            </a-form>
          </a-modal>
        ) : (
          <>
            <a-form
              ref={queryFormRef}
              model={state.formModel}
              rules={formModelUpdateRules}
              label-col={{ style: 'width:9em' }}
              // wrapper-col={{ span: 17 }}
            >
              <a-row gutter={16}>
                <a-col span={8}>
                  <a-form-item label='模型名称' name='name'>
                    <a-input
                      v-model={[state.formModel.name, 'value']}
                      allowClear
                    />
                  </a-form-item>
                </a-col>
                <a-col span={8}>
                  <a-form-item
                    label='模型编码'
                    name={state.isAdd ? 'code' : ''}
                  >
                    <a-input
                      v-model={[state.formModel.code, 'value']}
                      disabled={!state.isAdd}
                      placeholder='支持数字、大写英文字母和_ - .'
                      allowClear
                    />
                  </a-form-item>
                </a-col>
                <a-col span={8}>
                  <a-form-item label='所属类型' name='thingType'>
                    <a-select
                      v-model={[state.formModel.thingType, 'value']}
                      allowClear
                      placeholder='请选择'
                    >
                      {props.thingTypeList.map((item: any) => {
                        return (
                          <a-select-option value={item.value}>
                            {item.key}
                          </a-select-option>
                        );
                      })}
                    </a-select>
                  </a-form-item>
                </a-col>
                <a-col span={8}>
                  <a-form-item label='所属行业' name='industryCode'>
                    <div class='flex-lr-c'>
                      <a-select
                        allowClear
                        v-model={[state.formModel.industryCode, 'value']}
                        placeholder='请选择'
                        onChange={industryChange}
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
                <a-col span={8}>
                  <a-form-item label='所属类目' name='catalogCode'>
                    <a-tree-select
                      v-model={[state.formModel.catalogCode, 'value']}
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
                    ></a-tree-select>
                  </a-form-item>
                </a-col>
                <a-col span={8}>
                  <a-form-item label='存储物理表名' name='tableName'>
                    <a-select
                      allowClear
                      show-search
                      v-model={[state.formModel.tableName, 'value']}
                      placeholder='请输入关键字进行选择'
                      optionFilterProp='value'
                      fieldNames={{ label: 'value', value: 'key' }}
                      options={state.tableNameList}
                    />
                  </a-form-item>
                </a-col>
                <a-col span={8}>
                  <a-form-item label='是否启用' name='validEnable'>
                    <a-switch
                      v-model={[state.formModel.validEnable, 'checked']}
                      allowClear
                    />
                  </a-form-item>
                </a-col>
                <a-col span={24}>
                  <a-form-item label='描述' name='remark'>
                    <a-textarea v-model={[state.formModel.remark, 'value']} />
                  </a-form-item>
                </a-col>
              </a-row>
            </a-form>
          </>
        )}
      </div>
    );
  },
});
