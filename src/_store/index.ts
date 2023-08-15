import { createStore } from "vuex";

const store = createStore({
  state: {
    id: "",
    page: "list",
  },
  mutations: {
    setCanvas(state, canvas) {
      const key = canvas.id;
      if (!state[key]) state[key] = { change: false };
      canvas.style ? (state[key].style = canvas.style) : "";
      canvas.title ? (state[key].title = canvas.title) : "";
      canvas.theme ? (state[key].theme = canvas.theme) : "";
    },
    clearCanvas(state) {
      Object.keys(state).forEach((item) => {
        if (item !== "page" && item !== "id") {
          if (item) {
            state[item].style = "";
          }
        }
      });
    },
    setId(state, val) {
      state.id = val;
    },
    setChange(state, { key, val }) {
      if (state[key]) {
        state[key].change = val;
      }
    },
    setPage(state, val) {
      state.page = val;
    },
  },
});

export default store;
