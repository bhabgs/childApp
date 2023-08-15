/**
 * 编辑页面
 */
import { defineComponent, PropType, ref, watch } from "vue";
import { Item } from "../pageConfiguration";
import SelectCard from "./selectCard";

const radioList = [
  {
    name: "样式一经典布局",
    id: "jd",
    img: "/micro-assets/platform-web/classic.png",
  },
  {
    name: "样式二左右布局",
    id: "tmgc",
    img: "/micro-assets/platform-web/leftRight.png",
  },
  {
    name: "样式三自定义布局",
    id: "custom",
    img: "/micro-assets/platform-web/custom.png",
  },
];
const props = {
  formData: {
    type: Object as PropType<Item>,
    required: true,
  },
};
export default defineComponent({
  name: "EditPage",
  emits: ["submitLayout"],
  props,
  setup(props, ctx) {
    const pageLayout = ref("jd");
    const cardVisible = ref(false);
    const pageCard = ref<{
      child?: Array<{
        gridArea?: String;
        componentInfo?: any;
      }>;
      col?: number; // 列
      row?: number; // 行
      colgap?: number; // 列间距
      rowgap?: number; // 行间距
      penetrate?: boolean; // 是否允许穿透
      pageLayout?: string;
    }>({});
    // 表单数据
    const formState = ref<Item>({});
    let addCardFun: Function;
    watch(
      () => props.formData,
      (e) => {
        if (e) {
          for (const key in e) {
            formState.value[key] = e[key];
          }
          if (e.pageDetail && e.pageDetail !== "") {
            pageCard.value = JSON.parse(e.pageDetail);
            pageLayout.value = pageCard.value.pageLayout || "jd";
          }
        }
      },
      {
        immediate: true,
        deep: true,
      }
    );
    return () => (
      <div class="editPage">
        <div class="editPage-top">
          <div class="editPage-top-header">选择页面布局</div>
          <div class="editPage-top-content">
            <a-radio-group
              v-model={[pageLayout.value, "value"]}
              name="radioGroup"
              class="editPage-top-content-radioGroup"
            >
              {radioList.map((item) => (
                <div class="editPage-top-content-radioGroup-item">
                  <img
                    src={item.img}
                    onClick={() => {
                      pageLayout.value = item.id;
                    }}
                    style={{
                      opacity: pageLayout.value === item.id ? "1" : "0.5",
                    }}
                  />
                  <a-radio value={item.id}>{item.name}</a-radio>
                </div>
              ))}
            </a-radio-group>
          </div>
        </div>
        <div class="editPage-bottom">
          <div class="editPage-bottom-header">页面预览</div>
          <div class="editPage-bottom-content">
            <inl-card-layout-editor
              layoutType={pageLayout.value}
              onAddCard={(fun) => {
                addCardFun = fun;
                cardVisible.value = true;
              }}
              col={pageCard.value.col}
              row={pageCard.value.row}
              colgap={pageCard.value.colgap}
              rowgap={pageCard.value.rowgap}
              penetrate={pageCard.value.penetrate}
              domArr={pageCard.value.child}
              onSubmit={(e) => {
                formState.value.pageDetail = JSON.stringify({
                  ...e,
                  pageLayout: pageLayout.value,
                });
                ctx.emit("submitLayout", formState.value);
              }}
            ></inl-card-layout-editor>
          </div>
        </div>
        <a-modal
          v-model={[cardVisible.value, "visible"]}
          title="选择卡片"
          width={1300}
          footer={false}
          centered={true}
          onCancel={() => {
            cardVisible.value = false;
          }}
        >
          {cardVisible.value && (
            <SelectCard
              onSubmit={(e) => {
                addCardFun(e[0])
                  .then((res) => {
                    cardVisible.value = false;
                  })
                  .catch((error) => {});
              }}
              onClose={() => {
                cardVisible.value = false;
              }}
            />
          )}
        </a-modal>
      </div>
    );
  },
});
