<template>
  <v-app>
    <v-main class="d-flex flex-column">
      <template v-if="configLoading">
        <v-container class="d-flex flex-column align-center justify-center" style="min-height: 60vh;">
          <v-progress-circular indeterminate color="primary" size="64" />
          <p class="text-grey mt-4">Loading frontend configuration…</p>
        </v-container>
      </template>

      <template v-else-if="configError">
        <v-container class="d-flex flex-column align-center justify-center" style="min-height: 60vh;">
          <v-icon size="64" color="error">mdi-alert-circle-outline</v-icon>
          <h3 class="mt-4 mb-2">Configuration not found</h3>
          <p class="text-grey text-center" style="max-width: 480px;">{{ configError }}</p>
        </v-container>
      </template>

      <template v-else>
        <AppBar :config="config" @onSearch="performSearch1" @onFilter="handleNavFilters" />

        <router-view
          @onFilter="clearFilters"
          :bottomFilter="Filters"
          :filter="navFilter"
          :config="config"
          :triggerSearch="triggerSearch"
        />

        <BottomSheet @onFilter="clearFilters" />
        <Footer />
      </template>
    </v-main>
  </v-app>
</template>

<script>
import AppBar from "@/components/AppBar.vue";
import Footer from "@/components/Footer.vue";
import BottomSheet from "@/components/BottomSheet.vue";
import localConfigs from "@/../config.json";
import { mapState, mapActions } from 'vuex';
import {
  fetchRemoteConfig,
  resolveLocalConfig,
  isRemoteRoute
} from '@/services/configLoader';

export default {
  name: "qsc-index",
  components: {
    AppBar,
    Footer,
    BottomSheet
  },
  data() {
    return {
      config: localConfigs[0],
      configLoading: false,
      configError: null,
      navFilter: {},
      Filters: false,
      triggerSearch: false,
    };
  },
  computed: {
    ...mapState(['searchQuery'])
  },
  watch: {
    '$route.params': {
      handler() {
        this.resolveConfig();
      },
      deep: true
    }
  },
  created() {
    this.resolveConfig();
  },
  methods: {
    ...mapActions(['setSearchQuery']),
    async resolveConfig() {
      const url = new URL(window.location.href);
      const searchQuery = url.searchParams.get('q');

      if (searchQuery && searchQuery !== this.searchQuery) {
        this.setSearchQuery(searchQuery);
      }

      if (isRemoteRoute(this.$route)) {
        this.configLoading = true;
        this.configError = null;

        try {
          const { e, tenant, code } = this.$route.params;
          this.config = await fetchRemoteConfig(tenant, code, e);
        } catch (error) {
          this.configError = error?.message || 'Unable to load remote configuration.';
        } finally {
          this.configLoading = false;
        }
        return;
      }

      this.configLoading = false;
      this.configError = null;
      this.config = resolveLocalConfig(url.pathname, localConfigs);
    },
    performSearch1() {
      this.triggerSearch = !this.triggerSearch;
    },
    clearFilters() {
      this.Filters = !this.Filters;
    },
    handleNavFilters(filter) {
      if (filter) {
        this.setSearchQuery("");
        this.navFilter = filter;
        this.navFilter = { ...this.navFilter };
      }
    }
  }
};
</script>
