import { validateJoiSchema } from '../../validators/joiValidator';
import { authHelper } from '../../auth/authHelper';
import { normalizeResponse } from '../responseNormalizer';

export const runQueryTests = (endpoint, testCases, options = {}) => {
  testCases.forEach((testCase) => {
    const {
      id,
      description,
      queryParams,
      expectedStatus,
      validate = {},
      skip = false,
      only = false,
      requireAuth = true,
      customEndpoint, // allow per-test override
    } = testCase;

    const itFunction = skip ? it.skip : only ? it.only : it;

    itFunction(`[${id}] should ${description}`, () => {
      const startTime = Date.now();

      const requestOptions = {
        method: options.method || 'GET',
        url: customEndpoint ? `${customEndpoint}` : endpoint,
        qs: queryParams,
        failOnStatusCode: false,
      };

      const request = requireAuth
        ? authHelper.authenticatedRequest(requestOptions)
        : cy.request(requestOptions);

      request.then((response) => {
        const responseTime = Date.now() - startTime;

        cy.log(`Response Status: ${response.status}`);
        cy.log(`Response Time: ${responseTime}ms`);

        // ✅ Normalize once
        const normalized = normalizeResponse(response, {
          // Optional per-test overrides if you want later:
          listPath: validate.listPath,
          totalPath: validate.totalPath,
          idPath: validate.idPath,
        });

        // 1) Status code validation
        expect(response.status, 'Status Code').to.eq(expectedStatus);

        // 2) "No body" handling
        const expectsNoBody =
          validate.noBody === true ||
          expectedStatus === 204 ||
          response.status === 204;

        if (expectsNoBody) {
          // For 204, Cypress usually gives body = "" or null.
          // We don't validate schema, fields, list counts, etc.
          if (validate.custom && typeof validate.custom === 'function') {
            validate.custom(response, responseTime, normalized);
          }
          return;
        }

        // 3) Schema Validation (only if body is an object/array)
        if (
          validate.schema &&
          Cypress.env('enableSchemaValidation') !== false &&
          normalized.body !== undefined &&
          normalized.body !== null &&
          normalized.body !== ''
        ) {
          cy.log('Validating schema...');
          validateJoiSchema(normalized.body, validate.schema);
        }

        // 4) Response time validation
        if (validate.responseTime && Cypress.env('enablePerformanceChecks') !== false) {
          if (validate.responseTime.max) {
            expect(responseTime, 'Response Time').to.be.lessThan(validate.responseTime.max);
          }
          if (validate.responseTime.min) {
            expect(responseTime, 'Response Time').to.be.greaterThan(validate.responseTime.min);
          }
        }

        // 5) Results count validations (now uses normalized.items)
        if (validate.exactResults !== undefined) {
          expect(normalized.items.length, 'Exact Results Count').to.eq(validate.exactResults);
        }
        if (validate.minResults !== undefined) {
          expect(normalized.items.length, 'Minimum Results').to.be.at.least(validate.minResults);
        }
        if (validate.maxResults !== undefined) {
          expect(normalized.items.length, 'Maximum Results').to.be.at.most(validate.maxResults);
        }

        // Optional: total validations if your API returns totals
        if (validate.totalEquals !== undefined) {
          expect(normalized.total, 'Total Count').to.eq(validate.totalEquals);
        }
        if (validate.totalMin !== undefined) {
          expect(normalized.total, 'Total Count (min)').to.be.at.least(validate.totalMin);
        }

        // 6) Field-level validations (supports dot paths)
        if (validate.fields) {
          cy.log('Validating fields...');
          const items = normalized.items.length ? normalized.items : [normalized.body];

          const getByPath = (obj, path) => {
            if (!path) return undefined;
            const keys = path.split('.');
            let current = obj;
            for (let i = 0; i < keys.length; i++) {
              if (current === null || current === undefined) return undefined;
              current = current[keys[i]];
            }
            return current;
          };

          items.forEach((item, index) => {
            Object.keys(validate.fields).forEach((fieldPath) => {
              const rules = validate.fields[fieldPath];
              const value = getByPath(item, fieldPath);

              if (rules.equals !== undefined) {
                expect(value, `Field: ${fieldPath} [item ${index}]`).to.eq(rules.equals);
              }
              if (rules.contains !== undefined) {
                expect(value, `Field: ${fieldPath} [item ${index}] contains`).to.include(rules.contains);
              }
              if (rules.pattern !== undefined) {
                expect(value, `Field: ${fieldPath} [item ${index}] pattern`).to.match(new RegExp(rules.pattern));
              }
              if (rules.notNull) {
                expect(value, `Field: ${fieldPath} [item ${index}] not null`).to.not.be.null;
                expect(value, `Field: ${fieldPath} [item ${index}] not undefined`).to.not.be.undefined;
              }
              if (rules.oneOf) {
                expect(value, `Field: ${fieldPath} [item ${index}] oneOf`).to.be.oneOf(rules.oneOf);
              }
            });
          });
        }

        // 7) Header validations
        if (validate.headers) {
          cy.log('Validating headers...');
          Object.keys(validate.headers).forEach((headerName) => {
            expect(response.headers[headerName.toLowerCase()]).to.eq(validate.headers[headerName]);
          });
        }

        // 8) Custom validation
        if (validate.custom && typeof validate.custom === 'function') {
          cy.log('Running custom validations...');
          // Pass normalized as 3rd param so test writers can use normalized.items/total/id
          validate.custom(response, responseTime, normalized);
        }

        cy.log(`Test ${id} completed successfully`);
      });
    });
  });
};