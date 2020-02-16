<template>
  <section class="container">
    <b-row align-v="center">
      <b-col cols="12">
        <h1 class="title">초성 성경</h1>
        <p class="subtitle mb-5">초성과 숫자로 간편하게 성경을 검색해보세요</p>
        <autocomplete
          class="el-autocomplete"
          :search="search"
          :get-result-value="getResultValue"
          :autoSelect="true"
          placeholder="ㅊㅅㄱ123, ctr123"
          aria-label="Search bible"
          @submit="handleAutocompleteSubmit"
        >
        </autocomplete>

        <div class="notice-area">
          <h2>안내사항</h2>
          <ul>
            <li>
              모바일에서는 홈화면에 추가 기능을 통해 더욱 편리하게 사용할 수
              있습니다.
            </li>
            <li>
              사용 중 불편한 점 또는 원하는 기능이 있다면 자유롭게 보내주세요
              :)<br />
              <b-button
                class="mt-2"
                variant="primary"
                size="sm"
                v-b-modal.modal-review
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
                  소중한 의견을 보내주시면 다음 업데이트에 반영하도록 하겠습니다
                  :)
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
            </li>
          </ul>
        </div>
      </b-col>
      <b-col cols="12" class="dummy"></b-col>
    </b-row>
  </section>
</template>

<script>
const TrieSearch = require("trie-search");
import Autocomplete from "@trevoreyre/autocomplete-vue";

export default {
  components: {
    Autocomplete
  },
  data() {
    return {
      trie: null,
      metadata: null,
      review: ""
    };
  },
  mounted() {
    try {
      this.loadMetadata();
      this.createTrie();
    } catch (err) {
      throw new Error("초기 데이터를 로드하는데 실패했습니다.");
    }
  },
  methods: {
    loadMetadata() {
      this.metadata = this.$store.getters.metadata;
    },
    createTrie() {
      const chosungMap = this.$store.getters.chosung;
      this.trie = new TrieSearch("irrelevantForMapMethod");
      chosungMap.forEach((value, key, mapObject) => this.trie.map(key, value));
    },
    /* 입력의 초성과 숫자(장,절) 정보를 분리 */
    parseInput(input) {
      const suffixNum = input.match(/\d+$/g);

      let chosung = [];
      let num = [];

      //input의 suffix가 숫자인 경우 2가지 경우의 결과를 합쳐서 반환
      if (suffixNum) {
        //case1: suffix의 첫 숫자를 초성으로 사용 => 요한1서, 요한2서... 등의 처리를 위함
        num.push(suffixNum[0].substring(1));
        chosung.push(
          input.substring(0, input.length - suffixNum[0].substring(1).length)
        );
        //case2: suffix 숫자를 모두 장,절 정보로 사용
        num.push(suffixNum[0]);
        chosung.push(input.substring(0, input.length - suffixNum[0].length));
      }
      //case3: input의 suffix가 숫자가 아닌 경우
      else {
        chosung.push(input);
        num.push(null);
      }
      return {
        chosung: chosung,
        num: num
      };
    },
    parseNum(num) {
      //숫자가 입력되지 않은 경우
      if (!num) return [[1, 1]];

      let numstr = num.toString();
      const result = [];
      //chapter는 최대 3자리 이므로 최대 길이를 3으로 제한한다
      const maxLen = numstr.length < 3 ? numstr.length : 3;

      for (let lenOfChapter = 1; lenOfChapter <= maxLen; lenOfChapter++) {
        let chapter = numstr.substring(0, lenOfChapter);
        // 길이가 3이하인 numstr을 모두 chapter로 자르면 verse가 없게 되므로 1로 설정해준다
        let verse = numstr.substring(lenOfChapter)
          ? numstr.substring(lenOfChapter)
          : "1";
        result.push([Number(chapter), Number(verse)]);
      }

      return result;
    },
    makeAutoCompleteList(chosung, num) {
      let result = [];
      const parsedNum = this.parseNum(num);

      this.trie.get(chosung).forEach(book => {
        parsedNum.forEach(([chapter, verse]) => {
          const _metadata = this.metadata[book.id - 1];
          // book(item.id) 의 최대 chapter, 최대 verse 를 벗어나지 않는 경우에만 리스트에 넣는다
          // 0인 경우 처리 추가
          if (
            chapter > 0 &&
            chapter <= _metadata.maxChapter &&
            verse > 0 &&
            verse <= _metadata.maxVerses[chapter - 1].maxVerse
          ) {
            result.push({
              text: `${book.name} ${chapter}${
                book.id === 19 ? "편" : "장"
              } ${verse}절`,
              book: book.id,
              chapter: chapter,
              verse: verse
            });
          }
        });
      });
      return result;
    },
    search(input) {
      return new Promise(resolve => {
        if (input.length < 1) {
          resolve([]);
        }

        const parsedInput = this.parseInput(input);
        const parsedChosung = parsedInput.chosung;
        const parsedNum = parsedInput.num;

        let result = [];

        for (let i = 0; i < parsedChosung.length; i++) {
          result = result.concat(
            this.makeAutoCompleteList(parsedChosung[i], parsedNum[i])
          );
        }

        resolve(result);
      });
    },

    getResultValue(result) {
      return result.text;
    },
    handleAutocompleteSubmit(result) {
      if (!result) return;
      this.$router.push(
        `/search?book=${result.book}&chapter=${result.chapter}&verse=${result.verse}`
      );
    },
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
.container {
  padding: 0 20px;
  width: 100%;
  max-width: 700px;
}
.container .row {
  min-height: calc(100vh - 59px);
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
  color: #555;
  position: absolute;
  content: "DB - 개역한글성경";
}

.area-review {
  max-width: 500px;
  margin: 0 auto;
  padding: 20px 0;
  text-align: right;
  color: #555;
  font-size: 0.9rem;
}

.notice-area {
  max-width: 500px;
  margin: 50px auto;
  padding: 10px 5px;
}
.notice-area h2 {
  font-size: 1rem;
}
.notice-area ul {
  padding: 0;
  padding-left: 16px;
}
.notice-area li {
  font-size: 0.8rem;
  color: #999;
}
.notice-area li + li {
  margin-top: 10px;
}
</style>
