import { defineComponent } from "vue";
import { useVModel } from "@vueuse/core";
import _ from "lodash";
import CodeEditor from "@/components/codeEditor";
import { Splitpanes, Pane } from "splitpanes";
import "splitpanes/dist/splitpanes.css";

/**
 * 展示结果
 */
const CodeWithResult = defineComponent({
  emits: ["update:value"],
  props: {
    value: {
      type: String,
    },
    result: {
      type: Object,
    },
    disabled: Boolean,
  },
  setup(props, { emit }) {
    const modelValue = useVModel(props, "value", emit);

    return () => {
      let result;
      if (!_.isEmpty(props.result)) {
        const { success, result: resultRes } = props.result;
        if (success) {
          result = <div class="success">Success!</div>;
        } else {
          result = (
            <div class="error">
              <div class="header">
                {resultRes["@type"]}:{resultRes.message}
              </div>
              <ul class="stack-container">
                {resultRes.stackTrace.map((s) => (
                  <li>
                    {s.className}:{s.lineNumber}
                  </li>
                ))}
              </ul>
            </div>
          );
        }
      }

      return (
        <div class="code-with-result">
          <Splitpanes class="default-theme" first-splitter>
            <Pane minSize="20" size={90}>
              <CodeEditor
                height={720}
                language="groovy"
                readonly={props.disabled}
                v-model:value={modelValue.value}
              />
            </Pane>
            <Pane minSize="10">
              <div class="result">{result}</div>
            </Pane>
          </Splitpanes>
        </div>
      );
    };
  },
});

export default CodeWithResult;
