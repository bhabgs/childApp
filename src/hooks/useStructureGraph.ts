import { Edge, Graph, Node, Shape } from "@antv/x6";
import _ from "lodash";
import { onMounted, Ref, ref } from "vue";

// 定义节点
export class TreeNode extends Node {
  private collapsed: boolean = false;

  protected postprocess() {
    this.toggleCollapse(false);
  }

  isCollapsed() {
    return this.collapsed;
  }

  toggleButtonVisibility(visible: boolean) {
    this.attr("buttonGroup", {
      display: visible ? "block" : "none",
    });
  }

  toggleHoverVisibility(visible: boolean) {
    this.attr("hover", {
      display: visible ? "block" : "none",
    });
  }

  toggleCollapse(collapsed?: boolean) {
    const target = collapsed == null ? !this.collapsed : collapsed;
    if (!target) {
      this.attr("buttonSign", {
        d: "M 2 5 8 5",
        strokeWidth: 1.6,
      });
    } else {
      this.attr("buttonSign", {
        d: "M 1 5 9 5 M 5 1 5 9",
        strokeWidth: 1.8,
      });
    }
    this.collapsed = target;
  }
}

// 定义边
export class TreeEdge extends Shape.Edge {
  isHidden() {
    const node = this.getTargetNode() as TreeNode;
    return !node || !node.isVisible();
  }
}

