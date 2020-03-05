<template>
  <autocomplete
    :search="search"
    :get-result-value="getResultValue"
    :autoSelect="true"
    placeholder="ㅊㅅㄱ123 또는 내용 검색"
    aria-label="Search bible"
    @submit="handleAutocompleteSubmit"
  >
  </autocomplete>
</template>

<script>
const TrieSearch = require('trie-search');
const Hangul = require('hangul-js');
export default {
  data() {
    return {
      trie: null,
      metadata: null
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
    },
    createTrie() {
      const chosungMap = this.$store.getters.chosung;
      this.trie = new TrieSearch('irrelevantForMapMethod');
      chosungMap.forEach((value, key, mapObject) => this.trie.map(key, value));
    },
    isPossibleHasNumberInChosung(input) {
      const startTwoWord = input.substring(0, 2);
      if (startTwoWord === 'ㅇㅎ' || startTwoWord === 'dg') {
        return true;
      }
      return false;
    },
    /* 입력의 초성과 숫자(장,절) 정보를 분리 */
    parseInput(input) {
      const suffixNum = input.match(/\d+$/g);

      let text = [];
      let num = [];

      //input의 suffix가 숫자인 경우 2가지 경우의 결과를 합쳐서 반환
      if (suffixNum) {
        //case1: suffix의 첫 숫자를 초성으로 사용 => 요한1서, 요한2서... 등의 처리를 위함
        if (this.isPossibleHasNumberInChosung(input)) {
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
    isVerseStartWithZero(verse) {
      return verse.charAt(0) === '0';
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
    getBookMetadata(book) {
      return this.metadata[book - 1];
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
    findIndexByMeta(from, meta) {
      return from.findIndex(
        item => item.data.book === meta.book && item.data.chapter === meta.chapter && item.data.verse === meta.verse
      );
    },
    findIndexByKeyword(from, keyword) {
      return from.findIndex(item => item.data.keyword === keyword);
    },
    search(input) {
      return new Promise(resolve => {
        // 입력값이 없을땐 최근 검색 기록을 보여준다
        if (input.length < 1) {
          const histories = this.getOrDefaultHistoryFromLocalStorage();
          resolve(histories);
        }

        //초성이 아닌 문장이 입력되었을때 키워드 검색 처리
        if (Hangul.isComplete(input)) {
          resolve([{ type: 'keyword', data: { keyword: input } }]);
        }

        const parsedInput = this.parseInput(input);
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
      if (result.type === 'keyword') {
        return result.data.keyword;
      }
      return result.data.text;
    },
    handleAutocompleteSubmit(result) {
      if (!result) {
        return;
      }
      this.saveSearchHistory(result);

      let query = {};

      if (result.type === 'keyword') {
        query = {
          type: result.type,
          keyword: encodeURIComponent(result.data.keyword)
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
    },
    getHistoryFromLocalStorage() {
      return JSON.parse(localStorage.getItem('searchHistory'));
    },
    getOrDefaultHistoryFromLocalStorage() {
      return JSON.parse(localStorage.getItem('searchHistory')) || new Array();
    },
    removeDuplHistory(histories, newHistory) {
      let index = 0;
      if (newHistory.type === 'keyword') {
        index = this.findIndexByKeyword(histories, newHistory.data.keyword);
      } else {
        index = this.findIndexByMeta(histories, newHistory.data);
      }

      //중복된 기록 삭제
      if (index !== -1) {
        histories.splice(index, 1);
      }
    },
    updateHistoryToLocalStorage(histories) {
      //히스토리는 10개 까지만 저장
      if (histories.length > 10) {
        histories.pop();
      }
      localStorage.setItem('searchHistory', JSON.stringify(histories));
    },
    saveSearchHistory(newHistory) {
      const histories = this.getOrDefaultHistoryFromLocalStorage();
      this.removeDuplHistory(histories, newHistory);
      histories.unshift(newHistory);
      this.updateHistoryToLocalStorage(histories);
    }
  }
};
</script>
