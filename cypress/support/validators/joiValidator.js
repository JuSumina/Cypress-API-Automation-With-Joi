export const validateJoiSchema = (data, schema, options = {}) => {
  const validationOptions = {
    abortEarly: false,  // Return all errors
    allowUnknown: options.allowUnknown !== undefined ? options.allowUnknown : true,
    stripUnknown: false,
    ...options
  };

  const { error, value } = schema.validate(data, validationOptions);
  
  if (error) {
    const errors = error.details.map(detail => ({
      field: detail.path.join('.') || 'root',
      message: detail.message,
      type: detail.type,
      value: detail.context.value
    }));
    
    cy.log('Joi Validation Failed');
    cy.log(JSON.stringify(errors, null, 2));
    
    throw new Error(`Schema validation failed:\n${JSON.stringify(errors, null, 2)}`);
  }
  
  cy.log('Schema validation passed');
  return value;
};