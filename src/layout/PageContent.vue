<template>
  <v-container>
    <v-row>
      <v-col cols="12">
        <br><br><br>
        <v-card-text
          class="ps-6 d-flex justify-space-between align-center flex-wrap mt-3"
        >
          <div class="my-2" v-if="!localSearchQuery">
            <h3 class="">All Products</h3>
            <p class="gray--text text--darken-1 mb-0">
              {{ totalproducts }} results found
            </p>
          </div>
          <div class="my-2" v-else>
            <h3>Hits for "{{ localSearchQuery }}"</h3>
            <p class="gray--text text--darken-1 mb-0">
              {{ totalproducts }} results found
            </p>
          </div>
          <div class="d-flex align-center flex-wrap">
            <v-select  v-if="sorts.length > 0"
              class="d-flex align-end"
              :items="sorts"
              label="Sort by"
              v-model="selectedSort"
              item-title="name"
              item-value="id"
              variant="outlined"
            ></v-select>
            <!--  In this bar, i have results and Sorting and views -->
            <div class="grey--text text--darken-1 me-2 my-2"></div>
            <v-btn   v-if="display.width._object.width >= 600"
              icon
              @click="viewMode = 'grid'"
              :disabled="viewMode === 'grid'"
            >
              <svg width="24" height="24" viewBox="0 0 48 48" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                <rect x="5" y="5" width="38" height="38" rx="2" stroke="#333" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
                <path   d="M5 18H43" stroke="#333" stroke-width="3" stroke-linecap="round" fill="currentColor"/>
                <path   d="M5 30H43" stroke="#333" stroke-width="3" stroke-linecap="round" fill="currentColor"/>
                <path   d="M17 5V43" stroke="#333" stroke-width="3" stroke-linecap="round" fill="currentColor"/>
                <path   d="M30 5V43" stroke="#333" stroke-width="3" stroke-linecap="round" fill="currentColor"/>
              </svg>
            </v-btn>
            <v-btn
              v-if="display.width._object.width >= 600"
              icon
              @click="viewMode = 'gift'"
              :disabled="viewMode === 'gift'"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path fill-rule="evenodd" clip-rule="evenodd"
                d="M2 3C2 2.44772 2.44772 2 3 2H10C10.5523 2 11 2.44772 11 3V10C11 10.5523 10.5523 11 10 11H3C2.44772 11 2 10.5523 2 10V3ZM4 4V9H9V4H4Z" fill="currentColor"/>
                <path fill-rule="evenodd" clip-rule="evenodd" d="M13 3C13 2.44772 13.4477 2 14 2H21C21.5523 2 22 2.44772 22 3V10C22 10.5523 21.5523 11 21 11H14C13.4477 11 13 10.5523 13 10V3ZM15 4V9H20V4H15Z" fill="currentColor"/>
                <path fill-rule="evenodd" clip-rule="evenodd" d="M13 14C13 13.4477 13.4477 13 14 13H21C21.5523 13 22 13.4477 22 14V21C22 21.5523 21.5523 22 21 22H14C13.4477 22 13 21.5523 13 21V14ZM15 15V20H20V15H15Z" fill="currentColor"/>
                <path fill-rule="evenodd" clip-rule="evenodd" d="M2 14C2 13.4477 2.44772 13 3 13H10C10.5523 13 11 13.4477 11 14V21C11 21.5523 10.5523 22 10 22H3C2.44772 22 2 21.5523 2 21V14ZM4 15V20H9V15H4Z" fill="currentColor"/>
              </svg>
            </v-btn>
            <v-btn   v-if="display.width._object.width >= 600"
              icon
              @click="viewMode = 'list'"
              :disabled="viewMode === 'list'"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M2 6C2 5.44772 2.44772 5 3 5H21C21.5523 5 22 5.44772 22 6C22 6.55228 21.5523 7 21 7H3C2.44772 7 2 6.55228 2 6Z" fill="currentColor"/>
                <path d="M2 12.0322C2 11.4799 2.44772 11.0322 3 11.0322H21C21.5523 11.0322 22 11.4799 22 12.0322C22 12.5845 21.5523 13.0322 21 13.0322H3C2.44772 13.0322 2 12.5845 2 12.0322Z" fill="currentColor"/>
                <path d="M3 17.0645C2.44772 17.0645 2 17.5122 2 18.0645C2 18.6167 2.44772 19.0645 3 19.0645H21C21.5523 19.0645 22 18.6167 22 18.0645C22 17.5122 21.5523 17.0645 21 17.0645H3Z" fill="currentColor"/>
              </svg>
            </v-btn>
          </div>
        </v-card-text>
        <v-divider class="my-1 w-100"></v-divider>
      </v-col>
      <v-col cols="12">
        <div class="box-wrapper">
          <div
            class="box-overlay"
            :class="{ open: isSidebar }"
            @click="isSidebar = !isSidebar"
          >
          </div>
          <v-navigation-drawer v-if="facets && !isFacetsLoading" :width="300"  class="drawer pb-4 shadow-sm"  v-model="isSidebar" :class="{ open: !isSidebar }" >
            <v-list-item v-for="facet in facets" :key="facet.id">
              <div v-if="(facet.type === 'slider' || facet.type === 'histogram' || facet.type === 'rangeInput') && facet.count !=0">
                <h4 class="pt-3 pb-3 d-flex align-start justify-center flex-column">
                  {{ facet.name }}
                </h4>
                <RangeInput
                  v-if="facet.type == 'rangeInput'"
                  :facet="facet"
                  :resetAll="resetAll"
                  @price-change="handlePriceRangeChange"
                /> 
                <PriceSlider
                  v-if="facet.type == 'slider'"
                  :facet="facet"
                  @price-change="handlePriceChange"
                /> 
                <HistogramSlider
                  v-if="facet.type == 'histogram'"
                  :facet="facet"
                  @price-change="handlePriceChange"
                />
              </div>
              <h4 v-if="!(facet.type === 'slider' || facet.type === 'histogram'|| facet.type === 'rangeInput'|| facet.type === 'search')"
                class="pt-3 d-flex align-start justify-center flex-column"
              >
                {{ facet.name }}
              </h4>
              <div v-if="facet.type==='datePicker'">
                <date-picker
                  :facet="facet"
                  :resetAll="resetAll"
                  @updateDateRange="handleDateRangeUpdate"
                  class="mb-7"
                />
              </div>
              <div v-if="facet.type==='colorPicker'">
                <color-picker
                  :facet="facet"
                  :selectedColors="selectedFilters"
                  @colorSelected="handleColorSelection"
                />
              </div>
              <div v-if="facet.type==='navigation'">
                  <SideBarNavigation 
                  :item="facet" 
                  :parentName="facet.name"
                  :expanded-panels="expandedPanels" 
                  @onFilter="handleNavigationSelection" 
                  @update-expanded-panels="updateExpandedPanels"  />
              </div>
              <div v-if="!(facet.type === 'slider' || facet.type === 'histogram' || facet.type === 'colorPicker' || facet.type === 'search'|| facet.type === 'datePicker'|| facet.type === 'navigation')">
                <div 
                v-for="value in facet.values"
                :key="value.value"
                >
                  <v-checkbox
                    hide-details
                    class="smaller-checkbox"
                    type="checkbox"
                    color="primary"
                    :value="value.filter"
                    v-model="selectedFilters"
                    :id="'filter-' + value.filter"
                    @change="chipsControle(facet,value)"
                  >
                    <template #label>
                      <label
                        :for="'filter-' + value.filter"
                        class="text-decoration-none grey--text text--darken-2"
                      >
                        <span
                          class="hover-color"
                          @mouseover="hoverColor = true"
                          @mouseout="hoverColor = false"
                          style="font-size: 12px;"
                        >
                          {{ value.value }}
                          &nbsp; ({{ value.count }})
                        </span>
                      </label>
                    </template>
                  </v-checkbox>
                </div>
              </div>
              <v-divider  v-if="products.length != 0" class="mt-3"></v-divider>
            </v-list-item>
            <v-list-item v-if="facets.length > 0" class="d-flex justify-center mt-3"> 
              <v-btn
                color="primary"
                class="text-capitalize search-bar-dropdown px-10 font-600"
                @click="clearFilters()"
                >Reset Filters</v-btn
              >
            </v-list-item>            
          </v-navigation-drawer>
          <v-navigation-drawer v-if="isFacetsLoading" :width="300"  class="drawer pb-4 shadow-sm"  v-model="isSidebar" :class="{ open: !isSidebar }" >
            <v-list-item v-for="(skeleton, index) in skeletonProducts.slice(0, 8)" :key="index" class="d-flex justify-center mt-3"> 
              <v-skeleton-loader
                class="mx-auto border"
                min-width="250"
                type="text,paragraph,chip"
              ></v-skeleton-loader>
            </v-list-item>  
          </v-navigation-drawer>
          <div class="box-content">
            <v-row>
              <v-col cols="12">
              <div class="d-flex justify-end pa-2 d-block d-md-none">
                  <v-btn  icon @click.stop="isSidebar = !isSidebar"  v-show="facets && facets.length > 0">
                  <v-icon color="#1867c0">
                    mdi-format-list-bulleted-square
                  </v-icon>
                </v-btn>
              </div>
              <div class="box-container">
                <v-row>
                  <div class="sQuery mb-1" v-show="localSearchQuery"  @click="clearSearchQuery" >
                    <span class="chip-text">{{ localSearchQuery }}</span>
                    <v-tooltip
                      v-if="localSearchQuery" 
                      activator="parent"
                      location="top"
                      > Query: {{ localSearchQuery }}
                    </v-tooltip>
                    <div 
                      v-if="localSearchQuery"
                      class="clear-input justify-center "
                      @click="clearSearchQuery"
                    >
                      &times;
                    </div> 
                  </div> 
                  <div class="sQuery mb-1" v-for="(chip,index) in chipsValues" :key="index" >
                    <span class="chip-text">{{ chip[Object.keys(chip)[0]] }}</span>
                    <v-tooltip
                      activator="parent"
                      location="top"
                      >{{ Object.keys(chip)[0] }} : {{ chip[Object.keys(chip)[0]] }}
                    </v-tooltip>
                    <div 
                      v-if="chip"
                      class="clear-input justify-center"
                      @click.stop="deleteChip(chip)"
                    >
                      &times;
                    </div> 
                  </div>
                  <v-btn
                    v-if="chipsValues.length !=0 "
                    color="primary"
                    variant="text"
                    size="x-small"
                    class="text-capitalize mt-3 ml-2 justify-center"
                    @click="clearFilters()"
                    >Reset all</v-btn
                  > 
                  <v-col cols="12" class="col-auto">
                    <v-row v-if="((products.length === 0 && selectedFilters.length != 0) || (products.length === 0 && searchQuery != '' )) && !isProductsLoading" class="d-flex flex-column align-center justify-center" style="min-height: 300px;">                      
                      <v-col cols="12" class="text-center">
                        <p class="font-weight-bold">No products found for "&nbsp;{{ searchQuery }}&nbsp;"</p>
                        <v-icon size="x-large" color="grey">mdi-magnify-close</v-icon> 
                      </v-col>
                    </v-row>
                    <v-data-iterator :items="isProductsLoading ? skeletonProducts : products" hide-default-footer>
                      <!--  Here I have Products-->
                        <v-row >                          
                          <v-col
                            v-for="(product, index) in (isProductsLoading ? skeletonProducts : products)"
                            :key="index"
                            :cols="
                              viewMode === 'list'
                                ? 12
                                : viewMode === 'gift'
                                ? 12
                                : 12
                            "
                            :sm="
                              viewMode === 'list'
                                ? 12
                                : viewMode === 'gift'
                                ? 6
                                : 6
                            "
                            :md="
                              viewMode === 'list'
                                ? 12
                                : viewMode === 'gift'
                                ? 6
                                : 6
                            "
                            :lg="
                              viewMode === 'list'
                                ? 12
                                : viewMode === 'gift'
                                ? 6
                                : 4
                            "
                            :xl="
                              viewMode === 'list'
                                ? 12
                                : viewMode === 'gift'
                                ? 6
                                : 3
                            "
                          >
                            <v-skeleton-loader
                              v-if="isProductsLoading"
                              class="mx-auto border"
                              max-width="300"
                              type="image, article"
                            ></v-skeleton-loader>
                            <ProductCard
                              v-else
                              :product="product"
                              :config="config"
                              :cardHeight="cardHeight"
                              :viewMode="viewMode"
                            />
                          </v-col>
                        </v-row>
                        <template v-slot:footer>
                          <v-row
                            v-if="products.length != 0"
                            class="my-5 mx-1"
                            justify="center"
                          >
                            <v-spacer></v-spacer>
                            <v-col cols="12" md="auto" class="d-flex justify-md-end justify-center">
                              <v-select
                                v-model="records"
                                :items="showedRows"
                                label="Records"
                                variant="outlined"
                                item-title="name"
                                item-value="id"
                                class="mx-auto" 
                                style="width: 100%;"
                              ></v-select>
                            </v-col>
                            <v-col cols="12" md="auto" class="d-flex justify-md-end justify-center align-start">
                              <span class="mr-md-4 mr-2 grey--text">
                                Page {{ currentPage }} of {{ totalPages }}
                              </span>

                              <v-btn
                                fab
                                :disabled="currentPage == 1"
                                @click="handleClick"
                                small
                                color="primary"
                                class="mr-1"
                              >
                                <v-icon>mdi-chevron-left</v-icon>
                              </v-btn>

                              <v-btn
                                fab
                                :disabled="currentPage == totalPages"
                                @click="myhandleClick"
                                small
                                color="primary"
                                class="ml-1"
                              >
                                <v-icon>mdi-chevron-right</v-icon>
                              </v-btn>
                            </v-col>
                          </v-row>
                        </template>
                    </v-data-iterator>
                  </v-col>
                </v-row>
              </div>
              </v-col>
            </v-row>
          </div>
        </div>
      </v-col>
    </v-row>
  </v-container>
