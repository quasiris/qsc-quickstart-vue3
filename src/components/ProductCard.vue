<template>
    <div v-if="templateExists" class="dynamic-card v-card" :class="{ 'is-list': viewMode === 'list' }">
      <DynamicTemplate
        :product="product.origin || {}"
        :document="product.document || {}"
        :template="HtmlTemplate"
      />
    </div>
    <div v-else class="dynamic-card v-card product" :class="{ 'is-list': viewMode === 'list' }"
      :data-product-id="product.id">
      <a
        class="qs-card"
        :href="product.document.url"
        :data-track-id="'product'"
        :data-product-id="product.id"
      >
        <div class="qs-card__media">
          <img
            v-if="product.document && config.document.image && product.document.image"
            :src="product.document.image.replace(/^.*?format=auto\//, '')"
            :alt="product.document.name"
            loading="lazy"
            @error="onImageError"
          />
          <img v-else src="/brand/no-image-icon.png" alt="" />
        </div>
        <div class="qs-card__body">
          <div class="qs-card__title">{{ product.document.name }}</div>
        </div>
      </a>
    </div>
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
      viewMode: {
        type: String,
        required: true
      }
    },
    computed: {
        templateExists() {
        return Boolean(
          this.config?.document?.template || this.config?.template
        );
        }
    },
    async mounted() {
        if(this.templateExists)
            this.HtmlTemplate = await this.convertJsonToHtml();
    },
    methods: {
      async  convertJsonToHtml() {
        let template = this.config.document?.template || this.config.template
        // Convert escaped newlines to actual newlines
        return template.replace(/\\n/g, '\n');
      },
      onImageError(event) {
        event.target.src = '/brand/no-image-icon.png'; 
      }
    },
  };
  </script>
  
<style scoped>
.dynamic-card {
  height: 100%;
  max-width: 100%;
  min-width: 0;
  overflow: visible;
  overflow-wrap: anywhere;
  background: transparent;
}
.dynamic-card :deep(*) {
  min-width: 0;
}
.dynamic-card :deep(img) {
  max-width: 100%;
}
</style>

<style>
/*
 * qs-card: reusable building blocks for config templates (document.template).
 * Grid layout by default; the wrapper gets .is-list in list view.
 */
.qs-card {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: rgb(var(--v-theme-surface));
  border: 1px solid rgba(var(--v-theme-on-surface), 0.08);
  border-radius: 14px;
  overflow: hidden;
  color: inherit;
  text-decoration: none;
  transition: box-shadow 0.2s ease, transform 0.2s ease, border-color 0.2s ease;
}
.qs-card:hover {
  border-color: rgba(var(--v-theme-primary), 0.35);
  box-shadow: 0 12px 28px -12px rgba(16, 24, 40, 0.22);
  transform: translateY(-2px);
}
.qs-card:focus-visible {
  outline: 2px solid rgb(var(--v-theme-primary));
  outline-offset: 2px;
}
.qs-card__media {
  position: relative;
  aspect-ratio: 4 / 3;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 8px 8px 0;
  padding: 18px;
  border-radius: 10px;
  background: #f4f5f7;
  overflow: hidden;
}
.qs-card__media img {
  position: absolute;
  inset: 18px;
  width: calc(100% - 36px);
  height: calc(100% - 36px);
  object-fit: contain;
  /* white product backgrounds blend into the tile */
  mix-blend-mode: multiply;
  transition: transform 0.3s ease;
}
/* placeholder for missing images: small and quiet */
.qs-card__media img[src$="no-image-icon.png"] {
  inset: 30%;
  width: 40%;
  height: 40%;
  opacity: 0.3;
}
.qs-card:hover .qs-card__media img {
  transform: scale(1.04);
}
.qs-card__body {
  display: flex;
  flex-direction: column;
  gap: 6px;
  flex: 1 1 auto;
  padding: 12px 14px 14px;
}
.qs-card__brand {
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: rgb(var(--v-theme-primary));
}
.qs-card__title {
  font-size: 14px;
  font-weight: 600;
  line-height: 1.4;
  color: rgb(var(--v-theme-on-surface));
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
  hyphens: auto;
}
.qs-card__meta {
  font-size: 11px;
  color: rgba(var(--v-theme-on-surface), 0.55);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.qs-card__tags {
  margin-top: auto;
  padding-top: 4px;
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}
.qs-card__tags:empty {
  display: none;
}
.qs-card__tag {
  padding: 2px 8px;
  border-radius: 6px;
  background: rgba(var(--v-theme-on-surface), 0.05);
  font-size: 11px;
  font-weight: 500;
  line-height: 1.5;
  color: rgba(var(--v-theme-on-surface), 0.7);
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.qs-card__desc {
  display: none;
  margin: 0;
  font-size: 13px;
  line-height: 1.5;
  color: rgba(var(--v-theme-on-surface), 0.7);
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.qs-card__footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding-top: 6px;
  font-size: 12px;
  color: rgba(var(--v-theme-on-surface), 0.55);
}
.qs-card__cta {
  font-weight: 600;
  color: rgb(var(--v-theme-primary));
  white-space: nowrap;
  opacity: 0;
  transform: translateX(-4px);
  transition: opacity 0.2s ease, transform 0.2s ease;
}
.qs-card:hover .qs-card__cta,
.qs-card:focus-visible .qs-card__cta {
  opacity: 1;
  transform: none;
}

/* list view */
.is-list .qs-card {
  flex-direction: row;
}
.is-list .qs-card__media {
  flex: 0 0 200px;
  aspect-ratio: 1 / 1;
  align-self: flex-start;
}
.is-list .qs-card__media {
  margin: 8px 0 8px 8px;
}
.is-list .qs-card__body {
  padding: 16px 22px;
}
.is-list .qs-card__title {
  font-size: 16px;
  -webkit-line-clamp: 2;
}
.is-list .qs-card__desc {
  display: -webkit-box;
}
.is-list .qs-card__cta {
  opacity: 1;
  transform: none;
}
@media (max-width: 600px) {
  .is-list .qs-card__media {
    flex-basis: 120px;
  }
  .is-list .qs-card__desc {
    display: none;
  }
}
@media (hover: none) {
  .qs-card__cta {
    opacity: 1;
    transform: none;
  }
}
</style>
