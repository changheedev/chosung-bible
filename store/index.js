const Hangul = require("hangul-js");
const alphabet = new Map([
  ["ㄱ", "r"],
  ["ㄴ", "s"],
  ["ㄷ", "e"],
  ["ㄹ", "f"],
  ["ㅁ", "a"],
  ["ㅂ", "q"],
  ["ㅅ", "t"],
  ["ㅇ", "d"],
  ["ㅈ", "w"],
  ["ㅊ", "c"],
  ["ㅋ", "z"],
  ["ㅌ", "x"],
  ["ㅍ", "v"],
  ["ㅎ", "g"]
]);

export const state = () => {
  return {
    chosung: {},
    metadata: {}
  };
};

export const mutations = {
  setChosung(state, chosung) {
    state.chosung = chosung;
  },
  setMetadata(state, metadata) {
    state.metadata = metadata;
  }
};

export const getters = {
  chosung(state) {
    return state.chosung;
  },
  metadata(state) {
    return state.metadata;
  }
};

export const actions = {
  async nuxtServerInit({ commit }, { app }) {
    try {
      const booksResponse = await app.$axios.get("/api/bible/books");
      const books = booksResponse.data;
      let chosungMap = new Map();

      books.forEach(book => {
        /**
         * true => 각 글자별로 배열을 생성해주는 옵션
         *input: '창세기'
         *return: [['ㅊ','ㅏ','ㅇ'],['ㅅ','ㅔ'],['ㄱ','ㅣ']]
         */
        const disassembled = Hangul.disassemble(book.name, true);
        let chosung = "";
        let chosungAlpha = "";
        //추출한 배열의 각 첫 글자를 합친다 => 'ㅊㅅㄱ'
        disassembled.forEach(word => {
          chosung += word[0];
          //영어로 입력되는 경우 처리 'ㅊㅅㄱ' => 'ctr'
          chosungAlpha += alphabet.get(word[0]);
        });
        //만들어진 초성을 key 로 하여 map 을 만든다
        chosungMap.set(chosung, { id: book.id, name: book.name });
        chosungMap.set(chosungAlpha, { id: book.id, name: book.name });
      });

      commit("setChosung", chosungMap);
      console.log("Create chosung list has been established successfully.");
    } catch (err) {
      console.error("Create chosung list failed", err);
    }

    try {
      const bibleMeta = await app.$axios.get("/api/bible/metadata");
      commit("setMetadata", bibleMeta.data);
      console.log("Load metadata has been established successfully.");
    } catch (err) {
      console.error("Load bible metadata failed", err);
    }
  }
};
