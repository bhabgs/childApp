import {
  defineComponent,
  onMounted,
  ref,
} from 'vue';
import { ArrowLeftOutlined } from '@ant-design/icons-vue';
import flowChartAPI from '@/api/flowChartConfiguration';
import Editor from './editor';
import Line from './config/line';
import Coal from './config/coal';

export default defineComponent({
  setup() {
    const operationTree = ref([]);
    const coalVarietyTree = ref([]);

    const draggable = ref(false);

    const handleDragStart = ({ event, node: { dataRef } }) => {
      console.log(event, dataRef);
      event.preventDefault();
    };

    const selected = ref(null);

    const getPageData = () => {
      flowChartAPI.getEquipmentTree("").then(({ data }) => {
        operationTree.value = data;
        coalVarietyTree.value = data;
      });
    };
    onMounted(() => {
      getPageData();
    });
    return () => (
      <div class="process-map">
        <div class="process-left">
          <div class="process-header">
            <span class="back">
              <ArrowLeftOutlined></ArrowLeftOutlined>
              <span>返回列表</span>
            </span>
          </div>
          <div class="process-content">
            <a-tabs class="hf">
              <a-tab-pane key="operation" tab="工艺作业">
                <a-tree
                  class="process-tree"
                  field-names={{
                    title: 'instanceName',
                    key: 'iu',
                  }}
                  tree-data={operationTree.value}
                  show-line
                  block-node
                  default-expand-all
                  draggable={draggable.value}
                  onDragstart={(e) => handleDragStart(e)}
                  v-slots={{
                    title: ({ img, instanceName }) => (
                      <div
                        onMouseenter={(e) => {
                          draggable.value = !!img;
                        }}
                        onMouseleave={() => {
                          draggable.value = false;
                        }}
                      >{instanceName}</div>
                    ),
                  }}
                ></a-tree>
              </a-tab-pane>
              <a-tab-pane key="coalVariety" tab="煤种"></a-tab-pane>
              <a-tab-pane key="balance" tab="平衡表" disabled></a-tab-pane>
            </a-tabs>
          </div>
        </div>
        <div class="process-center">
          <div class="process-header">
            <a-radio-group
              v-model={[selected.value, 'value']}
              button-style="solid"
            >
              <a-radio-button value={null}>画板</a-radio-button>
              <a-radio-button value="line">线</a-radio-button>
              <a-radio-button value="coal">煤</a-radio-button>
              <a-radio-button value="operation">工艺作业</a-radio-button>
            </a-radio-group>
          </div>
          <div class="process-content">
            <Editor></Editor>
          </div>
        </div>
        <div class="process-right">
          {selected.value ? (
            (selected.value === 'line' && <Line></Line>)
            || (selected.value === 'coal' && <Coal></Coal>)
            ) : (
            <>
              <div class="process-block">
                <div class="process-block-title">画板</div>
                <div class="process-block-content">
                  <a-form>
                    <a-form-item>
                      <a-checkbox>图例</a-checkbox>
                    </a-form-item>
                    <a-form-item>
                      <a-checkbox>符号</a-checkbox>
                    </a-form-item>
                    <a-form-item>
                      <a-checkbox>标题栏</a-checkbox>
                    </a-form-item>
                  </a-form>
                  <a-form
                    label-col={{ style: { width: '100px' } }}
                  >
                    <a-form-item label="单位工程名称">
                      <a-input
                        placeholder="请输入"
                      ></a-input>
                    </a-form-item>
                    <a-form-item label="图纸代号">
                      <a-input
                        placeholder="请输入"
                      ></a-input>
                    </a-form-item>
                    <a-form-item label="图样名称">
                      <a-input
                        placeholder="请输入"
                      ></a-input>
                    </a-form-item>
                    <a-form-item label="编制单位名称">
                      <a-input
                        placeholder="请输入"
                      ></a-input>
                    </a-form-item>
                  </a-form>
                </div>
              </div>
              <div class="process-block">
                <div class="process-block-title">导出</div>
                <div class="process-block-content">
                  <a-form>
                    <a-form-item>
                      <a-checkbox>彩色模式</a-checkbox>
                    </a-form-item>
                    <a-form-item>
                      <a-button class="wf">导出文件</a-button>
                    </a-form-item>
                  </a-form>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    );
  },
});
