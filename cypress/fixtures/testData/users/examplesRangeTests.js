import { errorSchema } from '../schemas/applicationSchemas';
import { assertAllInRangeYMD } from '../assertions/dateRangeAssertions';

// Let env control the API’s parameter and field naming
const DOB_FROM = Cypress.env('dobFromParam') || 'dobFrom';
const DOB_TO = Cypress.env('dobToParam') || 'dobTo';
const DOB_FIELD = Cypress.env('dobField') || 'dateOfBirth';

const getQueryEndpoint = () => Cypress.env('searchApplicationsEndpoint') || '/applications/search';

export const applicationDobRangeTests = [
  {
    id: 'APP-DOB-001',
    description: 'query by DOB range returns only records within range',
    queryParams: {
      [DOB_FROM]: '1990-01-01',
      [DOB_TO]: '1999-12-31',
      limit: 25
    },
    expectedStatus: 200,
    tags: ['smoke', 'applications', 'dob', 'date-range'],
    requireAuth: true,
    validate: {
      responseTime: { max: 2000 },
      custom: (response, responseTime, normalized) => {
        // Validate all returned results are in range
        assertAllInRangeYMD(normalized.items, DOB_FIELD, '1990-01-01', '1999-12-31');
      }
    },
    endpoint: getQueryEndpoint(),
    method: 'GET'
  },

  {
    id: 'APP-DOB-002',
    description: 'query by DOB range returns empty list when no matches',
    queryParams: {
      [DOB_FROM]: '1800-01-01',
      [DOB_TO]: '1800-12-31'
    },
    expectedStatus: 200,
    tags: ['regression', 'applications', 'dob', 'date-range'],
    requireAuth: true,
    validate: {
      responseTime: { max: 2000 },
      exactResults: 0
    },
    endpoint: getQueryEndpoint(),
    method: 'GET'
  },

  {
    id: 'APP-DOB-003',
    description: 'return 400 for invalid DOB format',
    queryParams: {
      [DOB_FROM]: '01/01/1990',
      [DOB_TO]: '1999-12-31'
    },
    expectedStatus: 400,
    tags: ['negative', 'applications', 'dob'],
    requireAuth: true,
    validate: {
      schema: errorSchema,
      responseTime: { max: 1500 },
      custom: (response) => {
        const msg = (response.body?.message || '').toLowerCase();
        expect(msg).to.match(/date|dob|format|invalid/);
      }
    },
    endpoint: getQueryEndpoint(),
    method: 'GET'
  },

  {
    id: 'APP-DOB-004',
    description: 'return 400 when DOB_FROM is after DOB_TO',
    queryParams: {
      [DOB_FROM]: '1999-12-31',
      [DOB_TO]: '1990-01-01'
    },
    expectedStatus: 400,
    tags: ['negative', 'applications', 'dob', 'date-range'],
    requireAuth: true,
    validate: {
      schema: errorSchema,
      responseTime: { max: 1500 },
      custom: (response) => {
        const msg = (response.body?.message || '').toLowerCase();
        expect(msg).to.match(/range|from|to|invalid/);
      }
    },
    endpoint: getQueryEndpoint(),
    method: 'GET'
  }
];