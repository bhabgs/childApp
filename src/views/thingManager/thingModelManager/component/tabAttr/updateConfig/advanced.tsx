import {
  defineComponent,
  computed,
  reactive,
  ref,
  watch,
  nextTick,
  onMounted,
} from 'vue';
import { message } from 'ant-design-vue';
import * as modelApis from '@/api/thingModel';
import { cloneDeep, reject } from 'lodash';
import { PlusOutlined } from '@ant-design/icons-vue';
import { validateFn } from './config';
import emitter from '@/utils/mitt';

const formDefault = {
  syncLockFlag: false,
  queryDisplay: false,
  listDisplay: false,
};

export default defineComponent({
  props: {
    formData: {
      type: Object,
      default: () => null,
    },
    property: {
      type: String,
      default: '',
    },
  },
  setup(props, { expose, emit }) {
    const formRef = ref();
    const inputRef = ref();
    const state = reactive<{
      formModel: any;
      formRules: any;
      inputVisible: boolean;
      inputValue: string;
      tags: string[];
    }>({
      formModel: cloneDeep({
        ...formDefault,
        ...props.formData,
      }),
      formRules: {},
      inputVisible: false,
      inputValue: '',
      tags: ['测试', '23'],
    });
    const showInput = () => {
      state.inputVisible = true;
      nextTick(() => {
        inputRef.value.focus();
      });
    };
    const handleInputConfirm = () => {
      state.inputVisible = false;
      if (!state.inputValue.trim()) return;
    };
    const removeTag = () => {};
    watch(
      () => [state.formModel.queryDisplay, state.formModel.listDisplay],
      () => {
        state.formModel.syncLockFlag = true;
      },
      {
        deep: true,
      }
    );
    expose({
      validateFn: validateFn(formRef, 'advanced'),
      formData: [state.formModel, formDefault],
    });
    onMounted(() => {
      emitter.on('formDataChange', () => {
        state.formModel.syncLockFlag = true;
      });
    });
    return () => (
      <div class='attr_update'>
        <a-form
          ref={formRef}
          model={state.formModel}
          rules={state.formRules}
          label-col={{ span: 8 }}
          wrapper-col={{ span: 15 }}
        >
          <a-row>
            <a-col span={12}>
              <a-form-item label='属性是否支持查询' name='queryDisplay'>
                <a-switch
                  v-model={[state.formModel.queryDisplay, 'checked']}
                ></a-switch>
              </a-form-item>
            </a-col>
            <a-col span={12}>
              <a-form-item label='属性是否在列表显示' name='listDisplay'>
                <a-switch
                  v-model={[state.formModel.listDisplay, 'checked']}
                ></a-switch>
              </a-form-item>
            </a-col>
            {/* 锁定后将不再从云端拉取至物联平台 */}
            <a-col span={12}>
              <a-form-item label='云端拉取锁定' name='syncLockFlag'>
                <a-switch
                  v-model={[state.formModel.syncLockFlag, 'checked']}
                ></a-switch>
              </a-form-item>
            </a-col>
          </a-row>
          {/* <a-row>
            <a-col span={24}>
              <a-form-item
                label='标签'
                name='labelName'
                label-col={{ span: 4 }}
                wrapper-col={{ span: 20 }}
              >
                {state.tags.map((el) => (
                  <a-tag closable onClose={() => removeTag(el)}>
                    {el}
                  </a-tag>
                ))}
                {state.inputVisible ? (
                  <a-input
                    ref={inputRef}
                    v-model={[state.inputValue, 'value']}
                    type='text'
                    size='small'
                    style='width:100px'
                    onblur={handleInputConfirm}
                    onKeyup={(e) => e.keyCode === 13 && handleInputConfirm()}
                  />
                ) : (
                  <a-tag onClick={showInput} class='add_tag'>
                    <PlusOutlined />
                    New Tag
                  </a-tag>
                )}
              </a-form-item>
            </a-col>
          </a-row> */}
        </a-form>
      </div>
    );
  },
});
