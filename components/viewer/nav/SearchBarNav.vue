<template>
  <b-navbar-nav class="nav-searchbar">
    <comp-autocomplete class="el-autocomplete" @search="handleSearch"></comp-autocomplete>
    <b-button variant="transparent" @click="changeNavbar"><b-icon-x-circle></b-icon-x-circle></b-button>
  </b-navbar-nav>
</template>

<script>
import { BIconXCircle } from 'bootstrap-vue';
import CompAutocomplete from '~/components/CompAutocomplete';

export default {
  components: {
    BIconXCircle,
    CompAutocomplete
  },
  methods: {
    changeNavbar() {
      this.$emit('changeNavType', 'default');
    },
    handleSearch(searchParams) {
      this.$emit('search', searchParams);
    }
  }
};
</script>

<style lang="scss" scoped>
.nav-searchbar {
  width: 100%;
  max-width: 500px;
  margin-left: auto;
}
.el-autocomplete {
  width: 100%;
}
</style>
