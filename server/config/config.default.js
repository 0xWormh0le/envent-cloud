const fspath = require('path');

/**
 * Default configuration
 */
let defaultConfig = {
  app: {
    name: 'envent-cloud', // TODO: Lowercase, URL compatible name
    title: 'Envent.Cloud' // TODO: Human friendly name
  },
  auth: {
    verifyEmail: false, // If true, require email verification when signing up
    resetPassword: false // If true, be able to reset password via email
  },
  email: {
    from: 'no-reply@envent.cloud', // TODO
    to: '',
    signature: 'The Envent Team' // TODO
  },
  jwt: {
    secret: 'This will be overriden by environment variable JWT_SECRET',
    algorithm: 'HS512',
    expiresIn: 60 * 24 * 60 * 60 // seconds
  },
  mongo: {
    uri: 'This will be overriden by environment variable MONGO_URI',
    testUri: 'mongodb://localhost:27017/mern_test'
  },
  sendgrid: {
    apiKey:
      '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'
  },
  server: {
    port: 'This will be overriden by environment variable SERVER_PORT',
    url: 'http://localhost' // TODO:
  },
  paths: {
    root: fspath.normalize(`${__dirname}/..`)
  },
  seed: {
    logging: true,
    users: []
  }
};

module.exports = defaultConfig;
