import { defineComponent, ref } from "vue";

export const imageTypeList = [
  { label: "JPG", value: "jpg" },
  { label: "PNG", value: "png" },
  { label: "SVG", value: "svg" },
];

const QueryFilter = defineComponent({
  emits: ["search"],
  setup(_, { emit }) {
    const formRef = ref();
    const form = ref<any>({});

    const handleSearch = () => {
      emit("search", form.value);
    };

    return () => (
      <div class="query-filter">
        <a-form ref={formRef} model={form.value}>
          <a-row>
            <a-col span={6}>
              <a-form-item label="图片类型" name="imageType">
                <a-select
                  style={{ width: "200px" }}
                  placeholder="请选择"
                  options={imageTypeList}
                  allowClear
                  v-model:value={form.value.imageType}
                ></a-select>
              </a-form-item>
            </a-col>
            {/* <a-col span={6}>
              <a-form-item label="图片宽度">
                <a-space>
                  <a-input-number
                    style={{ width: "50px" }}
                    min={0}
                    controls={false}
                    onPressEnter={handleSearch}
                    v-model:value={form.value.widthMin}
                  ></a-input-number>
                  <span>-</span>
                  <a-form-item-rest>
                    <a-input-number
                      style={{ width: "50px" }}
                      min={0}
                      controls={false}
                      onPressEnter={handleSearch}
                      v-model:value={form.value.widthMax}
                    ></a-input-number>
                  </a-form-item-rest>
                </a-space>
              </a-form-item>
            </a-col> */}
            <a-col offset={6} span={12} style={{ textAlign: "right" }}>
              <a-form-item name="name">
                <a-space>
                  <a-input
                    style={{ width: "300px" }}
                    placeholder="输入关键字搜索图片"
                    onPressEnter={handleSearch}
                    v-model:value={form.value.name}
                  ></a-input>
                  <a-button type="primary" onClick={handleSearch}>
                    查询
                  </a-button>
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
