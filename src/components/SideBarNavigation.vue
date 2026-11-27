<template>
    <v-expansion-panels
      v-model="activePanels"
      class="nav-tree"
      variant="accordion"
      multiple
      flat
    >
      <template v-for="(child, index) in item.values" :key="index">
        <v-list-item
          v-if="!child.children || child.children.values.length === 0"
          class="item-title"
          :class="{ active: child?.selected }"
          :data-filter-value="child.value"
          @click="handleClick(child, parentName)"
        >
          <v-list-item-title class="nav-row">
            <span class="nav-title-label">{{ child.value }}</span>
            <span class="nav-count">{{ child.count }}</span>
          </v-list-item-title>
        </v-list-item>

        <v-expansion-panel
          v-else
          :value="child.filter"
        >
          <v-expansion-panel-title
            hide-actions
            :data-filter-value="child.value"
            @click="onTitleClick($event, child, parentName)"
          >
            <span class="nav-title-label">{{ child.value }}</span>
            <span class="nav-count">{{ child.count }}</span>
            <v-icon size="20" class="nav-toggle-icon">
              {{ activePanels.includes(child.filter) ? 'mdi-chevron-up' : 'mdi-chevron-down' }}
            </v-icon>
          </v-expansion-panel-title>
          <v-expansion-panel-text>
            <v-list v-if="child.children && child.children.values.length > 0">
              <SideBarNavigation
                :item="child.children"
                :parentName="buildFullParentName(parentName,child.value)"
                @onFilter="$emit('onFilter', $event)"
              />
            </v-list>
          </v-expansion-panel-text>
        </v-expansion-panel>
      </template>
    </v-expansion-panels>
</template>

<script>
import { defineComponent, ref, watch } from 'vue';

export default defineComponent({
  name: 'SideBarNavigation',
  props: {
    item: {
      type: Object,
      required: true,
    },
    parentName: {
      type: String,
      required: true,
    }
  },
  setup(props, { emit }) {
    const activePanels = ref([]);
    watch(
      () => props.item,
      (newVal) => {
        if (newVal && typeof newVal === 'object' && Array.isArray(newVal.values)) {
          // Map through item.values and filter for children with selected === true
          const selectedPanels = newVal.values
            .filter(child => ((child?.selected === true) || (child?.tempSelected === true))) 
            .map(child => child.filter); 

          // Assign the selected panel filters to activePanels
          activePanels.value = selectedPanels;
        }
      },
      { immediate: true, deep: true }
    );
    const handleClick = (child,name) => {
      if (child.filter) {
        child.fullPath=name;
        emit('onFilter', child);
      }
    };
    const buildFullParentName = (name,childValue) => {
      return name ? `${name} : ${childValue}` : childValue;
    };
    const onTitleClick = (event, child, name) => {
      const rect = event.currentTarget.getBoundingClientRect();
      const clickedToggleIcon = event.clientX > rect.right - 36;
      if (!clickedToggleIcon) {
        handleClick(child, name);
      }
    };

    return {
      handleClick,
      buildFullParentName,
      onTitleClick,
      activePanels,
    };
  },
});
</script>

<style>
.nav-tree {
  margin: 0 -6px;
}
.nav-tree .v-expansion-panel {
  max-width: 100% !important;
  background: transparent !important;
  border-radius: 8px !important;
}
.nav-tree .v-expansion-panel::after {
  display: none;
}
.nav-tree .v-expansion-panel__shadow {
  display: none;
}
.nav-tree .v-expansion-panel-title {
  min-height: 34px !important;
  padding: 6px 8px !important;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  line-height: 1.3;
}
.nav-tree .v-expansion-panel-title__overlay {
  display: none;
}
.nav-tree .v-expansion-panel-title:hover {
  background: rgba(27, 31, 39, 0.04);
}
.nav-tree .v-expansion-panel-title--active {
  color: rgb(var(--v-theme-primary)) !important;
  font-weight: 600;
}
.nav-tree .v-expansion-panel-text__wrapper {
  padding: 0 0 4px 12px !important;
}
.nav-tree .v-expansion-panel-text .nav-tree {
  margin: 0;
  border-left: 2px solid rgba(var(--v-theme-primary), 0.18);
  padding-left: 4px;
}
.nav-title-label {
  flex: 1 1 auto;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  cursor: pointer;
}
.nav-count {
  flex: 0 0 auto;
  margin: 0 6px 0 8px;
  font-size: 12px;
  font-weight: 400;
  font-variant-numeric: tabular-nums;
  color: rgba(27, 31, 39, 0.6);
}
.nav-toggle-icon {
  color: rgba(27, 31, 39, 0.45);
}
.item-title {
  width: 100%;
  min-height: 34px !important;
  padding: 6px 8px !important;
  border-radius: 8px;
  cursor: pointer;
}
.item-title:hover {
  background: rgba(27, 31, 39, 0.04);
}
.item-title .v-list-item__overlay {
  display: none;
}
.item-title.active {
  background: rgba(var(--v-theme-primary), 0.08);
  color: rgb(var(--v-theme-primary));
  font-weight: 600;
}
.nav-row {
  display: flex;
  align-items: center;
  font-size: 14px;
  line-height: 1.3;
}
.nav-tree .v-list {
  padding: 0 !important;
  background: transparent;
}
</style>
