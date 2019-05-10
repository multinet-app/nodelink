const process = require('process');

module.exports = {
  devServer: {
    proxy: {
      '/multinet/*': {
        target: process.env.MULTINET_HOST || 'http://localhost:9090',
        secure: false,
        pathRewrite: function (path) {
          return `/api/v1/multinet/${path.split('/').slice(2).join('/')}`;
        },
      },
    }
  }
};
