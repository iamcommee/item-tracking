import Vue from 'vue'

Vue.filter('capitalize', (string) => string.replace(/^./, string[0].toUpperCase()))
Vue.filter('singularize', (string) => string.slice(0, -1))
