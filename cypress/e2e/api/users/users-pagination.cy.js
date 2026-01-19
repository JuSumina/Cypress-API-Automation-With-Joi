import { authHelper } from '../../../support/auth/authHelper';
import { userTestCases } from '../../../fixtures/testData/users/userTestCases';
import { validateJoiSchema } from '../../../support/validators/joiValidator';

describe('Users API - Pagination Tests', () => {
  before(() => {
    cy.log('Logging in before running pagination tests...');
    authHelper.login();
  });

  // Get all pagination-related tests
  const paginationTests = userTestCases.filter(test => 
    test.tags.includes('pagination')
  );

  describe('GET /users - Pagination', () => {
    paginationTests.forEach(testCase => {
      it(`[${testCase.id}] should ${testCase.description}`, () => {
        const startTime = Date.now();
        
        const params = testCase.queryParams;
        const paramStr = Object.keys(params).map(k => `${k}=${params[k]}`).join(', ');
        cy.log(`Testing pagination: ${paramStr}`);
        
        authHelper.authenticatedRequest({
          method: 'GET',
          url: Cypress.env('usersEndpoint'),
          qs: testCase.queryParams
        }).then((response) => {
          const responseTime = Date.now() - startTime;
          
          // Status validation
          expect(response.status, 'Status Code').to.eq(testCase.expectedStatus);
          
          // Schema validation (if specified)
          if (testCase.validate.schema) {
            validateJoiSchema(response.body, testCase.validate.schema);
          }
          
          // Response time validation
          if (testCase.validate.responseTime && testCase.validate.responseTime.max) {
            expect(responseTime, 'Response Time').to.be.lessThan(testCase.validate.responseTime.max);
          }
          
          // Exact results validation
          if (testCase.validate.exactResults !== undefined) {
            expect(response.body.users.length, 'Exact Results').to.eq(testCase.validate.exactResults);
          }
          
          // Min results validation
          if (testCase.validate.minResults !== undefined) {
            expect(response.body.users.length, 'Minimum Results').to.be.at.least(testCase.validate.minResults);
          }
          
          // Custom validation
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