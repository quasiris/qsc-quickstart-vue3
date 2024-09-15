<template>
    <nav class="navigation">
      <ul class="nav-list">
        <li>
          <v-btn variant="text" size="small" class="sortiment-btn" @mouseenter="showMainCategories">Sortiment</v-btn>
        </li>
      </ul>
      <ul
      v-if="showCategories"
        class="category-list"
        @mouseleave="startHideMainCategories"
        @mouseenter="cancelHideMainCategories"
      >
        <category-item
          v-for="category in categories"
          :key="category.id"
          :category="category"
          :open-categories="openCategories"
          :depth="0"
          @show-dropdown="addOpenCategory"
          @go-to-category="goToCategory"
        />
      </ul>
    </nav>
  </template>
  
  <script>
  import { ref } from 'vue';
  import CategoryItem from './CategoryItem.vue';
  
  export default {
    name: "SortimentNavigation",
    components: {
      CategoryItem,
    },
    setup() {
      const categories = ref([]);
      const showCategories = ref(false);
      const openCategories = ref({});
      let hideTimeout = null;
        
      const fetchCategories = async () => {
        try {
          const response = await fetch('https://qsc-dev.quasiris.de/api/v1/category/demo/navigation-random');
          const data = await response.json();
          categories.value = data.category.children;
        } catch (error) {
          console.error('Failed to fetch categories', error);
        }
      };
  
      const showMainCategories = () => {
        showCategories.value = true;
      };
  
      const startHideMainCategories = () => {
        hideTimeout = setTimeout(() => {
          showCategories.value = false;
          openCategories.value = {}; // Reset open categories on hide
        }, 300);
      };
  
      const cancelHideMainCategories = () => {
        if (hideTimeout) clearTimeout(hideTimeout);
      };
  
      const addOpenCategory = (id, depth) => {
        // Set the category at the current depth level
        openCategories.value = {
          ...openCategories.value,
          [depth]: id
        };
  
        // Remove deeper levels if we open a shallower depth
        Object.keys(openCategories.value).forEach((key) => {
          if (parseInt(key) > depth) {
            delete openCategories.value[key];
          }
        });
      };
  
      const goToCategory = (category) => {
        console.log('Selected category:', category);
      };
  
      fetchCategories();
  
      return {
        categories,
        showCategories,
        openCategories,
        showMainCategories,
        startHideMainCategories,
        cancelHideMainCategories,
        addOpenCategory,
        goToCategory,
      };
    }
  };
  </script>
  
  <style scoped>
  .sortiment-btn:hover {
    text-decoration: underline;
  }
  
  .navigation {
    display: flex;
    flex-direction: column;
  }
  
  .nav-list {
    list-style-type: none;
    padding: 0;
    margin: 0;
    margin-right: 25px;
  }
  
  .category-list {
    position: fixed;
    z-index: 2000;
    width: auto;
    background-color: white;
    margin-left: 5px;
    box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.1);
    border-radius: 10px;
    padding: 7px;
    list-style: none;
    top: 70px;
  }
  
  .category-item {
    position: relative;
    padding: 4px;
    font-size: 14px;
    white-space: nowrap;
    cursor: pointer;
  }
  
  .category-item:hover {
    background-color: #ececec;
  }
  </style>