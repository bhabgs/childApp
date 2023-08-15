import { defineComponent, onMounted, ref } from "vue";
import { useRoute } from "vue-router";
const dir = [
  {
    code: 1,
    name: "读写",
  },
  {
    code: 0,
    name: "只读",
  },
];

const QueryFilter = defineComponent({
  emits: ["search"],
  setup(_, { emit }) {
    const formRef = ref();
    const { params } = useRoute();
    const form = ref({
      pduCode: null,
      pointCode: null,
      pointAddress: null,
      pointDescription: null,
      opcuaUserId: Number(params.id),
      writeEnable: 1,
      userAccessLevel: 0,
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
          model={form}
          labelCol={{ style: { width: "9em" } }}
        >
          <a-row>
            <a-col span={6}>
              <a-form-item label="协议数据单元" name="pduCode">
                <a-input
                  style={{ width: "200px" }}
                  placeholder="请输入"
                  allowClear
                  v-model:value={form.value.pduCode}
                  onPressEnter={handleSearch}
                ></a-input>
              </a-form-item>
            </a-col>
            <a-col span={6}>
              <a-form-item label="标签" name="pointCode">
                <a-input
                  style={{ width: "200px" }}
                  placeholder="请输入"
                  allowClear
                  v-model:value={form.value.pointCode}
                  onPressEnter={handleSearch}
                ></a-input>
              </a-form-item>
            </a-col>
            <a-col span={6}>
              <a-form-item label="地址" name="pointAddress">
                <a-input
                  style={{ width: "200px" }}
                  placeholder="请输入"
                  allowClear
                  v-model:value={form.value.pointAddress}
                  onPressEnter={handleSearch}
                ></a-input>
              </a-form-item>
            </a-col>
            <a-col span={6}>
              <a-form-item label="描述" name="code">
                <a-input
                  style={{ width: "200px" }}
                  placeholder="请输入"
                  allowClear
                  v-model:value={form.value.pointDescription}
                  onPressEnter={handleSearch}
                ></a-input>
              </a-form-item>
            </a-col>
            <a-col span={6}>
              <a-form-item label="读写类型" name="writeEnable">
                <a-select
                  style={{ width: "200px" }}
                  placeholder="请选择"
                  allowClear
                  v-model:value={form.value.writeEnable}
                >
                  {dir.map((item) => (
                    <a-select-option value={item.code}>
                      {item.name}
                    </a-select-option>
                  ))}
                </a-select>
              </a-form-item>
            </a-col>
            <a-col span={6}>
              <a-form-item label="用户权限" name="userAccessLevel">
                <a-select
                  style={{ width: "200px" }}
                  placeholder="请选择"
                  allowClear
                  v-model:value={form.value.userAccessLevel}
                >
                  {dir.map((item) => (
                    <a-select-option value={item.code}>
                      {item.name}
                    </a-select-option>
                  ))}
                </a-select>
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
