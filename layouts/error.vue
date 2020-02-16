<template>
  <div class="container">
    <b-row align-v="center" class="text-center min-vh-100">
      <b-col cols="12">
        <h1 class="title">오류가 발생했습니다 :(</h1>
        <p>사용에 불편을 드려 죄송합니다.</p>
        <p>
          오류가 발생한 상황에 대해 간략하게라도 알려주시면 <br />참고하여 빠른
          시일내에 수정하도록 하겠습니다.
        </p>
        <b-button variant="link" href="/">메인으로</b-button>
        <b-button class="btn-modal-review" variant="link" v-b-modal.modal-review
          >오류알리기</b-button
        >
        <b-modal
          id="modal-review"
          title="오류알리기"
          ok-title="전송"
          cancel-title="취소"
          @ok="handleOk"
          @show="resetModal"
          @hidden="resetModal"
        >
          <p>
            오류에 대해 알려주시면 빠르게 수정하도록 하겠습니다
          </p>

          <form ref="form" @submit.prevent="handleReviewSubmit">
            <b-form-textarea
              id="textarea-review"
              v-model="review"
              rows="3"
              max-rows="6"
            ></b-form-textarea>
          </form>
        </b-modal>
      </b-col>
      <b-col cols="12"> </b-col>
    </b-row>
  </div>
</template>

<script>
export default {
  props: ["error"],
  data() {
    return {
      review: ""
    };
  },
  methods: {
    resetModal() {
      this.review = "";
    },
    handleOk(bvModalEvt) {
      if (!this.review) {
        alert("내용이 입력되지 않았습니다");
        //prevent close
        bvModalEvt.preventDefault();
        return;
      }
      // Trigger submit handler
      this.handleReviewSubmit();
    },
    handleReviewSubmit() {
      this.$axios
        .post("/api/reviews", { content: this.review })
        .then(res => {
          alert("소중한 의견 감사드립니다 :)");
        })
        .catch(err => {
          alert("오류가 발생했습니다");
        });
    }
  }
};
</script>

<style scoped>
.title {
  font-size: 1.3rem;
}
</style>
