<template>
  <div class="bible-content-wrapper">
    <div class="bible-metadata">
      {{ makeMetadataText(bible) }}
    </div>

    <div :style="{ fontSize: fontSize + 'px' }" class="bible-content shadow-sm rounded p-3">
      <text-highlight :queries="tokenSet">{{ bible.content }}</text-highlight>
    </div>
  </div>
</template>

<script>
export default {
  props: ['books', 'bible', 'fontSize', 'tokenSet'],
  methods: {
    makeMetadataText(bible) {
      return `${this.books[bible.book - 1].name} ${bible.chapter}${bible.book === 19 ? '편' : '장'} ${bible.verse}절`;
    }
  }
};
</script>

<style lang="scss" scoped>
.bible-content-wrapper {
  .bible-metadata {
    font-size: 0.8rem;
    margin-left: 3px;
    color: #999;
  }

  .bible-content {
    line-height: 1.8rem;
  }
}
</style>
