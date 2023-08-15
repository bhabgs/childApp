import { defineComponent, ref } from 'vue';
import { message } from 'ant-design-vue';
import { getThingPropertyInstInfo, saveThingPropertyInstInfo } from '@/api/thingInst';

export default defineComponent({
  props: {
    thingCode: {
      type: String,
      default: '',
    },
  },
  setup(props, { expose }) {
    const visible = ref(false);
    const title = ref('');
    const info = ref({
      logicRule: '',
    });
    const open = (thingInstId, { label, thingPropertyInstId, thingPropertyId }) => {
      getThingPropertyInstInfo({
        thingInstId,
        thingPropertyId,
        thingPropertyInstId,
      }).then(({ data }) => {
        title.value = label;
        info.value = {
          ...data,
          thingPropertyId,
          thingPropertyInstId,
          thingCode: props.thingCode,
        };
        visible.value = true;
      });
    };
    const close = () => {
      title.value = '';
      info.value = {
        logicRule: '',
      };
      visible.value = false;
    };
    const save = () => {
      saveThingPropertyInstInfo(info.value).then(() => {
        message.success('保存成功');
        close();
      });
    };
    expose({
      open,
    })
    return () => (
      <a-modal
        v-model:visible={visible.value}
        title={`逻辑计算：${title.value}`}
        onOk={save}
      >
        <a-form>
          <a-form-item label="计算规则">
            <a-textarea v-model:value={info.value.logicRule} rows={5}></a-textarea>
          </a-form-item>
        </a-form>
      </a-modal>
    );
  },
});
