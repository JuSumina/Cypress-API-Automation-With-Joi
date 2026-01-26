const { defineConfig } = require('cypress');
require('dotenv').config();

const fs = require('fs');
const path = require('path');

function loadEnvConfig(envName) {
  const filePath = path.resolve(__dirname, 'cypress', 'config', `${envName}.json`);

  if (!fs.existsSync(filePath)) {
    throw new Error(`Missing env config file: ${filePath}`);
  }

  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

module.exports = defineConfig({
  e2e: {

    env: {
      API_USERNAME: process.env.API_USERNAME,
      API_PASSWORD: process.env.API_PASSWORD,

      // default behavior flags (can be overridden by env json)
      enableSchemaValidation: true,
      enablePerformanceChecks: true,

      // Test execution config
      testExecution: {
        mode: process.env.TEST_MODE || 'full', // smoke, regression, full
        maxTestsPerSuite: 50
      },

      // Timeouts
      apiTimeout: 10000
    },

    setupNodeEvents(on, config) {
      const envName = (config.env.ENV || process.env.ENV || 'dev').toString().toLowerCase();
      const envConfig = loadEnvConfig(envName);

      // set baseUrl from the env file (preferred key: apiBaseUrl)
      config.baseUrl = envConfig.apiBaseUrl || envConfig.baseUrl || config.baseUrl;

      // merge env file values into Cypress env
      config.env = {
        ...config.env,
        ...envConfig,
        ENV: envName,
        // re-apply secrets from process.env (overrides anything in json)
        API_USERNAME: process.env.API_USERNAME,
        API_PASSWORD: process.env.API_PASSWORD
      };

      console.log(`Running ENV = ${envName}`);
      console.log('baseUrl =', config.baseUrl);
      console.log('API_USERNAME from .env:', process.env.API_USERNAME ? 'FOUND' : 'NOT FOUND');

      return config;
    },

    retries: {
      runMode: 2,
      openMode: 0
    },

    video: true,
    screenshotOnRunFailure: true
  }
});