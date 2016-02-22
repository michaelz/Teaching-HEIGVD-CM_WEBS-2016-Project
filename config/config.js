var path = require('path'),
    rootPath = path.normalize(__dirname + '/..'),
    env = process.env.NODE_ENV || 'development';

var config = {
  development: {
    root: rootPath,
    app: {
      name: 'webservexpress'
    },
    port: 3000,
    db: 'mongodb://localhost/webservexpress-development'
  },

  test: {
    root: rootPath,
    app: {
      name: 'webservexpress'
    },
    port: 3000,
    db: 'mongodb://localhost/webservexpress-test'
  },

  production: {
    root: rootPath,
    app: {
      name: 'webservexpress'
    },
    port: 3000,
    db: 'mongodb://localhost/webservexpress-production'
  }
};

module.exports = config[env];
