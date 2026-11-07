import { FORM_ERROR } from 'final-form';

import { getErrorBody } from '@/core/ErrorMessageFormatter';

const asText = (value: unknown): string =>
  Array.isArray(value)
    ? value.map(asText).join(' ')
    : typeof value === 'object' && value
      ? Object.values(value).map(asText).join(' ')
      : String(value);

/**
 * A refused request's errors by form field, for react-final-form: those of
 * ``fields`` on their field, the rest as the form's own error.
 */
export const fieldErrors = (
  error: unknown,
  fields: string[],
): Record<string, string> => {
  const body = getErrorBody(error) ?? {};
  const result: Record<string, string> = {};
  const general: string[] = [];
  for (const [key, value] of Object.entries(body)) {
    if (fields.includes(key)) result[key] = asText(value);
    else general.push(asText(value));
  }
  if (general.length) result[FORM_ERROR] = general.join(' ');
  return result;
};
