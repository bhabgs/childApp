import { ApiInstance } from "inl-ui/dist/utils";
import { message } from "ant-design-vue";
import { useRouter } from "vue-router";
import { each } from "lodash";

const router = useRouter();

const apiInstance = new ApiInstance({
  timeout: 1000 * 60,
  onTokenExpired(res) {
    message.error("登录已过期，请重新登录");
    router.push("/login");
  },
  baseURL: "/api/",
});

const getInstance = (opt: any) => {
  return instance;
};

const instance = apiInstance.instance;
export { instance, getInstance };

export function createPath(path: string) {
  return (arr, ...value) => {
    let str = "";
    each(arr, (left, i: number) => {
      str += left;
      if (i < arr.length - 1) {
        str += value[i];
      }
    });
    return `${path}/${str}`;
  };
}

export default instance;
