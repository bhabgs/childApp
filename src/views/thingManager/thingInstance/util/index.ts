export const exportFun = (resource: any, name: string) => {
  const blob = new Blob([resource], {
    type: "text/html;charset=UTF-8",
  });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = name;
  a.style.display = "none";
  document.body.appendChild(a);
  a.click();
  a.remove();
};

export const triggerModeList = [
  {
    code: "get",
    name: "GET时触发",
  },
  {
    code: "timer",
    name: "定时触发",
  },
  {
    code: "change",
    name: "数据变化时触发",
  },
];
