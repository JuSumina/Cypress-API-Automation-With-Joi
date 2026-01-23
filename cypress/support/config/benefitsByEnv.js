export const BenefitsByEnv = Object.freeze({
  dev: Object.freeze(['BEN_A', 'BEN_B', 'BEN_C']),
  qa: Object.freeze(['BEN_A', 'BEN_D']),
  stage: Object.freeze(['BEN_B', 'BEN_E']),
});

// Return current environment name from Cypress env/config
export const getEnvName = () => {
  // Choose ONE convention and stick to it:
  // CYPRESS_ENV=qa  -> Cypress.env('ENV') === 'qa'
  const env = Cypress.env('ENV').toString().toLowerCase();
  return env;
};

export const getValidBenefitsForEnv = (envName = getEnvName()) => {
  const list = BenefitsByEnv[envName];
  if (!list) {
    throw new Error(
      `No benefits configured for env "${envName}". Add it to BenefitsByEnv.`
    );
  }
  return list;
};

export const isValidBenefitForEnv = (benefit, envName = getEnvName()) => {
  return getValidBenefitsForEnv(envName).includes(benefit);
};