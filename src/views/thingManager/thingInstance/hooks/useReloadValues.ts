/*
 * @Abstract: 读取动态属性值
 * @Author: 张文杰
 */

import { reactive, ref, onMounted, watch, onUnmounted } from 'vue';
import * as thingApis from '@/api/thingInstance';

export default function useThingReloadValue(setValue: Function) {
  const timer: any = ref(null);
  //动态pre点
  const propsPointCode = ref<
    Array<{
      pointCode: string;
      value?: any;
    }>
  >([]);
  //报警属性alarmId点
  const propsAlarmId = ref<
    Array<{
      instanceUuid: string;
      propertyCode: string;
      ruleId: any;
    }>
  >([]);
  //逻辑属性
  const propsLogic = ref<
    Array<{
      thingInstCode: string;
      thingInstId: string;
      thingPropertyCode: string;
      thingCode: string;
    }>
  >([]);
  const preData = ref<Array<any>>([]);
  const alarmData = ref<Array<any>>([]);
  const logicData = ref<Array<any>>([]);
  //刷新表单动态值
  const reloadPropsValue = () => {
    const requestList: any[] = [];
    const nullPromise = new Promise((resolve) => {
      resolve({
        data: null,
      });
    });
    //pre
    if (propsPointCode.value.length > 0) {
      requestList.push(thingApis.getPropertiesValue(propsPointCode.value));
    } else {
      requestList.push(nullPromise);
    }
    // alarm
    if (propsAlarmId.value.length > 0 || propsLogic.value.length > 0) {
      requestList.push(
        thingApis.reloadLogicAndAlarm({
          requestAlarmPropertyList: propsAlarmId.value,
          requestLogicPropertyList: propsLogic.value,
        })
      );
    } else {
      requestList.push(nullPromise);
    }
    Promise.all(requestList).then((resArr) => {
      preData.value = resArr[0].data || [];
      if (resArr[1].data) {
        alarmData.value = resArr[1].data.responseAlarmPropertyList || [];
        logicData.value = resArr[1].data.responseLogicPropertyList || [];
      } else {
        alarmData.value = [];
        logicData.value = [];
      }
      setValue(preData.value, alarmData.value, logicData.value);
    });
  };
  onMounted(() => {
    reloadPropsValue();
    timer.value = setInterval(reloadPropsValue, 3000);
  });
  onUnmounted(() => {
    clearInterval(timer.value);
  });
  return {
    propsPointCode,
    propsAlarmId,
    propsLogic,
  };
}
