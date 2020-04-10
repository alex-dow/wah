module.exports = {
  runtimeCompiler: true,
  css: {
    sourceMap: true
  },
  devServer: {
    proxy: {
      '^/api': {
        target: 'http://127.0.0.1:3000',
        changeOrigin: true
      },
      '^/socket.io': {
        target: 'http://127.0.0.1:3000',
        changeOrigin: true,
        ws: true
      }
    }
  }
}
