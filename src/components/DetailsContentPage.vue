<template>
  <v-container>
    <v-row>
      <v-col cols="12">
          <vue-markdown-preview class="markdown-wrapper" :source="markdownText" />
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import {mapActions} from 'vuex';
import VueMarkdownPreview from '@uivjs/vue-markdown-preview';
export default {
  name: "DetailsContentPage",
  components: {
    VueMarkdownPreview,
  },
  props: {
    config: Object,
    pathMatch: Array 
  },
  computed: {
    pathSegments() {
      return this.pathMatch ? this.pathMatch.join('/') : [];
    }
  },
  data() {
    return {
      markdownText: "", 
    };
  },
  async created() {
    if(this.config.detailsUrl && this.pathSegments){
      let link = this.config.detailsUrl + this.pathSegments
      await this.fetchDetails(link)
    }else{
      const basePath = `/${this.$route.params.config || ''}`;
      if (this.$route.path.startsWith(basePath)) {
          this.$router.replace(basePath); 
      } else {
          this.$router.push('/');
      }
    }
  },
  methods:{
    ...mapActions(['showGlobalSheet']),
    async fetchDetails(url) {
      try {
        const response = await fetch(url);
        let data = await response.text();
        data = data.replace(/---(.*?)---/s, ''); 
        this.markdownText = data; 
      } catch (error) {
        this.showGlobalSheet();
      }
    },
  }
};
</script>

<style lang="scss">
@import '~@uivjs/vue-markdown-preview/markdown.css';
.markdown-wrapper {
  min-height: 85vh !important;
  max-width: 100% !important;
  padding-top: 82px;
}
</style>
<style scoped>

</style>