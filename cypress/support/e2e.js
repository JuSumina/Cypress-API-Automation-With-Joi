import './commands';

// Global before hook
before(() => {
  cy.log('Starting Test Suite');
  cy.log(`Base URL: ${Cypress.config('baseUrl')}`);
  const env = (Cypress.env('ENV')).toLowerCase();
  cy.log(`Running tests in ENV: ${env}`);
});

// Global after hook  
after(() => {
  cy.log('Test Suite Completed');
});