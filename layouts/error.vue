<template>
  <div class="container">
    <b-row align-v="center" class="text-center min-vh-100">
      <b-col cols="12">
        <h1 class="title">오류가 발생했습니다 :(</h1>
        <p>사용에 불편을 드려 죄송합니다.</p>
        <b-button variant="link" href="/">메인으로</b-button>
      </b-col>
      <b-col cols="12"> </b-col>
    </b-row>
  </div>
</template>

<script>
import CompFooter from "~/components/CompFooter";
export default {
  components: { CompFooter },
  props: ["error"]
};
</script>

<style scoped>
.title {
  font-size: 1.3rem;
}
</style>
