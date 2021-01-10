import Vue from 'vue'

const state = {
  email: '',
  userId: null,
  isLoggedIn: false,
  loginError: '',
  token: localStorage.getItem('token') || ''
}

const getters = {
  isLoggedIn: state => state.isLoggedIn,
  userId: state => state.userId,
  loginError: state => state.loginError
}

const actions = {
  async logInUser ({ commit }, payload) {
    let formData = new FormData()
    formData.append('username', payload.email)
    formData.append('password', payload.password)
    await Vue.axios({
      method: 'POST',
      url: '/auth/token',
      data: formData,
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    })
      .then((resp) => {
        let data = resp.data
        if (data) {
          payload.userId = data.user.user_id
          payload.token = data.access_token
          commit('logInUser', payload)
        }
      })
      .catch(() => {
        commit('loginError')
      })
  },
  logout ({commit}) {
    commit('logout')
  }
}

const mutations = {
  logInUser (state, payload) {
    state.isLoggedIn = true
    state.email = payload.email
    state.userId = payload.userId
    state.token = payload.token
    localStorage.setItem('token', payload.token)
  },
  logout (state) {
    state.isLoggedIn = false
    state.userId = ''
    state.token = ''
    localStorage.removeItem('token')
  },
  loginError (state) {
    state.isLoggedIn = false
    state.loginError = 'Email and /or Password invalid.'
  }
}

export default {
  state,
  getters,
  actions,
  mutations
}
