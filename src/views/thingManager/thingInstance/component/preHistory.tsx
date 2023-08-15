import { defineComponent, ref, watch, reactive, nextTick } from 'vue';
import { Chart } from '@antv/g2';
import chart from '../hooks/preChart';
import dayjs, { Dayjs } from 'dayjs';
import * as api from '@/api/thingInstance';
import _ from 'lodash';

export default defineComponent({
  name: 'PreHistoryData',
  setup(props, { expose }) {
    const state = reactive<{
      visible: Boolean;
      propInfo: any;
      title: String;
      chartData: any[];
      minData: any;
      containerId: String;
    }>({
      visible: false,
      propInfo: {},
      title: '',
      chartData: [],
      minData: null,
      containerId: 'container',
    });
    /* 数据分析 */
    const dataAnalysisTime: any = ref([]);
    const dataAnalysisTab: any = ref('1hour');
    const dataAnalysisSpinning: any = ref(false);
    const dataAnalysisTabList: any = ref([
      { name: '近1小时', value: '1hour' },
      { name: '近1天', value: '1day' },
      { name: '近3天', value: '3day' },
      { name: '近7天', value: '7day' },
    ]);
    const open = (data: any) => {
      state.visible = true;
      state.title = `数据分析【${data.label}】`;
      state.propInfo = data;
      state.containerId = `ColumnChart_${data.thingPropertyCode}`;
      dataAnalysisTab.value = '1hour';
      getDataAnalysisTime(dataAnalysisTab.value);
      nextTick(() => initPieChart());
    };
    let columnChart = ref<Chart>();
    const getDataAnalysisTime = (val: string) => {
      const num = val.slice(0, 1);
      const unit: any = val.slice(0 - val.length + 1);
      dataAnalysisTime.value = [
        dayjs().subtract(+num, unit).format('YYYY-MM-DD HH:mm:ss'),
        dayjs().format('YYYY-MM-DD HH:mm:ss'),
      ];
    };

    const closeDataAnalysis = () => {
      if (columnChart.value && !columnChart.value.destroyed) {
        columnChart.value.destroy();
        columnChart.value = undefined;
        state.minData = null;
      }
    };
    const getParam = () => {
      const begin = dayjs(dataAnalysisTime.value[0]).unix();
      const end = dayjs(dataAnalysisTime.value[1]).unix();
      const time = end - begin;
      /* //秒 SECOND("s","%ds"),1day //分钟 MINUTE("m","%dm"), //小时 HOUR("h","%dh"), //天 DAY("d","%dd"), ; */
      if (time <= 60 * 60) return { timeNum: 1, timeUnit: 'SECOND' };
      else if (time > 60 * 60 && time <= 24 * 60 * 60)
        return { timeNum: 30, timeUnit: 'MINUTE' };
      else if (time > 24 * 60 * 60 && time <= 3 * 24 * 60 * 60)
        return { timeNum: 1, timeUnit: 'HOUR' };
      else if (time > 3 * 24 * 60 * 60) return { timeNum: 1, timeUnit: 'HOUR' };
    };

    const initPieChart = async () => {
      state.minData = null;
      dataAnalysisSpinning.value = true;
      let chartData: any = [];
      try {
        const {
          pointCode,
          thingPropertyCode,
          thingPropertyId,
          thingPropertyInstId,
          value,
        } = state.propInfo;
        let arr = [
          {
            pointCode,
            // instanceCode: '',
            propertyCode: thingPropertyCode,
            thingPropertyId,
            thingPropertyInstId,
            value,
          },
        ];

        const { data } = await api.getPreHistoryData({
          requestPrePointVoList: arr,
          startTime: dayjs(dataAnalysisTime.value[0]).valueOf(),
          endTime: dayjs(dataAnalysisTime.value[1]).valueOf(),
          downsample: {
            ...getParam(),
            aggregator: 'INTERP',
          },
        });
        data.map((item) => {
          item.historyDataList.map((pre) => {
            pre.dt = dayjs(pre.saveTime).format('YYYY-MM-DD HH:mm:ss');
            pre.valueShow = _.isNil(pre.formatValue)
              ? pre.formatValue
              : Number(pre.formatValue);

            pre.pointCode = item.pointCode;
            if (_.isNil(state.minData)) {
              state.minData = pre.valueShow;
            } else if (state.minData > pre.valueShow) {
              state.minData = pre.valueShow;
            }
            chartData.push(pre);
          });
        });
      } catch (error) {
      } finally {
        state.chartData = chartData;
        dataAnalysisSpinning.value = false;
        //数据为空时 销毁图表
        if (chartData.length === 0) {
          if (columnChart.value && !columnChart.value.destroyed) {
            closeDataAnalysis();
          }
          return;
        }
        if (!_.isNil(state.minData)) {
          state.minData = state.minData - 1;
          console.log(state.minData);
        }

        if (columnChart.value && !columnChart.value.destroyed) {
          columnChart.value.scale('valueShow', {
            type: 'linear',
            nice: true,
            min: state.minData,
          });
          columnChart.value.changeData(chartData);
        } else {
          columnChart.value = chart(
            state.containerId,
            chartData,
            state.propInfo.label,
            state.minData
          );
        }
      }
    };
    const handleModalCancel = () => {
      state.visible = false;
      closeDataAnalysis();
    };
    const handleModalOk = () => {};
    expose({
      open,
    });
    return () => (
      <>
        <a-modal
          visible={state.visible}
          title={state.title}
          onCancel={handleModalCancel}
          footer={null}
          width='900px'
        >
          <a-spin spinning={dataAnalysisSpinning.value}>
            <a-tabs
              // type="card"
              v-model={[dataAnalysisTab.value, 'activeKey']}
              onChange={() => {
                getDataAnalysisTime(dataAnalysisTab.value);
                initPieChart();
              }}
            >
              {dataAnalysisTabList.value.map((item: any) => (
                <a-tab-pane key={item.value} tab={item.name}></a-tab-pane>
              ))}
            </a-tabs>
            <a-range-picker
              format={'YYYY-MM-DD HH:mm:ss'}
              valueFormat={'YYYY-MM-DD HH:mm:ss'}
              v-model={[dataAnalysisTime.value, 'value']}
              onChange={() => {
                dataAnalysisTab.value = '';
                initPieChart();
              }}
              show-time
            />
            <div>
              <div class='columnChart' id={`${state.containerId}`}>
                {state.chartData.length === 0 &&
                  !dataAnalysisSpinning.value && (
                    <a-empty style='marginTop:100px' />
                  )}
              </div>
            </div>
          </a-spin>
        </a-modal>
      </>
    );
  },
});
