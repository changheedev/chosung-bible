<template>
  <b-form-checkbox
    :id="'bible-checkbox-' + bible.id"
    :name="'bible-checkbox-' + bible.id"
    class="bible-checkbox-content"
    @change="updateSelected"
  >
    <default-content :books="books" :bible="bible" :fontSize="fontSize" :tokenSet="tokenSet"></default-content>
  </b-form-checkbox>
</template>

<script>
import DefaultContent from './DefaultContent';
export default {
  props: ['books', 'bible', 'fontSize', 'tokenSet'],
  components: { DefaultContent },
  methods: {
    updateSelected(value) {
      this.$emit('change', value);
    }
  }
};
</script>

<style lang="scss">
.bible-checkbox-content {
  label {
    display: block !important;
  }
}
</style>
