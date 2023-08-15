import { defineComponent, ref, watch } from "vue";
import { message } from "ant-design-vue";
import "@/assets/style/pages/bpmnCenter/FormdataManager/EditFormdataModal.less";

import typeList from "@/views/bpmnCenter/typeList";

import * as api from "@/api/processCenter/formdataManager";

const FormatList = ["YYYY-MM-DD", "YYYY-MM-DD HH:mm", "YYYY-MM-DD HH:mm:ss"];

export default defineComponent({
  props: {
    showEdit: {
      type: Boolean,
      default: false,
    },
    activeCategory: {
      type: String,
      default: "",
    },
    currentRow: {
      type: Object,
      default: () => ({}),
    },
  },

  emits: ["update:showEdit", "refresh"],
  setup(props, context) {
    const formRef = ref();
    const formState = ref<any>({
      categoryId: null,
      name: null,
      code: null,
      displayType: null,
      refStandardFormItemAndOptionList: [],
      maxNum: null,
      max: null,
      time: null,
      showTime: null,
    });

    watch(
      () => props.showEdit,
      async (nVal) => {
        if (nVal) {
          // const resp = await api.findAllList({});

          if (props.currentRow) {
            const resp = await api.findById(props.currentRow.id);
            formState.value = resp.data;
          } else {
            formState.value = {
              categoryId: props.activeCategory,
              name: null,
              code: null,
              displayType: null,
              refStandardFormItemAndOptionList: [],
            };
          }
        }
      }
    );

    const changeDisplayType = async () => {
      const resp = await api.findListByDisplayType({
        argDisplayType: formState.value.displayType,
      });

      formState.value.refStandardFormItemAndOptionList = resp.data.map(
        (item) => ({ ...item, optionValue: null })
      );
    };

    const ok = async () => {
      await formRef.value.validate();

      //   {
      //   categoryId: "1615625308896985090",
      //   code: formState.value.code,
      //   displayType: formState.value.displayType,
      //   name: formState.value.name,
      //   refStandardFormItemAndOptionList: [
      //     {
      //       optionId: "1",
      //       optionValue: "0",
      //     },
      //     {
      //       optionId: "7",
      //       optionValue: "-1",
      //     },
      //   ],
      // }
      const resp = api.standardFormItemSave(formState.value);

      if (resp.message === "OK") {
        message.success("保存成功");
      }

      cancelModal();
      context.emit("refresh");
    };

    const cancelModal = () => {
      context.emit("update:showEdit", false);
    };

    const checkboxValue = ref([]);

    return () => (
      <div class="EditFormdata">
        <a-modal
          wrapClassName="EditFormdataModal"
          centered
          width={700}
          title={(props.currentRow ? "编辑" : "新增") + "字段"}
          v-model={[props.showEdit, "visible"]}
          onCancel={cancelModal}
          onOk={ok}
        >
          <a-form
            class="dataform"
            labelCol={{ style: { width: "9em" } }}
            wrapper-col={{ span: 16 }}
            model={formState.value}
            ref={formRef}
          >
            <a-form-item
              label="展示名称"
              name="name"
              rules={[{ required: true, message: "请输入" }]}
            >
              <a-input
                v-model={[formState.value.name, "value"]}
                style="width:200px"
                allowClear
              />
            </a-form-item>

            <a-form-item label="字段编码" name="code">
              <a-input
                v-model={[formState.value.code, "value"]}
                style="width:200px"
                allowClear
              />
            </a-form-item>

            <a-form-item
              label="字段类型"
              name="displayType"
              rules={[{ required: true, message: "请选择" }]}
            >
              <a-select
                v-model={[formState.value.displayType, "value"]}
                style="width:200px"
                onChange={changeDisplayType}
              >
                {typeList.map((option) => {
                  return (
                    <a-select-option value={option.value}>
                      {option.label}
                    </a-select-option>
                  );
                })}
              </a-select>
            </a-form-item>

            <a-form-item label="要求">
              <div class="requiredBox">
                {formState.value.refStandardFormItemAndOptionList?.map(
                  (item: any, index) => {
                    if (
                      item.defStandardFormItemOption.displayType === "check_box"
                    ) {
                      return (
                        <div class="requiredItem flex-center">
                          <a-checkbox v-model={[item.optionValue, "checked"]}>
                            {item.defStandardFormItemOption.displayName}
                          </a-checkbox>
                        </div>
                      );
                    } else if (
                      item.defStandardFormItemOption.displayType === "input_box"
                    ) {
                      return (
                        <div class="requiredItem flex-center">
                          <div class="label">
                            {item.defStandardFormItemOption.displayName}：
                          </div>
                          <a-input
                            class="flex1"
                            v-model={[item.optionValue, "value"]}
                          />
                        </div>
                      );
                    }
                  }
                )}
              </div>
            </a-form-item>

            {false && (
              <a-form-item label="要求">
                {/* 单行文本框 input_box */}
                {formState.value.displayType === "input_box" && (
                  <div>
                    <a-checkbox-group
                      v-model={[checkboxValue.value, "value"]}
                      style="width: 100%"
                    >
                      <div class="lineBox flex">
                        <div class="left flex-center">
                          <a-checkbox value="1">限制最大字符数</a-checkbox>
                        </div>

                        <div class="right flex">
                          <span class="label  flex-center">
                            字符数上限（0-30）
                          </span>
                          <a-input-number
                            v-model={[formState.value.maxNum, "value"]}
                            controls={false}
                            min={0}
                          />
                        </div>
                      </div>

                      <div class="lineBox flex">
                        <div class="left flex-center">
                          <a-checkbox value="2">手机号校验</a-checkbox>
                        </div>
                      </div>

                      <div class="lineBox flex">
                        <div class="left flex-center">
                          <a-checkbox value="3">邮箱校验</a-checkbox>
                        </div>
                      </div>

                      <div class="lineBox flex">
                        <div class="left flex-center">
                          <a-checkbox value="4">纯数字校验</a-checkbox>
                        </div>

                        <div class="right flex">
                          <span class="label  flex-center">数字校验范围</span>
                          <a-input-number
                            v-model={[formState.value.max, "value"]}
                            placeholder="如 0-100，不输入则默认不校验范围"
                            style="width:200px"
                            controls={false}
                            min={0}
                          />
                        </div>
                      </div>
                    </a-checkbox-group>
                  </div>
                )}

                {/* 多行文本域 textarea */}
                {formState.value.displayType === "textarea" && (
                  <div>
                    <a-checkbox-group
                      v-model={[checkboxValue.value, "value"]}
                      style="width: 100%"
                    >
                      <div class="lineBox flex">
                        <div class="left flex-center">
                          <a-checkbox value="1">限制最大字符数</a-checkbox>
                        </div>

                        <div class="right flex">
                          <span class="label flex-center">
                            字符数上限（0-500）
                          </span>
                          <a-input-number
                            v-model={[formState.value.maxNum, "value"]}
                            controls={false}
                            min={0}
                          />
                        </div>
                      </div>
                    </a-checkbox-group>
                  </div>
                )}

                {/* 时间点 time/ 时间段 timearea */}
                {(formState.value.displayType === "time" ||
                  formState.value.displayType === "timearea") && (
                  <div>
                    <div class="lineBox flex">
                      <div class="left flex-center">时间格式</div>
                      <a-radio-group
                        v-model={[formState.value.showTime, "value"]}
                      >
                        <a-radio value={0}>年月日（YYYY-MM-DD）</a-radio>
                        <a-radio value={1}>
                          年月日时分（YYYY-MM-DD HH:MM）
                        </a-radio>
                        <a-radio value={2}>
                          年月日时分秒（YYYY-MM-DD HH:MM:SS）
                        </a-radio>
                      </a-radio-group>
                    </div>

                    <div class="lineBox flex">
                      <div class="left flex-center">可选最早时间</div>
                      <a-radio-group>
                        <a-radio value="0" class="flex">
                          当前时间
                        </a-radio>
                        <a-radio value="1" class="flex">
                          自定义时间
                          <a-date-picker
                            v-model={[formState.value.time, "value"]}
                            allowClear
                            show-time={
                              formState.value.showTime === 0
                                ? false
                                : {
                                    format:
                                      FormatList[formState.value.showTime || 0],
                                  }
                            }
                            format={FormatList[formState.value.showTime || 0]}
                          />
                        </a-radio>
                      </a-radio-group>
                    </div>
                  </div>
                )}

                {/* 单选框 radio_box/复选框 check_box */}
                {(formState.value.displayType === "radio_box" ||
                  formState.value.displayType === "check_box") && (
                  <div>
                    <div class="lineBox flex">
                      <div class="left flex-center">枚举值（每行一个）</div>
                      <a-textarea allow-clear rows="4" style="width:200px" />
                    </div>
                  </div>
                )}

                {/* 下拉选择 select_box */}
                {formState.value.displayType === "select_box" && (
                  <div>
                    <div class="lineBox flex">
                      <a-checkbox-group
                        v-model={[checkboxValue.value, "value"]}
                        style="width: 100%"
                      >
                        <a-checkbox value="1">可多选</a-checkbox>
                      </a-checkbox-group>
                    </div>

                    <div class="lineBox flex">
                      <a-radio-group>
                        <a-radio value="0">固定值录入</a-radio>
                        <a-radio value="1">动态接口获取</a-radio>
                      </a-radio-group>
                    </div>
                  </div>
                )}

                {/* 附件选择 attachment_box */}
                {formState.value.displayType === "attachment_box" && (
                  <div>
                    <a-checkbox-group
                      v-model={[checkboxValue.value, "value"]}
                      style="width: 100%"
                    >
                      <div class="lineBox flex">
                        <a-checkbox value="1">图片（JPEG/JPG/PNG）</a-checkbox>
                      </div>
                      <div class="lineBox flex">
                        <a-checkbox value="2">视频（mp4/avi）</a-checkbox>
                      </div>
                      <div class="lineBox flex">
                        <a-checkbox value="3">声音（mp3/wav）</a-checkbox>
                      </div>
                      <div class="lineBox flex">
                        <a-checkbox value="4">无限制</a-checkbox>
                      </div>
                    </a-checkbox-group>
                  </div>
                )}

                {/* 设备 device */}
                {formState.value.displayType === "device" && (
                  <div>
                    <a-checkbox-group
                      v-model={[checkboxValue.value, "value"]}
                      style="width: 100%"
                    >
                      <a-checkbox value="1">可多选</a-checkbox>
                    </a-checkbox-group>
                  </div>
                )}

                {/* 成员/组织 memberorganization */}
                {formState.value.displayType === "memberorganization" && (
                  <div>
                    <div class="lineBox flex">
                      <a-checkbox-group
                        v-model={[checkboxValue.value, "value"]}
                        style="width: 100%"
                      >
                        <a-checkbox value="1">可多选</a-checkbox>
                      </a-checkbox-group>
                    </div>

                    <div class="lineBox flex">
                      <a-radio-group>
                        <a-radio value="0">只可选择成员</a-radio>
                        <a-radio value="1">只可选择组织</a-radio>
                        <a-radio value="1">不限制</a-radio>
                      </a-radio-group>
                    </div>
                  </div>
                )}

                {/* 嵌入信息 lab_box */}
                {formState.value.displayType === "lab_box" && (
                  <div>
                    <div class="lineBox flex">
                      <a-checkbox-group
                        v-model={[checkboxValue.value, "value"]}
                        style="width: 100%"
                      >
                        <a-checkbox value="1">嵌入样式</a-checkbox>
                      </a-checkbox-group>
                    </div>

                    <div class="lineBox flex">
                      <div class="left flex-center">链接</div>
                      <a-textarea allow-clear rows="4" style="width:200px" />
                    </div>
                  </div>
                )}
              </a-form-item>
            )}
          </a-form>
        </a-modal>
      </div>
    );
  },
});
