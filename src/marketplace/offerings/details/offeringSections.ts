import { NestedSection } from 'waldur-js-client';

import { isValidAttribute } from './utils';

/** Tab key of a section shown on a tab of its own, as `section-<key>`. */
export const SECTION_TAB_PREFIX = 'section-';

/**
 * The category's sections, each cut down to the attributes this offering has
 * a value for; a section left with none is dropped, so the page never shows
 * an empty heading.
 */
export const getFilledSections = (
  sections: NestedSection[] | undefined,
  attributes: Record<string, unknown> | undefined,
): NestedSection[] =>
  (sections ?? [])
    .map((section) => ({
      ...section,
      attributes: section.attributes.filter(
        (attr) =>
          attributes &&
          Object.prototype.hasOwnProperty.call(attributes, attr.key) &&
          isValidAttribute(attributes[attr.key]),
      ),
    }))
    .filter((section) => section.attributes.length > 0);

/**
 * Sections marked "Show as a separate tab" get a page tab of their own; the
 * rest are listed together with the description.
 */
export const splitSections = (sections: NestedSection[]) => ({
  grouped: sections.filter((section) => !section.is_standalone),
  standalone: sections.filter((section) => section.is_standalone),
});

/** DOI and referral count, shown with the attributes. */
export const hasOfferingReferenceData = (offering: {
  datacite_doi?: string;
  citation_count?: number;
}) => Boolean(offering.datacite_doi) || offering.citation_count >= 0;
