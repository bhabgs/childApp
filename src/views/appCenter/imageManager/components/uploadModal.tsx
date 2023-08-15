import { computed, defineComponent, nextTick, ref } from "vue";
import { FileImageOutlined, DeleteOutlined } from "@ant-design/icons-vue";
import { message } from "ant-design-vue";
import { useSessionStorage } from "@vueuse/core";
import * as api from "@/api/appCenter/imageManager";

const upload_action = "/api/mtip/thing/v2/thing/uploadImage";

const getImageSize = (file: File) => {
  return new Promise((resolve, reject) => {
    const image = new Image();
    const src = URL.createObjectURL(file);
    image.src = src;
    image.onload = function () {
      resolve({
        width: image.width,
        height: image.height,
      });
    };
    image.onabort = function () {
      reject();
    };
  });
};

const UploadModal = defineComponent({
  emits: ["refresh"],
  setup(props, { emit }) {
    const visible = ref(false);
    const token = useSessionStorage("token", "");
    const userinfo = useSessionStorage<any>("userinfo", {});
    const headers = computed(() => {
      return {
        token: token.value,
        userId: userinfo.value.userId,
        userName: userinfo.value.userName,
        employeeName:
          userinfo.value.employeeName &&
          encodeURIComponent(userinfo.value.employeeName),
      };
    });

    const uploaderProps = computed(() => ({
      name: "file",
      accept: "image/*",
      multiple: true,
      maxCount: 50,
      headers: headers.value,
      action: upload_action,
      beforeUpload,
      showUploadList: false,
      onChange: handleChange,
    }));

    const fileList = ref<any[]>([]);

    const beforeUpload = (file: any) => {
      if (file.size > 1000 * 1000 * 2) {
        message.warn("文件过大");
        setTimeout(() => {
          const idx = fileList.value.findIndex((f) => f.uid === file.uid);
          if (idx !== -1) {
            fileList.value.splice(idx, 1);
          }
        });
        return false;
      }
      return true;
    };

    const handleChange = (val) => {
      // console.log(val);
    };

    const handleDelete = (index: number) => {
      fileList.value.splice(index, 1);
    };

    const handleClear = () => {
      fileList.value = [];
    };

    const handleSave = async () => {
      const filterList = fileList.value.filter((f) => {
        return f?.response?.code === "M0000";
      });
      const list = await Promise.all(
        filterList.map((i) => getImageSize(i.originFileObj))
      );
      const imageList = list.map((item: any, index) => {
        const image = filterList[index];
        return {
          name: image.name,
          url: image.response.data,
          width: item.width,
          height: item.height,
        };
      });
      await api.insertImage(imageList);
      message.success(`成功上传${imageList.length}张图片`);
      visible.value = false;
      handleClear();
      emit("refresh");
    };

    const onClose = () => {};

    return () => {
      const uploaderContinue = (
        <a-space style={{ marginBottom: "16px" }}>
          <span>继续上传</span>
          <a-upload v-model:fileList={fileList.value} {...uploaderProps.value}>
            <a-button type="primary" ghost>
              上传图片
            </a-button>
          </a-upload>
          <a-button type="link" onClick={handleClear}>
            清空
          </a-button>
        </a-space>
      );
      const uploaderEmpty = (
        <a-upload-dragger
          v-model:fileList={fileList.value}
          {...uploaderProps.value}
        >
          <p class="ant-upload-drag-icon">
            <FileImageOutlined />
          </p>
          <p class="ant-upload-text">点击上传图片</p>
          <p class="ant-upload-hint">每次最多上传50张，单张图片不超过10M</p>
        </a-upload-dragger>
      );
      const list = (
        <div class="file-list">
          {fileList.value.map((f, index) => {
            const src = URL.createObjectURL(f.originFileObj);
            const error = f.response && f.response.code !== "M0000";

            return (
              <div class={["list-item", { error }]} key={f.uid}>
                <a-image width={56} height={32} src={src}></a-image>
                <span class="name">
                  {f.name} {error && <a-tag color="red">上传失败</a-tag>}
                </span>
                <a-popconfirm
                  title="确定要删除文件？"
                  onConfirm={() => handleDelete(index)}
                >
                  <DeleteOutlined />
                </a-popconfirm>
              </div>
            );
          })}
        </div>
      );

      return (
        <div class="upload-modal">
          <a-button type="primary" onClick={() => (visible.value = true)}>
            上传图片
          </a-button>
          <a-modal
            wrapClassName="upload-image-modal"
            title="上传图片"
            width={800}
            centered
            afterClose={onClose}
            onOk={handleSave}
            v-model:visible={visible.value}
          >
            <div v-show={fileList.value.length === 0}>{uploaderEmpty}</div>
            <div v-show={fileList.value.length > 0}>{uploaderContinue}</div>
            {fileList.value.length > 0 && list}
          </a-modal>
        </div>
      );
    };
  },
});

export default UploadModal;