</template>
<script>

import { replacePlaceholders } from '@/utils'; 
import HistogramSlider from "@/components/HistogramSlider.vue";
import SideBarNavigation from "@/components/SideBarNavigation.vue";
import ProductCard from "@/components/ProductCard.vue";
import PriceSlider from "@/components/PriceSlider.vue";
import ColorPicker from "@/components/ColorPicker.vue";
import DatePicker from "@/components/DatePicker.vue";
import RangeInput from "@/components/RangeInput.vue";
import {mapGetters, mapState, mapActions } from 'vuex';
import { useDisplay } from 'vuetify'
import axios from "axios";
export default {
  components: {HistogramSlider,ColorPicker,DatePicker,PriceSlider,ProductCard,RangeInput,SideBarNavigation},
  data() {
    return {
      localSearchQuery: this.searchQuery,
      products: [],
      totalproducts: "",
      selectedFilters: [],
      facets: [],
      sorts: [],
      resetAll: false,
      expandedPanels: [],
      skeletonProducts: Array(24).fill({}),
      showedRows : [
        {id:24,name:'24 records'},
        {id:48,name:'48 records'},
        {id:72,name:'72 records'},
        {id:96,name:'96 records'},
      ],
      records: '24',
      selectedSort: "",
      selectedRow: "",
      chipsValues:[],
      currentPage: 1,
      isSidebar: false,
      viewMode: "grid",
      totalPages: "",
    };
  },
  props: {
    searchQuery: { type: String, default: "" },
    config: { type: Object, required: true },
    filter: { type: Object},
  },
  setup() {
    const display = useDisplay()
    return { display }
  },
  computed: {
    ...mapState(['requestId','userId','sessionId']),
    ...mapGetters(['isProductsLoading','isFacetsLoading']),
    cardHeight() {
      return (this.viewMode === 'list' ? '270px' : '300px');
    },
    //...mapGetters(["getProducts"])
  },
  created() {
    window.addEventListener("scroll", this.handleScroll);
    this.items = this.getProducts;
  },
  unmounted() {
    window.removeEventListener("scroll", this.handleScroll);
  },
  mounted() {    
    if(this.config.rows){
      this.showedRows=this.config.rows;
      this.selectedRow=this.config.rows[0].id;
    }
    this.fetchProducts();
  },
  watch: {
    filter:{
      handler(newVal) {
        if(newVal.filter){
          const newFilter = newVal.filter; 
          const filterPrefix = newFilter.split('=')[0];
          const existingIndex = this.selectedFilters.findIndex(f => f.startsWith(filterPrefix));

          if (existingIndex !== -1) {
            const chipIndex = this.chipsValues.findIndex(chip => 
              chip.Sortiment === newVal.name
            );
            // If the filter is the same, remove it
            if (this.selectedFilters[existingIndex] === newFilter) {
              this.selectedFilters.splice(existingIndex, 1);
              this.chipsValues.splice(chipIndex, 1);
            } else {
              // Otherwise, replace it with the new one
              let newChip={ 
                Sortiment: newVal.name, 
                filter: newFilter 
              };
              this.selectedFilters.splice(existingIndex, 1, newFilter);
              this.chipsValues.splice(chipIndex, 1, newChip);
            }
          } else {
            this.chipsValues.push({ 
              Sortiment: newVal.name, 
              filter: newFilter 
            });
            this.selectedFilters.push(newFilter);
          }
          this.selectedFilters = [...this.selectedFilters];
        }
      },
      deep: true, 
      immediate: true
    },
    localSearchQuery(newVal) {
      this.$emit("onSearch", newVal);
    },
    searchQuery(newVal) {
      this.localSearchQuery=newVal
      this.clearFilters();
      this.currentPage=1;
    },
    selectedFilters() {
      this.scrollToTop();
      this.currentPage= 1;
      this.startProductsLoading();
      this.fetchProducts();
    },
    selectedSort(newVal) {
      if(newVal != this.sorts[0].name && this.sorts.length > 0){
        this.startProductsLoading();
        this.fetchProducts();}
    },
    records(newVal) {
      if(newVal && newVal != this.selectedRow){
        this.startProductsLoading();
        this.selectedRow=newVal
        this.fetchProducts();}
    },
    selectedRow(newVal) {
      if(newVal){
        this.records=newVal
      }
    },
    config(newVal) {
      if(newVal){
        this.startProductsLoading();
        this.fetchProducts();}
    },
  },

  methods: {
    ...mapActions(['setRequestId','startProductsLoading','startFacetsLoading','stopProductsLoading','stopFacetsLoading','showGlobalSheet']),
    chipsControle(facet, value) {
      const chipIndex = this.chipsValues.findIndex(chip => 
        chip[facet.name] === value.value
      );
      if (chipIndex !== -1) {
        // Remove the chip if it exists
        this.chipsValues.splice(chipIndex, 1);
        // Remove the corresponding filter from selectedFilters
        const filterIndex = this.selectedFilters.indexOf(value.filter);
        if (filterIndex !== -1) {
          this.selectedFilters = [
            ...this.selectedFilters.slice(0, filterIndex), 
            ...this.selectedFilters.slice(filterIndex + 1)
          ];
        }
      } else {
        // Add a new chip if it doesn't exist
        this.chipsValues.push({ 
            [facet.name]: value.value, 
            filter: value.filter 
          });
      }
    },
    deleteChip(chip) {
      const chipIndex = this.chipsValues.findIndex(ch => 
        ch.filter === chip.filter
      );
      // If chip exists, remove it
      if (chipIndex !== -1) {
        this.selectedFilters = this.selectedFilters.filter(item => {
          // Filter out both range-based filters and exact matches
          return !item.startsWith(chip.filter + '.range=') && !item.startsWith(chip.filter + '.daterange=') && item !== chip.filter;
        });
        const expandedPanelIndex = this.expandedPanels.findIndex(panel => panel.filter === chip.filter);        // If we find a matching key in expandedPanels, remove it
        if (expandedPanelIndex !== -1) {
          const newExpandedPanels = [...this.expandedPanels];
          newExpandedPanels.splice(expandedPanelIndex, 1);
            // Remove the panel
          this.expandedPanels =newExpandedPanels;  // Update the expandedPanels
        }
        this.chipsValues.splice(chipIndex, 1);
      }
    },
    updateExpandedPanels(newExpandedPanels) {
      this.expandedPanels = newExpandedPanels;
    },
    handleDateRangeUpdate(filter,chip,facet) {
      this.selectedFilters = this.selectedFilters.filter(item => !item.startsWith(facet.filterName));
      this.selectedFilters.push(filter);
      const existingChipIndex = this.chipsValues.findIndex(chip => Object.hasOwn(chip, facet.name));
        if (existingChipIndex !== -1) {
          this.chipsValues[existingChipIndex][facet.name] = chip;
          this.chipsValues[existingChipIndex].filter= facet.filterName;
        } else {
          this.chipsValues.push({ [facet.name]: chip, filter: facet.filterName });
        }
    },
    handleColorSelection(color, name) {
      const filter = color.filter;
      // Remove existing filters in selectedFilters that start with the same filter
      this.selectedFilters = this.selectedFilters.filter(item => !item.startsWith(filter));
      // Find the chip with the same filter in chipsValues
      const chipIndex = this.chipsValues.findIndex(chip => chip.filter === filter);
      // If the filter doesn't exist, add it to both selectedFilters and chipsValues
      if (chipIndex === -1) {
        this.selectedFilters.push(filter);
        this.chipsValues.push({ [name]: color.value, filter: color.filter });
      } else {
        // If the filter exists, remove the chip from chipsValues
        this.chipsValues.splice(chipIndex, 1);
      }
    },
    handleNavigationSelection(filter,name) {
      this.selectedFilters = this.selectedFilters.filter(item => !item.startsWith(filter.filter));
      // Find the chip with the same filter in chipsValues
      const chipIndex = this.chipsValues.findIndex(chip => chip.filter === filter.filter);
      if (chipIndex === -1) {
        this.selectedFilters.push(filter.filter);
        this.chipsValues.push({ [name]: filter.value, filter: filter.filter });
      } else {
        // If the filter exists, remove the chip from chipsValues
        this.chipsValues.splice(chipIndex, 1);
      }
    },
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
    },  
    handlePriceChange(filter) {
      if(filter.sliderValues[0] && filter.sliderValues[1]){
        let filterValue=filter.filterName+'.range='+filter.sliderValues[0]+','+filter.sliderValues[1]
        let chipValue=filter.sliderValues[0]+' - '+filter.sliderValues[1]+' '+filter.unit
        this.selectedFilters = this.selectedFilters.filter(item => !item.startsWith(filter.filterName + '.range='));
        this.selectedFilters.push(filterValue)
        // Check if the key (filter.name) already exists in chipsValues
        const existingChipIndex = this.chipsValues.findIndex(chip => Object.hasOwn(chip, filter.name));
        if (existingChipIndex !== -1) {
          // If the key already exists, update the value
          this.chipsValues[existingChipIndex][filter.name] = chipValue;
          this.chipsValues[existingChipIndex].filter= filter.filterName;
        } else {
          // If the key doesn't exist, push a new object
          this.chipsValues.push({ [filter.name]: chipValue, filter: filter.filterName });
        }
      }else{
        filter.sliderValues[0]=filter.minPrice;
        filter.sliderValues[1]=filter.maxPrice;
      }
    }, 
    handlePriceRangeChange(filter) {
      if (filter.MinRange != null && filter.MaxRange != null){
        let filterValue=filter.filterName+'.range='+filter.MinRange+','+filter.MaxRange
        let chipValue=filter.MinRange+' - '+filter.MaxRange+' '+filter.unit
        this.selectedFilters = this.selectedFilters.filter(item => !item.startsWith(filter.filterName + '.range='));
        this.selectedFilters.push(filterValue)
        const existingChipIndex = this.chipsValues.findIndex(chip => Object.hasOwn(chip, filter.name));
        if (existingChipIndex !== -1) {
          this.chipsValues[existingChipIndex][filter.name] = chipValue;
          this.chipsValues[existingChipIndex].filter= filter.filterName;
        } else {
          this.chipsValues.push({ [filter.name]: chipValue, filter: filter.filterName });
        }
      }
    },
    fetchProducts() {
      const selectedFilters = this.selectedFilters.join("&");
      const selectedSort = this.selectedSort;
      const selectedRow = this.selectedRow;
      const apiUrl = this.config.baseurl;

      const queryParameters = [];

      if (this.localSearchQuery) {
        queryParameters.push(`q=${this.localSearchQuery}`);
      }
      if(this.userId)
      {
        queryParameters.push(`userId=${this.userId}`);
      }
      if(this.sessionId)
      {
        queryParameters.push(`sessionId=${this.sessionId}`);
      }
      if(this.requestId)
      {
        queryParameters.push(`requestId=${this.requestId}`);
      }
      if (selectedFilters) {
        queryParameters.push(selectedFilters);
      }

      if (selectedSort && this.sorts.length > 0 && selectedSort !== this.sorts[0]?.name) {
        queryParameters.push(`sort=${selectedSort}`);
      }

      if (selectedRow) {
        queryParameters.push(`rows=${selectedRow}`);
      }
      if (this.currentPage) {
        queryParameters.push(`page=${this.currentPage}`);
      }

      const queryString = queryParameters.join("&");
      const apiUrlWithQuery = `${apiUrl}?${queryString}`;
      axios
        .get(apiUrlWithQuery)
        .then(response => {
          const products = response.data.result[this.config.resultSetId].documents;
          this.products = products.map(product => {
            const originalDocument = { ...product.document };
            let updatedDocument = {};
            // Replace placeholders for each key in the config.document
            Object.keys(this.config.document).forEach(key => {
              let pattern = this.config.document[key];
              // Check if the pattern is a placeholder or a direct key
              if (pattern.includes('${')) {
                // placeholders ${}
                updatedDocument[key] = replacePlaceholders(pattern, product.document);
              } else {
                // directly map the key
                updatedDocument[key] = product.document[pattern] ? product.document[pattern] : pattern;
              }
            });
            // Assign the updated document back to the product
            product.origin = originalDocument;
            product.document = updatedDocument;
            return product;
          });
          this.totalproducts = response.data.result[this.config.resultSetId].total;
          this.facets = response.data.result[this.config.resultSetId].facets;          
          this.facets = response.data.result[this.config.resultSetId].facets.map((facet) => {
            if (facet.type === 'slider' || facet.type === 'histogram') {
              this.initializeFacetData(facet);
            }
            return facet;
          });
          this.sorts = response.data.result[this.config.resultSetId].sort.sort;
          if(!this.selectedSort && this.sorts.length > 0)
            this.selectedSort=this.sorts[0].name
          //this.selectedSort = this.sorts.length > 0 ? this.sorts[0].id : '';
          this.totalPages=response.data.result[this.config.resultSetId].paging.pageCount;
          this.selectedRow=response.data.result[this.config.resultSetId].paging.rows;
          if(!this.requestId)
            this.setRequestId(response.data.requestId);
        })
        .catch(() => {
          this.showGlobalSheet();
        })
        .finally(() => {
          this.stopProductsLoading(); // Stop loading
          this.stopFacetsLoading(); 
        });
    },
    nextPage() {
      if (this.currentPage + 1 <= this.totalPages) this.currentPage += 1;
      this.startProductsLoading();
      this.fetchProducts();
    },
    myhandleClick() {
      this.nextPage();
      this.scrollToTop();
    },
    handleClick() {
      this.formerPage();
      this.scrollToTop();
    },
    formerPage() {
      if (this.currentPage - 1 >= 1) this.currentPage -= 1;
      this.startProductsLoading();
      this.fetchProducts();
    },
    scrollToTop() {
      window.scrollTo({
        top: 0,
        behavior: "auto"
      });
    },
    clearFilters() {
      this.startFacetsLoading();
      this.selectedFilters = [];  
      this.resetAll = true;  
      this.chipsValues = [];  
      this.expandedPanels = [];  
      setTimeout(() => {
        this.resetAll = false;  
      }, 200);

    },
    clearSearchQuery() {
      this.startFacetsLoading();
      this.localSearchQuery = "";
      const url = new URL(window.location.href);
      url.searchParams.delete('q');
      // Use the history API to update the URL without reloading the page
      window.history.pushState({}, '', url);
      this.$emit("onSearch", this.localSearchQuery);
    }
  }
};
</script>
<style >

