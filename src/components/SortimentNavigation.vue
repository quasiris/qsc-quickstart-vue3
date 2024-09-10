<template>
    <nav class="navigation">
      <ul class="nav-list">
        <li>
        <v-btn variant="text" size="small" class="sortiment-btn" @mouseenter="toggleMainCategories">Sortiment</v-btn>
        </li>
      </ul>
      <ul
      v-if="showCategories"
      class="category-list"
      @mouseleave="toggleMainCategories"
    >
        <li
          v-for="category in categories"
          :key="category.id"
          class="category-item"
          @mouseenter="categoryHasChildren(category) ? showDropdown(category.id) : null"
          @mouseleave="hideDropdown"
          @click="categoryHasChildren(category) ? toggleDropdown(category.id) : goToCategory(category)"
        >
          <div class="category-link">
            {{ category.name }}
            <span v-if="categoryHasChildren(category)">&nbsp; &#x25BA;</span>
          </div>
  
          <ul v-if="categoryHasChildren(category) && dropdown === category.id" class="subcategory-list">
            <li
              v-for="subcategory in category.children"
              :key="subcategory.id"
              class="subcategory-item"
              @click="goToCategory(subcategory)"
            >
              {{ subcategory.name }}
            </li>
          </ul>
        </li>
      </ul>
    </nav>
  </template>
  
  <script>
  export default {
    name: "SortimentNavigation",
    data() {
      return {
        categories: [],    
        dropdown: null,    
        showCategories: false,  
      };
    },
    methods: {
      async fetchCategories() {
        try {
          const response = await fetch('https://qsc-dev.quasiris.de/api/v1/category/demo/navigation');
          const data = await response.json();
          this.categories = data.category.children;  
        } catch (error) {
          console.error('Failed to fetch categories', error);
        }
      },
      // Show or hide main categories
      toggleMainCategories() {
        this.showCategories = !this.showCategories;
      },
      // Check if a category has subcategories
      categoryHasChildren(category) {
        return category.children && category.children.length > 0;
      },
      // Show dropdown on hover or click
      showDropdown(id) {
        this.dropdown = id;
      },
      // Hide dropdown when the mouse leaves
      hideDropdown() {
        this.dropdown = null;
      },
      toggleDropdown(id) {
        this.dropdown = this.dropdown === id ? null : id;
      },
      goToCategory(category) {
        // apply filter or navigate
      }
    },
    mounted() {
      this.fetchCategories();
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
    padding: 10px;
    list-style: none; 
    top: 11vh;
  }
  
  .category-item {
    position: relative;
    padding: 10px;
    cursor: pointer;
  }
  
  .category-link {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  
  .subcategory-list {
    position: absolute;
    top: 0;
    left: 100%;
    list-style-type: none;
    padding: 0;
    margin: 0;
    background-color: white;
    box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.1); 
    border-radius: 10px;
  }
  
  .subcategory-item {
    padding: 5px 10px;
    cursor: pointer;
  }
  
  .subcategory-item:hover {
    background-color: #ececec;
  }

  </style>
  