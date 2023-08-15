import { computed, defineComponent, onMounted, ref } from "vue";
import { useModalVisible, useTableList } from "inl-ui/dist/hooks";
import { file } from "inl-ui/dist/utils";
import { findById } from "@/utils/tree";
import { transformTime } from "@/utils/format";
import _ from "lodash";
import dayjs from "dayjs";

import { Modal, message } from "ant-design-vue";
import Tree from "./tree";
import UpdateParamModal, {
  typeList,
  statusList,
} from "../modals/updateParamModal";
import { ImportModal } from "inl-ui/dist/components";
import UpdateGroup from "../modals/updateGroup";
import { getAppDetail } from "@/api/appCenter/appManager";
import * as api from "@/api/appCenter/paramManager";

const columns = [
  {
    title: "名称",
    dataIndex: "name",
  },
  {
    title: "编码",
    dataIndex: "code",
  },
  {
    title: "类型",
    dataIndex: "type",
    width: 250,
    customRender: ({ text }) => {
      return typeList.find((item) => item.value === text)?.label;
    },
  },
  {
    title: "状态",
    dataIndex: "valid",
    width: 80,
    customRender({ text }) {
      return statusList.find((item) => item.value == text)?.label;
    },
  },
  {
    key: "action",
    title: "操作",
    width: 180,
  },
];

/**
 * 参数详情
 */
