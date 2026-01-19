import { userListSchema, singleUserSchema } from '../../schemas/userSchemas';
import { errorSchema } from '../../schemas/commonSchemas';

export const dateTimeFormatTests = [
  // ========================================
  // REQUEST FORMAT VALIDATION (Query Parameters)
  // ========================================
  
  {
    id: 'DT-001',
    description: 'accept ISO 8601 date format (YYYY-MM-DD)',
    queryParams: { 
      birthDateFrom: '1990-01-01',
      birthDateTo: '1999-12-31'
    },
    expectedStatus: 200,
    tags: ['smoke', 'datetime', 'format', 'valid'],
    requireAuth: true,
    validate: {
      schema: userListSchema,
      responseTime: { max: 2000 },
      custom: (response) => {
        expect(response.body.users).to.be.an('array');
        cy.log('API accepts ISO 8601 date format (YYYY-MM-DD)');
      }
    }
  },
  
  {
    id: 'DT-002',
    description: 'accept ISO 8601 datetime format with Z (UTC)',
    queryParams: { 
      createdFrom: '2024-01-01T00:00:00Z',
      createdTo: '2024-12-31T23:59:59Z'
    },
    expectedStatus: 200,
    tags: ['regression', 'datetime', 'format', 'valid'],
    requireAuth: true,
    validate: {
      responseTime: { max: 2000 },
      custom: (response) => {
        cy.log('API accepts ISO 8601 datetime with UTC (Z)');
      }
    }
  },
  
  {
    id: 'DT-003',
    description: 'accept ISO 8601 datetime with timezone offset',
    queryParams: { 
      createdFrom: '2024-01-01T00:00:00+05:30',
      createdTo: '2024-12-31T23:59:59+05:30'
    },
    expectedStatus: 200,
    tags: ['regression', 'datetime', 'format', 'valid'],
    requireAuth: true,
    validate: {
      responseTime: { max: 2000 },
      custom: (response) => {
        cy.log('API accepts ISO 8601 datetime with timezone offset');
      }
    }
  },
  
  {
    id: 'DT-004',
    description: 'accept Unix timestamp (seconds)',
    queryParams: { 
      createdFrom: '631152000',    // 1990-01-01 in Unix timestamp
      createdTo: '946684799'       // 1999-12-31 in Unix timestamp
    },
    expectedStatus: 200,
    tags: ['regression', 'datetime', 'format', 'valid', 'timestamp'],
    requireAuth: true,
    validate: {
      responseTime: { max: 2000 },
      custom: (response) => {
        cy.log('API accepts Unix timestamp (seconds)');
      }
    }
  },
  
  {
    id: 'DT-005',
    description: 'accept Unix timestamp with milliseconds',
    queryParams: { 
      createdFrom: '631152000000',
      createdTo: '946684799000'
    },
    expectedStatus: 200,
    tags: ['regression', 'datetime', 'format', 'valid', 'timestamp'],
    requireAuth: true,
    validate: {
      responseTime: { max: 2000 },
      custom: (response) => {
        cy.log('API accepts Unix timestamp (milliseconds)');
      }
    }
  },
  
  // ========================================
  // INVALID REQUEST FORMAT VALIDATION
  // ========================================
  
  {
    id: 'DT-101',
    description: 'reject invalid date format (MM/DD/YYYY)',
    queryParams: { 
      birthDateFrom: '01/01/1990',
      birthDateTo: '12/31/1999'
    },
    expectedStatus: 400,
    tags: ['error-handling', 'datetime', 'format', 'invalid'],
    requireAuth: true,
    validate: {
      schema: errorSchema,
      responseTime: { max: 1000 },
      custom: (response) => {
        expect(response.body.message.toLowerCase()).to.match(/invalid|date|format/);
        cy.log('API correctly rejects US date format (MM/DD/YYYY)');
      }
    }
  },
  
  {
    id: 'DT-102',
    description: 'reject invalid date format (DD.MM.YYYY)',
    queryParams: { 
      birthDateFrom: '01.01.1990',
      birthDateTo: '31.12.1999'
    },
    expectedStatus: 400,
    tags: ['error-handling', 'datetime', 'format', 'invalid'],
    requireAuth: true,
    validate: {
      schema: errorSchema,
      responseTime: { max: 1000 },
      custom: (response) => {
        expect(response.body.message.toLowerCase()).to.match(/invalid|date|format/);
        cy.log('API correctly rejects EU date format (DD.MM.YYYY)');
      }
    }
  },
  
  {
    id: 'DT-103',
    description: 'reject malformed date string',
    queryParams: { 
      birthDateFrom: 'not-a-date',
      birthDateTo: '1999-12-31'
    },
    expectedStatus: 400,
    tags: ['error-handling', 'datetime', 'format', 'invalid'],
    requireAuth: true,
    validate: {
      schema: errorSchema,
      responseTime: { max: 1000 },
      custom: (response) => {
        expect(response.body.message.toLowerCase()).to.match(/invalid|date|format/);
        cy.log('API correctly rejects malformed date string');
      }
    }
  },
  
  {
    id: 'DT-104',
    description: 'reject invalid date values (February 30)',
    queryParams: { 
      birthDateFrom: '1990-02-30',
      birthDateTo: '1990-02-30'
    },
    expectedStatus: 400,
    tags: ['error-handling', 'datetime', 'format', 'invalid'],
    requireAuth: true,
    validate: {
      schema: errorSchema,
      responseTime: { max: 1000 },
      custom: (response) => {
        expect(response.body.message.toLowerCase()).to.match(/invalid|date/);
        cy.log('API correctly rejects invalid date (Feb 30)');
      }
    }
  },
  
  {
    id: 'DT-105',
    description: 'reject date without leading zeros',
    queryParams: { 
      birthDateFrom: '1990-1-1',
      birthDateTo: '1999-12-31'
    },
    expectedStatus: 400,
    tags: ['error-handling', 'datetime', 'format', 'invalid'],
    requireAuth: true,
    validate: {
      schema: errorSchema,
      responseTime: { max: 1000 },
      custom: (response) => {
        expect(response.body.message.toLowerCase()).to.match(/invalid|format/);
        cy.log('API requires leading zeros (YYYY-MM-DD not YYYY-M-D)');
      }
    }
  },
  
  // ========================================
  // RESPONSE FORMAT VALIDATION
  // ========================================
  
  {
    id: 'DT-201',
    description: 'validate response birthDate field is ISO 8601 format',
    queryParams: { limit: 10 },
    expectedStatus: 200,
    tags: ['smoke', 'datetime', 'response-format'],
    requireAuth: true,
    validate: {
      schema: userListSchema,
      responseTime: { max: 1500 },
      custom: (response) => {
        const { assertValidDateTime, DateTimeFormats } = require('../../../support/validators/dateTimeValidator');
        
        expect(response.body.users).to.be.an('array');
        expect(response.body.users.length).to.be.greaterThan(0);
        
        // Validate each user's birthDate format
        response.body.users.forEach(user => {
          assertValidDateTime(user.birthDate, 'ISO_8601_DATE_FLEXIBLE', `${user.firstName}'s birthDate`);
          
          cy.log(`✓ ${user.firstName}: ${user.birthDate} (valid ISO format)`);
        });
      }
    }
  },
  
  {
    id: 'DT-202',
    description: 'validate response has consistent datetime format across all records',
    queryParams: { limit: 20 },
    expectedStatus: 200,
    tags: ['regression', 'datetime', 'response-format', 'consistency'],
    requireAuth: true,
    validate: {
      schema: userListSchema,
      responseTime: { max: 1500 },
      custom: (response) => {
        const { parseDateFormat } = require('../../../support/validators/dateTimeValidator');
        
        expect(response.body.users).to.be.an('array');
        
        // Get format of first record
        const firstFormat = parseDateFormat(response.body.users[0].birthDate);
        cy.log(`Detected format: ${firstFormat.format}`);
        
        // Validate all records use same format
        response.body.users.forEach((user, index) => {
          const userFormat = parseDateFormat(user.birthDate);
          
          expect(userFormat.format, `User ${index + 1} format should match`).to.eq(firstFormat.format);
        });
        
        cy.log(`All ${response.body.users.length} records use consistent format: ${firstFormat.format}`);
      }
    }
  },
  
  {
    id: 'DT-203',
    description: 'validate datetime fields have timezone information',
    queryParams: { limit: 5 },
    expectedStatus: 200,
    tags: ['regression', 'datetime', 'response-format', 'timezone'],
    requireAuth: true,
    customEndpoint: '/users/1',  // Get single user with full details
    validate: {
      schema: singleUserSchema,
      responseTime: { max: 1000 },
      custom: (response) => {
        // Check if timestamp fields have timezone info
        // Assuming user object has createdAt, updatedAt fields
        const timestampFields = ['createdAt', 'updatedAt'].filter(f => response.body[f]);
        
        if (timestampFields.length > 0) {
          timestampFields.forEach(field => {
            const value = response.body[field];
            const hasTimezone = /Z$|[+-]\d{2}:\d{2}$/.test(value);
            
            expect(hasTimezone, `${field} should include timezone (Z or offset)`).to.be.true;
            
            cy.log(` ${field}: ${value} (has timezone)`);
          });
        } else {
          cy.log(' No timestamp fields found (createdAt/updatedAt)');
        }
      }
    }
  },
  
  {
    id: 'DT-204',
    description: 'validate all datetime fields are parseable as valid dates',
    queryParams: { limit: 10 },
    expectedStatus: 200,
    tags: ['regression', 'datetime', 'response-format', 'validation'],
    requireAuth: true,
    validate: {
      schema: userListSchema,
      responseTime: { max: 1500 },
      custom: (response) => {
        const { isValidDate } = require('../../../support/validators/dateTimeValidator');
        
        response.body.users.forEach(user => {
          // Test birthDate is parseable
          const birthDate = new Date(user.birthDate);
          expect(birthDate.toString()).to.not.eq('Invalid Date');
          expect(isValidDate(user.birthDate), `${user.firstName}'s birthDate should be parseable`).to.be.true;
          
          // Validate it's a reasonable date (not year 0, not year 3000)
          const year = birthDate.getFullYear();
          expect(year, 'Birth year should be reasonable').to.be.at.least(1900);
          expect(year, 'Birth year should be reasonable').to.be.at.most(2026);
        });
        
        cy.log(`All ${response.body.users.length} birthDate fields are valid and parseable`);
      }
    }
  },
  
  // ========================================
  // EDGE CASES
  // ========================================
  
  {
    id: 'DT-301',
    description: 'handle leap year dates correctly (Feb 29)',
    queryParams: { 
      birthDateFrom: '1992-02-29',  // 1992 is a leap year
      birthDateTo: '1992-02-29'
    },
    expectedStatus: 200,
    tags: ['edge-case', 'datetime', 'leap-year'],
    requireAuth: true,
    validate: {
      responseTime: { max: 1500 },
      custom: (response) => {
        cy.log('API correctly handles leap year date (Feb 29, 1992)');
        
        if (response.body.users && response.body.users.length > 0) {
          response.body.users.forEach(user => {
            expect(user.birthDate).to.eq('1992-02-29');
            cy.log(`Found user born on leap day: ${user.firstName} ${user.lastName}`);
          });
        } else {
          cy.log(' No users born on Feb 29, 1992 (expected)');
        }
      }
    }
  },
  
  {
    id: 'DT-302',
    description: 'handle year 2000 boundary correctly',
    queryParams: { 
      birthDateFrom: '1999-12-31',
      birthDateTo: '2000-01-01'
    },
    expectedStatus: 200,
    tags: ['edge-case', 'datetime', 'y2k'],
    requireAuth: true,
    validate: {
      responseTime: { max: 1500 },
      custom: (response) => {
        cy.log('API correctly handles Y2K boundary (1999-12-31 to 2000-01-01)');
      }
    }
  },
  
  {
    id: 'DT-303',
    description: 'handle midnight boundary correctly',
    queryParams: { 
      createdFrom: '2024-01-15T23:59:59Z',
      createdTo: '2024-01-16T00:00:00Z'
    },
    expectedStatus: 200,
    tags: ['edge-case', 'datetime', 'midnight'],
    requireAuth: true,
    validate: {
      responseTime: { max: 1500 },
      custom: (response) => {
        cy.log('API correctly handles midnight boundary');
      }
    }
  }
];