<template>
  <div class="qs-container page-content">
    <v-row>
      <v-col cols="12" class="pb-0">
        <div class="results-header">
          <div class="results-header__title">
            <nav class="category-trail" aria-label="Breadcrumb">
              <span v-if="!localSearchQuery && !categoryTrail.length" class="category-trail__current">All products</span>
              <a v-else href="#" class="category-trail__link" @click.prevent="showAllProducts">All products</a>
              <template v-if="localSearchQuery">
                <v-icon size="14" class="category-trail__sep">mdi-chevron-right</v-icon>
                <a v-if="categoryTrail.length" href="#" class="category-trail__link" @click.prevent="clearCategory">Search “{{ localSearchQuery }}”</a>
                <span v-else class="category-trail__current">Search “{{ localSearchQuery }}”</span>
              </template>
              <template v-for="(node, index) in categoryTrail" :key="node.filter">
                <v-icon size="14" class="category-trail__sep">mdi-chevron-right</v-icon>
                <span v-if="index === categoryTrail.length - 1" class="category-trail__current">{{ node.value }}</span>
                <a v-else href="#" class="category-trail__link" @click.prevent="selectCategory(index)">{{ node.value }}</a>
              </template>
            </nav>
            <h1 class="results-title" v-if="!localSearchQuery">{{ categoryTrail.length ? categoryTrail[categoryTrail.length - 1].value : 'All products' }}</h1>
            <h1 class="results-title" v-else>Results for <span class="results-title__query">“{{ localSearchQuery }}”</span></h1>
            <p v-if="!isProductsLoading && spellCorrection && spellCorrection.type === 'corrected'"
              class="spell-hint mb-1">
              <v-icon size="16" class="me-1">mdi-auto-fix</v-icon>
              Showing results for <strong>“{{ spellCorrection.corrected }}”</strong>.
              Search instead for <a href="#" class="spell-link" @click.prevent="searchWithoutSpellcheck(spellCorrection.original)">“{{ spellCorrection.original }}”</a>
            </p>
            <p v-if="!isProductsLoading && spellCorrection && spellCorrection.type === 'didYouMean'"
              class="spell-hint mb-1">
              Did you mean <a href="#" class="spell-link" @click.prevent="searchSuggestion(spellCorrection.corrected)">“{{ spellCorrection.corrected }}”</a>?
            </p>
            <p class="results-count mb-0">
              <template v-if="!isProductsLoading">
                <span :data-track-id="'resultCountContainer'">{{ formatNumber(totalproducts) }}</span> results
                <span class="results-time">· {{ responseTime }} s</span>
              </template>
              <v-progress-circular v-else color="primary" :size="16" :width="2" indeterminate></v-progress-circular>
            </p>
          </div>
          <div class="sort d-flex align-center">
            <v-btn class="d-md-none me-2 filter-toggle" variant="tonal" prepend-icon="mdi-tune-variant"
              @click.stop="isSidebar = !isSidebar" v-show="facets && facets.length > 0">
              Filters
            </v-btn>
            <v-select v-if="sorts.length > 0" class="sort_input" :items="sorts" label="Sort by"
              v-model="selectedSort" :data-sort-value="selectedSort" item-title="name" item-value="id"
              density="compact" hide-details></v-select>
            <v-btn-toggle v-if="display.width._object.width >= 600" v-model="viewMode" mandatory
              class="view-toggle ms-3" density="comfortable" variant="text">
              <v-btn value="grid" icon="mdi-view-module-outline" aria-label="Grid view"></v-btn>
              <v-btn value="gift" icon="mdi-view-grid-outline" aria-label="Large grid view"></v-btn>
              <v-btn value="list" icon="mdi-view-agenda-outline" aria-label="List view"></v-btn>
            </v-btn-toggle>
          </div>
        </div>
      </v-col>
      <v-col cols="12">
        <div class="box-wrapper">
          <div class="box-overlay" :class="{ open: isSidebar }" @click="isSidebar = !isSidebar">
          </div>
          <v-navigation-drawer v-if="facets && facets.length > 0" :key="facetsRenderKey" :width="290"
            :mobile-breakpoint="768" class="filters drawer" v-model="isSidebar"
            :class="{ open: !isSidebar, 'filters--stale': isFacetsLoading }" :style="drawerStyle">
            <v-list-item class="filter" :data-filter-type="facet.type" v-for="facet in facets" :key="facet.id">
              <div v-if="(facet.type === 'slider' || facet.type === 'histogram' || facet.type === 'date_histogram' || facet.type === 'rangeInput') && facet.count !=0">
                <h4 class="facet-title">{{ facet.name }}</h4>
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
                <DateHistogramSlider
                  v-if="facet.type == 'date_histogram'"
                  :facet="facet"
                  @date-change="handleDateHistogramChange"
                />
              </div>
              <h4 v-if="!(facet.type === 'slider' || facet.type === 'histogram'|| facet.type === 'date_histogram' || facet.type === 'rangeInput')"
                class="facet-title"
              >
                {{ facet.name }}
              </h4>
              <div v-if="facet.type === 'datePicker'">
                <date-picker :facet="facet" :resetAll="resetAll" @updateDateRange="handleDateRangeUpdate"
                  class="mb-7" />
              </div>
              <div v-if="facet.type === 'colorPicker'">
                <color-picker :facet="facet" :selectedColors="selectedFilters" @colorSelected="handleColorSelection" />
              </div>
              <div v-if="facet.type === 'navigation'">
                <SideBarNavigation :item="facet" :parentName="facet.name" @onFilter="handleNavigationSelection" />
              </div>
              <div v-if="facet.type === 'search'" class="mb-2">
                <SearchFacet :facet="facet" :resetAll="resetAll" :activeValue="searchFacetValue(facet)"
                  @search-change="handleSearchFacetChange" />
              </div>
              <div v-if="facet.type === 'categorySelect'">
                <CategorySelectFacet :facet="facet" @category-select="handleCategorySelectChange" />
              </div>
              <div class="facet-values" v-if="!(facet.type === 'slider' || facet.type === 'histogram' || facet.type === 'date_histogram' || facet.type === 'colorPicker' || facet.type === 'search'|| facet.type === 'datePicker'|| facet.type === 'navigation' || facet.type === 'rangeInput' || facet.type === 'categorySelect' || isSubFacet(facet) )">
                <div v-if="facet.values.length && facet.showAll" class="mt-2 mb-2">
                  <v-text-field v-model="facet.searchQuery" label="Search filters" dense hide-details
                    append-inner-icon="mdi-magnify" variant="outlined" density="compact" class="search-input" />
                </div>
                <div v-for="(value, index) in filteredValues(facet)" :key="value.value + '-' + index">
                  <v-checkbox hide-details density="compact" class="smaller-checkbox facet-checkbox" type="checkbox" color="primary"
                    :data-filter-value="getCheckboxFilter(facet, value)" :value="getCheckboxFilter(facet, value)"
                    :model-value="selectedFilters" @update:model-value="checkBoxSelected"
                    :id="'filter-' + value.filter + '' + index" @change="chipsControle(facet, value)"
                    v-if="index < maxVisible || facet.showAll">
                    <template #label>
                      <label :for="'filter-' + value.filter" class="text-decoration-none grey--text text--darken-2">
                        <span class="facet-value">
                          <span class="facet-value__name">{{ value.value }}</span>
                          <span class="facet-value__count">{{ formatNumber(value.count) }}</span>
                        </span>
                      </label>
                    </template>
                  </v-checkbox>
                </div>
                <div v-if="facet.values.length > maxVisible" class="mt-1">
                  <v-btn color="primary" variant="text" size="small" class="px-1"
                    :append-icon="facet?.showAll ? 'mdi-chevron-up' : 'mdi-chevron-down'" @click="toggleShowAll(facet, $event)">
                    {{ facet?.showAll ? 'Show less' : `Show all ${facet.values.length}` }}
                  </v-btn>
                </div>
              </div>

              <SubFacet
                v-if="isSubFacet(facet) && facet.type !== 'navigation'"
                :facet="facet"
                v-model="selectedFilters"
                @chip="chipsControle"
              />

            </v-list-item>
            <div v-if="(hasPendingFilters && filterMode === 'apply') || chipsValues.length > 0" class="facet-actions">
              <v-btn v-if="hasPendingFilters && filterMode === 'apply'" block color="primary" prepend-icon="mdi-check"
                class="facet-apply" data-track-id="applyFilters" :loading="previewLoading"
                @click="applyFilters(true)">{{ previewTotal === null ? 'Apply filters' : `Show ${formatNumber(previewTotal)} results` }}</v-btn>
              <v-btn v-if="chipsValues.length > 0" block variant="text" color="primary"
                prepend-icon="mdi-filter-remove-outline" class="facet-reset-btn"
                @click="clearFilters()">Reset filters</v-btn>
            </div>
          </v-navigation-drawer>
          <v-navigation-drawer v-if="isFacetsLoading && !(facets && facets.length)" :width="290" :mobile-breakpoint="768"
            class="filters drawer pb-4" v-model="isSidebar" :class="{ open: !isSidebar }">
            <div v-for="(skeleton, index) in skeletonProducts.slice(0, 4)" :key="index" class="filter px-4 py-3">
              <v-skeleton-loader type="heading, list-item, list-item, list-item" class="bg-transparent"></v-skeleton-loader>
            </div>
          </v-navigation-drawer>
          <div class="box-content">
            <v-row>
              <v-col cols="12">
                <div class="d-flex flex-column">
                  <v-row>
                  <div class="chips-row" v-if="searchQuery || chipsValues.length">
                    <div class="sQuery" v-show="searchQuery" @click="clearSearchQuery">
                      <span class="chip-text">{{ searchQuery }}</span>
                      <v-tooltip v-if="searchQuery" activator="parent" location="top"> Query: {{ searchQuery }}
                      </v-tooltip>
                      <div v-if="searchQuery" class="clear-input justify-center " @click="clearSearchQuery">
                        <v-icon size="14">mdi-close</v-icon>
                      </div>
                    </div>
                    <div class="sQuery" v-for="(chip, index) in chipsValues" :key="index">
                      <span class="chip-text">{{ chip[Object.keys(chip)[0]] }}</span>
                      <v-tooltip activator="parent" location="top">{{ Object.keys(chip)[0] }} : {{
                        chip[Object.keys(chip)[0]] }}
                      </v-tooltip>
                      <div v-if="chip" class="clear-input justify-center" @click.stop="deleteChip(chip)">
                        <v-icon size="14">mdi-close</v-icon>
                      </div>
                    </div>
                    <v-btn v-if="chipsValues.length != 0" color="primary" variant="text" size="small"
                      @click="clearFilters()">Clear all</v-btn>
                  </div>
                    <v-col cols="12" class="col-auto">
                      <v-container :data-track-id="'zeroResultsContainer'"
                        v-if="hasLoadedProducts && ((products.length === 0 && selectedFilters.length != 0) || (products.length === 0 && searchQuery != '')) && !isProductsLoading"
                        class="d-flex align-center justify-center no-product-container">
                        <div class="text-center">
                          <div class="no-product-icon"><v-icon size="36">mdi-magnify-close</v-icon></div>
                          <p v-if="searchQuery" class="no-product-title">No results for “<span class="highlight">{{ searchQuery }}</span>”</p>
                          <p v-else class="no-product-title">No products match these filters</p>
                          <p class="no-product-text">{{ searchQuery ? 'Check the spelling, try a more general term or remove filters.' : 'Try removing some filters.' }}</p>
                          <v-btn v-if="searchQuery" color="primary" flat @click="clearSearchQuery(); clearFilters();">Reset search</v-btn>
                          <v-btn v-else color="primary" flat @click="clearFilters()">Reset filters</v-btn>
                        </div>
                      </v-container>
                      <v-data-iterator :items="showProductSkeleton ? skeletonProducts : products" hide-default-footer>
                        <!--  Here I have Products-->
                        <v-row class="products" :class="{ 'products--list': viewMode === 'list', 'products--stale': isProductsLoading && !showProductSkeleton }"
                          :aria-busy="isProductsLoading" style="min-height: 60vh;">
                          <v-col v-for="(product, index) in (showProductSkeleton ? skeletonProducts : products)"
                            :key="index" :cols="viewMode === 'list'
                                ? 12
                                : viewMode === 'gift'
                                  ? 12
                                  : 12
                              " :sm="viewMode === 'list'
                                ? 12
                                : viewMode === 'gift'
                                  ? 6
                                  : 6
                              " :md="viewMode === 'list'
                                ? 12
                                : viewMode === 'gift'
                                  ? 6
                                  : 6
                              " :lg="viewMode === 'list'
                                ? 12
                                : viewMode === 'gift'
                                  ? 6
                                  : 4
                              " :xl="viewMode === 'list'
                                ? 12
                                : viewMode === 'gift'
                                  ? 6
                                  : 3
                              ">
                            <v-skeleton-loader v-if="showProductSkeleton" class="product-skeleton"
                              type="image, article"></v-skeleton-loader>
                            <ProductCard v-else :product="product" :config="config"
                              :viewMode="viewMode" />
                          </v-col>
                        </v-row>
                        <template v-slot:footer>
                          <div v-if="products.length != 0 && pagingMode === 'infinite'" class="load-more">
                            <div :ref="setLoadMoreSentinel" class="load-more__sentinel"></div>
                            <p class="load-more__status">Showing {{ formatNumber(products.length) }} of {{ formatNumber(totalproducts) }}</p>
                            <v-progress-circular v-if="isLoadingMore" color="primary" :size="24" :width="2" indeterminate></v-progress-circular>
                            <v-btn v-else-if="currentPage < totalPages" variant="outlined" color="primary"
                              data-track-id="loadMore" @click="loadMore">Load more</v-btn>
                          </div>
                          <div v-if="products.length != 0 && pagingMode !== 'infinite'" class="results-footer">
                            <div class="records">
                              <span class="results-footer__label">Per page</span>
                              <v-select v-model="records" :items="showedRows" variant="outlined" density="compact"
                                item-title="name" :data-records-value="records" item-value="id" hide-details
                                class="records_input"></v-select>
                            </div>
                            <div class="pagination">
                              <v-btn :disabled="currentPage == 1" @click="handleClick" variant="outlined"
                                :data-pagination-id="currentPage" class="prev-pagination" icon="mdi-chevron-left"
                                size="small" aria-label="Previous page"></v-btn>
                              <span class="pagination__status">
                                Page <span>{{ currentPage }}</span> of {{ formatNumber(totalPages) }}
                              </span>
                              <v-btn :disabled="currentPage == totalPages" @click="myhandleClick" variant="outlined"
                                :data-pagination-id="currentPage" class="next-pagination" icon="mdi-chevron-right"
                                size="small" aria-label="Next page"></v-btn>
                            </div>
                          </div>
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
  </div>
