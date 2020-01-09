exports.config = {
  tests: './*_test.js',
  output: './output',
  helpers: {
    WebDriver: {
      url: 'http://localhost',
      browser: 'chrome',
    },
  },

  plugins: {
    selenoid: {
      require: '../lib/index',
      enabled: true,
      autoStart: true,
      sessionTimeout: '30m',
      enableVideo: true,
      enableLog: true,
    },
  },
  include: {},
  bootstrap: null,
  mocha: {},
  name: 'example',
};
