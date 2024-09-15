<template>
    <li
      :class="['category-item', { 'has-children': categoryHasChildren }]"
      @mouseenter="handleMouseEnter"
    >
      <div class="category-link" @click="handleClick">
        {{ category.name }}
      </div>
  
      <ul v-if="categoryHasChildren && isDropdownOpen" class="subcategory-list">
        <category-item
          v-for="subcategory in category.children"
          :key="subcategory.id"
          :category="subcategory"
          :open-categories="openCategories"
          :depth="depth + 1"
          @show-dropdown="handleDropdown"
          @go-to-category="$emit('go-to-category', $event)"
        />
      </ul>
    </li>
  </template>
  
  <script>
  import { computed } from 'vue';
  
  export default {
    name: 'CategoryItem',
    props: {
      category: Object,
      openCategories: Object,
      depth: Number,
    },
    setup(props, { emit }) {
      const categoryHasChildren = computed(() => 
        Array.isArray(props.category?.children) && props.category.children.length > 0
      );
  
      const isDropdownOpen = computed(() => props.openCategories[props.depth] === props.category.id);
  
      const handleMouseEnter = () => {
        if (categoryHasChildren.value) {
          emit('show-dropdown', props.category.id, props.depth);
        }else{
            emit('show-dropdown', null, props.depth);
        }
      };
  
      const handleDropdown = (id, depth) => {
        // Ensure the dropdown works even if depth calculation is inconsistent
        emit('show-dropdown', id, depth);
      };
  
      const handleClick = () => {
        if (!categoryHasChildren.value) {
          emit('go-to-category', props.category);
        }
      };
  
      return {
        categoryHasChildren,
        isDropdownOpen,
        handleMouseEnter,
        handleDropdown,
        handleClick,
      };
    }
  };
  </script>
  
  <style scoped>
  .category-item {
    position: relative;
    padding: 7px;
    cursor: pointer;
    border-radius: 5px;
  }
  
  .category-item:hover {
    text-decoration: underline;
    background-color: #ececec;
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
    z-index: 2000;
    margin: 0;
    box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.1);
    border-radius: 5px;
    background-color: white;
    visibility: hidden;
    opacity: 0;
    transition: opacity 0.3s ease, visibility 0.3s ease;
  }
  
  .category-item:hover .subcategory-list,
  .subcategory-list:hover {
    visibility: visible;
    opacity: 1;
  }
  </style>