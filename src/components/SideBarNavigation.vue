<template>
    <v-list>
      <v-expansion-panels class="pa-2">
        <template v-for="(child, index) in item.values" :key="index">
          <v-list-item v-if="!child.children || child.children.values.length === 0" @click="handleClick(child)">
              <v-list-item-title class="pa-1">{{ child.value }} ({{ child.count }})</v-list-item-title>
          </v-list-item>
          <v-expansion-panel :key="index" v-else>
            <v-expansion-panel-title>
              {{ child.value }} ({{ child.count }})
            </v-expansion-panel-title>
            <v-expansion-panel-text>
              <v-list v-if="child.children && child.children.values.length > 0">
                <SideBarNavigation :item="child.children" />
              </v-list>
            </v-expansion-panel-text>
          </v-expansion-panel>
        </template>
      </v-expansion-panels>
    </v-list>
  </template>
  
  <script>
  import { defineComponent } from 'vue';
  
  export default defineComponent({
    name: 'SideBarNavigation',
    props: {
      item: {
        type: Object,
        required: true,
      },
    },
    methods: {
      handleClick(child) {
        console.log(`Clicked on: ${child.value}`);
      }
    }
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
  } 
  .v-expansion-panel-text__wrapper{
    padding: 0px !important;
  }  
  .v-expansion-panel-title.active::before {
    content: '\f078'; 
  }
  </style>
  