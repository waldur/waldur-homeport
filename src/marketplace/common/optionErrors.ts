/**
 * Option types whose value can be required to be unique across the
 * offering's resources; mirrors `UNIQUE_OPTION_FIELD_TYPES` in mastermind.
 */
const UNIQUE_OPTION_FIELD_TYPES = [
  'string',
  'text',
  'integer',
  'select_string',
];

export const isUniqueOptionFieldType = (type?: string) =>
  UNIQUE_OPTION_FIELD_TYPES.includes(type);

/**
 * Split a 400 response body into errors for option fields and the rest.
 *
 * Mastermind reports an invalid or already used option value under the
 * option's own key (`{"bucket": [...]}`), but the form keeps option values
 * under `attributes.<key>`. Moving those errors there shows them next to the
 * field instead of only in the toast.
 */
export const splitOptionErrors = (
  body: Record<string, any> | undefined,
  optionKeys: Iterable<string>,
) => {
  const keys = new Set(optionKeys);
  const attributes: Record<string, any> = {};
  const rest: Record<string, any> = {};
  if (body && typeof body === 'object') {
    for (const [key, value] of Object.entries(body)) {
      if (keys.has(key)) {
        attributes[key] = value;
      } else {
        rest[key] = value;
      }
    }
  }
  return { attributes, rest };
};
