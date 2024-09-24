<template>
    <v-expansion-panels
      v-model="activePanels"
      class="pa-2"
      multiple
    >
      <template v-for="(child, index) in item.values" :key="index">
        <v-list-item
          v-if="!child.children || child.children.values.length === 0"
          @click="handleClick(child, buildFullParentName(child.value))"
        >
          <v-list-item-title class="pa-1">{{ child.value }} ({{ child.count }})</v-list-item-title>
        </v-list-item>

        <v-expansion-panel
          v-else
          :value="child.filter"
        >
          <v-expansion-panel-title @click="handleClick(child,  buildFullParentName(child.value))">
            {{ child.value }} ({{ child.count }})
          </v-expansion-panel-title>
          <v-expansion-panel-text>
            <v-list v-if="child.children && child.children.values.length > 0">
              <SideBarNavigation
                :item="child.children"
                :parentName="buildFullParentName(child.value)"
                :expanded-panels="expandedPanels"
                @update-expanded-panels="$emit('update-expanded-panels', $event)"
                @onFilter="$emit('onFilter', $event, buildFullParentName(child.value))"
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
    },
    expandedPanels: {
      type: Array,
      default: () => [], 
    },
  },
  setup(props, { emit }) {
    const activePanels = ref([]);
    watch(
      () => props.expandedPanels,
      (newVal) => {
        if (Array.isArray(newVal) && newVal ) {
          let item = newVal.map(panel => panel.filter); 
          activePanels.value=item;
        }
      },
      { immediate: true, deep: true }
    );
    const handleClick = (child, fullParentName) => {
      const expandedPanelIndex = props.expandedPanels.findIndex(panel => panel.filter === child.filter);        // If we find a matching key in expandedPanels, remove it

      if (child.filter) {
        emit('onFilter', child, props.parentName);
        if (expandedPanelIndex !== -1) {         
            const newExpandedPanels = [...props.expandedPanels];
            newExpandedPanels.splice(expandedPanelIndex, 1);
            emit('update-expanded-panels', newExpandedPanels);
        } else {
          const newExpandedPanels = [...props.expandedPanels];
          newExpandedPanels.push({ name: fullParentName, filter: child.filter });
          emit('update-expanded-panels', newExpandedPanels);
        }
      }
    };

    const buildFullParentName = (childValue) => {
      return props.parentName ? `${props.parentName} : ${childValue}` : childValue;
    };

   

    return {
      handleClick,
      buildFullParentName,
      activePanels,
    };
  },
});
</script>

<style>
.v-list-item {
  padding-left: 16px;
  cursor: pointer;
}
.v-list {
  padding: 0px !important;
}
.v-expansion-panel-title {
  font-weight: 500;
  padding: 12px !important;
}
.v-expansion-panel-text__wrapper {
  padding: 0 6px 6px !important;
}
</style>
