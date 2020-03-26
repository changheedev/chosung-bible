<template>
  <b-navbar-nav class="nav-select-menu">
    <b-button variant="trasnparent" @click="changeNavType('default')"><b-icon-x></b-icon-x></b-button>
    <b-button variant="trasnparent" @click="copy"><b-icon-clipboard></b-icon-clipboard></b-button>
  </b-navbar-nav>
</template>

<script>
import { BIconX, BIconClipboard } from 'bootstrap-vue';
export default {
  components: { BIconX, BIconClipboard },
  methods: {
    changeNavType(type) {
      this.$emit('changeNavType', type);
    },
    copy() {
      this.$emit('copy', null);
    }
  }
};
</script>

<style lang="scss" scoped>
.nav-select-menu {
  margin-left: auto;
}
</style>
