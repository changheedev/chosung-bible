<template>
  <b-navbar-nav class="nav-default">
    <b-navbar-brand to="/"><b-icon-arrow-left font-scale="1.5"></b-icon-arrow-left></b-navbar-brand>
    <b-navbar-nav class="ml-auto">
      <b-button class="btn-search" variant="transparent" @click="changeNavbar"
        ><b-icon-search></b-icon-search
      ></b-button>
      <b-button-group class="buttons-font-resize">
        <b-button
          class="disable-dbl-tap-zoom"
          variant="outline-dark"
          size="sm"
          @click="decreaseFontSize"
          :disabled="disableDecreaseFontSize"
          ><b-icon-dash></b-icon-dash
        ></b-button>
        <b-button class="disable-dbl-tap-zoom" variant="outline-dark" size="sm" @click="increaseFontSize"
          ><b-icon-plus></b-icon-plus
        ></b-button>
      </b-button-group>
    </b-navbar-nav>
  </b-navbar-nav>
</template>

<script>
import { BIconArrowLeft, BIconPlus, BIconDash, BIconSearch } from 'bootstrap-vue';
export default {
  components: {
    BIconArrowLeft,
    BIconPlus,
    BIconDash,
    BIconSearch
  },
  data() {
    return { fontSize: 16 };
  },
  computed: {
    disableDecreaseFontSize() {
      if (this.fontSize > 16) return false;
      return true;
    }
  },
  methods: {
    decreaseFontSize() {
      if (this.fontSize > 16) this.fontSize--;
      this.$emit('changeFontSize', this.fontSize);
    },
    increaseFontSize() {
      this.fontSize++;
      this.$emit('changeFontSize', this.fontSize);
    },
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

.disable-dbl-tap-zoom {
  touch-action: manipulation;
}
</style>
