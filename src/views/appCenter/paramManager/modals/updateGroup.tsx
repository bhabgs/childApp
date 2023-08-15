import { computed, defineComponent, ref } from "vue";
import { useVModel, whenever } from "@vueuse/core";
import _ from "lodash";
import { statusList } from "./updateParamModal";
import * as api from "@/api/appCenter/paramManager";
import { message } from "ant-design-vue";

/**
 * 更新参数组弹窗
 */
const UpdateGroup = defineComponent({
  emits: ["update:visible", "refresh"],
  props: {
    visible: Boolean,
    isPreview: Boolean,
    record: Object,
    parent: Object,
    appId: {
      type: String,
      required: true,
    },
  },
  setup(props, { emit }) {
    const isVisible = useVModel(props, "visible", emit);
    const formRef = ref();
    const form = ref<any>({});

    const isAdd = computed(() => _.isEmpty(props.record));

    whenever(isVisible, () => {
      if (!isAdd.value) form.value = _.cloneDeep(props.record);
    });

    const handleSave = async () => {
      await formRef.value.validate();
      const data = _.omit(form.value, "parent");
      if (isAdd.value) {
        if (!props.parent?.isRoot) {
          data.parentId = props.parent?.id;
        }
        data.appId = props.appId;
        await api.insetParamGroup(data);
      } else {
        await api.updateParamGroup(data);
      }
      message.success("保存成功");
      isVisible.value = false;
      emit("refresh");
    };

    const onClose = () => {
      formRef.value.resetFields();
      form.value = {};
    };

    return () => {
      const disabled = props.isPreview;

      return (
        <div class="update-group">
          <a-modal
            title="参数组"
            width={650}
            afterClose={onClose}
            v-model:visible={isVisible.value}
            onOk={handleSave}
          >
            <a-form
              ref={formRef}
              model={form.value}
              labelCol={{ style: { width: "6em" } }}
            >
              <a-row>
                <a-col span={12}>
                  <a-form-item label="名称" required name="name">
                    <a-input
                      style={{ width: "200px" }}
                      placeholder="请输入"
                      disabled={disabled}
                      v-model:value={form.value.name}
                    ></a-input>
                  </a-form-item>
                </a-col>
                <a-col span={12}>
                  <a-form-item label="状态" required name="valid">
                    <a-select
                      style={{ width: "200px" }}
                      placeholder="请选择"
                      disabled={disabled}
                      options={statusList}
                      v-model:value={form.value.valid}
                    ></a-select>
                  </a-form-item>
                </a-col>
                <a-col span={12}>
                  <a-form-item label="上一级">
                    <a-input
                      style={{ width: "200px" }}
                      disabled
                      value={props.parent?.name}
                    ></a-input>
                  </a-form-item>
                </a-col>
                <a-col span={12}>
                  <a-form-item label="备注" name="remark">
                    <a-input
                      style={{ width: "200px" }}
                      placeholder="请输入"
                      disabled={disabled}
                      v-model:value={form.value.remark}
                    ></a-input>
                  </a-form-item>
                </a-col>
              </a-row>
            </a-form>
          </a-modal>
        </div>
      );
    };
  },
});

export default UpdateGroup;
