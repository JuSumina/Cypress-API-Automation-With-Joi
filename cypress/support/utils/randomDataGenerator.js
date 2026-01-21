//Generate random string

export const randomString = (length = 10, options = {}) => {
  const { uppercase = true, lowercase = true, numbers = false, special = false } = options;
  
  let chars = '';
  if (uppercase) chars += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  if (lowercase) chars += 'abcdefghijklmnopqrstuvwxyz';
  if (numbers) chars += '0123456789';
  if (special) chars += '!@#$%^&*()_+-=[]{}|;:,.<>?';
  
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

//Generate random number within range
export const randomNumber = (min = 0, max = 100) => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

//Generate random float within range
export const randomFloat = (min = 0, max = 100, decimals = 2) => {
  const value = Math.random() * (max - min) + min;
  return parseFloat(value.toFixed(decimals));
};

//Generate random boolean
export const randomBoolean = () => {
  return Math.random() > 0.5;
};

//Pick random item from array
export const randomFromArray = (array) => {
  if (!array || array.length === 0) return null;
  return array[Math.floor(Math.random() * array.length)];
};


// === PERSONAL DATA GENERATORS === //


const firstNames = 
  ['James', 'John', 'Robert', 'Michael', 'William', 'David', 'Richard', 'Joseph', 'Thomas', 'Charles',
  'Mary', 'Patricia', 'Jennifer', 'Linda', 'Elizabeth', 'Barbara', 'Susan', 'Jessica', 'Sarah', 'Karen'];

const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez', 
                   'Wilson', 'Anderson', 'Taylor', 'Thomas', 'Moore', 'Jackson', 'White', 'Harris', 'Martin', 'Thompson'];

//Generate random first name
export const randomFirstName = (gender = null) => {
  return randomFromArray(firstNames);
};

//Generate random last name
export const randomLastName = () => {
  return randomFromArray(lastNames);
};

//Generate random full name
export const randomFullName = (gender = null) => {
  return `${randomFirstName(gender)} ${randomLastName()}`;
};

//Generate random email
export const randomEmail = (options = {}) => {
  const { domain = 'example.com', prefix = null } = options;
  
  const emailPrefix = prefix || `user${Date.now()}${randomNumber(1000, 9999)}`;
  return `${emailPrefix}@${domain}`;
};


//Generate random SSN9
export const randomSSN = () => {
  const area = randomNumber(0, 999).toString().padStart(3, '0');
  const group = randomNumber(0, 99).toString().padStart(2, '0');
  const serial = randomNumber(0, 9999).toString().padStart(4, '0');
  return `${area}${group}${serial}`;
};


// === DATE AND TIME GENERATORS === //


//Generate random date within range
export const randomDateRange = () => {
  const minDate = new Date('1940-01-01').getTime();
  const maxDate = new Date().getTime(); // Today
  
  // Generate random start date between 1940 and today
  const startTime = minDate + Math.random() * (maxDate - minDate);
  const startDate = new Date(startTime);
  
  // Generate random end date between start date and today
  const endTime = startTime + Math.random() * (maxDate - startTime);
  const endDate = new Date(endTime);
  
  return {
    startDate: startDate.toISOString().split('T')[0],
    endDate: endDate.toISOString().split('T')[0]
  };
};

/**
 * Generate random birth date (for adult users)
 */
export const randomBirthDate = (minAge = 18, maxAge = 80) => {
  const today = new Date();
  const maxDate = new Date(today.getFullYear() - minAge, today.getMonth(), today.getDate());
  const minDate = new Date(today.getFullYear() - maxAge, today.getMonth(), today.getDate());
  
  const date = randomDate(minDate.toISOString().split('T')[0], maxDate.toISOString().split('T')[0]);
  return date.toISOString().split('T')[0]; // Return as YYYY-MM-DD
};



/**
 * Generate random datetime (ISO format)
 */
export const randomDateTime = (startDate = '2020-01-01', endDate = '2024-12-31') => {
  const date = randomDate(startDate, endDate);
  return date.toISOString();
};

/**
 * Generate random timestamp (Unix)
 */
export const randomTimestamp = (startDate = '2020-01-01', endDate = '2024-12-31') => {
  const date = randomDate(startDate, endDate);
  return Math.floor(date.getTime() / 1000);
};

/**
 * Generate random date in specific year
 */
export const randomDateInYear = (year) => {
  return randomDate(`${year}-01-01`, `${year}-12-31`).toISOString().split('T')[0];
};



// ========================================
// COMPLEX DATA GENERATORS
// ========================================

/**
 * Generate random user object
 */
export const randomUser = (options = {}) => {
  const gender = options.gender || randomGender();
  
  return {
    firstName: randomFirstName(gender),
    lastName: randomLastName(),
    email: randomEmail(options.emailDomain ? { domain: options.emailDomain } : {}),
    username: randomUsername(),
    password: randomPassword(),
    birthDate: randomBirthDate(options.minAge, options.maxAge),
    age: randomAge(options.minAge || 18, options.maxAge || 80),
    gender: gender,
    phone: randomPhoneNumber(),
    address: randomAddress()
  };
};

/**
 * Generate multiple random users
 */
export const randomUsers = (count = 10, options = {}) => {
  const users = [];
  for (let i = 0; i < count; i++) {
    users.push(randomUser(options));
  }
  return users;
};

/**
 * Generate random query parameters for testing
 */
export const randomQueryParams = (type = 'user') => {
  if (type === 'user') {
    return {
      limit: randomNumber(5, 50),
      skip: randomNumber(0, 100),
      sortBy: randomFromArray(['firstName', 'lastName', 'age', 'createdAt']),
      order: randomFromArray(['asc', 'desc'])
    };
  }
  return {};
};

// ========================================
// UTILITY FUNCTIONS
// ========================================

/**
 * Generate unique value using timestamp
 */
export const uniqueValue = (prefix = '') => {
  return `${prefix}${Date.now()}${randomNumber(1000, 9999)}`;
};

/**
 * Generate random hex color
 */
export const randomColor = () => {
  return `#${Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0')}`;
};

/**
 * Generate random IP address
 */
export const randomIP = () => {
  return `${randomNumber(1, 255)}.${randomNumber(0, 255)}.${randomNumber(0, 255)}.${randomNumber(1, 255)}`;
};

/**
 * Generate random URL
 */
export const randomURL = () => {
  const domains = ['example.com', 'test.com', 'demo.com', 'sample.org'];
  return `https://www.${randomFromArray(domains)}/${randomString(8, { lowercase: true })}`;
};

/**
 * Sleep/wait for random time
 */
export const randomDelay = (minMs = 100, maxMs = 1000) => {
  return randomNumber(minMs, maxMs);
};