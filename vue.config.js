const { defineConfig } = require('@vue/cli-service');
const webpack = require('webpack');

module.exports = defineConfig({
  devServer: {
    port: 8080,
    host: '0.0.0.0',
    allowedHosts: 'all'    
  },
  transpileDependencies: true,
  configureWebpack: {
    resolve: {
      alias: {
        'vue$': 'vue/dist/vue.esm-bundler.js'
      }
    },
    plugins: [
      new webpack.DefinePlugin({
        '__VUE_PROD_DEVTOOLS__': JSON.stringify(false),
        '__VUE_PROD_HYDRATION_MISMATCH_DETAILS__': JSON.stringify(false),
        '__VUE_OPTIONS_API__': JSON.stringify(true),
        '__VUE_PROD_WARN__': JSON.stringify(false)
      })
    ]
  },
  chainWebpack: (config) => {
    config.plugin('html').tap((args) => {
      args[0].templateParameters = {
        ...(args[0].templateParameters || {}), 
        BASE_URL: args[0].BASE_URL,
        QSC_SEARCHHUB_COLLECTOR_ID: process.env.QSC_SEARCHHUB_COLLECTOR_ID,
      };
      return args;
    });
  },
  pluginOptions: {
    vuetify: {
      // customVariables: ['~/assets/variables.scss']
    }
  }
});
