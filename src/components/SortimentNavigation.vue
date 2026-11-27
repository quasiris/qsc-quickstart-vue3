<template>
  <nav v-if="categories.length > 0" class="sortiment" @mouseleave="scheduleClose" @mouseenter="cancelClose" @keydown.esc="close">
    <button
      type="button"
      class="sortiment-btn"
      :class="{ 'is-open': open }"
      :aria-expanded="open"
      @mouseenter="scheduleOpen"
      @click="toggle"
    >
      <v-icon size="18">mdi-view-grid-outline</v-icon>
      <span>Categories</span>
      <v-icon size="16" class="sortiment-btn__chevron">mdi-chevron-down</v-icon>
    </button>

    <!-- teleported: the header's backdrop-filter would otherwise make it the containing block for position: fixed -->
    <teleport to="body">
    <transition name="sortiment-fade">
      <div v-if="open" class="sortiment-backdrop" @click="close"></div>
    </transition>

    <transition name="sortiment-drop">
      <div v-if="open" class="sortiment-panel" @mouseenter="cancelClose" @mouseleave="scheduleClose" @keydown.esc="close">
        <ul class="sortiment-main">
          <li
            v-for="category in categories"
            :key="category.id"
            class="sortiment-main__item category-item"
            :class="{ 'is-active': activeMain === category }"
            :data-category-value="category.name"
            @mouseenter="selectMain(category)"
            @click="goToCategory(category, [])"
          >
            <span class="sortiment-main__name">{{ category.name }}</span>
            <v-icon v-if="category.children?.length" size="16" class="sortiment-main__chevron">mdi-chevron-right</v-icon>
          </li>
        </ul>

        <section v-if="activeMain" class="sortiment-col">
          <header class="sortiment-col__head">
            <h3>{{ activeMain.name }}</h3>
            <button type="button" class="sortiment-all" @click="goToCategory(activeMain, [])">
              Show all {{ formatCount(activeMain.count) }}
              <v-icon size="15">mdi-arrow-right</v-icon>
            </button>
          </header>
          <ul class="sortiment-list">
            <li
              v-for="group in activeMain.children || []"
              :key="group.id"
              class="sortiment-row category-item"
              :class="{ 'is-active': activeSub === group }"
              :data-category-value="group.name"
              @mouseenter="activeSub = group"
              @click="goToCategory(group, [activeMain.name])"
            >
              <span class="sortiment-row__name">{{ group.name }}</span>
              <span class="sortiment-row__count">{{ formatCount(group.count) }}</span>
              <v-icon size="16" class="sortiment-row__chevron" :class="{ 'is-hidden': !group.children?.length }">mdi-chevron-right</v-icon>
            </li>
          </ul>
        </section>

        <section v-if="activeSub?.children?.length" class="sortiment-col sortiment-col--leaves">
          <header class="sortiment-col__head">
            <h3>{{ activeSub.name }}</h3>
            <button type="button" class="sortiment-all" @click="goToCategory(activeSub, [activeMain.name])">
              Show all {{ formatCount(activeSub.count) }}
              <v-icon size="15">mdi-arrow-right</v-icon>
            </button>
          </header>
          <ul class="sortiment-list sortiment-list--leaves">
            <li
              v-for="leaf in activeSub.children"
              :key="leaf.id"
              class="sortiment-row category-item"
              :data-category-value="leaf.name"
              @click="goToCategory(leaf, [activeMain.name, activeSub.name])"
            >
              <span class="sortiment-row__name">{{ leaf.name }}</span>
              <span class="sortiment-row__count">{{ formatCount(leaf.count) }}</span>
            </li>
          </ul>
        </section>
      </div>
    </transition>
    </teleport>
  </nav>
</template>

<script>
import { ref, getCurrentInstance, onBeforeUnmount } from 'vue';
import { useStore } from 'vuex';

export default {
  name: "SortimentNavigation",
  props: {
    url: String,
  },
  setup(props) {
    const store = useStore();
    const { proxy } = getCurrentInstance();
    const categories = ref([]);
    const open = ref(false);
    const activeMain = ref(null);
    const activeSub = ref(null);
    let openTimer = null;
    let closeTimer = null;

    const fetchCategories = async () => {
      try {
        const response = await fetch(props.url);
        const data = await response.json();
        let children = data?.category?.children || [];
        // a single top level (e.g. the shop root "LiveDE") is skipped, the menu starts with its children
        while (children.length === 1 && children[0].children?.length) {
          children = children[0].children;
        }
        categories.value = children;
      } catch (error) {
        console.error('Failed to fetch categories', error);
        store.dispatch('showGlobalSheet');
      }
    };

    const selectMain = (category) => {
      if (activeMain.value === category) return;
      activeMain.value = category;
      activeSub.value = null;
    };

    const clearTimers = () => {
      clearTimeout(openTimer);
      clearTimeout(closeTimer);
    };
    const show = () => {
      clearTimers();
      if (!activeMain.value) selectMain(categories.value[0]);
      open.value = true;
    };
    const close = () => {
      clearTimers();
      open.value = false;
    };
    // small delays so passing over the button or leaving the panel briefly doesn't flicker
    const scheduleOpen = () => {
      clearTimeout(closeTimer);
      if (!open.value) openTimer = setTimeout(show, 120);
    };
    const scheduleClose = () => {
      clearTimeout(openTimer);
      closeTimer = setTimeout(close, 220);
    };
    const cancelClose = () => clearTimeout(closeTimer);
    const toggle = () => (open.value ? close() : show());

    const goToCategory = (category, parents) => {
      proxy.$emit("handleFilter", {
        ...category,
        fullPath: ['Categories', ...parents].join(' : '),
      });
      close();
    };

    const formatCount = (count) => Number(count || 0).toLocaleString('en-US');

    fetchCategories();
    onBeforeUnmount(clearTimers);

    return {
      categories,
      open,
      activeMain,
      activeSub,
      selectMain,
      scheduleOpen,
      scheduleClose,
      cancelClose,
      toggle,
      close,
      goToCategory,
      formatCount,
    };
  }
};
</script>

