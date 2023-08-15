import { computed, defineComponent, onMounted, ref, watch } from "vue";
import { useVModel, watchOnce } from "@vueuse/core";
import * as monaco from "monaco-editor";
import { registerGroovyLanguageForMonaco } from "./groovyDefination";

const CodeEditor = defineComponent({
  emits: ["change", "update:value"],
  props: {
    placeholder: String,
    readonly: Boolean,
    language: {
      type: String,
      validator(val: string) {
        return ["javascript", "groovy"].includes(val);
      },
      default: "groovy",
    },
    height: {
      type: [String, Number],
      default: 500,
    },
    value: {
      type: String,
      default: "",
    },
  },
  setup(props, { emit }) {
    const containerRef = ref();
    const code = useVModel(props, "value", emit);

    const height = computed(() => {
      if (typeof props.height === "number") {
        return props.height + "px";
      }
      return props.height;
    });
    let editor: monaco.editor.IStandaloneCodeEditor;

    onMounted(() => {
      if (props.language === "groovy") {
        registerGroovyLanguageForMonaco();
      }
      editor = monaco.editor.create(containerRef.value, {
        language: props.language,
        theme: "vs-dark",
        automaticLayout: true,
        ariaContainerElement: document.createElement("div"),
      });
      setTimeout(() => {
        editor.getModel()?.setValue(code.value);
      });
      editor.onDidChangeModelContent(() => {
        const model = editor.getModel();
        if (model) {
          code.value = model.getValue();
        }
      });
      if (props.readonly) {
        editor.updateOptions({
          readOnly: props.readonly,
        });
      }
    });

    watchOnce(
      () => props.value,
      (val) => {
        editor.getModel()?.setValue(val);
      }
    );

    watch(
      () => props.readonly,
      (val) => {
        editor.updateOptions({
          readOnly: val,
        });
      }
    );

    return () => (
      <div class="code-editor" style={{ height: height.value }}>
        <div
          class="container"
          style={{ height: height.value }}
          ref={containerRef}
        ></div>
      </div>
    );
  },
});

export default CodeEditor;
