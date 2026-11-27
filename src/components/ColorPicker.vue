<template>
    <v-container>
      <v-row class="colors">
        <v-col
          v-for="color in visibleColors"
          :key="color.filter"
          cols="3" 
          class="color-btn text-center"
          :data-color-value="color"
          @click="selectColor(color,facet.name)"
          @mouseover="hoveredColor = color.filter"
          @mouseleave="hoveredColor = null"
          :class="{
            'hovered': hoveredColor === color.filter,
            'selected': selectedColors.includes(color.filter),
          }"
          style="cursor: pointer"
        >
          <v-avatar
            v-if="color.properties.color === 'bunt'"
            size="35"
            :style="[buntColor, { border: '1px solid #b5b5b5' }]"
            class="mx-auto mb-2"
          >
          </v-avatar>
          <v-avatar
            v-else
            size="35"
            :color="color.properties.color"
            style="border: 1px solid #b5b5b5"
            class="mx-auto mb-2"
          >
          </v-avatar>
          <div class="color-text">{{ color.value }}</div>
          <div class="color-text">({{ color.count }})</div>
        </v-col>
      </v-row>
      <div v-if="facet.values.length > pageSize" class="mt-1">
        <v-btn color="primary" variant="text" size="small" class="px-1"
          :append-icon="showAll ? 'mdi-chevron-up' : 'mdi-chevron-down'" @click="toggleShowAll">
          {{ showAll ? 'Show less' : `Show all ${facet.values.length}` }}
        </v-btn>
      </div>
    </v-container>
  </template>
  
  <script>
  import { keepInPlace } from "@/utils";

  export default {
    name: "ColorPicker",
    props: {
      facet: {
        type: Object,
        required: true,
      },
      selectedColors: {
        type: Array,
        required: true,
        }
    },
    data() {
        return {
            hoveredColor: null,
            pageSize: 6,
            showAll: false,
            buntColor:{
              background: 'linear-gradient(90deg, #c4393a, orange, yellow, green, blue, indigo, violet)',
              color: 'transparent' 
            }
        };
    },
    computed: {
      // top colors by count (QSC sorts the values), selected colors stay visible even beyond the limit
      visibleColors() {
        return this.facet.values.filter((color, index) =>
          this.showAll || index < this.pageSize || this.selectedColors.includes(color.filter));
      },
    },
    methods: {
      toggleShowAll(event) {
        // only collapsing needs the anchor: expanding grows below the button and must not scroll
        keepInPlace(this.showAll ? event.currentTarget : null, () => {
          this.showAll = !this.showAll;
          return this.$nextTick();
        });
      },
      selectColor(color,name) {
        this.$emit("colorSelected", color,name);
      },
    },
  };
  </script>
  
  <style scoped>
    .v-col {
        border: 1px solid transparent;
        border-radius: 10px;
        transition: transform 0.2s, border 0.2s;
        margin: 2px;
        display: grid;
        justify-content: center;
        align-items: center;
    }
    .v-col.hovered {
        background-color: rgba(27, 31, 39, 0.04);
    }
    .v-col.selected {
        background-color: rgba(var(--v-theme-primary), 0.08);
    }
    .v-col.selected .v-avatar {
        box-shadow: 0 0 0 2px #fff, 0 0 0 4px rgb(var(--v-theme-primary));
    }
    .color-text{
        font-size: 12px;
        line-height: 1.3;
        color: rgba(27, 31, 39, 0.6);
    }
    .v-col.selected .color-text {
        color: rgb(var(--v-theme-primary));
        font-weight: 600;
    }
  </style>
  