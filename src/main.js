import { createApp } from 'vue'
import App from './App.vue'
import vuetify from './plugins/vuetify'
import { loadFonts } from './plugins/webfontloader'
import VueSvgInlinePlugin from "vue-svg-inline-plugin";
import store  from './store/store'
import "vue-svg-inline-plugin/src/polyfills";

loadFonts()

const app = createApp(App);
    app.use(vuetify)
      .use(VueSvgInlinePlugin, {
        attributes: {
          data: [ "src" ],
          remove: [ "alt" ]
        }
      })
      .use(store);
    store.dispatch('initializeSession');
    app.mount('#app')
