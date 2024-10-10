<template>
    <v-app>
      <v-main class="d-flex flex-column" >
        <AppBar @onSearch="performSearch1" @onFilter="handleNavFilters"  />
        <PageContent :filter="navFilter" :config="config" :triggerSearch="triggerSearch"/>
        <BottomSheet @onSearch="performSearch1" />
        <Footer />
      </v-main>
    </v-app>
</template>
  
<script>
  import AppBar from "@/components/AppBar.vue";
  import Footer from "@/components/Footer.vue";
  import BottomSheet from "@/components/BottomSheet.vue";
  import PageContent from "./PageContent.vue";
  import config from "@/../config.json";
  import { mapState, mapActions } from 'vuex';


  export default {
    name: "qsc-index",
    components: {
      AppBar,
      PageContent,
      Footer,
      BottomSheet
    },
    data() {
      return {
        config: config[0],
        navFilter: {},
        triggerSearch: false,
      };
    },
    computed: {
    ...mapState(['searchQuery'])
  },
    created() {
      const url = new URL(window.location.href);
      const path = url.pathname; // Get the path (/config)
      const searchQuery = url.searchParams.get('q');
      for (const configItem of config) {
        if (path.includes(configItem.id)) {
          this.config = configItem;
          break; // Exit the loop once a match is found
        }
      }
      if(searchQuery && searchQuery !=this.searchQuery)
        this.setSearchQuery(searchQuery);
    },
    methods: {
      ...mapActions(['setSearchQuery']),

      performSearch1() {
        this.triggerSearch = !this.triggerSearch;
      },
      handleNavFilters(filter) {
        if(filter){
          this.setSearchQuery("");
          this.navFilter=filter
          this.navFilter={...this.navFilter}
        }
      }
    }
  };
</script>