const ParamDetail = defineComponent({
  props: {
    id: {
      type: String,
      required: true,
    },
  },
  setup(props, { emit }) {
    const [isImportVisible, handleImportClick] = useModalVisible();
    const appInfo = ref();

    const treeData = ref<any[]>([]);
    const getTreeData = async () => {
      const { data } = await api.getParamTreeByAppId(props.id);
      const { data: appDetail } = await getAppDetail({
        appId: props.id,
        page: 1,
        limit: 0,
      });
      appInfo.value = appDetail;
      // 假根结点(应用)
      const root = {
        name: appDetail.fullname,
        id: appDetail.id,
        isRoot: true,
        childGroupList: data,
      };
      treeData.value = [root];
      if (activeGroup.value) {
        const newActiveGroup = findById(
          treeData.value,
          activeGroup.value.id,
          "childGroupList",
          "id"
        );
        activeGroup.value = newActiveGroup;
        // 没查到选中的组 重置
        if (!activeGroup.value) {
          resetTable();
          return;
        }
        if (activeGroup.value.parentId) {
          const groupParent = findById(
            treeData.value,
            activeGroup.value.parentId,
            "childGroupList",
            "id"
          );
          activeGroup.value.parent = groupParent;
        }
      }
    };
    onMounted(getTreeData);

    const activeGroup = ref();
    const handleGroupSelect = (node) => {
      activeGroup.value = node;
      currPage.value = 1;
      if (activeGroup.value.isRoot) {
        resetTable();
      } else {
        refresh();
      }
    };
    const groupParent = computed(() =>
      _.isEmpty(groupRecord.value)
        ? activeGroup.value
        : activeGroup.value?.parent
    );
    const [goupVisible, groupClick, groupRecord] = useModalVisible();
    const handleDeleteGoup = () => {
      if (!activeGroup.value) return;
      Modal.confirm({
        title: "提示",
        content: `确定删除参数组“${activeGroup.value.name}”吗？`,
        async onOk() {
          await api.deleteParamGroup(activeGroup.value.id);
          message.success("删除成功");
          getTreeData();
          activeGroup.value = undefined;
          // 重置表格
          resetTable();
        },
      });
    };

    const { currPage, pageSize, pagination, isLoading, tableList, refresh } =
      useTableList(
        () =>
          api.getParamListByGroupId({
            groupId: activeGroup.value.id,
            pageNum: currPage.value,
            pageSize: pageSize.value,
          }),
        "page.list",
        "page.size"
      );
    const resetTable = () => {
      currPage.value = 1;
      pagination.total = 0;
      tableList.value = [];
    };

    const addDisabled = computed(() => {
      // 只有group和cell可以添加参数
      if (!activeGroup.value) return true;
      return !["group", "cell"].includes(activeGroup.value.level);
    });

    const isPreview = ref(false);
    const [paramDefVisible, paramDefClick, paramDefRecord] = useModalVisible();
    const handleDeleteDef = (row) => {
      Modal.confirm({
        title: "提示",
        content: `确定删除参数“${row.name}”吗？`,
        async onOk() {
          await api.deleteParamDef(row.id);
          message.success("删除成功");
          refresh();
        },
      });
    };

    const handleUpload = async (file: File) => {
      const formData = new FormData();
      formData.append("appId", props.id);
      formData.append("file", file);
      await api.importParam(formData);
    };

    const handleExportAll = async () => {
      if (!appInfo.value) return;
      const data: any = await api.exportAllParam({
        appName: appInfo.value.name,
        appId: appInfo.value.id,
      });
      file.downloadFile(
        data,
        `参数配置数据_${dayjs().format("YYYY_MM_DD_HHmm")}.xlsx`
      );
    };

    const handleRefresh = () => {
      resetTable();
      getTreeData();
      activeGroup.value = undefined;
    };

    return () => (
      <div class="param-detail">
        <Tree
          data={treeData.value}
          onSelect={handleGroupSelect}
          onAdd={() => groupClick({})}
          onEdit={() => groupClick(activeGroup.value)}
          onDelete={handleDeleteGoup}
        />
        <a-divider class="divider" type="vertical"></a-divider>
        <div class="right">
          <div class="title">基本详情</div>
          <a-descriptions
            column={4}
            labelStyle={{ width: "8em", justifyContent: "flex-end" }}
            contentStyle={{ display: activeGroup.value?.isRoot ? "none" : "" }}
          >
            <a-descriptions-item label="参数组名称">
              {activeGroup.value?.name}
            </a-descriptions-item>
            <a-descriptions-item label="状态">
              {activeGroup.value?.valid != undefined &&
                (activeGroup.value.valid === 1 ? (
                  <a-tag color="green">启用</a-tag>
                ) : (
                  <a-tag>未启用</a-tag>
                ))}
            </a-descriptions-item>
            <a-descriptions-item label="上一级">
              {activeGroup.value?.parent?.name}
            </a-descriptions-item>
            <a-descriptions-item label="备注">
              {activeGroup.value?.remark}
            </a-descriptions-item>
            <a-descriptions-item label="创建人">
              {activeGroup.value?.createUser}
            </a-descriptions-item>
            <a-descriptions-item label="创建时间">
              {transformTime(activeGroup.value?.createDt)}
            </a-descriptions-item>
            <a-descriptions-item label="最后修改人">
              {activeGroup.value?.updateUser}
            </a-descriptions-item>
            <a-descriptions-item label="最后修改时间">
              {transformTime(activeGroup.value?.updateDt)}
            </a-descriptions-item>
          </a-descriptions>
          <div class="title">参数信息</div>
          <inl-layout-table>
            {{
              opt: () => (
                <a-space>
                  <a-button
                    type="primary"
                    disabled={addDisabled.value}
                    onClick={() => {
                      isPreview.value = false;
                      paramDefClick({});
                    }}
                  >
                    添加参数
                  </a-button>
                  <a-button onClick={handleImportClick}>批量导入</a-button>
                  <a-button onClick={handleExportAll}>全部导出</a-button>
                </a-space>
              ),
              content: () => (
                <a-table
                  loading={isLoading.value}
                  pagination={pagination}
                  columns={columns}
                  dataSource={tableList.value}
                  v-slots={{
                    bodyCell: ({ column, record }) => {
                      if (column.key === "action") {
                        return (
                          <>
                            <a-button
                              size="small"
                              type="link"
                              onClick={() => {
                                isPreview.value = true;
                                paramDefClick(record);
                              }}
                            >
                              详情
                            </a-button>
                            <a-button
                              size="small"
                              type="link"
                              onClick={() => {
                                isPreview.value = false;
                                paramDefClick(record);
                              }}
                            >
                              编辑
                            </a-button>
                            <a-button
                              size="small"
                              type="link"
                              onClick={() => handleDeleteDef(record)}
                            >
                              删除
                            </a-button>
                          </>
                        );
                      }
                    },
                  }}
                ></a-table>
              ),
            }}
          </inl-layout-table>
        </div>

        <ImportModal
          name="参数管理"
          v-model:visible={isImportVisible.value}
          upload={handleUpload}
          onFinish={handleRefresh}
        />

        <UpdateGroup
          onRefresh={getTreeData}
          record={groupRecord.value}
          parent={groupParent.value}
          appId={props.id}
          v-model:visible={goupVisible.value}
        />

        <UpdateParamModal
          record={paramDefRecord.value}
          group={activeGroup.value}
          isPreview={isPreview.value}
          v-model:visible={paramDefVisible.value}
          onRefresh={refresh}
        />
      </div>
    );
  },
});

export default ParamDetail;
