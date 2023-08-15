import { defineComponent, ref } from "vue";
import { useRouter } from "vue-router";
import { TableOutlined, BarsOutlined } from "@ant-design/icons-vue";
import { Modal, message } from "ant-design-vue";
import TableView from "./views/table";
import CardView from "./views/card";
import * as api from "@/api/appCenter/appManager";

/**
 * 应用管理
 */
const AppManager = defineComponent({
  name: "AppManager",
  setup() {
    const router = useRouter();

    const activeView = ref("table");

    const handleToggleView = (view: string) => {
      activeView.value = view;
    };

    const handleDelete = (app, refresh) => {
      Modal.confirm({
        title: "提示",
        content: `确认删除应用“${app.fullname}”吗？`,
        async onOk() {
          api.deleteApp([app.id]);
          message.success("删除成功");
          refresh();
        },
      });
    };

    const handleRelease = async (app, refresh) => {
      const { data } = await api.getUnreleasePageByAppId(app.id);
      if (data.length > 0) {
        Modal.warn({
          title: "提示",
          content: `应用“${app.fullname}”还有未发布的页面，请先发布`,
          okText: "确定",
        });
        return;
      }
      Modal.confirm({
        title: "提示",
        content: `确定发布应用“${app.fullname}”吗？`,
        async onOk() {
          await api.releaseApp(app.id);
          message.success("发布成功");
          refresh();
        },
      });
    };

    const handleDetail = (app, isEdit = true) => {
      router.push({
        name: "appDetail",
        params: { id: app.id },
        query: {
          name: `应用详情 ${app.name}`,
          isEdit: String(isEdit),
        },
      });
    };

    const handleAddApp = () => {
      router.push({
        name: "appDetail",
        params: { id: "add" },
        query: {
          name: `添加应用`,
        },
      });
    };

    return () => {
      const ViewCpn = activeView.value === "table" ? TableView : CardView;
      return (
        <div class="app-manager">
          <ViewCpn
            onAdd={handleAddApp}
            onDetail={(app) => handleDetail(app, false)}
            onEdit={(app) => handleDetail(app, true)}
            onDelete={handleDelete}
            onRelease={handleRelease}
            v-slots={{
              toggle: () => (
                <a-radio-group size="small" v-model:value={activeView.value}>
                  <a-radio-button value="card">
                    <TableOutlined />
                  </a-radio-button>
                  <a-radio-button value="table">
                    <BarsOutlined />
                  </a-radio-button>
                </a-radio-group>
              ),
            }}
          />
        </div>
      );
    };
  },
});

export default AppManager;
