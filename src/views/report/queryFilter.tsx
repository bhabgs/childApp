import { defineComponent, onMounted, ref } from "vue";
import { useRoute } from "vue-router";

const QueryFilter = defineComponent({
  emits: ["search"],
  setup(_, { emit }) {
    const formRef = ref();
    const form = ref({
      name: "",
    });

    const handleSearch = () => emit("search", form.value);
    const handleReset = () => {
      formRef.value.resetFields();
      handleSearch();
    };

    onMounted(handleSearch);

    return () => (
      <div class="query-filter">
        <a-form
          class="table-query-form"
          ref={formRef}
          model={form.value}
        >
          <a-row>
            <a-col span={6}>
              <a-form-item label="报表名称" name="name">
                <a-input
                  style={{ width: "200px" }}
                  placeholder="请输入"
                  allowClear
                  v-model:value={form.value.name}
                  onPressEnter={handleSearch}
                ></a-input>
              </a-form-item>
            </a-col>
            <a-col span={6} offset={12}>
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
