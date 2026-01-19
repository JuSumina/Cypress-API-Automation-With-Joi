import './commands';

// Global before hook
before(() => {
  cy.log('Starting Test Suite');
  cy.log(`Environment: ${Cypress.config('baseUrl')}`);
});

// Global after hook  
after(() => {
  cy.log('Test Suite Completed');
});