const Hangul = require('hangul-js');
const alphabet = new Map([
  ['ㄱ', 'r'],
  ['ㄴ', 's'],
  ['ㄷ', 'e'],
  ['ㄹ', 'f'],
  ['ㅁ', 'a'],
  ['ㅂ', 'q'],
  ['ㅅ', 't'],
  ['ㅇ', 'd'],
  ['ㅈ', 'w'],
  ['ㅊ', 'c'],
  ['ㅋ', 'z'],
  ['ㅌ', 'x'],
  ['ㅍ', 'v'],
  ['ㅎ', 'g']
]);

export const state = () => {
  return {
    books: [],
    chosung: {},
    metadata: {},
    searchParams: {}
  };
};

export const mutations = {
  setBooks(state, books) {
    state.books = books;
  },
  setChosung(state, chosung) {
    state.chosung = chosung;
  },
  setMetadata(state, metadata) {
    state.metadata = metadata;
  },
  setSearchParams(state, searchParams) {
    state.searchParams = searchParams;
  }
};

export const getters = {
  books(state) {
    return state.books;
  },
  chosung(state) {
    return state.chosung;
  },
  metadata(state) {
    return state.metadata;
  },
  searchParams(state) {
    return state.searchParams;
  },
  query(state) {
    const searchParams = state.searchParams;

    if (!searchParams) return null;

    if (searchParams.type === 'keyword') {
      return {
        type: searchParams.type,
        keyword: encodeURIComponent(searchParams.data.keyword),
        book: searchParams.data.book,
        page: 0
      };
    } else if (searchParams.type === 'meta') {
      return {
        type: searchParams.type,
        book: searchParams.data.book,
        chapter: searchParams.data.chapter,
        verse: searchParams.data.verse,
        page: 0
      };
    } else return null;
  }
};

const createChosungMap = books => {
  let chosungMap = new Map();

  books.forEach(book => {
    /**
     * true => 각 글자별로 배열을 생성해주는 옵션
     *input: '창세기'
     *return: [['ㅊ','ㅏ','ㅇ'],['ㅅ','ㅔ'],['ㄱ','ㅣ']]
     */
    const disassembled = Hangul.disassemble(book.name, true);
    let chosung = '';
    let chosungAlpha = '';

    disassembled.forEach(word => {
      //추출한 배열의 각 첫 글자를 합친다 => 'ㅊㅅㄱ'
      chosung += word[0];
      /**
       * 영어로 입력되는 경우를 위한 처리 'ㅊㅅㄱ' => 'ctr'
       * 숫자가 아닌 경우에만 알파벳으로 변환한다
       */
      chosungAlpha += isNaN(word[0]) ? alphabet.get(word[0]) : word[0];
    });
    //만들어진 초성을 key 로 하여 map 을 만든다
    chosungMap.set(chosung, { id: book.id, name: book.name });
    chosungMap.set(chosungAlpha, { id: book.id, name: book.name });
  });

  return chosungMap;
};

export const actions = {
  async nuxtServerInit({ commit }, { app }) {
    try {
      const { books, metadata } = await app.$axios.get('/api/bible/metadata');
      commit('setMetadata', metadata);
      commit('setBooks', books);
      console.log('Get bible data has been established successfully.');

      const chosungMap = createChosungMap(books);
      commit('setChosung', chosungMap);
      console.log('Create chosung list has been established successfully.');
    } catch (err) {
      console.error('Store init failed\n', err);
    }
  }
};
