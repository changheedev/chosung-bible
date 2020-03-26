<template>
  <section class="container min-vh-100">
    <b-navbar fixed="top" variant="light" type="light" class="navbar-bible-viewer shadow-sm">
      <default-nav @changeNavType="changeNavType" v-if="navType === 'default'"></default-nav>
      <search-bar-nav
        @changeNavType="changeNavType"
        @search="handleSearch"
        v-if="navType === 'search'"
      ></search-bar-nav>
    </b-navbar>

    <div class="view-bible-area mt-3" v-if="existBible">
      <div class="btn-font-resize">
        <b-form-spinbutton id="sb-vertical" v-model="fontSize" min="16" vertical></b-form-spinbutton>
      </div>
      <ul class="ul-bible">
        <li v-for="item in bibles" :key="'bible_' + item.id">
          <div class="bible-metadata">
            {{ makeMetadataText(item) }}
          </div>

          <div class="bible-content-wrapper shadow-sm rounded p-3">
            <div :style="{ fontSize: fontSize + 'px' }" class="bible-content ">
              <text-highlight :queries="tokenSet" v-if="queries.type === 'keyword'">{{ item.content }}</text-highlight>
              <span v-else>{{ item.content }}</span>
            </div>
          </div>
        </li>
      </ul>
      <div class="text-center">
        <b-button class="btn-more mt-5 px-5" variant="primary" @click="getBibleNextPage">더보기</b-button>
      </div>
    </div>
    <div class="state-message" v-else>{{ message }}</div>
  </section>
</template>

<script>
import DefaultNav from '~/components/BibleViewerDefaultNav';
import SearchBarNav from '~/components/BibleViewerSearchBarNav';
import SearchHistory from '~/utils/search-history';

export default {
  components: {
    DefaultNav,
    SearchBarNav
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
      showInput: false,
      navType: 'default',
      selected: new Set()
    };
  },
  computed: {
    existBible() {
      if (this.bibles.length > 0) return true;
      return false;
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
      this.navType = 'default';
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
    changeNavType(type) {
      this.navType = type;
    }
  }
};
</script>

<style lang="scss" scoped>
.container {
  padding: 76px 15px 50px;
  width: 100%;
  max-width: 700px;
  min-height: 100vh;
}

.view-bible-area {
  position: relative;

  .btn-font-resize {
    position: fixed;
    bottom: 50px;
    right: calc((100% - 730px) / 2 - 70px);

    @media (max-width: 850px) {
      right: 15px;
    }
  }

  .ul-bible {
    list-style: none;
    margin: 0;
    padding: 0;

    li + li {
      margin-top: 25px;
    }

    .bible-metadata {
      font-size: 0.8rem;
      margin-left: 3px;
      color: #999;
    }

    .bible-content {
      line-height: 1.8rem;
    }
  }
}
</style>
