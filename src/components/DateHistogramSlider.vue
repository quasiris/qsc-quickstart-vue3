<template>
  <div class="date-histogram-slider slider-chart-container">
    <span class="slider-price-range">
      {{ msToDate(localSliderValues[0]) }} - {{ msToDate(localSliderValues[1]) }}
    </span>
    <!-- D3 Chart Hintergrund -->
    <div :id="'chart-'+ facet.filterName" class="chart"></div>
    <div class="slider-wrapper">
      <v-range-slider
        v-model="localSliderValues"
        :max="localSliderFacet.maxPrice"
        :min="localSliderFacet.minPrice"
        :step="86400000"
        class="date-slider-h"
        :disabled="localSliderFacet.isSliderDisabled"
        hide-details
        @mouseup="handleDateChange"
      ></v-range-slider>
    </div>
  </div>
</template>


<script>
import * as d3 from 'd3';

export default {
    name: "DateHistogramSlider",
    props: {
      facet: {
        type: Object,
        required: true
      },
    },
    watch: {
      facet: {
        handler(newFacet) {
          this.localSliderFacet = {...newFacet};
          this.initializeFacetData(this.localSliderFacet);
          this.createBarChart(this.localSliderFacet);
        },
        deep: true,
      },
    },
    created (){
      this.initializeFacetData(this.localSliderFacet);
      this.localSliderValues = [this.sliderMin, this.sliderMax];
    },
    mounted (){
      this.createBarChart(this.localSliderFacet);
    },
    data() {
      return {
        localSliderValues: [...(this.facet.sliderValues || [])],
        localSliderFacet:{...this.facet},
        sliderMin: null,
        sliderMax: null,
      };
    },
    methods: {
      initializeFacetData(facet){
        const first = facet.values[0];
        const last = facet.values[facet.values.length - 1];
        const minMs = this.dateToMs(first.filter.minValue);
        const maxMs = this.dateToMs(last.filter.maxValue);

        if (this.sliderMin === null || minMs < this.sliderMin) this.sliderMin = minMs;
        if (this.sliderMax === null || maxMs > this.sliderMax) this.sliderMax = maxMs;

        facet.minPrice = this.sliderMin;
        facet.maxPrice = this.sliderMax;
        facet.isSliderDisabled = (this.sliderMin === this.sliderMax);
      },

      dateToMs(value){
        const ms = new Date(value).getTime();
        return ms;
      },

      msToDate(ms){
        return new Date(ms).toLocaleDateString('de-DE');
      },


      barCount(d){
        return d.variant_count ?? d.count;
      },

      async createBarChart(facet){
        const data = facet.values;
        const chartId = `chart-${facet.filterName}`;
        const chartElement = document.getElementById(chartId);
        if (!chartElement) {
          console.error("Chart element not found");
          return;
        }
        const margin = { top: 20, right: 23, bottom: 0, left: 28 };
        const width = chartElement.offsetWidth - margin.left - margin.right;
        const height = chartElement.offsetHeight - margin.top - margin.bottom;

        d3.select(chartElement).selectAll("*").remove();

        const svg = d3
          .select(chartElement)
          .append("svg")
          .attr("width", width + margin.left + margin.right)
          .attr("height", height + margin.top + margin.bottom)
          .append("g")
          .attr("transform", `translate(${margin.left},${margin.top})`);


        const x = d3
          .scaleBand()
          .domain(data.map(d => d.value))
          .range([0, width])
          .padding(0.1);

        const y = d3
          .scaleLinear()
          .domain([0, d3.max(data, d => this.barCount(d))])
          .nice()
          .range([height, 0]);

        const maxBarWidth = 5;
        const [minSelected, maxSelected] = this.localSliderValues; // sind in ms


        svg.selectAll(".bar")
          .data(data)
          .enter()
          .append("rect")
          .attr("class", "bar")
          .attr("x", d => x(d.value))
          .attr("y", height)
          .attr("width", Math.min(x.bandwidth(), maxBarWidth))
          .attr("height", 0)
          .attr("fill", d => {
            // d.value ist ein Label ("01.2023"), nicht parsebar -> ISO aus filter.value nehmen
            const ms = this.dateToMs(d.filter.value);
            if (ms >= minSelected && ms <= maxSelected) {
              return "#475772";
            }
            return "#b6b6b6";
          })
          .attr("rx", 1)
          .attr("ry", 1)
          .transition()
          .duration(500)
          .attr("y", d => y(this.barCount(d)))
          .attr("height", d => height - y(this.barCount(d)));
      },

      handleDateChange(){
        // Slider losgelassen -> Chart neu zeichnen + Filter nach oben melden.
        this.localSliderFacet.sliderValues = this.localSliderValues;
        this.createBarChart(this.localSliderFacet);
        this.$emit('date-change', this.localSliderFacet);
      },

    }


  }
</script>


<style scoped>
.slider-chart-container {
  position: relative;
  height: 170px;
  margin: 8px;
}
.chart {
  position: absolute;
  top: 5px;
  left: 0;
  right: 0;
  bottom: 18px;
  z-index: 1;
}
.date-slider-h {
  position: absolute;
  bottom: 0;
  width: 95%;
  z-index: 2;
}
.slider-price-range {
  font-size: 12px;
}
.slider-wrapper {
  position: absolute;
  left: 0;
  right: 18px;
  bottom: 0;
  padding: 0 10px;
  z-index: 2;
}
</style>