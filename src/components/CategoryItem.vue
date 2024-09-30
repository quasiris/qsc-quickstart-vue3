<template>
  <li
    class="category-item"
    :class="{ active: isActive }"
    @mouseenter="handleMouseEnter"
  >
    <div class="category-link" @click="handleClick">
      {{ category.name }}
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
  },
  setup(props, { emit }) {
    const handleMouseEnter = () => {
      if (props.category.children && props.category.children.length > 0) {
        emit('show-subcategories', props.category.id, props.depth);
      }
    };

    const handleClick = () => {
      emit('go-to-category', props.category);
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
  padding: 10px;
  cursor: pointer;
  border-radius: 5px;
  transition: background-color 0.2s ease;
}

.category-item:hover {
  background-color: #ececec;
}
.category-item.active {
  background-color: #f0f0f0; 
  font-weight: bold; 
  color: #007bff; 
}
</style>
