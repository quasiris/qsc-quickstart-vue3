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
            @blur="validateAndSyncMinPrice"
            @keyup.enter="validateAndSyncMinPrice"
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
            @blur="validateAndSyncMaxPrice"
            @keyup.enter="validateAndSyncMaxPrice"
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
        console.log(this.localInputFacet)
        this.$emit('price-change', this.localInputFacet);
      },
      validateAndSyncMinPrice() {
        if (isNaN(this.MinRange)) {
            this.MinRange = 0;
        }
        if (this.MinRange > this.MaxRange) {
            this.MinRange = this.MaxRange;
        }
        this.handlePriceChange();
      },
      validateAndSyncMaxPrice() {
        if (isNaN(this.MaxRange)) {
            this.MaxRange = 1000;
        }
        if (this.MaxRange < this.MinRange) {
            this.MaxRange = this.MinRange;
        }
        this.handlePriceChange();
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
  