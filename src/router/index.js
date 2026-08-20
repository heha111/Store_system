import Vue from 'vue'
import VueRouter from 'vue-router'
import store from '@/store'

Vue.use(VueRouter)

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/Login.vue'),
    meta: { public: true }
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('@/views/Register.vue'),
    meta: { public: true }
  },
  {
    path: '/admin',
    component: () => import('@/components/AdminLayout.vue'),
    meta: { requiresAuth: true, role: 'admin' },
    children: [
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: () => import('@/views/admin/Dashboard.vue')
      },
      {
        path: 'members',
        name: 'Members',
        component: () => import('@/views/admin/Members.vue')
      },
      {
        path: 'products',
        name: 'Products',
        component: () => import('@/views/admin/Products.vue')
      },
      {
        path: 'recharges',
        name: 'Recharges',
        component: () => import('@/views/admin/Recharges.vue')
      },
      {
        path: 'cashier',
        name: 'Cashier',
        component: () => import('@/views/admin/Cashier.vue')
      },
      {
        path: 'orders',
        name: 'Orders',
        component: () => import('@/views/admin/Orders.vue')
      },
      {
        path: 'stores',
        name: 'AdminStores',
        component: () => import('@/views/admin/Stores.vue')
      }
    ]
  },
  {
    path: '/user',
    component: () => import('@/components/UserLayout.vue'),
    meta: { requiresAuth: true, role: 'user' },
    children: [
      {
        path: 'home',
        name: 'UserHome',
        component: () => import('@/views/user/Home.vue')
      },
      {
        path: 'recharge',
        name: 'UserRecharge',
        component: () => import('@/views/user/Recharge.vue')
      },
      {
        path: 'mall',
        name: 'UserMall',
        component: () => import('@/views/user/Mall.vue')
      },
      {
        path: 'bills',
        name: 'UserBills',
        component: () => import('@/views/user/Bills.vue')
      },
      {
        path: 'stores',
        name: 'UserStores',
        component: () => import('@/views/user/Stores.vue')
      },
      {
        path: 'shop',
        name: 'UserShop',
        component: () => import('@/views/user/Shop.vue')
      }
    ]
  },
  {
    path: '/',
    redirect: '/login'
  }
]

const router = new VueRouter({
  routes
})

router.beforeEach((to, from, next) => {
  const token = store.state.token
  if (to.meta.public) {
    next()
  } else if (to.meta.requiresAuth) {
    if (!token) {
      next('/login')
    } else {
      if (to.meta.role && store.state.role !== to.meta.role) {
        if (store.state.role === 'admin') {
          next('/admin/dashboard')
        } else {
          next('/user/home')
        }
      } else {
        next()
      }
    }
  } else {
    next()
  }
})

export default router