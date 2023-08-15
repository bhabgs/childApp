import { defineComponent, onMounted, ref } from "vue";
import * as api from "@/api/appCenter/logicManager";

const QueryFilter = defineComponent({
  emits: ["search"],
  setup(props, { emit }) {
    const form = ref({
      scope: null,
      name: "",
    });
    const formRef = ref();

    const scopeList = ref([]);
    const getScopeList = async () => {
      const { data } = await api.getScopeList();
      scopeList.value = data;
    };
    onMounted(getScopeList);

    const handleSearch = () => {
      emit("search", form.value);
    };

    const handleReset = () => {
      formRef.value.resetFields();
      handleSearch();
    };

    onMounted(handleSearch);

    return () => (
      <div class="query-filter">
        <a-form
          ref={formRef}
          model={form.value}
          labelCol={{ style: { width: "9em" } }}
        >
          <a-row>
            <a-col span={6}>
              <a-form-item label="逻辑分类" name="scope">
                <a-select
                  style={{ width: "200px" }}
                  placeholder="请选择"
                  allowClear
                  fieldNames={{ label: "name", value: "code" }}
                  options={scopeList.value}
                  v-model:value={form.value.scope}
                ></a-select>
              </a-form-item>
            </a-col>
            <a-col span={6}>
              <a-form-item label="逻辑名称" name="name">
                <a-input
                  style={{ width: "200px" }}
                  placeholder="请输入"
                  v-model:value={form.value.name}
                  onPressEnter={handleSearch}
                ></a-input>
              </a-form-item>
            </a-col>
            <a-col span={6} offset={6}>
              <a-form-item style={{ textAlign: "right" }}>
                <a-space>
                  <a-button type="primary" onClick={handleSearch}>
                    查询
                  </a-button>
                  <a-button onClick={handleReset}>重置</a-button>
                </a-space>
              </a-form-item>
            </a-col>
          </a-row>
        </a-form>
      </div>
    );
  },
});

export default QueryFilter;
