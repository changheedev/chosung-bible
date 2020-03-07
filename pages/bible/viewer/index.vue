<template>
  <section class="container min-vh-100">
    <b-navbar fixed="top" variant="light" type="light" class="shadow-sm">
      <b-navbar-nav class="nav-show-searchbar" v-if="showInput">
        <comp-autocomplete class="el-autocomplete" @search="handleSearch"></comp-autocomplete>
        <b-button variant="transparent" @click="hideInput"><b-icon-x-circle></b-icon-x-circle></b-button>
      </b-navbar-nav>
      <b-navbar-nav class="nav-hide-searchbar" v-else>
        <b-navbar-brand to="/"><b-icon-arrow-left font-scale="1.5"></b-icon-arrow-left></b-navbar-brand>
        <b-navbar-nav class="ml-auto">
          <b-button variant="transparent" @click="displayInput"><b-icon-search></b-icon-search></b-button>
          <b-button-group>
            <b-button
              class="disable-dbl-tap-zoom"
              variant="outline-dark"
              size="sm"
              @click="decreaseFontSize"
              :disabled="disableDecFontSize"
              ><b-icon-dash></b-icon-dash
            ></b-button>
            <b-button class="disable-dbl-tap-zoom" variant="outline-dark" size="sm" @click="increaseFontSize"
              ><b-icon-plus></b-icon-plus
            ></b-button>
          </b-button-group>
        </b-navbar-nav>
      </b-navbar-nav>
    </b-navbar>

    <div class="view-bible-area mt-3" v-if="existBible">
      <ul class="ul-bible">
        <li v-for="item in bibles" :key="'bible_' + item.id">
          <div class="bible-metadata">
            {{ makeMetadataText(item) }}
          </div>
          <div :style="{ fontSize: fontSize + 'px' }" class="bible-content shadow-sm rounded p-3">
            <text-highlight :queries="tokenSet" v-if="queries.type === 'keyword'">{{ item.content }}</text-highlight>
            <span v-else>{{ item.content }}</span>
          </div>
        </li>
      </ul>
      <div class="text-center">
        <b-button class="btn-more mt-5 px-5" variant="primary" @click="getBibleNextPage()">더보기</b-button>
      </div>
    </div>
    <div class="state-message" v-else>{{ message }}</div>
  </section>
</template>

<script>
import { BIconArrowLeft, BIconPlus, BIconDash, BIconSearch, BIconXCircle } from 'bootstrap-vue';
import CompAutocomplete from '~/components/CompAutocomplete';
import SearchHistory from '~/utils/search-history';

export default {
  components: {
    BIconArrowLeft,
    BIconPlus,
    BIconDash,
    BIconSearch,
    BIconXCircle,
    CompAutocomplete
  },
  asyncData({ query, store }) {
    const books = store.getters.books;
    const queries = query;

    return {
      books: books,
      queries: queries
    };
  },
  data() {
    return {
      bibles: [],
      message: '검색 중입니다...',
      fontSize: 16,
      showInput: false
    };
  },
  computed: {
    existBible() {
      if (this.bibles.length > 0) return true;
      return false;
    },
    disableDecFontSize() {
      if (this.fontSize > 16) return false;
      return true;
    },
    tokenSet() {
      let tokenSet = [];
      if (this.queries.type !== 'keyword') return tokenSet;

      const keyword = decodeURIComponent(this.queries.keyword);

      const keywordTokens = keyword.split(' ');

      tokenSet.push(keyword);
      tokenSet = tokenSet.concat(keywordTokens);

      keywordTokens
        .filter(token => token.length >= 2)
        .forEach(token => {
          for (let i = 1; i <= token.length - 1; i++) {
            const newToken = token.substring(0, i) + ' ' + token.substring(i);
            tokenSet.push(newToken);
          }
        });
      return tokenSet;
    }
  },
  mounted() {
    this.getBible(this.queries);
  },
  methods: {
    async getBible(queries) {
      try {
        let bible;
        if (queries.type === 'keyword') {
          bible = await this.getBibleByKeyword(queries);
        } else bible = await this.getBibleByMeta(queries);

        if (bible.length == 0) this.message = '검색 결과가 없습니다.';
        else {
          this.bibles = this.bibles.concat(bible);
          //검색에 성공한 경우 검색히스토리 저장
          const searchParams = this.$store.getters.searchParams;
          SearchHistory.saveSearchHistory(searchParams);
        }
        return bible;
      } catch (err) {
        this.message = '검색 과정에서 오류가 발생했습니다.';
      }
    },
    async getBibleByMeta({ type, book, chapter, verse, page }) {
      return await this.$axios.get(`/api/bible/book/${book}/chapter/${chapter}/verse/${verse}`, {
        params: {
          page: page
        }
      });
    },
    async getBibleByKeyword({ type, keyword, book, page }) {
      return await this.$axios.get('/api/bible', {
        params: {
          keyword: keyword,
          book: book,
          page: page
        }
      });
    },
    async getBibleNextPage() {
      this.queries.page = this.queries.page + 1;
      const result = await this.getBible(this.queries);
      if (result.length === 0) alert('마지막 페이지 입니다');
    },
    async handleSearch(searchParams) {
      this.hideInput();
      this.bibles.splice(0); //clear prev list
      this.$store.commit('setSearchParams', searchParams);
      this.queries = this.$store.getters.query;
      if (!this.queries) alert('입력이 올바르지 않습니다.');
      await this.getBible(this.queries);
      this.$router.push({ path: '/bible/viewer', query: this.queries });
    },
    makeMetadataText(item) {
      return `${this.books[item.book - 1].name} ${item.chapter}${item.book === 19 ? '편' : '장'} ${item.verse}절`;
    },
    decreaseFontSize() {
      if (this.fontSize > 16) this.fontSize--;
    },
    increaseFontSize() {
      this.fontSize++;
    },
    displayInput() {
      this.showInput = true;
    },
    hideInput() {
      this.showInput = false;
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

.nav-hide-searchbar {
  width: 100%;
}

.nav-show-searchbar {
  width: 100%;
  max-width: 500px;
  margin-left: auto;
}

.el-autocomplete {
  width: 100%;
}
</style>
