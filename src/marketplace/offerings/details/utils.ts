import { AuthService } from '@waldur/auth/AuthService';
import { OFFERING_TYPE_BOOKING } from '@waldur/booking/constants';
import { isEmpty } from '@waldur/core/utils';
import { Offering, Section } from '@waldur/marketplace/types';

export const shouldRenderAttributesSection = (
  offering: Offering,
  googleCalendarLink: string,
): boolean =>
  !!offering.datacite_doi ||
  offering.citation_count >= 0 ||
  (!!googleCalendarLink &&
    AuthService.isAuthenticated() &&
    offering.type === OFFERING_TYPE_BOOKING);

export const shouldRenderAttributesList = (
  sections: Section[],
  attributes,
): boolean => !!sections.length && !isEmpty(attributes);
