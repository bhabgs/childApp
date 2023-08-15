import { computed, defineComponent, onMounted, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useSessionStorage } from "@vueuse/core";
import { useEvent, useModalVisible } from "inl-ui/dist/hooks";
import _ from "lodash";
import { ALL_GROUP, clientTypeList } from "../config";

import { Modal, message } from "ant-design-vue";
import PageConfig from "./page";
import Script from "./script";
import ScriptGlobal from "./scriptGlobal";
import AddPageModal from "../modals/addPageModal";
import * as api from "@/api/appCenter/appManager";

/**
 * 应用详情
 */
const AppDetail = defineComponent({
  emits: ["close"],
  props: {
    id: {
      type: String,
      required: true,
    },
  },
  setup(props, { emit }) {
    const router = useRouter();
    const route = useRoute();
    const userinfo = useSessionStorage<any>("userinfo", {});
    const token = useSessionStorage("token", "");

    const activeTab = ref<any>(null);

    const alarmConfigUrl = computed(() => {
      return `/#/mtip-intelligent-centralized-control/alarmManager/alarmConfig?onlyPage=1&token=${token.value}&userId=${userinfo.value.userId}&appId=${props.id}`;
    });

    const isEdit = ref(false);
    watch(
      () => route.query.isEdit,
      (val) => (isEdit.value = val === "true"),
      { immediate: true }
    );
    const isAdd = computed(() => props.id === "add");

    const formRef = ref();
    const form = ref<any>({});

    const getForm = async () => {
      if (!isAdd.value) {
        const { data } = await api.getAppDetail({
          appId: props.id,
          page: 1,
          limit: 0,
        });
        form.value = data;
      }
    };
    onMounted(getForm);

    const groupList = ref<any[]>([]);
    const getGroupList = async () => {
      const { data } = await api.getGroupList();
      groupList.value = data;
    };
    onMounted(getGroupList);

    const handleSave = async (isRelease: boolean) => {
      await formRef.value.validate();
      const data = {
        ...form.value,
        status: "0",
      };
      let releaseId;
      if (isAdd.value) {
        if (data.groupId == ALL_GROUP) {
          data.groupId = null;
        }
        const { data: addData } = await api.insertApp(data);
        releaseId = addData.id;
      } else {
        await api.saveAppConf(data);
        releaseId = data.id;
      }
      if (isRelease) {
        const { data } = await api.getUnreleasePageByAppId(releaseId);
        if (data.length > 0) {
          Modal.warn({
            title: "提示",
            content: "还有未发布的页面，请先发布",
            okText: "确定",
          });
          return;
        }
      }
      if (isRelease) {
        await api.releaseApp(releaseId);
      }
      message.success(isRelease ? "发布成功" : "暂存成功");
      handleCancle();
    };
    const refreshList = useEvent("appManagerRefresh");
    const handleCancle = () => {
      if (isAdd.value) {
        router.push({
          name: "appManager",
        });
        refreshList?.();
        emit("close");
      } else {
        isEdit.value = false;
        getForm();
      }
    };

    /* 页面 */
    const isLoading = ref(false);
    const pageList = ref<any[]>([]);
    const pageTabList = computed(() => {
      const tabs = clientTypeList;
      return tabs.map((item) => ({
        ...item,
        pageList: pageList.value.filter(
          (p) => !item.value || p.clientType === item.value
        ),
      }));
    });

    const getPageList = _.debounce(async () => {
      isLoading.value = true;
      try {
        const { data } = await api.getAppDetail({
          appId: props.id,
          page: 1,
          limit: 999,
          clientType: null,
          key: form.value.key,
        });
        pageList.value = data.page.list;
      } finally {
        isLoading.value = false;
      }
    }, 200);
    onMounted(getPageList);

    const [isAddVisible, handleAddClick] = useModalVisible();
    const handleAddPage = async (page) => {
      let res;
      page.appId = props.id;
      try {
        res = await api.addAppPage(page);
        message.success("添加成功");
      } catch (error) {}
      getPageList();
    };

    const handleDelete = (page) => {
      Modal.confirm({
        title: "提示",
        content: `确定删除页面“${page.name}”吗？`,
        async onOk() {
          await api.deletePage([page.id]);
          getPageList();
        },
      });
    };

    const handleRelease = (page) => {
      Modal.confirm({
        title: "提示",
        content: `确定发布页面“${page.name}”吗？`,
        async onOk() {
          await api.releasePage(page.id);
          message.success("发布成功");
          getPageList();
        },
      });
    };

    return () => (
      <div class="app-detail">
        <div class="header">
          <h3 class="title">编辑应用</h3>
          <div class="operation">
            <a-space>
              {isEdit.value ? (
                <>
                  <a-button onClick={handleCancle}>取消</a-button>
                  <a-button onClick={() => handleSave(false)}>暂存</a-button>
                </>
              ) : (
                <a-button onClick={() => (isEdit.value = true)}>编辑</a-button>
              )}
              <a-button type="primary" onClick={() => handleSave(true)}>
                发布
              </a-button>
            </a-space>
          </div>
        </div>
        <a-form
          ref={formRef}
          model={form.value}
          labelCol={{ style: { width: "8em" } }}
        >
          <a-row>
            <a-col span={6}>
              <a-form-item label="应用名称" required name="fullname">
                <a-input
                  style={{ width: "240px" }}
                  placeholder="请输入"
                  disabled={!isEdit.value}
                  v-model:value={form.value.fullname}
                ></a-input>
              </a-form-item>
            </a-col>
            <a-col span={6}>
              <a-form-item label="名称缩写" required name="name">
                <a-input
                  style={{ width: "240px" }}
                  placeholder="请输入"
                  disabled={!isEdit.value}
                  v-model:value={form.value.name}
                ></a-input>
              </a-form-item>
            </a-col>
            <a-col span={6}>
              <a-form-item label="版本号" required name="version">
                <a-input
                  style={{ width: "240px" }}
                  placeholder="请输入"
                  disabled={!isEdit.value}
                  v-model:value={form.value.version}
                ></a-input>
              </a-form-item>
            </a-col>
            {/* <a-col span={6}>
              <a-form-item label="创建人">
                <a-input
                  style={{ width: "240px" }}
                  placeholder="请输入"
                  disabled
                  value={userinfo.value.employeeName || userinfo.value.userName}
                ></a-input>
              </a-form-item>
            </a-col> */}
            <a-col span={6}>
              <a-form-item label="发布时间">
                <a-input
                  style={{ width: "240px" }}
                  placeholder="请输入"
                  disabled
                  value={form.value.productionTime}
                ></a-input>
              </a-form-item>
            </a-col>
            <a-col span={6}>
              <a-form-item label="发布状态">
                <a-input
                  style={{ width: "240px" }}
                  placeholder="请输入"
                  disabled
                  value={
                    form.value.status === "production" ? "已发布" : "未发布"
                  }
                ></a-input>
              </a-form-item>
            </a-col>
            <a-col span={6}>
              <a-form-item label="详细描述" name="description">
                <a-input
                  style={{ width: "240px" }}
                  placeholder="10个字以内"
                  max={10}
                  disabled={!isEdit.value}
                  v-model:value={form.value.description}
                ></a-input>
              </a-form-item>
            </a-col>
          </a-row>
        </a-form>
        {!isAdd.value && (
          <div class="page-container">
            <a-tabs v-model:activeKey={activeTab.value}>
              {pageTabList.value.map((tab) => (
                <a-tab-pane key={tab.value} tab={tab.tabLabel}>
                  <PageConfig
                    appId={props.id}
                    list={tab.pageList}
                    loading={isLoading.value}
                    isEdit={isEdit.value}
                    activeTab={activeTab.value}
                    onAdd={handleAddClick}
                    onDelete={handleDelete}
                    onRelease={handleRelease}
                  />
                </a-tab-pane>
              ))}
              <a-tab-pane key="script-global" tab="标准脚本">
                <ScriptGlobal appId={props.id} />
              </a-tab-pane>
              <a-tab-pane key="script" tab="定制脚本">
                <Script appId={props.id} />
              </a-tab-pane>
              <a-tab-pane key="alarm" tab="报警配置">
                {/* <Script appId={props.id} /> */}
                <iframe
                  src={alarmConfigUrl.value}
                  frameborder="0"
                  width="100%"
                  height="550"
                ></iframe>
              </a-tab-pane>
            </a-tabs>

            <AddPageModal
              defaultClient={activeTab.value}
              onOk={handleAddPage}
              v-model:visible={isAddVisible.value}
            />
          </div>
        )}
      </div>
    );
  },
});

export default AppDetail;
