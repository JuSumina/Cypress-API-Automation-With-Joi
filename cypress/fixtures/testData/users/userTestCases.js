import { usersArraySchema, singleUserSchema, userListSchema } from '../../schemas/userSchemas';
import { errorSchema } from '../../schemas/commonSchemas';

export const userTestCases = [
  {
    id: 'USER-001',
    description: 'get all users with default pagination',
    queryParams: {},
    expectedStatus: 200,
    tags: ['smoke', 'users', 'pagination'],
    requireAuth: true,
    validate: {
      schema: usersArraySchema,
      responseTime: { max: 2000 },
      minResults: 1,
      custom: (response) => {
        expect(response.body).to.have.property('users');
        expect(response.body).to.have.property('total');
        expect(response.body.users).to.be.an('array');
      }
    }
  },

  {
    id: 'USER-002',
    description: 'get users with limit parameter',
    queryParams: { limit: 5 },
    expectedStatus: 200,
    tags: ['smoke', 'users', 'pagination'],
    requireAuth: true,
    validate: {
      schema: userListSchema,
      responseTime: { max: 1500 },
      exactResults: 5,
      custom: (response) => {
        expect(response.body.limit).to.eq(5);
        expect(response.body.users).to.have.length(5);
      }
    }
  },

  {
    id: 'USER-003',
    description: 'get users with skip and limit',
    queryParams: { limit: 10, skip: 5 },
    expectedStatus: 200,
    tags: ['smoke', 'users', 'pagination'],
    requireAuth: true,
    validate: {
      schema: userListSchema,
      responseTime: { max: 1500 },
      exactResults: 10,
      custom: (response) => {
        expect(response.body.skip).to.eq(5);
        expect(response.body.limit).to.eq(10);
      }
    }
  },

  {
    id: 'USER-004',
    description: 'get single user by ID',
    queryParams: {},
    expectedStatus: 200,
    tags: ['smoke', 'users', 'single-user'],
    requireAuth: true,
    customEndpoint: '/users/1', // Override endpoint for this test
    validate: {
      schema: singleUserSchema,
      responseTime: { max: 1000 },
      fields: {
        id: { equals: 1 },
        firstName: { notNull: true },
        email: { pattern: '^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$' }
      }
    }
  },

  {
    id: 'USER-005',
    description: 'search users by name',
    queryParams: { q: 'John' },
    expectedStatus: 200,
    tags: ['smoke', 'users', 'search'],
    requireAuth: true,
    customEndpoint: '/users/search',
    validate: {
      schema: userListSchema,
      responseTime: { max: 1500 },
      minResults: 1,
      custom: (response) => {
        // Verify search results contain "John"
        response.body.users.forEach(user => {
          const fullName = `${user.firstName} ${user.lastName}`.toLowerCase();
          expect(fullName).to.include('john');
        });
      }
    }
  },

  {
    id: 'USER-006',
    description: 'filter users by key-value',
    queryParams: { key: 'firstName', value: 'Terry' },
    expectedStatus: 200,
    tags: ['smoke', 'users', 'filter'],
    requireAuth: true,
    customEndpoint: '/users/filter',
    validate: {
      schema: userListSchema,
      responseTime: { max: 1500 },
      custom: (response) => {
        response.body.users.forEach(user => {
          expect(user.firstName).to.eq('Terry');
        });
      }
    }
  },

  {
    id: 'USER-007',
    description: 'return 404 for non-existent user',
    queryParams: {},
    expectedStatus: 404,
    tags: ['smoke', 'error-handling', 'users'],
    requireAuth: true,
    customEndpoint: '/users/99999',
    validate: {
      schema: errorSchema,
      responseTime: { max: 1000 },
      custom: (response) => {
        expect(response.body.message).to.include('not found');
      }
    }
  },

  {
    id: 'USER-008',
    description: 'validate all users have required fields',
    queryParams: { limit: 10 },
    expectedStatus: 200,
    tags: ['smoke', 'users', 'validation'],
    requireAuth: true,
    validate: {
      schema: userListSchema,
      responseTime: { max: 1500 },
      custom: (response) => {
        const requiredFields = ['id', 'firstName', 'lastName', 'email', 'phone', 'username'];
        response.body.users.forEach(user => {
          requiredFields.forEach(field => {
            expect(user).to.have.property(field);
            expect(user[field]).to.not.be.null;
          });
        });
      }
    }
  },

  {
    id: 'USER-101',
    description: 'get user by valid ID',
    queryParams: {},
    expectedStatus: 200,
    tags: ['smoke', 'users', 'get-by-id'],
    requireAuth: true,
    customEndpoint: '/users/1',  // Specific endpoint for user ID 1
    validate: {
      schema: singleUserSchema,  // Validate full user object
      responseTime: { max: 1000 },
      fields: {
        id: { equals: 1 },  // Verify it's user 1
        firstName: { notNull: true },
        email: { pattern: '^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$' },
        username: { notNull: true }
      },
      custom: (response) => {
        // Additional business logic validations
        expect(response.body).to.have.property('id');
        expect(response.body).to.have.property('email');
        expect(response.body).to.have.property('address');
        expect(response.body.address).to.have.property('city');
        
        // Validate nested objects exist
        expect(response.body.hair).to.be.an('object');
        expect(response.body.bank).to.be.an('object');
        expect(response.body.company).to.be.an('object');
      }
    }
  },

  {
    id: 'USER-102',
    description: 'return 404 for non-existent user ID',
    queryParams: {},
    expectedStatus: 404,
    tags: ['smoke', 'error-handling', 'users', 'get-by-id'],
    requireAuth: true,
    customEndpoint: '/users/99999',  // Non-existent user ID
    validate: {
      schema: errorSchema,
      responseTime: { max: 1000 },
      custom: (response) => {
        expect(response.body.message).to.include('not found');
      }
    }
  },

  {
    id: 'USER-103',
    description: 'validate all user fields are present and correct types',
    queryParams: {},
    expectedStatus: 200,
    tags: ['smoke', 'users', 'get-by-id', 'validation'],
    requireAuth: true,
    customEndpoint: '/users/5',  // Test with different user
    validate: {
      schema: singleUserSchema,
      responseTime: { max: 1000 },
      custom: (response) => {
        const user = response.body;
        
        // Validate required fields exist
        const requiredFields = [
          'id', 'firstName', 'lastName', 'email', 'phone', 
          'username', 'birthDate', 'age', 'gender'
        ];
        
        requiredFields.forEach(field => {
          expect(user).to.have.property(field);
          expect(user[field]).to.not.be.null;
        });
        
        // Validate nested objects
        expect(user.address).to.be.an('object');
        expect(user.address.city).to.be.a('string');
        expect(user.address.coordinates).to.have.property('lat');
        expect(user.address.coordinates).to.have.property('lng');
        
        expect(user.hair).to.be.an('object');
        expect(user.hair).to.have.property('color');
        expect(user.hair).to.have.property('type');
        
        expect(user.bank).to.be.an('object');
        expect(user.bank.cardNumber).to.be.a('string');
        
        // Validate data types
        expect(user.id).to.be.a('number');
        expect(user.age).to.be.a('number');
        expect(user.height).to.be.a('number');
        expect(user.weight).to.be.a('number');
        expect(user.email).to.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
      }
    }
  },

  {
  id: 'USER-201',
  description: 'filter users by hair color (nested field)',
  queryParams: { 
    key: 'hair.color', 
    value: 'Brown' 
  },
  expectedStatus: 200,
  tags: ['smoke', 'users', 'filter'],
  requireAuth: true,
  customEndpoint: '/users/filter',
  validate: {
    schema: userListSchema,  // Same structure as users list
    responseTime: { max: 1500 },
    minResults: 1,  // Should return at least 1 user
    custom: (response) => {
      // Verify all returned users have brown hair
      expect(response.body.users).to.be.an('array');
      expect(response.body.users.length).to.be.greaterThan(0);
      
      response.body.users.forEach(user => {
        expect(user.hair, 'User should have hair object').to.be.an('object');
        expect(user.hair.color, 'Hair color should be Brown').to.eq('Brown');
      });
      
      // Verify pagination data
      expect(response.body.total).to.eq(response.body.users.length);
      expect(response.body.skip).to.eq(0);
    }
  }
},

{
  id: 'USER-202',
  description: 'filter users by gender (simple field)',
  queryParams: { 
    key: 'gender', 
    value: 'female' 
  },
  expectedStatus: 200,
  tags: ['regression', 'users', 'filter'],
  requireAuth: true,
  customEndpoint: '/users/filter',
  validate: {
    schema: userListSchema,
    responseTime: { max: 1500 },
    minResults: 1,
    custom: (response) => {
      // Verify all returned users are female
      expect(response.body.users).to.be.an('array');
      
      response.body.users.forEach(user => {
        expect(user.gender, 'User gender should be female').to.eq('female');
      });
      
      cy.log(`Found ${response.body.total} female users`);
    }
  }
},

{
  id: 'USER-203',
  description: 'filter users by first name',
  queryParams: { 
    key: 'firstName', 
    value: 'Terry' 
  },
  expectedStatus: 200,
  tags: ['smoke', 'users', 'filter'],
  requireAuth: true,
  customEndpoint: '/users/filter',
  validate: {
    schema: userListSchema,
    responseTime: { max: 1500 },
    minResults: 1,
    custom: (response) => {
      // Verify all returned users have firstName = Terry
      expect(response.body.users).to.be.an('array');
      
      response.body.users.forEach(user => {
        expect(user.firstName, 'First name should be Terry').to.eq('Terry');
      });
      
      cy.log(`Found ${response.body.total} users named Terry`);
    }
  }
},

{
  id: 'USER-204',
  description: 'filter users by age',
  queryParams: { 
    key: 'age', 
    value: '28' 
  },
  expectedStatus: 200,
  tags: ['regression', 'users', 'filter'],
  requireAuth: true,
  customEndpoint: '/users/filter',
  validate: {
    schema: userListSchema,
    responseTime: { max: 1500 },
    custom: (response) => {
      // Verify all returned users are age 28
      expect(response.body.users).to.be.an('array');
      
      if (response.body.users.length > 0) {
        response.body.users.forEach(user => {
          expect(user.age, 'User age should be 28').to.eq(28);
        });
      } else {
        cy.log('No users found with age 28');
      }
    }
  }
},

{
  id: 'USER-205',
  description: 'filter users by company department (nested field)',
  queryParams: { 
    key: 'company.department', 
    value: 'Engineering' 
  },
  expectedStatus: 200,
  tags: ['regression', 'users', 'filter'],
  requireAuth: true,
  customEndpoint: '/users/filter',
  validate: {
    schema: userListSchema,
    responseTime: { max: 1500 },
    minResults: 1,
    custom: (response) => {
      // Verify all returned users work in Engineering
      expect(response.body.users).to.be.an('array');
      
      response.body.users.forEach(user => {
        expect(user.company, 'User should have company object').to.be.an('object');
        expect(user.company.department, 'Department should be Engineering').to.eq('Engineering');
      });
    }
  }
},

{
  id: 'USER-206',
  description: 'return empty array for non-matching filter',
  queryParams: { 
    key: 'firstName', 
    value: 'NonExistentName123' 
  },
  expectedStatus: 200,
  tags: ['error-handling', 'users', 'filter'],
  requireAuth: true,
  customEndpoint: '/users/filter',
  validate: {
    schema: userListSchema,
    responseTime: { max: 1500 },
    custom: (response) => {
      // Should return empty array, not error
      expect(response.body.users).to.be.an('array');
      expect(response.body.users).to.have.length(0);
      expect(response.body.total).to.eq(0);
      
      cy.log('Correctly returns empty array for non-matching filter');
    }
  }
},

{
  id: 'USER-207',
  description: 'validate filter response structure',
  queryParams: { 
    key: 'gender', 
    value: 'male' 
  },
  expectedStatus: 200,
  tags: ['smoke', 'users', 'filter', 'validation'],
  requireAuth: true,
  customEndpoint: '/users/filter',
  validate: {
    schema: userListSchema,
    responseTime: { max: 1500 },
    custom: (response) => {
      // Validate response structure
      expect(response.body).to.have.property('users');
      expect(response.body).to.have.property('total');
      expect(response.body).to.have.property('skip');
      expect(response.body).to.have.property('limit');
      
      // Validate types
      expect(response.body.users).to.be.an('array');
      expect(response.body.total).to.be.a('number');
      expect(response.body.skip).to.be.a('number');
      expect(response.body.limit).to.be.a('number');
      
      // Validate consistency
      expect(response.body.total).to.be.at.least(response.body.users.length);
      
      // Returned users should not exceed limit
      expect(response.body.users.length).to.be.at.most(response.body.limit);
      
      // Log pagination info
      cy.log(`Total matching: ${response.body.total}`);
      cy.log(`Returned: ${response.body.users.length}`);
      cy.log(`Skip: ${response.body.skip}, Limit: ${response.body.limit}`);
      
      cy.log('Response structure is valid');
    }
  }
},

{
  id: 'USER-301',
  description: 'get users with limit parameter',
  queryParams: { 
    limit: 5 
  },
  expectedStatus: 200,
  tags: ['smoke', 'users', 'pagination'],
  requireAuth: true,
  validate: {
    schema: userListSchema,
    responseTime: { max: 1500 },
    exactResults: 5,  // Should return exactly 5 users
    custom: (response) => {
      expect(response.body.users).to.be.an('array');
      expect(response.body.users).to.have.length(5);
      expect(response.body.limit).to.eq(5);
      expect(response.body.skip).to.eq(0);  // Default skip is 0
      expect(response.body.total).to.be.greaterThan(5);  // Total users > 5
      
      cy.log(`Returned ${response.body.users.length} users with limit=5`);
    }
  }
},

{
  id: 'USER-302',
  description: 'get users with skip parameter',
  queryParams: { 
    skip: 10 
  },
  expectedStatus: 200,
  tags: ['smoke', 'regression', 'users', 'pagination'],
  requireAuth: true,
  validate: {
    schema: userListSchema,
    responseTime: { max: 1500 },
    custom: (response) => {
      expect(response.body.skip).to.eq(10);
      expect(response.body.users).to.be.an('array');
      
      // First user ID should be > 10 (since we skipped 10)
      if (response.body.users.length > 0) {
        expect(response.body.users[0].id).to.be.greaterThan(10);
      }
      
      cy.log(`Skipped 10 users, first ID: ${response.body.users[0].id}`);
    }
  }
},

{
  id: 'USER-303',
  description: 'get users with limit and skip (pagination)',
  queryParams: { 
    limit: 5, 
    skip: 10 
  },
  expectedStatus: 200,
  tags: ['smoke', 'users', 'pagination'],
  requireAuth: true,
  validate: {
    schema: userListSchema,
    responseTime: { max: 1500 },
    exactResults: 5,
    custom: (response) => {
      expect(response.body.users).to.have.length(5);
      expect(response.body.limit).to.eq(5);
      expect(response.body.skip).to.eq(10);
      
      // First user should be ID 11 (skipped 1-10)
      expect(response.body.users[0].id).to.eq(11);
      
      cy.log(`Page 3: Skipped 10, returned 5 users starting from ID ${response.body.users[0].id}`);
    }
  }
},

{
  id: 'USER-304',
  description: 'get users with select parameter (specific fields)',
  queryParams: { 
    limit: 5,
    select: 'firstName,age' 
  },
  expectedStatus: 200,
  tags: ['smoke','regression', 'users', 'pagination', 'select'],
  requireAuth: true,
  validate: {
    responseTime: { max: 1500 },
    exactResults: 5,
    custom: (response) => {
      expect(response.body.users).to.be.an('array');
      expect(response.body.users).to.have.length(5);
      
      // Each user should only have selected fields (+ id)
      response.body.users.forEach(user => {
        expect(user).to.have.property('id');  // ID is always included
        expect(user).to.have.property('firstName');
        expect(user).to.have.property('age');
        
        // Should NOT have other fields
        expect(user).to.not.have.property('email');
        expect(user).to.not.have.property('phone');
        expect(user).to.not.have.property('address');
        
        // Validate types of selected fields
        expect(user.firstName).to.be.a('string');
        expect(user.age).to.be.a('number');
      });
      
      cy.log(`Select worked: Only firstName and age returned`);
    }
  }
},

{
  id: 'USER-305',
  description: 'get users with limit, skip, and select combined',
  queryParams: { 
    limit: 5,
    skip: 10,
    select: 'firstName,age' 
  },
  expectedStatus: 200,
  tags: ['smoke','regression', 'users', 'pagination', 'select'],
  requireAuth: true,
  validate: {
    responseTime: { max: 1500 },
    exactResults: 5,
    custom: (response) => {
      // Validate pagination
      expect(response.body.limit).to.eq(5);
      expect(response.body.skip).to.eq(10);
      expect(response.body.users[0].id).to.eq(11);
      
      // Validate select worked
      response.body.users.forEach(user => {
        expect(user).to.have.property('id');
        expect(user).to.have.property('firstName');
        expect(user).to.have.property('age');
        expect(user).to.not.have.property('email');
      });
      
      cy.log(`Combined: Limit=${response.body.limit}, Skip=${response.body.skip}, Select=firstName,age`);
    }
  }
},

{
  id: 'USER-306',
  description: 'handle large limit value',
  queryParams: { 
    limit: 100 
  },
  expectedStatus: 200,
  tags: ['smoke','edge-case', 'users', 'pagination'],
  requireAuth: true,
  validate: {
    schema: userListSchema,
    responseTime: { max: 2000 },
    custom: (response) => {
      // Validate the limit we requested is reflected in response
      expect(response.body.limit).to.eq(100);
      expect(response.body.users).to.be.an('array');
      
      // Validate returned count makes sense
      expect(response.body.users.length).to.be.at.most(100);
      expect(response.body.users.length).to.be.greaterThan(0);
      
      // ADDED: Validate pagination logic
      const returned = response.body.users.length;
      const total = response.body.total;
      
      // If total < 100, we should get all users
      // If total >= 100, we should get exactly 100 (first page)
      if (total < 100) {
        expect(returned).to.eq(total);
        cy.log(`Total users (${total}) < 100, returned all ${returned}`);
      } else {
        expect(returned).to.eq(100);
        cy.log(`Large limit: Returned ${returned} users (page 1 of ${Math.ceil(total/100)})`);
      }
    }
  }
},

{
  id: 'USER-307',
  description: 'handle skip beyond total users',
  queryParams: { 
    skip: 999999 
  },
  expectedStatus: 200,
  tags: ['smoke','edge-case', 'users', 'pagination'],
  requireAuth: true,
  validate: {
    schema: userListSchema,
    responseTime: { max: 1500 },
    custom: (response) => {
      // Should return empty array when skip exceeds total
      expect(response.body.users).to.be.an('array');
      expect(response.body.users).to.have.length(0);
      expect(response.body.skip).to.eq(999999);
      
      cy.log(`Skip beyond total: Correctly returns empty array`);
    }
  }
},

{
  id: 'USER-308',
  description: 'get first page of users',
  queryParams: { 
    limit: 10,
    skip: 0 
  },
  expectedStatus: 200,
  tags: ['smoke','smoke', 'users', 'pagination'],
  requireAuth: true,
  validate: {
    schema: userListSchema,
    responseTime: { max: 1500 },
    exactResults: 10,
    custom: (response) => {
      expect(response.body.skip).to.eq(0);
      expect(response.body.limit).to.eq(10);
      
      // First page should start with ID 1
      expect(response.body.users[0].id).to.eq(1);
      
      cy.log(`First page: IDs ${response.body.users[0].id}-${response.body.users[9].id}`);
    }
  }
},

{
  id: 'USER-309',
  description: 'get last page of users',
  queryParams: { 
    limit: 10,
    skip: 200  // Assuming ~208 total users
  },
  expectedStatus: 200,
  tags: ['smoke','regression', 'users', 'pagination'],
  requireAuth: true,
  validate: {
    schema: userListSchema,
    responseTime: { max: 1500 },
    custom: (response) => {
      expect(response.body.skip).to.eq(200);
      expect(response.body.users).to.be.an('array');
      
      // Last page might have fewer than limit
      expect(response.body.users.length).to.be.at.most(10);
      expect(response.body.users.length).to.be.greaterThan(0);
      
      cy.log(`Last page: ${response.body.users.length} users returned`);
    }
  }
},

{
  id: 'USER-310',
  description: 'validate pagination metadata consistency',
  queryParams: { 
    limit: 20,
    skip: 40 
  },
  expectedStatus: 200,
  tags: ['smoke','regression', 'users', 'pagination', 'validation'],
  requireAuth: true,
  validate: {
    schema: userListSchema,
    responseTime: { max: 1500 },
    custom: (response) => {
      // Validate metadata exists and is correct type
      expect(response.body.total).to.be.a('number');
      expect(response.body.skip).to.be.a('number');
      expect(response.body.limit).to.be.a('number');
      
      // Validate metadata matches request
      expect(response.body.skip).to.eq(40);
      expect(response.body.limit).to.eq(20);
      
      // Validate pagination logic
      expect(response.body.users.length).to.be.at.most(response.body.limit);
      expect(response.body.total).to.be.at.least(response.body.skip);
      
      // If we have users, validate IDs are sequential
      if (response.body.users.length > 1) {
        for (let i = 1; i < response.body.users.length; i++) {
          expect(response.body.users[i].id).to.eq(response.body.users[i-1].id + 1);
        }
      }
      
      cy.log(`Pagination metadata is consistent`);
    }
  }
},

{
  id: 'USER-311',
  description: 'test API maximum limit enforcement',
  queryParams: { 
    limit: 1000  // Request way more than should be allowed
  },
  expectedStatus: 200,
  tags: ['smoke', 'edge-case', 'users', 'pagination'],
  requireAuth: true,
  validate: {
    schema: userListSchema,
    responseTime: { max: 2000 },
    custom: (response) => {
      // API might cap the limit (e.g., max 100)
      const actualLimit = response.body.limit;
      const returned = response.body.users.length;
      
      cy.log(`Requested limit: 1000`);
      cy.log(`API returned limit: ${actualLimit}`);
      cy.log(`Actual users returned: ${returned}`);
      
      // Document what the max limit is
      expect(actualLimit).to.be.a('number');
      expect(returned).to.be.at.most(actualLimit);
      
      if (actualLimit < 1000) {
        cy.log(`API has max limit of ${actualLimit} (requested 1000 but got ${actualLimit})`);
      }
    }
  }
}
];