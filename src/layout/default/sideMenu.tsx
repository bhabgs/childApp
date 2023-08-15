import { computed, defineComponent } from "vue";
import { useRouter, useRoute, RouteRecordRaw } from "vue-router";
import { Menu, MenuItem, SubMenu } from "ant-design-vue";

/**
 * 侧边菜单
 */
const SideMenu = defineComponent({
  setup() {
    const router = useRouter();
    const route = useRoute();
    // 菜单列表
    const menuList = computed(() => {
      const allRoutes = router.options.routes;
      const root = allRoutes.find((item) => item.name === "root");
      return root?.children ?? [];
    });

    const activeMenu = computed(() => route.path);

    const handleMenuSelect = (menu: any) => {
      router.push(menu.key);
    };

    const renderMenu = (menu: RouteRecordRaw) => {
      if (menu.children?.length) {
        return (
          <SubMenu key={menu.path} title={menu.meta?.title}>
            {menu.children.map((item) => renderMenu(item))}
          </SubMenu>
        );
      }
      return <MenuItem key={menu.path}>{menu.meta?.title}</MenuItem>;
    };

    return () => (
      <div class="sideMenu">
        <Menu
          mode="inline"
          activeKey={activeMenu.value}
          onSelect={handleMenuSelect}
        >
          {menuList.value.map((item) => renderMenu(item))}
        </Menu>
      </div>
    );
  },
});

export default SideMenu;
