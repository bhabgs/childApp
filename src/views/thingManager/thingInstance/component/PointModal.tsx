import { defineComponent, watch, ref } from "vue";
import { useVModel } from "@vueuse/core";
import { message } from "ant-design-vue";
import { InboxOutlined, FileExcelTwoTone } from "@ant-design/icons-vue";
import dayjs from "dayjs";

import { customRequest } from "../util/upload";
import { exportFun } from "../util/index";
import * as thingApis from "@/api/thingInstance";

export default defineComponent({
  props: {
    showPointModal: {
      type: Boolean,
      default: false,
    },
    thingNode: Object,
    thingCode: {
      type: String,
      default: "",
    },
  },

  emits: ["update:showPointModal", "refresh"],
  setup(props, context) {
    const isVisible = useVModel(props, "showPointModal", context.emit);

    const exportName = ref();

    watch(
      () => props.showPointModal,
      async (nVal) => {
        if (nVal) {
          exportName.value = `动态属性${
            props.thingNode ? "_" + props.thingNode?.name : ""
          }_${dayjs().format("YYYY_MM_DD_HHmmss")}.xls`;
        }
      }
    );

    const fileList = ref<any[]>([]);
    const isLoding = ref(false);

    // 配点模板下载
    const dynamicExport = async () => {
      const param: any = {};
      if (props.thingNode) {
        param.thingCode = props.thingCode;
      }

      message.info("正在导出，请稍候");
      const res: any = await thingApis.exportExcelTemplate(param);

      exportFun(res, exportName.value);
    };

    const handleUpload = async () => {
      isLoding.value = true;
      try {
        await customRequest(fileList.value[0], thingApis.importExcel);

        isVisible.value = false;
      } finally {
        isLoding.value = false;
      }
    };

    // 关闭后清空上传列表
    watch(isVisible, (val) => {
      if (!val) fileList.value = [];
    });

    return () => (
      <div>
        <a-modal
          v-model={[isVisible.value, "visible"]}
          title={
            "批量配点" + (props.thingNode ? " - " + props.thingNode?.name : "")
          }
          okText="批量配点"
          centered
          width={750}
          onOk={handleUpload}
        >
          {/* 提示框 */}
          <a-alert showIcon type="warning">
            {{
              message: () => (
                <span
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                  }}
                >
                  <span style={{ color: "#1e1e1e" }}>
                    请先下载模板并按要求填写信息，否则可能导入失败。
                  </span>

                  <a onClick={dynamicExport}>{exportName.value}</a>
                </span>
              ),
            }}
          </a-alert>

          {/* 拖拽上传 */}
          <a-upload-dragger
            style={{ margin: "16px 0" }}
            showUploadList={false}
            beforeUpload={() => false}
            multiple={false}
            onChange={({ file }) => (fileList.value = [file])}
            accept="application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
            v-model={[fileList.value, "fileList"]}
          >
            {fileList.value.length ? (
              <>
                <p class="ant-upload-drag-icon">
                  <FileExcelTwoTone twoToneColor="#00C090" />
                </p>
                <p class="ant-upload-text">{fileList.value[0].name}</p>
                <p class="ant-upload-hint">
                  <a-button>重新上传</a-button>
                </p>
              </>
            ) : (
              <>
                <p class="ant-upload-drag-icon">
                  <InboxOutlined />
                </p>
                <p class="ant-upload-text">点击或将文件拖拽到这里上传</p>
                <p class="ant-upload-hint" style={{ color: "#91959d" }}>
                  支持格式: xls/xlsx
                </p>
              </>
            )}
          </a-upload-dragger>

          {/* <div class="operation" style={{ textAlign: "center" }}>
            <a-button
              class="btn-import"
              style={{ width: "300px" }}
              loading={isLoding.value}
              disabled={!fileList.value.length}
              type="primary"
              
            >
              批量配点
            </a-button>
          </div> */}
        </a-modal>
      </div>
    );
  },
});
