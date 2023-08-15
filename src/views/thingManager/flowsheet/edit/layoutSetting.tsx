import { defineComponent } from 'vue';
import Block from './block';

export default defineComponent({
  props: {
    selected: {
      type: Object,
      default: null,
    },
  },
  emits: ['click'],
  setup(props, { emit }) {
    const levels = [
      { key: 'moveUp', name: '上层', icon: 'icon-gongyituguanli_cengji_shangyiceng' },
      { key: 'moveDown', name: '下层', icon: 'icon-gongyituguanli_cengji_xiayiceng' },
      { key: 'moveToTop', name: '置于顶层', icon: 'icon-gongyituguanli_cengji_zhiyudingceng' },
      { key: 'moveToBottom', name: '置于底层', icon: 'icon-gongyituguanli_cengji_zhiyudiceng' },
    ];
    const positioning = [
      { key: 'flipX', name: '水平翻转', icon: 'icon-icon_yewulei_wulianpingtai_kaifazhezhongxin_wumoxingguanli_gongyituguanli_cengji_shuipingjingxiang' },
      { key: 'flipY', name: '垂直翻转', icon: 'icon-icon_yewulei_wulianpingtai_kaifazhezhongxin_wumoxingguanli_gongyituguanli_cengji_chuizhijingxiang' },
    ];
    const tools = [
      { key: 'left', name: '左对齐', icon: 'icon-gongyituguanli_duiqi_zuoduiqi' },
      { key: 'right', name: '右对齐', icon: 'icon-gongyituguanli_duiqi_youduiqi' },
      { key: 'top', name: '顶对齐', icon: 'icon-gongyituguanli_duiqi_dingduiqi' },
      { key: 'bottom', name: '底对齐', icon: 'icon-gongyituguanli_duiqi_diduiqi' },
      { key: 'centerX', name: '水平居中对齐', icon: 'icon-gongyituguanli_duiqi_chuizhijuzhong' },
      { key: 'centerY', name: '垂直居中对齐', icon: 'icon-gongyituguanli_duiqi_shuipingjuzhong' },
      { key: 'distributionX', name: '水平分布对齐', icon: 'icon-shuipingfenbuduiqi' },
      { key: 'distributionY', name: '垂直分布对齐', icon: 'icon-chuizhifenbuduiqi' },
    ];
    const isDisabled = (key) => {
      return (key === 'flipX' || key === 'flipY') && props.selected.type === 'thingText';
    };
    const onClick = (key) => {
      if (!isDisabled(key)) {
        emit('click', key);
      }
    };
    const renderTool = ({ key, name, icon }) => (
      <a-tooltip key={key} title={name} get-popup-container={(n) => n}>
        <div
          class={['topo-detail-operation-icon', {
            'is-disabled': isDisabled(key),
          }]}
          onClick={() => onClick(key)}
        >
          <icon-font type={icon}></icon-font>
        </div>
      </a-tooltip>
    );

    return () => (
      <Block title="对齐与排列">
        <div class="topo-detail-line">
          {levels.map((item) => renderTool(item))}
          <a-divider type="vertical"></a-divider>
          {positioning.map((item) => renderTool(item))}
        </div>
        <div class="topo-detail-line">
          {tools.map((item) => renderTool(item))}
        </div>
      </Block>
    );
  },
});
