import {
  PropType,
  defineComponent,
  onMounted,
  ref,
  watchPostEffect,
} from "vue";
import { useRoute } from "vue-router";
import _ from "lodash";
import { SearchOutlined } from "@ant-design/icons-vue";
import api from "@/api/PRE";

export default defineComponent({
  name: "foreign-opcua-detail",
  emits: ["ok", "update:visible"],
  props: {
    visible: {
      type: Boolean,
      default: false,
    },
    defaultChecked: {
      type: Array as PropType<string[]>,
      default: () => [],
    },
  },
  setup(props, ctx) {
    const tree = ref();
    const keywordTree = ref("");
    const checkedKeys = ref<string[]>([]);
    const { params } = useRoute();
    const getTree = async () => {
      const { data } = await api.getPreTreeByUser(params.id, keywordTree.value);
      tree.value = [
        {
          code: "root",
          codeList: data[0].codeList,
        },
      ];
      // 设置默认选中
      const keys: string[] = [];
      function setKeys(list) {
        for (const code of list) {
          if (Array.isArray(code.codeList)) {
            setKeys(code.codeList);
          } else if (code.select === 1) {
            keys.push(code.code);
          }
        }
      }
      setKeys(tree.value);
      checkedKeys.value = keys;
    };
    const keywordTag = ref("");
    const filterTagList = ref<string[]>([]);
    watchPostEffect(() => {
      if (!keywordTag.value) {
        filterTagList.value = checkedKeys.value;
      } else {
        filterTagList.value = checkedKeys.value.filter(
          (item) => item.indexOf(keywordTag.value) !== -1
        );
      }
    });

    onMounted(() => {
      getTree();
    });

    const handleSelect = (keys, { checked, node }) => {
      function getLeaf(node) {
        if (Array.isArray(node.codeList)) {
          const res: any[] = [];
          for (const n of node.codeList) {
            res.push(...getLeaf(n));
          }
          return res;
        }
        return [node.code];
      }
      const checkNodeList = getLeaf(node);
      if (checked) {
        checkedKeys.value.push(...checkNodeList);
        checkedKeys.value = _.uniq(checkedKeys.value);
      } else {
        checkedKeys.value = checkedKeys.value.filter(
          (key) => !checkNodeList.includes(key)
        );
      }
    };

    ctx.expose({
      save() {
        return api.createCodeWithUser(checkedKeys.value, params.id);
      },
    });
    return () => (
      <div class="addTagBox">
        <div class="left">
          <a-input-search
            v-model:value={keywordTree.value}
            onSearch={getTree}
            placeholder="请输入关键字"
          />
          <a-tree
            checkedKeys={checkedKeys.value}
            checkable
            height={400}
            fieldNames={{
              children: "codeList",
              title: "code",
              key: "code",
            }}
            tree-data={tree.value}
            onCheck={handleSelect}
          />
        </div>
        <div class="right">
          <div>
            <span>已选标签:(已选择{checkedKeys.value?.length})</span>
            <span>
              <a-button
                onClick={() => {
                  checkedKeys.value = [];
                }}
                type="link"
              >
                清空
              </a-button>
            </span>
          </div>
          <a-input
            placeholder="请输入关键字"
            suffix={<SearchOutlined />}
            allowClear
            v-model:value={keywordTag.value}
          />

          <a-space
            style={{ flexWrap: "wrap", maxHeight: "370px", overflowY: "auto" }}
          >
            {filterTagList.value?.map((item) => (
              <a-tag
                key={item}
                closable
                onClose={() => {
                  const index = checkedKeys.value.findIndex(
                    (key) => key === item
                  );
                  if (index !== -1) {
                    checkedKeys.value.splice(index, 1);
                  }
                }}
              >
                {item}
              </a-tag>
            ))}
          </a-space>
        </div>
      </div>
    );
  },
});
