<template>
  <v-card class="fixed-app-bar">
    <v-container>
      <div class="d-flex justify-space-between align-center">
        <v-toolbar-title class="d-flex align-center">
          <div>
              <img
                class="me-2 logo d-md-block d-none v-image"
                :src="currentConfig.logo"
                @click="logoRedirect(currentConfig?.logoRedirection)"
                style="max-height: 64px; max-width: 170px; cursor: pointer;"
                alt=""
              />
          </div>
        </v-toolbar-title>
        <v-col lg="8" sm="7" class="d-flex align-center justify-space-around">
          <sortiment-navigation :url="currentConfig?.sortimentUrl" @handleFilter="haldleNavFilter($event)" v-if="(currentConfig?.sortimentUrl && (display.width._object.width >= 960))" />
          <div class="search-wrapper d-flex flex-column">
            <div class="search-bar d-flex align-center p-relative" ref="searchArea">
            <v-text-field
              ref="searchInput"
              id="search-box"
              type="text"
              :data-track-id="'searchBox'"
              v-model="localSearchQuery"
              placeholder="article / keyword / product"
              variant="outlined"
              rounded
              hide-details
              density="compact"
              prepend-inner-icon="mdi-magnify"
              class="search-input"
              @input="sanitizeInput"
              @focus="showRecentSearches()"
              :style="{ borderTopRightRadius: 0, borderBottomRightRadius: 0 }"
            >
              <template #append>
                <span
                  v-if="localSearchQuery.trim() && display.width._object.width >= 600"
                  class="clear-input"
                  style="right: 100px;"
                  @click="clearSearchQuery"
                >
                  &times;
                </span>
              </template>
            </v-text-field>
            <v-btn
              v-if="display.width._object.width >= 600"
              @click="searchProducts"
              :data-track-id="'searchButton'"
              color="primary"
              id="search-btn"
              class="text-capitalize search-bar-dropdown"
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
                  style="border-radius: 10px;"
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
                    <v-icon v-if="!isInRecentSearches(suggest)"
                      class="no-animation"
                      :class="{
                        'white-font': index === selectedIndex
                      }"
                      >mdi-magnify</v-icon
                    >
                    <v-icon v-else
                      class="no-animation"
                      :class="{
                        'white-font': index === selectedIndex
                      }"
                      >mdi-history</v-icon
                    >
                    &nbsp; &nbsp;
                    <span
                      :class="{
                        'white-font': index === selectedIndex,
                      }"
                    >
                      {{ suggest }}
                    </span>
                  </v-list-item>
                </li>
              </ul>
            </div>
          </div>
        </v-col>
        <v-col cols="1">
          <div class="float-right">
          <v-menu
            v-model:menu="menu"
            activator="parent"
            offset-y
            :close-on-click="false"
          >
            <template v-slot:activator="{props }">
              <v-icon 
                v-bind="props" 
                size="large" 
                color="grey"
                class="icon-pointer"
              >
                mdi-cog
              </v-icon>
            </template>
            <v-card class="pb-2">
              <v-card-text>
                <v-form>
                    <v-text-field 
                      v-model="emailInput"
                      label="Email address"
                      placeholder="qsc.user@gmail.com"
                      type="email"
                      variant="underlined"
                      :rules="rules"
                      @click.stop
                    ></v-text-field>
                  <v-btn :disabled="!isEmailValid" size="x-small" class="float-left mr-2" color="primary" @click="saveEmail">
                    Save
                  </v-btn>
                  <v-btn size="x-small" class="float-right" color="secondary" @click="handleclearSession">
                    Clear Session
                  </v-btn>
                </v-form>
              </v-card-text>
            </v-card>
          </v-menu>
        </div>
        </v-col>
      </div>
    </v-container>
  </v-card>
</template>

<script>
import config from "@/../config.json";
import SortimentNavigation from './SortimentNavigation.vue';
import { mapState, mapActions } from 'vuex';
import axios from "axios";
import { useDisplay } from 'vuetify'
export default {
  components: {SortimentNavigation},
  name: "AppBar",

  data() {
    return {
      localSearchQuery: "",
      suggests: [],
      recentSearches: {},
      currentConfig: {},
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
    ...mapState(['requestId','userId','sessionId','email','searchQuery','bottomSheet']),
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
    this.localSearchQuery=this.searchQuery

    const url = window.location.href;
    for (const configItem of config) {
      if (url.includes(configItem.id) || (configItem.id === '1' && url === window.location.origin + '/')) {
        this.currentConfig = configItem;
        break; // Exit the loop once a match is found
      }
    }
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
  },
  methods: {
    ...mapActions(['clearSession', 'setSearchQuery','stopBottomSheet','setUserEmail','startProductsLoading','startFacetsLoading','startProductsLoading','stopFacetsLoading','stopProductsLoading']),
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
      let localUrl = '/';
      if (this.currentConfig.id !== '1') {
        localUrl += this.currentConfig.id;
      }
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
          this.suggests = response.data;
        })
        .catch(error => {
          console.log(error);
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
      
      let localUrl= '/'
      if(this.currentConfig.id != '1')
        localUrl= localUrl+this.currentConfig.id
      if(window.location.pathname != localUrl){
        const newUrl = new URL(window.location.origin + localUrl);
        newUrl.searchParams.set('q', this.localSearchQuery); 
        window.location.href = newUrl.toString();
      }
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
        this.$refs.searchInput.blur();
        this.isMouseOver = false; // Reset the isMouseOver flag when using keyboard navigation
      }
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
$md: 959px;
.search-input {
  flex-grow: 1;
  margin-right: 0;
}
.mdi-magnify {
  font-size: 25px !important;
  margin-inline-start: 2px !important;
}
.search-bar-dropdown {
  height: 40px;
  border-radius: 22px;
  border-top-left-radius: 0;
  border-bottom-left-radius: 0;
  border-left: 1px solid transparent;
  box-shadow: none;
  line-height: 39px; 
  padding: 0 35px;
  margin-left: -80px;
}
.v-hidden {
  visibility: hidden;
}
.line {
  border-bottom: 0.1px solid gray; 
  margin-top: 7px; 
}
@keyframes showAppBar {
  0% {
    transform: translateY(-100%);
  }
  100% {
    transform: translateY(0);
  }
}
.fixed-app-bar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  animation: showAppBar 0.5s ease; 
  overflow: visible;
}
.search-wrapper {
  width: 85%;
  z-index: 1010; 
  position: relative;
}

.search-bar {
  width: 100%; 
}

.top-priority {
  width: 100%; 
  background-color: white;
  box-shadow: 1px 4px 8px rgba(0, 0, 0, 0.2);
  border-radius: 10px;
  position: absolute; 
  top: 100%;
  z-index: 2000;
}

.top-priority ul {
  list-style: none;
}
.list-item {
  font-weight: bold;
  min-width: 100%;
  width: 490px;
}
.selected {
  background-color: #1867c0;
}
.icon-pointer {
  cursor: pointer;
}
.white-font {
  color: white;
}
.no-animation {
  transition: none !important;
}
.closeBtn {
  font-size:  1.2em;
  color: #1867c0;
  cursor: pointer;
  margin-right: 17px;
  right: 80px;
}
@media (max-width: 600px) {
  .list-item {width: 290px;} 
}
@media (min-width: 601px) and (max-width: 960px) {
  .list-item {width: 650px;} 
}
@media (max-width: $md) {
  .search-bar-dropdown {display: inline-block !important;}
}
@media (max-width: 960px) {
  .search-bar-dropdown {
    display: none;
  }
}
</style>