.drawer {
  min-height: 85vh;
  position: relative !important;
  transform: translateX(-8px) !important;
  border-top-width: thin !important;
  border-top-right-radius: 5px;
}
.image {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
  padding-top:12px;
  margin-right: 25px;
  margin-left: 25px;
}
.v-slider-thumb__surface,.v-slider-track__fill{
  background-color: #1867c0 !important;
}
.smaller-checkbox .v-input--selection-controls__input {
  transform: scale(0.8); 
}
.box-content{
  width: calc(100% - 300px);
  border-radius: 8px;
}
a {
  text-decoration: none;
}
.image:hover img {
  transform: scale(1.1);
  transition: transform 0.1s ease-in-out;
}
.image :hover .name {
  color: blue;
}
.list-view .v-card {
  margin-bottom: 16px;
}
.list-view .image {
  margin-right: 50px;
  margin-left: 50px; 
}
.list-view .name {
  font-size: 46px;
  font-weight: bold;
  margin-bottom: 0px;
}
.v-select {
  max-width: 200px; 
}
.v-input__control {
  min-width: 200px;
  max-height: 46px;
}
.clear-input {
  font-size: 19px;
  cursor: pointer;
  position: relative;
  margin: 3px;
  padding-right: 3px;
}
.clear-input:hover {
  font-size: 20px;
}
.hover-color:hover {
  color: #1867c0; 
   cursor: pointer;
}
.sQuery{
  margin-left: 10px;
  background-color: white;
  border: 1px solid rgb(227, 227, 227);
  display: flex;
  align-items: center;
  border-radius: 5px;
  color: #575757;
  font-size: 15px;
  min-width: 45px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1), 
              0 1px 3px rgba(0, 0, 0, 0.08);
}

