<template>
  <v-app>
    <v-main class="d-flex flex-column">
      <AppBar @onSearch="performSearch1" @onFilter="handleNavFilters" />
      
      <router-view @onFilter="clearFilters" :bottomFilter="Filters" :filter="navFilter" :config="config" :triggerSearch="triggerSearch" />
      
      <BottomSheet @onFilter="clearFilters" />
      <Footer />
    </v-main>
  </v-app>
</template>

<script>
import AppBar from "@/components/AppBar.vue";
import Footer from "@/components/Footer.vue";
import BottomSheet from "@/components/BottomSheet.vue";
import config from "@/../config.json";
import { mapState, mapActions } from 'vuex';

export default {
  name: "qsc-index",
  components: {
    AppBar,
    Footer,
    BottomSheet
  },
  data() {
    return {
      config: config[0],
      navFilter: {},
      Filters: false,
      triggerSearch: false,
    };
  },
  computed: {
    ...mapState(['searchQuery'])
  },
  created() {
    const url = new URL(window.location.href);
    const path = url.pathname;
    const searchQuery = url.searchParams.get('q');
      console.log("configs :", config);
      console.log("path :", path);

    for (const configItem of config) {
      if (path.includes(configItem.id)) {
        this.config = configItem;
        console.log("Config :", configItem.id);
        break;
      }
    }
    if(searchQuery && searchQuery != this.searchQuery)
      this.setSearchQuery(searchQuery);
  },
  methods: {
    ...mapActions(['setSearchQuery']),
    performSearch1() {
      this.triggerSearch = !this.triggerSearch;
    },
    clearFilters() {
      this.Filters = !this.Filters;
    },
    handleNavFilters(filter) {
      if(filter) {
        this.setSearchQuery("");
        this.navFilter = filter;
        this.navFilter = { ...this.navFilter };
      }
    }
  }
};
</script>