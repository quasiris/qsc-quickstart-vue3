<template>
  <v-container>
    <v-row>
      <v-col cols="12">
        <div class="pt-5">
          <v-btn color="primary" size="small" class="back-button" @click="NavigateTo()" icon="mdi-arrow-left"></v-btn>
          <vue-markdown-preview class="markdown-wrapper" :source="markdownText" />
        </div>
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
        data = data.replace(/---(.*?)---/gs, ''); 
        this.markdownText = data; 
      } catch (error) {
        this.showGlobalSheet();
      }
    },
    NavigateTo(){
      const basePath = `/${this.$route.params.config || ''}`;
      if (this.$route.path.startsWith(basePath)) {
          this.$router.replace(basePath); 
      } else {
          this.$router.push('/');
      }
    }
  }
};
</script>

<style lang="scss">
@import '~@uivjs/vue-markdown-preview/markdown.css';
.markdown-body {
  margin: 0 0  0 9px;
}
.markdown-wrapper {
  min-height: 85vh !important;
  max-width: 100% !important;
  padding-top: 5%;
}
</style>
<style scoped>
.back-button {
  position: absolute;
  top: 110px;
  right: 80px;
  color: white;
}
.back-button:hover {
  background-color: #005F99;
}
</style>