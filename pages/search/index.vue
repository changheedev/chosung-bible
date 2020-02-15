<template>
  <section class="container">
    <b-navbar fixed="top" variant="light" type="light" class="shadow-sm">
      <b-navbar-brand to="/"><i class="arrow left"></i></b-navbar-brand>
    </b-navbar>
    <div class="view-bible-area mt-3" v-if="isViewBible">
      <ul class="ul-bible">
        <li v-for="item in searchedData" :key="'bible_' + item.id">
          <div class="bible-metadata">
            {{ makeMetadataText(item) }}
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
    <div class="state-message" v-else>{{ message }}</div>
  </section>
</template>

<script>
export default {
  asyncData({ query, store }) {
    const books = store.getters.books;
    return {
      books: books,
      searchParam: {
        book: query.book || 1,
        chapter: query.chapter || 1,
        verse: query.verse || 1,
        page: query.page || 0
      }
    };
  },
  data() {
    return {
      searchedData: [],
      message: "검색 중입니다..."
    };
  },
  computed: {
    isViewBible() {
      if (this.searchedData.length > 0) return true;
      return false;
    }
  },
  mounted() {
    this.getBible(this.searchParam);
  },
  methods: {
    async getBible(searchParam) {
      try {
        const bible = await this.$axios.get(
          `/api/bible/book/${searchParam.book}/chapter/${searchParam.chapter}/verse/${searchParam.verse}?page=${searchParam.page}`
        );
        if (bible.length == 0) this.message = "검색 결과가 없습니다.";
        this.searchedData = this.searchedData.concat(bible);
      } catch (err) {
        this.message = "검색 과정에서 오류가 발생했습니다.";
      }
    },
    getBibleNextPage() {
      this.searchParam.page = this.searchParam.page + 1;
      this.getBible(this.searchParam);
    },
    makeMetadataText(item) {
      return `${this.books[item.book - 1].name} ${item.chapter}${
        item.book === 19 ? "편" : "장"
      } ${item.verse}절`;
    }
  }
};
</script>

<style scoped>
i {
  border: solid #000;
  border-width: 0 3px 3px 0;
  display: inline-block;
  padding: 5px;
  margin-left: 3px;
}

.left {
  transform: rotate(135deg);
  -webkit-transform: rotate(135deg);
}

.container {
  padding: 76px 20px 50px;
  width: 100%;
  max-width: 700px;
  min-height: 100vh;
}

.title {
  font-size: 1.2rem;
  margin-bottom: 20px;
}
.ul-bible {
  list-style: none;
  margin: 0;
  padding: 0;
}

.ul-bible > li + li {
  margin-top: 25px;
}

.bible-metadata {
  font-size: 0.8rem;
  margin-left: 3px;
  color: #999;
}
</style>
