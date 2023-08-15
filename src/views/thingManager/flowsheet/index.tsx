import { defineComponent, ref, onActivated, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import { filter, includes, map } from "lodash";
import { PlusOutlined } from "@ant-design/icons-vue";
import * as topoMapAPI from "@/api/topoMap";
import Item from "./item";
import { message } from "ant-design-vue";

export default defineComponent({
  props: {
    type: {
      type: String,
      default: "device_connect",
    },
  },
  setup(props) {
    const router = useRouter();

    // 搜索
    const searchText = ref("");

    // 列表数据
    const list = ref<topoMapAPI.TopoMap[]>([]);

    // 获取列表数据
    const getList = () => {
      topoMapAPI.getList(props.type).then(({ data }) => {
        list.value = data;
      });
    };
    // 过滤列表数据
    const filteredList = computed(() => {
      if (searchText.value) {
        return filter(list.value, (item) =>
          includes(item.title, searchText.value)
        );
      }
      return list.value;
    });
    // onMounted(() => {
    //   getList();
    // });
    onActivated(() => {
      getList();
    });

    const title = computed(() => {
      if (props.type === "device_connect") {
        return "设备流程图";
      }
      if (props.type === "process_connect") {
        return "工艺流程图";
      }
    });

    // 新建
    const add = () => {
      const theme = props.type === "process_connect" ? "light" : "dark";
      topoMapAPI
        .add({
          title: `新建${title.value}`,
          functionCode: props.type,
          width: 1920,
          height: 1080,
          theme,
          playBackEnable: false,
          mainMapFlag: false,
        })
        .then(({ data }) => {
          router.push({
            name: "flowsheetEdit",
            params: { type: props.type, id: data },
            query: { name: `新建${title.value}` },
          });
        })
        .catch(() => {
          message.error("新建失败，请稍后重试");
        });
    };

    // 编辑
    const edit = ({ id, title }: topoMapAPI.TopoMap) => {
      router.push({
        name: "flowsheetEdit",
        params: { type: props.type, id },
        query: { name: `编辑_${title}` },
      });
    };

    // 预览
    const preview = ({ id, title }: topoMapAPI.TopoMap) => {
      router.push({
        name: "flowsheetPreview",
        params: { type: props.type, id },
        query: { name: `预览_${title}` },
      });
    };

    // 删除
    const handleDelete = (id: string) => {
      topoMapAPI.remove(id).then(() => {
        message.success("删除成功");
        getList();
      });
    };

    return () => (
      <div class="topo-list">
        <div class="topo-list-header">
          <div class="topo-list-title">{title.value}中心</div>
          <div class="topo-list-search">
            <a-input-search
              placeholder={`搜索${title.value}名称`}
              allowClear
              v-model={[searchText.value, "value"]}
            ></a-input-search>
          </div>
        </div>
        <div class="topo-list-content">
          <a-row>
            <a-col>
              <div class="topo-list-item" onClick={add}>
                <div class="topo-list-create">
                  <PlusOutlined></PlusOutlined>
                  <div class="topo-list-link">新建{title.value}</div>
                </div>
              </div>
            </a-col>
            {!!filteredList.value.length &&
              map(filteredList.value, (item) => (
                <a-col>
                  <Item
                    type={props.type}
                    data={item}
                    onPreview={() => preview(item)}
                    onEdit={() => edit(item)}
                    onDelete={() => handleDelete(item.id)}
                  ></Item>
                </a-col>
              ))}
          </a-row>
        </div>
      </div>
    );
  },
});
