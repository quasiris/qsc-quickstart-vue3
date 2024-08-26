const { defineConfig } = require('@vue/cli-service');
const webpack = require('webpack');

module.exports = defineConfig({
  transpileDependencies: true,

  configureWebpack: {
    plugins: [
      // DefinePlugin to set Vue feature flags for better tree-shaking and production optimizations
      new webpack.DefinePlugin({
        '__VUE_PROD_DEVTOOLS__': JSON.stringify(false),
        '__VUE_PROD_HYDRATION_MISMATCH_DETAILS__': JSON.stringify(false),
        '__VUE_OPTIONS_API__': JSON.stringify(true),  
        '__VUE_PROD_WARN__': JSON.stringify(false)    
      })
    ]
  },

  pluginOptions: {
    vuetify: {
      //  customVariables: ['~/assets/variables.scss']
    }
  }
});
