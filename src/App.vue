<template>
  <v-app id="app">
    <router-view />
  </v-app>
</template>

<script>
export default {
  name: 'App'
}

</script>
<style>

@import 'https://fonts.googleapis.com/css?family=Roboto:300,400,500,700|Material+Icons';
@import  'https://cdn.jsdelivr.net/npm/@mdi/font@4.x/css/materialdesignicons.min.css';

#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
