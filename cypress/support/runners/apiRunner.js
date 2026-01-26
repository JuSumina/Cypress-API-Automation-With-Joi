import { authHelper } from '../auth/authHelper';
import { validateJoiSchema } from '../validators/joiValidator';
import { normalizeResponse } from '../utils/responseNormalizer';

export const apiRunner = (testCases, suiteOptions = {}) => {
  testCases.forEach((testCase) => {
    const {
      id,
      description,
      method = suiteOptions.method || 'GET',
      endpoint,              // string OR function returning string
      endpointBuilder,       // function returning Cypress chain that yields string
      queryParams,
      body,
      bodyBuilder,           // function returning object (payload)
      expectedStatus,
      requireAuth = true,
      skip = false,
      only = false,
      validate = {},
    } = testCase;

    const itFunction = skip ? it.skip : only ? it.only : it;

    itFunction(`[${id}] should ${description}`, () => {
      const startTime = Date.now();

      const resolveUrl = () => {
        if (typeof endpointBuilder === 'function') return endpointBuilder();
        if (typeof endpoint === 'function') return cy.wrap(endpoint());
        return cy.wrap(endpoint);
      };

      resolveUrl().then((url) => {
        if (!url) throw new Error(`[${id}] Missing endpoint/url`);

        const requestOptions = {
          method: method.toUpperCase(),
          url,
          qs: queryParams,
          body: typeof bodyBuilder === 'function' ? bodyBuilder() : body,
          failOnStatusCode: false,
        };

        const request = requireAuth
          ? authHelper.authenticatedRequest(requestOptions)
          : cy.request(requestOptions);

        return request.then((response) => {
          const responseTime = Date.now() - startTime;
          const normalized = normalizeResponse(response, {
            listPath: validate.listPath,
            totalPath: validate.totalPath,
            idPath: validate.idPath,
          });

          // Status
          if (expectedStatus !== undefined) {
            expect(response.status, 'Status Code').to.eq(expectedStatus);
          }

          // No-body support (204 or explicit)
          const expectsNoBody = validate.noBody === true || response.status === 204;
          if (expectsNoBody) {
            if (validate.custom) validate.custom(response, responseTime, normalized);
            return;
          }

          // Schema
          if (validate.schema && Cypress.env('enableSchemaValidation') !== false) {
            if (normalized.body !== undefined && normalized.body !== null && normalized.body !== '') {
              validateJoiSchema(normalized.body, validate.schema);
            }
          }

          // Perf
          if (validate.responseTime && Cypress.env('enablePerformanceChecks') !== false) {
            if (validate.responseTime.max) {
              expect(responseTime, 'Response Time').to.be.lessThan(validate.responseTime.max);
            }
            if (validate.responseTime.min) {
              expect(responseTime, 'Response Time').to.be.greaterThan(validate.responseTime.min);
            }
          }

          // List counts
          if (validate.exactResults !== undefined) {
            expect(normalized.items.length, 'Exact Results Count').to.eq(validate.exactResults);
          }
          if (validate.minResults !== undefined) {
            expect(normalized.items.length, 'Minimum Results').to.be.at.least(validate.minResults);
          }
          if (validate.maxResults !== undefined) {
            expect(normalized.items.length, 'Maximum Results').to.be.at.most(validate.maxResults);
          }

          // Custom
          if (validate.custom) validate.custom(response, responseTime, normalized);
        });
      });
    });
  });
};