const KEY = 'appContext';

export const setAppContext = (ctx = {}) => {
  const current = Cypress.env(KEY) || {};
  Cypress.env(KEY, { ...current, ...ctx });
};

export const getAppContext = () => {
  return Cypress.env(KEY) || {};
};

export const clearAppContext = () => {
  Cypress.env(KEY, {});
};

// Convenience getters
export const getAppId = () => getAppContext().applicationId;
export const getAppPayload = () => getAppContext().payload;
export const getAppCreateResponse = () => getAppContext().createResponse;
export const getAppCloseResponse = () => getAppContext().closeResponse;