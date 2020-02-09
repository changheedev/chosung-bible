const Hangul = require("hangul-js");

export const state = () => {
  return {
    chosung: {}
  };
};

export const mutations = {
  setChosung(state, chosung) {
    state.chosung = chosung;
  }
};

export const getters = {
  chosung(state) {
    return state.chosung;
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
        //추출한 배열의 각 첫 글자를 합친다 => 'ㅊㅅㄱ'
        disassembled.forEach(word => (chosung += word[0]));
        //만들어진 초성을 key 로 하여 map 을 만든다
        chosungMap.set(chosung, { id: book.id, name: book.name });
      });

      console.log(chosungMap);
      commit("setChosung", chosungMap);
    } catch (err) {
      console.error("Create chosung list failed", err);
    }
  }
};
