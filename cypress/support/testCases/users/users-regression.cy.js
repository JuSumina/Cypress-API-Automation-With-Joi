import { authHelper } from '../../../support/auth/authHelper';
import { runQueryTests } from '../../../support/utils/testRunner';
import { userTestCases } from '../../../fixtures/testData/users/userTestCases';

describe('Users API - Regression Tests', () => {
  before(() => {
    authHelper.login();
  });


  const regressionTests = userTestCases.filter(test => 
    test.tags.includes('regression') || test.tags.includes('smoke')
  );

  describe('GET /users - All Regression Scenarios', () => {
    const standardTests = regressionTests.filter(test => !test.customEndpoint);
    runQueryTests(Cypress.env('usersEndpoint'), standardTests);
  });

  describe('GET /users with filters - Regression', () => {
    const customTests = regressionTests.filter(test => test.customEndpoint);
    
    customTests.forEach(testCase => {
      it(`[${testCase.id}] should ${testCase.description}`, () => {
        authHelper.authenticatedRequest({
          method: 'GET',
          url: testCase.customEndpoint,
          qs: testCase.queryParams
        }).then((response) => {
          expect(response.status).to.eq(testCase.expectedStatus);
          
          if (testCase.validate.custom) {
            testCase.validate.custom(response);
          }
        });
      });
    });
  });

  after(() => {
    authHelper.logout();
  });
});