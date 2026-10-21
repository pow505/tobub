const SUPPORTED_TYPES = new Set(['object', 'array', 'string', 'number', 'integer', 'boolean', 'null']);
const SCALAR = (value) => value === null || ['string', 'number', 'boolean'].includes(typeof value);

export function normalizeHarnessSchema(schema) {
  if (!isRecord(schema)) throw new Error('A Tobub tool input schema must be an object.');
  const normalized = {};
  if (typeof schema.type === 'string' && SUPPORTED_TYPES.has(schema.type)) {
    normalized.type = schema.type;
  } else if (Array.isArray(schema.type) && schema.type.length >= 1
    && schema.type.every((type) => typeof type === 'string' && SUPPORTED_TYPES.has(type))) {
    if (schema.type.length === 1) normalized.type = schema.type[0];
    else if (!Array.isArray(schema.oneOf)) normalized.oneOf = schema.type.map((type) => ({ type }));
  }
  const description = typeof schema.description === 'string' ? schema.description : '';
  const constraints = describeConstraints(schema);
  if (description || constraints.length) {
    normalized.description = [description, ...(constraints.length
      ? ['Constraints: ' + constraints.join('; ') + '. The Tobub MCP bridge validates the original Runtime schema.']
      : [])].filter(Boolean).join('\n');
  }
  if (typeof schema.title === 'string') normalized.title = schema.title;
  if (Object.hasOwn(schema, 'default')) normalized.default = schema.default;
  if (Object.hasOwn(schema, 'examples')) normalized.examples = schema.examples;
  if (isRecord(schema.properties)) {
    normalized.properties = Object.fromEntries(
      Object.entries(schema.properties).map(([key, value]) => [key, normalizeHarnessSchema(value)]),
    );
  }
  if (Array.isArray(schema.required)) normalized.required = schema.required.filter((key) => typeof key === 'string');
  if (typeof schema.additionalProperties === 'boolean') {
    normalized.additionalProperties = schema.additionalProperties;
  } else if (isRecord(schema.additionalProperties)) {
    normalized.additionalProperties = true;
  }
  if (isRecord(schema.items)) normalized.items = normalizeHarnessSchema(schema.items);
  if (Array.isArray(schema.enum) && schema.enum.every(SCALAR)) normalized.enum = schema.enum;
  if (SCALAR(schema.const)) normalized.const = schema.const;
  if (Array.isArray(schema.oneOf) && schema.oneOf.length >= 2) {
    normalized.oneOf = schema.oneOf.map((item) => normalizeHarnessSchema(item));
  }
  return normalized;
}

export function assertHarnessSchema(schema, label = 'schema') {
  if (!isRecord(schema)) throw new Error(label + ' must be an object.');
  const allowed = new Set([
    'type', 'oneOf', 'properties', 'required', 'additionalProperties',
    'items', 'enum', 'const', 'description', 'title', 'default', 'examples',
  ]);
  for (const key of Object.keys(schema)) {
    if (!allowed.has(key)) throw new Error(label + ' contains unsupported key ' + key + '.');
  }
  if (schema.type !== undefined && !SUPPORTED_TYPES.has(schema.type)) {
    throw new Error(label + ' contains an unsupported JSON Schema type.');
  }
  if (schema.oneOf !== undefined) {
    if (!Array.isArray(schema.oneOf) || schema.oneOf.length < 2) throw new Error(label + '.oneOf must have at least two schemas.');
    schema.oneOf.forEach((item, index) => assertHarnessSchema(item, label + '.oneOf[' + index + ']'));
  }
  if (schema.properties !== undefined) {
    if (!isRecord(schema.properties)) throw new Error(label + '.properties must be an object.');
    for (const [key, value] of Object.entries(schema.properties)) {
      assertHarnessSchema(value, label + '.properties.' + key);
    }
  }
  if (schema.required !== undefined) {
    if (!Array.isArray(schema.required) || schema.required.some((key) => typeof key !== 'string')) {
      throw new Error(label + '.required must be a string array.');
    }
    if (isRecord(schema.properties) && schema.required.some((key) => !Object.hasOwn(schema.properties, key))) {
      throw new Error(label + '.required references a missing property.');
    }
  }
  if (schema.additionalProperties !== undefined && typeof schema.additionalProperties !== 'boolean') {
    throw new Error(label + '.additionalProperties must be boolean.');
  }
  if (schema.items !== undefined) assertHarnessSchema(schema.items, label + '.items');
  for (const key of ['default', 'examples']) {
    if (Object.hasOwn(schema, key) && !isJsonValue(schema[key])) {
      throw new Error(label + '.' + key + ' must be a JSON value.');
    }
  }
}

function describeConstraints(schema) {
  const hints = [];
  if (typeof schema.pattern === 'string') hints.push('pattern ' + JSON.stringify(schema.pattern));
  if (typeof schema.format === 'string') hints.push('format ' + schema.format);
  for (const key of [
    'minLength', 'maxLength', 'minimum', 'maximum', 'exclusiveMinimum', 'exclusiveMaximum',
    'multipleOf', 'minItems', 'maxItems', 'minProperties', 'maxProperties',
  ]) {
    if (Number.isFinite(schema[key])) hints.push(key + ' ' + schema[key]);
  }
  if (schema.uniqueItems === true) hints.push('uniqueItems true');
  return hints;
}

function isJsonValue(value) {
  if (value === null || typeof value === 'string' || typeof value === 'boolean') return true;
  if (typeof value === 'number') return Number.isFinite(value);
  if (Array.isArray(value)) return value.every(isJsonValue);
  if (isRecord(value)) return Object.values(value).every(isJsonValue);
  return false;
}

function isRecord(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}
