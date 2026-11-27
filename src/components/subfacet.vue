<template>
  <div class="facet-values">
    <div
      v-for="(value, index) in facet.values"
      :key="value.value + '-' + index"
    >
      <v-checkbox
        hide-details
        density="compact"
        class="smaller-checkbox facet-checkbox"
        type="checkbox"
        color="primary"
        :data-filter-value="value.filter"
        :value="value.filter"
        v-model="selected"
        :id="'filter-' + value.filter"
        @change="chipsControle(facet, value)"
      >
        <template #label>
          <label
            :for="'filter-' + value.filter"
            
          >
            <span class="facet-value">
              <span class="facet-value__name">{{ value.value }}</span>
              <span class="facet-value__count">{{ value.count }}</span>
            </span>
          </label>
        </template>
      </v-checkbox>

      <div v-if="value.children && selected.includes(value.filter)" class="facet-children">
        <div
          v-for="(child, childIndex) in value.children.values"
          :key="child.value + '-' + childIndex"
        >
          <v-checkbox
            hide-details
            density="compact"
        class="smaller-checkbox facet-checkbox"
            type="checkbox"
            color="primary"
            :data-filter-value="child.filter"
            :value="child.filter"
            v-model="selected"
            :id="'filter-' + child.filter"
            @change="chipsControle(value.children, child)"
          >
            <template #label>
              <label
                :for="'filter-' + child.filter"
                
              >
                <span class="facet-value">
                  <span class="facet-value__name">{{ child.value }}</span>
                  <span class="facet-value__count">{{ child.count }}</span>
                </span>
              </label>
            </template>
          </v-checkbox>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "SubFacet",
  props: {
    facet: {
      type: Object,
      required: true,
    },
    modelValue: {
      type: Array,
      required: true,
    },
  },
  emits: ["update:modelValue", "chip"],
  computed: {
    selected: {
      get() {
        return this.modelValue;
      },
      set(value) {
        this.$emit("update:modelValue", value);
      },
    },
  },
  methods: {
    chipsControle(facet, value) {
      this.$emit("chip", facet, value);
    },
  },
};
</script>

<style scoped>
.facet-children {
  margin-left: 14px;
  padding-left: 8px;
  border-left: 2px solid rgba(var(--v-theme-primary), 0.18);
}
</style>
