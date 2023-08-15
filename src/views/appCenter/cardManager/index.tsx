import { defineComponent, onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import { useModalVisible, useTableList } from "inl-ui/dist/hooks";
import { terminalList, availiableList } from "./form";
import AppCardThumbnail from "@/components/appCardThumbnail";
import AddModal from "./addModal";
import * as api from "@/api/cardCenter/cardManager";
import { Modal, message } from "ant-design-vue";

/**
 * 卡片管理
 */
const CardManager = defineComponent({
  setup() {
    const router = useRouter();
    const formRef = ref();
    const form = ref<any>({
      name: "",
      availiable: null,
      clientType: null,
    });

    const { currPage, pagination, isLoading, tableList, refresh } =
      useTableList(
        () =>
          api.getCardList({
            pageNum: currPage.value,
            pageSize: 8,
            name: form.value.name,
            clientType: form.value.clientType,
            availiable: form.value.availiable,
          }),
        "data",
        "total"
      );
    onMounted(refresh);

    const handleSearch = () => {
      currPage.value = 1;
      refresh();
    };

    const [isAddVisible, handleAddClick] = useModalVisible();

    const handleDelete = async (card) => {
      await api.deleteCardById(card.id);
      message.success("删除成功");
      refresh();
    };

    const handleEdit = (item) => {
      router.push({
        name: "cardManagerDetail",
        params: { id: item.id },
        query: {
          name: `卡片详情 ${item.name}`,
        },
      });
    };

    return () => (
      <div class="card-manager">
        <a-form ref={formRef} model={form.value}>
          <a-row>
            <a-col span={6}>
              <a-form-item label="适用终端" name="clientType">
                <a-select
                  style={{ width: "200px" }}
                  placeholder="请选择"
                  allowClear
                  options={terminalList}
                  v-model:value={form.value.clientType}
                ></a-select>
              </a-form-item>
            </a-col>
            <a-col span={6}>
              <a-form-item label="是否启用" name="available">
                <a-select
                  style={{ width: "200px" }}
                  placeholder="请选择"
                  allowClear
                  options={availiableList}
                  v-model:value={form.value.available}
                ></a-select>
              </a-form-item>
            </a-col>
            <a-col span={12}>
              <a-form-item style={{ textAlign: "right" }} name="name">
                <a-space>
                  <a-input
                    style={{ width: "200px" }}
                    placeholder="请输入卡片关键字"
                    onPressEnter={handleSearch}
                    v-model:value={form.value.name}
                  ></a-input>
                  <a-button type="primary" onClick={handleSearch}>
                    查询
                  </a-button>
                </a-space>
              </a-form-item>
            </a-col>
          </a-row>
        </a-form>

        <inl-layout-table>
          {{
            opt: () => (
              <a-space>
                <a-button type="primary" onClick={handleAddClick}>
                  新增卡片
                </a-button>
                <a-button>批量导入</a-button>
                <a-button>批量导出</a-button>
              </a-space>
            ),
            content: () => (
              <a-spin spinning={isLoading.value}>
                {tableList.value.length ? (
                  <a-row gutter={[16, 30]}>
                    {/* {tableList.value.map(() => (
                      <a-col span={6}>
                        <AppCardThumbnail
                          onDelete={() => handleDelete()}
                          onEdit={() => handleEdit({})}
                        />
                      </a-col>
                    ))} */}
                    {tableList.value.map((item) => (
                      <a-col span={6}>
                        <AppCardThumbnail
                          record={item}
                          onDelete={() => handleDelete(item)}
                          onEdit={() => handleEdit(item)}
                        />
                      </a-col>
                    ))}
                  </a-row>
                ) : (
                  <a-empty></a-empty>
                )}
              </a-spin>
            ),
          }}
        </inl-layout-table>
        <a-pagination
          class="pagination"
          {...pagination}
          pageSize={8}
          showSizeChanger={false}
        ></a-pagination>

        <AddModal onRefresh={refresh} v-model:visible={isAddVisible.value} />
      </div>
    );
  },
});

export default CardManager;
