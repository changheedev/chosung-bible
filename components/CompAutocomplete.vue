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
    getResultValue(result) {
      return result.data.text;
    },
    handleAutocompleteSubmit(result) {
      if (!result) {
        return;
      }
      this.$emit('search', result);      
    },
    search(input) {
      const _input = input.trim();
      // return new Promise(resolve => {
      // 입력값이 없을땐 최근 검색 기록을 보여준다
      if (_input.length < 1) {
        const histories = SearchHistory.getOrDefaultSearchHistory();
        // resolve(histories);
        return histories;
      } else {
        //초성이 아닌 문장이 입력되었을때 키워드 검색 처리
        if (Hangul.isComplete(_input)) {
          return this.searchByKeyword(_input);
        } else {
          return this.searchByMeta(_input);
        }
      }
      // });
    },
    searchByKeyword(input) {
      //특정 성경에서 키워드를 찾기 위한 입력이 있는지 확인, ex) keyword > 성경
      const [keyword, book] = this.parseKeyword(input);
      // resolve([{ type: 'keyword', data: { text: _input, keyword: keyword, book: book } }]);
      return [{ type: 'keyword', data: { text: input, keyword: keyword, book: book } }];
    },
    parseKeyword(input) {
      const [keyword, book] = input.split('>');
      if (book) {
        return [keyword.trim(), book.trim()];
      }
      return [keyword.trim(), null];
    },
    searchByMeta(input) {
      const parsedInput = this.parseInputToChosungAndNum(input);
      const chosung = parsedInput.chosung;
      const num = parsedInput.num;

      const result = this.makeAutoCompleteList(chosung, num);
      result.sort((a, b) => {
        const bookDiff = a.data.book - b.data.book;
        const chapterDiff = a.data.chapter - b.data.chapter;
        const verseDiff = a.data.verse - b.data.verse;

        if (bookDiff === 0 && chapterDiff === 0) {
          return verseDiff;
        } else if (bookDiff === 0 && chapterDiff !== 0) {
          return chapterDiff;
        } else return bookDiff;
      });

      // resolve(result);
      return result;
    },
    /* 입력의 초성과 숫자(장,절) 정보를 분리 */
    parseInputToChosungAndNum(input) {
      const suffixNum = input.match(/\d+$/g);

      let chosung = [];
      let num = [];

      //input의 suffix가 숫자인 경우 2가지 경우의 결과를 합쳐서 반환
      if (suffixNum) {
        //case1: suffix의 첫 숫자를 초성으로 사용 => 요한1서, 요한2서... 등의 처리를 위함
        if (this.hasNumberInChosung(input)) {
          num.push(suffixNum[0].substring(1));
          chosung.push(input.substring(0, input.length - suffixNum[0].substring(1).length));
        }
        //case2: suffix 숫자를 모두 장,절 정보로 사용
        num.push(suffixNum[0]);
        chosung.push(input.substring(0, input.length - suffixNum[0].length));
      }
      //case3: input의 suffix가 숫자가 아닌 경우
      else {
        chosung.push(input);
        num.push(null);
      }
      return {
        chosung: chosung,
        num: num
      };
    },
    makeAutoCompleteList(candChosungList, candNumList) {
      let result = [];
      let candidateResult = [];

      for (let i = 0; i < candChosungList.length; i++) {
        const chosungList = this.trie.get(candChosungList[i]);
        const parsedNum = this.parseNum(candNumList[i]);

        chosungList.forEach(book => {
          parsedNum.forEach(([chapter, verse]) => {
            // book 의 최대 chapter, 최대 verse 를 벗어나지 않는 경우에만 리스트에 넣는다
            if (this.isRangeChapter(book.id, chapter) && this.isRangeVerse(book.id, chapter, verse)) {
              const newItem = {
                text: `${book.name} ${chapter}${book.id === 19 ? '편' : '장'} ${verse}절`,
                book: book.id,
                chapter: chapter,
                verse: verse
              };
              if (this.findIndexByMeta(result, newItem) === -1) {
                result.push({
                  type: 'meta',
                  data: newItem
                });
              }
            } else {
              //후보 검색 리스트 생성
              const maxChapter = this.getMaxChapter(book.id);
              const adjustedChapter = chapter > maxChapter ? maxChapter : chapter;

              const maxVerse = this.getMaxVerse(book.id, adjustedChapter);
              const adjustedVerse = verse > maxVerse ? maxVerse : verse;

              const newItem = {
                text: `${book.name} ${adjustedChapter}${book.id === 19 ? '편' : '장'} ${adjustedVerse}절`,
                book: book.id,
                chapter: adjustedChapter,
                verse: adjustedVerse
              };
              if (this.findIndexByMeta(candidateResult, newItem) === -1) {
                candidateResult.push({
                  type: 'meta',
                  data: newItem
                });
              }
            }
          });
        });
      }
      if (result.length > 0) {
        this.$emit('alert', false);
        return result;
      } else if (candidateResult.length > 0) {
        this.$emit('alert', true);
        return candidateResult;
      } else return [];
    },
    parseNum(num) {
      //숫자가 입력되지 않은 경우
      if (!num) {
        return [[1, 1]];
      }

      let numstr = num.toString();
      const result = [];
      //chapter는 최대 3자리 이므로 최대 길이를 3으로 제한한다
      //const maxLen = numstr.length < 3 ? numstr.length : 3;

      for (let lenOfChapter = 1; lenOfChapter <= numstr.length; lenOfChapter++) {
        let chapter = numstr.substring(0, lenOfChapter);
        let verse = numstr.substring(lenOfChapter);

        // 길이가 3이하인 numstr을 모두 chapter로 자르면 verse가 없게 되므로 1로 설정해준다
        if (!verse) verse = '1';

        // chapter와 verse가 0으로 시작하는 경우는 결과에서 제외 (verse를 숫자로 변경했을때 0인 경우는 결과에 포함시킨다)
        if (this.isStartWithZero(chapter) || this.isStartWithZero(verse)) continue;

        result.push([Number(chapter), Number(verse)]);
      }
      return result;
    },
    isStartWithZero(numstr) {
      return numstr.charAt(0) === '0';
    },
    getMaxChapter(book) {
      const _metadata = this.getBookMetadata(book);
      return _metadata.chapters;
    },
    getMaxVerse(book, chapter) {
      const _metadata = this.getBookMetadata(book);
      return _metadata.verses[chapter - 1];
    },
    isRangeChapter(book, chapter) {
      const maxChapter = this.getMaxChapter(book);
      if (chapter > 0 && chapter <= maxChapter) {
        return true;
      }
      return false;
    },
    isRangeVerse(book, chapter, verse) {
      const maxVerse = this.getMaxVerse(book, chapter);
      if (verse > 0 && verse <= maxVerse) {
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
    }
  }
};
</script>
