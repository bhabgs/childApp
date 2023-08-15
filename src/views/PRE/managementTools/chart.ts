import { Chart } from "@antv/g2";
export default (el, data) => {
  const chart = new Chart({
    container: el,
    autoFit: true,
    appendPadding: [0, 20, 0, 20],
  });
  const getSymbol = (name: string) => {
    const val = data.find((ele) => ele.pointCode === name);
    return val?.type;
  };
  chart.data(data);
  chart.scale("left", {
    nice: true,
  });
  chart.scale("right", {
    nice: true,
  });
  /* chart.axis("left", {
    label: {
      formatter: (val) => {
        return val + " °C";
      },
    },
  }); */

  chart.tooltip({
    shared: true,
    showMarkers: true,
    showCrosshairs: true,
  });

  chart.legend({
    position: "top",
    marker: (name, index, item: any) => {
      return {
        symbol: getSymbol(name),
        style: {
          fill: item.style.stroke,
          stroke: item.style.stroke,
          // lineWidth: 2,
        },
      };
    },
  });
  chart
    .interval({ useDeferredLabel: true })
    .position("dt*right")
    .color("pointCode")
    .adjust([
      {
        type: "dodge",
        marginRatio: 0,
      },
    ]);
  chart.line({ useDeferredLabel: true }).position("dt*left").color("pointCode");
  // chart
  //   .point({ useDeferredLabel: true })
  //   .position("dt*left")
  //   .color("pointCode");
  /* chart.option("slider", {
    start: 0,
    end: 0.5,
    trendCfg: {
      isArea: false,
    },
  }); */
  chart.render();
  return chart;
};
