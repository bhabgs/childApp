import { defineComponent } from "vue";

export default defineComponent({
  setup(_props, _context) {
    // const renderBatchImportModal = () => {
    //   const exportName = `物实例管理-${dayjs().format("YYYYMMDDHHmmss")}.xls`;
    //   return (
    //     <a-modal
    //       v-model={[batchImportModal.value, "visible"]}
    //       title="批量导入"
    //       class="pointModal"
    //       width={800}
    //       footer={null}
    //       onCancel={() => {
    //         batchImportModal.value = false;
    //       }}
    //       centered
    //     >
    //       <div
    //         style={{
    //           display: "flex",
    //           alignItems: "center",
    //           backgroundColor: "rgba(255, 146, 20, 0.1)",
    //         }}
    //       >
    //         <a-alert
    //           message="请先下载模板并按要求填写信息，否则可能导入失败。上传文件后将覆盖式更新，请谨慎操作！"
    //           banner
    //         />
    //         <a-button
    //           type="link"
    //           onClick={() => {
    //             batchImportTemplateExport(exportName);
    //           }}
    //         >
    //           {exportName}
    //         </a-button>
    //       </div>
    //       <a-upload-dragger
    //         showUploadList={false}
    //         accept=".xls,.xlsx"
    //         customRequest={async (e) => {
    //           await customRequest(e, thingApis.importPointExcel, true);
    //           batchImportModal.value = false;
    //         }}
    //       >
    //         <p class="ant-upload-drag-icon">
    //           <inbox-outlined></inbox-outlined>
    //         </p>
    //         <p class="ant-upload-text">点击或将文件拖拽到这里上传</p>
    //         <p class="ant-upload-hint">支持格式：xls/xlsx</p>
    //       </a-upload-dragger>
    //     </a-modal>
    //   );
    // };

    return () => <div class="RenderBatchImportModal"></div>;
  },
});
