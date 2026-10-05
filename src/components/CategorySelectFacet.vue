<template>
  <v-select
    :items="facet.values"
    item-title="value"
    item-value="filter"
    :model-value="selectedFilter"
    :placeholder="facet.name"
    variant="outlined"
    density="compact"
    hide-details
    clearable
    class="mb-2"
    @update:modelValue="onSelect"
  >
    <template #item="{ props, item }">
      <v-list-item v-bind="props" :title="`${item.raw.value} (${item.raw.count})`" />
    </template>
    <template #selection="{ item }">
      {{ item.raw.value }} ({{ item.raw.count }})
    </template>
  </v-select>
</template>

<script>
export default {
  name: 'CategorySelectFacet',
  props: {
    facet: {
      type: Object,
      required: true,
    },
  },
  computed: {
    selectedFilter() {
      const selected = this.facet.values.find(value => value.selected);
      return selected ? selected.filter : null;
    },
  },
  methods: {
    onSelect(filter) {
      this.$emit('category-select', { facet: this.facet, filter });
    },
  },
};
</script>
