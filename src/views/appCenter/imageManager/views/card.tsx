import useTableList from "@/hooks/useTableList";
import { defineComponent, onMounted, ref, watch } from "vue";
import CardItem from "../components/cardItem";
import * as api from "@/api/appCenter/imageManager";
import { Modal, message } from "ant-design-vue";

const Card = defineComponent({
  props: {
    query: {
      type: Object,
      required: true,
    },
  },
  setup(props, { expose }) {
    const { currPage, refresh, isLoading, tableList, pagination } =
      useTableList(
        () =>
          api.getImageList({
            pageNum: currPage.value,
            pageSize: 18,
            imageType: props.query.imageType,
            name: props.query.name,
            widthMin: props.query.widthMin,
            widthMax: props.query.widthMax,
          }),
        "data",
        "total"
      );
    onMounted(refresh);

    watch(
      () => props.query,
      () => {
        currPage.value = 1;
        refresh();
      }
    );

    const selectKeys = ref<string[]>([]);
    const onSelect = (record) => {
      const idx = selectKeys.value.findIndex((key) => key === record.id);
      if (idx > -1) {
        selectKeys.value.splice(idx, 1);
      } else {
        selectKeys.value.push(record.id);
      }
    };

    const handleDelete = (row) => {
      Modal.confirm({
        title: "提示",
        content: `确定删除图片“${row.name}”吗？`,
        async onOk() {
          await api.deleteImage(row.id);
          message.success("删除成功");
          refresh();
        },
      });
    };

    expose({
      refresh,
      selectKeys,
    });

    return () => {
      const list = (
        <a-spin wrapperClassName="spin" spinning={isLoading.value}>
          {tableList.value.length > 0 ? (
            <a-row gutter={[16, 16]} style={{ width: "100%" }}>
              {tableList.value.map((item: any) => (
                <a-col key={item.id} span={4}>
                  <CardItem
                    record={item}
                    selected={selectKeys.value.includes(item.id)}
                    onClick={() => onSelect(item)}
                    onDelete={() => handleDelete(item)}
                  />
                </a-col>
              ))}
            </a-row>
          ) : (
            <a-empty></a-empty>
          )}
        </a-spin>
      );

      return (
        <div class="card-view">
          {list}
          <a-pagination
            class="pagination"
            {...pagination}
            showSizeChanger={false}
            pageSize={18}
            align="right"
          ></a-pagination>
        </div>
      );
    };
  },
});

export default Card;
