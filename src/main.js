import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import ElementUI from 'element-ui';
import 'element-ui/lib/theme-chalk/index.css';
import tcollespet from 'tcollespet'
import selfDirective from './components/directive/index'
import Print from 'vue-print-nb'

Vue.use(ElementUI);
Vue.use(tcollespet);
Vue.use(selfDirective)
Vue.use(Print);
Vue.config.productionTip = false

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
