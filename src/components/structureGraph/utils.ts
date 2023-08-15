import { Graph } from "@antv/x6";
import { DagreLayout } from "@antv/layout";
import { TreeEdge, TreeNode } from "@/hooks/useStructureGraph";
import _ from "lodash";

/**
 * 自动布局
 */
export const layout = (
  graph: Graph,
  originData: any[],
  removeAfterEdge: any,
  dir: any = "LR"
) => {
  const size = { width: 100, height: 30 };

  const dagreLayout = new DagreLayout({
    type: "dagre",
    rankdir: dir,
    // align: "UL",
    ranksep: 80,
    nodesep: 15,
    controlPoints: false,
    nodeOrder: originData.map((item) => item.thingInst.id),
  });

  const nodes = graph.getNodes().map((item) => ({ ...item, size }));
  const edges = graph.getEdges().map((item: any) => ({
    ...item,
    source: item.source.cell,
    target: item.target.cell,
  }));

  const layoutData = dagreLayout.layout({ nodes, edges });
  layoutData.nodes!.forEach((node: any) => {
    node.x -= node.size.width / 2;
    node.y -= node.size.height / 2;

    const n = graph.getCellById(node.id);
    n.translate(node.x, node.y);
  });

  // 去除单独节点之间的联系
  const allEdges = graph.getEdges();

  const singleEdges: string[] = _.uniq(_.flatten(removeAfterEdge));

  removeAfterEdge.forEach(([start, end]) => {
    const removeEdge = allEdges.find(
      (item: any) => item.source.cell === start && item.target.cell === end
    );
    removeEdge && graph.removeEdge(removeEdge);
  });

  singleEdges.forEach((item) => {
    const node: any = graph.getCellById(item);
    node.setParent(null);
    node.setChildren([]);
    node.toggleButtonVisibility(false);
    const prevData = node.getData();
    // node.setData(_.omit(prevData, "parent"));
    delete node.getData().parent;
  });
};

export const transformGraphData = (tree: any[]) => {
  let result: any = { nodes: [], edges: [] };
  const expanded = (datas, parent) => {
    datas.forEach((e) => {
      result.nodes.push({
        ...e,
        id: e.thingInst.id,
        shape: "tree-node",
        width: 150,
        height: 30,
        leaf: e.child && e.child.length > 0 ? false : true,
        attrs: {
          name: {
            textWrap: {
              text: `${e.thingInst.name}`,
            },
          },
          code: {
            textWrap: {
              text: `${e.thingInst.code}`,
            },
          },
        },
        parent: parent && parent.thingInst.id,
      });

      if (parent) {
        result.edges.push({
          source: parent.thingInst.id,
          target: e.thingInst.id,
          shape: "tree-edge",
          // attrs: {
          //   line: {
          //     stroke: color,
          //     strokeWidth: 1,
          //   },
          // },
        });
      }

      if (e.child && e.child.length > 0) {
        expanded(e.child, e);
      }
    });
  };
  expanded(tree, null);
  return result;
};

export const changeData = (
  graphData: any,
  transformGraphData,
  graph: Graph,
  removeAfterEdge: any
) => {
  const nodes = graphData.nodes.map(({ leaf, ...metadata }: any) => {
    const node = new TreeNode({ ...metadata, data: metadata });
    if (leaf) {
      node.toggleButtonVisibility(leaf === false);
    }
    return node;
  });
  const edges = graphData.edges.map((edge: any) => {
    return new TreeEdge({
      source: { cell: edge.source },
      target: { cell: edge.target },
    });
  });
  graph!.resetCells([...nodes, ...edges]);
  layout(graph, transformGraphData, removeAfterEdge);
};
