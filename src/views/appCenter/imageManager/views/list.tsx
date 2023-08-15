import { defineComponent, onMounted, ref, watch } from "vue";
import { CopyOutlined } from "@ant-design/icons-vue";
import { useClipboard } from "@vueuse/core";
import { Modal, message } from "ant-design-vue";
import * as api from "@/api/appCenter/imageManager";
import useTableList from "@/hooks/useTableList";

const columns = [
  { title: "预览图", key: "thumbnail", width: 200 },
  { title: "图片名称", dataIndex: "name", ellipsis: true },
  { title: "图片宽度(px)", dataIndex: "width", width: 140 },
  { title: "图片高度(px)", dataIndex: "height", width: 140 },
  { title: "图片路径", dataIndex: "url", key: "path", ellipsis: true },
  { title: "详情描述", dataIndex: "description", ellipsis: true },
  { title: "操作", key: "action", width: 260 },
];

/**
 * 列表视图
 */
const List = defineComponent({
  props: {
    query: {
      type: Object,
      required: true,
    },
  },
  setup(props, { expose }) {
    const listRef = ref();

    const { currPage, pageSize, pagination, isLoading, tableList, refresh } =
      useTableList(
        () =>
          api.getImageList({
            pageNum: currPage.value,
            pageSize: pageSize.value,
            imageType: props.query.imageType,
            name: props.query.name,
            widthMin: props.query.widthMin,
            widthMax: props.query.widthMax,
          }),
        "data",
        "total"
      );
    onMounted(refresh);

    const selectKeys = ref([]);

    const { copy } = useClipboard({ legacy: true });
    const handleCopy = (row) => {
      copy(row.url).then(() => {
        message.success("复制成功");
      });
    };

    const handlePreview = (index) => {
      const imageEl = listRef.value.querySelector(
        `.ant-table-tbody > .ant-table-row-level-0:nth-of-type(${
          index + 2
        }) .ant-image`
      );
      if (imageEl) {
        imageEl.click();
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

    watch(
      () => props.query,
      () => {
        currPage.value = 1;
        refresh();
      }
    );

    expose({
      refresh,
      selectKeys,
    });

    return () => (
      <div class="list-container" ref={listRef}>
        <a-table
          rowKey="id"
          loading={isLoading.value}
          pagination={pagination}
          columns={columns}
          dataSource={tableList.value}
          rowSelection={{
            preserveSelectedRowKeys: true,
            selectedRowKeys: selectKeys.value,
            onChange: (keys) => (selectKeys.value = keys),
          }}
        >
          {{
            bodyCell: ({ column, record, index }) => {
              if (column.key === "thumbnail") {
                return (
                  <a-image
                    class="image"
                    height={85}
                    width={150}
                    src={record.url}
                  ></a-image>
                );
              }
              // if (column.key === "path") {
              //   return (
              //     <a-space>
              //       <span>{record.url}</span>
              //       <CopyOutlined onClick={() => handleCopy(record)} />
              //     </a-space>
              //   );
              // }
              if (column.key === "action") {
                return (
                  <>
                    <a-button
                      type="link"
                      size="small"
                      onClick={() => handlePreview(index)}
                    >
                      预览
                    </a-button>
                    <a-button
                      type="link"
                      size="small"
                      onClick={() => handleCopy(record)}
                    >
                      复制图片路径
                    </a-button>
                    <a-button
                      type="link"
                      size="small"
                      onClick={() => handleDelete(record)}
                    >
                      删除
                    </a-button>
                  </>
                );
              }
            },
          }}
        </a-table>
      </div>
    );
  },
});

export default List;
