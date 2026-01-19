import { authHelper } from './auth/authHelper';

// Custom command for login
Cypress.Commands.add('login', (username, password) => {
  return authHelper.login(username, password);
});

// Custom command for authenticated request
Cypress.Commands.add('authenticatedRequest', (options) => {
  return authHelper.authenticatedRequest(options);
});

// Custom command to get users
Cypress.Commands.add('getUsers', (queryParams = {}) => {
  return authHelper.authenticatedRequest({
    method: 'GET',
    url: Cypress.env('usersEndpoint'),
    qs: queryParams
  });
});