<template>
    <div class="slider-chart-container">
      <div class="price-input-wrapper">
        <div class="price-input">
          <input
            id="min-price-input"
            class="price-input-field"
            type="number"
            v-model.number="MinRange"
            :placeholder="MinRange"
            @input="sanitizePrice('min')"
            @blur="validateAndSyncPrice('min')"
            @keyup.enter="validateAndSyncPrice('min')"
          />
          <label for="min-price-input" class="price-input-label">
            Min <span v-if="facet.unit">({{ facet.unit }})</span>
          </label>
        </div>
  
        <div class="price-input">
          <input
            id="max-price-input"
            class="price-input-field"
            type="number"
            v-model.number="MaxRange"
            :placeholder="MaxRange"
            @input="sanitizePrice('max')"
            @blur="validateAndSyncPrice('max')"
            @keyup.enter="validateAndSyncPrice('max')"
          />
          <label for="max-price-input" class="price-input-label">
            Max <span v-if="facet.unit">({{ facet.unit }})</span>
          </label>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  export default {
    name: 'RangeInput',
    props: {
      facet: {
        type: Object,
        required: true,
      },
    },
    watch: {
      facet: {
        handler(newFacet) {
          this.localInputFacet = { ...newFacet };
        },
        deep: true,
      },
    },
    data() {
      return {
        localInputFacet: { 
            ...this.facet,
        },
        MinRange : 0,
        MaxRange : 1000,
      };
    },
    methods: {
      handlePriceChange() {
        this.localInputFacet.MinRange=this.MinRange
        this.localInputFacet.MaxRange=this.MaxRange
        this.$emit('price-change', this.localInputFacet);
      },
      validateAndSyncPrice(type) {
        if (type === 'min') {
          if (isNaN(this.MinRange)) 
            this.MinRange = 0;
          
        }else if (type === 'max') {
          if (isNaN(this.MaxRange)) 
            this.MaxRange = 1000;
        }
        this.handlePriceChange();
      },
      sanitizeInput(value) {
        const sanitizedValue = String(value).replace(/[^\d.]/g, '');
        // Return the sanitized value as a number or 0 if empty
        return sanitizedValue ? parseFloat(sanitizedValue) : 0;
      },
      sanitizePrice(type) {
        if (type === 'min') {
          this.MinRange = this.sanitizeInput(this.MinRange);
        } else if (type === 'max') {
          this.MaxRange = this.sanitizeInput(this.MaxRange);
        }
      },
    },
  };
  </script>
  
  <style scoped>
  .slider-chart-container {
    position: relative;
    margin: 8px;
  }
  </style>
  