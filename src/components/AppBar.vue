<template>
  <v-card class="fixed-app-bar">
    <v-container>
      <div class="d-flex justify-space-between align-center">
        <v-toolbar-title class="d-flex align-center">
          <div>
            <a href="javascript:window.location.reload(true);">
              <img
                class="me-2 logo d-md-block d-none v-image"
                max-width="170px"
                max-height="64px"
                :src="config.logo"
                style="max-height: 64px; max-width: 170px;"
                alt=""
              />
            </a>
          </div>
        </v-toolbar-title>
        <v-col lg="8" sm="7" class="d-flex align-center justify-space-around">
          <sortiment-navigation />
          <div class="search-bar d-flex align-center p-relative">
            <v-text-field
              type="text"
              v-model="localSearchQuery"
              placeholder="article / keyword / product"
              variant="outlined"
              rounded
              hide-details
              density="compact"
              prepend-inner-icon="mdi-magnify"
              class="search-input"
              @input="sanitizeInput"
              :style="{ borderTopRightRadius: 0, borderBottomRightRadius: 0 }"
            >
              <template #append>
                <span
                  v-if="localSearchQuery.trim() && display.width._object.width >= 600"
                  class="clear-input"
                  @click="clearSearchQuery"
                >
                  &times;
                </span>
              </template>
            </v-text-field>
            <v-btn
              v-if="display.width._object.width >= 600"
              @click="searchProducts"
              color="primary"
              class="text-capitalize search-bar-dropdown"
            >
              Search
            </v-btn>
          </div>
          <div class="top-priority" v-if="suggests.length > 0">
            <ul>
              <li
                v-for="(suggest, index) in suggests"
                :key="index"
                :class="{ selected: index === selectedIndex }"
                style="border-radius: 10px;"
              >
                <v-list-item
                  class="list-item"
                  @click="selectSuggestion(suggest.suggest)"
                  @keydown.enter.prevent="selectSuggestion(suggest.suggest)"
                  @mouseover="handleMouseOver(index)"
                  @mouseleave="handleMouseLeave"
                  tabindex="0"
                >
                  <v-icon
                    class="no-animation"
                    :class="{
                      'white-font': index === selectedIndex
                    }"
                    >mdi-magnify</v-icon
                  >
                  &nbsp; &nbsp;
                  <span
                    :class="{
                      'white-font': index === selectedIndex,
                    }"
                  >
                    {{ suggest.suggest }}
                  </span>
                </v-list-item>
              </li>
            </ul>
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
                  <v-btn :disabled="!isEmailValid" size="x-small" class="float-left" color="primary" @click="saveEmail">
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
      localSearchQuery: this.searchQuery,
      suggests: [],
      config: config[0],
      isFixedAppBar: false,
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
  props: {
    searchQuery: { type: String, default: "" }
  },
  setup() {
    const display = useDisplay()
    return { display }
  },
  watch: {
    localSearchQuery(newVal) {
      if (newVal !== this.localSearchQuery ) {
        this.localSearchQuery = newVal; // Sync local data with prop
      }
      this.selectedIndex = -1;
      if (this.localSearchQuery?.trim() === "") {
        if (newVal === "" || newVal === this.searchQuery) {
          const url = new URL(window.location.href);
          url.searchParams.delete('q');
          window.history.pushState({}, '', url);
          this.searchProducts();
        }
      } else {
        this.fetchSuggestions();
      }
    },
    searchQuery(newVal) {
      this.localSearchQuery=newVal
    }
  },
  computed: {
    ...mapState(['requestId','userId','sessionId','email']),
    isEmailValid() {
      return ((this.rules.every(rule => rule(this.emailInput) === true)) && (this.email != this.emailInput));
    }
  },
  async mounted() {
    window.addEventListener("mousemove", this.handleMouseMove);
    document.addEventListener("keydown", this.handleKeyDown);
    window.addEventListener("click", this.handleWindowClick);
    window.addEventListener("scroll", this.handleScroll);
    this.searchProducts();

    const url = window.location.href;
    for (const configItem of config) {
      if (url.includes(configItem.id)) {
        this.config = configItem;
        break; // Exit the loop once a match is found
      }
    }
    this.fetchSuggestions();
  },
  beforeUnmount() {
    window.removeEventListener("mousemove", this.handleMouseMove);
    // Remove the event listener when the component is unmounted
    window.removeEventListener("click", this.handleWindowClick);
  },
  methods: {
    ...mapActions(['clearSession', 'setUserEmail','startProductsLoading','startFacetsLoading']),
    handleclearSession(){
      this.clearSession();
      this.$store.dispatch('initializeSession');
    },
    fetchSuggestions() {
      const suggestUrl = this.config.suggestionUrl;
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
      this.startFacetsLoading();
      this.startProductsLoading();
      this.$emit("onSearch", this.localSearchQuery);
      this.suggests = [];
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
    selectSuggestion(suggestion) {
      this.localSearchQuery = suggestion;
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

    handleWindowClick() {
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
        if (this.selectedIndex < this.suggests.length - 1) {
          this.selectedIndex++;
        }
        this.isMouseOver = false; // Reset the isMouseOver flag when using keyboard navigation
      } else if (event.key === "Enter") {
        event.preventDefault();
        if (this.selectedIndex !== -1) {
          const selectedSuggestion = this.suggests[this.selectedIndex]?.suggest;
          this.selectSuggestion(selectedSuggestion);
        } else if (this.localSearchQuery.trim() !== "") {
          this.searchProducts();
        }
        this.isMouseOver = false; // Reset the isMouseOver flag when using keyboard navigation
      }
    },
    clearSearchQuery() {
      this.localSearchQuery = "";
      const url = new URL(window.location.href);
      url.searchParams.delete('q');
      // Use the history API to update the URL without reloading the page
      window.history.pushState({}, '', url);
      this.startFacetsLoading();
      this.startProductsLoading();
      this.$emit("onSearch", this.localSearchQuery);
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
.search-bar {
  width: 85%;
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
}
.top-priority {
  position: fixed;
  z-index: 2000;
  width: auto;
  min-width: 43vw;
  background-color: white;
  box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.1); 
  border-radius: 10px;
  top: 70px;
  
  ul {
    list-style: none; 
  }
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
  .list-item {width: 290px;} /* Set the width for small screens */
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
