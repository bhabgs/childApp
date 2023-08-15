import { defineComponent, nextTick, onMounted, ref } from "vue";
import Form from "./form";
import * as api from "@/api/cardCenter/cardManager";
import { message } from "ant-design-vue";
import { InlCardEditor } from "inl-app-manager";

export const formatProps = (props) => {
  let newProps = {};
  for (let i in props) {
    if (props[i] !== undefined) {
      newProps[i] = props[i].value;
    }
  }

  return newProps;
};

const defaultScript = `
<script setup>
import { ref } from 'vue'
const msg = ref('Hello World!aaa')
</script>
<template>
<h1>{{ msg }}</h1>
<a-button type="primary" danger>哈哈</a-button>
<a-input v-model:value="msg" />
</template>
<style scoped lang="less">
.h2{
  color:red
}
</style>
`;

/**
 * 卡片详情
 */
const CardDetail = defineComponent({
  props: {
    id: {
      type: String,
      required: true,
    },
  },
  setup(props) {
    const isEdit = ref(true);
    const formRef = ref();
    const editorRef = ref();
    const form = ref<any>({});
    const activeTab = ref("basic");
    const code = ref(defaultScript);
    // const editorRenderKey = ref(Date.now());
    const editorLoad = ref(false);

    const getForm = async () => {
      const { data } = await api.getCardDetailById(props.id);
      form.value = data;
      form.value.available = Boolean(form.value.available);
      code.value = form.value.config?.code?.value || defaultScript;
      nextTick(() => {
        editorLoad.value = true;
        // editorRenderKey.value = Date.now();
      });
    };
    onMounted(getForm);

    const saveLoading = ref(false);
    const handleSave = async () => {
      await formRef.value.validate();
      saveLoading.value = true;
      try {
        let thumbnailUrl = form.value.thumbnail || "";
        try {
          const thumbnail: Blob = await editorRef.value.getThumbnail();
          const file = new File([thumbnail], "thumbnail.png", {
            type: thumbnail.type,
          });
          thumbnailUrl = await api.uploadThumbnail(file);
        } catch (e) {
          message.warn("生成缩略图失败");
        }
        const data = { ...form.value };
        data.title = data.name;
        data.available = Number(data.available);
        data.config = editorRef.value.componentClass.config;
        data.config.code = {
          default: "",
          label: "代码片段",
          state: "code",
          hide: true,
          value: code.value,
        };
        data.thumbnail = thumbnailUrl;
        await api.updateSaveCard(data);
        message.success("保存成功");
        isEdit.value = false;
        getForm();
      } finally {
        saveLoading.value = false;
      }
    };

    const handleCancle = () => {
      isEdit.value = false;
      formRef.value.clear();
      getForm();
    };

    return () => {
      const editBtn = (
        <a-button type="primary" onClick={() => (isEdit.value = true)}>
          编辑
        </a-button>
      );
      const saveBtn = (
        <a-space>
          <a-button
            loading={saveLoading.value}
            type="primary"
            onClick={handleSave}
          >
            保存
          </a-button>
          <a-button onClick={handleCancle}>取消</a-button>
        </a-space>
      );

      return (
        <div class="card-manager-detail">
          <a-tabs
            v-model:activeKey={activeTab.value}
            v-slots={{
              rightExtra: () => (
                <a-space>
                  {isEdit.value ? saveBtn : editBtn}
                  <a-button type="primary">运行</a-button>
                </a-space>
              ),
            }}
          >
            <a-tab-pane key="basic" tab="基本信息"></a-tab-pane>
            <a-tab-pane key="code" tab="代码编辑"></a-tab-pane>
          </a-tabs>
          <Form
            class={["tab-pane", { hide: activeTab.value !== "basic" }]}
            ref={formRef}
            column={4}
            disabled={!isEdit.value}
            v-model:value={form.value}
          />
          <div class={["tab-pane", { hide: activeTab.value !== "code" }]}>
            {editorLoad.value && (
              <InlCardEditor
                // key={editorRenderKey.value}
                ref={editorRef}
                componentClass={form.value}
                disabled={!isEdit.value}
                v-model:value={code.value}
              />
            )}
          </div>
        </div>
      );
    };
  },
});

export default CardDetail;
