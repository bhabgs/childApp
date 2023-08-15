import {
  defineComponent,
  nextTick,
  onMounted,
  reactive,
  ref,
  watch,
  provide,
  onUnmounted,
} from 'vue';
import { THING_ROOT } from '@/views/thingManager/thingInstance/data';
import { RedoOutlined, SearchOutlined } from '@ant-design/icons-vue';
import * as thingApis from '@/api/thingInstance';
import * as thingModelApis from '@/api/thingModel';
import { listFilter, treeBycodeFilter } from './hooks/filters';
import useTreeSearch from './hooks/treeSearch';
import { Search } from '@/hooks/filters';
import '@/assets/style/pages/thingManager/thingInstance/thingInstance.less';
import { useRoute } from 'vue-router';
import SoleModelThings from './component/SoleModelThings';
import emitter from '@/utils/mitt';

export default defineComponent({
  name: 'thingInstance',
  props: {
    isActive: {
      type: Boolean,
      default: false,
    },
  },
  setup(props, context) {
    const route = useRoute();
    // emitter.on('thingCodeForThingInst', (data: any) => {
    //   thingCode.value = data.code || rootThingCode.value;
    // });
    // 模型树
    const {
      tree,
      searchValue,
      expandedKeys,
      autoExpandParent,
      selectedKeyArr,
      fieldNames,
      generateKey,
      generateList,
    } = useTreeSearch({
      title: 'name',
      children: 'childTrees',
    });

    const filterTree = (arr: any[], key: string) => {
      let have: boolean = false;
      for (let i = 0; i < arr.length; i++) {
        const obj = arr[i];
        let childHave: boolean = false;
        if (obj.child && obj.child.length != 0) {
          childHave = filterTree(obj.child, key).have;
        }
        if (obj.name.indexOf(key) !== -1 || childHave) {
          have = true;
        } else {
          arr.splice(i, 1);
          i--;
        }
      }
      return { arr, have };
    };

    const getTreeData = () => {
      if (hiddenThingModel.value) return;
      thingModelApis.listTree(rootThingCode.value || '').then((res) => {
        const resData = res.data ? [res.data] : [];
        resData.forEach((ele: any) => {
          ele.first = true;
        });

        const data = generateKey('0', resData);
        generateList(data);
        tree.treeDataOrigin = data;
        tree.data = data;
        expandedKeys.value = [tree.data[0]?.key];
      });
    };

    const thingNode = ref();
    const thingCode: any = ref(null);
    const rootThingCode: any = ref(null);
    const hiddenThingModel: any = ref(false);

    onMounted(() => {
      //id对应thing_root_code 此处id由于组件限制，只能命名为id，实际此处传参为某一物模型code，用来筛选物实例左侧树
      const { id } = route?.params;
      const { code, hiddenModel } = route?.query;
      rootThingCode.value = id || THING_ROOT;
      thingCode.value = code || rootThingCode.value;
      hiddenThingModel.value = hiddenModel ? true : false;
      getTreeData();
    });

    const isSelectNode = ref(false);
    const selectNode = (
      selectedKeys: string[] | number[],
      { selected, node }: any
    ) => {
      if (thingCode.value === node.code) {
        return;
      }
      if (selected) {
        isSelectNode.value = true;

        thingCode.value = node.code;
        thingNode.value = node;
      } else {
        thingCode.value = null;
        thingNode.value = null;
      }

      selectedKeyArr.value = selectedKeys;
    };

    const expandNode = (keys: string[]) => {
      expandedKeys.value = keys;
      autoExpandParent.value = false;
    };

    watch(
      () => route?.query.code,
      (nval, oval) => {
        if (nval && nval !== oval && route.name === 'thingInstance') {
          searchValue.value = '';
          thingCode.value = nval;
          getTreeData();
        }
      }
    );
    watch(
      () => searchValue.value,
      (value) => {
        if (value && thingCode.value) {
          thingCode.value = null;
          selectedKeyArr.value = [];
          thingNode.value = null;
        }
      }
    );

    watch(
      () => [tree.data, thingCode.value],
      (e) => {
        if (e[0].length > 0 && e[1] && !isSelectNode.value) {
          page.value = 'list';
          searchValue.value = '';
          const { node, key } = treeBycodeFilter(tree.data, thingCode.value);

          thingNode.value = node;
          selectedKeyArr.value = [key];
          const keys = new Search({
            treeData: tree.data,
            key,
            childFiled: 'childTrees',
          });
          const keyData = keys.rtn();
          if (keyData.expandedKeys.length == 0) {
            expandedKeys.value = [tree.data[0]?.key];
          } else {
            expandedKeys.value = keyData.expandedKeys;
          }
        }

        if (isSelectNode.value) {
          isSelectNode.value = false;
        }
      },
      {
        immediate: true,
        deep: true,
      }
    );

    const page = ref('list');

    const soleModelThingsRef = ref();

    const toRouter = async (row: any) => {
      context.emit('toRouter', row);
    };

    provide('toRouter', toRouter);

    return () => (
      <div class='thingApp'>
        <div class='thingInstance flex' v-show={page.value === 'list'}>
          {!hiddenThingModel.value && (
            <div class='left_wrap flex'>
              <div class='tree_data flex flex1'>
                <a-input
                  class='search'
                  placeholder='输入搜索内容'
                  allowClear
                  suffix={<SearchOutlined />}
                  v-model={[searchValue.value, 'value', ['trim']]}
                />

                <div class='mar-t-16 tree_wrap flex1'>
                  {tree.data.length ? (
                    <a-tree
                      show-line
                      blockNode={true}
                      tree-data={tree.data}
                      field-names={fieldNames}
                      onSelect={selectNode}
                      onExpand={expandNode}
                      selectedKeys={selectedKeyArr.value}
                      expandedKeys={expandedKeys.value}
                      autoExpandParent={autoExpandParent.value}
                      v-slots={{
                        title: (ele: any) => {
                          return (
                            <span class='tree-node-title'>
                              <span style={ele.first ? 'font-weight:700' : ''}>
                                {ele.name}
                              </span>
                            </span>
                          );
                        },
                      }}
                    ></a-tree>
                  ) : null}
                </div>
              </div>
            </div>
          )}

          <div class='table_wrap flex flex1'>
            <SoleModelThings
              ref={soleModelThingsRef}
              thingCode={thingCode.value}
              thingNode={thingNode.value}
              rootThingCode={rootThingCode.value}
              nodeType={thingNode.value?.nodeType}
            />
          </div>
        </div>
      </div>
    );
  },
});
