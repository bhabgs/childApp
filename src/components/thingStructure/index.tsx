import { defineComponent, onMounted, ref, withModifiers } from "vue";
import useTreeSearch from "@/hooks/treeSearch";
import _ from "lodash";
import { generateInstanceTree } from "./utils";

import {
  RedoOutlined,
  PlusCircleOutlined,
  SearchOutlined,
} from "@ant-design/icons-vue";
import GraphComp from "../structureGraph";
import * as thingApis from "@/api/thingInstance";
import "@/assets/style/pages/thingManager/productionSystem/index.less";
import { message, Modal } from "ant-design-vue";
import { useRouter } from "vue-router";

/**
 * 物实例组织架构图
 * 左侧树结构 右侧组织架构
 */
const ThingStructure = defineComponent({
  props: {
    type: {
      type: String,
      required: true,
    },
    relaClass: {
      type: String,
      required: true,
    },
  },
  setup(props, context) {
    const router = useRouter();
    const graphRef = ref();

    const getTreeData = async () => {
      await thingApis.findAllThingForTree(props.type).then((res) => {
        res.data.forEach((ele: any) => {
          ele.first = true;
        });
        const data = generateKey("0", res.data);
        generateList(data);
        tree.treeDataOrigin = data;
        tree.data = data;
      });
    };

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
      title: "name",
      children: "child",
    });

    // 当前选中的物模型(树中)
    const thingNode = ref();

    // 当前选中的物模型是否可以添加实例
    const isCanAdd = ref(false);

    const selectNode = async (
      selectedKeys: string[] | number[],
      { selected, node }: any
    ) => {
      isCanAdd.value = false;
      if (selected) {
        thingNode.value = node;
        const { data } = await thingApis.findByCode(thingNode.value.code);
        isCanAdd.value = data.tableName !== "-";
      } else {
        thingNode.value = null;
      }

      selectedKeyArr.value = selectedKeys;
    };

    const expandNode = (keys: string[]) => {
      expandedKeys.value = keys;
      autoExpandParent.value = false;
    };

    onMounted(() => {
      initHandle();
      getStructureData();
    });

    const initHandle = async () => {
      searchValue.value = "";
      await getTreeData();
      expandedKeys.value = tree.data.map((item) => item.code);
    };

    const showModal = ref(false);

    const ok = async () => {
      if (!thingNode.value) return;
      await formRef.value?.validate();
      // 获取物模型详情
      const { data: thingModel } = await thingApis.findByCode(
        thingNode.value.code
      );
      thingModel.thingPropertyList = thingModel.thingPropertyList.map(
        (item) => ({
          ...item,
          thingPropertyCode: item.code,
        })
      );

      // 动态属性
      const dynamicProperties = thingModel.thingPropertyList.filter(
        (item) => item.propertyType === "metric"
      );
      // 逻辑属性
      const logicProperties = thingModel.thingPropertyList.filter(
        (item) => item.propertyType === "logic"
      );
      // 静态属性map
      const staticMap = { map: {} };
      thingModel.thingPropertyList.forEach((item) => {
        if (
          item.propertyType === "property" &&
          ["CODE", "ID", "NAME"].includes(item.code) &&
          item.value
        ) {
          staticMap.map[item.code] = item.value;
        }
        if (item.code === "THING_CODE") {
          staticMap.map[item.code] = thingNode.value.code;
        }
      });
      const data = {
        dynamicProperties,
        logicProperties,
        staticMap,
        thingInst: {
          code: formState.value.code,
          name: formState.value.name,
          photo: null,
          thing: thingModel,
        },
      };

      await thingApis.addThing(data);
      message.success("保存成功");
      getStructureData();

      cancelModal();
    };
    const cancelModal = () => {
      showModal.value = false;
      formRef.value?.resetFields();
    };

    const formRef = ref();

    const formState = ref({
      name: "",
      code: "",
      remake: "",
    });

    // 组织架构数据
    const isLoading = ref(false);
    const structureData = ref<any[]>([]);
    const getStructureData = async () => {
      try {
        isLoading.value = true;
        const { data } = await thingApis.getAllThingInstanceAndRelationship(
          props.type,
          props.relaClass
        );
        structureData.value = generateInstanceTree(data);
      } finally {
        isLoading.value = false;
      }
    };

    // 检查编码是否重复
    const validateCode = async () => {
      const { data: valid } = await thingApis.checkCode(formState.value.code);
      if (!valid) {
        throw new Error();
      }
    };

    // 给两个物实例添加关联
    const handleSetRelationship = async (
      parentInstance: any,
      childInstance: any
    ) => {
      try {
        isLoading.value = true;
        const { data: ok } = await thingApis.checkCanSetRelation(
          parentInstance.thingInst.thingCode,
          childInstance.thingInst.thingCode
        );

        if (ok) {
          await thingApis.addRelation({
            aid: parentInstance.thingInst.id,
            zid: childInstance.thingInst.id,
            relaClass: props.relaClass,
          });
          message.success("添加关系成功");
          await getStructureData();
        } else {
          message.error("两个实例间不允许添加关系，请先在物模型中配置物关系");
          graphRef.value.undo();
        }
      } finally {
        isLoading.value = false;
      }
    };

    // 移除两个实例之间的关系
    const handleRemoveRelationship = (parentInstance, childInstance) => {
      Modal.confirm({
        title: "提示",
        content: `确定移除“${parentInstance.thingInst.name}”和“${childInstance.thingInst.name}”之间的关系吗?`,
        async onOk() {
          await thingApis.deleteRelation({
            aid: parentInstance.thingInst.id,
            zid: childInstance.thingInst.id,
          });
          message.success("移除成功");
          getStructureData();
        },
      });
    };

    // 跳转到物实例详情
    const handleInstanceDetail = (instance: any) => {
      // 新页签打开
      router.push({
        name: "DetailOrEdit",
        params: { id: instance.thingInst.id },
        query: {
          name: `物实例 (${instance.thingInst.name})`,
          thingInfo: JSON.stringify({
            thingId: instance.thingInst.id,
            isEdit: false,
          }),
        },
      });
    };

    return () => (
      <div class="productionSystem flex">
        <div class="left_wrap flex">
          <div class="flex_lr_c">
            <div class="flex-center title flex1">
              <span>物模型</span>

              <div class="flex gap">
                <RedoOutlined onClick={initHandle} title="刷新" />
              </div>
            </div>
          </div>

          <div class="tree_data flex flex1">
            <a-input
              class="search"
              style="margin-right: 16px;width: auto;"
              placeholder="输入搜索内容"
              allowClear
              suffix={<SearchOutlined />}
              v-model={[searchValue.value, "value", ["trim"]]}
            />

            <div class="tree_wrap flex1">
              {tree.data.length > 0 && (
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
                      const { name, suffix, selected, type, parentUuid } = ele;

                      return (
                        <div
                          class="flex"
                          style="justify-content: space-between;"
                        >
                          <span class="tree-node-title">
                            <span style={ele.first ? "font-weight:700" : ""}>
                              {ele.name}
                            </span>
                          </span>

                          {selected && isCanAdd.value && (
                            <span
                              onClick={withModifiers(() => {
                                showModal.value = true;
                              }, ["stop"])}
                            >
                              <PlusCircleOutlined />
                            </span>
                          )}
                        </div>
                      );
                    },
                  }}
                />
              )}
            </div>
          </div>
        </div>

        <div class="right flex1">
          <a-spin spinning={isLoading.value}>
            <GraphComp
              ref={graphRef}
              treeData={structureData.value}
              onSetRelationship={handleSetRelationship}
              onInstanceClick={handleInstanceDetail}
              onRemoveRelationShip={handleRemoveRelationship}
            />
          </a-spin>
        </div>

        <a-modal
          v-model={[showModal.value, "visible"]}
          title="新增实例"
          wrapClassName="prodModal"
          onCancel={cancelModal}
          centered
          v-slots={{
            footer: () => (
              <div class="modal_footer">
                <a-button onClick={cancelModal}>取消</a-button>

                <a-button type="primary" onClick={ok}>
                  确定
                </a-button>
              </div>
            ),
          }}
        >
          <div class="pageContent">
            <a-alert
              style={{ marginBottom: "16px" }}
              message="特别说明： 编码可以为空，当为空时，美腾工业物联平台会颁发唯一标识符作为编码。"
              type="info"
              show-icon
            />
            <a-form
              model={formState.value}
              ref={formRef}
              labelCol={{ span: 5 }}
              labelAlign="right"
            >
              <a-form-item
                label="实例名称"
                name="name"
                rules={[{ required: true, message: "请输入!" }]}
              >
                <a-input
                  v-model={[formState.value.name, "value"]}
                  placeholder="请输入"
                />
              </a-form-item>

              <a-form-item
                label="实例编码"
                name="code"
                rules={[
                  {
                    validator: validateCode,
                    message: "编码重复",
                    trigger: "blur",
                  },
                  {
                    pattern: /^[\u4E00-\u9FA5A-Za-z0-9_]+?$/g,
                    message: "不可包含特殊字符",
                    trigger: "blur",
                  },
                ]}
              >
                <a-input
                  v-model={[formState.value.code, "value"]}
                  placeholder="请输入"
                />
              </a-form-item>

              <a-form-item label="物模型名称">
                {thingNode?.value.name}
              </a-form-item>
              <a-form-item label="物模型编码">
                {thingNode?.value.code}
              </a-form-item>
            </a-form>
          </div>
        </a-modal>
      </div>
    );
  },
});

export default ThingStructure;
