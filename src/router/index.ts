import { createRouter, createWebHistory } from '@ionic/vue-router';
import { RouteRecordRaw } from 'vue-router';

const routes: Array<RouteRecordRaw> = [
  {
    path: '',
    redirect: '/login'
  },
  {
    path: '/login',
    component: () => import ('../views/Login.vue')
  },
  {
    path: '/folder/Dashboard',
    component: () => import ('../views/Dashboard.vue')
  },
  {
    path: '/folder/Orders',
    component: () => import ('../views/Orders.vue')
  },
  {
    path: '/folder/Delivered_Today',
    component: () => import ('../views/Delivered.vue')
  },
  {
    path: '/folder/Products',
    component: () => import ('../views/Product.vue')
  },
  {
    path: '/folder/Sales',
    component: () => import ('../views/Sales.vue')
  },
  {
    path: '/folder/Delivered',
    component: () => import ('../views/Delivered.vue')
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

export default router
