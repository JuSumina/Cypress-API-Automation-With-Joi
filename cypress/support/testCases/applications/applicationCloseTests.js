import { buildValidApplication } from '../../factories/applicationFactory';

const CREATE_ENDPOINT = () => Cypress.env('createApplicationEndpoint') || '/applications';
const CLOSE_TEMPLATE = () => Cypress.env('closeApplicationEndpoint') || '/applications/{id}/close';

const closeUrl = (id) => CLOSE_TEMPLATE().replace('{id}', id);

export const applicationCloseTests = [
  {
    id: 'APP-CLOSE-001',
    description: 'close an application (POST) (create first, then close)',
    method: 'POST',
    requireAuth: true,
    tags: ['smoke', 'applications', 'close'],

    // Create first to obtain a real id, then return the close URL
    endpointBuilder: () => {
      return cy.request({
        method: 'POST',
        url: CREATE_ENDPOINT(),
        body: buildValidApplication(),
        failOnStatusCode: false,
        headers: { 'Content-Type': 'application/json' },
      }).then((createRes) => {
        expect([200, 201]).to.include(createRes.status);

        const id =
          createRes.body?.applicationId ??
          createRes.body?.appId ??
          createRes.body?.id ??
          createRes.body?.data?.applicationId ??
          createRes.body?.data?.id;

        expect(id, 'create should return an id before close').to.exist;

        Cypress.env('lastApplicationId', id);
        return cy.wrap(closeUrl(id));
      });
    },

    // If your close endpoint expects no body, remove bodyBuilder
    bodyBuilder: () => ({ reason: 'automation_test' }),

    validate: {
      noBody: true, // supports 204/no-body responses
      responseTime: { max: 2500 },
      custom: (response) => {
        // many APIs return 204 No Content for close, some return 200 with body
        expect([200, 204]).to.include(response.status);
      },
    },
  },

  {
    id: 'APP-CLOSE-002',
    description: 'return 404 when closing a non-existent application (POST)',
    method: 'POST',
    endpoint: () => closeUrl('999999999'),
    requireAuth: true,
    tags: ['regression', 'applications', 'close', 'negative'],
    bodyBuilder: () => ({ reason: 'non_existent' }),
    expectedStatus: 404,
    validate: {
      responseTime: { max: 2500 },
      custom: (response) => {
        const msg = (response.body?.message || response.body?.error || '').toString().toLowerCase();
        expect(msg).to.match(/not found|missing|does not exist/);
      },
    },
  },
];