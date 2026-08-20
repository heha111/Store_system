module.exports = {
  publicPath: '/Store_system/',
  devServer: {
    port: 8080,
    proxy: {
      '/api': {
        target: 'http://localhost:8088',
        changeOrigin: true
      }
    }
  }
}