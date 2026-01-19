import { validateJoiSchema } from '../validators/joiValidator';
import { authHelper } from '../auth/authHelper';

export const runQueryTests = (endpoint, testCases, options = {}) => {
  testCases.forEach((testCase) => {
    const { 
      id,
      description, 
      queryParams, 
      expectedStatus, 
      validate = {},
      tags = [],
      skip = false,
      only = false,
      requireAuth = true
    } = testCase;

    const itFunction = skip ? it.skip : only ? it.only : it;

    itFunction(`[${id}] should ${description}`, () => {
      const startTime = Date.now();

      // Prepare request options
      const requestOptions = {
        method: options.method || 'GET',
        url: endpoint,
        qs: queryParams,
        failOnStatusCode: false
      };

      // Make request (with or without auth)
      const request = requireAuth 
        ? authHelper.authenticatedRequest(requestOptions)
        : cy.request(requestOptions);

      request.then((response) => {
        const responseTime = Date.now() - startTime;

        cy.log(`Response Status: ${response.status}`);
        cy.log(`Response Time: ${responseTime}ms`);

        // 1. Status code validation
        expect(response.status, 'Status Code').to.eq(expectedStatus);

        // 2. Schema Validation
        if (validate.schema && Cypress.env('enableSchemaValidation') !== false) {
          cy.log('Validating schema...');
          validateJoiSchema(response.body, validate.schema);
        }

        // 3. Response time validation
        if (validate.responseTime && Cypress.env('enablePerformanceChecks') !== false) {
          if (validate.responseTime.max) {
            expect(responseTime, 'Response Time').to.be.lessThan(validate.responseTime.max);
          }
          if (validate.responseTime.min) {
            expect(responseTime, 'Response Time').to.be.greaterThan(validate.responseTime.min);
          }
        }

        // 4. Results count validation
        if (validate.exactResults !== undefined) {
          const count = response.body.users ? response.body.users.length : 
                        (Array.isArray(response.body) ? response.body.length : 0);
          expect(count, 'Exact Results Count').to.eq(validate.exactResults);
        }
        if (validate.minResults !== undefined) {
          const count = response.body.users ? response.body.users.length : 
                        (Array.isArray(response.body) ? response.body.length : 0);
          expect(count, 'Minimum Results').to.be.at.least(validate.minResults);
        }
        if (validate.maxResults !== undefined) {
          const count = response.body.users ? response.body.users.length : 
                        (Array.isArray(response.body) ? response.body.length : 0);
          expect(count, 'Maximum Results').to.be.at.most(validate.maxResults);
        }

        // 5. Field-level validations
        if (validate.fields) {
          cy.log('🔍 Validating fields...');
          const items = response.body.users || (Array.isArray(response.body) ? response.body : [response.body]);
          
          items.forEach((item, index) => {
            Object.keys(validate.fields).forEach(fieldName => {
              const fieldValidation = validate.fields[fieldName];
              
              if (fieldValidation.equals !== undefined) {
                expect(item[fieldName], `Field: ${fieldName} [item ${index}]`).to.eq(fieldValidation.equals);
              }
              if (fieldValidation.contains) {
                expect(item[fieldName], `Field: ${fieldName} contains`).to.include(fieldValidation.contains);
              }
              if (fieldValidation.pattern) {
                expect(item[fieldName], `Field: ${fieldName} pattern`).to.match(new RegExp(fieldValidation.pattern));
              }
              if (fieldValidation.notNull) {
                expect(item[fieldName], `Field: ${fieldName} not null`).to.not.be.null;
              }
            });
          });
        }

        // 6. Header validations
        if (validate.headers) {
          cy.log('Validating headers...');
          Object.keys(validate.headers).forEach(headerName => {
            expect(response.headers[headerName.toLowerCase()]).to.eq(validate.headers[headerName]);
          });
        }

        // 7. Custom validation
        if (validate.custom && typeof validate.custom === 'function') {
          cy.log('Running custom validations...');
          validate.custom(response, responseTime);
        }

        cy.log(`Test ${id} completed successfully`);
      });
    });
  });
};