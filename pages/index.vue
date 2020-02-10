<template>
  <section class="container">
    <autocomplete
      :search="search"
      :get-result-value="getResultValue"
      placeholder="성경 검색"
      aria-label="성경 검색"
      @submit="handleSubmit"
    ></autocomplete>
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
      searchParam: {
        book: 0,
        chapter: 0,
        verseFrom: 0,
        verseTo: 0
      }
    };
  },
  mounted() {
    //create trie
    const chosungMap = this.$store.getters.chosung;
    this.trie = new TrieSearch("irrelevantForMapMethod");
    chosungMap.forEach((value, key, mapObject) => this.trie.map(key, value));
  },
  methods: {
    search(input) {
      return new Promise(resolve => {
        if (input.length < 1) {
          resolve([]);
        }
        const result = this.trie.get(input);
        resolve(result);
      });
    },
    getResultValue(result) {
      return result.name;
    },
    handleSubmit(result) {
      this.searchParam.book = result.id;
      console.log(this.searchParam.book);
    }
  }
};
</script>

<style>
.container {
  padding-top: 50px;
  width: 100%;
  min-height: 100vh;
}
</style>
