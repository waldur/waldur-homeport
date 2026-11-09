/** A hyperlink's trailing UUID: `…/proposal-public-calls/<uuid>/`. */
const uuidOfUrl = (url: unknown) =>
  typeof url === 'string'
    ? url.replace(/\/+$/, '').split('/').pop() || undefined
    : undefined;

const withUuid = (value) =>
  value && !value.uuid && value.url
    ? { ...value, uuid: uuidOfUrl(value.url) }
    : value;

/**
 * The call and offering filters select by UUID. A value saved before that,
 * in a URL or a saved filter, holds the hyperlink instead; take its UUID so
 * the filter still applies.
 */
export const withRequestedOfferingUuids = <T extends Record<string, any>>(
  values: T,
): T =>
  values
    ? {
        ...values,
        call: withUuid(values.call),
        offering: withUuid(values.offering),
      }
    : values;
