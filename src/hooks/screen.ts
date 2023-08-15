export const screen = {
  // 退出全屏
  exitFullscreen() {
    // const dom = document.getElementById(id)!;
    // dom.addEventListener("click", (event: any) => {
    //   if (document.fullscreenElement === dom) {
    //     document.exitFullscreen();
    //   }
    //   event.preventDefault();
    // });
    document.exitFullscreen();
  },
  // 进入全屏
  requestFullscreen(id: string) {
    const dom = document.getElementById(id) || document.documentElement;
    dom.requestFullscreen();
  },
};
// 判断是否是全屏状态
export const judgeFullscreen = () => {
  var explorer = window.navigator.userAgent.toLowerCase();
  if (explorer.indexOf("chrome") > 0) {
    // webkit
    if (
      document.body.scrollHeight === window.screen.height &&
      document.body.scrollWidth === window.screen.width
    ) {
      return true;
    } else {
      return false;
    }
  } else {
    // IE 9+  fireFox
    if (
      window.outerHeight === window.screen.height &&
      window.outerWidth === window.screen.width
    ) {
      return true;
    } else {
      return false;
    }
  }
};