.chip-text {
  flex-grow: 1;
  padding-right: 3px;
  padding-left: 5px; 
}
.sQuery:hover{
  color: #1867c0;
  cursor: pointer;
}
.box-wrapper {
  position: inherit;
  display: flex;
  align-items: flex-start;
  width: 100%;
  border-radius: 8px;
}
.chart-tooltip {
  position: absolute;
  background-color: #475772;
  color: rgb(255, 255, 255);
  padding: 8px;
  font-size: 14px;
  border-radius: 4px;
  pointer-events: none;
  z-index: 999;
  max-width: 200px;
  text-align: center;
}
.price-slider-container {
  width: 100%;
}
/* Hide the arrows in input[type="number"] for Webkit-based browsers (Chrome, Safari, Edge) */
input[type="number"]::-webkit-outer-spin-button,
input[type="number"]::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}
/* Hide the arrows in input[type="number"] for Firefox */
input[type="number"] {
  -moz-appearance: textfield;
}
.price-input-wrapper {
  display: flex;
  justify-content: space-between;
}
.price-input {
  position: relative;
  width: 48%;
  margin: 2px;
}
.price-input-field {
  width: 100%;
  font-size: 14px;
  border: 1px solid #ccc;
  border-radius: 4px;
  padding: 8px;
}
.price-input-label {
  position: absolute;
  top: -8px;
  left: 10px;
  background: white;
  padding: 0 4px;
  font-size: 12px;
  color: #555;
}
.price-slider {
  padding: 12px !important;
}
.price-display {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 12px; 
  font-size: 18px;
  color: #333;
  font-weight: bold;
}
@media (max-width: 768px) {
  .viewIcon{
      display: none;
  }
  .drawer {
    position: absolute !important;
    margin-top: 11vh !important;
  }
  .open {
    display: none !important;
  }
  .drawer[style*="display: none"] {
    display: none !important;
  }
  .box-content {
    width: 100% !important; 
  }
}
</style>
