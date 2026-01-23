export const Endpoints = Object.freeze({
  // === Auth === //
  login: () => Cypress.env('loginEndpoint') || '/auth/login',


  // === Cases === //
  applications: () =>
    Cypress.env('applicationsEndpoint') || '/applications',

  createApplication: () =>
    Cypress.env('createApplicationEndpoint') || '/applications',

  getApplicationById: (id) =>
    `${Endpoints.applications()}/${id}`,

  closeApplication: (id) => {
    const template = Cypress.env('closeApplicationEndpoint'); 
    // example override: "/applications/{id}/close"
    if (template) return template.replace('{id}', id);

    return `${Endpoints.applications()}/${id}/close`;
  },

  // === Queries / search === //
  searchApplications: () =>
    Cypress.env('searchApplicationsEndpoint') || '/applications/search',
});