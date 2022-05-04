var appRoot = require('app-root-path');
var convict = require('convict');

// -----------------------------------------------------------------------------------------------------

var config = convict({
  env: {
    doc: 'The application environment.',
    format: ['production', 'development', 'test'],
    default: 'development',
    env: 'NODE_ENV'
  },
  ip: {
    doc: 'The IP address to bind.',
    format: String,
    default: '127.0.0.1',
    env: 'IP_ADDRESS',
  },
  port: {
    doc: 'The port to bind.',
    format: Number,
    default: 3000,
    env: 'PORT',
    arg: 'port'
  },
  https: {
    doc: 'Toggle for https support',
    format: Boolean,
    default: false,
    env: 'HTTPS',
    arg: 'https'
  },
  db: {
    host: {
      doc: 'Database host name/IP',
      format: String,
      default: 'localhost'
    },
    name: {
      doc: 'Database name',
      format: String,
      default: 'web'
    },
    debug: {
      doc: 'Database debug enable',
      format: Boolean,
      default: false
    }
  },
  defaultLanguage: {
    doc: "Default language",
    format: String,
    default: 'fr'
  },
  langs: {
    doc: 'Collection of langs',
    format: '*',
    default: [{
      name: 'fr',
      file: appRoot + '/langs/fr.json'
    }, {
      name: 'en',
      file: appRoot + '/langs/en.json'
    }]
  },
  defaultTheme: {
    doc: "Default theme",
    format: String,
    default: 'theme-default'
  },
  themes: {
    doc: 'Collection of themes',
    format: '*',
    default: ['theme-default', 'theme-green', 'theme-red']
  },
  defaultAvatar: {
    doc: 'Default avatar',
    format: String,
    default: '/images/default-profile-img.jpg'
  },
  uploads: {
    profile: {
      image: {
        dest: 'public/uploads/profile-img',
        limits: {
          fileSize: 1 * 1024 * 1024 // Max file size in bytes (1 MB)
        }
      }
    }
  }
});

// Perform validation
config.validate({ allowed: 'strict' });
module.exports = config;