<template>
  <section class="container min-vh-100">
    <b-navbar fixed="top" variant="light" type="light" class="shadow-sm">
      <b-navbar-brand to="/"
        ><b-icon-arrow-left font-scale="1.5"></b-icon-arrow-left
      ></b-navbar-brand>
      <b-navbar-nav class="ml-auto">
        <b-button-group>
          <b-button
            class="disable-dbl-tap-zoom"
            variant="outline-dark"
            size="sm"
            @click="decreaseFontSize"
            :disabled="disableDecFontSize"
            ><b-icon-dash></b-icon-dash
          ></b-button>
          <b-button
            class="disable-dbl-tap-zoom"
            variant="outline-dark"
            size="sm"
            @click="increaseFontSize"
            ><b-icon-plus></b-icon-plus
          ></b-button>
        </b-button-group>
      </b-navbar-nav>
    </b-navbar>

    <div class="view-bible-area mt-3" v-if="isViewBible">
      <ul class="ul-bible">
        <li v-for="item in searchedData" :key="'bible_' + item.id">
          <div class="bible-metadata">
            {{ makeMetadataText(item) }}
          </div>
          <div
            :style="{ fontSize: fontSize + 'px' }"
            class="bible-content shadow-sm rounded p-3"
          >
            <text-highlight
              :queries="tokenSet"
              v-if="searchParams.type === 'keyword'"
              >{{ item.content }}</text-highlight
            >
            <span v-else>{{ item.content }}</span>
          </div>
        </li>
      </ul>
      <div class="text-center">
        <b-button
          class="btn-more mt-5 px-5"
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
import { BIconArrowLeft, BIconPlus, BIconDash } from "bootstrap-vue";

export default {
  components: { BIconArrowLeft, BIconPlus, BIconDash },
  asyncData({ query, store }) {
    const books = store.getters.books;
    let searchParams = {};

    if (query.type === "keyword") {
      searchParams = {
        type: "keyword",
        keyword: query.keyword,
        page: query.page || 0
      };
    } else {
      searchParams = {
        type: "meta",
        book: query.book || 1,
        chapter: query.chapter || 1,
        verse: query.verse || 1,
        page: query.page || 0
      };
    }

    return {
      books: books,
      searchParams: searchParams
    };
  },
  data() {
    return {
      searchedData: [],
      message: "검색 중입니다...",
      fontSize: 16
    };
  },
  computed: {
    isViewBible() {
      if (this.searchedData.length > 0) return true;
      return false;
    },
    disableDecFontSize() {
      if (this.fontSize > 16) return false;
      return true;
    },
    tokenSet() {
      let tokenSet = [];
      if (this.searchParams.type !== "keyword") return tokenSet;

      const keyword = decodeURIComponent(this.searchParams.keyword);

      const keywordTokens = keyword.split(" ");

      tokenSet.push(keyword);
      tokenSet = tokenSet.concat(keywordTokens);

      keywordTokens
        .filter(token => token.length >= 2)
        .forEach(token => {
          for (let i = 1; i <= token.length - 1; i++) {
            const newToken = token.substring(0, i) + " " + token.substring(i);
            tokenSet.push(newToken);
          }
        });
      return tokenSet;
    }
  },
  mounted() {
    this.getBible(this.searchParams);
  },
  methods: {
    async getBible(searchParams) {
      try {
        let bible = [];
        if (searchParams.type === "keyword") {
          if (!searchParams.keyword) throw new Error("Keyword is null");
          bible = await this.getBibleByKeyword(searchParams);
        } else bible = await this.getBibleByMeta(searchParams);

        if (bible.length == 0) this.message = "검색 결과가 없습니다.";
        this.searchedData = this.searchedData.concat(bible);
      } catch (err) {
        this.message = "검색 과정에서 오류가 발생했습니다.";
      }
    },
    getBibleByMeta({ type, book, chapter, verse, page }) {
      return new Promise((resolve, reject) => {
        this.$axios
          .get(`/api/bible/book/${book}/chapter/${chapter}/verse/${verse}`, {
            params: {
              page: page
            }
          })
          .then(result => resolve(result));
      });
    },
    getBibleByKeyword({ type, keyword, page }) {
      return new Promise((resolve, reject) => {
        this.$axios
          .get("/api/bible", {
            params: {
              keyword: keyword,
              page: page
            }
          })
          .then(result => resolve(result));
      });
    },
    getBibleNextPage() {
      this.searchParams.page = this.searchParams.page + 1;
      this.getBible(this.searchParams);
    },
    makeMetadataText(item) {
      return `${this.books[item.book - 1].name} ${item.chapter}${
        item.book === 19 ? "편" : "장"
      } ${item.verse}절`;
    },
    decreaseFontSize() {
      if (this.fontSize > 16) this.fontSize--;
    },
    increaseFontSize() {
      this.fontSize++;
    }
  }
};
</script>

<style scoped>
.navbar-brand {
  padding: 0;
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

.disable-dbl-tap-zoom {
  touch-action: manipulation;
}
.bible-content {
  line-height: 1.8rem;
}
</style>
