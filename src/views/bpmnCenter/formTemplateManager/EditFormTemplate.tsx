import { defineComponent, ref, watch } from "vue";
import FormdataList from "./FormdataList";
import { message } from "ant-design-vue";
import "@/assets/style/pages/bpmnCenter/FormTemplateManager/EditFormTemplateModal.less";

import typeList from "@/views/bpmnCenter/typeList";

import * as api from "@/api/processCenter/formTemplateManager";

const columns = [
  {
    dataIndex: "itemId",
    title: "字段ID",
  },
  {
    dataIndex: ["defStandardFormItem", "name"],
    title: "字段名称",
  },
  {
    key: "displayType",
    title: "字段类型",
  },
  {
    key: "required",
    title: "是否必填",
  },
  {
    title: "操作",
    key: "operation",
    fixed: "right",
    width: 200,
  },
];

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
    currentTemplate: {
      type: Object,
      default: () => ({}),
    },
  },

  emits: ["update:showEdit", "refresh"],
  setup(props, context) {
    const isLoading = ref(false);

    const formRef = ref();
    const formState = ref<any>({
      categoryId: "",
      name: "",
      defFormTemplateItemList: [],
    });

    watch(
      () => props.showEdit,
      async (nVal) => {
        if (nVal) {
          if (props.currentTemplate) {
            const resp = await api.templateFindById(props.currentTemplate.id);
            formState.value = resp.data;
          } else {
            formState.value = {
              categoryId: props.activeCategory,
              name: "",
              defFormTemplateItemList: [],
            };
          }
        }
      }
    );

    const ok = async () => {
      // {
      //   // categoryId: "1612633287030296578",
      //   defFormTemplateItemList: [
      //     {
      //       itemId: "1619148192097468418",
      //       required: true,
      //       sortId: 1,
      //     },
      //   ],
      //   name: "表单模板",
      // }
      await formRef.value.validate();

      formState.value.defFormTemplateItemList.forEach((item, index) => {
        item.sortId = index + 1;
      });

      const resp = api.defFormTemplateSave(formState.value);

      if (resp.message === "OK") {
        message.success("保存成功");
      }

      cancelModal();
      context.emit("refresh");
    };

    const cancelModal = () => {
      context.emit("update:showEdit", false);
    };

    const showList = ref(false);

    // dir上移1，下移0
    const moveList = (curIndex, dir) => {
      const nextIndex = dir === 1 ? curIndex - 1 : curIndex + 1;
      let arr = formState.value.defFormTemplateItemList;
      arr[curIndex] = arr.splice(nextIndex, 1, arr[curIndex])[0];
      formState.value.defFormTemplateItemList = arr;
    };

    return () => (
      <div class="EditFormTemplate">
        <a-modal
          title={(props.currentTemplate ? "编辑" : "新增") + "表单模板"}
          width="800px"
          v-model={[props.showEdit, "visible"]}
          centered
          wrapClassName="EditFormTemplateModal"
          onCancel={cancelModal}
          v-slots={{
            footer: () => (
              <div class="modal_footer">
                <a-button onClick={cancelModal}>取消</a-button>

                <a-button type="primary" onClick={ok}>
                  确定
                </a-button>
              </div>
            ),
          }}
        >
          <div class="pageContent">
            <a-form
              class="dataform"
              // label-col={{ style: { width: "100px" } }}
              wrapper-col={{ span: 16 }}
              model={formState.value}
              ref={formRef}
            >
              <a-form-item
                label="模板名称"
                name="name"
                rules={[{ required: true, message: "请输入" }]}
              >
                <a-input
                  v-model={[formState.value.name, "value"]}
                  style="width:200px"
                  allowClear
                />
              </a-form-item>
            </a-form>

            <a-button
              type="primary"
              onClick={() => {
                showList.value = true;
              }}
              style="margin-bottom: 8px"
            >
              添加表单字段
            </a-button>

            <a-table
              dataSource={formState.value.defFormTemplateItemList}
              columns={columns}
              pagination={false}
              loading={isLoading.value}
              rowKey="id"
              class="FormTemplateTable"
              v-slots={{
                bodyCell: ({ column, record, index }: any) => {
                  if (column.key === "displayType") {
                    return typeList.find(
                      (type) =>
                        type.value === record.defStandardFormItem?.displayType
                    )?.label;
                  }

                  if (column.key === "required") {
                    return (
                      <a-checkbox
                        v-model={[record.required, "checked"]}
                      ></a-checkbox>
                    );
                  }

                  // 操作
                  if (column.key === "operation") {
                    return (
                      <div class="operation flex">
                        <a-button
                          type="link"
                          size="small"
                          disabled={index === 0}
                          onClick={() => {
                            moveList(index, 1);
                          }}
                        >
                          上移
                        </a-button>
                        <a-button
                          type="link"
                          size="small"
                          disabled={
                            index ===
                            formState.value.defFormTemplateItemList.length - 1
                          }
                          onClick={() => {
                            moveList(index, 0);
                          }}
                        >
                          下移
                        </a-button>

                        <a-popconfirm
                          title="确认删除？"
                          onConfirm={() => {
                            formState.value.defFormTemplateItemList.splice(
                              index,
                              1
                            );
                          }}
                        >
                          <a-button type="link" size="small">
                            删除
                          </a-button>
                        </a-popconfirm>
                      </div>
                    );
                  }
                },
              }}
            ></a-table>
          </div>
        </a-modal>

        <FormdataList
          v-models={[[showList.value, "showList"]]}
          onAddTemplateItemList={(list) => {
            const newList = list.map((item) => {
              return {
                defStandardFormItem: item,
                itemId: item.id,
                required: true,
              };
            });

            formState.value.defFormTemplateItemList = [
              ...formState.value.defFormTemplateItemList,
              ...newList,
            ];
          }}
        />
      </div>
    );
  },
});
