import { defineComponent, KeepAlive, Component } from "vue";
import { useCacheExclude } from "inl-ui/dist/hooks";
import { microAppUtils } from "inl-ui/dist/utils";
import { Layout, LayoutSider, LayoutContent } from "ant-design-vue";
import SideMenu from "./sideMenu";

/**
 * 默认布局 (左侧菜单 右侧内容)
 */
const DefaultLayout = defineComponent({
  beforeRouteEnter(to) {
    // 作为微应用时不判断token
    if (microAppUtils.isMicroApp || to.path === "/login") {
      return;
    }
    const token = sessionStorage.getItem("token");
    const userinfo = sessionStorage.getItem("userinfo");
    if (!token || !userinfo) {
      return "/login";
    }
  },
  setup() {
    const [excludeRoutes, getRouteCpnKey] = useCacheExclude();

    return () => {
      if (microAppUtils.isMicroApp) {
        return (
          <router-view
            v-slots={{
              default: ({ Component: cpn }: { Component: Component }) => (
                <KeepAlive exclude={excludeRoutes.value}>
                  <cpn key={getRouteCpnKey(cpn)} />
                </KeepAlive>
              ),
            }}
          ></router-view>
        );
      }
      return (
        <Layout class="default-layout">
          <LayoutSider class="sider">
            <SideMenu />
          </LayoutSider>
          <LayoutContent class="layout-content">
            <div class="content-inner">
              <router-view></router-view>
            </div>
          </LayoutContent>
        </Layout>
      );
    };
  },
});

export default DefaultLayout;
