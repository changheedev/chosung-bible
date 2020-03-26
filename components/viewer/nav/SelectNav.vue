<template>
  <b-navbar-nav class="nav-select-menu">
    <b-button variant="trasnparent" @click="cancel"><b-icon-x></b-icon-x></b-button>
    <b-button variant="trasnparent" @click="copy" class="btn-copy-clipboard"
      ><b-icon-clipboard></b-icon-clipboard
      ><b-badge class="badge-count-selected" pill variant="primary" v-if="hasSelected">{{
        selected
      }}</b-badge></b-button
    >
  </b-navbar-nav>
</template>

<script>
import { BIconX, BIconClipboard } from 'bootstrap-vue';
export default {
  props: {
    selected: {
      type: Number
    }
  },
  components: { BIconX, BIconClipboard },
  computed: {
    hasSelected() {
      return this.selected > 0;
    }
  },
  methods: {
    cancel() {
      this.$emit('cancel', null);
    },
    copy() {
      if (this.selected === 0) return;
      this.$emit('copy', null);
    }
  }
};
</script>

<style lang="scss" scoped>
.nav-select-menu {
  margin-left: auto;
}

.btn-copy-clipboard {
  position: relative;

  .badge-count-selected {
    position: absolute;
    top: 2px;
    right: -2px;
  }
}
</style>
