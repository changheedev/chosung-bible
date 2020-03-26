<template>
  <b-navbar-nav class="nav-default">
    <b-navbar-brand to="/"><b-icon-arrow-left font-scale="1.5"></b-icon-arrow-left></b-navbar-brand>
    <b-navbar-nav class="ml-auto">
      <b-button class="btn-search" variant="transparent" @click="changeNavbar"
        ><b-icon-search></b-icon-search
      ></b-button>
    </b-navbar-nav>
  </b-navbar-nav>
</template>

<script>
import { BIconArrowLeft, BIconSearch } from 'bootstrap-vue';
export default {
  components: {
    BIconArrowLeft,

    BIconSearch
  },
  methods: {
    changeNavbar() {
      this.$emit('changeNavType', 'search');
    }
  }
};
</script>

<style lang="scss" scoped>
.nav-default {
  width: 100%;
}
</style>
