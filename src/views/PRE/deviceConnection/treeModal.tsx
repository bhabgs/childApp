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
import { Session } from "inspector";
import dayjs from "dayjs";

/*
 * 新建 更新 部门对话框
 */
const treeModal = defineComponent({
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
    onRefresh: {
      type: Function,
    },
  },
  setup(props, { emit }) {
    const visible = useVModel(props, "visible", emit);

    let form = reactive({
      pduName: "",
      pduCode: "",
      linkTypeId: null,
      protocolTypeId: null,
      deviceTypeId: null,
      scanTypeId: null,
      url: null,
      available: true,
      scanRate: 200,
      addressOffset: 0,
      connectTimeout: 1500,
      retryInterval: 1500,
      comment: null,
    });
    const folds = reactive({
      basic: false,
    });
    const loading = ref(false);
    const formRef = ref();
    const regexp = ref<{
      example: string;
      regular: any;
      describe: string;
    }>({
      example: "",
      regular: null,
      describe: "",
    });
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
    const dynamicValidator = (_rule: any, value: string) => {
      if (value && regexp.value.regular) {
        if (value.match(regexp.value.regular)) {
          return Promise.resolve();
        } else {
          return Promise.reject(regexp.value.describe);
        }
      }
      return Promise.resolve();
      // else {
      //   return Promise.resolve();
      // }
    };
    /* ===== 下拉列表 ===== */
    let selectList = ref({
      /* 查询设备，协议，连接，扫描类型 */
      deviceType: [],
      protocolType: [],
      linkType: [],
      scanType: [],
    });
    const getSelectList = async () => {
      const { data } = await api.getPduLinkerType();
      selectList.value = data;
      if (props.mode !== "edit") {
        form.protocolTypeId = data.protocolType[0].id || "";
        form.deviceTypeId = data.deviceType[0].id || "";
        form.linkTypeId = data.linkType[0].id || "";
        form.scanTypeId = data.scanType[0].id || "";
      }
      return data;
    };
    const getDetail = async () => {
      loading.value = true;
      try {
        const { data } = await api.getPduLinkerDescById(props.record.pduId);
        data.available = data.available ? true : false;
        form = Object.assign(form, data);
      } catch (error) {
        message.error(error?.message ? error.message : "程序异常");
      }
      loading.value = false;
    };
    const restForm = () => {
      Object.keys(form).map((key) => {
        if (key === "available") form[key] = true;
        else if (key === "addressOffset") form[key] = 0;
        else if (key === "scanRate") form[key] = 200;
        else if (key === "retryInterval" || key === "connectTimeout")
          form[key] = 1500;
        else form[key] = null;
      });
      regexp.value = {
        regular: "",
        describe: "",
        example: "",
      };
      formRef.value.clearValidate();
      visible.value = false;
    };
    watch(
      () => props.visible,
      async (e) => {
        visible.value = e;
        if (e) {
          getSelectList().then((data) => {
            if (props.mode !== "edit")
              deviceTypeChange().finally(() => {
                form.protocolTypeId = data.protocolType[0]?.id || "";
                geturl();
              });
          });
          if (props.mode === "edit")
            getDetail().finally(() => {
              deviceTypeChange();
            });
        }
      },
      {
        immediate: true,
      }
    );
    const deviceTypeChange = async () => {
      if (!form.deviceTypeId) return;
      try {
        const { data } = await api.getProtocolTypeByDevice(form.deviceTypeId);
        if (props.mode !== "edit") form.protocolTypeId = null;
        selectList.value.protocolType = data || [];
      } catch (error: any) {
        message.error(error?.message ? error.message : "程序异常");
      }
    };
    const geturl = async () => {
      if (!form.deviceTypeId || !form.protocolTypeId) return;
      try {
        const { data } = await api.getUrlItem({
          protocolTypeId: form.protocolTypeId,
          linkTypeId: form.linkTypeId,
          deviceTypeId: form.deviceTypeId,
        });
        form.url = data?.example || "";
        if (data?.example) formRef.value.clearValidate("url");
        regexp.value = {
          regular: data?.regular || "",
          describe: data?.describe || "",
          example: data?.example || "",
        };
      } catch (error: any) {
        // regexp.value.regular = /^[A-Za-z0-9_-]+?$/;
        // message.error(error?.message ? error.message : "程序异常");
      }
    };
    const checkPduConn = async () => {
      loading.value = true;
      try {
        await api.checkPduConn(form.pduId);
        message.success("连接测试成功");
      } catch (error: any) {
        message.error(error?.message ? error.message : "连接测试失败");
      }
      loading.value = false;
    };
    /* 保存 */
    const handleSave = async () => {
      await formRef.value.validate();
      loading.value = true;
      try {
        const data = {
            ...form,
            available: form.available ? 1 : 0,
          },
          userId = JSON.parse(sessionStorage.getItem("userinfo") || "")?.userId;
        if (props.mode === "add") {
          await api.createPduLinkerByPre({
            ...data,
            createUserId: userId,
            // preCode: props.record.pduName,
          });
          message.success("添加成功");
        } else if (props.mode === "edit") {
          const res = await api.editPduItem({
            ...data,
            updateUserId: userId,
          });
          message.success("修改成功");
        }
        restForm();
        props.onRefresh?.();
      } catch (error) {
        if (!error.message)
          message.error(props.mode === "edit" ? "修改失败" : "添加失败");
      }
      loading.value = false;
    };

    return () => {
      return (
        <a-modal
          maskClosable={false}
          wrapClassName="table-dialog"
          title={"协议数据单元"}
          centered
          v-model={[visible.value, "visible"]}
          width={"50%"}
          onOk={handleSave}
          onCancel={() => {
            restForm();
          }}
          v-slots={{
            footer: () => (
              <a-space>
                {/* <a-button disabled={loading.value} onClick={checkPduConn}>
                  连接测试
                </a-button> */}
                <a-button
                  disabled={loading.value}
                  type="primary"
                  onClick={handleSave}
                >
                  保存
                </a-button>
                <a-button
                  onClick={() => {
                    restForm();
                  }}
                >
                  关闭
                </a-button>
              </a-space>
            ),
          }}
        >
          <a-spin spinning={loading.value}>
            <a-form ref={formRef} labelCol={{ span: 8 }} model={form}>
              <div class="title flex-center">
                <div class="icon"></div>
                <div class="name">基础信息</div>
              </div>
              <a-row>
                <a-col span={12}>
                  <a-form-item name="pduName" required label="名称">
                    <a-input
                      onChange={() => {
                        if (props.mode === "add") {
                          if (/^[A-Za-z0-9_-]+?$/.test(form.pduName))
                            form.pduCode = form.pduName;
                          else form.pduCode = `${dayjs().unix()}`;
                        }
                      }}
                      allow-clear
                      maxlength={225}
                      placeholder="请输入名称"
                      v-model={[form.pduName, "value"]}
                    />
                  </a-form-item>
                </a-col>
                <a-col span={12}>
                  <a-form-item
                    name="pduCode"
                    v-slots={{
                      label: () => {
                        return (
                          <a-space>
                            编码
                            <a-tooltip title="支持数字、大小写字母和_ -">
                              <QuestionCircleOutlined />
                            </a-tooltip>
                          </a-space>
                        );
                      },
                    }}
                    rules={getRequiredRule(
                      "编码",
                      codeCharacterValidator,
                      false
                    )}
                  >
                    <a-input
                      allow-clear
                      placeholder="请输入编码"
                      maxlength={128}
                      v-model={[form.pduCode, "value"]}
                    />
                  </a-form-item>
                </a-col>
                <a-col span={12}>
                  <a-form-item name="deviceTypeId" label="设备类型">
                    <a-select
                      show-search
                      allowClear
                      v-model={[form.deviceTypeId, "value"]}
                      placeholder="请选择设备类型"
                      onChange={() => {
                        deviceTypeChange();
                        geturl();
                      }}
                    >
                      {(selectList.value.deviceType || []).map((item: any) => (
                        <a-select-option key={item.id}>
                          {item.name}
                        </a-select-option>
                      ))}
                    </a-select>
                  </a-form-item>
                </a-col>
                <a-col span={12}>
                  <a-form-item name="protocolTypeId" label="协议类型">
                    <a-select
                      show-search
                      allowClear
                      v-model={[form.protocolTypeId, "value"]}
                      placeholder="请选择协议类型"
                      onChange={() => geturl()}
                      filterOption={false}
                      options={selectList.value.protocolType}
                      field-names={{ label: "name", value: "id" }}
                    ></a-select>
                  </a-form-item>
                </a-col>
                <a-col span={12}>
                  <a-form-item name="available" label="是否启用">
                    {props.mode === "add" ? (
                      <a-switch v-model={[form.available, "checked"]} />
                    ) : (
                      <a-popconfirm
                        v-slots={{
                          title: () => (
                            <>
                              {`确认${!form.available ? "启用" : "停用"}？`}
                              <p>请再次确保生产现场安全</p>
                            </>
                          ),
                        }}
                        placement="right"
                        onConfirm={async () => {
                          /* pduConnState	1,启用PDU，2停用PDU，3，刷新重连PDU */
                          loading.value = true;
                          try {
                            await api.editPduConn({
                              pduConnState: !form.available ? 1 : 2,
                              pduId: props.record.pduId,
                            });
                            message.success(
                              `${!form.available ? "启用" : "停用"}成功`
                            );
                            form.available = !form.available;
                          } catch (error) {
                            message.error(
                              error?.message ? error.message : "程序异常"
                            );
                          }
                          loading.value = false;
                        }}
                      >
                        <a-switch
                          onChange={() => {
                            form.available = !form.available;
                          }}
                          v-model={[form.available, "checked"]}
                        />
                      </a-popconfirm>
                    )}
                  </a-form-item>
                </a-col>
              </a-row>
              <div class="title flex-center">
                <div class="icon"></div>
                <div class="name">连接信息</div>
              </div>
              <a-row>
                <a-col span={12}>
                  <a-form-item
                    name="url"
                    label="连接地址"
                    required
                    rules={getRequiredRule("连接地址", dynamicValidator)}
                  >
                    <a-tooltip title={regexp.value.describe}>
                      <a-input
                        placeholder="请输入连接地址"
                        v-model={[form.url, "value"]}
                      />
                    </a-tooltip>
                  </a-form-item>
                </a-col>
                <a-col span={12}>
                  <a-form-item name="scanRate" label="扫描周期">
                    <a-input-number
                      addon-after="ms"
                      placeholder="请输入扫描周期"
                      precision={0}
                      style="width: 100%"
                      v-model={[form.scanRate, "value"]}
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
                    {folds.basic ? (
                      <CaretRightOutlined />
                    ) : (
                      <CaretDownOutlined />
                    )}
                  </div>
                }
              </div>
              {!folds.basic && (
                <a-row>
                  <a-col span={12}>
                    <a-form-item name="linkTypeId" label="连接类型">
                      <a-select
                        show-search
                        allowClear
                        v-model={[form.linkTypeId, "value"]}
                        placeholder="请选择连接类型"
                      >
                        {(selectList.value.linkType || []).map((item: any) => (
                          <a-select-option key={item.id}>
                            {item.name}
                          </a-select-option>
                        ))}
                      </a-select>
                    </a-form-item>
                  </a-col>
                  <a-col span={12}>
                    <a-form-item name="scanTypeId" label="扫描类型">
                      <a-select
                        show-search
                        allowClear
                        v-model={[form.scanTypeId, "value"]}
                        placeholder="请选择扫描类型"
                      >
                        {(selectList.value.scanType || []).map((item: any) => (
                          <a-select-option key={item.id}>
                            {item.name}
                          </a-select-option>
                        ))}
                      </a-select>
                    </a-form-item>
                  </a-col>
                  <a-col span={12}>
                    <a-form-item name="addressOffset" label="地址偏移">
                      <a-input-number
                        precision={0}
                        style="width: 100%"
                        placeholder="请输入地址偏移"
                        v-model={[form.addressOffset, "value"]}
                      />
                    </a-form-item>
                  </a-col>
                  <a-col span={12}>
                    <a-form-item name="connectTimeout" label="超时时间">
                      <a-input-number
                        addon-after="ms"
                        precision={0}
                        placeholder="请输入超时时间"
                        style="width: 100%"
                        v-model={[form.connectTimeout, "value"]}
                      />
                    </a-form-item>
                  </a-col>
                  <a-col span={12}>
                    <a-form-item name="" label="重试间隔">
                      <a-input-number
                        addon-after="ms"
                        precision={0}
                        placeholder="请输入重试间隔"
                        style="width: 100%"
                        v-model={[form.retryInterval, "value"]}
                      />
                    </a-form-item>
                  </a-col>
                  <a-col span={24}>
                    <a-form-item labelCol={{ span: 4 }} name="" label="备注">
                      <a-textarea
                        placeholder="请输入备注"
                        v-model={[form.comment, "value"]}
                      />
                    </a-form-item>
                  </a-col>
                </a-row>
              )}
            </a-form>
          </a-spin>
        </a-modal>
      );
    };
  },
});

export default treeModal;
