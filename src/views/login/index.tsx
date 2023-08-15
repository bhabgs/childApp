import { defineComponent, onMounted, onUnmounted, reactive, ref } from "vue";
import { Login as LoginImpl } from "inl-ui/dist/components";
import api from "@/api/client";
import ms from "@/assets/images/ms.png";
import bg from "@/assets/images/loginBackground.png";

/**
 * 登录
 */
const Login = defineComponent({
  setup() {
    let timer: any;
    const data = reactive<any>({
      form: {
        customerName: "", // 客户名称
        projectName: "", // 项目名称
        productName: "", // 系统名称
        loginSysDesc: "", // 登录系统描述
        loginCopyright: "", // 登录版权信息
        homepageCopyright: "", // 主页版权信息
      },
      loginPageSystemTitle: "", // 登录页系统标题
      loginMainPic: "", // 登录页主图
      loginSystemLogo: "", // 登录页系统logo
      mainPageLogo: "",
    });
    const status = ref(false);
    const http = async () => {
      // 获取系统配置信息
      const res = await api.getSysConfig();
      Object.keys(data.form).forEach((item) => {
        data.form[item] = res.data[item];
      });
      // res.data.style === 1 ? theme.set('dark') : theme.set('default');
      sessionStorage.setItem("homepageCopyright", data.form.homepageCopyright);
      // 获取图片
      Object.keys(data)
        .filter((item) => item !== "form")
        .forEach(async (item, index) => {
          data[`${item}`] = window.URL.createObjectURL(
            await api.searchImage(index + 1, 1)
          );
        });
      timer = setTimeout(() => {
        status.value = true;
      }, 100);
    };
    onMounted(() => {
      http();
    });
    onUnmounted(() => {
      clearTimeout(timer);
    });

    // 登录后调用日志接口
    const handleInsertLog = async () => {
      const userinfo = JSON.parse(sessionStorage.getItem("userinfo")!);
      await api.insertLogRecord({
        createUser: userinfo.userName,
        softSysId: "1",
        operateId: "110",
        recordId: "11",
        content: "登入",
      });
    };

    return () => (
      <div class="login">
        <LoginImpl
          loginMainImg={data.loginMainPic}
          titleLogo={data.loginPageSystemTitle}
          systemLogo={data.loginSystemLogo}
          ms={ms}
          bg={bg}
          status="platform" // platform system
          // systemName='智能压滤系统'
          systemName={data.form.productName}
          systemDescribe=""
          // projectName='工业物联平台'
          projectName="系统登录"
          copyright={data.form.loginCopyright}
          onLogin={handleInsertLog}
        />
      </div>
    );
  },
});

export default Login;
