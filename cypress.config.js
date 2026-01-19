const { defineConfig } = require('cypress');
require('dotenv').config();

module.exports = defineConfig({
  e2e: {
    baseUrl: 'https://dummyjson.com',
    
    env: {

      API_USERNAME: process.env.API_USERNAME,
      API_PASSWORD: process.env.API_PASSWORD,

      // Authentication endpoints
      loginEndpoint: '/auth/login',
      
      // API endpoints
      usersEndpoint: '/users',
      
      // Test execution config
      testExecution: {
        mode: process.env.TEST_MODE || 'full', // smoke, regression, full
        maxTestsPerSuite: 50 //TBD
      },
      
      // Timeouts
      apiTimeout: 10000,
      
      // Enable/disable features
      enableSchemaValidation: true,
      enablePerformanceChecks: true
    },
    
    setupNodeEvents(on, config) {
      console.log('API_USERNAME from .env:', process.env.API_USERNAME || 'NOT FOUND');
      return config;
    },
    
    // Retry configuration
    retries: {
      runMode: 2,
      openMode: 0
    },
    
    // Video and screenshot settings
    video: true,
    screenshotOnRunFailure: true,
    

  }
});
