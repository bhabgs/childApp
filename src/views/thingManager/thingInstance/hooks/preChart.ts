import { Chart } from '@antv/g2';
export default (el, data, alias, min: any) => {
  const chart = new Chart({
    container: el,
    autoFit: true,
    appendPadding: [10, 20, 0, 20],
  });

  chart.data(data);
  chart.scale('valueShow', {
    type:'linear',
    nice: true,
    alias,
    min,
  });

  chart.scale('dt', {
    type: 'timeCat',
    mask: 'YYYY-MM-DD HH:mm:ss',
  });

  chart.tooltip({
    shared: true,
    showMarkers: true,
    showCrosshairs: true,
  });

  chart.line({ useDeferredLabel: true }).position('dt*valueShow').color('#1ACAD7');
  // chart.point({ useDeferredLabel: true }).position('dt*valueShow').size(5).color('#1ACAD7');
  // .color('pointCode', [
  //   '#1ACAD7',
  //   '#22CC83',
  //   '#FFC414',
  //   '#FF8214',
  //   '#6656F4',
  // ]);
  // chart
  //   .point({ useDeferredLabel: true })
  //   .position('dt*valueShow')
  //   .color('prePointCode');
  chart.render();

  return chart;
};
