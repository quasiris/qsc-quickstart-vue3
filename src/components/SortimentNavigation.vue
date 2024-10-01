<template>
  <nav class="navigation">
    <ul class="nav-list">
      <li>
        <v-btn variant="text" size="small" class="sortiment-btn" @mouseenter="showMainCategories">Sortiment</v-btn>
      </li>
    </ul>
    <div 
      v-if="showCategories" 
      class="category-container" 
      @mouseleave="startHideMainCategories"
      @mouseenter="cancelHideMainCategories"
    >
      <ul class="category-list main-category-list">
        <category-item
          v-for="category in categories"
          :key="category.id"
          :category="category"
          :depth="0"
          :is-active="isActiveCategory(0, category.id)"
          @show-subcategories="addOpenCategory"
          @go-to-category="goToCategory"
        />
      </ul>
      <ul 
        v-for="(parentId, depth) in Object.entries(openCategories)" 
        :key="depth"
        class="category-list subcategory-list"
      >
        <category-item
          v-for="subcategory in getSubcategories(parentId[1])"
          :key="subcategory.id"
          :category="subcategory"
          :depth="parseInt(parentId[0]) + 1"
          :is-active="isActiveCategory(parseInt(parentId[0]) + 1, subcategory.id)"
          @show-subcategories="addOpenCategory"
          @go-to-category="goToCategory"
        />
      </ul>
    </div>
  </nav>
</template>

<script>
import { ref,getCurrentInstance } from 'vue';
import CategoryItem from './CategoryItem.vue';

export default {
  name: "SortimentNavigation",
  components: {
    CategoryItem,
  },
  setup() {
    const categories = ref([]);
    const { proxy } = getCurrentInstance();
    const showCategories = ref(false);
    const openCategories = ref({}); // track open categories by depth
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
      openCategories.value = { ...openCategories.value, [depth]: id };

      // Remove deeper levels when selecting a shallower category
      Object.keys(openCategories.value).forEach((key) => {
        if (parseInt(key) > depth) {
          delete openCategories.value[key];
        }
      });
    };

    const goToCategory = (category) => {
      proxy.$emit("handleFilter", category);
      startHideMainCategories();
    };

    const getSubcategories = (parentId) => {
      // Recursive function to find subcategories
      const findCategoryById = (categories, id) => {
        for (const category of categories) {
          if (category.id === id) return category;
          if (category.children && category.children.length) {
            const found = findCategoryById(category.children, id);
            if (found) return found;
          }
        }
        return null;
      };

      const category = findCategoryById(categories.value, parentId);
      return category ? category.children || [] : [];
    };

    const isActiveCategory = (depth, id) => {
      return openCategories.value[depth] === id;
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
      getSubcategories,
      isActiveCategory,
    };
  }
};
</script>


<style scoped>
.navigation {
  display: flex;
  flex-direction: column;
}

.nav-list {
  list-style-type: none;
  padding: 0;
  margin: 0;
}

.category-container {
  display: flex;
  gap: 20px;
  position: fixed;
  left:20%;
  top: 70px;
  z-index: 2000;
  background-color: white;
  border-radius: 10px;
  padding: 10px;
  box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.1);
}

.category-list {
  list-style-type: none;
  padding: 0;
  margin: 0;
  background-color: white;
  max-height: 400px;
  overflow-y: auto;
  width: 160px;
  scrollbar-width: thin; 
  scrollbar-color: #888 #f1f1f1; 
}

.category-list::-webkit-scrollbar-track {
  background: #f1f1f1;
}

.category-list::-webkit-scrollbar-thumb {
  background-color: #888; 
  border-radius: 10px; 
  border: 3px solid #f1f1f1; 
}

.category-list::-webkit-scrollbar-thumb:hover {
  background-color: #555; 
}
.category-list:hover {
  scrollbar-color: #555 #f1f1f1; 
}

.main-category-list {
  width: 160px;
}

.subcategory-list {
  width: 160px;
}

.category-item {
  padding: 10px;
  font-size: 16px;
  cursor: pointer;
  border-radius: 5px;
}

.category-item:hover {
  background-color: #ececec;
}
</style>
