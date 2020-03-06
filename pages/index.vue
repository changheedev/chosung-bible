<template>
  <section class="container">
    <b-row align-v="center" class="min-vh-100">
      <b-col cols="12">
        <h1 class="title">초성 성경</h1>
        <p class="subtitle">초성과 숫자로 간편하게 성경을 검색해보세요</p>
        <comp-autocomplete class="el-autocomplete" @search="handleSearch"> </comp-autocomplete>
        <div class="search-description">
          <p>&lt;검색방법&gt;</p>
          <p><strong>1.초성검색</strong>: 초성과 숫자를 한줄로 입력합니다.<br />- 예시) ㅊㅅㄱ123</p>
          <p><strong>2.키워드검색</strong>: 검색할 내용을 입력합니다.</p>
          <p>
            <strong>3.특정 성경에서 키워드 검색</strong>: 검색할 내용 뒤에 <strong>&gt; 성경이름</strong> 을
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
  created() {
    if (process.client) {
      try {
        SearchHistory.updatePrevVersionHistories();
      } catch (err) {
        SearchHistory.clearSearchHistory();
      }
    }
  },
  methods: {
    handleSearch(query) {
      this.$router.push({ path: '/search', query: query });
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
