<template>
  <div class="container">
    <b-row align-v="center" class="text-center min-vh-100">
      <b-col cols="12">
        <h1 class="title">Error :(</h1>
        <p>{{ error.message }}</p>
        <nuxt-link to="/">메인으로</nuxt-link>
        <div class="area-review">
          <p>
            오류에 대해 알려주시면 빠르게 수정하도록 하겠습니다 :)
          </p>

          <b-button v-b-modal.modal-review>의견남기기</b-button>

          <b-modal
            id="modal-review"
            title="의견남기기"
            ok-title="전송"
            cancel-title="취소"
            @ok="handleOk"
            @show="resetModal"
            @hidden="resetModal"
          >
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

.area-review {
  max-width: 500px;
  margin: 0 auto;
  padding: 120px 0 20px;
  text-align: center;
  color: #555;
  font-size: 0.9rem;
}
</style>
