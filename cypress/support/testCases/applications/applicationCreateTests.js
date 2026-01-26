import { buildValidApplication } from '../../factories/applicationFactory';

const CREATE_ENDPOINT = () => Cypress.env('createApplicationEndpoint') || '/applications';

export const applicationCreateTests = [
  {
    id: 'APP-CREATE-001',
    description: 'create an application (happy path)',
    method: 'POST',
    endpoint: CREATE_ENDPOINT,
    requireAuth: true,
    tags: ['smoke', 'applications', 'create'],
    bodyBuilder: () => buildValidApplication(),
    validate: {
      responseTime: { max: 2500 },
      custom: (response) => {
        expect([200, 201]).to.include(response.status);

        const id =
          response.body?.applicationId ??
          response.body?.appId ??
          response.body?.id ??
          response.body?.data?.applicationId ??
          response.body?.data?.id;

        expect(id, 'create should return an id').to.exist;

        Cypress.env('lastApplicationId', id);
        cy.log(`Created application id: ${id}`);
      },
    },
  },

  {
    id: 'APP-CREATE-002',
    description: 'return 400 when required field is missing (firstName)',
    method: 'POST',
    endpoint: CREATE_ENDPOINT,
    requireAuth: true,
    tags: ['regression', 'applications', 'create', 'negative'],
    bodyBuilder: () => {
      const payload = buildValidApplication();
      delete payload.firstName;
      return payload;
    },
    validate: {
      responseTime: { max: 2500 },
      custom: (response) => {
        expect([400, 422]).to.include(response.status);

        const msg = (response.body?.message || response.body?.error || '').toString().toLowerCase();
        // keep it flexible until you know exact API error wording
        expect(msg).to.match(/first|name|required|missing|invalid/);
      },
    },
  },
];