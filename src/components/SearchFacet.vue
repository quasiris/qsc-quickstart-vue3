<template>
  <v-text-field
    v-model="query"
    :placeholder="facet.name"
    density="compact"
    variant="outlined"
    hide-details
    clearable
    append-inner-icon="mdi-magnify"
    class="search-facet-input"
    @keyup.enter="submit"
    @click:clear="clear"
    @click:append-inner="submit"
  />
</template>

<script>
export default {
  name: 'SearchFacet',
  props: {
    facet: {
      type: Object,
      required: true,
    },
    resetAll: {
      type: Boolean,
    },
    activeValue: {
      type: String,
      default: '',
    },
  },
  data() {
    return {
      query: this.activeValue,
    };
  },
  watch: {
    resetAll(newVal) {
      if (newVal) {
        this.query = '';
      }
    },
    activeValue(newVal) {
      this.query = newVal;
    },
  },
  methods: {
    submit() {
      this.$emit('search-change', { facet: this.facet, value: this.query ? this.query.trim() : '' });
    },
    clear() {
      this.query = '';
      this.submit();
    },
  },
};
</script>

<style>
.search-facet-input {
  max-width: 100%;
}
</style>
