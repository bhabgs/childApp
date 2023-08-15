import { defineComponent, computed, reactive, ref } from 'vue';
import {
  updateRela,
  createRela,
  zthingList,
  thingNameList,
  relaTable,
  thingNameListByTable,
  relaByDic,
  findRelaByClass,
} from '@/api/thingModel';
import { message } from 'ant-design-vue';
const formItemAll = [
  // {
  //   title: "关系业务类型",
  //   key: "relaClass",
  // },
  {
    title: '关系名称',
    key: 'relaName',
  },
  {
    title: '关系表名',
    key: 'relaTableName',
    type: ['relation'],
  },
  {
    title: 'Z端物模型',
    key: 'zThingCode',
  },
  {
    title: 'A端列名',
    key: 'relaAThingColumn',
    type: ['relation', 'contain'],
  },
  {
    title: 'Z端列名',
    key: 'relaZThingColumn',
    type: ['relation'],
  },
];
const formDefault = {
  relaType: '',
  athingCode: '',
  relaClass: '',
  relaName: '',
  relaAThingColumn: null,
  zThingCode: null,
  relaZThingColumn: null,
  relaTableName: null,
  validEnable: true,
  remark: '',
  id: '',
};
export default defineComponent({
  props: {
    data: Object,
    type: {
      type: String,
      required: true,
    },
    code: {
      type: String,
      required: true,
    },
  },
  setup(props, { expose, emit }) {
    const formRef = ref();
    const state = reactive<{
      formModel: any;
      title: string;
      visible: boolean;
      isAdd: boolean;
      type: string;
      code: string;
      zthingList: any[];
      aNamethingList: any[];
      zNamethingList: any[];
      relaTable: any[];
      relaClass: any[];
    }>({
      formModel: {},
      title: '',
      visible: false,
      isAdd: false,
      type: 'extends',
      code: '',
      zthingList: [],
      aNamethingList: [],
      zNamethingList: [],
      relaTable: [],
      relaClass: [],
    });
    const formItems = computed(() => {
      return formItemAll.filter((col) => {
        return !col.type || col.type.indexOf(state.type) > -1;
      });
    });
    const update = () => {
      formRef.value.validate().then(() => {
        const httpReq = state.isAdd ? createRela : updateRela;
        httpReq(state.formModel).then(() => {
          message.success('更新成功');
          state.visible = false;
          emit('ok');
        });
      });
    };
    const getZThingList = (type: string, thingCode?: string) => {
      zthingList(type, thingCode).then((res) => {
        state.zthingList = res.data.map((el) => {
          el.key = `${el.key}(${el.value})`;
          return el;
        });
      });
    };
    const getNameList = (code: string, key = 'aNamethingList') => {
      thingNameList(code).then((res) => {
        state[key] = res.data;
      });
    };
    const getNameListByTable = (code: string, key = 'aNamethingList') => {
      thingNameListByTable(code).then((res) => {
        state[key] = res.data;
      });
    };
    const relaZThingColumnChange = (e) => {
      if (state.type === 'contain') {
        state.formModel.relaAThingColumn = null;
        if (e) {
          getNameListByTable(e);
        } else {
          state.aNamethingList = [];
        }
      }
    };
    const relaRelaTableChange = (e) => {
      if (state.type === 'relation' && e) {
        state.formModel.relaAThingColumn = null;
        state.formModel.relaZThingColumn = null;
        if (e) {
          getNameListByTable(e);
          getNameListByTable(e, 'zNamethingList');
        } else {
          state.aNamethingList = [];
          state.zNamethingList = [];
        }
      }
    };
    const getRelaTable = () => {
      relaTable().then((res) => {
        state.relaTable = res.data;
      });
    };
    const getRelaClass = (type: string) => {
      relaByDic(type).then((res) => {
        state.relaClass = res.data;
      });
    };
    const relaClassChange = (options) => {
      if (options) {
        state.formModel.relaClass = options.value;
        if (state.type === 'relation') {
          findRelaByClass(options.value).then(({ data }) => {
            state.formModel.relaAThingColumn = data.relaAThingColumn;
            state.formModel.relaZThingColumn = data.relaZThingColumn;
            state.formModel.relaTableName = data.relaTableName;
            if (data.relaTableName) {
              getNameListByTable(data.relaTableName);
              getNameListByTable(data.relaTableName, 'zNamethingList');
            }
          });
        }
      } else {
        state.formModel.relaClass = null;
      }
    };
    const open = (isAdd, athingCode, relaType, data = formDefault) => {
      state.title = isAdd ? '新增' : '编辑';
      state.isAdd = isAdd
      state.type = relaType;
      state.formModel = { ...state.formModel, ...data, relaType, athingCode };
      getZThingList(relaType, athingCode);
      getRelaClass(relaType);

      if (isAdd) {
        if (relaType === 'extends') {
          state.formModel.relaAThingColumn = 'parent_id';
          state.formModel.relaZThingColumn = 'id';
        } else if (relaType === 'contain') {
          state.formModel.relaZThingColumn = 'id';
        }
      } else {
        if (relaType === 'relation') {
          getNameListByTable(data.relaTableName as any);
          getNameListByTable(data.relaTableName as any, 'zNamethingList');
        } else if (relaType === 'contain') {
          getNameListByTable(data.zThingCode as any);
        }
      }
      if (relaType === 'relation') {
        getRelaTable();
      }
      state.visible = true;
    };
    const close = () => {
      state.visible = false;
      formRef.value.clearValidate();
      state.formModel = {};
      state.aNamethingList = [];
      state.zthingList = [];
      state.zNamethingList = [];
      state.relaTable = [];
      state.relaClass = [];
    };

    expose({ open });
    return () => (
      <div class='updateThingModel'>
        <a-modal
          visible={state.visible}
          title={state.title}
          width='500px'
          onCancel={close}
          onOk={update}
          centered
        >
          <a-form
            ref={formRef}
            model={state.formModel}
            label-col={{ span: 6 }}
            wrapper-col={{ span: 14 }}
          >
            {formItems.value.map((item) => {
              return item.key === 'zThingCode' ? (
                <a-form-item
                  label='Z端物模型'
                  name='zThingCode'
                  rules={[{ required: true, message: '请选择Z端物模型' }]}
                >
                  <a-select
                    allowClear
                    show-search
                    v-model={[state.formModel.zThingCode, 'value']}
                    placeholder='请输入关键字进行选择'
                    optionFilterProp='key'
                    fieldNames={{ label: 'key', value: 'value' }}
                    options={state.zthingList}
                    onChange={relaZThingColumnChange}
                  />
                </a-form-item>
              ) : item.key === 'relaAThingColumn' ? (
                <a-form-item
                  label='A端列名'
                  name='relaAThingColumn'
                  rules={[{ required: true, message: '请选择A端列名' }]}
                >
                  <a-select
                    allowClear
                    show-search
                    v-model={[state.formModel.relaAThingColumn, 'value']}
                    placeholder='请输入关键字进行选择'
                    optionFilterProp='key'
                    fieldNames={{ label: 'key', value: 'value' }}
                    options={state.aNamethingList}
                  />
                </a-form-item>
              ) : item.key === 'relaZThingColumn' ? (
                <a-form-item
                  label='Z端列名'
                  name='relaZThingColumn'
                  rules={[{ required: true, message: '请选择Z端列名' }]}
                >
                  <a-select
                    allowClear
                    show-search
                    v-model={[state.formModel.relaZThingColumn, 'value']}
                    placeholder='请输入关键字进行选择'
                    optionFilterProp='key'
                    fieldNames={{ label: 'key', value: 'value' }}
                    options={state.zNamethingList}
                  />
                </a-form-item>
              ) : item.key === 'relaTableName' ? (
                <a-form-item
                  label='关系表名'
                  name='relaTableName'
                  rules={[{ required: true, message: '请选择关系表名' }]}
                >
                  <a-select
                    allowClear
                    show-search
                    v-model={[state.formModel.relaTableName, 'value']}
                    placeholder='请输入关键字进行选择'
                    optionFilterProp='key'
                    fieldNames={{ label: 'key', value: 'value' }}
                    options={state.relaTable}
                    onChange={relaRelaTableChange}
                  />
                </a-form-item>
              ) : item.key === 'relaName' ? (
                <a-form-item
                  label='关系名称'
                  name='relaName'
                  rules={[{ required: true, message: '请选择关系名称' }]}
                >
                  <a-select
                    allowClear
                    show-search
                    v-model={[state.formModel.relaName, 'value']}
                    placeholder='请输入关键字进行选择'
                    optionFilterProp='key'
                    fieldNames={{ label: 'key', value: 'value' }}
                    options={state.relaClass}
                    onChange={(value, option) => relaClassChange(option)}
                  />
                </a-form-item>
              ) : (
                <a-form-item
                  label={item.title}
                  name={item.key}
                  key={item.key}
                  rules={[{ required: true, message: '请输入' + item.title }]}
                >
                  <a-input v-model={[state.formModel[item.key], 'value']} />
                </a-form-item>
              );
            })}
            <a-form-item label='备注' name='remark'>
              <a-textarea v-model={[state.formModel.remark, 'value']} />
            </a-form-item>
          </a-form>
        </a-modal>
      </div>
    );
  },
});