export function useStructureGraph(
  container: Ref<HTMLElement>,
  color: string,
  {
    onChangeParent,
    onMouseEnter,
    onMouseLeave,
    onDbclick,
    onDeleteRelationship,
  }
) {
  TreeNode.config({
    zIndex: 2,
    markup: [
      {
        tagName: "g",
        selector: "buttonGroup",
        children: [
          {
            tagName: "rect",
            selector: "button",
            attrs: {
              "pointer-events": "visiblePainted",
            },
          },
          {
            tagName: "path",
            selector: "buttonSign",
            attrs: {
              fill: "none",
              "pointer-events": "none",
            },
          },
        ],
      },
      {
        tagName: "div",
        selector: "hover",
        attrs: {},
      },
      {
        tagName: "rect",
        selector: "body",
      },
      {
        tagName: "text",
        selector: "name",
      },
      // {
      //   tagName: "text",
      //   selector: "code",
      // },
    ],
    attrs: {
      body: {
        refWidth: "100%",
        refHeight: "100%",
        strokeWidth: 1,
        fill: "#EFF4FF",
        stroke: "#5F95FF",
      },
      name: {
        textWrap: {
          ellipsis: true,
          breakWord: true,
          // height: "50%",
          width: -10,
        },
        textAnchor: "middle",
        textVerticalAnchor: "middle",
        refX: "50%",
        refY: "50%",
        fontSize: 14,
      },
      // code: {
      //   textWrap: {
      //     ellipsis: true,
      //     breakWord: true,
      //     // height: "50%",
      //     width: -10,
      //   },
      //   textAnchor: "middle",
      //   textVerticalAnchor: "middle",
      //   refX: "50%",
      //   refY: "75%",
      //   fontSize: 12,
      // },
      buttonGroup: {
        refX: "100%",
        refY: "50%",
        // refDx: -16,
        // refY: 16,
      },
      hover: {
        refX: 10,
        refY: 10,
        // x: 10,
        // y: 10,
      },
      button: {
        fill: "#5F95FF",
        stroke: "none",
        x: -10,
        y: -10,
        height: 20,
        width: 30,
        rx: 10,
        ry: 10,
        cursor: "pointer",
        event: "node:collapse",
      },
      buttonSign: {
        refX: 5,
        refY: -5,
        stroke: "#FFFFFF",
        strokeWidth: 1.6,
      },
    },
  });

  TreeEdge.config({
    zIndex: 1,
    attrs: {
      line: {
        stroke: color,
        strokeWidth: 1,
        targetMarker: null,
      },
    },
  });

  // 注册
  Node.registry.register("tree-node", TreeNode, true);
  Edge.registry.register("tree-edge", TreeEdge, true);

  // 初始化画布
  const graph = ref<Graph>();
  onMounted(() => {
    graph.value = new Graph({
      container: container.value,
      panning: true, // 画布是否可以拖动
      // interacting: false,
      mousewheel: true, // 鼠标滚轮缩放
      sorting: "none",
      history: true,
      connecting: {
        // 连线选项
        anchor: "orth",
        connector: "rounded",
        connectionPoint: "rect",
        router: {
          name: "er",
          args: {
            offset: 24,
            direction: "H",
          },
        },
      },
      embedding: true,
      highlighting: {
        embedding: {
          name: "stroke",
          args: {
            padding: -1,
            attrs: {
              stroke: "#73d13d",
            },
          },
        },
      },
    });

    graph.value.on("node:collapse", ({ node }: { node: TreeNode }) => {
      node.toggleCollapse();
      const collapsed = node.isCollapsed();
      const run = (pre: TreeNode) => {
        const succ = graph.value!.getSuccessors(pre, { distance: 1 }) as any[];
        if (succ) {
          succ.forEach((node: TreeNode) => {
            node.toggleVisible(!collapsed);
            if (!node.isCollapsed()) {
              run(node);
            }
          });
        }
      };
      run(node);
    });

    // graph.value.zoomTo(getZoom(graphData.nodes.length));
    graph.value.zoomTo(1);

    graph.value.on("node:mouseenter", onMouseEnter);

    graph.value.on("node:mouseleave", onMouseLeave);

    // 修改父节点
    graph.value.on(
      "node:change:parent",
      async ({ node, current, previous, options }) => {
        if (!current || !options?.ui) return;
        const parent = graph.value!.getCellById(current);
        const childThingData = node.getData();
        const parentThingData = parent.getData();
        onChangeParent(parentThingData, childThingData);
      }
    );

    graph.value.on("node:dblclick", async ({ node }) => {
      const instance = node.getData();
      onDbclick(instance);
    });

    // 拖动 记录位置
    const dragPrevPosition = { x: 0, y: 0 };
    graph.value.on("node:mousedown", ({ x, y }) => {
      dragPrevPosition.x = x;
      dragPrevPosition.y = y;
    });

    // 拖动父节点 子节点也跟随移动
    graph.value.on("node:moving", ({ x, y, node }) => {
      const offsetX = x - dragPrevPosition.x;
      const offsetY = y - dragPrevPosition.y;
      const allNodes = graph.value!.getNodes();

      const getAllChildren = (parentId) => {
        const children = allNodes.filter(
          (item) => item.getData().parent === parentId
        );

        return _.flatten([
          ...children,
          ...children.map((item) => getAllChildren(item.id)),
        ]);
      };

      const children: Node[] = getAllChildren(node.id);
      children.forEach((item) => {
        const itemPosition = item.getPosition();
        item.setPosition({
          x: itemPosition.x + offsetX,
          y: itemPosition.y + offsetY,
        });
      });

      dragPrevPosition.x = x;
      dragPrevPosition.y = y;
    });

    // 鼠标悬浮到线上 展示叉号
    graph.value.on("edge:mouseenter", ({ edge }) => {
      edge.addTools([
        {
          name: "button-remove",
          args: {
            distance: -80,
            markup: { visible: false },
            onClick: ({ cell }) => {
              const { source, target } = cell;
              const sourceInstance = graph
                .value!.getCellById(source.cell)
                .getData();
              const targetInstance = graph
                .value!.getCellById(target.cell)
                .getData();
              onDeleteRelationship(sourceInstance, targetInstance);
            },
          },
        },
      ]);
    });
    graph.value.on("edge:mouseleave", ({ edge }) => {
      edge.removeTool("button-remove");
    });
  });

  return graph;
}
