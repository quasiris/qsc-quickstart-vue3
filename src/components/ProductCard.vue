<template>
    <div v-if="templateExists" v-html="renderTemplate()"></div>
    <v-card v-else
      :style="{ height: cardHeight }"
      :class="{ 'list-view': viewMode === 'list' }"
    >
      <a
        v-bind:href="product.document[config.document.url]"
      >
        <div class="image">
          <img
            class="rounded-t-lg"
            v-if="product.document && product.document[config.document.image]"
            :src="product.document[config.document.image].replace(/^.*?format=auto\//, '')"
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
  import { replacePlaceholders } from '@/utils';
  export default {
    name: "ProductCard",
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
    methods: {
        // Replace placeholders in the template with actual product data
        renderTemplate() {
            const d = this.product.document;
            // Prepare the replacements object from product.document
            const replacements = {
                ...d,  
            };
            let template = replacePlaceholders(this.config.document.template, replacements);
            return template;
        }
    },
  };
  </script>
  
  