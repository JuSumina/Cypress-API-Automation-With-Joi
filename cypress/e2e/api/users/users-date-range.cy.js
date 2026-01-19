import { authHelper } from '../../../support/auth/authHelper';
import { dateRangeTests } from '../../../fixtures/testData/users/dateRangeTests';

describe('Users API - Date Range Query Tests', () => {
  before(() => {
    cy.log('Logging in before running date range tests...');
    authHelper.login();
  });

  // Get all date-range tests
  const dateRangeTests = dateRangeTests.filter(test => 
    test.tags.includes('date-range')
  );

  // Separate by endpoint type
  const standardEndpointTests = dateRangeTests.filter(test => !test.customEndpoint);
  const filterEndpointTests = dateRangeTests.filter(test => test.customEndpoint);

  // Tests for standard endpoint: GET /users?birthDateFrom=...&birthDateTo=...
  describe('GET /users - Date Range Queries', () => {
    standardEndpointTests.forEach(testCase => {
      it(`[${testCase.id}] should ${testCase.description}`, () => {
        const startTime = Date.now();
        
        const { birthDateFrom, birthDateTo } = testCase.queryParams;
        if (birthDateFrom && birthDateTo) {
          cy.log(`Date Range: ${birthDateFrom} to ${birthDateTo}`);
        }
        
        authHelper.authenticatedRequest({
          method: 'GET',
          url: Cypress.env('usersEndpoint'),
          qs: testCase.queryParams
        }).then((response) => {
          const responseTime = Date.now() - startTime;
          
          // Status validation
          expect(response.status, 'Status Code').to.eq(testCase.expectedStatus);
          
          // Schema validation
          if (testCase.validate.schema) {
            const { validateJoiSchema } = require('../../../support/validators/joiValidator');
            validateJoiSchema(response.body, testCase.validate.schema);
          }
          
          // Response time validation
          if (testCase.validate.responseTime && testCase.validate.responseTime.max) {
            expect(responseTime, 'Response Time').to.be.lessThan(testCase.validate.responseTime.max);
          }
          
          // Results count validation
          if (testCase.validate.exactResults !== undefined) {
            const count = response.body.users ? response.body.users.length : 0;
            expect(count, 'Exact Results').to.eq(testCase.validate.exactResults);
          }
          if (testCase.validate.minResults !== undefined) {
            const count = response.body.users ? response.body.users.length : 0;
            expect(count, 'Minimum Results').to.be.at.least(testCase.validate.minResults);
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

  // Tests for filter endpoint: GET /users/filter?key=birthDate&from=...&to=...
  if (filterEndpointTests.length > 0) {
    describe('GET /users/filter - Date Range Queries', () => {
      filterEndpointTests.forEach(testCase => {
        it(`[${testCase.id}] should ${testCase.description}`, () => {
          const startTime = Date.now();
          
          const { from, to } = testCase.queryParams;
          if (from && to) {
            cy.log(`Filter Date Range: ${from} to ${to}`);
          }
          
          authHelper.authenticatedRequest({
            method: 'GET',
            url: testCase.customEndpoint,
            qs: testCase.queryParams
          }).then((response) => {
            const responseTime = Date.now() - startTime;
            
            expect(response.status, 'Status Code').to.eq(testCase.expectedStatus);
            
            if (testCase.validate.schema) {
              const { validateJoiSchema } = require('../../../support/validators/joiValidator');
              validateJoiSchema(response.body, testCase.validate.schema);
            }
            
            if (testCase.validate.responseTime && testCase.validate.responseTime.max) {
              expect(responseTime, 'Response Time').to.be.lessThan(testCase.validate.responseTime.max);
            }
            
            if (testCase.validate.custom) {
              testCase.validate.custom(response, responseTime);
            }
            
            cy.log(`Test ${testCase.id} completed in ${responseTime}ms`);
          });
        });
      });
    });
  }

  after(() => {
    authHelper.logout();
  });
});