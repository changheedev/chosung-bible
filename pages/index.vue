<template>
  <section class="container">
    <h1 class="title mb-4">초성 바이블</h1>
    <autocomplete
      class="el-autocomplete"
      :search="search"
      :get-result-value="getResultValue"
      placeholder="Search bible"
      aria-label="Search bible"
      @submit="handleSubmit"
    ></autocomplete>
    <div class="area-description mt-5">
      <p>초성과 숫자로 간편하게 성경을 검색해보세요.</p>
      <p>입력예시 : ㅊㅅㄱ123, ctr123</p>
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
      trie: null,
      metadata: null
    };
  },
  mounted() {
    console.log(process.env.BASE_URL);
    this.loadMetadata();
    this.createTrie();
  },
  methods: {
    loadMetadata() {
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
      this.$router.push(
        `/search?book=${result.book}&chapter=${result.chapter}&verse=${result.verse}`
      );
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
    }
  }
};
</script>

<style scoped>
.container {
  padding: 0 20px;
  width: 100%;
  max-width: 700px;
  min-height: 100vh;
}

.title {
  padding-top: 200px;
  font-size: 1.7rem;
  text-align: center;
}

.el-autocomplete {
  position: relative;
  max-width: 500px;
  margin: 0 auto;
}

.el-autocomplete::before {
  font-size: 0.7rem;
  bottom: -20px;
  right: 5px;
  color: #555;
  position: absolute;
  content: "DB - 개역한글성경";
}

.area-description {
  text-align: center;
  font-size: 1rem;
  color: #555;
}

@media (max-width: 480px) {
  .title {
    padding-top: 100px;
  }
}
</style>
