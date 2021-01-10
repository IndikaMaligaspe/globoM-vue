import Vue from 'vue'

const state = {
  months: [
    { name: 'Zero', abrev: 'ZZZ', index: 0 },
    { name: 'January', abrev: 'Jan', index: 1 },
    { name: 'February', abrev: 'Feb', index: 2 },
    { name: 'March', abrev: 'Mar', index: 3 },
    { name: 'April', abrev: 'Apr', index: 4 },
    { name: 'May', abrev: 'May', index: 5 },
    { name: 'June', abrev: 'Jun', index: 6 },
    { name: 'July', abrev: 'Jul', index: 7 },
    { name: 'August', abrev: 'Aug', index: 8 },
    { name: 'September', abrev: 'Sep', index: 9 },
    { name: 'October', abrev: 'October', index: 10 },
    { name: 'November', abrev: 'Nov', index: 11 },
    { name: 'December', abrev: 'Dec', index: 12 }
  ],
  currentMonth: new Date().getMonth() + 1,
  currentYear: new Date().getFullYear(),
  transactions: [],
  balanceCharges: 0,
  balanceDeposits: 0,
  saveSuccess: false,
  saveMessage: ''
}

const getters = {
  transactionsByMonth: state => state.transactions,
  balanceCharges: state => state.balanceCharges,
  balanceDeposits: state => state.balanceDeposits,
  saveSuccess: state => state.saveSuccess,
  saveMessage: state => state.saveMessage
}

const actions = {
  getTransactionsbyMonth ({ commit, state, rootState }, payload) {
    Vue.axios.get('/transactions/' + state.currentYear + '/' + state.currentMonth,
      {
        headers: {
          'Authorization': `Bearer ${rootState.user.token}`
        }
      })
      .then((resp) => {
        let data = resp.data
        if (data) {
          commit('transactionsByMonth', data)
        }
      })
  },
  getPreviousMonthsBalances ({ commit, state, rootState }, payload) {
    commit('transactionsByMonth', [])
    // Make API call... Pass in selected Month and Year + UserId in hearder...
    if (!rootState.user.userId || rootState.user.userId === undefined) {
      return
    }
    Vue.axios.get('/transactions/balance/' + state.currentYear + '/' + state.currentMonth,
      {headers: {
        'user_id': rootState.user.userId,
        'Authorization': `Bearer ${rootState.user.token}`
      }
      })
      .then((resp) => {
        let data = resp.data
        if (data && data.length > 0) {
          commit('balanceCharges', data[0].charges)
          commit('balanceDeposits', data[0].deposits)
        } else {
          commit('balanceCharges', 0)
          commit('balanceDeposits', 0)
        }
      })
      .catch((err) => {
        console.log('Darn! There was an error getting balances: ' + err)
      })
  },
  async saveTransaction ({ commit, state, rootState }, payload) {
    let curremtDate = new Date()
    const createdDate = [curremtDate.getFullYear(), curremtDate.getMonth() + 1, curremtDate.getDate()].join('-')
    const transaction = {
      'transaction_date': payload.transactionDate,
      'transaction_type': payload.transactionType,
      'description': payload.description,
      'charge': parseInt(payload.charge),
      'deposit': parseInt(payload.deposit),
      'notes': payload.notes,
      'createdOn': createdDate,
      'user_id': rootState.user.userId
    }
    const data = JSON.stringify(transaction)
    const config = {
      method: 'post',
      url: '/transactions',
      headers: {
        'Authorization': `Bearer ${rootState.user.token}`,
        'Content-Type': 'application/json'
      },
      data: data
    }
    await Vue.axios(config)
      .then(() => {
        commit('savedSuccesful')
      })
      .catch(() => {
        commit('savedError')
      })
  },
  async gotoMonth ({ commit }, increment) {
    commit('gotoMonth', increment)
  },
  async gotoCurrentMonth ({ commit }) {
    commit('gotoCurrentMonth')
  }
}

const mutations = {
  transactionsByMonth (state, data) {
    state.transactions = []
    if (data) {
      data.forEach(tx => {
        state.transactions.push(mapTransaction(tx, state))
      })
    }
    console.log('Transactions by month mutated: ', state.transactions)
  },
  balanceCharges (state, data) {
    state.balanceCharges = data
  },
  balanceDeposits (state, data) {
    state.balanceDeposits = data
  },
  gotoMonth (state, increment) {
    let newMonth = state.currentMonth += increment
    // Sanity checks now...
    if (newMonth > 12) {
      newMonth = 1
      state.currentYear += 1
    } else if (newMonth < 1) {
      newMonth = 12
      state.currentYear -= 1
    }
    state.currentMonth = newMonth
  },
  gotoCurrentMonth (state) {
    let dt = new Date(Date.now())
    state.currentMonth = dt.getUTCMonth() + 1
    state.currentYear = dt.getUTCFullYear()
  },
  savedSuccesful (state) {
    state.saveSuccess = true
    state.saveMessage = 'Transaction Saved Successfully'
  },
  savedError (state) {
    state.saveSuccess = false
    state.saveMessage = 'Error while saving'
  }

}

// Helper functions section ------------------------------

function mapTransaction (tx, state) {
  const transDate = new Date(tx.transaction_date)
  const months = state.months
  let transaction = {
    transactionDate: months[transDate.getUTCMonth() + 1].abrev + '-' + transDate.getUTCDate(),
    transactionType: tx.transaction_type,
    description: tx.description,
    charge: moneyFormatter(tx.charge),
    deposit: moneyFormatter(tx.deposit),
    balance: moneyFormatter(calcRunningBalance(tx, state))
  }
  return transaction
}

function moneyFormatter (amount) {
  let formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2
    // the default value for minimumFractionDigits depends on the currency
    // and is usually already 2
  })

  return formatter.format(amount)
}

function calcRunningBalance (tx, state) {
  // any new charges?
  if (tx && tx.charge > 0) {
    state.balanceCharges += tx.charge
  } else if (tx && tx.deposit > 0) {
    state.balanceDeposits += tx.deposit
  }

  return state.balanceCharges - state.balanceDeposits
}
export default {
  state,
  getters,
  actions,
  mutations
}
