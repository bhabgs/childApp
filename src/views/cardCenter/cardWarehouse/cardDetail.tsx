/**
 * 卡片新增/修改/详情
 */
import { defineComponent, onMounted, PropType, ref, watch } from "vue";
import { getEnByZn } from "@/utils/format";
import inlCard from "inl-card-linhuan-v2";
import { Item } from "../cardWarehouse";

export interface selectedItem {
  name: string;
  code: any;
}
const props = {
  formData: {
    type: Object as PropType<Item>,
    required: true,
  },
  disabled: {
    type: Boolean,
    default: false,
  },
  terminalList: {
    type: Array as PropType<Array<selectedItem>>,
  },
  descriptionList: {
    type: Array as PropType<Array<selectedItem>>,
    default: [],
  },
};

const rules = {
  cardName: [{ required: true, message: "请输入页面名称", trigger: "blur" }],
  reference: [{ required: true, message: "请选择适用终端", trigger: "change" }],
};

export default defineComponent({
  name: "PageDetail",
  props,
  emits: ["close", "save"],
  setup(_props, _context) {
    const formRef = ref();
    const loading = ref(false);
    const cards = ref<
      Array<{
        [key: string]: string;
      }>
    >([]);
    const cardInfo = ref<{
      [key: string]: string;
    }>({});
    // 表单数据
    const formState = ref<Item>({
      enabled: true,
    });

    // 提交
    const submit = () => {
      formRef.value.validateFields().then(async () => {
        loading.value = true;
        _context.emit("save", formState.value);
      });
    };

    const cardBox = () => {
      let parameter = {};
      try {
        parameter = JSON.parse(cardInfo.value.parameter ?? "{}") ?? {};
      } catch (e) {
        new Error("aaa");
      }
      return (
        <inl-card-box
          componentName={cardInfo.value?.name}
          titleName={cardInfo.value?.cname}
          params={{
            isInterval: false,
          }}
          {...parameter}
        ></inl-card-box>
      );
    };

    watch(
      () => _props.formData,
      (e) => {
        if (e && e.cardName) {
          for (const key in e) {
            formState.value[key] = e[key];
          }
          cardInfo.value = {
            name: e.reference || "",
            cname: e.cardName || "",
            developer: e.developer || "",
            equipment: e.equipment || "",
            parameter: e.parameter || "",
          };
        }
      },
      {
        immediate: true,
        deep: true,
      }
    );
    onMounted(() => {
      cards.value = inlCard.cards;
      formRef.value.resetFields();
    });
    return () => (
      <div class="cardDetail">
        <a-form
          ref={formRef}
          model={formState.value}
          label-col={{ span: 8 }}
          wrapper-col={{ span: 16 }}
          rules={rules}
          style={{ flex: "1" }}
        >
          <a-form-item label="引用名称" name="reference">
            <a-select
              v-model={[formState.value.reference, "value"]}
              placeholder="请选择卡片名称"
              disabled={_props.disabled}
              show-search
              filterOption={(input: string, option: any) =>
                option.value.toLowerCase().indexOf(input.toLowerCase()) >= 0
              }
              onChange={(value) => {
                cardInfo.value = {};
                setTimeout(() => {
                  cardInfo.value =
                    cards.value.find((n) => n.name === value) || {};

                  if (cardInfo.value && cardInfo.value.developer) {
                    formState.value.developer = cardInfo.value.developer;
                    formState.value.endpoint = cardInfo.value.equipment;
                    formState.value.cardName = cardInfo.value.cname;
                  }
                }, 500);
              }}
            >
              {cards.value?.map((item) => (
                <a-select-option value={item.name}>{item.name}</a-select-option>
              ))}
            </a-select>
          </a-form-item>
          <a-form-item label="纵横比例(px)">
            <a-row>
              <a-col span={11}>
                <a-input-number
                  v-model={[formState.value.length, "value"]}
                  placeholder="请输入纵"
                  disabled={_props.disabled}
                  style={{ width: "100%" }}
                />
              </a-col>
              <a-col span={2} style={{ textAlign: "center" }}>
                *
              </a-col>
              <a-col span={11}>
                <a-input-number
                  v-model={[formState.value.width, "value"]}
                  placeholder="请输入横"
                  style={{ width: "100%" }}
                  disabled={_props.disabled}
                />
              </a-col>
            </a-row>
          </a-form-item>
          <a-form-item label="适用终端" name="receiverId">
            <a-select
              v-model={[formState.value.endpoint, "value"]}
              placeholder="请选择适用终端"
              disabled={_props.disabled}
            >
              {_props.terminalList?.map((item) => (
                <a-select-option value={item.code}>{item.name}</a-select-option>
              ))}
            </a-select>
          </a-form-item>
          <a-form-item label="标签描述">
            <a-select
              v-model={[formState.value.description, "value"]}
              placeholder="请选择标签描述"
              disabled={_props.disabled}
            >
              {_props.descriptionList?.map((item) => (
                <a-select-option value={item.code}>{item.name}</a-select-option>
              ))}
            </a-select>
          </a-form-item>
          <a-form-item label="是否启用">
            <a-switch
              disabled={_props.disabled}
              v-model={[formState.value.enabled, "checked"]}
            ></a-switch>
          </a-form-item>
          <a-form-item label="卡片名称" name="cardName">
            <a-input
              v-model={[formState.value.cardName, "value"]}
              disabled={_props.disabled}
              placeholder="请输入卡片名称"
              onBlur={() => {
                cardInfo.value.cname = formState.value.cardName || "";
              }}
            />
          </a-form-item>
          <a-form-item label="开发者">
            <a-input
              v-model={[formState.value.developer, "value"]}
              disabled
              placeholder="自动识别"
            />
          </a-form-item>
          <a-form-item label="卡片参数">
            <a-textarea
              v-model={[formState.value.parameter, "value"]}
              disabled={_props.disabled}
              onChange={(e) => {
                formState.value.parameter = getEnByZn(e.target.value);
              }}
              onBlur={() => {
                cardInfo.value.parameter = formState.value?.parameter || "";
              }}
              onPressEnter={() => {
                cardInfo.value.parameter = formState.value?.parameter || "";
              }}
              rows={4}
            />
          </a-form-item>
          <a-form-item label="备注说明">
            <a-textarea
              placeholder="灰、水、硫、发热量，三种煤"
              v-model={[formState.value.remark, "value"]}
              disabled={_props.disabled}
              rows={4}
              maxlength={100}
              showCount
            />
          </a-form-item>
        </a-form>
        <div class="cardBox">
          <div class="cardBox_body">
            {cardInfo.value && cardInfo.value.name ? cardBox() : null}
          </div>
          <div style={{ textAlign: "right" }}>
            {_props.disabled ? null : (
              <>
                <a-button
                  style={{ marginRight: "20px" }}
                  onClick={() => {
                    _context.emit("close");
                  }}
                >
                  取消
                </a-button>
                <a-button type="primary" onClick={submit}>
                  保存
                </a-button>
              </>
            )}
          </div>
        </div>
      </div>
    );
  },
});
