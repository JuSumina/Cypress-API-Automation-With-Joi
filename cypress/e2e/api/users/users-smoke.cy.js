import { authHelper } from '../../../support/auth/authHelper';
import { runQueryTests } from '../../../support/utils/testRunner';
import { userTestCases } from '../../../fixtures/testData/users/userTestCases';
import { randomDateRange } from './randomDataGenerator';

describe('Users API - Smoke Tests', () => {
  before(() => {
    cy.log('Logging in before running tests...');
    authHelper.login();
  });

  // Filter smoke tests
  const smokeTests = userTestCases.filter(test => test.tags.includes('smoke'));

  // Separate tests by endpoint type
  const standardTests = smokeTests.filter(test => !test.customEndpoint);
  const customEndpointTests = smokeTests.filter(test => test.customEndpoint);

  // Tests for GET /users (standard endpoint)
  describe('GET /users', () => {
    runQueryTests(Cypress.env('usersEndpoint'), standardTests);
  });

  // Tests for GET /users/:id (custom endpoints)
  describe('GET /users/:id', () => {
    customEndpointTests.forEach(testCase => {
      it(`[${testCase.id}] should ${testCase.description}`, () => {
        const startTime = Date.now();
        
        authHelper.authenticatedRequest({
          method: 'GET',
          url: testCase.customEndpoint,
          qs: testCase.queryParams
        }).then((response) => {
          const responseTime = Date.now() - startTime;
          

          expect(response.status).to.eq(testCase.expectedStatus);
          

          if (testCase.validate.schema) {
            const { validateJoiSchema } = require('../../../support/validators/joiValidator');
            validateJoiSchema(response.body, testCase.validate.schema);
          }
          

          if (testCase.validate.responseTime && testCase.validate.responseTime.max) {
            expect(responseTime).to.be.lessThan(testCase.validate.responseTime.max);
          }
          

          if (testCase.validate.fields) {
            Object.keys(testCase.validate.fields).forEach(fieldName => {
              const fieldValidation = testCase.validate.fields[fieldName];
              
              if (fieldValidation.equals !== undefined) {
                expect(response.body[fieldName]).to.eq(fieldValidation.equals);
              }
              if (fieldValidation.notNull) {
                expect(response.body[fieldName]).to.not.be.null;
              }
              if (fieldValidation.pattern) {
                expect(response.body[fieldName]).to.match(new RegExp(fieldValidation.pattern));
              }
            });
          }
          

          if (testCase.validate.custom) {
            testCase.validate.custom(response, responseTime);
          }
          
          cy.log(`Test ${testCase.id} completed in ${responseTime}ms`);
        });
      });
    });
  });


  after(() => {
    authHelper.logout();
  });
});