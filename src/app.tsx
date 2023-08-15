import { defineComponent, inject, provide } from "vue";
import { useQianKunState } from "inl-ui/dist/hooks";
import { microAppUtils } from "inl-ui/dist/utils/index";
import { ConfigProvider } from "ant-design-vue";
import zhCN from "ant-design-vue/es/locale/zh_CN";
import dayjs from "dayjs";
import "dayjs/locale/zh-cn";

dayjs.locale("zh-cn");

const App = defineComponent({
  setup() {
    const qiankunProps = inject("qiankunProps");
    const qiankunState = useQianKunState(qiankunProps);
    provide("qiankunState", qiankunState);

    const popupContainer = () =>
      microAppUtils.isMicroApp
        ? () =>
            document.querySelector(
              `div[data-qiankun='${import.meta.env.VITE_APP_NAME}']`
            ) as HTMLElement
        : undefined;

    return () => (
      <ConfigProvider locale={zhCN} getPopupContainer={popupContainer()}>
        <router-view />
      </ConfigProvider>
    );
  },
});

export default App;
