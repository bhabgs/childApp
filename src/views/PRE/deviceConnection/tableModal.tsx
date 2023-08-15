import {
  computed,
  defineComponent,
  inject,
  PropType,
  ref,
  watch,
  reactive,
} from "vue";
import { useVModel } from "@vueuse/core";
import { omit, isEmpty } from "lodash";
import {
  CaretRightOutlined,
  CaretDownOutlined,
  QuestionCircleOutlined,
} from "@ant-design/icons-vue";
import { Modal, message } from "ant-design-vue";
import api from "@/api/PRE";
import dayjs from "dayjs";

/*
 * 新建 更新 部门对话框
 */
const TableModal = defineComponent({
  emits: ["update:visible", "getDetail"],
  props: {
    visible: {
      type: Boolean,
      default: false,
    },
    mode: {
      type: String as PropType<"view" | "add" | "edit">,
      /* required: true, */
    },
    record: {
      type: Object,
      default: () => ({}),
    },
    parent: {
      type: Object,
      default: () => ({}),
    },
    treeInfo: {
      type: Object,
      default: () => ({}),
    },
    onRefresh: {
      type: Function,
    },
  },
  setup(props, { emit }) {
    const visible = useVModel(props, "visible", emit);

    let form = reactive({
      pointCode: "",
      groupCode: "",
      functionCode: null,
      address: "",
      digitalPag: 0,
      alarmPoint: 0,
      writeEnable: 1,
      writeExpiresTime: 3000,
      persistentType: null,
      dataPrecision: 2,
      bitIndex: null,
      dataLength: null,
      dataBytesFormat: null,
      pointDescription: null,
      dataType: null,
      blockCode: null,
      outputType: null,
      deadBand: null,
      reverse: false,
      rawMin: null,
      rawMax: null,
      valueMin: null,
      valueMax: null,
      resetMillis: null,
      resetValue: "",
      lowerLimit: null,
      upperLimit: null,
    });
    const folds = reactive({
      basic: true,
    });
    const formRef = ref();
    const isView = computed(() => props.mode === "view");
    const getRequiredRule = (label: string, validatorFun?, required = true) => {
      return [
        {
          required: required,
          message: `请输入${label}`,
        },
        validatorFun && {
          validator: validatorFun,
        },
      ].filter(Boolean);
    };
    const codeCharacterValidator = (_rule: any, value: string) => {
      if (value) {
        if (value.match(/^[A-Za-z0-9_-]+?$/)) {
          return Promise.resolve();
        } else {
          return Promise.reject("支持数字、大小写字母和_ -");
        }
      } else {
        return Promise.resolve();
      }
    };
    const codeValidator = (_rule: any, value: string) => {
      if (value) {
        if (value.match(/^[A-Za-z0-9._-]+?$/)) {
          return Promise.resolve();
        } else {
          return Promise.reject("支持数字、大小写字母和_ - .");
        }
      } else {
        return Promise.resolve();
      }
    };
    /* ===== 下拉列表 ===== */
    let selectList = reactive({
      functionCodeList: [],
      /* 推送方式,数据类型，输出数据类型，数据格式 */
      persistentType: [],
      dataType: [],
      outputType: [
        { id: "zs", name: "整数" },
        { id: "xs", name: "小数" },
        { id: "boolean", name: "布尔" },
        { id: "string", name: "字符串" },
      ],
      dataBytesFormat: [],
    });
    const getSelectList = async () => {
      try {
        const { data } = await api.getPointDataType();
        selectList = data;
        if (data?.dataType) form.dataTypeId = data?.dataType![0]?.id || "";
        if (data?.persistentType)
          form.persistentTypeId = data?.persistentType![0]?.id || "";
        if (data?.outputType)
          form.outputTypeId = data?.outputType![0]?.id || "";
        if (data?.dataBytesFormat)
          form.dataBytesFormat = data?.dataBytesFormat![0]?.id || "";
      } catch (error) {}
    };

    // 类型列表
    const typeList = ref([
      {
        id: 1,
        name: "选煤厂",
      },
      {
        id: 2,
        name: "选煤分厂",
      },
      {
        id: 3,
        name: "部门",
      },
      {
        id: 4,
        name: "外联部门",
      },
    ]);

    watch(
      () => props.visible,
      async (e) => {
        visible.value = e;
        getSelectList();
      },
      {
        immediate: true,
      }
    );

    const handleClose = async () => {
      Object.keys(form).map((key) => {
        if (key === "reverse") form[key] = false;
        else if (key === "alarmPoint" || key === "digitalPag") form[key] = 0;
        else if (key === "writeExpiresTime") form[key] = 3000;
        else if (key === "writeEnable") form[key] = 1;
        else if (key === "dataPrecision") form[key] = 2;
        else form[key] = null;
      });
      formRef.value.clearValidate();
      visible.value = false;
    };
    /* 保存 */
    const handleSave = async () => {
      await formRef.value.validate();
      try {
        const data = {
          ...form,
          reverse: form.reverse ? 1 : 0,
          preCode: props.treeInfo.parent.node.preName,
          pduCode: props.treeInfo.pduCode,
        };
        await api.createPointByPduCode(data);
        message.success("添加成功");
        handleClose();
        props.onRefresh?.();
      } catch (error) {
        message.error("添加失败");
      }
    };

    return () => {
      return (
        <a-modal
          maskClosable={false}
          wrapClassName="table-dialog"
          title={"属性点"}
          centered
          v-model={[visible.value, "visible"]}
          width={"50%"}
          onOk={handleSave}
          onCancel={() => {
            handleClose();
          }}
        >
          <a-form
            ref={formRef}
            labelCol={{ style: { width: "9em" } }}
            model={form}
          >
            <div class="title flex-center">
              <div class="icon"></div>
              <div class="name">基础信息</div>
            </div>
            <a-row>
              <a-col span={12}>
                <a-form-item
                  name="address"
                  label="地址"
                  required
                  onChange={() => {
                    if (!form.pointCode) form.pointCode = `${form.address}`;
                    formRef.value.clearValidate("pointCode");
                  }}
                >
                  <a-input
                    allow-clear
                    placeholder="请输入地址"
                    maxlength={128}
                    v-model={[form.address, "value"]}
                  />
                </a-form-item>
              </a-col>
              <a-col span={12}>
                <a-form-item
                  name="groupCode"
                  v-slots={{
                    label: () => {
                      return (
                        <a-space>
                          所属组
                          <a-tooltip title="只支持数字">
                            <QuestionCircleOutlined />
                          </a-tooltip>
                        </a-space>
                      );
                    },
                  }}
                  rules={getRequiredRule(
                    "所属组",
                    async (_, value) => {
                      if (value) {
                        if (/^[-]?\d+(\.\d+)?$/.test(value)) {
                          return Promise.resolve();
                        } else {
                          return Promise.reject("只支持数字");
                        }
                      }
                    },
                    false
                  )}
                >
                  <a-input
                    allow-clear
                    placeholder="请输入所属组"
                    maxlength={128}
                    v-model={[form.groupCode, "value"]}
                  />
                </a-form-item>
              </a-col>
              <a-col span={12}>
                <a-form-item
                  name="pointCode"
                  required
                  rules={getRequiredRule(
                    "标签",
                    (_, val) => {
                      if (/[\u4e00-\u9fa5]/.test(val)) {
                        return Promise.reject("不能含有中文");
                      }
                      return Promise.resolve();
                    },
                    true
                  )}
                  v-slots={{
                    label: () => {
                      return (
                        <a-space>
                          标签
                          <a-tooltip title="不能含有中文">
                            <QuestionCircleOutlined />
                          </a-tooltip>
                        </a-space>
                      );
                    },
                  }}
                >
                  <a-input
                    allow-clear
                    maxlength={225}
                    placeholder="请输入标签"
                    v-model={[form.pointCode, "value"]}
                  />
                </a-form-item>
              </a-col>
              <a-col span={12}>
                <a-form-item
                  name="functionCode"
                  v-slots={{
                    label: () => {
                      return (
                        <a-space>
                          功能码
                          <a-tooltip title="modbus的寄存器功能码">
                            <QuestionCircleOutlined />
                          </a-tooltip>
                        </a-space>
                      );
                    },
                  }}
                >
                  <a-select
                    allow-clear
                    placeholder="请选择功能码"
                    fieldNames={{ label: "name", value: "id" }}
                    options={selectList.functionCodeList}
                    v-model={[form.functionCode, "value"]}
                  />
                </a-form-item>
              </a-col>
              <a-col span={12}>
                <a-form-item
                  name="blockCode"
                  v-slots={{
                    label: () => {
                      return (
                        <a-space>
                          附加参数
                          <a-tooltip title="Modbus协议填写从站号；AB协议填写解析方式，填500为特殊解析方式。">
                            <QuestionCircleOutlined />
                          </a-tooltip>
                        </a-space>
                      );
                    },
                  }}
                >
                  <a-input
                    allow-clear
                    placeholder="请输入附加参数"
                    v-model={[form.blockCode, "value"]}
                  />
                </a-form-item>
              </a-col>
              <a-col span={12}>
                <a-form-item
                  name="persistentType"
                  v-slots={{
                    label: () => {
                      return (
                        <a-space>
                          推送方式
                          <a-tooltip
                            overlayClassName="my_tooltip"
                            v-slots={{
                              title: () => {
                                return (
                                  <p>
                                    上报信息：上报信息，但是不存历史数据
                                    <br />
                                    历史存储：存储历史数据，但是不上报信息
                                  </p>
                                );
                              },
                            }}
                          >
                            <QuestionCircleOutlined />
                          </a-tooltip>
                        </a-space>
                      );
                    },
                  }}
                >
                  <a-select
                    show-search
                    allowClear
                    v-model={[form.persistentTypeId, "value"]}
                    placeholder="请选择推送方式"
                  >
                    {(selectList.persistentType || []).map((item: any) => (
                      <a-select-option key={item.id}>
                        {item.name}
                      </a-select-option>
                    ))}
                  </a-select>
                </a-form-item>
              </a-col>
              <a-col span={12}>
                <a-form-item name="digitalPag" label="开关量">
                  <a-select
                    show-search
                    allowClear
                    v-model={[form.digitalPag, "value"]}
                    defaultValue={0}
                  >
                    <a-select-option key={1}>开关量</a-select-option>
                    <a-select-option key={0}>其他</a-select-option>
                  </a-select>
                </a-form-item>
              </a-col>
              <a-col span={12}>
                <a-form-item name="type" label="报警点">
                  <a-select
                    show-search
                    allowClear
                    v-model={[form.alarmPoint, "value"]}
                    defaultValue={0}
                  >
                    <a-select-option key={1}>是</a-select-option>
                    <a-select-option key={0}>否</a-select-option>
                  </a-select>
                </a-form-item>
              </a-col>
              <a-col span={12}>
                <a-form-item label="描述">
                  <a-input
                    allow-clear
                    placeholder="请输入描述"
                    v-model={[form.pointDescription, "value"]}
                  />
                </a-form-item>
              </a-col>
            </a-row>
            <div class="title flex-center">
              <div class="icon"></div>
              <div class="name">数据属性</div>
            </div>
            <a-row>
              <a-col span={12}>
                <a-form-item name="writeEnable" label="读写类型">
                  <a-radio-group v-model={[form.writeEnable, "value"]}>
                    <a-radio value={1}>读写</a-radio>
                    <a-radio value={2}>只读</a-radio>
                  </a-radio-group>
                </a-form-item>
              </a-col>
              <a-col span={12}>
                <a-form-item name="groupCode" label="写入超时">
                  <a-input-number
                    addon-after="ms"
                    style="width: 100%"
                    placeholder="请输入写入超时"
                    v-model={[form.writeExpiresTime, "value"]}
                  />
                </a-form-item>
              </a-col>
              <a-col span={12}>
                <a-form-item name="dataType" label="数据类型">
                  <a-select
                    show-search
                    allowClear
                    v-model={[form.dataTypeId, "value"]}
                    placeholder="请选择数据类型"
                  >
                    {(selectList.dataType || []).map((item: any) => (
                      <a-select-option key={item.id}>
                        {item.name}
                      </a-select-option>
                    ))}
                  </a-select>
                </a-form-item>
              </a-col>
              <a-col span={12}>
                <a-form-item name="outputType" label="输出数据类型">
                  <a-select
                    show-search
                    allowClear
                    v-model={[form.outputTypeId, "value"]}
                    placeholder="请选择输出数据类型"
                  >
                    {(selectList.outputType || []).map((item: any) => (
                      <a-select-option key={item.id}>
                        {item.name}
                      </a-select-option>
                    ))}
                  </a-select>
                </a-form-item>
              </a-col>
              <a-col span={12}>
                <a-form-item name="dataBytesFormat" label="数据格式">
                  <a-select
                    show-search
                    allowClear
                    v-model={[form.dataBytesFormat, "value"]}
                    placeholder="请选择数据格式"
                  >
                    {(selectList.dataBytesFormat || []).map((item: any) => (
                      <a-select-option key={item.id}>
                        {item.name}
                      </a-select-option>
                    ))}
                  </a-select>
                </a-form-item>
              </a-col>
              <a-col span={12}>
                <a-form-item name="dataPrecision" label="小数位数">
                  <a-input-number
                    precision={0}
                    style="width: 100%"
                    placeholder="请输入小数位数"
                    v-model={[form.dataPrecision, "value"]}
                  />
                </a-form-item>
              </a-col>
              <a-col span={12}>
                <a-form-item name="bitIndex" label="bit位">
                  <a-input-number
                    precision={0}
                    style="width: 100%"
                    placeholder="请输入bit位"
                    v-model={[form.bitIndex, "value"]}
                  />
                </a-form-item>
              </a-col>
              <a-col span={12}>
                <a-form-item name="dataLength" label="数组长度">
                  <a-input-number
                    precision={0}
                    style="width: 100%"
                    placeholder="请输入数组长度"
                    v-model={[form.dataLength, "value"]}
                  />
                </a-form-item>
              </a-col>
            </a-row>
            <div class="title flex-center">
              <div class="icon"></div>
              <div class="name">高级配置</div>
              {
                <div
                  class="fold flex"
                  onClick={() => {
                    folds.basic = !folds.basic;
                  }}
                >
                  {folds.basic ? "展开" : "折叠"}
                  {folds.basic ? <CaretRightOutlined /> : <CaretDownOutlined />}
                </div>
              }
            </div>
            {!folds.basic && (
              <>
                {form.outputTypeId === 351 && (
                  <a-row>
                    <a-col span={12}>
                      <a-form-item name="reverse" label="信号反转">
                        <a-switch v-model={[form.reverse, "checked"]} />
                      </a-form-item>
                    </a-col>
                  </a-row>
                )}
                {(form.outputTypeId === 352 || form.outputTypeId === 353) && (
                  <>
                    <a-row>
                      <a-col span={12}>
                        <a-form-item name="deadBand" label="死区范围">
                          <a-input-number
                            precision={0}
                            style="width: 100%"
                            placeholder="请输入死区范围"
                            v-model={[form.deadBand, "value"]}
                          />
                        </a-form-item>
                      </a-col>
                    </a-row>
                    <a-row>
                      <a-col span={12}>
                        <a-form-item name="deadBand" label="转换原始值">
                          <a-space>
                            <a-input-number
                              precision={0}
                              style="width: 100%"
                              v-model={[form.rawMin, "value"]}
                            />
                            -
                            <a-input-number
                              precision={0}
                              style="width: 100%"
                              v-model={[form.rawMax, "value"]}
                            />
                          </a-space>
                        </a-form-item>
                      </a-col>
                      <a-col span={12}>
                        <a-form-item name="deadBand" label="转换实际值">
                          <a-space>
                            <a-input-number
                              precision={0}
                              style="width: 100%"
                              v-model={[form.valueMin, "value"]}
                            />
                            -
                            <a-input-number
                              precision={0}
                              style="width: 100%"
                              v-model={[form.valueMax, "value"]}
                            />
                          </a-space>
                        </a-form-item>
                      </a-col>
                    </a-row>
                  </>
                )}

                {form.outputTypeId === 351 && (
                  <a-row>
                    <a-col span={24}>
                      <a-form-item
                        v-slots={{
                          label: () => (
                            <a-space>
                              脉冲信号
                              <a-tooltip title="重置时间和重置值都填了就是脉冲信号，任意一个没填都不是脉冲信号">
                                <QuestionCircleOutlined />
                              </a-tooltip>
                            </a-space>
                          ),
                        }}
                      >
                        {form.resetMillis != null || form.resetValue
                          ? "是"
                          : "否"}
                      </a-form-item>
                    </a-col>
                    <a-col span={12}>
                      <a-form-item label="重置时间" name="resetMillis">
                        <a-input-number
                          placeholder="请输入"
                          addonAfter="ms"
                          controls={false}
                          v-model:value={form.resetMillis}
                        ></a-input-number>
                      </a-form-item>
                    </a-col>
                    <a-col span={12}>
                      <a-form-item label="重置值" name="resetValue">
                        <a-input
                          placeholder="请输入"
                          v-model:value={form.resetValue}
                        ></a-input>
                      </a-form-item>
                    </a-col>
                  </a-row>
                )}

                {(form.outputTypeId === 352 || form.outputTypeId === 353) && (
                  <a-row>
                    <a-col span={12}>
                      <a-form-item
                        v-slots={{
                          label: () => (
                            <a-space>
                              有效数据范围
                              <a-tooltip title="范围大小值设置为闭区间">
                                <QuestionCircleOutlined />
                              </a-tooltip>
                            </a-space>
                          ),
                        }}
                      >
                        <a-space>
                          <a-input-number
                            precision={form.outputTypeId === 352 ? 0 : 2}
                            style="width: 100%"
                            v-model={[form.lowerLimit, "value"]}
                          />
                          -
                          <a-input-number
                            precision={form.outputTypeId === 352 ? 0 : 2}
                            style="width: 100%"
                            v-model={[form.upperLimit, "value"]}
                          />
                        </a-space>
                      </a-form-item>
                    </a-col>
                  </a-row>
                )}
              </>
            )}
          </a-form>
        </a-modal>
      );
    };
  },
});

export default TableModal;
