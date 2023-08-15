import { defineComponent, ref, onMounted, watch } from "vue";
import { message } from "ant-design-vue";
import { transformDragData } from "./utils";
import {
  SearchOutlined,
  EditOutlined,
  DeleteOutlined,
  PlusCircleOutlined,
  HolderOutlined,
} from "@ant-design/icons-vue";

import "@/assets/style/components/flowTree.less";
import { Modal } from "ant-design-vue";

import * as api from "@/api/processCenter/formdataManager";

import EditCategoryModal from "./editCategoryModal";

const defaultFieldNames = {
  title: "name",
  key: "id",
  children: "defStandardFormItemCategoryList",
};

/**
 * 流程中心 - 树结构
 */
const FlowTree = defineComponent({
  emits: ["search", "nodeSelect", "deleteNode", "editNode", "sort", "add"],
  setup(props, { emit, expose }) {
    // tree
    const categoryList = ref<any[]>([]);
    const categoryListOrigin = ref<any[]>([]);

    const getCategory = async () => {
      const { data } = await api.getCategoryTree({});
      categoryListOrigin.value = [data];
      categoryList.value = [data];
    };

    onMounted(() => {
      getCategory();
    });

    const keyword = ref("");

    const activeKey = ref([]);
    const draggable = ref(false);

    // 选中
    const handleSelect = (node: any) => {
      if (node.length) {
        emit("nodeSelect", node);
        activeKey.value = node;
      }
    };

    // 拖拽
    const handleDrag = (e: any) => {
      const dragEndData = transformDragData(e, categoryList.value, {
        key: "id",
        children: "defStandardFormItemCategoryList",
      });
      emit("sort", dragEndData);
    };

    // 增删改
    const isEdit = ref(false);
    const isEditCategoryShow = ref(false);

    const handleAdd = (node) => {
      isEdit.value = false;
      categoryRecord.value = node;
      isEditCategoryShow.value = true;
    };

    const categoryRecord = ref<any>();
    const handleEdit = (node: any) => {
      isEdit.value = true;
      categoryRecord.value = node;
      isEditCategoryShow.value = true;
    };

    const handleDeleteCategory = async (data: any) => {
      const resp = await api.categoryRemove(data.id);

      if (resp.message === "OK") {
        message.success("删除成功");
        getCategory();
      }
    };

    const handleDelete = (node) => {
      Modal.confirm({
        title: "提示",
        content: `确定删除节点“${node.name}”吗`,
        onOk() {
          handleDeleteCategory(node);
        },
      });
    };

    const filter = (data: any[]) => {
      const newArr: any[] = [];
      data?.forEach((item) => {
        const name = item[defaultFieldNames.title];
        if (name && name.indexOf(keyword.value) > -1) {
          newArr.push({
            ...item,
            [defaultFieldNames.children]: filter(
              item[defaultFieldNames.children]
            ),
          });
        } else if (
          item[defaultFieldNames.children] &&
          item[defaultFieldNames.children].length > 0
        ) {
          const subs = filter(item[defaultFieldNames.children]);
          if (subs?.length > 0) {
            newArr.push({
              ...item,
              [defaultFieldNames.children]: subs,
            });
          }
        }
      });
      return newArr;
    };

    let timer: any = null;
    const debounce = (fn: () => void, delay = 500) => {
      if (timer) {
        clearTimeout(timer);
      }
      timer = setTimeout(() => {
        fn();
      }, delay);
    };

    watch(
      () => keyword.value,
      (value) => {
        if (value.trim() === "") {
          categoryList.value = categoryListOrigin.value;
        } else {
          debounce(() => {
            categoryList.value = filter(categoryListOrigin.value);
          });
        }
      }
    );

    return () => (
      <div class="flow-tree">
        <div class="search flex">
          <div class="inputSearch">
            <a-input
              placeholder="请输入关键字"
              allowClear
              suffix={<SearchOutlined />}
              v-model={[keyword.value, "value"]}
            ></a-input>
          </div>

          {categoryList.value.length > 0 && (
            <a-tree
              class="myTree"
              defaultExpandAll
              showLine
              blockNode
              fieldNames={defaultFieldNames}
              draggable={draggable.value}
              treeData={categoryList.value}
              selectedKeys={activeKey.value}
              onSelect={handleSelect}
              onDrop={handleDrag}
            >
              {{
                title: ({ selected, data }) => (
                  <div class="node-title">
                    <span class="name">{data.name}</span>
                    {selected && (
                      <span class="operation">
                        <EditOutlined onClick={() => handleEdit(data)} />
                        <DeleteOutlined onClick={() => handleDelete(data)} />
                        <PlusCircleOutlined onClick={() => handleAdd(data)} />
                        {/* <HolderOutlined
                          onMouseenter={() => (draggable.value = true)}
                          onMouseleave={() => (draggable.value = false)}
                        /> */}
                      </span>
                    )}
                  </div>
                ),
              }}
            </a-tree>
          )}
        </div>

        <EditCategoryModal
          v-model={[isEditCategoryShow.value, "visible"]}
          isEdit={isEdit.value}
          onRefreshTree={getCategory}
          record={categoryRecord.value}
        />
      </div>
    );
  },
});

export default FlowTree;
