import { authHelper } from '../../../support/auth/authHelper';
import { runQueryTests } from '../../../support/utils/testRunner';
import { dateTimeFormatTests } from '../../../fixtures/testData/users/dateTimeFormatTests';

describe('Users API - DateTime Format Validation', () => {
  before(() => {
    cy.log('Logging in before running datetime format tests...');
    authHelper.login();
  });

  // Group tests by category
  const validFormatTests = dateTimeFormatTests.filter(t => t.tags.includes('valid'));
  const invalidFormatTests = dateTimeFormatTests.filter(t => t.tags.includes('invalid'));
  const responseFormatTests = dateTimeFormatTests.filter(t => t.tags.includes('response-format'));
  const edgeCaseTests = dateTimeFormatTests.filter(t => t.tags.includes('edge-case'));

  describe('Valid DateTime Formats (Request)', () => {
    runQueryTests(Cypress.env('usersEndpoint'), validFormatTests);
  });

  describe('Invalid DateTime Formats (Request)', () => {
    runQueryTests(Cypress.env('usersEndpoint'), invalidFormatTests);
  });

  describe('DateTime Format in Response', () => {
    // For tests with customEndpoint, filter and handle separately
    const standardTests = responseFormatTests.filter(t => !t.customEndpoint);
    const customTests = responseFormatTests.filter(t => t.customEndpoint);
    
    runQueryTests(Cypress.env('usersEndpoint'), standardTests);
    
    // Handle custom endpoint tests
    customTests.forEach(testCase => {
      it(`[${testCase.id}] should ${testCase.description}`, () => {
        authHelper.authenticatedRequest({
          method: 'GET',
          url: testCase.customEndpoint,
          qs: testCase.queryParams
        }).then((response) => {
          expect(response.status).to.eq(testCase.expectedStatus);
          
          if (testCase.validate.schema) {
            const { validateJoiSchema } = require('../../../support/validators/joiValidator');
            validateJoiSchema(response.body, testCase.validate.schema);
          }
          
          if (testCase.validate.custom) {
            testCase.validate.custom(response);
          }
        });
      });
    });
  });

  describe('DateTime Edge Cases', () => {
    runQueryTests(Cypress.env('usersEndpoint'), edgeCaseTests);
  });

  after(() => {
    authHelper.logout();
  });
});