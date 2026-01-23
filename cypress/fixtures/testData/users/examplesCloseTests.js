import { buildApplicationPayload } from '../factories/applicationFactory';
import { validateJoiSchema } from '../validators/joiValidator';
import {
  createApplicationRequestSchema,
  errorSchema
} from '../schemas/applicationSchemas';

// env-configurable endpoints
const CREATE = () => Cypress.env('createApplicationEndpoint') || '/applications';
const CLOSE_TEMPLATE = () => Cypress.env('closeApplicationEndpoint'); // "/applications/{id}/close"
const BASE = () => Cypress.env('applicationsEndpoint') || '/applications';

const closeUrl = (id) => {
  if (CLOSE_TEMPLATE()) return CLOSE_TEMPLATE().replace('{id}', id);
  return `${BASE()}/${id}/close`;
};

export const applicationCloseTests = [
  {
    id: 'APP-CLOSE-001',
    description: 'close an application (status-only, supports 204)',
    queryParams: {},
    expectedStatus: 204, // allow 200/204 via custom
    tags: ['smoke', 'applications', 'close'],
    requireAuth: true,
    validate: {
      noBody: true,
      responseTime: { max: 2000 },
      custom: (response) => {
        expect([200, 204], 'Close status').to.include(response.status);
      }
    },

    // wrapper fields (used by suite)
    method: 'POST',
    endpointBuilder: async () => {
      // Create app first to get an id.
      // In Cypress, we can’t truly await like normal JS inside this object,
      // so the suite wrapper will handle this. See note below.
      return null;
    }
  },

  {
    id: 'APP-CLOSE-002',
    description: 'return 404 when closing a non-existent application',
    queryParams: {},
    expectedStatus: 404,
    tags: ['negative', 'applications', 'close'],
    requireAuth: true,
    validate: {
      schema: errorSchema,
      responseTime: { max: 1500 },
      custom: (response) => {
        const msg = (response.body?.message || '').toLowerCase();
        expect(msg).to.match(/not found|missing|does not exist/);
      }
    },
    method: 'POST',
    endpoint: closeUrl('999999999')
  }
];