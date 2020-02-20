<template>
  <footer class="footer">
    <div class="review-wrapper">
      문의 :
      <b-button
        href="mailto:changhee.dev@gmail.com"
        variant="tranparent"
        size="sm"
        >이메일</b-button
      >
      /
      <b-button variant="tranparent" size="sm" v-b-modal.modal-review
        >의견보내기</b-button
      >
      <b-modal
        id="modal-review"
        title="의견보내기"
        ok-title="전송"
        cancel-title="취소"
        @ok="handleOk"
        @show="resetModal"
        @hidden="resetModal"
      >
        <p>
          소중한 의견을 보내주시면 다음 업데이트에 반영하도록 하겠습니다 :)
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
    </div>

    Copyright 2020. Changhee All rights reserved.
  </footer>
</template>

<script>
export default {
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

<style lang="scss" scoped>
.footer {
  padding: 20px;
  text-align: center;
  font-size: 0.7rem;
  color: #555;
}

.review-wrapper {
  font-size: 0.8rem;
  a,
  button {
    font-size: 0.8rem;
  }
}
</style>
