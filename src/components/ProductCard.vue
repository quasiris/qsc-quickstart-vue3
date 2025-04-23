<template>
    <DynamicTemplate
        v-if="templateExists"
        :product="product.origin || {}"
        :document="product.document || {}"
        :template="HtmlTemplate"
      />
    <v-card v-else
      :style="{ height: cardHeight }"
      :class="{ 'list-view': viewMode === 'list' }"
      :data-product-id="product.id"
      class="product"
    >
      <a
        v-bind:href="product.document.url"
         :data-track-id="'product'"
         :data-product-id="product.id"
      >
        <div class="image">
          <img
            class="rounded-t-lg"
            v-if="product.document && config.document.image"
            :src="product.document.image.replace(/^.*?format=auto\//, '')"
            style="max-width: 100%; max-height: 100%; object-fit: contain; object-position: center;"
          />
        </div>
  
        <v-card-text class="d-flex justify-content-between align-end">
          <div class="flex-grow-1 my-3">
            <h6
              class="mb-0 text-grey-darken-2 text-center"
              style="font-size: 12px;"
            >
              {{ product.document.name }}
            </h6>
          </div>
        </v-card-text>
      </a>
    </v-card>
  </template>
  
  <script>
  import DynamicTemplate from "@/components/DynamicTemplate.vue";

  export default {
    name: "ProductCard",
    components: {DynamicTemplate},

  data() {
    return {
     HtmlTemplate:'',
    };
  },
    props: {
      product: {
        type: Object,
        required: true
      },
      config: {
        type: Object,
        required: true
      },
      cardHeight: {
        type: String,
        required: true
      },
      viewMode: {
        type: String,
        required: true
      }
    },
    computed: {
        templateExists() {
        return this.config && this.config.document.template;
        }
    },
    async mounted() {
        if(this.templateExists)
            this.HtmlTemplate = await this.convertJsonToHtml();
    },
    methods: {
        async  convertJsonToHtml() {
            let template = this.config.document.template
            // Convert escaped newlines to actual newlines
            return template.replace(/\\n/g, '\n');
            },
    },
  };
  </script>
  
  