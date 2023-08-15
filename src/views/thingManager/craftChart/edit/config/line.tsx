import {
  defineComponent,
} from 'vue';

export default defineComponent({
  setup() {
    return () => (
      <div class="process-block">
        <div class="process-block-title">指标</div>
        <div class="process-block-content">
          <a-form>
            <a-form-item>
              <a-checkbox>Q 煤量</a-checkbox>
            </a-form-item>
            <a-form-item>
              <a-checkbox>r 产率</a-checkbox>
            </a-form-item>
            <a-form-item>
              <a-checkbox>Ad 灰分</a-checkbox>
            </a-form-item>
            <a-form-item>
              <a-checkbox>Mt 全水分</a-checkbox>
            </a-form-item>
            <a-form-item>
              <a-checkbox>W 水量</a-checkbox>
            </a-form-item>
            <a-form-item>
              <a-checkbox>W循 补加循环水量</a-checkbox>
            </a-form-item>
            <a-form-item>
              <a-checkbox>V 悬浮液体积</a-checkbox>
            </a-form-item>
            <a-form-item>
              <a-checkbox>ρ 悬浮液密度</a-checkbox>
            </a-form-item>
            <a-form-item>
              <a-checkbox>G 悬浮液中固体量</a-checkbox>
            </a-form-item>
            <a-form-item>
              <a-checkbox>G 悬浮液中固体量</a-checkbox>
            </a-form-item>
            <a-form-item>
              <a-checkbox>Gf 悬浮液中磁性物总量</a-checkbox>
            </a-form-item>
            <a-form-item>
              <a-checkbox>rc 非磁性物含量</a-checkbox>
            </a-form-item>
            <a-form-item>
              <a-checkbox>rc 非磁性物含量</a-checkbox>
            </a-form-item>
          </a-form>
        </div>
      </div>
    );
  },
});
