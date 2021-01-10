<template>
<div>
    <v-btn
      fab
      bottom
      right
      color="orange"
      dark
      fixed
      v-on:click.stop="showEditTransactionDialog"
    >
      <v-icon>add</v-icon>
    </v-btn>
    <v-dialog v-model="dialog" width="800px">
      <v-card style="width: 100%;">
        <v-card-title> New Transaction</v-card-title>
        <v-container>
          <v-layout row wrap>
            <v-flex xs12>
              <v-menu
                ref="datePicker"
                :close-on-content-click="false"
                transition="scale-transition"
                offset-y
                :nudge-right="40"
                max-width="290px"
                max-height="290px"
                v-model="transactionDatePicker"
              >
                <template v-slot:activator="{ on }">
                  <v-text-field
                    label="Select transaction Date"
                    prepend-icon="event"
                    v-model="transaction.transactionDate"
                    v-on="on"
                    readonly>
                  </v-text-field>
                </template>
                <v-date-picker
                  v-model="transaction.transactionDate"
                  v-on:input="$refs.datePicker.save(transaction.transactionDate)" />

              </v-menu>
            </v-flex>
            <v-flex xs12>
              <v-select
              prepend-icon="credit_card"
              v-bind:items="transactionTypes"
              label="Credit Card"
              v-model="transaction.transactionType"
              single-line
              >
              </v-select>
            </v-flex>
            <v-flex xs12>
              <v-text-field
                prepend-icon="description"
                placeholder="Description"
                v-model="transaction.description"
                >
              </v-text-field>
            </v-flex>
            <v-flex>
              <v-text-field
                prepend-icon="remove_circle"
                placeholder="Charge (-)"
                v-model="transaction.charge"
                >
              </v-text-field>
            </v-flex>
            <v-flex>
              <v-text-field
                prepend-icon="add_circle"
                placeholder="Deposit (+)"
                v-model="transaction.deposit"
                >
              </v-text-field>
            </v-flex>
            <v-flex xs12>
              <v-text-field
                prepend-icon="notes"
                placeholder="Notes"
                v-model="transaction.notes"
                >
              </v-text-field>
            </v-flex>
          </v-layout>
        </v-container>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn  color="primary" @click="dialog = false">Cancel</v-btn>
          <v-btn  @click="saveTransaction">Save</v-btn>
        </v-card-actions>
      </v-card>
      <v-snackbar
      :timeout="6000"
      :top="true"
      v-model="showAlert"
      >
        {{ savingMessage }}
      <v-btn text color="pink" v-on:click="showHideDialog()">Close</v-btn>
    </v-snackbar>
    </v-dialog>
  </div>
</template>
<script>
export default {
  name: 'EditTransaction',
  data: () => ({
    dialog: false,
    showAlert: false,
    transaction: {
      id: null,
      transactionDate: null,
      transactionType: null,
      description: '',
      notes: '',
      charge: 0.0,
      deposit: 0.0
    },
    transactionTypes: [
      { text: 'Credit Card', value: 'Credit Card' },
      { text: 'Debit Card', value: 'Debit Card' },
      { text: 'Check', value: 'Check' },
      { text: 'Deposit', value: 'Deposit' }
    ],
    transactionDatePicker: false
  }),
  computed: {
    savingMessage () {
      return this.$store.getters.saveMessage
    },
    isSaved () {
      return this.$store.getters.saveSuccess
    }
  },
  methods: {
    saveTransaction: function () {
      this.$store.dispatch('saveTransaction', this.transaction)
        .then((resp) => {
          if (this.isSaved) {
            this.$store.dispatch('getTransactionsByMonth')
              .then(() => {
                this.$store.dispatch('getPreviousMonthsBalances')
              })
          }
          this.showAlert = true
        })
      if (this.isSaved) {
        this.dialog = false
      }
    },
    showEditTransactionDialog: function () {
      this.transaction.transactionDate = this.getCurrentDate()
      this.dialog = true
    },
    getCurrentDate: function () {
      const dt = new Date(Date.now())
      let month = '' + (dt.getMonth() + 1)
      let day = '' + dt.getDate()
      let year = dt.getFullYear()

      if (month.length < 2) month = '0' + month
      if (day.length < 2) day = '0' + day

      return [year, month, day].join('-')
    },
    showHideDialog: function () {
      if (this.isSaved) {
        this.dialog = false
      }
      this.showAlert = false
    }
  }
}
</script>

<style>

</style>
