const webpack = require('./webpack.conf.js');

module.exports = (config) => {
  config.set({
    plugins: ['karma-chrome-launcher', 'karma-webpack', 'karma-jasmine'],
    frameworks: ['jasmine'],
    // ... normal karma configuration
    files: [
      // all files ending in "_test"
      { pattern: '../test/*_test.js', watched: false },
      // { pattern: 'test/**/*_test.js', watched: false }
      // each file acts as entry point for the webpack configuration
    ],

    preprocessors: {
      // add webpack as preprocessor
      '../test/*_test.js': ['webpack'],
    },
    browsers: ['Chromium'],

    webpack,

    webpackMiddleware: {
      // webpack-dev-middleware configuration
      // i. e.
      stats: 'errors-only',
    },
  });
};
