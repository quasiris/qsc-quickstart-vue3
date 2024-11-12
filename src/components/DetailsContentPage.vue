<template>
  <div class="pt-5">
    <v-btn color="primary" class="back-button" @click="NavigateTo()" icon="mdi-arrow-left"></v-btn>
    <vue-markdown-preview class="markdownText" :source="markdownText" />
    </div>
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
        const data = await response.text();
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

<style>
.markdownText{
  padding: 3%;
  margin: 20px;
  .vue-markdown {
    font-family: 'Arial', sans-serif; 
    line-height: 1.6;
  }

  table {
    width: 100%;
    border-collapse: collapse;
  }

  table, th, td {
    border: 1px solid #ddd;
  }

  th, td {
    padding: 8px;
    text-align: left;
  }
  h1, h2, h3, h4, h5, h6 {
    margin-top: 1.25em;
    margin-bottom: 0.3em;
  }
  p,hr {
    margin: 8px;
  }
  ul, ol {
    padding-left: 1.5em; 
    margin-bottom: 1em;  
  }
  ul {
    list-style-type: disc; 
  }
  ol {
    list-style-type: decimal; 
  }
  ul ul, ol ol {
    margin-left: 1em; 
    list-style-type: circle; 
  }
  li {
    margin-bottom: 0.5em; 
  }
  li::marker {
    color: #007ACC; 
  }
  li p {
    margin: 0; 
  }
  pre {
    background-color: #f4f4f4;
    padding: 14px;
    border-radius: 4px;
    margin: 15px;
  }
  
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