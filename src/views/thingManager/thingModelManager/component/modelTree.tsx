import { defineComponent, onMounted, reactive, ref } from 'vue';
import { listTree, modifyTreeSort } from '@/api/thingModel';
import { message } from 'ant-design-vue';

export default defineComponent({
  setup(props, { expose, emit }) {
    const state = reactive<{
      title: string;
      visible: boolean;
      modelTreeList: any[];
      expandedKeys: string[];
    }>({
      title: '编辑排序',
      visible: false,
      modelTreeList: [],
      expandedKeys: [],
    });

    const getListTree = () => {
      listTree().then((res) => {
        if (res.data) {
          state.expandedKeys = [res.data.code];
          state.modelTreeList = [res.data];
        }
      });
    };
    const update = () => {
      modifyTreeSort(state.modelTreeList[0]).then(() => {
        message.success('排序成功');
        emit('ok');
        close();
      });
    };
    const open = () => {
      getListTree();
      state.visible = true;
    };
    const close = () => {
      state.visible = false;
    };

    const handleDrop = (info: any) => {
      const dropKey = info.node.code;
      const dragKey = info.dragNode.code;
      const dropPos = info.node.pos.split('-');
      const dropPosition =
        info.dropPosition - Number(dropPos[dropPos.length - 1]);
      const loop = (data: any, code: string, callback: any) => {
        data.forEach((item: any, index: number) => {
          if (item.code === code) {
            return callback(item, index, data);
          }
          if (item.childTrees && item.childTrees.length > 0) {
            return loop(item.childTrees, code, callback);
          }
        });
      };
      const data = state.modelTreeList;

      // Find dragObject
      let dragObj: any;
      loop(data, dragKey, (item: any, index: number, arr: any[]) => {
        arr.splice(index, 1);
        dragObj = item;
      });
      if (!info.dropToGap) {
        // Drop on the content
        loop(data, dropKey, (item: any) => {
          item.childTrees = item.childTrees || [];
          /// where to insert 示例添加到头部，可以是随意位置
          item.childTrees.unshift(dragObj);
        });
      } else if (
        (info.node.childTrees || []).length > 0 && // Has childTrees
        info.node.expanded && // Is expanded
        dropPosition === 1 // On the bottom gap
      ) {
        loop(data, dropKey, (item: any) => {
          item.childTrees = item.childTrees || [];
          // where to insert 示例添加到头部，可以是随意位置
          item.childTrees.unshift(dragObj);
        });
      } else {
        let ar: any[] = [];
        let i = 0;
        loop(data, dropKey, (_item: any, index: number, arr: any[]) => {
          ar = arr;
          i = index;
        });
        if (dropPosition === -1) {
          ar.splice(i, 0, dragObj);
        } else {
          ar.splice(i + 1, 0, dragObj);
        }
      }

      /* ----- 转换数据 ----- */

      // 递归设置sort字段
      const setSort = (node: any, index: number) => {
        node.sort = index + 1;
        if (node.childTrees && node.childTrees.length) {
          node.childTrees.forEach((sub: any, ind: number) => {
            setSort(sub, ind);
          });
        }
      };
      setSort(data[0], 0);
    };

    expose({ open, update });
    return () => (
      <div class='updateThingModelSort' v-show={state.visible}>
        <a-modal
          visible={state.visible}
          title={state.title}
          onCancel={close}
          onOk={update}
          centered
        >
          <a-tree
            draggable
            block-node
            tree-data={state.modelTreeList}
            onDrop={handleDrop}
            showLine
            v-model={[state.expandedKeys, 'expandedKeys']}
            fieldNames={{
              children: 'childTrees',
              title: 'name',
              key: 'code',
            }}
          />
        </a-modal>
      </div>
    );
  },
});
