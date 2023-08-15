import { defineComponent, watch, PropType, ref, nextTick, computed } from "vue";
import { useStructureGraph } from "@/hooks/useStructureGraph";
import _ from "lodash";
import { layout as layoutImpl, transformGraphData, changeData } from "./utils";
// import { MiniMap } from "@antv/x6-plugin-minimap";

import "@/assets/style/components/GraphComp.less";

/**
 * 物实例组织架构图
 */
const StructureGraph = defineComponent({
  name: "graph",
  emits: ["setRelationship", "instanceClick", "removeRelationShip"],
  props: {
    treeData: {
      type: Array as PropType<any>,
      default: [],
    },
  },
  setup(props, { emit, expose }) {
    const containerRef = ref();

    const color =
      localStorage.getItem("theme") === "dark" ? "#1d33a2" : "#3e7eff";

    const graph = useStructureGraph(containerRef, color, {
      // 设置关联关系
      onChangeParent: (parent, child) => {
        emit("setRelationship", parent, child);
      },
      // 双击跳转实例详情
      onDbclick: (instance) => {
        emit("instanceClick", instance);
      },
      // 展示提示框
      onMouseEnter: async ({ e, node }) => {
        hoverNode.value = node.getData();
        await nextTick();
        const toolipHeight = tooltipRef.value!.getBoundingClientRect().height;
        const toolipWidth = tooltipRef.value!.getBoundingClientRect().width;
        const boxHeight = boxRef.value!.getBoundingClientRect().height;
        const boxWidth = boxRef.value!.getBoundingClientRect().width;
        const isOverX = e.offsetX + toolipWidth > boxWidth;
        const isOverY = e.offsetY + toolipHeight > boxHeight;
        tooltip.value.x = isOverX ? e.offsetX - toolipWidth : e.offsetX;
        tooltip.value.y = isOverY ? e.offsetY - toolipHeight : e.offsetY;
        tooltip.value.visible = true;
      },
      // 隐藏提示框
      onMouseLeave: () => {
        tooltip.value.visible = false;
      },
      // 删除关系
      onDeleteRelationship: (source, target) => {
        emit("removeRelationShip", source, target);
      },
    });

    // 鼠标移入提示
    const tooltipRef = ref<HTMLDivElement>();
    const boxRef = ref<HTMLDivElement>();
    const tooltip = ref({ x: 0, y: 0, visible: false });
    const hoverNode = ref();

    /**
     * 先给单独的节点之间加上联系，布局时可以排列成一条直线 布局之后再删除联系
     */
    const transTreeData = computed(() => {
      const WRAP_NUM = 5;

      const treeData = _.cloneDeep(props.treeData);
      const hasChildNodeList = treeData.filter((item) => item.child?.length);
      const singleNodeList = treeData.filter((item) => !item.child?.length);

      const singleList: any[] = [];

      for (let i = 0; i < singleNodeList.length; i++) {
        const current = singleNodeList[i];
        const next = singleNodeList[i + 1];
        let parent;
        if (i % WRAP_NUM === 0) {
          singleList.push(current);
          parent = current;
        } else {
          const idx = Math.floor(i / WRAP_NUM);
          parent = singleList[idx];
        }

        if (singleNodeList[i + 1] && i % WRAP_NUM !== WRAP_NUM - 1) {
          singleNodeList[i].child = [singleNodeList[i + 1]];
        }
      }
      return [...hasChildNodeList, ...singleList];
    });
    const removeAfterEdge = computed(() => {
      const singleNodeList = props.treeData.filter(
        (item) => !item.child?.length
      );
      const res: string[][] = [];
      for (let i = 0; i < singleNodeList.length; i++) {
        const current = singleNodeList[i];
        const next = singleNodeList[i + 1];
        if (current && next) {
          res.push([current.thingInst.id, next.thingInst.id]);
        }
      }
      return res;
    });

    // 刷新图表数据和布局
    const refreshGraph = () => {
      const graphData = transformGraphData(transTreeData.value);
      changeData(
        graphData,
        transTreeData.value,
        graph.value!,
        removeAfterEdge.value
      );
    };

    watch(transTreeData, refreshGraph);

    // 导出重新布局函数
    expose({
      layout: refreshGraph,
      undo: () => graph.value?.undo(),
    });

    return () => (
      <div class="GraphComp" ref={boxRef}>
        <div ref={containerRef} class="graphBox" />
        {/* <div id="productionSystem_minimap" /> */}
        <div
          class={["thing-node-tooltip", { hide: !tooltip.value.visible }]}
          style={{
            left: tooltip.value.x + "px",
            top: tooltip.value.y + "px",
          }}
          onMouseenter={() => (tooltip.value.visible = true)}
          onMouseleave={() => (tooltip.value.visible = false)}
          ref={tooltipRef}
        >
          <div class="desc-item">
            <div class="label">实例名称</div>
            <div class="value">{hoverNode.value?.thingInst?.name}</div>
          </div>
          <div class="desc-item">
            <div class="label">实例编码</div>
            <div class="value">{hoverNode.value?.thingInst?.code}</div>
          </div>
          {/* <div class="desc-item">
            <div class="label">实例id</div>
            <div class="value">{hoverNode.value?.thingInst?.id}</div>
          </div> */}
          <div class="desc-item">
            <div class="label">物模型名称</div>
            <div class="value">{hoverNode.value?.thingInst.thing?.name}</div>
          </div>
          <div class="desc-item">
            <div class="label">物模型编码</div>
            <div class="value">{hoverNode.value?.thingInst.thing?.code}</div>
          </div>
        </div>
      </div>
    );
  },
});

export default StructureGraph;
