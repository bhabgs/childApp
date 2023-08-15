import {
  defineComponent,
  ref,
  shallowRef,
  onMounted,
} from 'vue';
import { map, uniqueId } from 'lodash';
import { SearchOutlined } from '@ant-design/icons-vue';
import { includes, debounce } from 'lodash';
import * as topoMapAPI from '@/api/topoMap';
import * as thingAPI from '@/api/thing';
import type { Editor } from '@/components/editor';

interface Draggable {
  /**
   * 横坐标
   */
  x: number;
  /**
   * 纵坐标
   */
  y: number;
  /**
   * 标题
   */
  name: string;
  /**
   * 图片
   */
  image: string;
}

export default defineComponent({
  props: {
    source: {
      type: String,
      default: '',
    },
    type: {
      type: String,
      default: 'device_connect',
    },
    editor: {
      type: Object as () => Editor,
      default: null,
    },
    /**
     * 图中包含的所有物实例（ius）
     */
    nodes: {
      type: Array as () => string[],
      default: [],
    },
  },
  setup(props) {
    // 搜索文本
    const searchText = ref('');
    const treeListRef = ref<HTMLElement>();
    const instanceRef = ref<HTMLElement>();
    const draggable = ref<null | Draggable>(null);
    const getOffset = (target) => {
      const { y, height } = target.offsetParent.getBoundingClientRect();
      if (treeListRef.value && instanceRef.value) {
        const { left } = treeListRef.value.getBoundingClientRect();
        const { offsetWidth, offsetHeight } = treeListRef.value;
        const insHeight = instanceRef.value.offsetHeight;
        let top = y + height / 2 - insHeight / 2;
        if (y + insHeight > offsetHeight) {
          top = offsetHeight - insHeight + height / 2;
        }
        return {
          x: offsetWidth + left,
          y: top,
        };
      }
      return { x: 0, y: 0 };
    };
    // 物实例树数据
    const treeData = shallowRef<topoMapAPI.Thing[]>([]);
    const expandedKeys = ref<string[]>([]);
    // 获取物实例树数据
    const getTreeData = () => new Promise((resolve) => {
      if (props.source === 'instance') {
        const functionCode = props.type === 'process_connect' ? 'process' : 'device';
        topoMapAPI.findTree(functionCode, searchText.value).then(({ data }) => {
          treeData.value = map(data, (item) => ({
            ...item,
            title: item.instanceName,
            key: item.iu,
          }));
          if (data.length) {
            const [{ iu }] = data;
            expandedKeys.value = [iu];
          }
          resolve(data);
        });
      } else if (props.source === 'thing') {
        thingAPI.findTree('PROCESS').then(({ data }) => {
          treeData.value = map(data.childTrees, (item) => ({
            ...item,
            instanceName: item.name,
            key: item.code,
            imgPowerOff: item.iconUrl,
            children: item.childTrees,
          }));
        });
      }
    });
    // 搜索（防抖）
    const handleSearch = debounce(() => {
      getTreeData();
    }, 300);
    // 拖拽事件
    const onDragStart = ({ event, node: { dataRef } }) => {
      const data = {
        ...dataRef,
        img: dataRef.imgPowerOff,
        source: props.source,
        showCard: true,
      };
      if (props.source === 'instance') {
        data.fullImg = dataRef.imgRun;
      } else if (props.source === 'thing') {
        data.tc = dataRef.code;
        data.iu = `thing_${uniqueId()}`;
        data.ic = `${dataRef.code}_${uniqueId()}`;
      }
      props.editor.dragIn(event, data);
    };

    onMounted(() => {
      getTreeData();
    });

    return () => (
      <div class="topo-detail-tree-wrap">
        {props.source === 'instance' && (
          <div class="topo-detail-tree-search">
            <a-input
              v-model={[searchText.value, 'value', ['trim']]}
              placeholder="搜索物实例"
              allowClear
              suffix={<SearchOutlined title="搜索"></SearchOutlined>}
              onChange={handleSearch}
            ></a-input>
          </div>
        )}
        <div ref={treeListRef} class="topo-detail-tree-list">
          <div ref={instanceRef} class="topo-detail-tree-instance hide"></div>
          {!!draggable.value && (
            <div
              class="topo-detail-tree-instance block"
              style={{
                top: `${draggable.value.y}px`,
                left: `${draggable.value.x}px`,
              }}
            >
              <div class="inner">
                <img src={draggable.value.image} alt={draggable.value.name} />
                <span>{draggable.value.name}</span>
              </div>
            </div>
          )}
          <a-tree
            v-model={[expandedKeys.value, 'expandedKeys']}
            tree-data={treeData.value}
            show-line
            block-node
            draggable={!!draggable.value}
            onDragstart={onDragStart}
            v-slots={{
              title: ({imgPowerOff, instanceName, icon, iu}) => (
                <div
                  class={['topo-detail-tree-title', {
                    'topo-detail-tree-disabled': includes(props.nodes, iu),
                  }]}
                  onMouseenter={(e) => {
                    if (imgPowerOff && e.target && !includes(props.nodes, iu)) {
                      const { x, y } = getOffset(e.target);
                      draggable.value = {
                        image: imgPowerOff,
                        name: instanceName,
                        x,
                        y,
                      };
                    } else {
                      draggable.value = null;
                    }
                  }}
                  onMouseleave={() => {
                    draggable.value = null;
                  }}
                >
                  {icon ? (
                    <icon-font class="img" type={icon}></icon-font>
                  ) : (
                    imgPowerOff && <img class="img" src={imgPowerOff} alt={instanceName}></img>
                  )}
                  <span>{instanceName}</span>
                </div>
              ),
            }}
          ></a-tree>
        </div>
      </div>
    );
  },
});
