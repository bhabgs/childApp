import { defineComponent, ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import {
  trim,
  size,
  toPairs,
  isNull,
  isObject,
} from 'lodash';
import { useSessionStorage } from '@vueuse/core';
import { message, Modal } from 'ant-design-vue';
import { downloadPropertyValue, setAlarmValid, resetAlarm } from '@/api/thingInst';

export default defineComponent({
  props: {
    instanceId: {
      type: String,
      default: '',
    },
    data: {
      type: Object,
      default: null,
    },
    value: {
      type: Object,
      default: null,
    },
  },
  emits: ['change'],
  setup(props, { emit }) {
    const router = useRouter();
    const cv = ref('');
    const v = computed(() => {
      if (props.value) {
        return props.value;
      }
      return props.data;
    });
    const down = (value) => new Promise((resolve) => {
      downloadPropertyValue(props.data.thingPropertyId, props.data.pointCode, value).then(({ data }) => {
        if (data) {
          message.success('下发成功');
        } else {
          message.error('下发失败');
        }
      }).finally(() => {
        emit('change');
        resolve(true);
      });
    });
    const confirm = () => new Promise((resolve) => {
      Modal.confirm({
        title: props.data.label,
        content: '请确认安全后执行',
        onOk() {
          resolve(true);
        },
      });
    });
    const onClick = () => {
      if (trim(cv.value) === '') {
        message.warn('请填写要下发的值');
      } else {
        confirm().then(() => {
          down(cv.value).then(() => {
            cv.value = '';
          });
        });
      }
    };
    const onSwitchChange = (checked) => {
      confirm().then(() => {
        down(checked);
      });
    };
    const onStatusClick = (val) => {
      confirm().then(() => {
        down(val);
      });
    };
    const onAlarmSwitchChange = (available) => {
      confirm().then(() => {
        setAlarmValid({
          instanceUuid: props.instanceId,
          propertyCode: props.data.thingPropertyCode,
          prePointCode2: props.data.pointCode2,
          available,
          ruleId: v.value.alarmDTO.ruleId,
        }).then(() => {
          emit('change');
          message.success('设置成功');
        });
      });
    };
    const onAlarmReset = () => {
      if (v.value.alarmDTO.manuReleasable) {
        resetAlarm({
          instanceUuid: props.instanceId,
          propertyCode: props.data.thingPropertyCode,
          ruleId: v.value.alarmDTO.ruleId,
          prePointCode: props.data.pointCode,
        }).then(({ data }) => {
          message.success(data ? '消警成功' : '消警失败');
        });
      }
    };

    const renderValue = () => {
      let colorTrans = null;
      let _v;
      if (props.data.displayType === 'ALARM' && isNull(props.data.alarmId)) {
        return '未配置';
      }
      _v = v.value.displayValue ?? v.value.value ?? '-';
      if (isObject(_v)) {
        _v = JSON.stringify(_v);
      }
      if (
        (
          props.data.displayType === 'ALARM'
          || props.data.displayType === 'SIGNAL'
        )
        && props.data.colorTrans
        && !isNull(v.value.value)
      ) {
        try {
          colorTrans = JSON.parse(props.data.colorTrans);
        } catch {
          console.warn(`${props.data.pointCode} 颜色转换出错`);
        }
      }
      if (colorTrans && size(colorTrans)) {
        return (
          <span class="topo-preview-dialog-state" style={{ color: colorTrans[v.value.value] }}>
            <i style={{ backgroundColor: colorTrans[v.value.value] }}></i>
            {_v}
          </span>
        );
      }
      return _v;
    };
    const renderControl = () => {
      let listInfo = null;
      if (props.data.listType === 'json' && props.data.listInfo) {
        try {
          listInfo = JSON.parse(props.data.listInfo);
        } catch {
          console.warn(`${props.data.pointCode} 值转换出错`);
        }
      }
      if (props.data.displayType === 'BUTTON_PARAMETER') {
        let precision;
        let max;
        let min;
        let step;
        if (props.data.thingInstPropertyValidVo) {
          ({
            decimalPlace: precision,
            maxValue: max,
            minValue: min,
            step,
          } = props.data.thingInstPropertyValidVo);
        }
        return (
          <a-form layout="inline" class="topo-preview-dialog-control">
            <a-form-item>
              <a-input-number
                v-model={[cv.value, 'value']}
                precision={precision}
                max={max}
                min={min}
                step={step || 1}
                size="small"
              ></a-input-number>
              <a-button size="small" onClick={onClick}>下发</a-button>
            </a-form-item>
          </a-form>
        );
      }
      if (
        props.data.displayType === 'SWITCH'
        && listInfo
        && size(listInfo) === 2
      ) {
        const [
          [unCheckedValue, unCheckedChildren],
          [checkedValue, checkedChildren],
        ] = toPairs(listInfo);
        return (
          <a-switch
            checked={v.value.value}
            unCheckedValue={unCheckedValue}
            unCheckedChildren={unCheckedChildren}
            checkedValue={checkedValue}
            checkedChildren={checkedChildren}
            onChange={onSwitchChange}
          ></a-switch>
        );
      }
      if (
        props.data.displayType === 'BUTTON_STATUS'
        && listInfo
        && size(listInfo) === 1
      ) {
        const [[val, label]] = toPairs(listInfo);
        return (
          <a-button class="topo-preview-dialog-button-status" size="small" onClick={() => onStatusClick(val)}>{ label }</a-button>
        );
      }
      if (
        props.data.displayType === 'ALARM'
        && !isNull(v.value.value)
        && !!v.value.alarmDTO
      ) {
        return (
          <div class="topo-preview-dialog-alarm">
            <span class="topo-preview-dialog-alarm-time">{v.value.alarmDTO.alarmTime || '-'}</span>
            <a-switch
              checked={v.value.alarmDTO.available}
              unCheckedChildren="屏蔽"
              checkedChildren="投用"
              disabled={!props.data.pointCode2}
              onChange={onAlarmSwitchChange}
            ></a-switch>
            {!!Number(v.value.value) && (
              <a
                href="javascript:;"
                onClick={onAlarmReset}
                class={['topo-preview-dialog-alarm-btn', {
                  'is-disabled': !v.value.alarmDTO.manuReleasable,
                }]}
              >消警</a>
            )}
            {(v.value.alarmDTO.linkUrl && v.value.value !== '0') && (
              <a
                href="javascript:;"
                onClick={() => {
                  router.push(v.value.alarmDTO.linkUrl)
                }}
                class="topo-preview-dialog-alarm-btn"
              >详情</a>
            )}
          </div>
        );
      }
      return '';
    };
    const token = useSessionStorage('token', '');
    const theme = useSessionStorage('theme', '');
    const userInfo = useSessionStorage('userinfo', '{}');
    const onLinkClick = () => {
      let url = props.data.linkUrl;
      if (props.data.needLink === 2) {
        let userId = '';
        try {
          const ui = JSON.parse(userInfo.value);
          if (ui.userId) {
            userId = ui.userId;
          }
        } catch {
          console.warn('获取 Session 中的 UserInfo 失败');
        }
        url += `&appType=mtip-factory&token=${token.value}&userId=${userId}&theme=${theme.value}`;
      }
      router.push(url);
    };
    const renderContent = () => {
      if ((
        props.data.displayType === 'SWITCH'
        || props.data.displayType === 'BUTTON_STATUS'
      ) && props.data.pointCode) {
        return renderControl();
      }
      return (
        <>
          {(
            props.data.needLink
            && props.data.linkUrl
            && props.data.displayType !== 'ALARM'
            && !isNull(v.value.value)
          ) ? (
            <a-button
              type="link"
              class="topo-value-link"
              onClick={onLinkClick}
            >{renderValue()}</a-button>
          ) : (
            <strong class={{ 'is-alarm': props.data.displayType === 'ALARM' }}>{renderValue()}</strong>
          )}
          {props.data.unit && (
            <small>{props.data.unit}</small>
          )}
          {renderControl()}
        </>
      );
    };
    return () => props.data && renderContent();
  },
});
