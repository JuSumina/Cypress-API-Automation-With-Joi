// Normalize different API response shapes into a consistent interface.
//
// Supports common list keys: items, results, data, applications, users, records, etc.
// Supports nested patterns too: { data: { items: [...] } }.

const isObject = (v) => v !== null && typeof v === 'object' && !Array.isArray(v);

const getByPath = (obj, path) => {
  if (!path) return undefined;
  const keys = path.split('.');
  let current = obj;

  for (let i = 0; i < keys.length; i++) {
    if (current === null || current === undefined) return undefined;
    current = current[keys[i]];
  }
  return current;
};

export const extractList = (body, options = {}) => {
  const {
    listPath, // optional explicit path: "data.items"
    listKeys = [
      'items',
      'results',
      'data',
      'applications',
      'applicationList',
      'records',
      'users',
      'rows',
    ],
  } = options;

  if (!body) return [];

  // If the whole body is already an array
  if (Array.isArray(body)) return body;

  // If explicit listPath provided
  if (listPath) {
    const value = getByPath(body, listPath);
    if (Array.isArray(value)) return value;
    // If the listPath points to object containing array fields, try to find one
    if (isObject(value)) {
      for (const k of listKeys) {
        if (Array.isArray(value[k])) return value[k];
      }
    }
  }

  // Common shape: { items: [...] } etc
  for (const k of listKeys) {
    if (Array.isArray(body[k])) return body[k];
  }

  // Common nested shape: { data: { items: [...] } } or { data: [...] }
  if (isObject(body.data)) {
    for (const k of listKeys) {
      if (Array.isArray(body.data[k])) return body.data[k];
    }
  }

  // If body.data is itself an array (some APIs do { data: [...] })
  if (Array.isArray(body.data)) return body.data;

  return [];
};

export const extractCount = (body, items, options = {}) => {
  const {
    totalKeys = ['total', 'count', 'totalCount', 'recordsTotal', 'size'],
    totalPath, // optional explicit path: "meta.total"
  } = options;

  if (!body) return items?.length ?? 0;

  if (totalPath) {
    const v = getByPath(body, totalPath);
    if (typeof v === 'number') return v;
  }

  for (const k of totalKeys) {
    if (typeof body[k] === 'number') return body[k];
  }

  if (isObject(body.meta)) {
    for (const k of totalKeys) {
      if (typeof body.meta[k] === 'number') return body.meta[k];
    }
  }

  return items?.length ?? 0;
};

export const extractId = (body, options = {}) => {
  const {
    idKeys = ['applicationId', 'appId', 'id', 'uuid'],
    idPath, // optional explicit path: "data.id"
  } = options;

  if (!body || !isObject(body)) return undefined;

  if (idPath) {
    const v = getByPath(body, idPath);
    if (v !== undefined && v !== null) return v;
  }

  for (const k of idKeys) {
    const v = body[k];
    if (v !== undefined && v !== null && v !== '') return v;
  }

  if (isObject(body.data)) {
    for (const k of idKeys) {
      const v = body.data[k];
      if (v !== undefined && v !== null && v !== '') return v;
    }
  }

  return undefined;
};

export const extractMessage = (body) => {
  if (!body) return undefined;

  if (typeof body === 'string') return body;

  if (isObject(body)) {
    return body.message || body.error || body.details || body.title || undefined;
  }

  return undefined;
};

//MAIN HELPER.
//Returns a normalized shape for ANY endpoint response
 
export const normalizeResponse = (response, options = {}) => {
  const body = response?.body;

  const items = extractList(body, options);
  const total = extractCount(body, items, options);
  const id = extractId(body, options);
  const message = extractMessage(body);

  return {
    status: response?.status,
    headers: response?.headers,
    body,
    items,
    total,
    id,
    message,
  };
};