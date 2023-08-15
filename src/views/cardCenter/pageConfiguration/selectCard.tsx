import { defineComponent, onMounted, ref } from "vue";
import { useTableList } from "inl-ui/dist/hooks";
import inlCard from "inl-card-linhuan-v2";
import api from "@/api/cardCenter";

export default defineComponent({
  emits: ["submit", "close"],
  setup(props, ctx) {
    const cards = ref<
      Array<{
        name: string;
        cname: string;
        developer: string;
        equipment: string;
      }>
    >([]);
    const cardCheck = ref([]);
    // table
    const { refresh, tableList } = useTableList(
      () =>
        api.cardGetList({
          pageNum: 1,
          pageSize: 999999,
        }),
      "records",
      "total"
    );
    const cardBox = (data) => {
      data.parameter = data.parameter === "" ? "{}" : data.parameter;
      let parameter = {};
      try {
        parameter = JSON.parse(data.parameter ?? "{}") ?? {};
      } catch (e) {}
      return (
        <inl-card-box
          componentName={data.reference}
          titleName={data.cardName}
          {...parameter}
        ></inl-card-box>
      );
    };
    refresh();
    onMounted(() => {
      cards.value = inlCard.cards;
    });
    return () => (
      <div class="selectCard">
        <a-checkbox-group v-model={[cardCheck.value, "value"]}>
          {tableList.value.map((item: any) => (
            <div class="selectCard-item">
              <div>
                <a-checkbox value={item}></a-checkbox>
                <span>{item.remark}</span>
              </div>
              {cardBox(item)}
            </div>
          ))}
        </a-checkbox-group>
        <div
          style={{
            display: "flex",
            marginTop: "10px",
            justifyContent: "flex-end",
          }}
        >
          <a-button
            onClick={() => {
              ctx.emit("close");
            }}
          >
            取 消
          </a-button>
          <a-button
            type="primary"
            style={{ marginLeft: "10px" }}
            onClick={() => {
              const cardList = cardCheck.value.map((item: any) => ({
                cname: item.cardName,
                name: item.reference,
                developer: item.developer,
                equipment: item.endpoint,
                parameter: item.parameter,
              }));
              ctx.emit("submit", cardList);
            }}
          >
            确 定
          </a-button>
        </div>
      </div>
    );
  },
});
