export const DateTimeFormats = {
  ISO_8601_DATE: /^\d{4}-\d{2}-\d{2}$/,                           // 2024-12-31
  ISO_8601_DATE_FLEXIBLE: /^\d{4}-\d{1,2}-\d{1,2}$/,             // 2024-12-31 or 2024-1-1
  ISO_8601_DATETIME: /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}$/,    // 2024-12-31T23:59:59
  ISO_8601_DATETIME_Z: /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/, // 2024-12-31T23:59:59Z
  ISO_8601_DATETIME_MS: /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/, // 2024-12-31T23:59:59.123Z
  ISO_8601_DATETIME_TZ: /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}[+-]\d{2}:\d{2}$/, // 2024-12-31T23:59:59+05:30
  US_DATE: /^\d{2}\/\d{2}\/\d{4}$/,                               // 12/31/2024
  EU_DATE: /^\d{2}\.\d{2}\.\d{4}$/,                               // 31.12.2024
  UNIX_TIMESTAMP: /^\d{10}$/,                                     // 1704067199 (seconds)
  UNIX_TIMESTAMP_MS: /^\d{13}$/,                                  // 1704067199000 (milliseconds)
};

//Validate if string matches datetime format
export const isValidDateTimeFormat = (value, format) => {
  if (!value) return false;
  return DateTimeFormats[format].test(value);
};

//Validate if string is a valid parseable date
export const isValidDate = (dateString) => {
  const date = new Date(dateString);
  return date instanceof Date && !isNaN(date.getTime());
};

//Validate datetime is in range
export const isDateInRange = (dateString, minDate, maxDate) => {
  const date = new Date(dateString);
  const min = minDate ? new Date(minDate) : null;
  const max = maxDate ? new Date(maxDate) : null;
  
  if (!isValidDate(dateString)) return false;
  if (min && date < min) return false;
  if (max && date > max) return false;
  
  return true;
};

//Validate datetime format and parseability
export const validateDateTime = (value, expectedFormat) => {
  // Check format matches pattern
  const formatValid = isValidDateTimeFormat(value, expectedFormat);
  
  // Check it's a parseable date
  const parseValid = isValidDate(value);
  
  return {
    valid: formatValid && parseValid,
    formatValid,
    parseValid,
    value
  };
};

//Convert datetime to ISO format for comparison
export const toISOString = (dateString) => {
  return new Date(dateString).toISOString();
};

//Validate array of datetime fields in response
export const validateDateTimeFields = (obj, fields, expectedFormat) => {
  const results = {};
  
  fields.forEach(field => {
    const value = obj[field];
    results[field] = validateDateTime(value, expectedFormat);
  });
  
  return results;
};

//Common Cypress assertions for datetime
export const assertValidDateTime = (value, format, fieldName = 'datetime') => {
  // Check format
  expect(value, `${fieldName} should match ${format} format`)
    .to.match(DateTimeFormats[format]);
  
  // Check parseability
  const date = new Date(value);
  expect(date.toString(), `${fieldName} should be parseable`)
    .to.not.eq('Invalid Date');
  
  return date;
};

//Validate timezone offset
export const hasValidTimezone = (dateString) => {
  // Check if it has Z (UTC) or timezone offset
  return /Z$|[+-]\d{2}:\d{2}$/.test(dateString);
};

//Parse common date formats
export const parseDateFormat = (dateString) => {
  // Detect which format is being used
  for (const [formatName, pattern] of Object.entries(DateTimeFormats)) {
    if (pattern.test(dateString)) {
      return {
        format: formatName,
        pattern: pattern.toString(),
        valid: true
      };
    }
  }
  
  return {
    format: 'UNKNOWN',
    pattern: null,
    valid: false
  };
};