import axios from 'axios'

const service = axios.create({
  baseURL: '/api',
  timeout: 15000
})

service.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers['Authorization'] = 'Bearer ' + token
    }
    return config
  },
  error => {
    return Promise.reject(error)
  }
)

service.interceptors.response.use(
  response => {
    const res = response.data
    if (res.code === 401) {
      localStorage.removeItem('token')
      window.location.href = '/#/login'
      return Promise.reject(new Error('登录已过期'))
    }
    return res
  },
  error => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token')
      window.location.href = '/#/login'
    }
    return Promise.reject(error)
  }
)

// Auth
export function login(data) {
  return service.post('/auth/login', data)
}

export function register(data) {
  return service.post('/auth/register', data)
}

// User
export function getInfo() {
  return service.get('/user/info')
}

export function updateInfo(data) {
  return service.put('/user/update', data)
}

export function getList(params) {
  return service.get('/user/list', { params })
}

export function delUser(id) {
  return service.delete('/user/' + id)
}

export function adminUpdateUser(data) {
  return service.put('/user/admin/update', data)
}

// Product
export function getProductList(params) {
  return service.get('/product/list', { params })
}

export function getAvailable() {
  return service.get('/product/available')
}

export function getGifts() {
  return service.get('/product/gifts')
}

export function addProduct(data) {
  return service.post('/product/add', data)
}

export function updateProduct(data) {
  return service.put('/product/update', data)
}

export function delProduct(id) {
  return service.delete('/product/' + id)
}

// Recharge
export function doRecharge(data) {
  return service.post('/recharge/do', data)
}

export function getRechargeList(params) {
  return service.get('/recharge/list', { params })
}

// Consume
export function doConsume(data) {
  return service.post('/consume/do', data)
}

export function exchange(data) {
  return service.post('/consume/exchange', data)
}

export function getConsumeList(params) {
  return service.get('/consume/list', { params })
}

export function getConsumeDetail(id) {
  return service.get('/consume/' + id)
}

// Bill
export function getBillList(params) {
  return service.get('/bill/list', { params })
}

// Store
export function getStoreList(params) {
  return service.get('/store/list', { params })
}

export function getActiveStores() {
  return service.get('/store/active')
}

export function addStore(data) {
  return service.post('/store/add', data)
}

export function updateStore(data) {
  return service.put('/store/update', data)
}

export function delStore(id) {
  return service.delete('/store/' + id)
}

// Statistics
export function getDashboard() {
  return service.get('/statistics/dashboard')
}

export function getRevenue() {
  return service.get('/statistics/revenue')
}

export function getMembers() {
  return service.get('/statistics/members')
}