<style scoped>
.sortiment {
  flex: 0 0 auto;
}

.sortiment-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  height: 40px;
  padding: 0 12px 0 14px;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 600;
  color: rgba(27, 31, 39, 0.85);
  transition: background-color 0.15s ease, color 0.15s ease;
}
.sortiment-btn:hover,
.sortiment-btn.is-open {
  background: rgba(var(--v-theme-primary), 0.08);
  color: rgb(var(--v-theme-primary));
}
.sortiment-btn__chevron {
  transition: transform 0.2s ease;
}
.sortiment-btn.is-open .sortiment-btn__chevron {
  transform: rotate(180deg);
}

.sortiment-backdrop {
  position: fixed;
  inset: 72px 0 0 0;
  background: rgba(15, 23, 42, 0.18);
  z-index: 999;
}

.sortiment-panel {
  position: fixed;
  top: 80px;
  /* aligned with the page container, grows column by column */
  left: max(24px, calc((100vw - var(--qs-max-width)) / 2 + 24px));
  max-width: calc(100vw - 48px);
  height: min(624px, calc(100vh - 104px));
  display: grid;
  grid-auto-flow: column;
  grid-template-columns: 280px 340px;
  grid-auto-columns: 320px;
  background: #fff;
  border: 1px solid var(--qs-border);
  border-radius: 16px;
  box-shadow: 0 24px 48px rgba(15, 23, 42, 0.14);
  overflow: hidden;
  z-index: 1001;
}

.sortiment-main {
  list-style: none;
  margin: 0;
  padding: 10px;
  overflow-y: auto;
  background: #f7f8fa;
  border-right: 1px solid var(--qs-border);
}
.sortiment-main__item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 9px 12px;
  border-radius: 10px;
  font-size: 14px;
  color: rgba(27, 31, 39, 0.85);
  cursor: pointer;
  transition: background-color 0.12s ease, color 0.12s ease;
}
.sortiment-main__name {
  flex: 1;
}
.sortiment-main__chevron {
  opacity: 0.35;
}
.sortiment-main__item.is-active {
  background: #fff;
  color: rgb(var(--v-theme-primary));
  font-weight: 600;
  box-shadow: 0 1px 3px rgba(15, 23, 42, 0.08);
}
.sortiment-main__item.is-active .sortiment-main__chevron {
  opacity: 1;
}

.sortiment-col {
  display: flex;
  flex-direction: column;
  min-height: 0;
  padding: 18px 12px 12px;
  border-right: 1px solid var(--qs-border);
}
.sortiment-col--leaves {
  border-right: 0;
  animation: sortiment-slide 0.15s ease;
}
.sortiment-col__head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 12px;
  padding: 0 12px 12px;
  margin-bottom: 6px;
  border-bottom: 1px solid var(--qs-border);
}
.sortiment-col__head h3 {
  font-size: 17px;
  font-weight: 700;
  letter-spacing: -0.01em;
  line-height: 1.3;
}
.sortiment-all {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  font-size: 13px;
  font-weight: 600;
  color: rgb(var(--v-theme-primary));
  white-space: nowrap;
}
.sortiment-all:hover {
  text-decoration: underline;
}
.sortiment-list {
  list-style: none;
  margin: 0;
  padding: 0;
  overflow-y: auto;
}
.sortiment-row {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 9px 12px;
  border-radius: 10px;
  font-size: 14px;
  color: rgba(27, 31, 39, 0.85);
  cursor: pointer;
  break-inside: avoid;
  transition: background-color 0.12s ease, color 0.12s ease;
}
.sortiment-row:hover,
.sortiment-row.is-active {
  background: rgba(var(--v-theme-primary), 0.07);
  color: rgb(var(--v-theme-primary));
}
.sortiment-row.is-active {
  font-weight: 600;
}
.sortiment-row__name {
  flex: 1;
}
.sortiment-row__count {
  font-size: 12px;
  font-weight: 400;
  color: rgba(27, 31, 39, 0.42);
}
.sortiment-row__chevron {
  opacity: 0.35;
}
.sortiment-row__chevron.is-hidden {
  visibility: hidden;
}
.sortiment-row.is-active .sortiment-row__chevron {
  opacity: 1;
}

@keyframes sortiment-slide {
  from { opacity: 0; transform: translateX(-6px); }
  to { opacity: 1; transform: none; }
}

.sortiment-fade-enter-active,
.sortiment-fade-leave-active {
  transition: opacity 0.15s ease;
}
.sortiment-fade-enter-from,
.sortiment-fade-leave-to {
  opacity: 0;
}
.sortiment-drop-enter-active,
.sortiment-drop-leave-active {
  transition: opacity 0.15s ease, transform 0.15s ease;
}
.sortiment-drop-enter-from,
.sortiment-drop-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}
</style>
