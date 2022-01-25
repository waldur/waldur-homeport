import { OFFERING_TYPE_BOOKING } from '@waldur/booking/constants';
import { isEmpty } from '@waldur/core/utils';
import { Offering, Section } from '@waldur/marketplace/types';

export const shouldRenderAttributesSection = (offering: Offering): boolean =>
  !!offering.datacite_doi ||
  offering.citation_count >= 0 ||
  (!!offering.google_calendar_link && offering.type === OFFERING_TYPE_BOOKING);

export const shouldRenderAttributesList = (
  sections: Section[],
  attributes,
): boolean => !!sections.length && !isEmpty(attributes);

export const isValidAttribute = (data: any): boolean => {
  if (typeof data === 'string' && data.trim().length > 0) {
    return true;
  }
  if (typeof data === 'number' || typeof data === 'boolean') {
    return true;
  }
  if (typeof data === 'object' && !isEmpty(data)) {
    return true;
  }
  if (Array.isArray(data) && data.length > 0) {
    return true;
  }
  return false;
};
