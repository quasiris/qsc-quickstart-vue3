import { createRouter, createWebHistory } from 'vue-router';
import DetailsContentPage from '@/components/DetailsContentPage.vue';
import PageContent from '@/layout/PageContent.vue';

const routes = [
  {
    path: '/',
    component: PageContent, 
  },
  {
    path: '/:config',
    component: PageContent, 
  },
  {
    path: '/:config?/detail/:pathMatch(.*)*',
    name: 'DetailsContent',
    component: DetailsContentPage,
    props: true,
  },
  {
    path: '/:catchAll(.*)*', 
    component: PageContent,            
  }
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  scrollBehavior: (to, from, savedPosition) => {
    if (to.hash) return { el: to.hash };
    if (savedPosition) return savedPosition;

    return { top: 0, left: 0 };
  },
  routes,
});

export default router;
