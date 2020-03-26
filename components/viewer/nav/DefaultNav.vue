<template>
  <b-navbar-nav class="nav-default">
    <b-navbar-brand to="/"><b-icon-arrow-left font-scale="1.3"></b-icon-arrow-left></b-navbar-brand>
    <b-navbar-nav class="ml-auto">
      <b-button class="btn-search" variant="transparent" @click="changeNavbar('search')"
        ><b-icon-search></b-icon-search
      ></b-button>
      <b-button class="btn-checkbox" variant="transparent" @click="changeNavbar('select')"
        ><b-icon-check-box></b-icon-check-box
      ></b-button>
    </b-navbar-nav>
  </b-navbar-nav>
</template>

<script>
import { BIconArrowLeft, BIconSearch, BIconCheckBox } from 'bootstrap-vue';
export default {
  components: {
    BIconArrowLeft,
    BIconSearch,
    BIconCheckBox
  },
  methods: {
    changeNavbar(type) {
      this.$emit('changeNavType', type);
    }
  }
};
</script>

<style lang="scss" scoped>
.nav-default {
  width: 100%;
}
.navbar-brand {
  padding-bottom: 0;
}
</style>
