<template>
  <autocomplete
    :search="search"
    :get-result-value="getResultValue"
    :autoSelect="true"
    placeholder="검색어를 입력하세요"
    aria-label="Search bible"
    @submit="handleAutocompleteSubmit"
  >
  </autocomplete>
</template>

<script>
const TrieSearch = require('trie-search');
const Hangul = require('hangul-js');
import SearchHistory from '~/utils/search-history';
export default {
  data() {
    return {
      trie: null,
      metadata: null,
      books: null
    };
  },
  mounted() {
    try {
      this.loadMetadata();
      this.createTrie();
    } catch (err) {
      throw new Error('초기 데이터를 로드하는데 실패했습니다.');
    }
  },
  methods: {
    loadMetadata() {
      this.metadata = this.$store.getters.metadata;
      this.books = this.$store.getters.books;
    },
    createTrie() {
      const chosungMap = this.$store.getters.chosung;
      this.trie = new TrieSearch('irrelevantForMapMethod');
      chosungMap.forEach((value, key, mapObject) => this.trie.map(key, value));
    },
    isVerseStartWithZero(verse) {
      return verse.charAt(0) === '0';
    },
    isRangeChapter(book, chapter) {
      const _metadata = this.getBookMetadata(book);
      if (chapter > 0 && chapter <= _metadata.chapters) {
        return true;
      }
      return false;
    },
    isRangeVerse(book, chapter, verse) {
      const _metadata = this.getBookMetadata(book);
      if (verse > 0 && verse <= _metadata.verses[chapter - 1]) {
        return true;
      }
      return false;
    },
    hasNumberInChosung(input) {
      const startTwoWord = input.substring(0, 2);
      if (startTwoWord === 'ㅇㅎ' || startTwoWord === 'dg') {
        return true;
      }
      return false;
    },
    getBookMetadata(book) {
      return this.metadata[book - 1];
    },
    findIndexByMeta(from, meta) {
      return from.findIndex(
        item => item.data.book === meta.book && item.data.chapter === meta.chapter && item.data.verse === meta.verse
      );
    },
    parseNum(num) {
      //숫자가 입력되지 않은 경우
      if (!num) {
        return [[1, 1]];
      }

      let numstr = num.toString();
      const result = [];
      //chapter는 최대 3자리 이므로 최대 길이를 3으로 제한한다
      const maxLen = numstr.length < 3 ? numstr.length : 3;

      for (let lenOfChapter = 1; lenOfChapter <= maxLen; lenOfChapter++) {
        let chapter = numstr.substring(0, lenOfChapter);
        // 길이가 3이하인 numstr을 모두 chapter로 자르면 verse가 없게 되므로 1로 설정해준다
        let verse = numstr.substring(lenOfChapter) ? numstr.substring(lenOfChapter) : '1';

        // 502 => 5, 02 로 나눠지지 않도록 verse 가 0으로 시작하는 경우는 제외시켜준다.
        if (!this.isVerseStartWithZero(verse)) {
          result.push([Number(chapter), Number(verse)]);
        }
      }
      return result;
    },
    /* 입력의 초성과 숫자(장,절) 정보를 분리 */
    parseInput(input) {
      const suffixNum = input.match(/\d+$/g);

      let text = [];
      let num = [];

      //input의 suffix가 숫자인 경우 2가지 경우의 결과를 합쳐서 반환
      if (suffixNum) {
        //case1: suffix의 첫 숫자를 초성으로 사용 => 요한1서, 요한2서... 등의 처리를 위함
        if (this.hasNumberInChosung(input)) {
          num.push(suffixNum[0].substring(1));
          text.push(input.substring(0, input.length - suffixNum[0].substring(1).length));
        }
        //case2: suffix 숫자를 모두 장,절 정보로 사용
        num.push(suffixNum[0]);
        text.push(input.substring(0, input.length - suffixNum[0].length));
      }
      //case3: input의 suffix가 숫자가 아닌 경우
      else {
        text.push(input);
        num.push(null);
      }
      return {
        chosung: text,
        num: num
      };
    },
    parseKeyword(input) {
      return input.split(' > ');
      if (book) {
        return [keyword.trim(), book.trim()];
      }
      return [keyword.trim(), null];
    },
    makeAutoCompleteList(chosung, num) {
      let result = [];
      const parsedNum = this.parseNum(num);
      this.trie.get(chosung).forEach(book => {
        parsedNum.forEach(([chapter, verse]) => {
          // book 의 최대 chapter, 최대 verse 를 벗어나지 않는 경우에만 리스트에 넣는다
          if (this.isRangeChapter(book.id, chapter) && this.isRangeVerse(book.id, chapter, verse)) {
            result.push({
              text: `${book.name} ${chapter}${book.id === 19 ? '편' : '장'} ${verse}절`,
              book: book.id,
              chapter: chapter,
              verse: verse
            });
          }
        });
      });
      return result;
    },
    search(input) {
      const _input = input.trim();
      return new Promise(resolve => {
        // 입력값이 없을땐 최근 검색 기록을 보여준다
        if (_input.length < 1) {
          const histories = SearchHistory.getOrDefaultSearchHistory();
          resolve(histories);
        }

        //초성이 아닌 문장이 입력되었을때 키워드 검색 처리
        if (Hangul.isComplete(_input)) {
          //특정 성경에서 키워드를 찾기 위한 입력이 있는지 확인, ex) keyword > 성경
          const [keyword, book] = this.parseKeyword(_input);
          resolve([{ type: 'keyword', data: { text: _input, keyword: keyword, book: book } }]);
        }

        const parsedInput = this.parseInput(_input);
        const parsedChosung = parsedInput.chosung;
        const parsedNum = parsedInput.num;

        let result = [];

        for (let i = 0; i < parsedChosung.length; i++) {
          //결과 리스트에 없는 아이템만 리스트에 넣는다. (중복 결과 방지)
          this.makeAutoCompleteList(parsedChosung[i], parsedNum[i]).forEach(newItem => {
            if (this.findIndexByMeta(result, newItem) === -1) {
              result.push({ type: 'meta', data: newItem });
            }
          });
        }
        resolve(result);
      });
    },
    getResultValue(result) {
      return result.data.text;
    },
    handleAutocompleteSubmit(result) {
      if (!result) {
        return;
      }
      SearchHistory.saveSearchHistory(result);

      let query = {};

      if (result.type === 'keyword') {
        let bookId = 0;

        if (result.data.book) {
          bookId = this.books.reduce((id, item) => {
            if (item.name === result.data.book) {
              id = item.id;
            }
            return id;
          }, 0);
        }

        query = {
          type: result.type,
          keyword: encodeURIComponent(result.data.keyword),
          book: bookId
        };
      } else {
        query = {
          type: result.type,
          book: result.data.book,
          chapter: result.data.chapter,
          verse: result.data.verse
        };
      }
      query.page = 0;
      this.$emit('search', query);
    }
  }
};
</script>
