class AuthHelper {
  constructor() {
    this.tokenKey = 'authToken';
    this.userKey = 'currentUser';
  }


  login(username = Cypress.env('API_USERNAME'), password = Cypress.env('API_PASSWORD')) {
    cy.log('Attempting login...');
    cy.log(`Username: ${username}`);
    cy.log(`Password: ${password ? 'PROVIDED' : 'MISSING'}`);
    
    return cy.request({
      method: 'POST',
      url: Cypress.env('loginEndpoint'),
      headers: {
        'Content-Type': 'application/json'
     },
      body: {
        username: username,
        password: password,
        expiresInMins: 30 // DummyJSON specific
      },
      failOnStatusCode: false
    }).then((response) => {
        
        cy.log(`Response Status: ${response.status}`);
        cy.log('Response Body:', JSON.stringify(response.body));

        if (response.status === 200) {
        cy.log('Login successful');
        
        // Token should be in response.body.token or response.body.accessToken
        const token = response.body.token || response.body.accessToken;
        
        if (token) {
            cy.log(`Token received: ${token.substring(0, 20)}...`);
            this.setToken(token);
            this.setUser(response.body);
            return cy.wrap(response.body);
        } else {
            cy.log('No token in response body');
            cy.log('Response keys:', Object.keys(response.body));
            throw new Error('No token found in login response');
        }
        } else {
        cy.log('Login failed');
        cy.log(`Error Response: ${JSON.stringify(response.body)}`);
        throw new Error(`Login failed with status ${response.status}: ${JSON.stringify(response.body)}`);
        }
    });
  }


  setToken(token) {
    cy.wrap(token).as(this.tokenKey);
    Cypress.env(this.tokenKey, token);
  }


  getToken() {
    return Cypress.env(this.tokenKey);
  }


  setUser(user) {
    cy.wrap(user).as(this.userKey);
    Cypress.env(this.userKey, user);
  }


  getUser() {
    return Cypress.env(this.userKey);
  }


  authenticatedRequest(options) {
    const token = this.getToken();
    
    if (!token) {
      throw new Error('No auth token found. Please login first.');
    }

    return cy.request({
      ...options,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        ...options.headers
      },
      failOnStatusCode: false
    });
  }


  logout() {
    Cypress.env(this.tokenKey, null);
    Cypress.env(this.userKey, null);
    cy.log('Logged out');
  }


  isAuthenticated() {
    return !!this.getToken();
  }
}

export const authHelper = new AuthHelper();