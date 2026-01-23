import { authHelper } from './auth/authHelper';
import { Endpoints } from './config/endpoints';

import { buildApplicationPayload } from './factories/applicationFactory';
import { validateJoiSchema } from './validators/joiValidator';
import {
  createApplicationRequestSchema,
  createApplicationResponseSchema,
} from './schemas/applicationSchemas';
import { setAppContext, getAppContext, clearAppContext } from './context/applicationContext';
import { Endpoints } from './config/endpoints';
import { createRng, randomDateRangeYMD, tomorrowYMD } from './utils/dateUtils';


// == Auth Commands === //
 
// Custom command for login
Cypress.Commands.add('login', (username, password) => {
  return authHelper.login(username, password);
});

// Custom command for authenticated request (direct passthrough)
Cypress.Commands.add('authenticatedRequest', (options) => {
  return authHelper.authenticatedRequest(options);
});



// === Base API Request Command === //
Cypress.Commands.add('apiRequest', (options = {}) => {
  const { auth = true, ...rest } = options;

  if (auth) {
    // authHelper adds Authorization + Content-Type and sets failOnStatusCode:false
    return authHelper.authenticatedRequest(rest);
  }

  return cy.request({
    ...rest,
    headers: {
      'Content-Type': 'application/json',
      ...(rest.headers || {}),
    },
    failOnStatusCode: false,
  });
});


// === Case Commands === //

// Helper: extract case id from various possible response shapes
const extractApplicationId = (body) => {
  if (!body || typeof body !== 'object') return undefined;
  return body.applicationId ?? body.appId ?? body.id;
};


// === Create Case === //

Cypress.Commands.add('createApplication', (overrides = {}, opts = {}) => {
  const payload = buildApplicationPayload(overrides, opts);

  // Validate what we're sending (catches factory mistakes early)
  validateJoiSchema(payload, createApplicationRequestSchema);

  return cy.apiRequest({
    method: 'POST',
    url: Endpoints.createApplication(),
    auth: true,
    body: payload,
  }).then((res) => {
    // Common: 201 Created OR 200 OK
    expect([200, 201], 'Create status').to.include(res.status);

    // Validate response schema only if body is JSON
    if (res.body && typeof res.body === 'object') {
      validateJoiSchema(res.body, createApplicationResponseSchema);
    }

    const applicationId = extractApplicationId(res.body);

    // Store for later workflow tests
    if (applicationId !== undefined && applicationId !== null && applicationId !== '') {
      Cypress.env('lastApplicationId', applicationId);
      cy.wrap(applicationId).as('applicationId');
    }

    Cypress.env('lastApplicationPayload', payload);
    cy.wrap(payload).as('applicationPayload');

    return cy.wrap({ response: res, payload, applicationId });
  });
});

// === Get case by id === //
Cypress.Commands.add('getApplicationById', (applicationId) => {
  const id = applicationId ?? Cypress.env('lastApplicationId');
  if (id === undefined || id === null || id === '') {
    throw new Error('getApplicationById: missing applicationId (pass one or createApplication first)');
  }

  return cy.apiRequest({
    method: 'GET',
    url: Endpoints.getApplicationById(id),
    auth: true,
  });
});

// === Close application === //
Cypress.Commands.add('closeApplication', (applicationId, closeBody = null) => {
  const id = applicationId ?? Cypress.env('lastApplicationId');
  if (id === undefined || id === null || id === '') {
    throw new Error('closeApplication: missing applicationId (pass one or createApplication first)');
  }

  const method = (Cypress.env('closeApplicationMethod') || 'POST').toUpperCase();

  return cy.apiRequest({
    method,
    url: Endpoints.closeApplication(id),
    auth: true,
    body: closeBody || undefined,
  }).then((res) => {
    expect([200, 204], 'Close status').to.include(res.status);
    return cy.wrap(res);
  });
});


// === Application workflow === //
Cypress.Commands.add('appCreate', (overrides = {}, options = {}) => {
  return cy.createApplication(overrides, options).then(({ response, payload, applicationId }) => {
    setAppContext({
      applicationId,
      payload,
      createResponse: response
    });

    return cy.wrap(getAppContext());
  });
});

Cypress.Commands.add('appGet', (applicationId) => {
  const id = applicationId ?? getAppContext().applicationId;
  if (!id) throw new Error('appGet: missing applicationId (create first or pass id)');

  return cy.getApplicationById(id).then((res) => {
    setAppContext({ getResponse: res });
    return cy.wrap(res);
  });
});

Cypress.Commands.add('appClose', (applicationId, closeBody = null) => {
  const id = applicationId ?? getAppContext().applicationId;
  if (!id) throw new Error('appClose: missing applicationId (create first or pass id)');

  return cy.closeApplication(id, closeBody).then((res) => {
    setAppContext({ closeResponse: res });
    return cy.wrap(res);
  });
});



// === Date range helpers === //
Cypress.Commands.add('appRandomRange', (opts = {}) => {
  const rng = createRng(opts.seed);

  const range = randomDateRangeYMD(rng, {
    min: opts.min ?? '1900-01-01',
    max: opts.max,              // defaults to today in dateUtils
    minDays: opts.minDays ?? 0,
    maxDays: opts.maxDays ?? 30
  });

  return cy.wrap(range);
});

Cypress.Commands.add('appTomorrow', () => {
  return cy.wrap(tomorrowYMD());
});


// === Query helpers === //
Cypress.Commands.add('appQueryByDateRange', (params = {}) => {
  return cy.apiRequest({
    method: 'GET',
    url: Endpoints.searchApplications(),
    auth: true,
    qs: params
  });
});


// === Context control === //
Cypress.Commands.add('appClearContext', () => {
  clearAppContext();
  return cy.wrap(null);
});