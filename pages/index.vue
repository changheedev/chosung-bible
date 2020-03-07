<template>
  <section class="container">
    <b-row align-v="center" class="min-vh-100">
      <b-col cols="12">
        <h1 class="title">초성 성경</h1>
        <p class="subtitle">초성과 숫자로 간편하게 성경을 검색해보세요</p>
        <div class="autocomplete-wrapper">
          <b-alert
            class="autocomplete-alert"
            :show="dismissCountDown"
            dismissible
            variant="warning"
            @dismissed="dismissCountDown = 0"
            @dismiss-count-down="countDownChanged"
            >검색 범위를 벗어나 대체된 결과를 보여드립니다.</b-alert
          >
          <comp-autocomplete class="el-autocomplete" @alert="showAlert" @search="handleSearch"> </comp-autocomplete>
          <b-button class="btn-clear-history" variant="transparent" size="sm" @click="clearHistory"
            >검색기록 삭제</b-button
          >
        </div>
        <div class="search-description">
          <p>&lt;검색방법&gt;</p>
          <p><strong>1.초성검색</strong>: 초성과 숫자를 한줄로 입력합니다.<br />- 예시) ㅊㅅㄱ123</p>
          <p><strong>2.키워드검색</strong>: 검색할 내용을 입력합니다.</p>
          <p>
            <strong>3.특정 성경에서 키워드검색</strong>: 검색할 내용 뒤에 <strong>&gt; 성경이름</strong> 을
            입력합니다.<br />
            - 예시) 너희는 먼저 > 마태복음
          </p>
        </div>
      </b-col>
      <b-col cols="12" class="dummy"> </b-col>
    </b-row>
  </section>
</template>

<script>
import CompAutocomplete from '~/components/CompAutocomplete';
import SearchHistory from '~/utils/search-history';
export default {
  components: { CompAutocomplete },
  data() {
    return {
      dismissSecs: 3,
      dismissCountDown: 0
    };
  },
  mounted() {
    if (process.client) {
      try {
        SearchHistory.updatePrevVersionHistories();
      } catch (err) {
        SearchHistory.clearSearchHistory();
      }
    }
  },
  methods: {
    countDownChanged(dismissCountDown) {
      this.dismissCountDown = dismissCountDown;
    },
    showAlert(flag) {
      if (flag) this.dismissCountDown = this.dismissSecs;
      else this.dismissCountDown = 0;
    },
    handleSearch(searchData) {
      this.$store.commit('setSearchParams', searchData);
      const query = this.$store.getters.query;
      this.$router.push({ path: '/bible/viewer', query: query });
    },
    clearHistory() {
      SearchHistory.clearSearchHistory();
      alert('검색 기록을 삭제했습니다.');
    }
  }
};
</script>

<style scoped>
.container {
  padding: 40px 20px 0;
  width: 100%;
  max-width: 700px;
}

.title {
  margin-left: auto;
  margin-right: auto;
  margin-bottom: 15px;
  text-align: center;
  max-width: 500px;
  font-size: 2rem;
}

.subtitle {
  margin-bottom: 30px;
  text-align: center;
  color: #555;
  word-break: keep-all;
}

.autocomplete-wrapper {
  position: relative;
  max-width: 500px;
  margin: 0 auto;
}

.autocomplete-alert {
  position: absolute;
  width: 100%;
  top: -70px;
  z-index: 10;
  font-size: 0.8rem;
}

.el-autocomplete {
  position: relative;
  max-width: 500px;
  margin: 0 auto;
}

.el-autocomplete::before {
  font-size: 0.7rem;
  top: -20px;
  right: 5px;
  color: #888;
  position: absolute;
  content: 'DB - 개역한글성경';
}

.btn-clear-history {
  float: right;
  font-size: 0.8rem;
  color: #888;
}

.search-description {
  max-width: 500px;
  margin: 30px auto 0;
  padding: 15px;
  font-size: 0.9rem;
}

@media (max-width: 420px) {
  .subtitle {
    font-size: 0.8rem;
  }

  .search-description {
    font-size: 0.8rem;
  }
}
</style>
