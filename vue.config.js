'use strict'
const port = process.env.port || process.env.npm_config_port || 80 // 端口
module.exports = {
  // 将 examples 目录添加为新的页面
  lintOnSave: false,
  devServer: {
    host: '0.0.0.0',
    port: port,
    open: true,
    proxy: {
      // detail: https://cli.vuejs.org/config/#devserver-proxy
      [process.env.VUE_APP_BASE_API]: {
        // target: `http://192.168.3.121:8080/`,
        // target: `http://192.168.3.184:8080/`, // 于俊服务器
        target: `http://192.168.3.214:2223/stage-api/`,
        changeOrigin: true,
        pathRewrite: {
          ['^' + process.env.VUE_APP_BASE_API]: ''
        }
      }
    },
    disableHostCheck: true
  },

}
