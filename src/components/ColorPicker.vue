<template>
    <v-container>
      <v-row class="colors">
        <v-col
          v-for="color in facet.values"
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
    </v-container>
  </template>
  
  <script>
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
            buntColor:{
              background: 'linear-gradient(90deg, #c4393a, orange, yellow, green, blue, indigo, violet)',
              color: 'transparent' 
            }
        };
    },
    methods: {
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
        transform: scale(1.05);
        border: 1px solid #ccc; 
        background-color: #dfdfdf;
    }
    .v-col.selected {
        border: 2px solid #b1ddff;
        background-color: #b1ddff;
    }
    .color-text{
        font-size: 12px;
        color: grey;
    }
  </style>
  