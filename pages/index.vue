<template>
  <section class="container">
    <b-row align-v="center" class="min-vh-100">
      <b-col cols="12">
        <h1 class="title">초성 성경</h1>
        <p class="subtitle">초성과 숫자로 간편하게 성경을 검색해보세요</p>
        <comp-autocomplete class="el-autocomplete" @search="handleSearch">
        </comp-autocomplete>
      </b-col>
      <b-col cols="12" class="dummy"> </b-col>
    </b-row>
  </section>
</template>

<script>
import CompAutocomplete from "~/components/CompAutocomplete";
export default {
  components: { CompAutocomplete },
  created() {
    if (process.client) this.updatePrevVersionHistories();
  },
  methods: {
    //이전 버전의 포맷으로 저장된 히스토리들을 업데이트 된 포맷으로 변경
    updatePrevVersionHistories() {
      let histories = JSON.parse(localStorage.getItem("searchHistory"));
      if (histories) {
        histories = histories.map(history => {
          if (!history.type) {
            return {
              type: "meta",
              data: history
            };
          }
          return history;
        });
        localStorage.setItem("searchHistory", JSON.stringify(histories));
      }
    },
    handleSearch(query) {
      this.$router.push({ path: "/search", query: query });
    }
  }
};
</script>

<style scoped>
.container {
  padding: 0 20px;
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
  font-size: 0.6rem;
  top: -20px;
  right: 5px;
  color: #999;
  position: absolute;
  content: "DB - 개역한글성경";
}

@media (max-width: 420px) {
  .subtitle {
    font-size: 0.8rem;
  }
}
</style>
