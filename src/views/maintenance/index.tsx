import { defineComponent, ref, reactive } from "vue";
import * as api from "@/api/maintenance";
import dayjs from "dayjs";
import { TableColumnType } from "ant-design-vue";
import { marked } from "marked";
import hljs from "highlight.js";
import { useRouter } from "vue-router";
import md from "./README.md?raw";

export default defineComponent({
  setup() {
    // 可用版本列表
    const versionList = ref<Array<any>>([]);

    // 当前版本
    const currentVersion = ref("1.0.0");

    // 获取数据源
    const getDataSource = async () => {
      const res = await api.getVersions();
      versionList.value = res.data.map((item) => {
        return item;
      });
    };
    getDataSource();
    const router = useRouter();
    // markdown render
    let toc: Array<any> = [];
    const renderer = (function () {
      var renderer = new marked.Renderer();
      renderer.heading = function (text, level, raw) {
        var anchor =
          this.options.headerPrefix +
          raw.toLowerCase().replace(/[^\w\\u4e00-\\u9fa5]]+/g, "-");
        toc.push({
          anchor: anchor,
          level: level,
          text: text,
        });
        const topHtml = `<h${level} id="${anchor}">${text}</h${level}>`;
        return topHtml;
      };
      return renderer;
    })();
    marked.setOptions({
      renderer: renderer,
      gfm: true,
      breaks: false,
      pedantic: false,
      sanitize: true,
      smartLists: true,
      smartypants: false,
      langPrefix: "hljs language-",
      highlight: function (code) {
        return hljs.highlightAuto(code).value;
      },
    });
    // 获取列
    const createColumns: () => TableColumnType[] = () => {
      return [
        {
          title: "序号",
          width: 100,
          customRender({ index }) {
            return index + 1;
          },
        },
        {
          title: "可用版本",
          dataIndex: "versionName",
          key: "versionName",
        },
        {
          title: "更新时间",
          dataIndex: "updateDt",
          customRender({ index, record }) {
            return dayjs(record.updateDt).format("YYYY-MM-DD HH:mm:ss");
          },
        },
        {
          title: "操作",
          width: 280,
          customRender({ index, record }) {
            return (
              <div>
                <a-button
                  type="link"
                  onClick={async () => {
                    const res = await api.getVersionDetail(record.versionName);
                    const MD = res.data.md || md;
                    toc = [];
                    const tokens = marked.lexer(MD);
                    const headings = tokens.filter(
                      (token) => token.type === "heading"
                    );
                    let tocmd = "# 版本说明 \n";
                    headings.forEach((entry: any) => {
                      console.log(entry);
                      // n个空格
                      const space = new Array(entry.depth * 2)
                        .fill("&nbsp;&nbsp;")
                        .join("");
                      // 生成目录
                      tocmd += `#### ${space}[${entry.text}](${entry.text})\n`;
                    });
                    markdownHtml.value = marked(tocmd + MD);
                    changeModalInfo(1);
                  }}
                >
                  版本说明
                </a-button>

                <a-button
                  type="link"
                  onClick={() => {
                    router.push({
                      name: "maintenanceDiff",
                      params: { id: record.versionName },
                      query: {
                        name: `差分详情 ${record.versionName}`,
                      },
                    });
                  }}
                >
                  查分更新
                </a-button>
                {/* 
                <a-popconfirm
                  title="你确定删除这条信息吗?"
                  ok-text="是"
                  cancel-text="否"
                  onConfirm={() => {
                    console.log("删除");
                  }}
                  onCancel={() => {
                    console.log("取消");
                  }}
                >
                  <a-button type="link">删除</a-button>
                </a-popconfirm> */}
              </div>
            );
          },
        },
      ];
    };

    const modalInfo = reactive({
      visible: false,
      title: "集群信息",
      sliderValue: 10,
      width: 1500,
      // 集群信息
      flag: 0, // 0 集群信息弹窗 1 版本说明弹窗 2 查分更新弹窗
    });

    // markdown html
    const markdownHtml = ref("");

    // 修改弹窗信息
    const changeModalInfo = (flag: number) => {
      modalInfo.visible = true;
      modalInfo.flag = flag;
      switch (flag) {
        case 0:
          modalInfo.title = "组件信息";
          modalInfo.width = 1500;
          break;
        case 1:
          modalInfo.title = "版本说明";
          break;
        case 2:
          modalInfo.title = "查分更新";
          break;
      }
    };
    // 集群实例列表
    const comInstList = ref<Array<api.ClusterInstInfo>>([]);

    // 获取集群信息
    const getClusterInfo = async () => {
      const res = await api.getClusterInfo();
      comInstList.value = res.data.comInstList;
      currentVersion.value = res.data.versionName;
    };
    getClusterInfo();

    // 删除第一个p标签和内容
    const deleteFirstP = (html: string) => {
      const reg = /<p>(.*?)<\/p>/;
      return `${html.replace(reg, "")}`;
    };

    return () => (
      <div class={["maintenance"]}>
        <a-modal
          v-model:visible={modalInfo.visible}
          title={modalInfo.title}
          width={modalInfo.width}
          class="about-system-modal"
          destroyOnClose
          v-slots={{
            footer() {
              return (
                <a-button
                  key="back"
                  onClick={() => {
                    modalInfo.visible = false;
                  }}
                >
                  取消
                </a-button>
              );
            },
            header() {
              return <div></div>;
            },
          }}
        >
          {modalInfo.flag === 0 && (
            <a-list
              size="small"
              bordered
              data-source={comInstList.value}
              v-slots={{
                header: () => (
                  <>
                    <div class={"number"}>序号</div>
                    <div class={"name"}>实例名称</div>
                    <div class={"code"}>实例编码</div>
                    <div class={"bin-name"}>构件名</div>
                    <div class={"host"}>所在主机</div>
                    <div class={"time"}>部署时间 </div>
                    <div class={"run-state"}>运行状态</div>
                  </>
                ),
                renderItem: (item) => {
                  const itemInfo = item.item;
                  return (
                    <a-list-item>
                      <div class={"number"}>{item.index + 1}</div>
                      <div class={"name"}>{itemInfo.instName}</div>
                      <div class={"code"}>{itemInfo.instCode}</div>
                      <div class={"bin-name"}>{itemInfo.binName}</div>
                      <div class={"host"}>{itemInfo.atHost}</div>
                      <div class={"time"}>
                        {dayjs(itemInfo.deployDt).format("YYYY-MM-DD HH:mm:ss")}
                      </div>
                      <div class={"run-state"}>{itemInfo.runStatus}</div>
                    </a-list-item>
                  );
                },
              }}
            />
          )}
          {modalInfo.flag === 1 && (
            <div v-html={deleteFirstP(markdownHtml.value)}></div>
          )}
        </a-modal>
        <div class={"opt"}>
          <a-button type="primary">本地上传</a-button>
          &nbsp;&nbsp;
          <a-button
            onClick={async () => {
              await getClusterInfo();
              changeModalInfo(0);
            }}
          >
            组件信息
          </a-button>
        </div>
        <a-table
          dataSource={versionList.value}
          columns={createColumns()}
        ></a-table>
      </div>
    );
  },
});
