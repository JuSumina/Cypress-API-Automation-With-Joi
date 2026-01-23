import { buildApplicationPayload } from '../factories/applicationFactory';
import { validateJoiSchema } from '../validators/joiValidator';
import {
  createApplicationRequestSchema,
  createApplicationResponseSchema,
  errorSchema
} from '../schemas/applicationSchemas';

const getCreateEndpoint = () => Cypress.env('createApplicationEndpoint') || '/applications';

export const examples = [
  {
    id: 'APP-CREATE-001',
    description: 'create an application (happy path)',
    queryParams: {}, // not used for POST, kept for runner compatibility
    expectedStatus: 201, // allow 200/201 via custom (some APIs return 200)
    tags: ['smoke', 'applications', 'create'],
    requireAuth: true,
    validate: {
      responseTime: { max: 2000 },

      custom: (response, responseTime, normalized) => {
        // If your API returns 200 instead of 201, this keeps it passing:
        expect([200, 201], 'Create status').to.include(response.status);

        // Validate response schema only if JSON body returned
        if (response.body && typeof response.body === 'object') {
          validateJoiSchema(response.body, createApplicationResponseSchema);
        }
      }
    },

    // runner extension fields (used by the suite wrapper, not runner itself)
    method: 'POST',
    endpoint: getCreateEndpoint(),
    bodyBuilder: () => {
      const payload = buildApplicationPayload();
      validateJoiSchema(payload, createApplicationRequestSchema);
      return payload;
    }
  },

  {
    id: 'APP-CREATE-002',
    description: 'return 400 when missing required field (firstName)',
    queryParams: {},
    expectedStatus: 400,
    tags: ['negative', 'applications', 'create'],
    requireAuth: true,
    validate: {
      schema: errorSchema,
      responseTime: { max: 1500 },
      custom: (response) => {
        const msg = (response.body?.message || '').toLowerCase();
        expect(msg).to.match(/first|name|required|missing|invalid/);
      }
    },
    method: 'POST',
    endpoint: getCreateEndpoint(),
    bodyBuilder: () => {
      const payload = buildApplicationPayload();
      delete payload.firstName;
      return payload;
    }
  },

  {
    id: 'APP-CREATE-003',
    description: 'return 400 when SSN is not 9 digits',
    queryParams: {},
    expectedStatus: 400,
    tags: ['negative', 'applications', 'create'],
    requireAuth: true,
    validate: {
      schema: errorSchema,
      responseTime: { max: 1500 },
      custom: (response) => {
        const msg = (response.body?.message || '').toLowerCase();
        expect(msg).to.match(/ssn|9|digit|invalid/);
      }
    },
    method: 'POST',
    endpoint: getCreateEndpoint(),
    bodyBuilder: () => {
      const payload = buildApplicationPayload({ ssn: '123' }); // invalid
      return payload;
    }
  }
];