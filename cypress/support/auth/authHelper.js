class AuthHelper {
  constructor() {
    this.tokenAlias = 'authToken';
    this.userAlias = 'currentUser';
  }


  login(username = Cypress.env('API_USERNAME'), password = Cypress.env('API_PASSWORD')) {
    cy.log('Attempting login...');
    if (!username || !password) {
      throw new Error ('Missing username / password. Check Cypress.env settings.');
    }
    
    return cy.request({
      method: 'POST',
      url: Cypress.env('loginEndpoint'),
      headers: {'Content-Type': 'application/json'},
      body: {
        username: username,
        password: password,
        //expiresInMins: 30
      },
      failOnStatusCode: false
    }).then((response) => {
        cy.log(`Login status: ${response.status}`);

        if (response.status !== 200) {
          const msg = response.body?.message || response.body?.error || 'Login failed';
          throw new Error(`Login failed (${response.status}): ${msg}`);
        }

        
        const token = response.body?.accessToken || response.body?.token;
        if (!token) {
          throw new Error('Login succeeded but no access token was found in response.');
        }

        
        cy.wrap(token, { log: false }).as(this.tokenAlias);
        cy.wrap(response.body, { log: false }).as(this.userAlias);

        return response.body;
    });
  }


  setToken(token) {
    cy.wrap(token).as(this.tokenKey);
    Cypress.env(this.tokenKey, token);
  }


  getToken() {
    return cy.get(`@${this.tokenAlias}`, { log: false });
  }


  setUser(user) {
    cy.wrap(user).as(this.userKey);
    Cypress.env(this.userKey, user);
  }


  getUser() {
    return cy.get(`@${this.userAlias}`, { log: false });
  }


  authenticatedRequest(options) {
    // Make it chainable + safe
    return this.getToken().then((token) => {
      if (!token) throw new Error('No auth token found. Did you call cy.login() in this test/spec?');

      return cy.request({
        ...options,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          ...(options.headers || {}),
        },
        failOnStatusCode: false,
      });
    });
  }
}


export const authHelper = new AuthHelper();