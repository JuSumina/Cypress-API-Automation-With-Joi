// ===  Core UTC helpers (avoid timezone drift) === //

export const todayUTC = () => {
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
};

export const addDaysUTC = (date, days) => {
  const d = new Date(date.getTime());
  d.setUTCDate(d.getUTCDate() + days);
  return d;
};

export const formatDateYMD = (date) => {
  const y = date.getUTCFullYear();
  const m = String(date.getUTCMonth() + 1).padStart(2, '0');
  const d = String(date.getUTCDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

export const parseDateYMD = (ymd) => {
  // Expects YYYY-MM-DD
  const [y, m, d] = String(ymd).split('-').map(Number);
  if (!y || !m || !d) return new Date('Invalid');
  return new Date(Date.UTC(y, m - 1, d));
};

export const todayYMD = () => formatDateYMD(todayUTC());
export const tomorrowYMD = () => formatDateYMD(addDaysUTC(todayUTC(), 1));
export const yesterdayYMD = () => formatDateYMD(addDaysUTC(todayUTC(), -1));


// === RNG helpers (deterministic when seeded) === //

export const createRng = (seed = Date.now()) => {
  // LCG: deterministic pseudo-random generator
  let state = Number(seed) % 2147483647;
  if (state <= 0) state += 2147483646;

  return () => (state = (state * 16807) % 2147483647) / 2147483647;
};

export const randInt = (rng, min, max) => {
  return Math.floor(rng() * (max - min + 1)) + min;
};


// === Random date functions === //

export const randomDateYMD = (rng, { from, to }) => {
  const fromDate = parseDateYMD(from);
  const toDate = parseDateYMD(to);

  const fromMs = fromDate.getTime();
  const toMs = toDate.getTime();

  if (Number.isNaN(fromMs) || Number.isNaN(toMs)) {
    throw new Error(`randomDateYMD: invalid from/to date. from="${from}" to="${to}"`);
  }
  if (fromMs > toMs) {
    throw new Error(`randomDateYMD: from > to (${from} > ${to})`);
  }

  const ms = randInt(rng, fromMs, toMs);
  return formatDateYMD(new Date(ms));
};

export const randomDateRangeYMD = (
  rng,
  {
    min = '1900-01-01',
    max = todayYMD(),
    minDays = 0,
    maxDays = 365,
  } = {}
) => {
  const startDate = randomDateYMD(rng, { from: min, to: max });
  const start = parseDateYMD(startDate);

  const minEnd = addDaysUTC(start, minDays);
  const maxEnd = addDaysUTC(start, maxDays);

  const globalMax = parseDateYMD(max);
  const endUpper = maxEnd.getTime() > globalMax.getTime() ? globalMax : maxEnd;

  const endDate = randomDateYMD(rng, { from: formatDateYMD(minEnd), to: formatDateYMD(endUpper) });

  return { startDate, endDate };
};

// DOB generator with age constraints
export const randomDobYMD = (rng, { minAge = 18, maxAge = 80 } = {}) => {
  const today = todayUTC();

  const latest = new Date(Date.UTC(today.getUTCFullYear() - minAge, today.getUTCMonth(), today.getUTCDate()));
  const earliest = new Date(Date.UTC(today.getUTCFullYear() - maxAge, today.getUTCMonth(), today.getUTCDate()));

  return randomDateYMD(rng, { from: formatDateYMD(earliest), to: formatDateYMD(latest) });
};