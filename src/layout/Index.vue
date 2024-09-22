<template>
    <v-app>
      <v-main class="d-flex flex-column" >
        <AppBar @onSearch="performSearch1" :searchQuery="searchQuery" />
        <PageContent :config="config" :searchQuery="searchQuery" @onSearch="performSearch1"/>
        <Footer />
      </v-main>
    </v-app>
</template>
  
<script>
  import AppBar from "@/components/AppBar.vue";
  import Footer from "@/components/Footer.vue";
  import PageContent from "./PageContent.vue";
  import config from "@/../config.json";

  export default {
    name: "qsc-index",
    components: {
      AppBar,
      PageContent,
      Footer
    },
    data() {
      return {
        searchQuery: "",
        config: config[0],
      };
    },
    mounted() {
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
      this.searchQuery = searchQuery;      
  },
    methods: {
      performSearch1(keyword) {
        if(keyword && keyword != this.searchQuery){
          const url = new URL(window.location.href);
          url.searchParams.set('q', keyword); 
          window.history.pushState({}, '', url);
        }
        this.searchQuery = keyword;
      }
    }
  };
</script>
