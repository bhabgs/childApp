import { computed, defineComponent, onMounted, reactive, ref } from 'vue';
import { sortAttr } from '@/api/thingModel';
import { message } from 'ant-design-vue';
import { cloneDeep } from 'lodash';

export default defineComponent({
  emits: ['ok'],
  props: {
    attrList: {
      type: Array,
      default: () => [],
    },
    attrGroupList: {
      type: Array,
      default: () => [],
    },
  },
  setup(props, { expose, emit }) {
    const state = reactive<{
      title: string;
      visible: boolean;
      attrList: any[];
    }>({
      title: '编辑排序',
      visible: false,
      attrList: [],
    });

    const update = () => {
      sortAttr(state.attrList).then(() => {
        emit('ok');
        close();
      });
    };
    const open = () => {
      state.attrList = props.attrList.map((attr: any) => {
        const group: any = props.attrGroupList.find(
          (item: any) => item.key === attr.groupName
        );
        attr.name = group?.key || attr.groupName;
        attr.code = group?.value || attr.groupName;
        return attr;
      });
      state.visible = true;
    };
    const close = () => {
      state.visible = false;
    };

    const handleDrop = (info: any) => {
      const dropKey = info.node.code;
      const dragKey = info.dragNode.code;
      const dropPos = info.node.pos.split('-');
      const dragPos = info.dragNode.pos.split('-');
      if (dropPos.length !== dragPos.length || !info.dropToGap) {
        message.warn('只支持同级别排序');
        return;
      }
      // if (dropPos[dropPos.length - 2] !== dragPos[dragPos.length - 2]) {
      //   message.warn('只支持组内排序');
      //   return;
      // }
      const dropPosition =
        info.dropPosition - Number(dropPos[dropPos.length - 1]);
      const loop = (data: any, code: string | number, callback: any) => {
        data.forEach((item: any, index: number) => {
          if (item.code === code) {
            return callback(item, index, data);
          }
          if (item.properties) {
            return loop(item.properties, code, callback);
          }
        });
      };
      const data = cloneDeep(state.attrList);

      // Find dragObject
      let dragObj: any;
      loop(data, dragKey, (item: any, index: number, arr: any[]) => {
        arr.splice(index, 1);
        dragObj = item;
      });
      if (!info.dropToGap) {
        console.log('!dropToGap');

        // // Drop on the content
        // loop(data, dropKey, (item: any) => {
        //   item.properties = item.properties || [];
        //   /// where to insert 示例添加到头部，可以是随意位置
        //   item.properties.unshift(dragObj);
        // });
      } else if (
        (info.node.properties || []).length > 0 && // Has properties
        info.node.expanded && // Is expanded
        dropPosition === 1 // On the bottom gap
      ) {
        loop(data, dropKey, (item: any) => {
          item.properties = item.properties || [];
          // where to insert 示例添加到头部，可以是随意位置
          item.properties.unshift(dragObj);
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
      data.forEach((item, index) => {
        item.properties.forEach((sub: any, ind: number) => {
          sub.sort = (index + 1) * 10000 + ind + 1;
          sub.groupName = item.groupName;
        });
      });
      state.attrList = data;
    };

    expose({ open, update });
    return () => (
      <div class='updateThingModelSort'>
        <a-modal
          visible={state.visible}
          title={state.title}
          width='400px'
          onCancel={close}
          onOk={update}
          centered
        >
          <a-tree
            draggable
            block-node
            tree-data={state.attrList}
            onDrop={handleDrop}
            showLine
            fieldNames={{
              children: 'properties',
              title: 'name',
              key: 'code',
            }}
            v-slots={{
              title: (ele: any) => {
                return (
                  <span class='tree-node-title'>
                    {ele.displayLabel || ele.name}
                  </span>
                );
              },
            }}
          />
        </a-modal>
      </div>
    );
  },
});
