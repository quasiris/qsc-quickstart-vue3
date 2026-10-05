<template>
    <v-expansion-panels
      v-model="activePanels"
      class="pa-1"
      variant="popout"
    >
      <template v-for="(child, index) in item.values" :key="index">
        <v-list-item
          v-if="!child.children || child.children.values.length === 0"
          class="item-title"
          :class="{ active: child?.selected }"
          :data-filter-value="child.value"
          @click="handleClick(child, parentName)"
        >
          <v-list-item-title class="pa-1 ">{{ child.value }} ({{ child.count }})</v-list-item-title>
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
            <span class="nav-title-label">{{ child.value }} ({{ child.count }})</span>
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
.item-title {
  width: 100%;
  max-width: calc(100% - 5px)!important;
  padding-inline: 6px !important;
  background-color: white;
  box-shadow: 0px -2px 2px -2px rgba(0, 0, 0, 0.2),
   0px 3px 3px -2px rgba(0, 0, 0, 0.2), 
   -2px 0px 3px -2px rgba(0, 0, 0, 0.2),
   2px 0px 3px -2px rgba(0, 0, 0, 0.2);  
}
.item-title.active {
  background-color: rgb(238, 238, 238); 
  font-weight: bold !important; 
  color: #007bff; 
}
.v-list-item {
  padding-left: 10px;
  cursor: pointer;
}
.v-list {
  padding: 0px !important;
}
.v-expansion-panel-title {
  font-weight: 500;
  font-size: 13px;
  line-height: 1.3;
  padding: 10px 8px !important;
}
.nav-title-label {
  flex: 1 1 auto;
  cursor: pointer;
}
.v-expansion-panel{
  max-width: calc(100% - 5px)!important;
}
.v-expansion-panel-title--active{
  background-color: rgb(238, 238, 238); 
  color: #007bff !important; 
}
.v-expansion-panel-text__wrapper {
  padding: 0 6px 6px !important;
}
</style>
