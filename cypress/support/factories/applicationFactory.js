import { createRng, randInt, randomDobYMD } from '../utils/dateUtils';
import { getEnvName, getValidBenefitsForEnv } from '../config/benefitsByEnv';

// === Helpers === //
const pickOne = (rng, arr) => arr[randInt(rng, 0, arr.length - 1)];

export const randomDigits = (rng, length) => {
  let s = '';
  for (let i = 0; i < length; i++) s += String(randInt(rng, 0, 9));
  return s;
};

export const randomNineDigitId = (rng) => randomDigits(rng, 9);
export const randomSsn9 = (rng) => randomDigits(rng, 9);

// Name lists
const FIRST_NAMES = Object.freeze(['James', 'John', 'Robert', 'Michael', 'Mary', 'Patricia', 'Jennifer', 'Linda']);
const LAST_NAMES = Object.freeze(['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis']);

export const randomFirstName = (rng) => pickOne(rng, FIRST_NAMES);
export const randomLastName = (rng) => pickOne(rng, LAST_NAMES);


// === Main factory === //

export const buildApplicationPayload = (overrides = {}, opts = {}) => {
  const rng = createRng(opts.seed);

  const envName = (opts.envName || getEnvName()).toLowerCase();
  const benefits = getValidBenefitsForEnv(envName);

  const payload = {
    firstName: randomFirstName(rng),
    lastName: randomLastName(rng),

    // Date of Birth (YYYY-MM-DD)
    dateOfBirth: randomDobYMD(rng, { minAge: opts.minAge ?? 18, maxAge: opts.maxAge ?? 80 }),

    // 9 digits
    ssn: randomSsn9(rng),

    // 9 digits
    applicantId: randomNineDigitId(rng),

    // env-safe benefit
    benefit: pickOne(rng, benefits),
  };

  return { ...payload, ...overrides };
};