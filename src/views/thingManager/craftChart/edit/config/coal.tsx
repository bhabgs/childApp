import {
  defineComponent,
} from 'vue';

export default defineComponent({
  setup() {
    return () => (
      <>
        <div class="process-block">
          <div class="process-block-title">基本信息</div>
          <div class="process-block-content">
            <a-form
              label-col={{ style: { width: '60px' } }}
            >
              <a-form-item label="煤种名称">毛煤</a-form-item>
            </a-form>
          </div>
        </div>
        <div class="process-block">
          <div class="process-block-title">工艺参数</div>
          <div class="process-block-content">
            <a-form
              label-col={{ style: { width: '60px' } }}
            >
              <a-form-item label="全水分Mt">
                <a-input suffix="%"></a-input>
              </a-form-item>
              <a-form-item label="灰分Ad">
                <a-input suffix="%"></a-input>
              </a-form-item>
            </a-form>
          </div>
        </div>
      </>
    );
  },
});
