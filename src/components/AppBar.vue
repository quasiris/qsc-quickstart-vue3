<template>
  <header class="fixed-app-bar app-header">
    <div class="qs-container app-header__inner">
      <a class="app-header__brand" href="#" @click.prevent="logoRedirect(currentConfig?.logoRedirection)">
        <img
          v-if="currentConfig.logo"
          class="logo"
          :src="currentConfig.logo"
          alt="Logo"
        />
      </a>

      <sortiment-navigation
        v-if="currentConfig?.sortimentUrl && display.width._object.width >= 960"
        :url="currentConfig?.sortimentUrl"
        @handleFilter="haldleNavFilter($event)"
      />

      <div class="search-wrapper">
        <div class="search-bar" :class="{ 'is-open': showRecents && filteredItems.length > 0 }" ref="searchArea">
          <v-icon class="search-bar__icon" size="20">mdi-magnify</v-icon>
          <input
            ref="searchInput"
            id="search-box"
            type="search"
            autocomplete="off"
            :data-track-id="'searchBox'"
            v-model="localSearchQuery"
            placeholder="Search products, brands, article numbers …"
            class="search-bar__input"
            @input="sanitizeInput"
            @focus="showRecentSearches()"
          />
          <button
            v-if="localSearchQuery.trim()"
            type="button"
            class="clear-input search-bar__clear"
            aria-label="Clear search"
            @click="clearSearchQuery"
          >
            <v-icon size="18">mdi-close</v-icon>
          </button>
          <v-btn
            v-if="display.width._object.width >= 600"
            @click="searchProducts"
            :data-track-id="'searchButton'"
            color="primary"
            id="search-btn"
            flat
            class="search-bar__submit"
          >
            Search
          </v-btn>
        </div>
        <div class="top-priority" v-if="filteredItems.length > 0 && showRecents" ref="suggestionsDropdown">
          <ul>
            <li
              v-for="(suggest, index) in filteredItems"
              :key="index"
              :class="{ selected: index === selectedIndex }"
            >
              <v-list-item
                class="list-item"
                @click="selectSuggestion(suggest)"
                :data-track-id="'suggestSearchTerm'"
                :data-suggest-value="suggest"
                @keydown.enter.prevent="selectSuggestion(suggest)"
                @mouseover="handleMouseOver(index)"
                @mouseleave="handleMouseLeave"
                tabindex="0"
              >
                <div class="d-flex align-center">
                  <v-icon size="18" class="no-animation suggest-icon">
                    {{ isInRecentSearches(suggest) ? 'mdi-history' : 'mdi-magnify' }}
                  </v-icon>
                  <span class="suggest-text" v-html="highlightSuggestion(suggest)"></span>
                </div>
              </v-list-item>
            </li>
          </ul>
        </div>
      </div>

      <div class="app-header__actions">
        <v-menu v-model="menu" location="bottom end" :close-on-content-click="false">
          <template v-slot:activator="{ props }">
            <v-btn v-bind="props" icon variant="text" size="small" aria-label="Session settings">
              <v-icon color="grey-darken-1">mdi-cog-outline</v-icon>
            </v-btn>
          </template>
          <v-card class="settings-card pa-4" rounded="lg" min-width="300">
            <div class="text-subtitle-2 mb-2">Results</div>
            <v-btn-toggle :model-value="pagingMode" @update:model-value="setPagingMode" mandatory
              density="compact" variant="outlined" divided color="primary" class="paging-toggle mb-4">
              <v-btn value="pages" prepend-icon="mdi-book-open-page-variant-outline" size="small">Pages</v-btn>
              <v-btn value="infinite" prepend-icon="mdi-infinity" size="small">Endless scroll</v-btn>
            </v-btn-toggle>
            <div class="text-subtitle-2 mb-2">Filters</div>
            <v-btn-toggle :model-value="filterMode" @update:model-value="setFilterMode" mandatory
              density="compact" variant="outlined" divided color="primary" class="filter-mode-toggle mb-4">
              <v-btn value="instant" prepend-icon="mdi-flash-outline" size="small">Instant</v-btn>
              <v-btn value="apply" prepend-icon="mdi-check" size="small">Apply button</v-btn>
            </v-btn-toggle>
            <div class="text-subtitle-2 mb-3">Session</div>
            <v-form @submit.prevent="saveEmail">
              <v-text-field
                v-model="emailInput"
                label="Email address"
                placeholder="qsc.user@example.com"
                type="email"
                density="compact"
                :rules="rules"
                @click.stop
              ></v-text-field>
              <div class="d-flex justify-space-between mt-1">
                <v-btn :disabled="!isEmailValid" size="small" color="primary" flat @click="saveEmail">
                  Save
                </v-btn>
                <v-btn size="small" variant="tonal" @click="handleclearSession">
                  Clear session
                </v-btn>
              </div>
            </v-form>
          </v-card>
        </v-menu>
      </div>
    </div>
  </header>