</template>
<script>

import { replacePlaceholders, keepInPlace } from '@/utils';
import { getBasePath } from '@/services/configLoader';
import HistogramSlider from "@/components/HistogramSlider.vue";
import DateHistogramSlider from "@/components/DateHistogramSlider.vue";
import SideBarNavigation from "@/components/SideBarNavigation.vue";
import ProductCard from "@/components/ProductCard.vue";
import PriceSlider from "@/components/PriceSlider.vue";
import ColorPicker from "@/components/ColorPicker.vue";
import DatePicker from "@/components/DatePicker.vue";
import RangeInput from "@/components/RangeInput.vue";
import SubFacet from "@/components/subfacet.vue";
import SearchFacet from "@/components/SearchFacet.vue";
import CategorySelectFacet from "@/components/CategorySelectFacet.vue";
import {mapGetters, mapState, mapActions } from 'vuex';
import { useDisplay } from 'vuetify'
import axios from "axios";
export default {
  components: {HistogramSlider,DateHistogramSlider,ColorPicker,DatePicker,PriceSlider,ProductCard,RangeInput,SideBarNavigation,SubFacet,SearchFacet,CategorySelectFacet},
  data() {
    return {
      localSearchQuery: "",
      products: [],
      totalproducts: "",
      responseTime: "",
      hasLoadedProducts: false,
      selectedFilters: [],
      facets: [],
      sorts: [],
      resetAll: false,
      expandedPanels: [],
      skeletonProducts: Array(24).fill({}),
      showedRows: [
        { id: 24, name: '24 records' },
        { id: 48, name: '48 records' },
        { id: 72, name: '72 records' },
        { id: 96, name: '96 records' },
      ],
      records: '24',
      selectedSort: "",
      selectedRow: "",
      chipsValues: [],
      currentPage: 1,
      isSidebar: false,
      requestVersion: 0,
      isWatchDisabled: false,
      appliedFiltersKey: '',
      applyFiltersNow: false,
      drawerMaxHeight: null,
      previewTotal: null,
      facetsRenderKey: 0,
      isLoadingMore: false,
      appendNextPage: false,
      previewLoading: false,
      previewVersion: 0,
      isNewQuery: false,
      isSearchQueryChanged: false,
      isSortChange: false,
      viewMode: "grid",
      totalPages: "",
      maxVisible: 5,
      spellCorrection: null,
      spellcheckDisabledQuery: null,
    };
  },
  props: {
    config: { type: Object, required: true },
    filter: { type: Object },
    bottomFilter: { type: Boolean },
    triggerSearch: {
      type: Boolean,
      required: true,
    },
  },
  setup() {
    const display = useDisplay()
    return { display }
  },
  computed: {
    navigationFacet() {
      return this.facets.find(facet => facet.type === 'navigation') || null;
    },
    // path of the selected category (top down) for the breadcrumb above the results
    categoryTrail() {
      const childrenOf = node => node?.children?.values || [];
      const onPath = node => node.selected === true || node.tempSelected === true;
      let level = this.navigationFacet?.values || [];
      // a single shop root (e.g. "LiveDE") is not shown, like in the category menu
      while (level.length === 1 && childrenOf(level[0]).length && !level[0].selected) {
        level = childrenOf(level[0]);
      }
      const trail = [];
      let node = level.find(onPath);
      while (node) {
        trail.push(node);
        if (node.selected) break;
        node = childrenOf(node).find(onPath);
      }
      return trail;
    },
    ...mapState(['requestId', 'userId', 'sessionId', 'searchQuery', 'pagingMode', 'filterMode']),
    ...mapGetters(['isProductsLoading', 'isFacetsLoading']),
    // Facet selections are collected and only searched on "Apply filters".
    hasPendingFilters() {
      return this.filtersKey(this.selectedFilters) !== this.appliedFiltersKey;
    },
    // Skeletons only on the very first load; later loads keep the old results dimmed.
    showProductSkeleton() {
      return this.isProductsLoading && this.products.length === 0;
    },
    drawerStyle() {
      return this.drawerMaxHeight ? { '--drawer-max-h': this.drawerMaxHeight } : {};
    },
  },
  created() {
    window.addEventListener("scroll", this.handleScroll, { passive: true });
    window.addEventListener("resize", this.handleScroll);
    const localUrl = getBasePath(this.config, this.$route);
    if (window.location.pathname != localUrl) {
      const newUrl = new URL(window.location.href);
      newUrl.pathname = localUrl;
      window.history.replaceState({}, '', newUrl);
    }
  },
  unmounted() {
    window.removeEventListener("scroll", this.handleScroll);
    window.removeEventListener("resize", this.handleScroll);
    this.loadMoreObserver?.disconnect();
  },
  mounted() {
    if (this.config.rows) {
      this.showedRows = this.config.rows;
      this.selectedRow = this.config.rows[0].id;
    }
    this.localSearchQuery = this.searchQuery
    this.startProductsLoading();
    this.startFacetsLoading();
    this.fetchProducts();
  },
  watch: {
    filter: {
      handler(newVal) {
        if (newVal.filter) {
          const newFilter = newVal.filter;
          const existingIndex = this.selectedFilters.findIndex(f => (f === newFilter));
          this.clearFilters();
          if (existingIndex === -1) {
            this.chipsValues.push({
              [newVal.fullPath]: newVal.name,
              filter: newFilter
            });
            this.selectedFilters.push(newFilter);
          }
        }
      },
      deep: true,
      immediate: true
    },
    searchQuery(newVal) {
      if (newVal !== this.spellcheckDisabledQuery) {
        this.spellcheckDisabledQuery = null;
      }
      if (this.localSearchQuery != newVal) {
        this.isSearchQueryChanged = true;
        this.localSearchQuery = newVal;
        this.clearFilters();
        this.currentPage = 1;
      }
    },
    triggerSearch() {
      this.fetchProducts();
    },
    bottomFilter(newVal) {
      if (newVal) {
        if (this.selectedFilters.length > 0)
          this.clearFilters();
        this.currentPage = 1;
        this.selectedSort = "";
        this.$emit("onFilter");
      }
    },
    localSearchQuery(newVal) {
      if (newVal && newVal != this.searchQuery)
        this.setSearchQuery(newVal);
    },
    selectedFilters() {
      if (this.isSortChange) {
        this.isSortChange = false;
      }
      if (this.isWatchDisabled) {
        return;
      }
      // Chips, reset, navigation and a new query always search right away. Checkbox,
      // color, slider etc. search after a short pause ("instant") or only stage the
      // selection until "Apply" ("apply" mode, with live counts as preview).
      if (this.applyFiltersNow) {
        this.applyFiltersNow = false;
        this.applyFilters();
      } else if (this.filterMode === 'instant') {
        if (this.hasPendingFilters) this.scheduleApply();
      } else if (this.hasPendingFilters) {
        this.schedulePreview();
      } else {
        this.previewVersion++;
        clearTimeout(this.previewTimer);
        this.previewTotal = null;
        this.previewLoading = false;
      }
    },
    facets() {
      this.$nextTick(this.handleScroll);
    },
    filterMode() {
      if (this.hasPendingFilters) this.applyFilters();
    },
    pagingMode() {
      this.currentPage = 1;
      this.startProductsLoading();
      this.fetchProducts();
    },
    selectedSort(newVal) {
      if (this.isSortChange) {
        this.isSortChange = false;
        return;
      }
      if (newVal && this.sorts.length > 0 && !this.resetAll) {
        this.currentPage = 1;
        this.startProductsLoading();
        this.isNewQuery = true;
        this.fetchProducts();
      }
    },
    records(newVal) {
      if (newVal && newVal != this.selectedRow) {
        this.startProductsLoading();
        this.selectedRow = newVal
        this.isNewQuery = true;
        this.fetchProducts();
      }
    },
    selectedRow(newVal) {
      if (newVal) {
        this.records = newVal
      }
    },
    config(newVal) {
      if (newVal) {
        this.hasLoadedProducts = false;
        this.startProductsLoading();
        this.fetchProducts();
      }
    },
  },

  methods: {
    ...mapActions(['setRequestId', 'startProductsLoading', 'startFacetsLoading', 'stopProductsLoading', 'stopFacetsLoading', 'showGlobalSheet', 'setSearchQuery']),
    chipsControle(facet, value) {
      const filterValue = this.getCheckboxFilter(facet, value);
      const chipIndex = this.chipsValues.findIndex(chip =>
        chip[facet.name] === this.chipLabel(facet, value)
      );
      if (chipIndex !== -1) {
        // Remove the chip if it exists
        this.chipsValues.splice(chipIndex, 1);
        // Remove the corresponding filter from selectedFilters
        const filterIndex = this.selectedFilters.indexOf(filterValue);
        if (filterIndex !== -1) {
          this.selectedFilters = [
            ...this.selectedFilters.slice(0, filterIndex),
            ...this.selectedFilters.slice(filterIndex + 1)
          ];
        }
      } else {
        // Add a new chip if it doesn't exist
        this.chipsValues.push({
          [facet.name]: this.chipLabel(facet, value),
          filter: value.filter
        });
      }
    },
    initializeSelectedFilters() {
      this.isWatchDisabled = true;

      const preselectedFilters = this.facets
        .map(facet => ({
          name: facet.name,
          values: Array.isArray(this.filteredValues(facet))
            ? this.filteredValues(facet).filter(value => value.selected)
            : [],
        }))
        .filter(facet => facet.values.length > 0);

      preselectedFilters.forEach(facet => {
        facet.values.forEach(value => {
          const existingChip = this.chipsValues.find(
            chip => chip.filter === value.filter
          );

          if (!existingChip) {
            this.chipsValues.push({
              [facet.name]: this.chipLabel(facet, value),
              filter: value.filter,
            });
          }
        });
      });

      const serverSelected = preselectedFilters.flatMap(facet => facet.values.map(value => value.filter));
      this.selectedFilters = [...new Set([...this.selectedFilters, ...serverSelected])];
      // filters the server reports as selected are already applied
      const applied = this.appliedFiltersKey ? this.appliedFiltersKey.split('&') : [];
      this.appliedFiltersKey = this.filtersKey([...new Set([...applied, ...serverSelected])]);

      this.$nextTick(() => {
        this.isWatchDisabled = false;
      });
    },

    isSubFacet(facet){
      return facet.values != undefined && facet.values.some(value => value.children);
    },

    filteredValues(facet) {
      // Filter the facet values based on the search query
      if (!facet.searchQuery || !facet.searchQuery.trim()) return facet.values;
      return facet.values.filter(value =>
        value.value.toLowerCase().includes(facet.searchQuery.toLowerCase())
      );
    },
    toggleShowAll(facet, event) {
      // only collapsing needs the anchor: expanding grows below the button and must not scroll
      keepInPlace(facet.showAll ? event?.currentTarget : null, () => {
        facet.showAll = !facet.showAll;
        if (!facet.showAll) {
          facet.searchQuery = '';
        }
        return this.$nextTick();
      });
    },
    deleteChip(chip) {
      this.applyFiltersNow = true;
      const treeMatch = (chip.filter || '').match(/^(.+)Tree(\d+)=/);
      if (treeMatch) {
        this.dropDeeperLevels(`${treeMatch[1]}Tree${treeMatch[2]}`, parseInt(treeMatch[2], 10));
        return;
      }
      const chipIndex = this.chipsValues.findIndex(ch =>
        ch.filter === chip.filter
      );
      // If chip exists, remove it
      if (chipIndex !== -1) {
        this.selectedFilters = this.selectedFilters.filter(item => {
          // Filter out both range-based filters and exact matches
          return !item.startsWith(chip.filter + '.range=') && !item.startsWith(chip.filter + '.daterange=') && !item.startsWith(chip.filter + '=') && item !== chip.filter;
        });
        const expandedPanelIndex = this.expandedPanels.findIndex(panel => panel.filter === chip.filter);        // If we find a matching key in expandedPanels, remove it
        if (expandedPanelIndex !== -1) {
          const newExpandedPanels = [...this.expandedPanels];
          newExpandedPanels.splice(expandedPanelIndex, 1);
          // Remove the panel
          this.expandedPanels = newExpandedPanels;  // Update the expandedPanels
        }
        this.chipsValues.splice(chipIndex, 1);
      }
    },
    markTempSelected(node) {
      // Create a copy of the node to avoid modifying the original object
      const newNode = { ...node };
      let hasSelectedChild = false;
      // Check root-level values
      if (newNode.values && newNode.values.length > 0) {
        newNode.values = newNode.values.map(child => {
          const childNewNode = this.markTempSelected(child);
          // Check if any child has the tempSelected flag or the selected property
          if (childNewNode.tempSelected || ('selected' in childNewNode && childNewNode.selected)) {
            hasSelectedChild = true;
          }
          return childNewNode;
        });
      }
      // Check if the node has children and handle them
      if (newNode.children && newNode.children.values && newNode.children.values.length > 0) {
        newNode.children.values = newNode.children.values.map(child => {
          const childNewNode = this.markTempSelected(child);
          // Check if any child has the tempSelected flag or the selected property
          if (childNewNode.tempSelected || ('selected' in childNewNode && childNewNode.selected)) {
            hasSelectedChild = true;
          }
          return childNewNode;
        });
      }
      // Assign tempSelected to the parent node if any child is selected
      if (hasSelectedChild && !newNode.selected) {
        newNode.tempSelected = true;
      }
      // Return the new facet object
      return newNode;
    },
    handleDateRangeUpdate(filter, chip, facet) {
      this.selectedFilters = this.selectedFilters.filter(item => !item.startsWith(facet.filterName));
      this.selectedFilters.push(filter);
      const existingChipIndex = this.chipsValues.findIndex(chip => Object.hasOwn(chip, facet.name));
      if (existingChipIndex !== -1) {
        this.chipsValues[existingChipIndex][facet.name] = chip;
        this.chipsValues[existingChipIndex].filter = facet.filterName;
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
    searchFacetValue(facet) {
      const chip = this.chipsValues.find(chip => chip.filter === facet.filterName);
      return chip ? chip[facet.name] : '';
    },
    handleSearchFacetChange({ facet, value }) {
      this.selectedFilters = this.selectedFilters.filter(item => !item.startsWith(facet.filterName + '='));
      const chipIndex = this.chipsValues.findIndex(chip => chip.filter === facet.filterName);
      if (chipIndex !== -1) {
        this.chipsValues.splice(chipIndex, 1);
      }
      if (value) {
        this.selectedFilters.push(`${facet.filterName}=${encodeURIComponent(value)}`);
        this.chipsValues.push({ [facet.name]: value, filter: facet.filterName });
      }
    },
    dropDeeperLevels(facetId, fromLevel) {
      const baseId = facetId.replace(/Tree\d+$/, '');
      const isSameOrDeeper = (str) => {
        const match = str.match(new RegExp(`^${baseId}Tree(\\d+)=`));
        return match !== null && parseInt(match[1], 10) >= fromLevel;
      };
      this.selectedFilters = this.selectedFilters.filter(item => !isSameOrDeeper(item));
      this.chipsValues = this.chipsValues.filter(chip => !isSameOrDeeper(chip.filter || ''));
    },
    handleCategorySelectChange({ facet, filter }) {
      const level = parseInt(facet.id.match(/Tree(\d+)$/)?.[1] ?? '0', 10);
      this.dropDeeperLevels(facet.id, level);
      if (filter) {
        this.selectedFilters.push(filter);
        const selectedValue = facet.values.find(value => value.filter === filter);
        this.chipsValues.push({ [facet.name]: selectedValue ? selectedValue.value : filter, filter });
      }
    },
    handleNavigationSelection(event) {
      this.applyFiltersNow = true;
      const newFilter = event.filter;
      const filterPrefix = newFilter.split('=')[0];
      const existingIndex = this.selectedFilters.findIndex(f => f.startsWith(filterPrefix));
      const chipIndex = this.chipsValues.findIndex(chip => chip.filter.startsWith(filterPrefix));
      if (existingIndex !== -1) {
        if (this.selectedFilters[existingIndex] === newFilter) {
          this.selectedFilters.splice(existingIndex, 1);
          this.chipsValues.splice(chipIndex, 1);
        } else {
          this.selectedFilters.splice(existingIndex, 1, newFilter);
          let newChip = {
            [event.fullPath]: event.value,
            filter: newFilter
          };
          this.selectedFilters.splice(existingIndex, 1, newFilter);
          this.chipsValues.splice(chipIndex, 1, newChip);
        }
      } else {
        this.selectedFilters.push(newFilter);
        this.chipsValues.push({ [event.fullPath]: event.value, filter: event.filter });
      }
      this.selectedFilters = [...this.selectedFilters];
    },
    selectCategory(index) {
      const trail = this.categoryTrail;
      const fullPath = [this.navigationFacet.name, ...trail.slice(0, index).map(node => node.value)].join(' : ');
      this.handleNavigationSelection({ ...trail[index], fullPath });
    },
    // "All products" drops the query (which also drops the filters) or, without one, the category
    showAllProducts() {
      if (this.localSearchQuery) this.clearSearchQuery();
      else this.clearCategory();
    },
    clearCategory() {
      const prefix = this.categoryTrail[0].filter.split('=')[0] + '=';
      this.applyFiltersNow = true;
      this.selectedFilters = this.selectedFilters.filter(filter => !filter.startsWith(prefix));
      this.chipsValues = this.chipsValues.filter(chip => !(chip.filter || '').startsWith(prefix));
    },
    // "Yes" alone says nothing in the chip row, so boolean chips carry the facet name.
    chipLabel(facet, value) {
      if (facet.type !== 'boolean') return value.value;
      return value.value === 'Yes' ? facet.name : `${facet.name}: ${value.value}`;
    },
    // Empty attribute values ("-") are noise in the demo data; boolean values read as Yes/No.
    cleanFacetValues(facet) {
      if (!Array.isArray(facet.values) || ['navigation', 'histogram', 'date_histogram', 'slider'].includes(facet.type)) {
        return;
      }
      facet.values = facet.values.filter(value => typeof value.value !== 'string' || !['', '-'].includes(value.value.trim()));
      facet.values.forEach(value => {
        if (value.children && Array.isArray(value.children.values)) {
          this.cleanFacetValues(value.children);
        }
      });
      // numericUnit facets filter on zero-padded sortable values ("f.hoehe=00000000000100.0%20mm"):
      // show them by size, not by frequency or string order
      const sortable = facet.values.map(value => {
        const match = typeof value.filter === 'string' && value.filter.match(/=(\d{10,}(?:\.\d+)?)(?:%20|\s|$)/);
        return match ? Number(match[1]) : null;
      });
      if (facet.values.length > 1 && sortable.every(number => number !== null)) {
        const order = new Map(facet.values.map((value, i) => [value, sortable[i]]));
        facet.values.sort((a, b) => order.get(a) - order.get(b));
      }
      if (facet.type === 'boolean') {
        const labels = { true: 'Yes', false: 'No' };
        facet.values.forEach(value => {
          value.value = labels[String(value.value)] ?? value.value;
        });
        facet.values.sort((a, b) => (a.value === 'Yes' ? -1 : b.value === 'Yes' ? 1 : 0));
      }
    },
    // A few extreme values (e.g. 4.8 km wide) squash the histogram into one bar: show the buckets
    // that hold 99 % of the products; the right handle then means "no upper limit".
    capHistogramOutliers(facet) {
      const values = facet.values || [];
      const total = values.reduce((sum, value) => sum + value.count, 0);
      if (values.length < 10 || !total) {
        return;
      }
      let cumulative = 0;
      let lastIndex = values.length - 1;
      for (let i = 0; i < values.length; i++) {
        cumulative += values[i].count;
        if (cumulative >= total * 0.99) {
          lastIndex = i;
          break;
        }
      }
      if (lastIndex >= values.length - 2) {
        return;
      }
      const step = values.length > 1 ? values[1].value - values[0].value : 0;
      facet.uncappedMax = facet.maxRange;
      facet.values = values.slice(0, lastIndex + 1);
      facet.maxRange = values[lastIndex].value + step;
      if (facet.maxValue != null) {
        facet.maxValue = Math.min(facet.maxValue, facet.maxRange);
      }
    },
    initializeFacetData(facet) {
      if (facet.minValue != null && facet.maxValue != null) {
        facet.sliderValues = [
          facet.minValue,
          facet.maxValue
        ];
      } else {
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
    handleDateHistogramChange(filter) {
      // filter.sliderValues sind Millisekunden -> für die Query nach ISO zurück.
      // Backend erwartet: <filterName>.daterange=<minISO>,<maxISO>
      if (filter.sliderValues[0] != null && filter.sliderValues[1] != null) {
        this.selectedFilters = this.selectedFilters.filter(item => !item.startsWith(filter.filterName + '.daterange='));
        const existingChipIndex = this.chipsValues.findIndex(chip => Object.hasOwn(chip, filter.name));
        const isFullRange = filter.sliderValues[0] === filter.minPrice && filter.sliderValues[1] === filter.maxPrice;
        if (!isFullRange) {
          const minIso = new Date(filter.sliderValues[0]).toISOString();
          const maxIso = new Date(filter.sliderValues[1]).toISOString();
          let filterValue = filter.filterName + '.daterange=' + minIso + ',' + maxIso;
          let chipValue = new Date(filter.sliderValues[0]).toLocaleDateString('de-DE')
            + ' - ' + new Date(filter.sliderValues[1]).toLocaleDateString('de-DE');
          this.selectedFilters.push(filterValue);
          if (existingChipIndex !== -1) {
            this.chipsValues[existingChipIndex][filter.name] = chipValue;
            this.chipsValues[existingChipIndex].filter = filter.filterName;
          } else {
            this.chipsValues.push({ [filter.name]: chipValue, filter: filter.filterName });
          }
        } else if (existingChipIndex !== -1) {
          this.chipsValues.splice(existingChipIndex, 1);
        }
      }
    },
    handlePriceChange(filter) {
      if (filter.sliderValues[0] != null && filter.sliderValues[1] != null) {
        const [min, max] = filter.sliderValues;
        this.selectedFilters = this.selectedFilters.filter(item => !item.startsWith(filter.filterName + '.range='));
        const existingRangeChip = this.chipsValues.findIndex(chip => Object.hasOwn(chip, filter.name));
        if (min <= filter.minPrice && max >= filter.maxPrice) {
          // full range = no filter
          if (existingRangeChip !== -1) this.chipsValues.splice(existingRangeChip, 1);
          return;
        }
        const capped = filter.uncappedMax != null && max >= filter.maxPrice;
        const upper = capped ? filter.uncappedMax : max;
        const unit = filter.unit ? ' ' + filter.unit : '';
        let filterValue = filter.filterName + '.range=' + min + ',' + upper
        let chipValue = capped ? '≥ ' + min + unit : min + ' - ' + max + unit
        this.selectedFilters.push(filterValue)
        if (existingRangeChip !== -1) {
          this.chipsValues[existingRangeChip][filter.name] = chipValue;
          this.chipsValues[existingRangeChip].filter = filter.filterName;
        } else {
          this.chipsValues.push({ [filter.name]: chipValue, filter: filter.filterName });
        }
      } else {
        filter.sliderValues[0] = filter.minPrice;
        filter.sliderValues[1] = filter.maxPrice;
      }
    },
    handlePriceRangeChange(filter) {
      if (filter.MinRange != null && filter.MaxRange != null) {
        let filterValue = filter.filterName + '.range=' + filter.MinRange + ',' + filter.MaxRange
        let chipValue = filter.MinRange + ' - ' + filter.MaxRange + ' ' + filter.unit
        this.selectedFilters = this.selectedFilters.filter(item => !item.startsWith(filter.filterName + '.range='));
        this.selectedFilters.push(filterValue)
        const existingChipIndex = this.chipsValues.findIndex(chip => Object.hasOwn(chip, filter.name));
        if (existingChipIndex !== -1) {
          this.chipsValues[existingChipIndex][filter.name] = chipValue;
          this.chipsValues[existingChipIndex].filter = filter.filterName;
        } else {
          this.chipsValues.push({ [filter.name]: chipValue, filter: filter.filterName });
        }
      }
    },
    getCheckboxFilter(facet, value) {
      const filter = value.filter;
      if (filter && typeof filter === "object" &&
        filter.minValue != null && filter.maxValue != null) {
        const range = encodeURIComponent(`${filter.minValue},${filter.maxValue}`);
        const filterType = facet.type === "date_histogram" ? "daterange" : "range";
        return `${facet.filterName}.${filterType}=${range}`;
      }
      return filter;
    },
    formatNumber(value) {
      const number = Number(value);
      return Number.isFinite(number) && value !== '' ? number.toLocaleString('en-US') : value;
    },
    prepareFacets(facets, previous = []) {
      return facets.map((facet) => {
        this.cleanFacetValues(facet);
        if (facet.type === 'histogram') {
          this.capHistogramOutliers(facet);
        }
        if (facet.type === 'slider' || facet.type === 'histogram') {
          this.initializeFacetData(facet);
        }
        // date_histogram: DateHistogramSlider initializes itself (created()) and needs
        // value.filter as an object, so pass it on unchanged
        const prepared = facet.type === 'navigation' ? this.markTempSelected(facet) : facet;
        const old = previous.find(f => f.id === prepared.id);
        prepared.showAll = old ? old.showAll : false;
        prepared.searchQuery = old ? old.searchQuery : '';
        return prepared;
      });
    },
    buildSearchUrl({ tracking = true } = {}) {
      const queryParameters = [];
      if (this.searchQuery) {
        queryParameters.push(`q=${this.searchQuery}`);
      }
      if (tracking) {
        if (this.userId) queryParameters.push(`userId=${this.userId}`);
        if (this.sessionId) queryParameters.push(`sessionId=${this.sessionId}`);
        if (this.requestId) queryParameters.push(`requestId=${this.requestId}`);
      }
      if (this.selectedFilters.length) {
        queryParameters.push(this.selectedFilters.join("&"));
      }
      const apiUrl = this.config.baseurl;
      const queryString = queryParameters.join("&");
      return apiUrl.includes("?") ? `${apiUrl}&${queryString}` : `${apiUrl}?${queryString}`;
    },
    schedulePreview() {
      // Staged filters: refresh facet counts and the hit count in the background,
      // the product list only changes on "Apply".
      this.previewTotal = null;
      this.previewLoading = true;
      clearTimeout(this.previewTimer);
      this.previewTimer = setTimeout(this.fetchPreview, 120);
    },
    fetchPreview() {
      const version = ++this.previewVersion;
      const key = this.filtersKey(this.selectedFilters);
      const url = this.buildSearchUrl({ tracking: false });
      axios.get(`${url}&rows=1`)
        .then(response => {
          if (version !== this.previewVersion || key !== this.filtersKey(this.selectedFilters) || !this.hasPendingFilters) {
            return;
          }
          this.previewLoading = false;
          const result = response.data.result[this.config.resultSetId];
          this.previewTotal = result.total;
          this.facets = this.prepareFacets(result.facets, this.facets);
        })
        .catch(() => {
          if (version === this.previewVersion) {
            this.previewTotal = null;
            this.previewLoading = false;
          }
        });
    },
    filtersKey(filters) {
      return [...filters].sort().join('&');
    },
    scheduleApply() {
      // short pause so several quick clicks become one search
      clearTimeout(this.applyTimer);
      this.applyTimer = setTimeout(() => {
        if (this.hasPendingFilters) this.applyFilters();
      }, 80);
    },
    applyFilters(closeDrawer = false) {
      if (this.isSearchQueryChanged)
        this.isSearchQueryChanged = false;
      else
        this.isNewQuery = true;
      if (closeDrawer && this.display.width.value < 768) {
        this.isSidebar = false;
      }
      this.scrollToTop();
      this.currentPage = 1;
      this.startProductsLoading();
      this.fetchProducts();
    },
    handleScroll() {
      // Sticky drawer: fit its height to the visible part below its current top,
      // so the last facets stay reachable before the drawer sticks.
      if (this.scrollFrame) return;
      this.scrollFrame = requestAnimationFrame(() => {
        this.scrollFrame = null;
        const drawer = this.$el?.querySelector?.('.drawer');
        if (!drawer) return;
        const appBar = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--app-bar-h')) || 72;
        const top = Math.max(drawer.getBoundingClientRect().top, appBar + 16);
        this.drawerMaxHeight = Math.max(240, Math.floor(window.innerHeight - top - 16)) + 'px';
      });
    },
    checkBoxSelected(filters) {
      this.selectedFilters = filters;
    },
    fetchProducts() {
      const requestVersion = ++this.requestVersion;
      const append = this.appendNextPage;
      this.appendNextPage = false;
      if (!append) {
        this.isLoadingMore = false;
      }
      const requestQuery = this.searchQuery;
      const selectedFilters = this.selectedFilters.join("&");
      this.appliedFiltersKey = this.filtersKey(this.selectedFilters);
      this.previewVersion++;
      clearTimeout(this.previewTimer);
      clearTimeout(this.applyTimer);
      this.previewTotal = null;
      this.previewLoading = false;

      const selectedRow = this.selectedRow;
      const apiUrl = this.config.baseurl;

      const queryParameters = [];

      const ctrl = [];
      if (this.isNewQuery) {
        ctrl.push('userModified');
        this.isNewQuery = false;
      }
      const spellcheckDisabled = !!this.spellcheckDisabledQuery && this.spellcheckDisabledQuery === this.searchQuery;
      if (spellcheckDisabled) {
        ctrl.push('spellcheckDisabled');
      }
      if (ctrl.length) {
        queryParameters.push(`ctrl=${ctrl.join(',')}`);
      }
      if (this.searchQuery) {
        queryParameters.push(`q=${this.searchQuery}`);
      }
      if (this.userId) {
        queryParameters.push(`userId=${this.userId}`);
      }
      if (this.sessionId) {
        queryParameters.push(`sessionId=${this.sessionId}`);
      }
      if (this.requestId) {
        queryParameters.push(`requestId=${this.requestId}`);
      }
      if (selectedFilters) {
        queryParameters.push(selectedFilters);
      }

      if (this.selectedSort && this.sorts.length > 0 && this.selectedSort !== this.sorts[0]?.id) {
        queryParameters.push(`sort=${this.selectedSort}`);
      }

      if (selectedRow) {
        queryParameters.push(`rows=${selectedRow}`);
      }
      if (this.currentPage) {
        queryParameters.push(`page=${this.currentPage}`);
      }
      //queryParameters.push("ctrl=loadMoreFacets");
      const queryString = queryParameters.join("&");
      const apiUrlWithQuery = apiUrl.includes("?")
        ? `${apiUrl}&${queryString}`
        : `${apiUrl}?${queryString}`;
      axios
        .get(apiUrlWithQuery)
        .then(response => {
          if (requestVersion !== this.requestVersion) {
            return;
          }
          const didYouMean = response.data.didYouMeanResult;
          if (!spellcheckDisabled && didYouMean && (didYouMean.type === 'corrected' || didYouMean.type === 'didYouMean')
              && didYouMean.corrected && didYouMean.corrected !== didYouMean.original) {
            this.spellCorrection = {
              type: didYouMean.type,
              original: didYouMean.original,
              corrected: didYouMean.corrected
            };
            if (didYouMean.type === 'corrected') {
              this.localSearchQuery = didYouMean.corrected;
              this.setSearchQuery(didYouMean.corrected);
              // Older search pipelines swallow the restart and return the hits of the
              // misspelled query (0) - search the corrected query once more in that case.
              if (response.data.result[this.config.resultSetId].total === 0) {
                this.fetchProducts();
                return;
              }
            }
          } else if (!this.spellCorrection || this.spellCorrection.type !== 'corrected'
              || this.spellCorrection.corrected !== requestQuery) {
            this.spellCorrection = null;
          }
          const products = response.data.result[this.config.resultSetId].documents;
          const mappedProducts = products.map(product => {
            const originalDocument = { ...product.document };
            let updatedDocument = {};
            // Replace placeholders for each key in the config.document
            Object.keys(this.config.document).forEach(key => {
              let pattern = this.config.document[key];
              if (pattern.includes('${')) {
                // placeholders ${variable}
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
          if (append) {
            // endless scroll: keep list, facets and sorting, only add the next page
            this.products = [...this.products, ...mappedProducts];
            this.totalproducts = response.data.result[this.config.resultSetId].total;
            this.totalPages = response.data.result[this.config.resultSetId].paging.pageCount;
            this.isLoadingMore = false;
            this.$nextTick(this.checkLoadMoreVisible);
            return;
          }
          this.products = mappedProducts;
          this.hasLoadedProducts = true;
          this.totalproducts = response.data.result[this.config.resultSetId].total;
          this.responseTime = ((response.data.time) / 1000).toFixed(2);
          if (this.isFacetsLoading) {
            // facets were reset (new query / reset filters): remount so sliders start fresh
            this.facetsRenderKey++;
          }
          this.facets = this.prepareFacets(response.data.result[this.config.resultSetId].facets);
          // QSC omits the sort block when category facets (facetCategoryConfig) apply: keep the known sorts then
          const responseSorts = response.data.result[this.config.resultSetId].sort?.sort;
          if (responseSorts?.length) this.sorts = responseSorts;
          if (responseSorts?.length) {
            const selectedSort = this.sorts.find(sort => sort.selected);
            // the select uses item-value="id" and the API expects the id as sort param
            const sortId = selectedSort ? selectedSort.id : this.sorts[0].id;
            if (sortId !== this.selectedSort) {
              // programmatic update: the watcher must not trigger another search
              this.isSortChange = true;
              this.selectedSort = sortId;
            }
          }
          this.totalPages = response.data.result[this.config.resultSetId].paging.pageCount;
          this.selectedRow = response.data.result[this.config.resultSetId].paging.rows;
          if (!this.requestId)
            this.setRequestId(response.data.requestId);

          if (this.facets && this.facets.length)
            this.initializeSelectedFilters();

          this.stopProductsLoading(); // Stop loading
          this.stopFacetsLoading();
        })
        .catch((error) => {
          if (requestVersion !== this.requestVersion) {
            return;
          }
          console.error('Search failed', error);
          if (append) {
            // failed page load: step back, the "Load more" button allows a retry
            this.currentPage -= 1;
            this.isLoadingMore = false;
            return;
          }
          this.showGlobalSheet();
        })
    },
    setLoadMoreSentinel(el) {
      if (el === this.loadMoreSentinel) return;
      this.loadMoreObserver?.disconnect();
      this.loadMoreSentinel = el;
      if (!el || typeof IntersectionObserver === 'undefined') return;
      this.loadMoreObserver = new IntersectionObserver(entries => {
        if (entries.some(entry => entry.isIntersecting)) this.loadMore();
      }, { rootMargin: '600px 0px' });
      this.loadMoreObserver.observe(el);
    },
    checkLoadMoreVisible() {
      // the observer only fires on changes; load on if the sentinel is still in view
      const el = this.loadMoreSentinel;
      if (el && el.getBoundingClientRect().top < window.innerHeight + 600) this.loadMore();
    },
    loadMore() {
      if (this.pagingMode !== 'infinite' || this.isLoadingMore || this.isProductsLoading
        || this.currentPage >= this.totalPages) {
        return;
      }
      this.isLoadingMore = true;
      this.appendNextPage = true;
      this.currentPage += 1;
      this.isNewQuery = true;
      this.fetchProducts();
    },
    nextPage() {
      if (this.currentPage + 1 <= this.totalPages) this.currentPage += 1;
      this.startProductsLoading();
      this.isNewQuery = true;
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
      this.isNewQuery = true;
      this.fetchProducts();
    },
    scrollToTop() {
      if (window.scrollY > 0) {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    },
    clearFilters() {
      this.applyFiltersNow = true;
      this.startFacetsLoading();
      this.selectedFilters = [];
      this.resetAll = true;
      this.isNewQuery = false;
      this.chipsValues = [];
      this.expandedPanels = [];
      setTimeout(() => {
        this.resetAll = false;
      }, 200);

    },
    clearSearchQuery() {
      this.startFacetsLoading();
      this.localSearchQuery = "";
      this.setSearchQuery(this.localSearchQuery);
    },
    searchSuggestion(query) {
      this.startProductsLoading();
      this.setSearchQuery(query);
    },
    searchWithoutSpellcheck(query) {
      this.spellcheckDisabledQuery = query;
      this.spellCorrection = null;
      this.startProductsLoading();
      this.setSearchQuery(query);
    }
  }
};
</script>
<style>
.page-content {
  padding-top: calc(var(--app-bar-h, 72px) + 20px);
  padding-bottom: 48px;
  min-height: 100vh;
}

/* ---------- results header ---------- */
.results-header {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 16px;
  padding: 8px 0 18px;
  border-bottom: 1px solid var(--qs-border);
}
.category-trail {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 2px;
  margin-bottom: 6px;
  font-size: 13px;
  color: var(--qs-muted);
}
.category-trail__link {
  color: inherit;
  text-decoration: none;
  border-radius: 4px;
}
.category-trail__link:hover {
  color: rgb(var(--v-theme-primary));
  text-decoration: underline;
}
.category-trail__sep {
  opacity: 0.5;
}
.category-trail__current {
  font-weight: 600;
  color: rgb(var(--v-theme-on-surface));
}
.results-title {
  font-size: 26px;
  line-height: 1.2;
  font-weight: 700;
  letter-spacing: -0.02em;
  margin: 0 0 6px;
}
.results-title__query {
  color: rgb(var(--v-theme-primary));
}
.results-count {
  font-size: 14px;
  color: var(--qs-muted);
}
.results-count span:first-child {
  font-weight: 600;
  color: rgb(var(--v-theme-on-surface));
}
.results-time {
  font-size: 13px;
}
.spell-hint {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 4px;
  font-size: 14px;
  color: var(--qs-muted);
}
.spell-link {
  font-weight: 600;
  color: rgb(var(--v-theme-primary));
  cursor: pointer;
}
.spell-link:hover {
  text-decoration: underline;
}
.sort_input {
  width: 200px;
  max-width: 200px;
}
.sort_input .v-field {
  background: #fff;
}
.view-toggle {
  height: 40px !important;
  padding: 3px;
  gap: 2px;
  background: #e9ecf1 !important;
  border: 0 !important;
  border-radius: 10px !important;
}
.view-toggle .v-btn {
  width: 38px !important;
  min-width: 38px !important;
  height: 34px !important;
  border-radius: 8px !important;
  color: var(--qs-muted) !important;
}
.view-toggle .v-btn .v-icon {
  font-size: 20px;
}
.view-toggle .v-btn .v-btn__overlay {
  display: none;
}
.view-toggle .v-btn:hover {
  color: rgb(var(--v-theme-on-surface)) !important;
}
.view-toggle .v-btn--active {
  background: #fff !important;
  color: rgb(var(--v-theme-on-surface)) !important;
  box-shadow: 0 1px 2px rgba(27, 31, 39, 0.12);
}

/* ---------- layout ---------- */
.box-wrapper {
  position: inherit;
  display: flex;
  align-items: flex-start;
  gap: 28px;
  width: 100%;
}
.box-content {
  flex: 1 1 auto;
  min-width: 0;
}

/* ---------- facets ---------- */
.drawer {
  flex: 0 0 auto;
  position: sticky !important;
  top: calc(var(--app-bar-h, 72px) + 16px) !important;
  align-self: flex-start;
  max-height: var(--drawer-max-h, calc(100vh - var(--app-bar-h, 72px) - 32px)) !important;
  overflow-y: auto;
  transform: none !important;
  background: rgb(var(--v-theme-surface)) !important;
  border: 1px solid var(--qs-border) !important;
  border-radius: var(--qs-radius);
  box-shadow: none !important;
}
.drawer .v-navigation-drawer__content {
  padding: 2px 0;
}
.filters .filter {
  padding: 14px 18px !important;
  border-bottom: 1px solid var(--qs-border);
}
.filters .filter:last-of-type {
  border-bottom: 0;
}
.filters .v-list-item__overlay {
  display: none;
}
.facet-title {
  margin: 0 0 6px;
  font-size: 14px;
  font-weight: 600;
  letter-spacing: 0.01em;
}
.facet-title::first-letter {
  text-transform: uppercase;
}
.facet-values {
  margin: 0 -6px;
}
.facet-checkbox .v-selection-control {
  min-height: 34px !important;
  border-radius: 8px;
}
.facet-checkbox .v-selection-control__wrapper {
  width: 32px !important;
  height: 32px !important;
}
.facet-checkbox .v-selection-control__input {
  width: 32px !important;
  height: 32px !important;
}
.facet-checkbox .v-selection-control__input::before {
  display: none;
}
.facet-checkbox .v-icon {
  font-size: 20px;
}
.facet-checkbox .v-selection-control:not(.v-selection-control--dirty) .v-icon {
  color: rgba(27, 31, 39, 0.38);
}
.facet-checkbox .v-selection-control:hover {
  background: rgba(27, 31, 39, 0.04);
}
.facet-checkbox .v-label {
  width: 100%;
  opacity: 1;
}
.facet-checkbox .v-label label {
  width: 100%;
  cursor: pointer;
}
.facet-value {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  width: 100%;
  padding-right: 8px;
  font-size: 14px;
  color: rgb(var(--v-theme-on-surface));
}
.facet-value__name {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.facet-value__count {
  flex: 0 0 auto;
  font-size: 12px;
  font-variant-numeric: tabular-nums;
  color: var(--qs-muted);
}
.facet-actions {
  position: sticky;
  bottom: 0;
  z-index: 2;
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 12px 18px;
  background: rgb(var(--v-theme-surface));
  border-top: 1px solid var(--qs-border);
}
.search-input .v-field {
  border-radius: 8px;
}
.v-checkbox .v-selection-control {
  min-height: 0 !important;
}
.smaller-checkbox .v-input--selection-controls__input {
  transform: scale(0.8);
}
.v-slider-thumb__surface,
.v-slider-track__fill {
  background-color: rgb(var(--v-theme-primary)) !important;
}
/* ---------- chips ---------- */
.chips-row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
  width: 100%;
  padding: 0 12px 4px;
}
.sQuery {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  height: 30px;
  padding: 0 4px 0 10px;
  background: #fff;
  border: 1px solid var(--qs-border);
  border-radius: 8px;
  color: rgb(var(--v-theme-on-surface));
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
}
.sQuery:hover {
  border-color: rgba(27, 31, 39, 0.28);
}
.chip-text {
  max-width: 240px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.clear-input {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 22px;
  height: 22px;
  border-radius: 50%;
  cursor: pointer;
}
.sQuery .clear-input {
  color: var(--qs-muted);
}
.sQuery .clear-input:hover {
  background: rgba(27, 31, 39, 0.08);
  color: rgb(var(--v-theme-on-surface));
}

/* ---------- products ---------- */
.products > .v-col {
  display: flex;
  flex-direction: column;
}
.products > .v-col > * {
  flex: 1 1 auto;
}
.products--list > .v-col {
  padding-top: 6px;
  padding-bottom: 6px;
}
.products {
  transition: opacity 0.2s ease;
}
/* delayed, so fast responses do not flicker */
.products--stale {
  opacity: 0.45;
  pointer-events: none;
  transition-delay: 0.12s;
}
.filters--stale .v-navigation-drawer__content {
  opacity: 0.55;
  pointer-events: none;
  transition: opacity 0.2s ease 0.12s;
}
.product-skeleton {
  border: 1px solid var(--qs-border);
  border-radius: var(--qs-radius) !important;
  overflow: hidden;
}

a {
  text-decoration: none;
}

/* ---------- empty state ---------- */
.no-product-container {
  min-height: 50vh;
  padding: 2em;
  margin: 0 12px;
  background: rgb(var(--v-theme-surface));
  border: 1px dashed rgba(27, 31, 39, 0.16);
  border-radius: var(--qs-radius);
}
.no-product-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 72px;
  height: 72px;
  margin-bottom: 16px;
  border-radius: 50%;
  background: rgba(var(--v-theme-primary), 0.08);
  color: rgb(var(--v-theme-primary));
}
.no-product-title {
  margin-bottom: 6px;
  font-size: 20px;
  font-weight: 700;
}
.no-product-text {
  margin-bottom: 20px;
  color: var(--qs-muted);
}
.highlight {
  color: rgb(var(--v-theme-primary));
}

/* ---------- endless scroll ---------- */
.load-more {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  padding: 28px 0 8px;
}
.load-more__sentinel {
  position: absolute;
  top: 0;
  width: 1px;
  height: 1px;
}
.load-more__status {
  margin: 0;
  font-size: 13px;
  color: var(--qs-muted);
}

/* ---------- footer / pagination ---------- */
.results-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 16px;
  margin: 32px 12px 0;
  padding-top: 20px;
  border-top: 1px solid var(--qs-border);
}
.records {
  display: flex;
  align-items: center;
  gap: 10px;
}
.results-footer__label {
  font-size: 14px;
  color: var(--qs-muted);
}
.records_input {
  width: 150px;
}
.records_input .v-field {
  background: #fff;
}
.pagination {
  display: flex;
  align-items: center;
  gap: 12px;
}
.pagination > .v-btn {
  border-color: var(--qs-border) !important;
  background: #fff;
}
.pagination__status {
  font-size: 14px;
  color: var(--qs-muted);
  font-variant-numeric: tabular-nums;
}
.pagination__status > span {
  font-weight: 600;
  color: rgb(var(--v-theme-on-surface));
}

/* ---------- facet widgets (child components) ---------- */
.chart-tooltip {
  position: absolute;
  background-color: #23262d;
  color: #fff;
  padding: 8px;
  font-size: 13px;
  border-radius: 6px;
  pointer-events: none;
  z-index: 999;
  max-width: 200px;
  text-align: center;
}
.price-slider-container {
  width: 100%;
}
input[type="number"]::-webkit-outer-spin-button,
input[type="number"]::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}
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
  border: 1px solid rgba(27, 31, 39, 0.16);
  border-radius: 8px;
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
  font-size: 16px;
  color: #333;
  font-weight: 600;
}
.mdi-magnify-close {
  font-size: 36px !important;
}

/* ---------- mobile ---------- */
.box-overlay {
  display: none;
}
@media (max-width: 768px) {
  .page-content {
    padding-top: calc(var(--app-bar-h, 64px) + 12px);
  }
  .results-title {
    font-size: 21px;
  }
  .results-header {
    align-items: flex-start;
  }
  .sort {
    width: 100%;
  }
  .sort_input {
    flex: 1 1 auto;
    max-width: none;
  }
  .drawer {
    position: fixed !important;
    top: 0 !important;
    left: 0 !important;
    bottom: 0 !important;
    z-index: 1005 !important;
    height: 100dvh !important;
    max-height: 100dvh !important;
    border-radius: 0 var(--qs-radius) var(--qs-radius) 0;
    box-shadow: 0 20px 48px rgba(16, 24, 40, 0.3) !important;
  }
  .box-overlay.open {
    display: block;
    position: fixed;
    inset: 0;
    z-index: 1004;
    background: rgba(16, 24, 40, 0.35);
  }
  .open {
    display: none !important;
  }
  .box-overlay.open {
    display: block !important;
  }
  .drawer[style*="display: none"] {
    display: none !important;
  }
  .box-content {
    width: 100% !important;
  }
  .results-footer {
    justify-content: center;
  }
}
</style>
