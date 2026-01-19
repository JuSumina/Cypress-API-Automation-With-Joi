import { authHelper } from '../../../support/auth/authHelper';
import { loginResponseSchema } from '../../../fixtures/schemas/authSchemas';
import { validateJoiSchema } from '../../../support/validators/joiValidator';

describe('Authentication API', () => {
  describe('POST /auth/login', () => {
    it('should login successfully with valid credentials', () => {
      authHelper.login().then((loginData) => {
        // Validate response schema
        validateJoiSchema(loginData, loginResponseSchema);
        
        // Validate token exists
        expect(loginData.accessToken).to.be.a('string');
        expect(loginData.accessToken).to.have.length.greaterThan(10);
        
        // Validate user data
        expect(loginData.username).to.eq(Cypress.env('API_USERNAME'));
        expect(loginData.email).to.be.a('string');
        
        cy.log('Login successful, token stored');
      });
    });

    it('should fail login with invalid credentials', () => {
      cy.request({
        method: 'POST',
        url: Cypress.env('loginEndpoint'),
        body: {
          username: 'invaliduser',
          password: 'wrongpassword'
        },
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.eq(400);
        expect(response.body.message).to.exist;
      });
    });

    it('should verify token can be used for authenticated requests', () => {
      authHelper.login().then(() => {
        // Make authenticated request
        authHelper.authenticatedRequest({
          method: 'GET',
          url: '/auth/me'
        }).then((response) => {
          expect(response.status).to.eq(200);
          expect(response.body).to.have.property('username');
        });
      });
    });
  });
});