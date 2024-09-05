<template>
    <div class="slider-chart-container">
      <div class="price-input-wrapper">
        <div class="price-input">
          <input
            id="min-price-input"
            class="price-input-field"
            type="number"
            v-model="tempMinPrice"
            :placeholder="localSliderFacet.minPrice"
            @blur="validateAndSyncMinPrice"
            @keyup.enter="validateAndSyncMinPrice"
          />
          <label for="min-price-input" class="price-input-label">
            Min <span v-if="localSliderFacet.unit">({{ localSliderFacet.unit }})</span>
          </label>
        </div>
  
        <div class="price-input">
          <input
            id="max-price-input"
            class="price-input-field"
            type="number"
            v-model="tempMaxPrice"
            :placeholder="localSliderFacet.maxPrice"
            @blur="validateAndSyncMaxPrice"
            @keyup.enter="validateAndSyncMaxPrice"
          />
          <label for="max-price-input" class="price-input-label">
            Max <span v-if="localSliderFacet.unit">({{ localSliderFacet.unit }})</span>
          </label>
        </div>
      </div>
  
      <v-range-slider
        v-model="localSliderValues"
        :max="localSliderFacet.maxPrice"
        :min="localSliderFacet.minPrice"
        :step="1"
        class="price-slider"
        :disabled="localSliderFacet.isSliderDisabled"
        hide-details
        @mouseup="handlePriceChange"
      ></v-range-slider>
    </div>
  </template>
  
  <script>
  export default {
    name: 'PriceSlider',
    props: {
      facet: {
        type: Object,
        required: true,
      },
    },
    watch: {
      facet: {
        handler(newFacet) {
          this.localSliderValues = [...newFacet.sliderValues];
          this.localSliderFacet = { ...newFacet };
          this.tempMinPrice = this.localSliderValues[0];
          this.tempMaxPrice = this.localSliderValues[1];
        },
        deep: true,
      },
      // Watch the localSliderValues to sync the input fields in real-time
      localSliderValues: {
        handler(newValues) {
          this.tempMinPrice = newValues[0];
          this.tempMaxPrice = newValues[1];
        },
        deep: true,
        immediate: true,
      },
    },
    data() {
      return {
        localSliderValues: [...this.facet.sliderValues], // Copy of the slider values
        localSliderFacet: { ...this.facet }, // Copy of the facet object
        tempMinPrice: this.facet.sliderValues[0], // Temporary value for min input
        tempMaxPrice: this.facet.sliderValues[1], // Temporary value for max input
      };
    },
    methods: {
      handlePriceChange() {
        this.localSliderFacet.sliderValues = this.localSliderValues;
        this.$emit('price-change', this.localSliderFacet);
      },
      validateAndSyncMinPrice() {
        let minPrice = parseFloat(this.tempMinPrice);
        if (isNaN(minPrice)) {
          minPrice = this.localSliderFacet.minPrice;
        }
        if (minPrice < this.localSliderFacet.minPrice) {
          minPrice = this.localSliderFacet.minPrice;
        }
        if (minPrice > this.localSliderValues[1]) {
          minPrice = this.localSliderValues[1];
        }
        this.localSliderValues[0] = minPrice;
        this.tempMinPrice = minPrice;
        this.handlePriceChange();
      },
      validateAndSyncMaxPrice() {
        let maxPrice = parseFloat(this.tempMaxPrice);
        if (isNaN(maxPrice)) {
          maxPrice = this.localSliderFacet.maxPrice;
        }
        if (maxPrice > this.localSliderFacet.maxPrice) {
          maxPrice = this.localSliderFacet.maxPrice;
        }
        if (maxPrice < this.localSliderValues[0]) {
          maxPrice = this.localSliderValues[0];
        }
        this.localSliderValues[1] = maxPrice;
        this.tempMaxPrice = maxPrice;
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
  