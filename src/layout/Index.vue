<template>
    <v-app>
      <v-main class="d-flex flex-column" >
        <AppBar @onSearch="performSearch1" :searchQuery="searchQuery" />
        <PageContent :searchQuery="searchQuery" @onSearch="performSearch1"/>
        <Footer />
      </v-main>
    </v-app>
</template>
  
<script>
  import AppBar from "@/components/AppBar.vue";
  import Footer from "@/components/Footer.vue";
  import PageContent from "./PageContent.vue";
  
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
      };
    },
    methods: {
      performSearch1(keyword) {
        this.searchQuery = keyword;
      }
    }
  };
</script>
