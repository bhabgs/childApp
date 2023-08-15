/**
 *  设备连接
 */
import { defineComponent, onMounted, reactive, ref, nextTick } from "vue";
import CommonTree from "@/components/commonTree";
import Point from "./point";
import Pre from "./pre";
import api from "@/api/PRE";
import { message } from "ant-design-vue";
import TreeModal from "./treeModal";
import { useModalVisible } from "inl-ui/dist/hooks";
import { file } from "inl-ui/dist/utils";
import { ImportModal } from "inl-ui/dist/components";
import dayjs from "dayjs";

const DeviceConnection = defineComponent({
  name: "DeviceConnection",
  setup(props, ctx) {
    const treeRef = ref();
    const treeInfo: any = ref({ type: "", form: {} });
    const pointRef = ref();
    const currSelectNode = ref({ id: "" });
    const handleNodeSelect = (node: any) => {
      currSelectNode.value = node;
      nextTick(() => {
        if (!node?.isSystem) {
          pointRef.value._refresh();
        } else {
          treeInfo.value.form = node;
        }
      });
    };

    /* 树操作 */
    const handleAdd = (node: any) => {
      currSelectNode.value = node;
      treeInfo.value.form = node;
      treeInfo.value.type = "add";
      treeOperation();
    };
    const handleEdit = (e) => {
      treeInfo.value.type = "edit";
      treeInfo.value.form = e;
      treeOperation();
    };
    const handleDelete = async (node: any) => {
      try {
        await api.deletePduLinker(node?.pduId);
        getTreeData("").then(() => treeRef.value._refresh());
        message.success("删除成功");
      } catch (error) {
        message.error("删除失败");
      }
    };
    const [isImportVisible, importClick] = useModalVisible();
    const handleExport = async () => {
      const closeMsg = message.info({
        content: "正在导出，请稍候",
        duration: 0,
      });
      try {
        const data: any = await api.exportPduItems();
        file.downloadFile(
          data,
          `PRE连接配置_${dayjs().format("YYYY_MM_DD_HHmmss")}.xlsx`
        );
      } finally {
        closeMsg();
      }
    };
    const handleUpload = async (file: File) => {
      const formData = new FormData();
      formData.append("file", file);
      await api.batchImportPduItems(formData);
    };
    const uploadFinish = () => {
      treeRef.value._refresh();
      isImportVisible.value = false;
    };
    const getTreeData = async (keyword: string) => {
      const { data } = await api.getPreItems({ pduName: keyword });
      return data.map((item: any) => {
        item.pduName = item.preName;
        item.pduId = "sys" + item.preName;
        item.isSystem = true;
        return item;
      });
    };
    const [visibleTree, treeOperation] = useModalVisible();

    onMounted(() => {});
    return () => (
      <div class="PREBox deviceConnection flex" id="deviceConnection">
        <div class="deviceConnection-left">
          <CommonTree
            ref={treeRef}
            getData={getTreeData}
            searchFlag
            iconShow
            dot
            dotName={"available"}
            isFileOperation
            fieldNames={{
              children: "pduItemList",
              key: "pduId",
              title: "pduName",
            }}
            onAdd={handleAdd}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onUploadClick={importClick}
            onExportClick={handleExport}
            onSelect={handleNodeSelect}
          />
        </div>
        <a-divider
          type="vertical"
          style={{ height: "100%", margin: "0 24px" }}
        ></a-divider>
        {currSelectNode.value?.isSystem ? (
          <Pre treeInfo={currSelectNode.value}></Pre>
        ) : (
          <Point ref={pointRef} treeInfo={currSelectNode.value}></Point>
        )}
        <TreeModal
          v-model={[visibleTree.value, "visible"]}
          mode={treeInfo.value.type}
          record={treeInfo.value.form}
          onRefresh={() => {
            getTreeData;
            treeRef.value._refresh();
          }}
        />

        <ImportModal
          name="PRE连接配置"
          v-model:visible={isImportVisible.value}
          getTemplateFile={api.downloadTemplate}
          upload={handleUpload}
          onFinish={uploadFinish}
        />
      </div>
    );
  },
});

export default DeviceConnection;
