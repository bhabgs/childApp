import {
  defineComponent,
  inject,
  onBeforeUnmount,
  onMounted,
  onUnmounted,
  ref,
} from "vue";
import { debounce } from "lodash";
import { findById, getParentById } from "@/utils/tree";
import { Modal } from "ant-design-vue";
import Icon, {
  SearchOutlined,
  CloudUploadOutlined,
  CloudDownloadOutlined,
  UploadOutlined,
  DownloadOutlined,
  CopyOutlined,
  EditOutlined,
  DeleteOutlined,
  PlusCircleOutlined,
  HolderOutlined,
} from "@ant-design/icons-vue";
import api from "@/api/PRE";
import externalService from "@/assets/images/externalService.svg";

/*
 * 公共树结构组件 菜单管理、部门管理
 */
const CommonTree = defineComponent({
  props: {
    showIcon: {
      type: Boolean,
      defalut: false,
    },
    downLoadName: {
      type: String,
      default: "",
    },
    getData: {
      type: Function,
      required: true,
    },
    onSelect: {
      type: Function,
    },
    onCopy: {
      type: Function,
    },
    onDelete: {
      type: Function,
    },
    onUploadClick: {
      type: Function,
    },
    onExportClick: Function,
    onAdd: {
      type: Function,
    },
    onEdit: {
      type: Function,
    },
    onDrop: {
      type: Function,
    },
    placeholder: {
      type: String,
      default: "请输入关键字",
    },
    fieldNames: {
      type: Object,
      default: {
        children: "subList",
        key: "id",
        title: "name",
      },
    },
    iconShow: {
      type: Boolean,
      default: false,
    },
    dot: {
      type: Boolean,
      default: false,
    },
    dotName: {
      type: String,
      default: "pduStatus",
    },
    isFileOperation: {
      type: Boolean,
      default: false,
    },
    searchFlag: {
      type: Boolean,
      default: false,
    },
    showText: {
      type: Boolean,
      default: false,
    },
  },
  setup(props, { slots, expose }) {
    const searchText = ref("");
    const curShow = ref("");
    const treeData = ref<any[]>([]);
    const originData = ref([]);
    const expandedKeys = ref<string[]>([]);

    const isLoading = ref(false);

    // 获取数据
    const getTreeData = debounce(async (callback?: () => void) => {
      try {
        isLoading.value = true;
        const data = await props.getData();
        treeData.value = data;
        originData.value = data;
        expandedKeys.value = [treeData.value?.[0][props.fieldNames.key]];
        // 默认选中第一个
        if (!selectedKeys.value.length) {
          selectedKeys.value[0] = data[0][props.fieldNames.key];
          handleSelectNode([], { selected: true, node: data[0] });
        }
        callback?.();
      } catch (error) {
        //
      } finally {
        isLoading.value = false;
      }
    }, 300);
    // onMounted(async () => {
    //   await getTreeData(() => {
    //     expandedKeys.value = [treeData.value?.[0][props.fieldNames.key]];
    //   });
    // });

    /* 当前选中的节点 */
    const selectedKeys = ref<any[]>([]);
    const handleSelectNode = (keys: any, { node, selected }: any) => {
      // if (!selected) {
      //   props.onSelect?.(undefined);
      // } else {
      props.onSelect?.(node);
      // }
    };
    // 更新节点后重新选中节点 展示最新的信息
    const _reselect = () => {
      const node: any = findById(
        treeData.value,
        selectedKeys.value[0],
        props.fieldNames.children,
        props.fieldNames.key
      );
      const parent = getParentById(
        treeData.value,
        node[props.fieldNames.key],
        props.fieldNames.children,
        props.fieldNames.key
      );
      handleSelectNode([], {
        node: { ...node, parent: { node: parent } },
        selected: true,
      });
    };
    /* 对外服务 */
    const handleExternalService = () => {};
    // 编辑节点
    const handleEdit = (data: any) => {
      props.onEdit?.(data);
    };
    // 添加节点
    const handleAddNodeClick = (data: any) => {
      props.onAdd?.(data);
    };

    // 删除节点
    const handleDelete = (node: any) => {
      Modal.confirm({
        title: "确认删除",
        content: `确定删除“${node[props.fieldNames.title]}”?`,
        async onOk() {
          props.onDelete?.(node);
        },
      });
    };
    const getClass = (name, val, isSystem?) => {
      if (isSystem) return name + "green";
      if (props.dotName === "pduStatus") {
        return val === "DISABLE"
          ? name + "gray"
          : val === "GOOD"
          ? name + "green"
          : val === "PARTIALBAD"
          ? name + "yellow"
          : val === "ALLBAD"
          ? name + "red"
          : "";
      } else if (props.dotName === "available") {
        return val ? name + "green" : name + "gray";
      }
    };
    /* ===== 更新树结构数据后刷新 ===== */
    const handleRefresh = async () => {
      await getTreeData(_reselect);
    };

    const id = ref(`tree_${Math.random().toString(8).slice(2)}`);
    const height = ref("");
    let timer: any;
    const getWidth = async (id: string) => {
      timer = setTimeout(() => {
        const target = document.getElementById(`tree_title_${id}`);
        const width = (target?.parentNode?.parentNode as any)?.offsetWidth;
        const iconWith = (target?.parentNode?.parentNode?.firstChild as any)
          ?.offsetWidth;
        if (props.showIcon) {
          target?.style.setProperty("width", `${width - (iconWith + 20)}px`);
        } else {
          target?.style.setProperty("width", `${width - 20}px`);
        }
      }, 10);
    };
    onMounted(() => {
      const container = document.getElementById(id.value);
      if (container)
        height.value = `calc(100vh - ${container?.offsetTop + 24 + 16}px)`;
      handleRefresh();
    });
    onUnmounted(() => {
      clearTimeout(timer);
    });
    expose({
      _refresh: getTreeData,
      _reselect,
    });
    return () => (
      <div class="common-tree">
        {/* <p class="text">PRE</p> */}
        {/* 搜索 */}
        {props.searchFlag && (
          <a-input
            style={{ marginBottom: "8px" }}
            placeholder={props.placeholder}
            allowClear
            suffix={<SearchOutlined title="搜索" class="pointer" />}
            v-model={[searchText.value, "value"]}
            onChange={getTreeData}
          />
        )}
        {/* 工具栏容器 */}
        <div class="utils-container" style={{ textAlign: "center" }}>
          {props.isFileOperation && (
            <a-space>
              <a-button
                style={{ padding: "4px 0" }}
                type="link"
                onClick={() => props.onUploadClick?.()}
              >
                <UploadOutlined />
                批量导入
              </a-button>
              <a-button
                style={{ padding: "4px 0" }}
                type="link"
                onClick={props.onExportClick}
              >
                <DownloadOutlined />
                批量导出
              </a-button>
              {/* <a-button
                style={{ padding: "4px 0" }}
                type="link"
                onClick={handleExternalService}
              >
                <Icon
                  v-slots={
                    {
                      // component: () => <externalService></externalService>,
                    }
                  }
                ></Icon>
                <img width="14" src={externalService} alt="" />
                对外服务
              </a-button> */}
              {/* <externalService></externalService> */}
            </a-space>
          )}
        </div>
        <div
          class="tree-container"
          id={id.value}
          style={`height: ${height.value};overflow-y: auto;`}
        >
          <a-spin spinning={isLoading.value}>
            {treeData.value.length > 0 ? (
              <a-tree
                showLine={{ showLeafIcon: true }}
                blockNode
                fieldNames={props.fieldNames}
                treeData={treeData.value}
                v-models={[
                  [selectedKeys.value, "selectedKeys"],
                  [expandedKeys.value, "expandedKeys"],
                ]}
                onSelect={handleSelectNode}
              >
                {{
                  title: (node: any) => {
                    return (
                      <span
                        class="tree-node-title"
                        style={`${getWidth(node[props.fieldNames.key])}`}
                        id={`tree_title_${node[props.fieldNames.key]}`}
                        onMouseenter={() => {
                          curShow.value = node[props.fieldNames.key];
                        }}
                        onMouseleave={() => {
                          curShow.value = "";
                        }}
                      >
                        <span class="tree-node-title-box">
                          <>
                            {props.dot && (
                              /* pduStatus GOOD, PARTIALBAD,DISABLE,ALLBAD */
                              /* available 灰色：停用 false 绿色：启用 true */
                              <span
                                class={[
                                  "dot",
                                  getClass(
                                    "dot-",
                                    node[props.dotName],
                                    node.isSystem
                                  ),
                                ]}
                                style={{ marginRight: "4px" }}
                              ></span>
                            )}
                            <span
                              class={[
                                "name",
                                getClass(
                                  "name-",
                                  node[props.dotName],
                                  node.isSystem
                                ),
                              ]}
                              title={node[props.fieldNames.title]}
                            >
                              {node[props.fieldNames.title]}
                            </span>
                          </>
                          <span class="btn">
                            {curShow.value === node[props.fieldNames.key] &&
                              props.iconShow && (
                                <>
                                  {/* 当前选中的节点需要展示操作按钮 */}
                                  {node.isSystem && (
                                    <span class="operation">
                                      <PlusCircleOutlined
                                        title="添加"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleAddNodeClick(node.dataRef);
                                        }}
                                      />
                                    </span>
                                  )}
                                  {!node.isSystem && (
                                    <span class="operation">
                                      <a-space>
                                        <EditOutlined
                                          title="编辑"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleEdit(node.dataRef);
                                          }}
                                        />
                                        {/* 已停用的才可删除 */}
                                        {!node.available && (
                                          <DeleteOutlined
                                            title="删除"
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              handleDelete(node.dataRef);
                                            }}
                                          />
                                        )}
                                        {/* {dataRef.valid === 1 && (
                                        <PlusCircleOutlined
                                          title="添加"
                                          onClick={(e) => {
                                            node.stopPropagation();
                                            handleAddNodeClick(dataRef);
                                          }}
                                        />
                                      )} */}
                                      </a-space>
                                    </span>
                                  )}
                                </>
                              )}
                          </span>
                        </span>
                      </span>
                    );
                  },
                  // icon: (e) => {
                  //   return <icon-font type={handleIcon(e.type)}></icon-font>;
                  // },
                }}
              </a-tree>
            ) : (
              <a-empty />
            )}
          </a-spin>
        </div>
      </div>
    );
  },
});

export default CommonTree;
