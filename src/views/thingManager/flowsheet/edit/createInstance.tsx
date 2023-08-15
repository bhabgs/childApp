import { defineComponent, ref, reactive } from 'vue';
import { each } from 'lodash';
import Konva from 'konva';
import { create, getThingAllProperties, findPage } from '@/api/thingInst';

export default defineComponent({
  emits: ['change'],
  setup(props, { emit, expose }) {
    const visible = ref(false);
    const form = reactive({
      name: '',
    });
    let thingCode = '';
    let source = '';
    let editorGroup: Konva.Group;
    const getInstanceList = (thingCode) => {
      findPage('web', {
        pageNum: 1,
        pageSize: 9999,
        queryPropertyList: [],
        thingCode,
        thingInstQueryOrder: {},
      }).then(({ data }) => {
        console.log(data);
      });
    };
    const open = (data, group) => {
      thingCode = data.code;
      source = data.source;
      editorGroup = group;
      visible.value = true;
      // getInstanceList(data.code);
    };
    const close = () => {
      visible.value = false;
    };
    const onClosed = () => {
      thingCode = '';
      source = '';
      form.name = '';
    };
    const createInstance = (thingCode, instanceName) => new Promise<any>((resolve) => {
      getThingAllProperties(thingCode).then(({ data }) => {
        const propertyVoList: any[] = [];
        each(data.detailGroupList, ({ thingPropertyValueVoList }) => {
          each(thingPropertyValueVoList, (item) => {
            const toAdd = { ...item };
            if (item.thingPropertyCode === 'NAME') {
              toAdd.value = instanceName;
            }
            propertyVoList.push(toAdd);
          });
        });
        create({
          thingCode,
          propertyVoList,
        }).then(({ data }) => {
          resolve(data);
        });
      });
    });
    const onOk = () => {
      createInstance(thingCode, form.name).then((data) => {
        emit('change', {
          ...data,
          group: editorGroup,
          source,
        });
        close();
      });
    };
    const onCancel = () => {
      editorGroup.remove();
    };
    expose({
      open,
      createInstance,
    });
    return () => (
      <a-modal
        v-model:visible={visible.value}
        title="新增"
        onOk={onOk}
        onCancel={onCancel}
        after-close={onClosed}
      >
        <a-form model={form}>
          <a-form-item label="名称">
            <a-input v-model:value={form.name}></a-input>
          </a-form-item>
        </a-form>
      </a-modal>
    );
  },
});