</template>

<script>
import SortimentNavigation from './SortimentNavigation.vue';
import { mapState, mapActions } from 'vuex';
import axios from "axios";
import { useDisplay } from 'vuetify'
import { getBasePath } from '@/services/configLoader';
export default {
  components: {SortimentNavigation},
  name: "AppBar",

  props: {
    config: {
      type: Object,
      required: true
    }
  },

  data() {
    return {
      localSearchQuery: "",
      suggests: [],
      recentSearches: {},
      isFixedAppBar: false,
      navFilter: false,
      showRecents: false,
      prevScrollPos: 0,
      selectedSuggestion: "",
      selectedIndex: -1,
      isMouseOver: false,
      menu: false, 
      emailInput: '',
      rules: [
        value => !!value || 'Required.',
        value => (value || '').length <= 100 || 'Max 100 characters',
        value => {
          const pattern = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
          return pattern.test(value) || 'Invalid e-mail.'
        },
      ],
    };
  },
  setup() {
    const display = useDisplay()
    return { display }
  },
  watch: {
    config: {
      handler(newConfig) {
        if (!newConfig?.id) return;
        this.recentSearches = JSON.parse(localStorage.getItem('recentsSearch') || '{}');
        if (!this.recentSearches[newConfig.id]) {
          this.recentSearches[newConfig.id] = [];
          localStorage.setItem('recentsSearch', JSON.stringify(this.recentSearches));
        }
      },
      immediate: true
    },
    localSearchQuery(newVal) {
      if (newVal !== this.searchQuery ) {
        this.localSearchQuery = newVal; // Sync local data with prop
      }
      this.selectedIndex = -1;
      if (newVal.trim() === "" && !this.navFilter && !this.bottomSheet) {
          this.searchProducts();
      } else  if (newVal !== this.searchQuery ) {
          this.fetchSuggestions();
      } else {
        this.stopProductsLoading();
        this.stopFacetsLoading();
      }
    },
    searchQuery(newVal) {
      this.localSearchQuery=newVal
    }
  },
  computed: {
    ...mapState(['requestId','userId','sessionId','email','searchQuery','bottomSheet','pagingMode','filterMode']),
    currentConfig() {
      return this.config || {};
    },
    isEmailValid() {
      return ((this.rules.every(rule => rule(this.emailInput) === true)) && (this.email != this.emailInput));
    },
    filteredItems() {
      const suggestValues = this.suggests.map(item => item.suggest);
      const recent = this.recentSearches[this.currentConfig.id]?.filter(item => 
        item && item.toLowerCase().startsWith(this.localSearchQuery.toLowerCase())
      ) || [];      
      // Combine recent suggestions with filtered items, ensuring no duplicates
      const uniqueFilteredItems = [...new Set([...recent, ...suggestValues])];
      if (uniqueFilteredItems.length > 10) {
        uniqueFilteredItems.length = 10;  // Trim the array to 10 items
      }
      return uniqueFilteredItems;
    },
  },
  async mounted() {
    window.addEventListener("mousemove", this.handleMouseMove);
    document.addEventListener("keydown", this.handleKeyDown);
    window.addEventListener("click", this.handleWindowClick);
    window.addEventListener("scroll", this.handleScroll);
    this.updateAppBarHeight();
    this.appBarResizeObserver = new ResizeObserver(this.updateAppBarHeight);
    this.appBarResizeObserver.observe(this.$el);
    this.localSearchQuery=this.searchQuery

    this.recentSearches = JSON.parse(localStorage.getItem('recentsSearch') || '{}');
    if(!this.recentSearches[this.currentConfig.id]){
      this.recentSearches[this.currentConfig.id]=[]
      localStorage.setItem('recentsSearch', JSON.stringify(this.recentSearches));
    }
    this.fetchSuggestions();
  },
  beforeUnmount() {
        // Remove the event listeners when the component is unmounted
    window.removeEventListener("mousemove", this.handleMouseMove);
    window.removeEventListener("click", this.handleWindowClick);
    if (this.appBarResizeObserver) {
      this.appBarResizeObserver.disconnect();
    }
    document.removeEventListener("keydown", this.handleKeyDown);
    window.removeEventListener("scroll", this.handleScroll);
  },
  methods: {
    ...mapActions(['setPagingMode', 'setFilterMode', 'clearSession', 'setSearchQuery','stopBottomSheet','setUserEmail','startProductsLoading','startFacetsLoading','startProductsLoading','stopFacetsLoading','stopProductsLoading']),
    updateAppBarHeight() {
      document.documentElement.style.setProperty(
        "--app-bar-h",
        `${this.$el.offsetHeight}px`
      );
    },
    handleclearSession(){
      this.clearSession();
      this.$store.dispatch('initializeSession');
    },
    isInRecentSearches(item) {
      const recentSearches = JSON.parse(localStorage.getItem('recentsSearch') || '{}');
      return recentSearches[this.currentConfig.id].includes(item);
    }, 
    logoRedirect(link = '') {
      if (link) {
        // Open the link in a new tab
        window.open(link, '_blank');
        return;
      }
      let localUrl = getBasePath(this.currentConfig, this.$route);
      if (window.location.pathname === localUrl) {
        // If the pathname matches, reload the page
        const cleanUrl = window.location.origin + localUrl;
        window.history.replaceState({}, '', cleanUrl); 
        window.location.reload(); 
      } else {
        // Redirect to the constructed URL
        const newUrl = new URL(window.location.origin + localUrl);
        window.location.href = newUrl.toString();
      }
    },
    fetchSuggestions() {
      const suggestUrl = this.currentConfig.suggestionUrl;
      if (this.selectedSuggestion === this.localSearchQuery) {
        // If the selected suggestion is equal to the current search query,
        // do not make the API call
        this.suggests = [];
        return;
      }
      if (this.localSearchQuery.trim() === "") {
        this.suggests = [];
        return;
      }
      const encodedSearchQuery = encodeURIComponent(this.localSearchQuery);
      const queryParameters = [];
      queryParameters.push(encodedSearchQuery);
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
      const queryString = queryParameters.join("&");
      axios
     .get(`${suggestUrl}${queryString}`)
        .then(response => {
          // search-app suggest (/search/suggest/...) returns a list,
          // a dedicated suggest config (/suggest/...) returns {result: {<code>: [...]}}
          const data = response.data;
          this.suggests = Array.isArray(data) ? data : Object.values(data?.result || {})[0] || [];
        })
        .catch(error => {
          console.error(error);
        });
    },
    searchProducts() {
      if(this.localSearchQuery.trim() != ''){
        this.recentSearches[this.currentConfig.id].unshift(this.localSearchQuery.toLowerCase());
        this.recentSearches[this.currentConfig.id]= [...new Set(this.recentSearches[this.currentConfig.id])];
          // Ensure the length is max 10
          if (this.recentSearches[this.currentConfig.id].length > 10) {
            this.recentSearches[this.currentConfig.id].length = 10;  // Trim the array to 10 items
          }
        localStorage.setItem('recentsSearch', JSON.stringify(this.recentSearches));
        this.showRecents=false;
      }
      this.navFilter=false;
      this.stopBottomSheet();
      this.startFacetsLoading();
      this.startProductsLoading();
      if(this.localSearchQuery === this.searchQuery)
        this.$emit("onSearch");
      else
        this.setSearchQuery(this.localSearchQuery);
      this.suggests = [];
    },
    haldleNavFilter(filter) {
      this.navFilter=true;
      this.$emit("onFilter", filter);
    },
    saveEmail() {
      if (this.emailInput && this.isEmailValid) {
        this.setUserEmail(this.emailInput);
        this.menu = false; // Close the menu after saving
      }
    },
    sanitizeInput(event) {
      // Replace multiple spaces with a single space
      this.localSearchQuery = event.target.value.replace(/^\s+/, '');
    },
    showRecentSearches() {
      setTimeout(() => {
          this.showRecents = true;
      }, 100);
    },
    selectSuggestion(suggestion) {
      this.localSearchQuery = suggestion;
      this.showRecents = false;
      this.selectedSuggestion = suggestion;
      this.searchProducts();
      this.suggests = []; // Clear the suggestions list
    },
    handleScroll() {
      const currentScrollPos = window.pageYOffset;
      if (currentScrollPos === 0) {
        // At the top of the page
        this.isFixedAppBar = false;
      } else if (currentScrollPos > this.prevScrollPos) {
        // Scrolling down
        this.isFixedAppBar = false;
      } else {
        // Scrolling up
        this.isFixedAppBar = true;
      }
      this.prevScrollPos = currentScrollPos;
    },
    handleWindowClick(event) {
      const searchArea = this.$refs.searchArea;
      const suggestionsDropdown = this.$refs.suggestionsDropdown;
      if (!searchArea.contains(event.target) && (!suggestionsDropdown || !suggestionsDropdown.contains(event.target))) {
        this.showRecents = false;
        this.selectedIndex = -1;
      }
      this.suggests = []; // Clear the suggests list
    },
    handleMouseOver(index) {
      this.selectedIndex = index;
      this.isMouseOver = true;
    },
    handleMouseLeave() {
      this.isMouseOver = false;
    },
    handleKeyDown(event) {
      if (event.key === "ArrowUp") {
        event.preventDefault();
        if (this.selectedIndex > 0) {
          this.selectedIndex--;
        }
        this.isMouseOver = false; // Reset the isMouseOver flag when using keyboard navigation
      } else if (event.key === "ArrowDown") {
        event.preventDefault();
        if (this.selectedIndex < this.filteredItems.length - 1) {
          this.selectedIndex++;
        }
        this.isMouseOver = false; // Reset the isMouseOver flag when using keyboard navigation
      } else if (event.key === "Enter") {
        event.preventDefault();
        if (this.selectedIndex !== -1) {
          const selectedSuggestion = this.filteredItems[this.selectedIndex] ? this.filteredItems[this.selectedIndex] : this.filteredItems[this.selectedIndex].suggest;
          this.selectSuggestion(selectedSuggestion);
        } else if (this.localSearchQuery.trim() !== "") {
          this.searchProducts();
        }
        this.$refs.searchInput?.blur();
        this.isMouseOver = false; // Reset the isMouseOver flag when using keyboard navigation
      }
    },
    highlightSuggestion(suggest) {
      const escape = (value) => String(value).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
      const query = this.localSearchQuery.trim();
      const text = escape(suggest);
      if (!query || !String(suggest).toLowerCase().startsWith(query.toLowerCase())) {
        return text;
      }
      const prefix = escape(String(suggest).slice(0, query.length));
      const rest = escape(String(suggest).slice(query.length));
      return `<span class="suggest-prefix">${prefix}</span><strong>${rest}</strong>`;
    },
    clearSearchQuery() {
      
      this.startFacetsLoading();
      this.startProductsLoading();
      this.localSearchQuery=""
    },
  }
};
</script>
<style lang="scss" scoped>
.app-header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  background: rgba(255, 255, 255, 0.86);
  backdrop-filter: saturate(180%) blur(14px);
  -webkit-backdrop-filter: saturate(180%) blur(14px);
  border-bottom: 1px solid var(--qs-border);
}
.app-header__inner {
  display: flex;
  align-items: center;
  gap: 24px;
  height: 72px;
}
.app-header__brand {
  display: flex;
  align-items: center;
  flex: 0 0 auto;
}
.logo {
  display: block;
  height: 40px;
  max-width: 190px;
  object-fit: contain;
}
.search-wrapper {
  position: relative;
  flex: 1 1 auto;
  max-width: 760px;
  margin: 0 auto;
  z-index: 1010;
}
.search-bar {
  display: flex;
  align-items: center;
  gap: 8px;
  height: 48px;
  padding: 4px 4px 4px 14px;
  background: #f1f3f6;
  border: 1px solid transparent;
  border-radius: 14px;
  transition: background 0.15s ease, border-color 0.15s ease, box-shadow 0.15s ease;
}
.search-bar:hover {
  background: #eceff3;
}
.search-bar:focus-within {
  background: #fff;
  border-color: rgba(var(--v-theme-primary), 0.5);
  box-shadow: 0 0 0 4px rgba(var(--v-theme-primary), 0.12);
}
.search-bar.is-open {
  border-bottom-left-radius: 0;
  border-bottom-right-radius: 0;
}
.search-bar__icon {
  color: var(--qs-muted);
}
.search-bar__input {
  flex: 1 1 auto;
  min-width: 0;
  height: 100%;
  border: 0;
  outline: none;
  background: transparent;
  font: inherit;
  font-size: 15px;
  color: rgb(var(--v-theme-on-surface));
}
.search-bar__input::placeholder {
  color: rgba(27, 31, 39, 0.45);
}
.search-bar__input::-webkit-search-cancel-button {
  display: none;
}
.search-bar__clear {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  color: var(--qs-muted);
  cursor: pointer;
}
.search-bar__clear:hover {
  background: rgba(27, 31, 39, 0.06);
  color: rgb(var(--v-theme-on-surface));
}
.search-bar__submit {
  height: 40px !important;
  padding: 0 22px !important;
  border-radius: 10px !important;
  font-weight: 600;
}
.top-priority {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  z-index: 2000;
  padding: 6px;
  background: #fff;
  border: 1px solid rgba(var(--v-theme-primary), 0.5);
  border-top: 1px solid var(--qs-border);
  border-radius: 0 0 14px 14px;
  box-shadow: 0 18px 40px -16px rgba(16, 24, 40, 0.28);
}
.top-priority ul {
  list-style: none;
  margin: 0;
  padding: 0;
}
.top-priority li {
  border-radius: 10px;
}
.list-item {
  min-height: 40px !important;
  border-radius: 10px;
  font-size: 14px;
}
.suggest-icon {
  color: var(--qs-muted);
  margin-right: 12px;
}
.suggest-text :deep(.suggest-prefix) {
  color: var(--qs-muted);
}
.suggest-text :deep(strong) {
  font-weight: 600;
}
.selected {
  background-color: rgba(var(--v-theme-primary), 0.08);
}
.selected .suggest-icon {
  color: rgb(var(--v-theme-primary));
}
.app-header__actions {
  flex: 0 0 auto;
  display: flex;
  align-items: center;
}
.no-animation {
  transition: none !important;
}
@media (max-width: 959px) {
  .app-header__inner {
    gap: 12px;
    height: 64px;
  }
  .logo {
    height: 30px;
    max-width: 110px;
  }
}
@media (max-width: 600px) {
  .app-header__brand {
    display: none;
  }
  .search-bar {
    height: 44px;
  }
}
</style>
