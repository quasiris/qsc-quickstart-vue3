<template>
  <li
    class="category-item"
    :class="{ active: isActive }"
    :data-category-value="category.name"
    @mouseenter="handleMouseEnter"
    @click="handleClick"
  >
    <div class="category-link">
      {{ category.name }} ({{ category.count }})
    </div>
  </li>
</template>
<script>
export default {
  name: 'CategoryItem',
  props: {
    category: Object,
    depth: Number,
    isActive: Boolean,
    path: Array,
  },
  setup(props, { emit }) {
    const handleMouseEnter = () => {
      if (props.category.children && props.category.children.length > 0) {
        emit('show-subcategories', props.category, props.depth);
      }else{
        emit('hide-subcategories', props.depth);
      }
    };

    const handleClick = () => {
      let category = { ...props.category };
      if (category.name !== props.path[0]) {
        const pathWithoutLast = (props.path[props.path.length - 1] === category.name)
          ? props.path.slice(0, -1) // Exclude the last item if it's the same as category.name
          : props.path;
          
        category.fullPath = 'Sortiment : ' + pathWithoutLast.join(' : ');
      } else {
        category.fullPath = 'Sortiment';
      }
      emit('go-to-category', category);
    };


    return {
      handleMouseEnter,
      handleClick,
    };
  }
};
</script>

<style scoped>
.category-item {
  padding: 8px;
  cursor: pointer;
  border-radius: 5px;
  transition: background-color 0.2s ease;
}

.category-item:hover {
  background-color: #ececec;
}
.category-item.active {
  background-color: #fff; 
  font-weight: bold; 
  color: #007bff; 
}
</style>
