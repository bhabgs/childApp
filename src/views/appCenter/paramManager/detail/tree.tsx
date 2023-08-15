import { defineComponent, ref } from "vue";
import { watchOnce, watchDebounced } from "@vueuse/core";
import _ from "lodash";
import {
  SearchOutlined,
  EditOutlined,
  PlusCircleOutlined,
  DeleteOutlined,
} from "@ant-design/icons-vue";

/**
 * 左侧树结构
 */
const Tree = defineComponent({
  emits: ["select", "edit", "delete", "add"],
  props: {
    data: {
      type: Array,
      required: true,
    },
  },
  setup(props, { emit }) {
    const keyword = ref("");
    const filteredData = ref<any>([]);

    const activeNodeKey = ref();
    const expandKeys = ref<string[]>([]);

    watchOnce(
      () => props.data as any[],
      (val) => {
        if (val.length > 0) {
          expandKeys.value = [val[0].id];
        }
      }
    );

    const handleSelect = (_, { node }) => {
      // 避免重复选择
      if (activeNodeKey.value === node.id) return;

      activeNodeKey.value = node.id;
      const nodeDef = Object.assign({}, node.dataRef);
      nodeDef.parent = node.parent && node.parent.node;
      emit("select", nodeDef);
    };

    const filterData = () => {
      if (!keyword.value) {
        filteredData.value = props.data;
        return;
      }
      function filter(list: any[]) {
        const res: any[] = [];
        for (const item of list) {
          if (item.name && item.name.indexOf(keyword.value) !== -1) {
            res.push(_.omit(item, "childGroupList"));
          }
          if (Array.isArray(item.childGroupList)) {
            item.childGroupList = filter(item.childGroupList);
            if (item.childGroupList.length && !res.includes(item)) {
              res.push(item);
            }
          }
        }
        return res;
      }
      filteredData.value = filter(_.cloneDeep(props.data));
    };

    watchDebounced([keyword, () => props.data], filterData, {
      immediate: true,
      deep: true,
    });

    return () => (
      <div class="tree">
        <a-input
          class="search"
          placeholder="可搜索参数组"
          allowClear
          suffix={<SearchOutlined />}
          v-model:value={keyword.value}
        ></a-input>
        <a-tree
          blockNode
          selectable
          fieldNames={{ children: "childGroupList", key: "id", title: "name" }}
          treeData={filteredData.value}
          selectedKeys={activeNodeKey.value && [activeNodeKey.value]}
          v-model:expandedKeys={expandKeys.value}
          onSelect={handleSelect}
          v-slots={{
            title: (node) => {
              const isRoot = node.isRoot;
              const btnEdit = !isRoot && (
                <EditOutlined onClick={() => emit("edit")} />
              );
              const btnPlus = node.level !== "cell" && (
                <PlusCircleOutlined onClick={() => emit("add")} />
              );
              const btnDelete = !isRoot && (
                <DeleteOutlined onClick={() => emit("delete")} />
              );
              return (
                <div class="node-title">
                  <span>{node.name}</span>
                  {node.selected && (
                    <a-space>
                      {btnEdit}
                      {btnPlus}
                      {btnDelete}
                    </a-space>
                  )}
                </div>
              );
            },
          }}
        ></a-tree>
      </div>
    );
  },
});

export default Tree;
