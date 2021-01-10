// The Vue build version to load with the `import` command
// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App'
import router from './router'
import vuetify from '@/plugins/vuetify'
import axios from 'axios'

import store from './store'

Vue.config.productionTip = false

Vue.axios = Vue.prototype.$http = axios.create({
  baseURL: 'http://localhost:8000/'
})

/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  store,
  vuetify,
  components: { App },
  template: '<App/>'
})
