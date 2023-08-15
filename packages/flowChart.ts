import MTEditor from "../src/components/editor";

const install = (app) => {
  app.component("MtEditor", MTEditor);
};

export const Editor = MTEditor;

export default { install };
