<template>
  <nav class="navigation" ref="navigation" @mouseleave="startHideMainCategories">
    <ul class="nav-list">
      <li>
        <v-btn variant="text" size="small" class="sortiment-btn" @mouseenter="showMainCategories">Sortiment</v-btn>
      </li>
    </ul>
    <div 
      v-if="showCategories" 
      class="category-container" 
      :style="{ left: `${categoryLeft.value}px` }"
      @mouseleave="startHideMainCategories"
      @mouseenter="cancelHideMainCategories"
    >
      <ul class="category-list main-category-list">
        <category-item
          v-for="category in categories"
          :key="category.id"
          :category="category"
          :depth="0"
          :is-active="isActiveCategory(0, category.filter)"
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
          :is-active="isActiveCategory(parseInt(parentId[0]) + 1, subcategory.filter)"
          @show-subcategories="addOpenCategory"
          @go-to-category="goToCategory"
        />
      </ul>
    </div>
  </nav>
</template>

<script>
import { watch,ref,getCurrentInstance,onMounted, onBeforeUnmount } from 'vue';
import CategoryItem from './CategoryItem.vue';
import { useStore } from 'vuex';
export default {
  name: "SortimentNavigation",
  components: {
    CategoryItem,
  },
  props: {
    url: String,
  },
  setup(props) {
    const store = useStore();
    const categories = ref([]);
    const { proxy } = getCurrentInstance();
    const showCategories = ref(false);
    const categoryLeft = ref(50);
    const navigation = ref(null);
    const openCategories = ref({}); // track open categories by depth
    let hideTimeout = null;

    const fetchCategories = async () => {
      try {
        const response = await fetch(props.url);
        const data = await response.json();
        categories.value = data.category.children;
      } catch (error) {
        console.error('Failed to fetch categories', error);
        store.dispatch('showGlobalSheet');
      }
    };
    watch(
      () => props.url,
      (newUrl, oldUrl) => {
        if (newUrl !== oldUrl) {
          fetchCategories(); // Fetch categories when URL changes
        }
      },
      { deep: true }
    );
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
    const calculateCategoryPosition = () => {
      if (navigation.value) {
        const navRect = navigation.value.getBoundingClientRect();
        categoryLeft.value = navRect.left;
      }
    };
    const addOpenCategory = (filter, depth) => {
      openCategories.value = { ...openCategories.value, [depth]: filter };

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
      const findCategoryById = (categories, filter) => {
        for (const category of categories) {
          if (category.filter === filter){
          return category}
          if (category.children && category.children.length) {
            const found = findCategoryById(category.children, filter);
            if (found) return found;
          }
        }
        return null;
      };
      const category = findCategoryById(categories.value, parentId);
      return category ? category.children || [] : [];
    };

    const isActiveCategory = (depth, filter) => {
      return openCategories.value[depth] === filter;
    };

    fetchCategories();
    onMounted(() => {
      calculateCategoryPosition();
      window.addEventListener('resize', calculateCategoryPosition);
    });

    onBeforeUnmount(() => {
      window.removeEventListener('resize', calculateCategoryPosition);
    });
    return {
      categories,
      categoryLeft,
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
  top: 70px;
  z-index: 2000;
  background-color: rgb(238, 238, 238);
  border-radius: 10px;
  padding: 10px;
  box-shadow: rgba(0, 0, 0, 0.35) 0px 5px 15px;
}

.category-list {
  list-style-type: none;
  padding: 0;
  margin: 0;
  background-color: rgb(238, 238, 238);
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
  background-color: #fff;
}
</style>
