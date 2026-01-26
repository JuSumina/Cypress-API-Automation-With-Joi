const SEARCH_ENDPOINT = () => Cypress.env('searchApplicationsEndpoint') || '/applications/search';

// allow easy renaming without rewriting testcases
const DOB_FROM_PARAM = Cypress.env('dobFromParam') || 'dobFrom';
const DOB_TO_PARAM = Cypress.env('dobToParam') || 'dobTo';
const DOB_FIELD = Cypress.env('dobField') || 'dateOfBirth';

const assertDobInRange = (items, fromYMD, toYMD) => {
  const from = new Date(fromYMD);
  const to = new Date(toYMD);

  items.forEach((item, idx) => {
    const value = item?.[DOB_FIELD];
    expect(value, `item[${idx}].${DOB_FIELD} should exist`).to.exist;

    const d = new Date(value);
    expect(d.toString(), `item[${idx}].${DOB_FIELD} should be a valid date`).to.not.eq('Invalid Date');
    expect(d, `item[${idx}] DOB >= ${fromYMD}`).to.be.at.least(from);
    expect(d, `item[${idx}] DOB <= ${toYMD}`).to.be.at.most(to);
  });
};

export const applicationDobRangeTests = [
  {
    id: 'APP-DOB-001',
    description: 'query by DOB range returns only records within range',
    method: 'GET',
    endpoint: SEARCH_ENDPOINT,
    requireAuth: true,
    tags: ['smoke', 'applications', 'dob-range'],
    queryParams: {
      [DOB_FROM_PARAM]: '1990-01-01',
      [DOB_TO_PARAM]: '1999-12-31',
      limit: 25,
    },
    expectedStatus: 200,
    validate: {
      responseTime: { max: 2500 },
      minResults: 0, // allow empty in some envs
      custom: (response, rt, normalized) => {
        expect(normalized.items, 'normalized.items should be an array').to.be.an('array');
        assertDobInRange(normalized.items, '1990-01-01', '1999-12-31');
      },
    },
  },

  {
    id: 'APP-DOB-002',
    description: 'return 400 for invalid DOB format',
    method: 'GET',
    endpoint: SEARCH_ENDPOINT,
    requireAuth: true,
    tags: ['regression', 'applications', 'dob-range', 'negative'],
    queryParams: {
      [DOB_FROM_PARAM]: '01/01/1990', // invalid if API expects YYYY-MM-DD
      [DOB_TO_PARAM]: '1999-12-31',
    },
    expectedStatus: 400,
    validate: {
      responseTime: { max: 2500 },
      custom: (response) => {
        const msg = (response.body?.message || response.body?.error || '').toString().toLowerCase();
        expect(msg).to.match(/date|dob|format|invalid/);
      },
    },
  },
];