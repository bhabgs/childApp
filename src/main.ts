import {} from "vue";
import router from "./router";

import antd from "ant-design-vue";
import inl from "inl-ui";
import App from "./app";
import { cards } from "./utils/inlCard";
import cardV2 from "inl-card-linhuan-v2";

import "inl-ui/dist/iconfont.js";
import "inl-ui/dist/style.css";
import "inl-card-linhuan-v2/dist/style.css";

// import "../../../industrial-ui/packages/pc/dist/style.css";
// import "inl-card/dist/style.css";
import "./assets/style/index.less";

inl.utils.microAppUtils.render(App, "#app", (app, props) => {
  app.use(router).use(antd).use(inl).use(cardV2).use(cards);
  app.provide("qiankunProps", props);
});
