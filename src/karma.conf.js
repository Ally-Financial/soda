module.exports = function (config) {
  config.set({
      basePath: '',
      frameworks: ['jasmine'],
      files: [
          '**/*.js',
          'spec/*Spec.js'
      ],
      preprocessors: {
        '**!(node_modules|sample_project|spec|support|docs|fonts|external|img|)/*.js': ['coverage']
      },
      plugins: [
          'karma-jasmine',
          'karma-chrome-launcher',
          'karma-coverage'
      ],
      reporters: ['progress', 'coverage'],
      port: 9878,
      colors: true,
      logLevel: config.LOG_DEBUG,
      autowatch: true,
      browsers: ['Chrome'],
      customLaunchers: {
        Chrome_without_security: {
          base: 'Chrome',
          flags: ['--disable-web-security', '--disable-site-isolation-trials']
        }
      },
      singleRun: false,
      concurrency: Infinity,
      coverageReporter: {
          includeAllSources: true,
          dir: 'coverage/',
          reporters: [
              { type: "html", subdir: "html" },
              { type: 'text-summary' }
          ]
      }
  });
};