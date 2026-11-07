import { translate } from '@/i18n';

// Sections of a call document that belong to one call run by one
// organisation; a template carries the call's settings and workflow only.
// The backend refuses a template holding any of them.
const CALL_SPECIFIC_KEYS = ['rounds', 'requested_offerings', 'documents'];

const callSpecificLabel = (key: string): string =>
  ({
    rounds: translate('rounds'),
    requested_offerings: translate('requested offerings'),
    documents: translate('documents'),
  })[key];

/**
 * A call document as a template stores it: without its rounds, requested
 * offerings and documents. Also returns the labels of the sections that
 * had content, so the user is told what was left out.
 */
export const toTemplateDocument = (
  data: Record<string, unknown>,
): { document: Record<string, unknown>; dropped: string[] } => {
  const document = { ...data };
  const dropped: string[] = [];
  for (const key of CALL_SPECIFIC_KEYS) {
    if (!(key in document)) continue;
    const value = document[key];
    if (Array.isArray(value) ? value.length > 0 : Boolean(value)) {
      dropped.push(callSpecificLabel(key));
    }
    delete document[key];
  }
  return { document, dropped };
};
