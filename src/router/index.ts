import { createRouter, createWebHashHistory } from "vue-router";
import routes from "./routes";
import { ChildLayout } from "inl-ui/dist/components";
import Login from "@/views/login";

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    {
      path: "/",
      name: "root",
      component: ChildLayout,
      children: routes,
    },
    { path: "/login", component: Login, meta: { hide: true } },
  ],
});

export default router;
