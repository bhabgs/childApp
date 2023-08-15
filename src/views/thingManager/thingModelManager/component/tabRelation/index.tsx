import { defineComponent, onMounted, reactive, ref, computed } from "vue";
import * as modelApis from "@/api/thingModel";
import updateRela from "./update";
import { message } from "ant-design-vue";
import { ExclamationCircleFilled } from "@ant-design/icons-vue";
const columnsAll = [
  // {
  //   title: "关系业务类型",
  //   dataIndex: "relaClass",
  //   key: "relaClass",
  // },
  {
    title: "关系名称",
    dataIndex: "relaName",
    key: "relaName",
  },
  {
    title: "A端列名",
    dataIndex: "relaAThingColumn",
    key: "relaAThingColumn",
    type: ["relation", "contain"],
  },
  {
    title: "Z端物模型",
    dataIndex: "zthingName",
    key: "zthingName",
    customRender: ({ record }: any) => {
      return `${record.zThingName}(${record.zThingCode})`;
    },
  },
  {
    title: "Z端列名",
    dataIndex: "relaZThingColumn",
    key: "relaZThingColumn",
    type: ["relation"],
  },
  {
    title: "创建人",
    dataIndex: "createUser",
    key: "createUser",
  },
  {
    title: "创建时间",
    dataIndex: "createTime",
    key: "createTime",
  },
  {
    title: "更新人",
    dataIndex: "updateUser",
    key: "updateUser",
  },
  {
    title: "更新时间",
    dataIndex: "updateTime",
    key: "updateTime",
  },
  {
    title: "备注",
    dataIndex: "remark",
    key: "remark",
  },
  //   {
  //     title: "启用状态",
  //     dataIndex: "validEnable",
  //     key: "validEnable",
  //     slots: { customRender: "validEnable" },
  //   },
  {
    title: "操作",
    dataIndex: "action",
    key: "action",
    slots: { customRender: "action" },
  },
];
export default defineComponent({
  props: {
    code: {
      type: String,
      required: true,
    },
  },
  components: { updateRela },
  setup(_props, _context) {
    const updateRef = ref();
    const state = reactive<{
      type: string;
      tableData: any;
      isLoading: boolean;
    }>({
      type: 'contain', //contain,extends,relation
      tableData: {},
      isLoading: false,
    });
    const alertMsg = computed(() => {
      if (state.type == "contain") {
        return 'A端默认为当前物模型。实例关系将存于Z端物模型的物理表中，Z端实例列名为id。A:Z为1:1或1:n。';
      } else if (state.type == "relation") {
        return 'A端默认为当前物模型。A:Z为n:n。';
      } else if (state.type == "extends") {
        return "A端默认为当前物模型，要求Z端是与A端存储物理表相同的物模型，否则查关系时可能报错。实例关系将存于物模型的物理表中，A端实例列名为parent_id，Z端实例列名为id。创建后请在数据库中增加相应的表。";
      }
    });
    const columns = computed(() => {
      return columnsAll.filter((col) => {
        return !col.type || col.type.indexOf(state.type) > -1;
      });
    });
    const tableList = computed(() => {
      if (state.tableData[state.type]) {
        return state.tableData[state.type];
      }
      return [];
    });
    const getList = async () => {
      state.isLoading = true;
      modelApis.findRelationByCode(_props.code).then((res) => {
        state.tableData = res.data;
        state.isLoading = false;
      });
    };

    const remove = (id: string) => {
      modelApis
        .removeRela(id)
        .then((res) => {
          message.success("删除成功");
          getList();
        })
        .catch((err) => {
          message.error(err.message || "删除失败");
        });
    };
    const openUpdateModal = (isAdd: boolean, data?: any) => {
      updateRef.value.open(isAdd, _props.code, state.type, data);
    };
    onMounted(() => {
      getList();
    });
    return () => (
      <div class="tab_attr">
        <a-radio-group v-model={[state.type, "value"]}>
          {/* <a-radio-button value="extends">继承关系extends</a-radio-button> */}
          <a-radio-button value="contain">包含关系</a-radio-button>
          <a-radio-button value="relation">关联关系</a-radio-button>
        </a-radio-group>

        <div class="mar-t-20">
          <a-space>
            <a>
              <ExclamationCircleFilled />
            </a>
            <span class="gray">{alertMsg.value}</span>
          </a-space>
        </div>
        <a-button
          type="primary"
          class="mar-t-20"
          onClick={() => openUpdateModal(true)}
        >
          新增
        </a-button>
        <div class="mar-t-20">
          <a-table
            rowKey="code"
            columns={columns.value}
            dataSource={tableList.value}
            loading={state.isLoading}
            pagination={false}
            v-slots={{
              validEnable: (row: any) => {
                return (
                  <a-tag color={row.record.validEnable ? "green" : ""}>
                    {row.record.validEnable ? "启用" : "禁用"}
                  </a-tag>
                );
              },
              action: (row: any) => {
                return (
                  <a-space>
                    <a onClick={() => openUpdateModal(false, row.record)}>
                      编辑
                    </a>
                    <a-popconfirm
                      title="确认删除?"
                      ok-text="确定"
                      cancel-text="取消"
                      onConfirm={() => {
                        remove(row.record.id);
                      }}
                    >
                      <a class="pointer">删除</a>
                    </a-popconfirm>
                  </a-space>
                );
              },
            }}
          ></a-table>
        </div>
        <updateRela ref={updateRef} onOk={getList} />
      </div>
    );
  },
});
