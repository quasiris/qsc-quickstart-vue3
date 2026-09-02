<template>
  <v-container>
    <div
      v-for="(value, index) in facet.values"
      :key="value.value + '-' + index"
    >
      <v-checkbox
        hide-details
        class="smaller-checkbox"
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
            class="text-decoration-none grey--text text--darken-2"
          >
            <span class="hover-color" style="font-size: 12px;">
              {{ value.value }}
              &nbsp; ({{ value.count }})
            </span>
          </label>
        </template>
      </v-checkbox>

      <div v-if="value.children && selected.includes(value.filter)" class="ml-6">
        <div
          v-for="(child, childIndex) in value.children.values"
          :key="child.value + '-' + childIndex"
        >
          <v-checkbox
            hide-details
            class="smaller-checkbox"
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
                class="text-decoration-none grey--text text--darken-2"
              >
                <span class="hover-color" style="font-size: 12px;">
                  {{ child.value }}
                  &nbsp; ({{ child.count }})
                </span>
              </label>
            </template>
          </v-checkbox>
        </div>
      </div>
    </div>
  </v-container>
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
.smaller-checkbox {
  font-size: 12px;
}
</style>
