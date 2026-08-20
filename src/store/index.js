import Vue from 'vue'
import Vuex from 'vuex'
import { login, getInfo } from '@/api'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    token: localStorage.getItem('token') || '',
    userInfo: null,
    role: localStorage.getItem('role') || ''
  },
  mutations: {
    SET_TOKEN(state, token) {
      state.token = token
      localStorage.setItem('token', token)
    },
    SET_USER_INFO(state, info) {
      state.userInfo = info
    },
    SET_ROLE(state, role) {
      state.role = role
      localStorage.setItem('role', role)
    },
    CLEAR_ALL(state) {
      state.token = ''
      state.userInfo = null
      state.role = ''
      localStorage.removeItem('token')
      localStorage.removeItem('role')
    }
  },
  actions: {
    async login({ commit }, loginData) {
      const res = await login(loginData)
      if (res.code === 200) {
        commit('SET_TOKEN', res.data.token)
        const role = res.data.role === 0 ? 'admin' : 'user'
        commit('SET_ROLE', role)
        if (res.data.userInfo) {
          commit('SET_USER_INFO', res.data.userInfo)
        }
      }
      return res
    },
    async getInfo({ commit }) {
      const res = await getInfo()
      if (res.code === 200) {
        commit('SET_USER_INFO', res.data)
        const role = res.data.role === 0 ? 'admin' : 'user'
        commit('SET_ROLE', role)
      }
      return res
    },
    logout({ commit }) {
      commit('CLEAR_ALL')
    }
  },
  getters: {
    isAdmin: state => state.role === 'admin',
    isLoggedIn: state => !!state.token,
    userName: state => {
      if (state.userInfo) {
        return state.userInfo.nickname || state.userInfo.username || ''
      }
      return ''
    }
  }
})