<template>
    <div class="slider-chart-container">
      <span class="slider-price-range">
        {{ localSliderValues[0] }}&nbsp;
        <span v-if="facet.unit">{{ facet.unit }}</span> - 
        {{ localSliderValues[1] }}&nbsp;
        <span v-if="facet.unit">{{ facet.unit }}</span>
      </span>
      <!-- D3 Chart Background -->
      <div :id="'chart-' + facet.id" class="chart"></div>
      <div class="slider-wrapper">
        <v-range-slider
          v-model="localSliderValues"
          :max="facet.maxPrice"
          :min="facet.minPrice"
          :step="1"
          class="price-slider-h"
          :disabled="facet.isSliderDisabled"
          hide-details
          @mouseup="handlePriceChange"
        ></v-range-slider>
      </div>
    </div>
  </template>
  
  <script>
  import * as d3 from 'd3';

  export default {
    name: 'HistogramSlider',
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
                this.localSliderFacet = {...newFacet};
            },
            deep: true,
        },
    },
    mounted (){
        this.createBarChart(this.localSliderFacet);
    },
    data() {
        return {
        localSliderValues: [...this.facet.sliderValues], // Create a copy of the slider values
        localSliderFacet: {...this.facet}, // Create a copy of the slider values
        };
    },
    methods: {
        initializeFacetData(facet) {
            if(facet.minValue && facet.maxValue){
                facet.sliderValues = [
                facet.minValue,
                facet.maxValue
                ];
            }else{
                facet.sliderValues = [
                facet.minRange,
                facet.maxRange
                ];
            }
            facet.minPrice  = facet.minRange;
            facet.maxPrice  = facet.maxRange;
            if(facet.minPrice===facet.maxPrice)
                facet.isSliderDisabled = true;
                else
                facet.isSliderDisabled = false;
            if (facet.type === 'histogram') {
            // Create the bar chart after data is initialized
                this.$nextTick(async () => {
               
                });
            }
        },
        async createBarChart(facet) {
            const data = facet.values;
            const chartId = `chart-${facet.id}`;
            // Ensure the chart element exists
            const chartElement = document.getElementById(chartId);
            if (!chartElement) {
                console.error("Chart element not found");
                return;
            }
            // Set up margins and dimensions
            const margin = { top: 20, right: 20, bottom: 0, left: 25 }; // Removed bottom margin
            const width = chartElement.offsetWidth - margin.left - margin.right;
            const height = chartElement.offsetHeight - margin.top - margin.bottom;
            // Remove any existing chart ID SVG
            d3.select(`#${chartId}`).selectAll("*").remove();
            const tooltip = d3
                    .select("body")
                    .append("div")
                    .attr("class", "chart-tooltip")
                    .style("opacity", 0);
            console.log(tooltip)
            const svg = d3
                .select(`#${chartId}`)
                .append("svg")
                .attr("width", width + margin.left + margin.right)
                .attr("height", height + margin.top + margin.bottom)
                .append("g")
                .attr("transform", `translate(${margin.left},${margin.top})`);
            // Scales
            const x = d3
                .scaleBand()
                .domain(data.map(d => d.value))
                .range([0, width])
                .padding(0.1);

            const y = d3
                .scaleLinear()
                .domain([0, d3.max(data, d => d.count)])
                .nice()
                .range([height, 0]);
            // Maximum bar width
            const maxBarWidth = 5; 
            // Bars with rounded top corners
            svg.selectAll(".bar")
                .data(data)
                .enter()
                .append("rect")
                .attr("class", "bar")
                .attr("x", d => x(d.value))
                .attr("y", height)  // Start the bars from the bottom
                .attr("width", Math.min(x.bandwidth(), maxBarWidth))
                .attr("height", 0)  // Start with height 0 for animation
                .attr("fill", "#b6b6b6")  // Bar color set to grey
                .attr("rx", 1)  // Set the x-axis radius for rounded corners
                .attr("ry", 1)  // Set the y-axis radius for rounded corners
                .on("mouseover", (event, d) => this.showTooltip(event, d))
                .on("mouseout", () => this.hideTooltip())
                .transition()
                .duration(500)
                .attr("y", d => y(d.count))
                .attr("height", d => height - y(d.count));  // Height based on 'count'


            // Y-axis label
            svg.append("text")
                .attr("x", 2)
                .attr("y", -margin.top + 10)
                .attr("fill", "currentColor")
                .attr("text-anchor", "start")
                .style("font-size", "10px")
            },
        showTooltip(event, d) {
            const tooltip = d3.select(".chart-tooltip");
            const details = this.getDetails(d);
            tooltip.transition().duration(200).style("opacity", 0.9);
            tooltip
                .html(details)
                .style("left", event.pageX + 10 + "px")
                .style("top", event.pageY - 10 + "px");
        },
        hideTooltip() {
            const tooltip = d3.select(".chart-tooltip");
            tooltip.transition().duration(500).style("opacity", 0);
        },
        getDetails(d) {
            return `Value: ${d.value}<br>Count: ${d.count}`;
        },
        handlePriceChange() {
            this.localSliderFacet.sliderValues=this.localSliderValues
            this.$emit('price-change', this.localSliderFacet);
        },
    },
  };
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
.price-slider-h {
    position: absolute;
    bottom: 0;
    width: 95%;
    z-index: 2; /* Above the chart */
}
.slider-price-range{
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
  