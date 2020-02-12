<template>
  <section class="container">
    <autocomplete
      :search="search"
      :get-result-value="getResultValue"
      placeholder="성경 검색"
      aria-label="성경 검색"
      @submit="handleSubmit"
    ></autocomplete>
    <div class="view-bible-area mt-3" v-if="isViewBible">
      <ul class="ul-bible">
        <li v-for="item in searchedData" :key="'bible_' + item.id">
          <div class="bible-metadata">
            {{
              books[item.book - 1].name +
                " " +
                item.chapter +
                "장 " +
                item.verse +
                "절"
            }}
          </div>
          <div class="bible-content shadow-sm rounded p-3">
            {{ item.content }}
          </div>
        </li>
      </ul>
      <div class="text-center">
        <b-button
          class="btn-more mt-3 px-5"
          variant="primary"
          @click="getBibleNextPage()"
          >더보기</b-button
        >
      </div>
    </div>
  </section>
</template>

<script>
const TrieSearch = require("trie-search");
import Autocomplete from "@trevoreyre/autocomplete-vue";

export default {
  components: {
    Autocomplete
  },
  data() {
    return {
      books: [],
      trie: null,
      metadata: null,
      searchParam: {
        book: 1,
        chapter: 1,
        verse: 1,
        page: 0
      },
      searchedData: []
    };
  },
  computed: {
    isViewBible() {
      if (this.searchedData.length > 0) return true;
      return false;
    }
  },
  mounted() {
    this.loadMetadata();
    this.createTrie();
  },
  methods: {
    loadMetadata() {
      this.books = this.$store.getters.books;
      this.metadata = this.$store.getters.metadata;
    },
    createTrie() {
      const chosungMap = this.$store.getters.chosung;
      this.trie = new TrieSearch("irrelevantForMapMethod");
      chosungMap.forEach((value, key, mapObject) => this.trie.map(key, value));
    },
    search(input) {
      return new Promise(resolve => {
        if (input.length < 1) {
          resolve([]);
        }

        /*
        입력의 초성과 숫자(장,절) 정보를 분리
        <to-do>
        - ctr -> ㅊㅅㄱ 로 매핑 필요
        */
        const chosung = input.match(/[ㄱ-ㅎ]+/g) || input.match(/[a-z]+/g);
        const num = input.match(/\d+/g);
        const result = this.makeListAutoComplete(chosung, num);
        resolve(result);
      });
    },
    makeListAutoComplete(chosung, num) {
      let result = [];
      const parsedNum = this.parseNum(num);

      this.trie.get(chosung).forEach(book => {
        parsedNum.forEach(([chapter, verse]) => {
          const _metadata = this.metadata[book.id - 1];
          // book(item.id) 의 최대 chapter, 최대 verse 를 벗어나지 않는 경우에만 리스트에 넣는다
          if (
            chapter <= _metadata.maxChapter &&
            verse <= _metadata.maxVerses[chapter - 1].maxVerse
          ) {
            result.push({
              text: `${book.name} ${chapter}장 ${verse}절`,
              book: book.id,
              chapter: chapter,
              verse: verse
            });
          }
        });
      });
      return result;
    },
    getResultValue(result) {
      return result.text;
    },
    handleSubmit(result) {
      if (!result) return;
      this.searchParam.book = result.book;
      this.searchParam.chapter = result.chapter;
      this.searchParam.verse = result.verse;
      this.getBible(this.searchParam);
    },
    parseNum(num) {
      //숫자가 입력되지 않은 경우
      if (!num) return [[1, 1]];

      let numstr = num.toString();
      const result = [];
      //chapter는 최대 3자리 이므로 최대 길이를 3으로 제한한다
      const maxLen = numstr.length < 3 ? numstr.length : 3;

      for (let lenOfChapter = 1; lenOfChapter <= maxLen; lenOfChapter++) {
        let chapter = numstr.substring(0, lenOfChapter);
        // 길이가 3이하인 numstr을 모두 chapter로 자르면 verse가 없게 되므로 1로 설정해준다
        let verse = numstr.substring(lenOfChapter)
          ? numstr.substring(lenOfChapter)
          : "1";
        result.push([Number(chapter), Number(verse)]);
      }

      return result;
    },
    async getBible(searchParam) {
      const bible = (
        await this.$axios.get(
          `/api/bible/book/${searchParam.book}/chapter/${searchParam.chapter}/verse/${searchParam.verse}?page=${searchParam.page}`
        )
      ).data;

      this.searchedData = this.searchedData.concat(bible);
    },
    getBibleNextPage() {
      this.searchParam.page = this.searchParam.page + 1;
      this.getBible(this.searchParam);
    }
  }
};
</script>

<style>
.container {
  padding: 50px 20px;
  width: 100%;
  min-height: 100vh;
}

.ul-bible {
  list-style: none;
  margin: 0;
  padding: 0;
}

.ul-bible > li + li {
  margin-top: 20px;
}

.bible-metadata {
  font-size: 0.8rem;
  margin-left: 3px;
}
</style>
