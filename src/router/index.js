import { createRouter, createWebHistory } from 'vue-router';

const routes = [
  {
    path: '/',
  }
];
const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  scrollBehavior: (to, from, savedPosition) => {
    if (to.hash) return { el: to.hash };
    if (savedPosition) return savedPosition;

    return { top: 0, left: 0 };
  },
  routes
});

export default router;
