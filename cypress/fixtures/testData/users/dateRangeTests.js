import { errorSchema } from '../../schemas/commonSchemas';

export const dateRangeTests = [
  {
  id: 'USER-501',
  description: 'get users born in the 1990s using date range query',
  queryParams: { 
    birthDateFrom: '1990-01-01',
    birthDateTo: '1999-12-31'
  },
  expectedStatus: 200,
  tags: ['smoke', 'users', 'date-range'],
  requireAuth: true,
  validate: {
    schema: userListSchema,
    responseTime: { max: 2000 },
    minResults: 1,  // Should find at least 1 user
    custom: (response) => {
      expect(response.body.users).to.be.an('array');
      expect(response.body.users.length, 'Should return users').to.be.greaterThan(0);
      
      const startDate = new Date('1990-01-01');
      const endDate = new Date('1999-12-31');
      
      // Validate ALL returned users have birthdate in range
      response.body.users.forEach(user => {
        const birthDate = new Date(user.birthDate);
        
        expect(birthDate, `${user.firstName} ${user.lastName}'s birthdate should be >= 1990-01-01`)
          .to.be.at.least(startDate);
        
        expect(birthDate, `${user.firstName} ${user.lastName}'s birthdate should be <= 1999-12-31`)
          .to.be.at.most(endDate);
        
        // Additional validation: birthdate should be a valid date
        expect(birthDate.toString()).to.not.eq('Invalid Date');
      });
      
      cy.log(`All ${response.body.users.length} users have birthdate in 1990s`);
      cy.log(`Sample: ${response.body.users[0].firstName} ${response.body.users[0].lastName} (${response.body.users[0].birthDate})`);
    }
  }
},
{
  id: 'USER-502',
  description: 'get users born in a specific year (1995) using exact date range',
  queryParams: { 
    birthDateFrom: '1995-01-01',
    birthDateTo: '1995-12-31'
  },
  expectedStatus: 200,
  tags: ['regression', 'users', 'date-range'],
  requireAuth: true,
  validate: {
    schema: userListSchema,
    responseTime: { max: 1500 },
    custom: (response) => {
      expect(response.body.users).to.be.an('array');
      
      if (response.body.users.length > 0) {
        response.body.users.forEach(user => {
          const birthYear = new Date(user.birthDate).getFullYear();
          expect(birthYear, `${user.firstName}'s birth year should be 1995`).to.eq(1995);
        });
        
        cy.log(`Found ${response.body.users.length} users born in 1995`);
      } else {
        cy.log('No users found born in 1995');
      }
    }
  }
},
{
  id: 'USER-503',
  description: 'get users born in Q2 1992 (April-June)',
  queryParams: { 
    birthDateFrom: '1992-04-01',
    birthDateTo: '1992-06-30'
  },
  expectedStatus: 200,
  tags: ['regression', 'users', 'date-range'],
  requireAuth: true,
  validate: {
    schema: userListSchema,
    responseTime: { max: 1500 },
    custom: (response) => {
      expect(response.body.users).to.be.an('array');
      
      const startDate = new Date('1992-04-01');
      const endDate = new Date('1992-06-30');
      
      response.body.users.forEach(user => {
        const birthDate = new Date(user.birthDate);
        
        expect(birthDate).to.be.at.least(startDate);
        expect(birthDate).to.be.at.most(endDate);
        
        // Validate it's actually Q2 (months 4, 5, 6)
        const month = birthDate.getMonth() + 1;
        expect(month, 'Month should be April, May, or June').to.be.at.least(4);
        expect(month, 'Month should be April, May, or June').to.be.at.most(6);
      });
      
      cy.log(`Found ${response.body.users.length} users born in Q2 1992`);
    }
  }
},
{
  id: 'USER-504',
  description: 'validate date range query returns empty array when no matches',
  queryParams: { 
    birthDateFrom: '1800-01-01',
    birthDateTo: '1850-12-31'
  },
  expectedStatus: 200,
  tags: ['error-handling', 'users', 'date-range'],
  requireAuth: true,
  validate: {
    schema: userListSchema,
    responseTime: { max: 1500 },
    custom: (response) => {
      // Should return empty array, not error
      expect(response.body.users).to.be.an('array');
      expect(response.body.users).to.have.length(0);
      expect(response.body.total).to.eq(0);
      
      cy.log('Correctly returns empty array for date range with no matches');
    }
  }
},
{
  id: 'USER-505',
  description: 'validate date range with single day (birthday on specific date)',
  queryParams: { 
    birthDateFrom: '1996-05-30',
    birthDateTo: '1996-05-30'
  },
  expectedStatus: 200,
  tags: ['regression', 'users', 'date-range'],
  requireAuth: true,
  validate: {
    schema: userListSchema,
    responseTime: { max: 1500 },
    custom: (response) => {
      expect(response.body.users).to.be.an('array');
      
      response.body.users.forEach(user => {
        expect(user.birthDate, 'Birthdate should match exactly').to.eq('1996-05-30');
      });
      
      if (response.body.users.length > 0) {
        cy.log(`Found ${response.body.users.length} user(s) born on 1996-05-30`);
        response.body.users.forEach(u => {
          cy.log(`  - ${u.firstName} ${u.lastName}`);
        });
      } else {
        cy.log('No users found born on this specific date');
      }
    }
  }
},
{
  id: 'USER-506',
  description: 'validate date range with pagination (1990s, limit 10)',
  queryParams: { 
    birthDateFrom: '1990-01-01',
    birthDateTo: '1999-12-31',
    limit: 10,
    skip: 0
  },
  expectedStatus: 200,
  tags: ['regression', 'users', 'date-range', 'pagination'],
  requireAuth: true,
  validate: {
    schema: userListSchema,
    responseTime: { max: 1500 },
    exactResults: 10,
    custom: (response) => {
      // Validate pagination
      expect(response.body.limit).to.eq(10);
      expect(response.body.skip).to.eq(0);
      expect(response.body.users).to.have.length(10);
      
      // Validate date range
      const startDate = new Date('1990-01-01');
      const endDate = new Date('1999-12-31');
      
      response.body.users.forEach(user => {
        const birthDate = new Date(user.birthDate);
        expect(birthDate).to.be.at.least(startDate);
        expect(birthDate).to.be.at.most(endDate);
      });
      
      cy.log(`Pagination + Date range: Page 1 of ${Math.ceil(response.body.total / 10)}`);
      cy.log(`Total users born in 1990s: ${response.body.total}`);
    }
  }
},
{
  id: 'USER-507',
  description: 'return 400 for invalid date format',
  queryParams: { 
    birthDateFrom: 'invalid-date',
    birthDateTo: '1999-12-31'
  },
  expectedStatus: 400,
  tags: ['error-handling', 'users', 'date-range'],
  requireAuth: true,
  validate: {
    schema: errorSchema,
    responseTime: { max: 1000 },
    custom: (response) => {
      expect(response.body).to.have.property('message');
      expect(response.body.message.toLowerCase()).to.match(/invalid|date|format/);
      
      cy.log('API correctly rejects invalid date format');
    }
  }
},
{
  id: 'USER-508',
  description: 'return 400 when birthDateFrom is after birthDateTo',
  queryParams: { 
    birthDateFrom: '1999-12-31',
    birthDateTo: '1990-01-01'
  },
  expectedStatus: 400,
  tags: ['error-handling', 'users', 'date-range'],
  requireAuth: true,
  validate: {
    schema: errorSchema,
    responseTime: { max: 1000 },
    custom: (response) => {
      expect(response.body).to.have.property('message');
      expect(response.body.message.toLowerCase()).to.match(/invalid|range|from|to/);
      
      cy.log('API correctly rejects invalid date range (from > to)');
    }
  }
},
{
  id: 'USER-509',
  description: 'get users born across multiple decades (1985-2005)',
  queryParams: { 
    birthDateFrom: '1985-01-01',
    birthDateTo: '2005-12-31'
  },
  expectedStatus: 200,
  tags: ['regression', 'users', 'date-range'],
  requireAuth: true,
  validate: {
    schema: userListSchema,
    responseTime: { max: 2000 },
    minResults: 10,  // Should have many users across 20 years
    custom: (response) => {
      expect(response.body.users).to.be.an('array');
      
      const startDate = new Date('1985-01-01');
      const endDate = new Date('2005-12-31');
      
      // Validate all are in range
      response.body.users.forEach(user => {
        const birthDate = new Date(user.birthDate);
        expect(birthDate).to.be.at.least(startDate);
        expect(birthDate).to.be.at.most(endDate);
      });
      
      // Calculate decade distribution
      const decades = {};
      response.body.users.forEach(user => {
        const year = new Date(user.birthDate).getFullYear();
        const decade = Math.floor(year / 10) * 10;
        decades[decade] = (decades[decade] || 0) + 1;
      });
      
      cy.log('Decade distribution:');
      Object.keys(decades).sort().forEach(decade => {
        cy.log(`  ${decade}s: ${decades[decade]} users`);
      });
      
      cy.log(`Found ${response.body.total} users born between 1985-2005`);
    }
  }
},
{
  id: 'USER-510',
  description: 'validate date range works with select parameter',
  queryParams: { 
    birthDateFrom: '1990-01-01',
    birthDateTo: '1999-12-31',
    select: 'firstName,lastName,birthDate,age',
    limit: 5
  },
  expectedStatus: 200,
  tags: ['regression', 'users', 'date-range', 'select'],
  requireAuth: true,
  validate: {
    responseTime: { max: 1500 },
    exactResults: 5,
    custom: (response) => {
      expect(response.body.users).to.be.an('array');
      expect(response.body.users).to.have.length(5);
      
      // Validate date range
      const startDate = new Date('1990-01-01');
      const endDate = new Date('1999-12-31');
      
      response.body.users.forEach(user => {
        const birthDate = new Date(user.birthDate);
        expect(birthDate).to.be.at.least(startDate);
        expect(birthDate).to.be.at.most(endDate);
        
        // Validate select worked (only specific fields returned)
        expect(user).to.have.property('id');
        expect(user).to.have.property('firstName');
        expect(user).to.have.property('lastName');
        expect(user).to.have.property('birthDate');
        expect(user).to.have.property('age');
        
        // Should NOT have other fields
        expect(user).to.not.have.property('email');
        expect(user).to.not.have.property('phone');
      });
      
      cy.log('Date range + select parameters work together');
    }
  }
}  
];